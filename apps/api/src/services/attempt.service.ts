import { AttemptStatus, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { scoreAttempt } from "../utils/scoring";

function getElapsedSeconds(startedAt: Date, now = new Date()) {
  return Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));
}

export function isAttemptExpired(startedAt: Date, durationSeconds: number) {
  return getElapsedSeconds(startedAt) >= durationSeconds;
}

type FinalizeOptions = {
  autoSubmit?: boolean;
};

export async function finalizeAttempt(
  attemptId: string,
  userId?: string,
  options: FinalizeOptions = {},
) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            include: { choices: true },
            orderBy: { order: "asc" },
          },
        },
      },
      attemptAnswers: true,
    },
  });

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  if (userId && attempt.userId !== userId) {
    throw new ApiError(403, "You cannot submit this attempt");
  }

  if (
    attempt.status === AttemptStatus.SUBMITTED ||
    attempt.status === AttemptStatus.AUTO_SUBMITTED
  ) {
    throw new ApiError(409, "Attempt already submitted");
  }

  const { questionScores, totalScore, maxScore, percentage } = scoreAttempt(
    attempt.quiz.questions,
    attempt.attemptAnswers,
  );

  const submittedAt = new Date();
  const timeSpentSeconds = getElapsedSeconds(attempt.startedAt, submittedAt);
  const finalStatus = options.autoSubmit ? AttemptStatus.AUTO_SUBMITTED : AttemptStatus.SUBMITTED;

  return prisma.$transaction(async (tx) => {
    for (const answer of attempt.attemptAnswers) {
      const score = questionScores.find((item) => item.questionId === answer.questionId);
      if (!score) continue;

      await tx.attemptAnswer.update({
        where: { id: answer.id },
        data: {
          isCorrect: score.isCorrect,
          awardedScore: score.awardedScore,
        },
      });
    }

    const updatedAttempt = await tx.attempt.update({
      where: { id: attempt.id },
      data: {
        status: finalStatus,
        submittedAt,
        totalScore,
        maxScore,
        percentage,
        timeSpentSeconds,
      },
      include: {
        quiz: true,
      },
    });

    const existingEntry = await tx.leaderboardEntry.findUnique({
      where: {
        quizId_userId: {
          quizId: attempt.quizId,
          userId: attempt.userId,
        },
      },
    });

    const shouldUpdateLeaderboard =
      !existingEntry ||
      totalScore > existingEntry.bestScore ||
      (totalScore === existingEntry.bestScore && timeSpentSeconds < existingEntry.bestTimeSeconds);

    if (shouldUpdateLeaderboard) {
      await tx.leaderboardEntry.upsert({
        where: {
          quizId_userId: {
            quizId: attempt.quizId,
            userId: attempt.userId,
          },
        },
        update: {
          bestScore: totalScore,
          bestPercentage: percentage,
          bestTimeSeconds: timeSpentSeconds,
          lastAttemptAt: submittedAt,
        },
        create: {
          quizId: attempt.quizId,
          userId: attempt.userId,
          bestScore: totalScore,
          bestPercentage: percentage,
          bestTimeSeconds: timeSpentSeconds,
          lastAttemptAt: submittedAt,
        },
      });
    }

    return updatedAttempt;
  });
}

type AuditPayload = {
  adminId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logAudit(payload: AuditPayload) {
  await prisma.auditLog.create({
    data: payload,
  });
}

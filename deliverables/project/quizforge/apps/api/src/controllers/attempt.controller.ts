import { AttemptStatus, QuestionType } from "@prisma/client";
import { Request, Response } from "express";

import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { finalizeAttempt, isAttemptExpired } from "../services/attempt.service";
import { ApiError } from "../utils/apiError";
import { getPagination } from "../utils/pagination";
import { successResponse } from "../utils/response";

function isSubmitted(status: AttemptStatus) {
  return status === AttemptStatus.SUBMITTED || status === AttemptStatus.AUTO_SUBMITTED;
}

function ensureAttemptAccess(
  attemptUserId: string,
  reqSession: { userId?: string; role?: "USER" | "ADMIN" },
) {
  if (!reqSession.userId) throw new ApiError(401, "Unauthorized");
  if (reqSession.role === "ADMIN") return;
  if (attemptUserId !== reqSession.userId) throw new ApiError(403, "Forbidden");
}

export const getAttempt = asyncHandler(async (req: Request, res: Response) => {
  const attemptId = req.params.id;
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

  if (!attempt) throw new ApiError(404, "Attempt not found");
  ensureAttemptAccess(attempt.userId, req.session);

  if (!isSubmitted(attempt.status) && isAttemptExpired(attempt.startedAt, attempt.quiz.durationSeconds)) {
    await finalizeAttempt(attempt.id, attempt.userId, { autoSubmit: true });
    throw new ApiError(409, "Attempt time expired and was auto-submitted");
  }

  const answersMap = new Map(attempt.attemptAnswers.map((answer) => [answer.questionId, answer]));
  const order = attempt.questionOrder.length
    ? attempt.questionOrder
    : attempt.quiz.questions.map((question) => question.id);
  const choiceOrder = (attempt.choiceOrder as Record<string, string[]>) ?? {};

  const questions = order
    .map((questionId) => attempt.quiz.questions.find((question) => question.id === questionId))
    .filter(Boolean)
    .map((question) => {
      const sortedChoices = choiceOrder[question!.id]?.length
        ? choiceOrder[question!.id]
            .map((choiceId) => question!.choices.find((choice) => choice.id === choiceId))
            .filter(Boolean)
        : question!.choices;

      return {
        id: question!.id,
        type: question!.type,
        text: question!.text,
        points: question!.points,
        order: question!.order,
        explanation: isSubmitted(attempt.status) ? question!.explanation : undefined,
        choices: sortedChoices.map((choice) => ({
          id: choice!.id,
          text: choice!.text,
          ...(isSubmitted(attempt.status) ? { isCorrect: choice!.isCorrect } : {}),
        })),
        answer: answersMap.get(question!.id)
          ? {
              selectedChoiceId: answersMap.get(question!.id)?.selectedChoiceId,
              textAnswer: answersMap.get(question!.id)?.textAnswer,
              isCorrect: answersMap.get(question!.id)?.isCorrect,
              awardedScore: answersMap.get(question!.id)?.awardedScore,
            }
          : null,
      };
    });

  const elapsedSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

  res.json(
    successResponse("Attempt fetched", {
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        quizId: attempt.quizId,
        durationSeconds: attempt.quiz.durationSeconds,
        timeRemainingSeconds: Math.max(0, attempt.quiz.durationSeconds - elapsedSeconds),
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        tabSwitchCount: attempt.tabSwitchCount,
      },
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        instructions: attempt.quiz.instructions,
      },
      questions,
    }),
  );
});

export const saveAttemptAnswer = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const attemptId = req.params.id;
  const { questionId, selectedChoiceId, textAnswer, tabSwitchDelta = 0 } = req.body as {
    questionId: string;
    selectedChoiceId?: string;
    textAnswer?: string;
    tabSwitchDelta?: number;
  };

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: true,
    },
  });

  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.userId !== userId) throw new ApiError(403, "You cannot answer this attempt");
  if (isSubmitted(attempt.status)) throw new ApiError(409, "Attempt already submitted");
  if (isAttemptExpired(attempt.startedAt, attempt.quiz.durationSeconds)) {
    await finalizeAttempt(attempt.id, userId, { autoSubmit: true });
    throw new ApiError(409, "Attempt time expired and was auto-submitted");
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, quizId: attempt.quizId },
    include: { choices: true },
  });

  if (!question) throw new ApiError(400, "Question does not belong to this quiz");

  if (question.type === QuestionType.FILL_BLANK) {
    if (!textAnswer || textAnswer.trim().length === 0) {
      throw new ApiError(400, "textAnswer is required for fill blank questions");
    }
  } else if (!selectedChoiceId) {
    throw new ApiError(400, "selectedChoiceId is required for objective questions");
  }

  if (selectedChoiceId) {
    const validChoice = question.choices.some((choice) => choice.id === selectedChoiceId);
    if (!validChoice) {
      throw new ApiError(400, "Invalid choice for question");
    }
  }

  const answer = await prisma.attemptAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId,
      },
    },
    update: {
      selectedChoiceId: selectedChoiceId ?? null,
      textAnswer: textAnswer?.trim() ?? null,
      answeredAt: new Date(),
    },
    create: {
      attemptId,
      questionId,
      selectedChoiceId: selectedChoiceId ?? null,
      textAnswer: textAnswer?.trim() ?? null,
    },
  });

  await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: AttemptStatus.IN_PROGRESS,
      tabSwitchCount: { increment: Math.max(0, Number(tabSwitchDelta || 0)) },
    },
  });

  res.json(
    successResponse("Answer saved", {
      answer: {
        id: answer.id,
        questionId: answer.questionId,
        selectedChoiceId: answer.selectedChoiceId,
        textAnswer: answer.textAnswer,
      },
    }),
  );
});

export const submitAttempt = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const attemptId = req.params.id;
  const { autoSubmit = false } = req.body as { autoSubmit?: boolean };

  const attempt = await finalizeAttempt(attemptId, userId, { autoSubmit });
  res.json(
    successResponse("Attempt submitted", {
      attempt: {
        id: attempt.id,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
      },
    }),
  );
});

export const getAttemptResult = asyncHandler(async (req: Request, res: Response) => {
  const attemptId = req.params.id;
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      user: { select: { id: true, name: true } },
      quiz: {
        include: {
          questions: {
            include: {
              choices: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
      attemptAnswers: true,
    },
  });

  if (!attempt) throw new ApiError(404, "Attempt not found");
  ensureAttemptAccess(attempt.userId, req.session);

  if (!isSubmitted(attempt.status)) {
    throw new ApiError(400, "Attempt has not been submitted yet");
  }

  const answerMap = new Map(attempt.attemptAnswers.map((answer) => [answer.questionId, answer]));

  const questions = attempt.quiz.questions.map((question) => {
    const answer = answerMap.get(question.id);
    const correctChoice = question.choices.find((choice) => choice.isCorrect);

    return {
      id: question.id,
      type: question.type,
      text: question.text,
      explanation: question.explanation,
      points: question.points,
      negativeMarks: question.negativeMarks,
      options: question.choices.map((choice) => ({
        id: choice.id,
        text: choice.text,
        isCorrect: choice.isCorrect,
      })),
      userAnswer: {
        selectedChoiceId: answer?.selectedChoiceId ?? null,
        textAnswer: answer?.textAnswer ?? null,
      },
      correctAnswer:
        question.type === QuestionType.FILL_BLANK
          ? question.acceptedAnswers
          : correctChoice
            ? [correctChoice.text]
            : [],
      isCorrect: answer?.isCorrect ?? false,
      awardedScore: answer?.awardedScore ?? 0,
    };
  });

  res.json(
    successResponse("Attempt result fetched", {
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        timeSpentSeconds: attempt.timeSpentSeconds,
        tabSwitchCount: attempt.tabSwitchCount,
      },
      user: attempt.user,
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        difficulty: attempt.quiz.difficulty,
      },
      questions,
    }),
  );
});

export const listMyAttempts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { page, limit, skip } = getPagination(req.query as { page?: number; limit?: number });

  const [total, attempts] = await Promise.all([
    prisma.attempt.count({
      where: { userId },
    }),
    prisma.attempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            totalMarks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  res.json(
    successResponse("Attempt history fetched", {
      items: attempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

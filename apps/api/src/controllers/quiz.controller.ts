import { AttemptStatus, Prisma } from "@prisma/client";
import { Request, Response } from "express";

import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { finalizeAttempt, isAttemptExpired } from "../services/attempt.service";
import { ApiError } from "../utils/apiError";
import { getPagination } from "../utils/pagination";
import { successResponse } from "../utils/response";

function isQuizAvailable(quiz: { published: boolean; availableFrom: Date | null; availableTo: Date | null }) {
  const now = new Date();
  const availableFromValid = !quiz.availableFrom || quiz.availableFrom <= now;
  const availableToValid = !quiz.availableTo || quiz.availableTo >= now;
  return quiz.published && availableFromValid && availableToValid;
}

function shuffle<T>(items: T[]) {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
}

export const listQuizzes = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req.query as { page?: number; limit?: number });
  const { search, difficulty, category } = req.query as {
    search?: string;
    difficulty?: string;
    category?: string;
  };

  const filters: Prisma.QuizWhereInput = {
    deletedAt: null,
    published: true,
    AND: [
      {
        OR: [{ availableFrom: null }, { availableFrom: { lte: new Date() } }],
      },
      {
        OR: [{ availableTo: null }, { availableTo: { gte: new Date() } }],
      },
    ],
  };

  if (search) {
    filters.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (difficulty) {
    filters.difficulty = difficulty as never;
  }

  if (category) {
    filters.categories = {
      some: {
        category: {
          slug: category,
        },
      },
    };
  }

  const [total, items] = await Promise.all([
    prisma.quiz.count({ where: filters }),
    prisma.quiz.findMany({
      where: filters,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  res.json(
    successResponse("Quizzes fetched", {
      items: items.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        durationSeconds: quiz.durationSeconds,
        totalMarks: quiz.totalMarks,
        categories: quiz.categories.map((item) => item.category),
        questionCount: quiz._count.questions,
        attemptCount: quiz._count.attempts,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

export const getQuizDetails = asyncHandler(async (req: Request, res: Response) => {
  const quizId = req.params.id;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, deletedAt: null },
    include: {
      categories: { include: { category: true } },
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          text: true,
          order: true,
          points: true,
        },
      },
      leaderboardEntries: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: [{ bestScore: "desc" }, { bestTimeSeconds: "asc" }],
        take: 10,
      },
    },
  });

  if (!quiz || !isQuizAvailable(quiz)) {
    throw new ApiError(404, "Quiz not found");
  }

  res.json(
    successResponse("Quiz details fetched", {
      ...quiz,
      categories: quiz.categories.map((item) => item.category),
      leaderboard: quiz.leaderboardEntries,
    }),
  );
});

export const startQuizAttempt = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const quizId = req.params.id;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, deletedAt: null },
    include: {
      questions: {
        include: {
          choices: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz || !isQuizAvailable(quiz)) {
    throw new ApiError(404, "Quiz not found or not available");
  }

  let attempt = await prisma.attempt.findFirst({
    where: {
      quizId,
      userId,
      status: { in: [AttemptStatus.STARTED, AttemptStatus.IN_PROGRESS] },
    },
    orderBy: { startedAt: "desc" },
    include: { attemptAnswers: true },
  });

  if (attempt && isAttemptExpired(attempt.startedAt, quiz.durationSeconds)) {
    await finalizeAttempt(attempt.id, userId, { autoSubmit: true });
    attempt = null;
  }

  const quizQuestions = quiz.questions.map((question) => ({
    ...question,
    choices: [...question.choices],
  }));

  if (!attempt) {
    const questionOrder = quiz.shuffleQuestions
      ? shuffle(quizQuestions.map((question) => question.id))
      : quizQuestions.map((question) => question.id);

    const choiceOrder = quizQuestions.reduce<Record<string, string[]>>((acc, question) => {
      const ids = question.choices.map((choice) => choice.id);
      acc[question.id] = quiz.shuffleOptions ? shuffle(ids) : ids;
      return acc;
    }, {});

    attempt = await prisma.attempt.create({
      data: {
        userId,
        quizId,
        status: AttemptStatus.STARTED,
        questionOrder,
        choiceOrder,
      },
      include: {
        attemptAnswers: true,
      },
    });
  }

  const answersMap = new Map(
    attempt.attemptAnswers.map((answer) => [answer.questionId, answer] as const),
  );

  const questionOrder =
    attempt.questionOrder.length > 0
      ? attempt.questionOrder
      : quizQuestions.map((question) => question.id);
  const choiceOrder = (attempt.choiceOrder as Record<string, string[]>) ?? {};

  const orderedQuestions = questionOrder
    .map((questionId) => quizQuestions.find((question) => question.id === questionId))
    .filter(Boolean)
    .map((question) => {
      const orderedChoiceIds = choiceOrder[question!.id];
      const choices = orderedChoiceIds
        ? orderedChoiceIds
            .map((choiceId) => question!.choices.find((choice) => choice.id === choiceId))
            .filter(Boolean)
        : question!.choices;

      return {
        id: question!.id,
        type: question!.type,
        text: question!.text,
        explanation: question!.explanation,
        points: question!.points,
        order: question!.order,
        imageUrl: question!.imageUrl,
        choices: choices.map((choice) => ({
          id: choice!.id,
          text: choice!.text,
          order: choice!.order,
        })),
        answer: answersMap.get(question!.id)
          ? {
              selectedChoiceId: answersMap.get(question!.id)?.selectedChoiceId,
              textAnswer: answersMap.get(question!.id)?.textAnswer,
            }
          : null,
      };
    });

  const elapsedSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
  const timeRemainingSeconds = Math.max(0, quiz.durationSeconds - elapsedSeconds);

  res.status(201).json(
    successResponse("Attempt ready", {
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        quizId: attempt.quizId,
        durationSeconds: quiz.durationSeconds,
        timeRemainingSeconds,
      },
      quiz: {
        id: quiz.id,
        title: quiz.title,
        instructions: quiz.instructions,
      },
      questions: orderedQuestions,
    }),
  );
});

export const getGlobalLeaderboard = asyncHandler(async (_req: Request, res: Response) => {
  const leaderboard = await prisma.leaderboardEntry.findMany({
    include: {
      quiz: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: [{ bestScore: "desc" }, { bestTimeSeconds: "asc" }],
    take: 50,
  });

  res.json(successResponse("Leaderboard fetched", { items: leaderboard }));
});

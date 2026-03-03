import { Prisma, QuestionType } from "@prisma/client";
import { Request, Response } from "express";

import { prisma } from "../config/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { logAudit } from "../services/attempt.service";
import { ApiError } from "../utils/apiError";
import { successResponse } from "../utils/response";

function slugToName(slug: string) {
  return slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

async function syncQuizCategories(
  tx: Prisma.TransactionClient,
  quizId: string,
  categorySlugs: string[] = [],
) {
  if (!categorySlugs.length) return;

  const categories = await Promise.all(
    categorySlugs.map((slug) =>
      tx.category.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name: slugToName(slug),
        },
      }),
    ),
  );

  await tx.quizCategory.deleteMany({ where: { quizId } });
  await tx.quizCategory.createMany({
    data: categories.map((category) => ({
      quizId,
      categoryId: category.id,
    })),
    skipDuplicates: true,
  });
}

async function recalculateQuizTotalMarks(tx: Prisma.TransactionClient, quizId: string) {
  const aggregate = await tx.question.aggregate({
    where: { quizId },
    _sum: { points: true },
  });

  await tx.quiz.update({
    where: { id: quizId },
    data: { totalMarks: aggregate._sum.points ?? 0 },
  });
}

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.session.userId;
  if (!adminId) throw new ApiError(401, "Unauthorized");

  const {
    title,
    description,
    instructions,
    difficulty,
    durationSeconds,
    published = false,
    shuffleQuestions = false,
    shuffleOptions = false,
    availableFrom,
    availableTo,
    categorySlugs = [],
  } = req.body as {
    title: string;
    description: string;
    instructions?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    durationSeconds: number;
    published?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    availableFrom?: string | null;
    availableTo?: string | null;
    categorySlugs?: string[];
  };

  const quiz = await prisma.$transaction(async (tx) => {
    const created = await tx.quiz.create({
      data: {
        title,
        description,
        instructions,
        difficulty,
        durationSeconds,
        published,
        shuffleQuestions,
        shuffleOptions,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        createdById: adminId,
      },
    });

    await syncQuizCategories(tx, created.id, categorySlugs);
    await logAudit({
      adminId,
      action: "QUIZ_CREATE",
      entity: "QUIZ",
      entityId: created.id,
      metadata: { title },
    });

    return created;
  });

  res.status(201).json(successResponse("Quiz created", { quiz }));
});

export const listAdminQuizzes = asyncHandler(async (_req: Request, res: Response) => {
  const quizzes = await prisma.quiz.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { questions: true, attempts: true } },
      categories: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    successResponse("Admin quizzes fetched", {
      items: quizzes.map((quiz) => ({
        ...quiz,
        categories: quiz.categories.map((item) => item.category),
        questionCount: quiz._count.questions,
        attemptCount: quiz._count.attempts,
      })),
    }),
  );
});

export const getAdminQuizDetails = asyncHandler(async (req: Request, res: Response) => {
  const quizId = req.params.id;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, deletedAt: null },
    include: {
      categories: { include: { category: true } },
      questions: {
        include: { choices: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) throw new ApiError(404, "Quiz not found");

  res.json(
    successResponse("Admin quiz fetched", {
      ...quiz,
      categories: quiz.categories.map((item) => item.category),
    }),
  );
});

export const updateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.session.userId;
  if (!adminId) throw new ApiError(401, "Unauthorized");

  const quizId = req.params.id;
  const {
    title,
    description,
    instructions,
    difficulty,
    durationSeconds,
    published,
    shuffleQuestions,
    shuffleOptions,
    availableFrom,
    availableTo,
    categorySlugs,
  } = req.body as {
    title?: string;
    description?: string;
    instructions?: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    durationSeconds?: number;
    published?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    availableFrom?: string | null;
    availableTo?: string | null;
    categorySlugs?: string[];
  };

  const existingQuiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!existingQuiz || existingQuiz.deletedAt) throw new ApiError(404, "Quiz not found");

  const quiz = await prisma.$transaction(async (tx) => {
    const updated = await tx.quiz.update({
      where: { id: quizId },
      data: {
        title,
        description,
        instructions,
        difficulty,
        durationSeconds,
        published,
        shuffleQuestions,
        shuffleOptions,
        availableFrom: availableFrom === undefined ? undefined : availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo === undefined ? undefined : availableTo ? new Date(availableTo) : null,
      },
    });

    if (categorySlugs) {
      await syncQuizCategories(tx, quizId, categorySlugs);
    }

    await logAudit({
      adminId,
      action: "QUIZ_UPDATE",
      entity: "QUIZ",
      entityId: quizId,
      metadata: req.body as Prisma.InputJsonValue,
    });

    return updated;
  });

  res.json(successResponse("Quiz updated", { quiz }));
});

export const deleteQuiz = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.session.userId;
  if (!adminId) throw new ApiError(401, "Unauthorized");

  const quizId = req.params.id;
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.deletedAt) throw new ApiError(404, "Quiz not found");

  await prisma.quiz.update({
    where: { id: quizId },
    data: {
      deletedAt: new Date(),
      published: false,
    },
  });

  await logAudit({
    adminId,
    action: "QUIZ_DELETE",
    entity: "QUIZ",
    entityId: quizId,
  });

  res.json(successResponse("Quiz deleted"));
});

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.session.userId;
  if (!adminId) throw new ApiError(401, "Unauthorized");

  const quizId = req.params.id;
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.deletedAt) throw new ApiError(404, "Quiz not found");

  const {
    type,
    text,
    explanation,
    points,
    negativeMarks = 0,
    order,
    imageUrl,
    acceptedAnswers = [],
    choices = [],
  } = req.body as {
    type: QuestionType;
    text: string;
    explanation?: string;
    points: number;
    negativeMarks?: number;
    order: number;
    imageUrl?: string;
    acceptedAnswers?: string[];
    choices?: Array<{ text: string; isCorrect: boolean; order: number }>;
  };

  const question = await prisma.$transaction(async (tx) => {
    const createdQuestion = await tx.question.create({
      data: {
        quizId,
        type,
        text,
        explanation,
        points,
        negativeMarks,
        order,
        imageUrl,
        acceptedAnswers: type === QuestionType.FILL_BLANK ? acceptedAnswers : [],
      },
    });

    if (type !== QuestionType.FILL_BLANK && choices.length > 0) {
      await tx.choice.createMany({
        data: choices.map((choice) => ({
          questionId: createdQuestion.id,
          text: choice.text,
          isCorrect: choice.isCorrect,
          order: choice.order,
        })),
      });
    }

    await recalculateQuizTotalMarks(tx, quizId);
    await logAudit({
      adminId,
      action: "QUESTION_CREATE",
      entity: "QUESTION",
      entityId: createdQuestion.id,
      metadata: { quizId, type },
    });

    return createdQuestion;
  });

  res.status(201).json(successResponse("Question created", { question }));
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.session.userId;
  if (!adminId) throw new ApiError(401, "Unauthorized");

  const questionId = req.params.id;
  const existing = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: true },
  });

  if (!existing || existing.quiz.deletedAt) throw new ApiError(404, "Question not found");

  const {
    type,
    text,
    explanation,
    points,
    negativeMarks,
    order,
    imageUrl,
    acceptedAnswers,
    choices,
  } = req.body as {
    type?: QuestionType;
    text?: string;
    explanation?: string;
    points?: number;
    negativeMarks?: number;
    order?: number;
    imageUrl?: string;
    acceptedAnswers?: string[];
    choices?: Array<{ text: string; isCorrect: boolean; order: number }>;
  };

  const question = await prisma.$transaction(async (tx) => {
    const updated = await tx.question.update({
      where: { id: questionId },
      data: {
        type,
        text,
        explanation,
        points,
        negativeMarks,
        order,
        imageUrl,
        acceptedAnswers: acceptedAnswers ?? undefined,
      },
    });

    if (choices) {
      await tx.choice.deleteMany({ where: { questionId } });
      if (choices.length > 0 && (type ?? existing.type) !== QuestionType.FILL_BLANK) {
        await tx.choice.createMany({
          data: choices.map((choice) => ({
            questionId,
            text: choice.text,
            isCorrect: choice.isCorrect,
            order: choice.order,
          })),
        });
      }
    }

    await recalculateQuizTotalMarks(tx, existing.quizId);
    await logAudit({
      adminId,
      action: "QUESTION_UPDATE",
      entity: "QUESTION",
      entityId: questionId,
      metadata: req.body as Prisma.InputJsonValue,
    });

    return updated;
  });

  res.json(successResponse("Question updated", { question }));
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.session.userId;
  if (!adminId) throw new ApiError(401, "Unauthorized");

  const questionId = req.params.id;
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new ApiError(404, "Question not found");

  await prisma.$transaction(async (tx) => {
    await tx.choice.deleteMany({ where: { questionId } });
    await tx.question.delete({ where: { id: questionId } });
    await recalculateQuizTotalMarks(tx, question.quizId);
  });

  await logAudit({
    adminId,
    action: "QUESTION_DELETE",
    entity: "QUESTION",
    entityId: questionId,
  });

  res.json(successResponse("Question deleted"));
});

export const getAdminAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [userCount, quizCount, attemptCount, submittedCount, avgScore, recentAttempts] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.quiz.count({ where: { deletedAt: null } }),
    prisma.attempt.count(),
    prisma.attempt.count({
      where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
    }),
    prisma.attempt.aggregate({
      _avg: { percentage: true },
      where: {
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
      },
    }),
    prisma.attempt.findMany({
      include: {
        user: { select: { id: true, name: true } },
        quiz: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  res.json(
    successResponse("Admin analytics fetched", {
      users: userCount,
      quizzes: quizCount,
      attempts: attemptCount,
      completionRate: attemptCount > 0 ? Number(((submittedCount / attemptCount) * 100).toFixed(2)) : 0,
      averagePercentage: Number((avgScore._avg.percentage ?? 0).toFixed(2)),
      recentAttempts,
    }),
  );
});

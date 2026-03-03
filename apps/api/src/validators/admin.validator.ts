import { Difficulty, QuestionType } from "@prisma/client";
import { z } from "zod";

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime())
  .optional()
  .nullable();

const choiceSchema = z.object({
  text: z.string().trim().min(1).max(400),
  isCorrect: z.boolean(),
  order: z.coerce.number().int().min(1),
});

const questionInputSchema = z
  .object({
    type: z.nativeEnum(QuestionType),
    text: z.string().trim().min(1).max(1200),
    explanation: z.string().trim().max(2000).optional(),
    points: z.coerce.number().int().positive(),
    negativeMarks: z.coerce.number().min(0).optional(),
    order: z.coerce.number().int().min(1),
    imageUrl: z.string().url().optional(),
    acceptedAnswers: z.array(z.string().trim().min(1)).optional(),
    choices: z.array(choiceSchema).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === QuestionType.FILL_BLANK) {
      if (!value.acceptedAnswers || value.acceptedAnswers.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "acceptedAnswers is required for FILL_BLANK",
          path: ["acceptedAnswers"],
        });
      }
      return;
    }

    if (!value.choices || value.choices.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least two choices are required for MCQ/TRUE_FALSE",
        path: ["choices"],
      });
      return;
    }

    const correctCount = value.choices.filter((choice) => choice.isCorrect).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one choice must be marked correct",
        path: ["choices"],
      });
    }
  });

export const createQuizSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(2000),
  instructions: z.string().trim().max(3000).optional(),
  difficulty: z.nativeEnum(Difficulty),
  durationSeconds: z.coerce.number().int().positive().max(3 * 60 * 60),
  published: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  availableFrom: isoDate,
  availableTo: isoDate,
  categorySlugs: z.array(z.string().trim().min(1)).optional(),
});

export const updateQuizSchema = createQuizSchema.partial();

export const createQuestionSchema = questionInputSchema;
export const updateQuestionSchema = z.object({
  type: z.nativeEnum(QuestionType).optional(),
  text: z.string().trim().min(1).max(1200).optional(),
  explanation: z.string().trim().max(2000).optional(),
  points: z.coerce.number().int().positive().optional(),
  negativeMarks: z.coerce.number().min(0).optional(),
  order: z.coerce.number().int().min(1).optional(),
  imageUrl: z.string().url().optional(),
  acceptedAnswers: z.array(z.string().trim().min(1)).optional(),
  choices: z.array(choiceSchema).optional(),
});

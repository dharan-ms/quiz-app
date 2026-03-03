import { z } from "zod";

export const attemptIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const answerAttemptSchema = z
  .object({
    questionId: z.string().min(1),
    selectedChoiceId: z.string().min(1).optional(),
    textAnswer: z.string().trim().min(1).max(500).optional(),
    tabSwitchDelta: z.coerce.number().int().min(0).max(10).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.selectedChoiceId && !value.textAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either selectedChoiceId or textAnswer is required",
        path: ["selectedChoiceId"],
      });
    }
  });

export const submitAttemptSchema = z.object({
  autoSubmit: z.boolean().optional(),
});

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type QuestionTypeValue = "MCQ" | "TRUE_FALSE" | "FILL_BLANK";

export type QuestionFormValues = {
  type: QuestionTypeValue;
  text: string;
  explanation?: string;
  points: number;
  negativeMarks?: number;
  order: number;
  acceptedAnswers?: string;
  choiceA?: string;
  choiceB?: string;
  choiceC?: string;
  choiceD?: string;
  correctChoice?: string;
};

type QuestionFormProps = {
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
};

export function QuestionForm({ onSubmit }: QuestionFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<QuestionFormValues>({
    defaultValues: {
      type: "MCQ",
      points: 1,
      order: 1,
      negativeMarks: 0,
      correctChoice: "A",
    },
  });

  const type = watch("type");

  async function submit(values: QuestionFormValues) {
    setServerError(null);
    try {
      if (values.type === "FILL_BLANK") {
        await onSubmit({
          type: values.type,
          text: values.text,
          explanation: values.explanation,
          points: values.points,
          order: values.order,
          negativeMarks: values.negativeMarks ?? 0,
          acceptedAnswers: (values.acceptedAnswers ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        });
      } else {
        const choices =
          values.type === "TRUE_FALSE"
            ? ["True", "False"].map((text, index) => ({
                text,
                order: index + 1,
                isCorrect:
                  (values.correctChoice === "A" && index === 0) ||
                  (values.correctChoice === "B" && index === 1),
              }))
            : [
                values.choiceA,
                values.choiceB,
                values.choiceC,
                values.choiceD,
              ]
                .filter(Boolean)
                .map((text, index) => ({
                  text,
                  order: index + 1,
                  isCorrect:
                    (values.correctChoice === "A" && index === 0) ||
                    (values.correctChoice === "B" && index === 1) ||
                    (values.correctChoice === "C" && index === 2) ||
                    (values.correctChoice === "D" && index === 3),
                }));

        await onSubmit({
          type: values.type,
          text: values.text,
          explanation: values.explanation,
          points: values.points,
          order: values.order,
          negativeMarks: values.negativeMarks ?? 0,
          choices,
        });
      }

      reset();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to save question");
    }
  }

  return (
    <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-4" onSubmit={handleSubmit(submit)}>
      <h3 className="text-lg font-semibold text-slate-900">Add Question</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("type")}
          >
            <option value="MCQ">MCQ</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="FILL_BLANK">Fill Blank</option>
          </select>
        </div>
        <Input
          type="number"
          label="Points"
          error={errors.points?.message}
          {...register("points", { required: "Points required", valueAsNumber: true, min: 1 })}
        />
        <Input
          type="number"
          label="Order"
          error={errors.order?.message}
          {...register("order", { required: "Order required", valueAsNumber: true, min: 1 })}
        />
      </div>

      <Input label="Question text" error={errors.text?.message} {...register("text", { required: "Question text is required" })} />

      <Input label="Explanation" {...register("explanation")} />

      {type === "FILL_BLANK" ? (
        <Input
          label="Accepted answers (comma separated)"
          placeholder="jwt, json web token"
          {...register("acceptedAnswers", { required: "At least one answer is required" })}
        />
      ) : (
        <>
          {type === "MCQ" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Choice A" {...register("choiceA", { required: "Required" })} />
              <Input label="Choice B" {...register("choiceB", { required: "Required" })} />
              <Input label="Choice C" {...register("choiceC")} />
              <Input label="Choice D" {...register("choiceD")} />
            </div>
          ) : null}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Correct Choice</label>
            <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" {...register("correctChoice")}>
              <option value="A">A</option>
              <option value="B">B</option>
              {type === "MCQ" ? <option value="C">C</option> : null}
              {type === "MCQ" ? <option value="D">D</option> : null}
            </select>
          </div>
        </>
      )}

      {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Add Question"}
      </Button>
    </form>
  );
}

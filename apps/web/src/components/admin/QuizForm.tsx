"use client";

import { useForm } from "react-hook-form";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export type QuizFormValues = {
  title: string;
  description: string;
  instructions?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  durationSeconds: number;
  published: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  availableFrom?: string;
  availableTo?: string;
  categorySlugs?: string;
};

type QuizFormProps = {
  defaultValues?: Partial<QuizFormValues>;
  onSubmit: (values: QuizFormValues) => Promise<void>;
  submitLabel?: string;
};

export function QuizForm({ defaultValues, onSubmit, submitLabel = "Save Quiz" }: QuizFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuizFormValues>({
    defaultValues: {
      difficulty: "MEDIUM",
      durationSeconds: 900,
      published: false,
      shuffleQuestions: true,
      shuffleOptions: true,
      ...defaultValues,
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Title" error={errors.title?.message} {...register("title", { required: "Title is required" })} />

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring-2"
          {...register("description", { required: "Description is required" })}
        />
        {errors.description ? <p className="text-xs text-rose-600">{errors.description.message}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Difficulty</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring-2"
            {...register("difficulty")}
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <Input
          type="number"
          label="Duration (seconds)"
          error={errors.durationSeconds?.message}
          {...register("durationSeconds", {
            required: "Duration is required",
            valueAsNumber: true,
            min: { value: 60, message: "Minimum 60 seconds" },
          })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input type="datetime-local" label="Available From" {...register("availableFrom")} />
        <Input type="datetime-local" label="Available To" {...register("availableTo")} />
      </div>

      <Input
        label="Category Slugs (comma separated)"
        placeholder="javascript,backend,general-knowledge"
        {...register("categorySlugs")}
      />

      <div className="grid gap-2 md:grid-cols-3">
        <label className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm">
          <input type="checkbox" {...register("published")} />
          Published
        </label>
        <label className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm">
          <input type="checkbox" {...register("shuffleQuestions")} />
          Shuffle Questions
        </label>
        <label className="flex items-center gap-2 rounded border border-slate-200 p-2 text-sm">
          <input type="checkbox" {...register("shuffleOptions")} />
          Shuffle Options
        </label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

"use client";

import { FormEvent } from "react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type QuizFiltersProps = {
  search: string;
  difficulty: string;
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
};

export function QuizFilters({
  search,
  difficulty,
  onSearchChange,
  onDifficultyChange,
  onApply,
  onReset,
}: QuizFiltersProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply();
  }

  return (
    <form className="grid gap-3 md:grid-cols-[2fr_1fr_auto_auto]" onSubmit={handleSubmit}>
      <Input
        placeholder="Search by title or description..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Search quizzes"
      />
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 transition focus:ring-2"
        value={difficulty}
        onChange={(event) => onDifficultyChange(event.target.value)}
        aria-label="Filter by difficulty"
      >
        <option value="">All difficulties</option>
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </select>
      <Button type="submit">Apply</Button>
      <Button type="button" variant="secondary" onClick={onReset}>
        Reset
      </Button>
    </form>
  );
}

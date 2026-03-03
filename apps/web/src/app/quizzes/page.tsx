"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { QuizFilters } from "@/components/quiz/QuizFilters";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { difficultyBadgeColor, formatDuration } from "@/lib/utils";
import { ApiResponse, Quiz } from "@/types";

type QuizListResponse = {
  items: Quiz[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function QuizzesPage() {
  const [items, setItems] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [difficultyInput, setDifficultyInput] = useState("");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const query = useMemo(
    () => ({
      search: search || undefined,
      difficulty: difficulty || undefined,
      page: 1,
      limit: 20,
    }),
    [difficulty, search],
  );

  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await api.get<ApiResponse<QuizListResponse>>("/quizzes", {
          params: query,
        });
        setItems(response.data.data.items);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Could not fetch quizzes"));
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [query]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quiz Catalog</h1>
        <p className="text-sm text-slate-600">Browse quizzes by difficulty and category.</p>
      </div>

      <Card>
        <QuizFilters
          search={searchInput}
          difficulty={difficultyInput}
          onSearchChange={setSearchInput}
          onDifficultyChange={setDifficultyInput}
          onApply={() => {
            setSearch(searchInput.trim());
            setDifficulty(difficultyInput);
          }}
          onReset={() => {
            setSearchInput("");
            setDifficultyInput("");
            setSearch("");
            setDifficulty("");
          }}
        />
      </Card>

      {errorMessage ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p> : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((quiz) => (
            <Card key={quiz.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                <span className={`rounded px-2 py-1 text-xs font-semibold ${difficultyBadgeColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <p className="text-sm text-slate-600">{quiz.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span>Questions: {quiz.questionCount ?? "-"}</span>
                <span>Duration: {formatDuration(quiz.durationSeconds)}</span>
                <span>Total Marks: {quiz.totalMarks}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
                >
                  View Quiz
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

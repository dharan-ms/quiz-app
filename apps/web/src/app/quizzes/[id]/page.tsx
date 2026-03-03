"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { difficultyBadgeColor, formatDuration } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { ApiResponse, Quiz } from "@/types";

type QuizDetailResponse = Quiz & {
  questions: Array<{ id: string; type: string; text: string; points: number; order: number }>;
  leaderboard: Array<{
    bestScore: number;
    bestPercentage: number;
    bestTimeSeconds: number;
    user: { id: string; name: string };
  }>;
};

export default function QuizDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [quiz, setQuiz] = useState<QuizDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await api.get<ApiResponse<QuizDetailResponse>>(`/quizzes/${params.id}`);
        setQuiz(response.data.data);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Could not fetch quiz details"));
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [params.id]);

  async function startAttempt() {
    if (!user) {
      router.push("/login");
      return;
    }

    setStarting(true);
    try {
      const response = await api.post<ApiResponse<{ attempt: { id: string } }>>(`/quizzes/${params.id}/start`);
      router.push(`/attempts/${response.data.data.attempt.id}`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not start quiz"));
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  if (!quiz) {
    return <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">Quiz not found.</p>;
  }

  return (
    <div className="space-y-4">
      {errorMessage ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p> : null}

      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
          <span className={`rounded px-2 py-1 text-xs font-semibold ${difficultyBadgeColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
        </div>
        <p className="text-sm text-slate-600">{quiz.description}</p>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span>{quiz.questions.length} questions</span>
          <span>{formatDuration(quiz.durationSeconds)}</span>
          <span>{quiz.totalMarks} total marks</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={startAttempt} disabled={starting}>
            {starting ? "Starting..." : "Start Quiz"}
          </Button>
          <Link href="/quizzes" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700">
            Back to catalog
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Question Preview</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          {quiz.questions.map((question, index) => (
            <li key={question.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              {index + 1}. {question.text}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Top Performers</h2>
        <ol className="space-y-2 text-sm text-slate-700">
          {quiz.leaderboard?.length ? (
            quiz.leaderboard.map((entry, index) => (
              <li key={`${entry.user.id}-${index}`} className="flex items-center justify-between rounded border px-3 py-2">
                <span>
                  {index + 1}. {entry.user.name}
                </span>
                <span>
                  {entry.bestScore} pts • {entry.bestPercentage}% • {formatDuration(entry.bestTimeSeconds)}
                </span>
              </li>
            ))
          ) : (
            <li>No leaderboard entries yet.</li>
          )}
        </ol>
      </Card>
    </div>
  );
}

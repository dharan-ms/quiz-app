"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { ApiResponse, AttemptResultQuestion } from "@/types";

type AttemptResultResponse = {
  attempt: {
    id: string;
    status: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
    timeSpentSeconds: number;
    tabSwitchCount: number;
  };
  quiz: {
    id: string;
    title: string;
    difficulty: string;
  };
  questions: AttemptResultQuestion[];
};

export default function AttemptResultPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttemptResultResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await api.get<ApiResponse<AttemptResultResponse>>(`/attempts/${params.id}/result`);
        setData(response.data.data);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Could not load result"));
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [params.id]);

  if (loading) {
    return (
      <ProtectedPage>
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </ProtectedPage>
    );
  }

  if (!data) {
    return (
      <ProtectedPage>
        <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{errorMessage ?? "Result unavailable."}</p>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-4">
        <Card className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-900">Result: {data.quiz.title}</h1>
          <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-4">
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Score</p>
              <p className="text-xl font-semibold">
                {data.attempt.totalScore}/{data.attempt.maxScore}
              </p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Percentage</p>
              <p className="text-xl font-semibold">{data.attempt.percentage}%</p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Time Spent</p>
              <p className="text-xl font-semibold">{formatDuration(data.attempt.timeSpentSeconds)}</p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Tab Switches</p>
              <p className="text-xl font-semibold">{data.attempt.tabSwitchCount}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/quizzes" className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white">
              Take another quiz
            </Link>
            <Link href="/profile" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700">
              View profile history
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Review Answers</h2>
          <div className="space-y-4">
            {data.questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">
                    {index + 1}. {question.text}
                  </p>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      question.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {question.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Your answer:{" "}
                  {question.userAnswer.textAnswer ||
                    question.options.find((option) => option.id === question.userAnswer.selectedChoiceId)?.text ||
                    "Not answered"}
                </p>
                <p className="text-sm text-slate-600">
                  Correct answer: {question.correctAnswer.join(", ") || "N/A"}
                </p>
                {question.explanation ? (
                  <p className="mt-1 rounded bg-indigo-50 p-2 text-sm text-indigo-700">{question.explanation}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ProtectedPage>
  );
}

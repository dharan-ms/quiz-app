"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { ApiResponse } from "@/types";

type AnalyticsResponse = {
  users: number;
  quizzes: number;
  attempts: number;
  completionRate: number;
  averagePercentage: number;
  recentAttempts: Array<{
    id: string;
    user: { name: string };
    quiz: { title: string };
    percentage: number | null;
    timeSpentSeconds: number | null;
  }>;
};

type AdminQuiz = {
  id: string;
  title: string;
  difficulty: string;
  published: boolean;
  durationSeconds: number;
  totalMarks: number;
  questionCount: number;
  attemptCount: number;
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const [analyticsResponse, quizzesResponse] = await Promise.all([
          api.get<ApiResponse<AnalyticsResponse>>("/admin/analytics"),
          api.get<ApiResponse<{ items: AdminQuiz[] }>>("/admin/quizzes"),
        ]);
        setAnalytics(analyticsResponse.data.data);
        setQuizzes(quizzesResponse.data.data.items);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Could not load admin dashboard"));
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  return (
    <ProtectedPage adminOnly>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">Manage quizzes, questions, and performance analytics.</p>
          </div>
          <Link href="/admin/quizzes/new" className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white">
            Create Quiz
          </Link>
        </div>

        {errorMessage ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p> : null}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : analytics ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Users", value: analytics.users },
              { label: "Quizzes", value: analytics.quizzes },
              { label: "Attempts", value: analytics.attempts },
              { label: "Completion Rate", value: `${analytics.completionRate}%` },
            ].map((item) => (
              <Card key={item.label}>
                <p className="text-xs uppercase text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              </Card>
            ))}
          </div>
        ) : null}

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Manage Quizzes</h2>
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-col justify-between gap-2 rounded-md border border-slate-200 p-3 md:flex-row md:items-center"
              >
                <div>
                  <p className="font-medium text-slate-900">{quiz.title}</p>
                  <p className="text-xs text-slate-500">
                    {quiz.difficulty} • {quiz.questionCount} questions • {quiz.attemptCount} attempts
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span>{formatDuration(quiz.durationSeconds)}</span>
                  <span>{quiz.totalMarks} marks</span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      quiz.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {quiz.published ? "Published" : "Draft"}
                  </span>
                  <Link href={`/admin/quizzes/${quiz.id}`} className="text-indigo-600 hover:underline">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {analytics ? (
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent Attempts</h2>
            <div className="space-y-2">
              {analytics.recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col justify-between gap-2 rounded border border-slate-200 p-3 md:flex-row md:items-center"
                >
                  <p className="text-sm text-slate-700">
                    {attempt.user.name} • {attempt.quiz.title}
                  </p>
                  <p className="text-sm text-slate-600">
                    {attempt.percentage ?? 0}% •{" "}
                    {attempt.timeSpentSeconds ? formatDuration(attempt.timeSpentSeconds) : "-"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </ProtectedPage>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { ApiResponse } from "@/types";

type AttemptHistoryItem = {
  id: string;
  status: string;
  totalScore: number | null;
  maxScore: number | null;
  percentage: number | null;
  timeSpentSeconds: number | null;
  createdAt: string;
  quiz: {
    id: string;
    title: string;
    difficulty: string;
  };
};

type HistoryResponse = {
  items: AttemptHistoryItem[];
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AttemptHistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttempts() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await api.get<ApiResponse<HistoryResponse>>("/users/me/attempts", {
          params: { page: 1, limit: 50 },
        });
        setItems(response.data.data.items);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Could not fetch attempt history"));
      } finally {
        setLoading(false);
      }
    }

    fetchAttempts();
  }, []);

  return (
    <ProtectedPage>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-600">Track your completed attempts and revisit results.</p>
        </div>

        {errorMessage ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p> : null}

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Attempt History</h2>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-600">No attempts yet. Start a quiz to build your history.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 p-3 md:flex-row md:items-center"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.quiz.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()} • {item.quiz.difficulty}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span>
                      {item.totalScore ?? 0}/{item.maxScore ?? 0}
                    </span>
                    <span>{item.percentage ?? 0}%</span>
                    <span>{item.timeSpentSeconds ? formatDuration(item.timeSpentSeconds) : "-"}</span>
                    <Link href={`/attempts/${item.id}/result`} className="text-indigo-600 hover:underline">
                      View Result
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedPage>
  );
}

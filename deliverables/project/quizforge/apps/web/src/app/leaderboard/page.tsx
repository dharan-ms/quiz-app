"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { ApiResponse } from "@/types";

type LeaderboardItem = {
  bestScore: number;
  bestPercentage: number;
  bestTimeSeconds: number;
  user: { id: string; name: string };
  quiz: { id: string; title: string };
};

type LeaderboardResponse = {
  items: LeaderboardItem[];
};

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await api.get<ApiResponse<LeaderboardResponse>>("/quizzes/leaderboard");
        setItems(response.data.data.items);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Could not fetch leaderboard"));
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Global Leaderboard</h1>
        <p className="text-sm text-slate-600">Top performers across all quizzes.</p>
      </div>

      <Card>
        {errorMessage ? <p className="mb-3 rounded bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p> : null}
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <ol className="space-y-2">
            {items.map((entry, index) => (
              <li
                key={`${entry.user.id}-${entry.quiz.id}-${index}`}
                className="flex flex-col justify-between gap-2 rounded-md border border-slate-200 p-3 md:flex-row md:items-center"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    #{index + 1} {entry.user.name}
                  </p>
                  <p className="text-xs text-slate-500">{entry.quiz.title}</p>
                </div>
                <p className="text-sm text-slate-700">
                  {entry.bestScore} pts • {entry.bestPercentage}% • {formatDuration(entry.bestTimeSeconds)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

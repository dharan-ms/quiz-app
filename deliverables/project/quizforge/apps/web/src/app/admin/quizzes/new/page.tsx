"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { QuizForm, QuizFormValues } from "@/components/admin/QuizForm";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Card } from "@/components/ui/Card";
import { api, getApiErrorMessage } from "@/lib/api";
import { ApiResponse } from "@/types";

export default function NewQuizPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCreate(values: QuizFormValues) {
    setErrorMessage(null);
    try {
      const response = await api.post<ApiResponse<{ quiz: { id: string } }>>("/admin/quizzes", {
        ...values,
        availableFrom: values.availableFrom ? new Date(values.availableFrom).toISOString() : null,
        availableTo: values.availableTo ? new Date(values.availableTo).toISOString() : null,
        categorySlugs: (values.categorySlugs ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      router.push(`/admin/quizzes/${response.data.data.quiz.id}`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not create quiz"));
    }
  }

  return (
    <ProtectedPage adminOnly>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Create New Quiz</h1>
        {errorMessage ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p> : null}
        <Card>
          <QuizForm onSubmit={handleCreate} submitLabel="Create Quiz" />
        </Card>
      </div>
    </ProtectedPage>
  );
}

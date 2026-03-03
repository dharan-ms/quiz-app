"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { QuestionForm } from "@/components/admin/QuestionForm";
import { QuizForm, QuizFormValues } from "@/components/admin/QuizForm";
import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { ApiResponse } from "@/types";

type AdminQuestion = {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
  text: string;
  explanation?: string | null;
  points: number;
  order: number;
  negativeMarks: number;
  acceptedAnswers: string[];
  choices: Array<{ id: string; text: string; isCorrect: boolean; order: number }>;
};

type AdminQuizDetails = {
  id: string;
  title: string;
  description: string;
  instructions?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  durationSeconds: number;
  published: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  availableFrom?: string | null;
  availableTo?: string | null;
  categories: Array<{ slug: string }>;
  questions: AdminQuestion[];
};

export default function EditQuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<AdminQuizDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  async function fetchQuiz() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<ApiResponse<AdminQuizDetails>>(`/admin/quizzes/${params.id}`);
      setQuiz(response.data.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not fetch quiz"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const formDefaults = useMemo<Partial<QuizFormValues>>(() => {
    if (!quiz) return {};
    return {
      title: quiz.title,
      description: quiz.description,
      instructions: quiz.instructions ?? "",
      difficulty: quiz.difficulty,
      durationSeconds: quiz.durationSeconds,
      published: quiz.published,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      availableFrom: quiz.availableFrom
        ? new Date(quiz.availableFrom).toISOString().slice(0, 16)
        : "",
      availableTo: quiz.availableTo ? new Date(quiz.availableTo).toISOString().slice(0, 16) : "",
      categorySlugs: quiz.categories.map((category) => category.slug).join(", "),
    };
  }, [quiz]);

  async function handleUpdateQuiz(values: QuizFormValues) {
    setErrorMessage(null);
    try {
      await api.put(`/admin/quizzes/${params.id}`, {
        ...values,
        availableFrom: values.availableFrom ? new Date(values.availableFrom).toISOString() : null,
        availableTo: values.availableTo ? new Date(values.availableTo).toISOString() : null,
        categorySlugs: (values.categorySlugs ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await fetchQuiz();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not update quiz"));
    }
  }

  async function handleCreateQuestion(payload: Record<string, unknown>) {
    setErrorMessage(null);
    try {
      await api.post(`/admin/quizzes/${params.id}/questions`, payload);
      await fetchQuiz();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Could not create question"));
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    setErrorMessage(null);
    try {
      await api.delete(`/admin/questions/${questionId}`);
      await fetchQuiz();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not delete question"));
    }
  }

  async function handleQuickEditQuestion(question: AdminQuestion) {
    const updatedText = window.prompt("Update question text", question.text);
    if (!updatedText || updatedText.trim() === question.text) return;

    try {
      await api.put(`/admin/questions/${question.id}`, {
        text: updatedText.trim(),
        explanation: question.explanation ?? "",
        points: question.points,
        order: question.order,
        negativeMarks: question.negativeMarks,
        type: question.type,
        acceptedAnswers: question.acceptedAnswers,
        choices: question.choices.map((choice) => ({
          text: choice.text,
          order: choice.order,
          isCorrect: choice.isCorrect,
        })),
      });
      await fetchQuiz();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not update question"));
    }
  }

  async function deleteQuiz() {
    if (!quiz) return;
    try {
      await api.delete(`/admin/quizzes/${quiz.id}`);
      router.push("/admin");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not delete quiz"));
    } finally {
      setDeleteModalOpen(false);
    }
  }

  if (loading) {
    return (
      <ProtectedPage adminOnly>
        <div className="space-y-3">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-56 w-full" />
        </div>
      </ProtectedPage>
    );
  }

  if (!quiz) {
    return (
      <ProtectedPage adminOnly>
        <p className="rounded bg-rose-50 p-3 text-sm text-rose-700">Quiz not found.</p>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage adminOnly>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Edit Quiz: {quiz.title}</h1>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Delete Quiz
          </Button>
        </div>

        {errorMessage ? <p className="rounded bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p> : null}

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Quiz Settings</h2>
          <QuizForm defaultValues={formDefaults} onSubmit={handleUpdateQuiz} submitLabel="Update Quiz" />
        </Card>

        <QuestionForm onSubmit={handleCreateQuestion} />

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Questions ({quiz.questions.length})</h2>
          <div className="space-y-3">
            {quiz.questions.map((question) => (
              <div key={question.id} className="rounded border border-slate-200 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">
                    #{question.order} [{question.type}] {question.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => handleQuickEditQuestion(question)}>
                      Quick Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteQuestion(question.id)}>
                      Delete
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-slate-600">Points: {question.points}</p>
                {question.type === "FILL_BLANK" ? (
                  <p className="text-sm text-slate-600">
                    Accepted Answers: {question.acceptedAnswers.join(", ")}
                  </p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm text-slate-700">
                    {question.choices.map((choice) => (
                      <li key={choice.id}>
                        {choice.isCorrect ? "✅" : "◻️"} {choice.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete quiz">
        <p className="text-sm text-slate-700">
          This action will soft-delete the quiz and hide it from users. Continue?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteQuiz}>
            Delete
          </Button>
        </div>
      </Modal>
    </ProtectedPage>
  );
}

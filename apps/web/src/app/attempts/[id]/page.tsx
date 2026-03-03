"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProtectedPage } from "@/components/layout/ProtectedPage";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { ApiResponse, AttemptPayload, QuizQuestion } from "@/types";

type AttemptDetailsResponse = {
  attempt: AttemptPayload;
  quiz: { id: string; title: string; instructions?: string | null };
  questions: QuizQuestion[];
};

export default function AttemptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<AttemptPayload | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, { selectedChoiceId?: string | null; textAnswer?: string }>>(
    {},
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const tabSwitchDeltaRef = useRef(0);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    async function fetchAttempt() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await api.get<ApiResponse<AttemptDetailsResponse>>(`/attempts/${params.id}`);
        const payload = response.data.data;
        setAttempt(payload.attempt);
        setQuizTitle(payload.quiz.title);
        setQuestions(payload.questions);
        setTimeRemaining(payload.attempt.timeRemainingSeconds);

        const answerMap: Record<string, { selectedChoiceId?: string | null; textAnswer?: string }> = {};
        payload.questions.forEach((question) => {
          answerMap[question.id] = {
            selectedChoiceId: question.answer?.selectedChoiceId ?? null,
            textAnswer: question.answer?.textAnswer ?? "",
          };
        });
        setAnswers(answerMap);

        if (
          payload.attempt.status === "SUBMITTED" ||
          payload.attempt.status === "AUTO_SUBMITTED"
        ) {
          router.replace(`/attempts/${params.id}/result`);
        }
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Could not load attempt"));
      } finally {
        setLoading(false);
      }
    }

    fetchAttempt();
  }, [params.id, router]);

  useEffect(() => {
    if (!attempt) return;
    if (attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED") return;

    const timer = setInterval(() => {
      setTimeRemaining((previous) => {
        const next = Math.max(0, previous - 1);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt]);

  useEffect(() => {
    if (timeRemaining > 0 || autoSubmittedRef.current) return;
    if (!attempt) return;
    autoSubmittedRef.current = true;
    const attemptId = attempt.id;

    async function autoSubmit() {
      try {
        await api.post(`/attempts/${attemptId}/submit`, { autoSubmit: true });
      } finally {
        router.replace(`/attempts/${attemptId}/result`);
      }
    }

    autoSubmit();
  }, [attempt, router, timeRemaining]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) {
        tabSwitchDeltaRef.current += 1;
        setShowTabWarning(true);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = useMemo(
    () => (currentQuestion ? answers[currentQuestion.id] ?? {} : {}),
    [answers, currentQuestion],
  );

  function setCurrentAnswer(update: { selectedChoiceId?: string | null; textAnswer?: string }) {
    if (!currentQuestion) return;
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        ...previous[currentQuestion.id],
        ...update,
      },
    }));
  }

  async function saveAnswer(question: QuizQuestion) {
    const answer = answers[question.id];
    if (!answer) return;
    if (!answer.selectedChoiceId && !answer.textAnswer) return;

    setSaving(true);
    try {
      await api.post(`/attempts/${params.id}/answer`, {
        questionId: question.id,
        selectedChoiceId: answer.selectedChoiceId || undefined,
        textAnswer: answer.textAnswer?.trim() || undefined,
        tabSwitchDelta: tabSwitchDeltaRef.current,
      });
      tabSwitchDeltaRef.current = 0;
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Could not save answer"));
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    if (!currentQuestion) return;
    await saveAnswer(currentQuestion);
    setCurrentIndex((previous) => Math.min(previous + 1, questions.length - 1));
  }

  async function handlePrevious() {
    setCurrentIndex((previous) => Math.max(previous - 1, 0));
  }

  async function handleSubmit() {
    if (!attempt || !currentQuestion) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await saveAnswer(currentQuestion);
      await api.post(`/attempts/${attempt.id}/submit`, { autoSubmit: false });
      router.replace(`/attempts/${attempt.id}/result`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to submit attempt"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedPage>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-56 w-full" />
        </div>
      </ProtectedPage>
    );
  }

  if (!attempt || !currentQuestion) {
    return (
      <ProtectedPage>
        <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">Attempt not found.</p>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-4">
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{quizTitle}</h1>
            <p className="text-sm text-slate-600">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <QuizTimer seconds={timeRemaining} isWarning={timeRemaining <= 60} />
        </Card>

        {errorMessage ? <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p> : null}

        <QuestionCard
          question={currentQuestion}
          currentAnswer={currentAnswer}
          onChoiceSelect={(choiceId) => setCurrentAnswer({ selectedChoiceId: choiceId, textAnswer: "" })}
          onTextChange={(text) => setCurrentAnswer({ textAnswer: text, selectedChoiceId: null })}
          disabled={submitting}
        />

        <Card>
          <div className="mb-3 flex flex-wrap gap-2">
            {questions.map((question, index) => {
              const answered = Boolean(
                answers[question.id]?.selectedChoiceId || answers[question.id]?.textAnswer,
              );
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`h-9 w-9 rounded text-xs font-semibold ${
                    index === currentIndex
                      ? "bg-indigo-600 text-white"
                      : answered
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
                  aria-label={`Go to question ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePrevious} disabled={currentIndex === 0 || submitting}>
                Previous
              </Button>
              <Button onClick={handleNext} disabled={currentIndex === questions.length - 1 || submitting || saving}>
                {saving ? "Saving..." : "Save & Next"}
              </Button>
            </div>
            <Button variant="danger" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        </Card>
      </div>

      <Modal isOpen={showTabWarning} onClose={() => setShowTabWarning(false)} title="Tab switch detected">
        <p className="text-sm text-slate-700">
          We detected that you switched tabs. This event is logged for anti-cheat analytics.
        </p>
      </Modal>
    </ProtectedPage>
  );
}

"use client";

import { QuizQuestion } from "@/types";

import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

type QuestionCardProps = {
  question: QuizQuestion;
  currentAnswer: {
    selectedChoiceId?: string | null;
    textAnswer?: string | null;
  };
  onChoiceSelect: (choiceId: string) => void;
  onTextChange: (text: string) => void;
  disabled?: boolean;
};

export function QuestionCard({
  question,
  currentAnswer,
  onChoiceSelect,
  onTextChange,
  disabled = false,
}: QuestionCardProps) {
  return (
    <Card>
      <div className="mb-2 flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">{question.text}</h3>
        <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
          {question.points} marks
        </span>
      </div>

      {question.type === "FILL_BLANK" ? (
        <Input
          placeholder="Type your answer"
          value={currentAnswer.textAnswer ?? ""}
          onChange={(event) => onTextChange(event.target.value)}
          disabled={disabled}
        />
      ) : (
        <div className="space-y-2">
          {question.choices.map((choice) => {
            const checked = currentAnswer.selectedChoiceId === choice.id;
            return (
              <label
                key={choice.id}
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                  checked ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  className="h-4 w-4"
                  checked={checked}
                  onChange={() => onChoiceSelect(choice.id)}
                  disabled={disabled}
                />
                <span>{choice.text}</span>
              </label>
            );
          })}
        </div>
      )}
    </Card>
  );
}

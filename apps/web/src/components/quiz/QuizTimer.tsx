import { formatDuration } from "@/lib/utils";

type QuizTimerProps = {
  seconds: number;
  isWarning?: boolean;
};

export function QuizTimer({ seconds, isWarning = false }: QuizTimerProps) {
  return (
    <div
      className={`rounded-md px-3 py-2 text-sm font-semibold ${
        isWarning ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-700"
      }`}
      aria-live="polite"
    >
      Time left: {formatDuration(seconds)}
    </div>
  );
}

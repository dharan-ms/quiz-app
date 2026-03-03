import clsx, { ClassValue } from "clsx";

export function cn(...values: ClassValue[]) {
  return clsx(values);
}

export function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function difficultyBadgeColor(difficulty: "EASY" | "MEDIUM" | "HARD") {
  if (difficulty === "EASY") return "bg-emerald-100 text-emerald-700";
  if (difficulty === "MEDIUM") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

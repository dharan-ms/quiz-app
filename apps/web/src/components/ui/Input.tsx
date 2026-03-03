"use client";

import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, label, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name;

  return (
    <div className="space-y-1">
      {label ? (
        <label className="text-sm font-medium text-slate-700" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <input
        id={fieldId}
        ref={ref}
        className={cn(
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-200 transition focus:ring-2",
          error ? "border-rose-400" : "",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
});

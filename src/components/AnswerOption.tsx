import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

export type AnswerState = "idle" | "correct" | "wrong" | "muted";

const STATE_STYLES: Record<AnswerState, string> = {
  idle: "bg-white/55 border-white/70 hover:bg-white/80 hover:-translate-y-0.5",
  correct: "bg-emerald-500/15 border-emerald-500/40",
  wrong: "bg-rose-500/12 border-rose-500/40",
  muted: "bg-white/35 border-white/50 opacity-60",
};

export function AnswerOption({
  letter,
  children,
  state = "idle",
  onClick,
  disabled = false,
}: {
  letter: string;
  children: ReactNode;
  state?: AnswerState;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Option ${letter}`}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left backdrop-blur-md transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/60 focus-visible:outline-none",
        STATE_STYLES[state],
        disabled && "pointer-events-none",
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-xl text-sm font-bold",
          state === "correct"
            ? "bg-emerald-500 text-white"
            : state === "wrong"
              ? "bg-rose-500 text-white"
              : "bg-white/80 text-slate-700",
        )}
        aria-hidden="true"
      >
        {letter}
      </span>
      <span className="flex-1 text-sm leading-6 font-medium text-slate-800">
        {children}
      </span>
      {state === "correct" ? (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
          <Check className="size-4" aria-hidden="true" />
          <span className="sr-only">Correct answer: </span>
        </span>
      ) : null}
      {state === "wrong" ? (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Your answer, incorrect: </span>
        </span>
      ) : null}
    </button>
  );
}

import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";
import { Heart, Timer } from "lucide-react";
import type { ReactNode } from "react";

export interface QuestionCardProps {
  index: number;
  total: number;
  prompt: ReactNode;
  children: ReactNode;
  timerSeconds?: number | null;
  lives?: number | null;
  xpAvailable?: number | null;
  className?: string;
}

export function QuestionCard({
  index,
  total,
  prompt,
  children,
  timerSeconds = null,
  lives = null,
  xpAvailable = null,
  className,
}: QuestionCardProps) {
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  const urgent = timerSeconds !== null && timerSeconds <= 5;

  return (
    <GlassCard
      tone="strong"
      className={cn("flex flex-col gap-5 p-5 sm:p-6", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold tracking-[0.14em] text-indigo-600 uppercase">
          Question {String(index + 1).padStart(2, "0")} / {total}
        </p>
        <div className="flex items-center gap-3 text-sm">
          {timerSeconds !== null ? (
            <span
              className={cn(
                "glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tabular-nums",
                urgent ? "text-rose-600" : "text-slate-700",
              )}
              aria-label={`${timerSeconds} seconds left`}
            >
              <Timer
                className={cn(
                  "size-3.5",
                  urgent ? "text-rose-500" : "text-slate-400",
                )}
                aria-hidden="true"
              />
              {timerSeconds}s
            </span>
          ) : null}
          {lives !== null ? (
            <span
              className="glass-chip inline-flex items-center gap-1 rounded-full px-3 py-1"
              aria-label={`${lives} lives left`}
            >
              {[0, 1, 2].map((heart) => (
                <Heart
                  key={heart}
                  className={cn(
                    "size-3.5",
                    heart < lives
                      ? "fill-rose-400 text-rose-500"
                      : "text-slate-300",
                  )}
                  aria-hidden="true"
                />
              ))}
            </span>
          ) : null}
          {xpAvailable !== null ? (
            <span className="glass-chip rounded-full px-3 py-1 text-xs font-bold text-indigo-600">
              +{xpAvailable} XP
            </span>
          ) : null}
        </div>
      </div>

      <ProgressBar value={progress} size="sm" />

      <div className="text-lg leading-7 font-bold text-slate-900">{prompt}</div>
      {children}
    </GlassCard>
  );
}

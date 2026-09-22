import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import { AlertTriangle, Loader2, Mic, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-center",
        className,
      )}
    >
      <span className="glass-chip grid size-11 place-items-center rounded-2xl">
        <Loader2
          className="size-5 animate-spin text-indigo-500"
          aria-hidden="true"
        />
      </span>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  actionLabel = "Retry",
  onAction,
  secondary,
  icon,
  className,
}: {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondary?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <GlassCard
      className={cn("flex flex-col items-center gap-3 p-6 text-center", className)}
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-rose-500/12 text-rose-600">
        {icon ?? <AlertTriangle className="size-6" aria-hidden="true" />}
      </span>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="max-w-sm text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {onAction ? (
          <Button
            type="button"
            onClick={onAction}
            className="gap-2 rounded-full bg-brand text-white shadow-sm hover:opacity-95"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            {actionLabel}
          </Button>
        ) : null}
        {secondary}
      </div>
    </GlassCard>
  );
}

/** Shown when the browser has no speech recognition support at all. */
export function SpeechUnsupportedState({
  onType,
  className,
}: {
  onType?: () => void;
  className?: string;
}) {
  return (
    <ErrorState
      className={className}
      icon={<Mic className="size-6" aria-hidden="true" />}
      title="Speech recognition isn't supported in this browser"
      message="You can still practice: type your answer and the coach will respond and correct it just the same."
      actionLabel="Type my answer instead"
      onAction={onType}
    />
  );
}

export function EmptyState({
  emoji = "✨",
  title,
  message,
  actionLabel,
  onAction,
  className,
}: {
  emoji?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <GlassCard
      className={cn("flex flex-col items-center gap-3 p-8 text-center", className)}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="max-w-sm text-sm leading-6 text-slate-600">{message}</p>
      {onAction && actionLabel ? (
        <Button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-full bg-brand text-white"
        >
          {actionLabel}
        </Button>
      ) : null}
    </GlassCard>
  );
}

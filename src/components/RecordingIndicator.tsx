import { cn } from "@/lib/utils";

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const BARS = [0, 1, 2, 3, 4, 5, 6, 7];

export function RecordingIndicator({
  seconds,
  targetSeconds,
  interim,
  className,
}: {
  seconds: number;
  targetSeconds: number;
  interim?: string;
  className?: string;
}) {
  const reachedTarget = seconds >= targetSeconds;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "glass flex w-full max-w-md flex-col items-center gap-3 rounded-3xl p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex size-3" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400/70" />
          <span className="relative inline-flex size-3 rounded-full bg-rose-500" />
        </span>
        <p className="text-sm font-bold text-rose-600">Recording...</p>
        <p className="text-sm font-semibold tabular-nums text-slate-600">
          {formatSeconds(seconds)} / {formatSeconds(targetSeconds)}
        </p>
      </div>

      <div className="flex h-8 items-end gap-1" aria-hidden="true">
        {BARS.map((bar) => (
          <span
            key={bar}
            className={cn(
              "w-1.5 rounded-full bg-gradient-to-t from-rose-400 to-indigo-400",
              "animate-pulse",
            )}
            style={{
              height: `${8 + ((bar * 7) % 18)}px`,
              animationDelay: `${bar * 0.12}s`,
              animationDuration: "1.1s",
            }}
          />
        ))}
      </div>

      <p className="text-center text-xs text-slate-500">
        {reachedTarget
          ? "Great length! You can stop and send your answer."
          : "Keep talking — short, complete sentences work best."}
      </p>

      {interim ? (
        <p className="max-h-20 w-full overflow-y-auto rounded-2xl bg-white/60 p-3 text-sm text-slate-600 italic">
          {interim}
        </p>
      ) : null}
    </div>
  );
}

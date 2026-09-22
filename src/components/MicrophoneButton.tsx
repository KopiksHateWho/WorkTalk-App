import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, Square } from "lucide-react";

export type MicState = "idle" | "listening" | "processing" | "disabled";

export function MicrophoneButton({
  state,
  onToggle,
  className,
}: {
  state: MicState;
  onToggle: () => void;
  className?: string;
}) {
  const listening = state === "listening";
  const processing = state === "processing";
  const disabled = state === "disabled" || processing;

  const label = listening
    ? "Stop recording your answer"
    : processing
      ? "Processing your speech"
      : "Start speaking your answer";

  return (
    <div className={cn("relative grid place-items-center", className)}>
      {listening ? (
        <>
          <span
            aria-hidden="true"
            className="animate-pulse-ring absolute size-24 rounded-full bg-rose-400/40"
          />
          <span
            aria-hidden="true"
            className="animate-pulse-ring absolute size-24 rounded-full bg-rose-400/30 [animation-delay:0.6s]"
          />
        </>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={label}
        title={label}
        className={cn(
          "relative grid size-24 place-items-center rounded-full border text-white shadow-lg transition-all duration-200",
          "focus-visible:ring-4 focus-visible:ring-indigo-300 focus-visible:outline-none",
          "min-h-[88px] min-w-[88px] touch-manipulation",
          listening
            ? "border-rose-200/70 bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/40"
            : "border-white/60 bg-gradient-to-br from-indigo-600 to-blue-500 hover:scale-[1.03]",
          state === "disabled" &&
            "border-slate-200 bg-slate-300 text-slate-500 shadow-none",
          processing && "from-indigo-400 to-blue-400",
        )}
      >
        {processing ? (
          <Loader2 className="size-9 animate-spin" aria-hidden="true" />
        ) : listening ? (
          <Square className="size-8 fill-white" aria-hidden="true" />
        ) : state === "disabled" ? (
          <MicOff className="size-9" aria-hidden="true" />
        ) : (
          <Mic className="size-9" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

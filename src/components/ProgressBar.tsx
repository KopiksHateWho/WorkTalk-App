import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  className?: string;
  label?: string;
  /** Text shown on the right of the label row. */
  valueLabel?: string;
  size?: "sm" | "md" | "lg";
  tone?: "cool" | "teal" | "amber";
}

const SIZES = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
} as const;

const TONES = {
  cool: "from-indigo-700 via-indigo-500 to-sky-500",
  teal: "from-emerald-700 via-emerald-500 to-teal-400",
  amber: "from-amber-500 via-amber-400 to-amber-300",
} as const;

export function ProgressBar({
  value,
  className,
  label,
  valueLabel,
  size = "md",
  tone = "cool",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn("w-full", className)}>
      {(label || valueLabel) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-slate-600">
          {label ? <span>{label}</span> : <span className="sr-only">Progress</span>}
          {valueLabel ? <span className="tabular-nums">{valueLabel}</span> : null}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label ?? "Progress"}
        className={cn(
          "glass-inset w-full overflow-hidden rounded-full",
          SIZES[size],
          className,
        )}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out",
            TONES[tone],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}

export function StatsCard({
  icon,
  label,
  value,
  hint,
  className,
}: StatsCardProps) {
  return (
    <GlassCard className={cn("flex items-center gap-3 p-4", className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/70 text-indigo-600 shadow-sm">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <p className="text-lg leading-tight font-bold text-slate-900">{value}</p>
        {hint ? (
          <p className="truncate text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    </GlassCard>
  );
}

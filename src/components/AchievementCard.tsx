import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export function AchievementCard({
  emoji,
  title,
  description,
  requirement,
  unlocked,
  className,
}: {
  emoji: string;
  title: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  className?: string;
}) {
  return (
    <GlassCard
      className={cn(
        "flex items-start gap-3 p-4",
        !unlocked && "opacity-80",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-2xl text-xl shadow-sm",
          unlocked
            ? "bg-gradient-to-br from-amber-200/90 to-amber-50 text-slate-900"
            : "bg-white/60 grayscale",
        )}
        aria-hidden="true"
      >
        {unlocked ? emoji : <Lock className="size-5 text-slate-400" />}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
              unlocked
                ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-700"
                : "border-slate-300/70 bg-white/60 text-slate-500",
            )}
          >
            {unlocked ? "Unlocked" : "Locked"}
          </span>
        </div>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          {unlocked ? description : requirement}
        </p>
      </div>
    </GlassCard>
  );
}

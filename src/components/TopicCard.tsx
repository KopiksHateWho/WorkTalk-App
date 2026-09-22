import { DifficultyBadge, Chip, LevelPill } from "@/components/Badges";
import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Star } from "lucide-react";
import { Link } from "react-router";
import type { EnglishLevel } from "@/types/learner";

export interface TopicCardProps {
  emoji: string;
  title: string;
  blurb: string;
  level: EnglishLevel;
  difficulty: string;
  minutes: number;
  xp: number;
  sessions?: number;
  bestScore?: number | null;
  completed?: boolean;
  href: string;
  ctaLabel?: string;
  className?: string;
}

export function TopicCard({
  emoji,
  title,
  blurb,
  level,
  difficulty,
  minutes,
  xp,
  sessions = 0,
  bestScore = null,
  completed = false,
  href,
  ctaLabel = "Start speaking",
  className,
}: TopicCardProps) {
  const progressPct = completed ? 100 : Math.min(60, sessions * 25);

  return (
    <GlassCard
      interactive
      className={cn("flex h-full flex-col gap-4 p-5", className)}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/75 text-2xl shadow-sm"
          aria-hidden="true"
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            {title}
            {completed ? (
              <CheckCircle2
                className="size-4 text-emerald-500"
                aria-label="Topic completed"
              />
            ) : null}
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">{blurb}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LevelPill level={level} />
        <DifficultyBadge difficulty={difficulty} />
        <Chip>
          <Clock className="size-3.5 text-slate-400" aria-hidden="true" />
          {minutes} min
        </Chip>
        <Chip>
          <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
          +{xp} XP
        </Chip>
      </div>

      <ProgressBar
        label={sessions > 0 ? `${sessions} conversation(s)` : "Not started"}
        valueLabel={bestScore !== null ? `Best ${bestScore}%` : undefined}
        value={progressPct}
        size="sm"
        tone={completed ? "teal" : "cool"}
      />

      <Link
        to={href}
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-auto w-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:opacity-95",
        )}
      >
        {ctaLabel}
        <span className="sr-only"> — {title}</span>
      </Link>
    </GlassCard>
  );
}

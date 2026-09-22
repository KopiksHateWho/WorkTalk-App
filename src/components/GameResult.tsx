import { AchievementCard } from "@/components/AchievementCard";
import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, RotateCcw, Star, XCircle } from "lucide-react";
import { Link } from "react-router";
import type { ActivityResultSummary } from "@/types/learner";

export function GameResult({
  emoji,
  title,
  correct,
  total,
  summary,
  onPlayAgain,
  backHref = "/games",
  backLabel = "Back to games",
}: {
  emoji: string;
  title: string;
  correct: number;
  total: number;
  summary: ActivityResultSummary;
  onPlayAgain: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  const wrong = Math.max(0, total - correct);
  const headline =
    summary.score >= 90
      ? "Outstanding! 🏆"
      : summary.score >= 70
        ? "Well done! 🎉"
        : summary.score >= 40
          ? "Good effort! 💪"
          : "Keep going — every round counts 🌱";

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard tone="strong" className="flex flex-col items-center gap-4 p-6">
          <span className="text-4xl" aria-hidden="true">
            {emoji}
          </span>
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.14em] text-indigo-600 uppercase">
              {title}
            </p>
            <h2 className="mt-1 text-2xl text-slate-900">
              {headline}
            </h2>
          </div>

          <p className="text-5xl font-extrabold tabular-nums text-slate-900">
            {summary.score}%
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {correct} correct
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1 font-semibold text-slate-600">
              <XCircle className="size-4" aria-hidden="true" />
              {wrong} to review
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-400/20 px-3 py-1 font-bold text-amber-800">
              <Star className="size-4 fill-amber-400 text-amber-500" aria-hidden="true" />
              +{summary.xpEarned} XP
            </span>
          </div>

          <div className="w-full max-w-sm">
            <ProgressBar
              label={`Level ${summary.level.level} · ${summary.level.title}`}
              valueLabel={`${summary.xp.toLocaleString()} XP`}
              value={summary.level.progressPct}
            />
          </div>

          {summary.leveledUp ? (
            <p className="rounded-full border border-indigo-500/30 bg-indigo-500/12 px-4 py-1.5 text-sm font-bold text-indigo-700">
              🎉 Level up! You reached level {summary.level.level} —{" "}
              {summary.level.title}
            </p>
          ) : null}
        </GlassCard>
      </motion.div>

      {summary.newAchievements.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {summary.newAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              emoji={achievement.emoji}
              title={achievement.title}
              description={achievement.description}
              requirement={achievement.requirement}
              unlocked
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onPlayAgain}
          className="gap-2 rounded-full border-white/80 bg-white/70 text-slate-700"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Play again
        </Button>
        <Button
          asChild
          size="lg"
          className="gap-2 rounded-full bg-brand text-white"
        >
          <Link to={backHref}>
            {backLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

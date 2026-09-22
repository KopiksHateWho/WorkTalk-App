import { AchievementCard } from "@/components/AchievementCard";
import { Chip, LevelBadge, StreakBadge, XPBadge } from "@/components/Badges";
import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { PageHeader, SectionTitle } from "@/components/SectionTitle";
import { LoadingState } from "@/components/states";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  Flame,
  Mic,
  Star,
  Zap,
} from "lucide-react";
import { Link } from "react-router";

function formatMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function Progress() {
  const stats = useQuery(api.progress.stats);

  if (stats === undefined) {
    return <LoadingState message="Loading your progress..." />;
  }

  if (stats === null) {
    return <LoadingState message="Preparing your stats..." />;
  }

  const { profile, level, totals, topics, recentActivity, achievements } = stats;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="My Progress"
        subtitle="Everything here comes from your real practice — no estimates, no invented scores."
      >
        <div className="flex flex-wrap gap-2">
          <LevelBadge level={level.level} title={level.title} />
          <XPBadge xp={profile.xp} />
          <StreakBadge streak={profile.streak} />
        </div>
      </PageHeader>

      <GlassCard tone="strong" className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-indigo-600 uppercase">
              Level {level.level}
            </p>
            <h2 className="text-xl font-extrabold text-slate-900">{level.title}</h2>
          </div>
          <p className="text-sm text-slate-600">
            {level.nextXp === null
              ? "Highest level reached 🎉"
              : `${level.xpToNext} XP to level ${level.level + 1}`}
          </p>
        </div>
        <ProgressBar
          label="Level progress"
          valueLabel={`${profile.xp.toLocaleString()} XP`}
          value={level.progressPct}
        />
      </GlassCard>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<BookOpen className="size-5" aria-hidden="true" />}
          label="Vocabulary"
          value={`${totals.wordsMastered} words`}
          hint={
            totals.vocabularyAverage !== null
              ? `${totals.vocabularyAverage}% average accuracy`
              : "Play a round to start tracking"
          }
        />
        <StatsCard
          icon={<Mic className="size-5" aria-hidden="true" />}
          label="Speaking"
          value={`${totals.speakingSessions} sessions`}
          hint={`${formatMinutes(totals.speechSeconds)} of speaking`}
        />
        <StatsCard
          icon={<Zap className="size-5" aria-hidden="true" />}
          label="Quiz"
          value={
            totals.quizAverage !== null ? `${totals.quizAverage}%` : "Not yet"
          }
          hint={`${totals.quizRounds} round(s) completed`}
        />
        <StatsCard
          icon={<Flame className="size-5" aria-hidden="true" />}
          label="Streak"
          value={`${profile.streak} day(s)`}
          hint={`Best: ${profile.bestStreak} day(s)`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle
          eyebrow="Career topics"
          title="Topic progress"
          description="Finish a conversation to mark a topic as completed."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <GlassCard key={topic.id} className="flex items-center gap-4 p-4">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/75 text-xl shadow-sm"
                aria-hidden="true"
              >
                {topic.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {topic.title}
                  </p>
                  {topic.completed ? (
                    <Chip className="border-emerald-500/30 bg-emerald-500/12 text-emerald-700">
                      Completed
                    </Chip>
                  ) : (
                    <Chip>New</Chip>
                  )}
                </div>
                <ProgressBar
                  className="mt-2"
                  size="sm"
                  value={topic.completed ? 100 : Math.min(60, topic.sessions * 25)}
                  tone={topic.completed ? "teal" : "cool"}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {topic.sessions} conversation(s)
                  {topic.bestScore !== null ? ` · best ${topic.bestScore}%` : ""}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SectionTitle eyebrow="Recent activity" title="Last 10 activities" />
          {recentActivity.length === 0 ? (
            <GlassCard className="flex flex-col items-center gap-3 p-6 text-center">
              <span className="text-3xl" aria-hidden="true">
                📈
              </span>
              <p className="text-sm leading-6 text-slate-600">
                You haven't completed a lesson yet. Your first speaking session
                takes about five minutes.
              </p>
              <Button
                asChild
                className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white"
              >
                <Link to="/speaking/session?mission=1">
                  Start your first lesson
                </Link>
              </Button>
            </GlassCard>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentActivity.map((activity) => (
                <li key={activity.id}>
                  <GlassCard className="flex items-center gap-3 p-3.5">
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-2xl text-base",
                        activity.kind === "speaking"
                          ? "bg-indigo-500/15"
                          : activity.kind === "vocabulary"
                            ? "bg-teal-500/15"
                            : "bg-amber-400/20",
                      )}
                      aria-hidden="true"
                    >
                      {activity.kind === "speaking"
                        ? "🎙️"
                        : activity.kind === "vocabulary"
                          ? "🎮"
                          : "⚡"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {activity.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.createdAt).toLocaleString(undefined, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {activity.score !== null ? ` · ${activity.score}%` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">
                      +{activity.xpEarned} XP
                    </span>
                  </GlassCard>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <SectionTitle eyebrow="Achievements" title="Badges to unlock" />
          <div className="grid gap-3">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                emoji={achievement.emoji}
                title={achievement.title}
                description={achievement.description}
                requirement={achievement.requirement}
                unlocked={achievement.unlocked}
              />
            ))}
          </div>
        </div>
      </section>

      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-4 text-amber-500" aria-hidden="true" />
            {profile.xp.toLocaleString()} XP total
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-indigo-500" aria-hidden="true" />
            {formatMinutes(totals.speechSeconds)} spoken
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="size-4 text-teal-600" aria-hidden="true" />
            {totals.wordsSeen} words practised
          </span>
        </div>
        <Button
          asChild
          className="w-fit gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white"
        >
          <Link to="/speaking">
            Continue learning
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </GlassCard>
    </div>
  );
}

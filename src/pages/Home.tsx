import { AchievementCard } from "@/components/AchievementCard";
import {
  Chip,
  LevelBadge,
  StreakBadge,
  XPBadge,
} from "@/components/Badges";
import { GameCard } from "@/components/GameCard";
import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionTitle, PageHeader } from "@/components/SectionTitle";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Flame,
  Mic,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Link } from "react-router";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const overview = useQuery(api.progress.overview);

  if (overview === undefined) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  if (overview === null) {
    return (
      <LoadingState message="Setting up your learner profile..." />
    );
  }

  const { profile, level, mission, achievements, recentActivity, continueLearning } =
    overview;
  const name = profile.displayName ?? "there";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${greeting()}, ${name}! 👋`}
        subtitle="Ready to practice English? Your daily mission is waiting below."
      >
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={level.level} title={level.title} />
          <XPBadge xp={profile.xp} />
          <StreakBadge streak={profile.streak} />
        </div>
      </PageHeader>

      {profile.isGuest ? (
        <GlassCard
          tone="subtle"
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm leading-6 text-slate-700">
            <span className="font-semibold">Guest progress may not be permanently saved.</span>{" "}
            Create an account whenever you want to keep your XP and streak.
          </p>
          <Button
            asChild
            className="w-fit rounded-full bg-brand text-white"
          >
            <Link to="/signup">Create account</Link>
          </Button>
        </GlassCard>
      ) : null}

      {/* Progress snapshot */}
      <GlassCard tone="strong" className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-indigo-600 uppercase">
              Level {level.level}
            </p>
            <h2 className="text-xl text-slate-900">{level.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip>
              <Sparkles className="size-3.5 text-indigo-500" aria-hidden="true" />
              {overview.todayXp} XP today
            </Chip>
            <Chip>
              <Flame className="size-3.5 text-orange-500" aria-hidden="true" />
              {profile.bestStreak} day best streak
            </Chip>
          </div>
        </div>

        <ProgressBar
          label="Progress to next level"
          valueLabel={
            level.nextXp === null
              ? `${profile.xp} XP · max level`
              : `${profile.xp.toLocaleString()} / ${level.nextXp.toLocaleString()} XP`
          }
          value={level.progressPct}
          tone="cool"
        />
        <p className="text-xs text-slate-500">
          {level.nextXp === null
            ? "You reached the highest level — keep practicing to stay sharp."
            : `${level.xpToNext} XP to the next level. One speaking session earns up to 140 XP.`}
        </p>
      </GlassCard>

      {/* Daily mission — the must-have */}
      <section aria-labelledby="daily-mission" className="flex flex-col gap-3">
        <SectionTitle
          eyebrow="Today's mission"
          title="Speak for 30 seconds"
          description="One short conversation is all it takes. This is the fastest way to earn 100 XP today."
        />
        <GlassCard
          id="daily-mission"
          tone="strong"
          className="relative overflow-hidden p-5 sm:p-6"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-gradient-to-br from-indigo-300/35 to-transparent blur-3xl"
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid size-12 place-items-center rounded-2xl bg-brand-mark text-2xl shadow-sm"
                  aria-hidden="true"
                >
                  🎙️
                </span>
                <div>
                  <p className="flex items-center gap-2 text-base font-bold text-slate-900">
                    {mission.emoji} {mission.title}
                    <span className="rounded-full border border-amber-500/30 bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      +{mission.xp} XP
                    </span>
                  </p>
                  <p className="text-sm text-slate-600">{mission.description}</p>
                </div>
              </div>

              <ProgressBar
                label={
                  mission.completed
                    ? "Mission complete — great work!"
                    : "Speaking time today"
                }
                valueLabel={`${Math.min(mission.speechSeconds, mission.targetSeconds)}s / ${mission.targetSeconds}s`}
                value={mission.progressPct}
                tone={mission.completed ? "teal" : "amber"}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              {mission.completed ? (
                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-5 py-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Completed today
                </span>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="gap-2 rounded-full bg-brand text-white"
                >
                  <Link to="/speaking/session?mission=1">
                    <Mic className="size-4" aria-hidden="true" />
                    Start mission
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/80 bg-white/70 text-slate-700"
              >
                <Link to="/speaking">Choose another topic</Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Three core actions */}
      <section aria-labelledby="choose-activity" className="flex flex-col gap-3">
        <SectionTitle
          id="choose-activity"
          eyebrow="What do you want to do?"
          title="Pick your practice"
          description="Three ways to build career English. Start with speaking if you are not sure."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:row-span-2"
          >
            <GameCard
              featured
              tone="indigo"
              emoji="🎙️"
              title="Speaking practice"
              description="Talk with the AI coach, get your sentence corrected naturally, then try again. This is the heart of WorkTalk Quest."
              href="/speaking"
              ctaLabel="Start speaking"
              meta={
                <>
                  <Chip>
                    <Mic className="size-3.5 text-indigo-500" aria-hidden="true" />
                    Real conversation
                  </Chip>
                  <Chip>
                    <Sparkles className="size-3.5 text-indigo-500" aria-hidden="true" />
                    Sentence correction
                  </Chip>
                </>
              }
              className="h-full"
            />
          </motion.div>

          <GameCard
            tone="teal"
            emoji="🎮"
            title="Vocabulary game"
            description="Guess words and learn the English you will use at work."
            href="/games/vocabulary"
            ctaLabel="Play"
            meta={
              <>
                <Chip>
                  <BookOpen className="size-3.5 text-teal-600" aria-hidden="true" />
                  10 questions
                </Chip>
                <Chip>+10 XP each</Chip>
              </>
            }
          />

          <GameCard
            tone="amber"
            emoji="⚡"
            title="Quick quiz"
            description="Short workplace questions: choose the best response and learn why."
            href="/games/quiz"
            ctaLabel="Start quiz"
            meta={
              <>
                <Chip>
                  <Zap className="size-3.5 text-amber-500" aria-hidden="true" />
                  8 questions
                </Chip>
                <Chip>+20 XP each</Chip>
              </>
            }
          />
        </div>
      </section>

      {/* Continue learning */}
      {continueLearning ? (
        <section aria-labelledby="continue-learning" className="flex flex-col gap-3">
          <SectionTitle
            id="continue-learning"
            eyebrow="Continue learning"
            title="Pick up where you left off"
          />
          <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/75 text-xl shadow-sm"
                aria-hidden="true"
              >
                <Target className="size-5 text-indigo-600" />
              </span>
              <div>
                <p className="text-base font-bold text-slate-900">
                  {continueLearning.label}
                </p>
                <p className="text-sm text-slate-600">
                  {continueLearning.subtitle}
                </p>
              </div>
            </div>
            <Button
              asChild
              className="gap-2 rounded-full bg-brand text-white"
            >
              <Link to={continueLearning.href}>
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </GlassCard>
        </section>
      ) : null}

      {/* Recent activity or empty state */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SectionTitle eyebrow="Recent activity" title="Your latest practice" />
          {recentActivity.length === 0 ? (
            <GlassCard className="flex flex-col items-center gap-3 p-8 text-center">
              <span className="text-3xl" aria-hidden="true">
                🌱
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                You haven't completed a lesson yet
              </h3>
              <p className="max-w-xs text-sm leading-6 text-slate-600">
                Start with one speaking conversation — the coach guides you the
                whole way.
              </p>
              <Button
                asChild
                className="mt-1 rounded-full bg-brand text-white"
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
                        {new Date(activity.createdAt).toLocaleDateString(
                          undefined,
                          { day: "numeric", month: "short" },
                        )}
                        {activity.score !== null
                          ? ` · ${activity.score}%`
                          : ""}
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
          <SectionTitle
            eyebrow="Achievements"
            title="Your badges"
            action={
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-sm text-slate-600"
              >
                <Link to="/progress">
                  View all
                  <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {achievements.slice(0, 4).map((achievement) => (
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
          <GlassCard className="flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-2xl bg-white/70 text-indigo-600 shadow-sm">
              <CalendarCheck className="size-5" aria-hidden="true" />
            </span>
            <p className="text-sm leading-6 text-slate-600">
              <span className="font-semibold text-slate-800">
                {profile.speakingSessions}
              </span>{" "}
              speaking session(s) finished ·{" "}
              <span className="font-semibold text-slate-800">
                {profile.wordsMastered}
              </span>{" "}
              words mastered
            </p>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}

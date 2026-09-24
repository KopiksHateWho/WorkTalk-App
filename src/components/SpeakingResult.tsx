import { AchievementCard } from "@/components/AchievementCard";
import { Chip } from "@/components/Badges";
import { FeedbackCard } from "@/components/FeedbackCard";
import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import type { SpeakingSummary } from "@/types/learner";

/**
 * End-of-session summary. Only real, measured numbers are shown: XP, speaking
 * seconds, words per answer and progress to the next level. Everything else is
 * qualitative feedback — no invented pronunciation or fluency scores.
 */
export function SpeakingResult({
  summary,
  topicTitle,
  onPracticeAgain,
  onContinue,
}: {
  summary: SpeakingSummary;
  topicTitle: string;
  onPracticeAgain: () => void;
  onContinue: () => void;
}) {
  const firstCorrection = summary.corrections[0];

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <GlassCard tone="strong" className="relative overflow-hidden p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-gradient-to-br from-amber-300/40 to-transparent blur-3xl"
          />
          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold tracking-[0.14em] text-indigo-600 uppercase">
                {topicTitle}
              </p>
              <h1 className="text-2xl text-slate-900 sm:text-3xl">
                Your speaking result 🎉
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                You finished {summary.userTurns} answer(s) and spoke for about{" "}
                {summary.speechSeconds} seconds.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="glass-subtle flex items-center gap-3 rounded-2xl p-3">
                <span className="grid size-9 place-items-center rounded-xl bg-white/70">
                  <Star
                    className="size-4 fill-amber-400 text-amber-500"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    XP earned
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    +{summary.xpEarned}
                  </p>
                </div>
              </div>
              <div className="glass-subtle flex items-center gap-3 rounded-2xl p-3">
                <span className="grid size-9 place-items-center rounded-xl bg-white/70">
                  <BookOpen className="size-4 text-indigo-600" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Words per answer
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {summary.averageWordsPerTurn}
                  </p>
                </div>
              </div>
              <div className="glass-subtle flex items-center gap-3 rounded-2xl p-3">
                <span className="grid size-9 place-items-center rounded-xl bg-white/70">
                  <Sparkles className="size-4 text-teal-600" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Total XP
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {summary.xp.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <ProgressBar
              label={`Level ${summary.level.level} · ${summary.level.title}`}
              valueLabel={
                summary.level.nextXp === null
                  ? "Max level"
                  : `${summary.xp} / ${summary.level.nextXp} XP`
              }
              value={summary.level.progressPct}
            />

            <div className="flex flex-wrap gap-2">
              {summary.leveledUp ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Level up! You reached level {summary.level.level}
                </span>
              ) : null}
              {summary.mission?.completedNow ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Daily mission complete · +{summary.mission.xpAwarded} XP
                </span>
              ) : null}
              <Chip>
                <Target className="size-3.5 text-slate-400" aria-hidden="true" />
                {summary.coachSource === "ai"
                  ? "AI coach conversation"
                  : "Practice-mode conversation"}
              </Chip>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {summary.feedback ? (
        <section className="flex flex-col gap-3">
          <SectionTitle
            eyebrow="Feedback"
            title="How your speaking went"
            description="Qualitative notes based on your transcript — WorkTalk Quest never invents scores."
          />
          <FeedbackCard feedback={summary.feedback} />
        </section>
      ) : null}

      {firstCorrection ? (
        <section className="flex flex-col gap-3">
          <SectionTitle
            eyebrow="Suggested improvement"
            title="One sentence to make stronger"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassCard className="p-4">
              <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                Your sentence
              </p>
              <p className="mt-1 text-sm text-slate-700 italic">
                “{firstCorrection.original}”
              </p>
            </GlassCard>
            <GlassCard className="border-emerald-500/25 bg-emerald-500/10 p-4">
              <p className="text-xs font-bold tracking-[0.12em] text-emerald-700 uppercase">
                Try
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                “{firstCorrection.corrected}”
              </p>
            </GlassCard>
          </div>
          <p className="text-sm text-slate-600">{firstCorrection.explanation}</p>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="flex flex-col gap-3 p-5">
          <h3 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
            Vocabulary you used
          </h3>
          {summary.vocabularyUsed.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {summary.vocabularyUsed.map((word) => (
                <Chip key={word} className="border-emerald-500/25 bg-emerald-500/12">
                  {word}
                </Chip>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              No topic words appeared in your answers yet. Try weaving in one or
              two of these next time.
            </p>
          )}
          {summary.practiceWords.length > 0 ? (
            <>
              <h3 className="mt-2 text-sm font-bold tracking-wide text-slate-500 uppercase">
                Pronunciation practice
              </h3>
              <div className="flex flex-wrap gap-2">
                {summary.practiceWords.map((word) => (
                  <Chip key={word}>{word}</Chip>
                ))}
              </div>
              <p className="text-sm text-slate-600">
                Say each word slowly three times, then use it inside a full
                sentence.
              </p>
            </>
          ) : null}
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 p-5">
          <h3 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
            What to do next
          </h3>
          <ul className="flex flex-col gap-2 text-sm leading-6 text-slate-600">
            <li className="flex gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              Read each correction out loud twice.
            </li>
            <li className="flex gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              Repeat this topic and aim for longer answers.
            </li>
            <li className="flex gap-2">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              Keep your streak alive tomorrow for another +100 XP mission.
            </li>
          </ul>
        </GlassCard>
      </section>

      {summary.newAchievements.length > 0 ? (
        <section className="flex flex-col gap-3">
          <SectionTitle eyebrow="Unlocked" title="New achievements 🏅" />
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
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onPracticeAgain}
          className="gap-2 rounded-full border-white/80 bg-white/70 text-slate-700"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Practice again
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onContinue}
          className="gap-2 rounded-full bg-brand text-white"
        >
          Continue
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

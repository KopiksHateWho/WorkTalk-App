import { Chip } from "@/components/Badges";
import { GameCard } from "@/components/GameCard";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader, SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { BookOpen, Mic, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router";

export default function Games() {
  const overview = useQuery(api.progress.overview);
  const stats = useQuery(api.progress.stats);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Games & challenges"
        subtitle="Short, focused practice. Vocabulary and quizzes warm you up for the conversations that matter."
      >
        {stats ? (
          <div className="flex flex-wrap gap-2">
            <Chip>
              <BookOpen className="size-3.5 text-teal-600" aria-hidden="true" />
              {stats.totals.wordsMastered} words mastered
            </Chip>
            <Chip>
              <Zap className="size-3.5 text-amber-500" aria-hidden="true" />
              {stats.totals.quizAverage !== null
                ? `${stats.totals.quizAverage}% quiz average`
                : "No quiz yet"}
            </Chip>
          </div>
        ) : null}
      </PageHeader>

      <section className="flex flex-col gap-3">
        <SectionTitle
          eyebrow="Choose an activity"
          title="What do you want to play?"
          description="Every round updates your XP, streak and progress straight away."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <GameCard
            tone="teal"
            emoji="🎮"
            title="Vocabulary Game"
            description="Read the word, choose the meaning, and learn the example sentence. 10 questions per round with a timer and three lives."
            href="/games/vocabulary"
            ctaLabel="Play vocabulary"
            meta={
              <>
                <Chip>🟢 Basic &amp; 🟡 Intermediate</Chip>
                <Chip>+10 XP per correct</Chip>
              </>
            }
          />
          <GameCard
            tone="amber"
            emoji="⚡"
            title="Quick Quiz"
            description="Real workplace situations: pick the best response, complete the sentence, or handle a tricky customer."
            href="/games/quiz"
            ctaLabel="Start quick quiz"
            meta={
              <>
                <Chip>8 questions</Chip>
                <Chip>+20 XP per correct</Chip>
              </>
            }
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle
          eyebrow="Most important"
          title="Speaking is where you grow fastest"
          description="Games build the words. Conversations build the confidence."
        />
        <GlassCard
          tone="strong"
          className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-400 text-2xl shadow-sm"
              aria-hidden="true"
            >
              🎙️
            </span>
            <div>
              <p className="text-base font-bold text-slate-900">
                Speak with the AI coach
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {overview?.mission && !overview.mission.completed
                  ? `Today's mission is still open: speak for ${overview.mission.targetSeconds} seconds to earn ${overview.mission.xp} XP.`
                  : "Pick a career topic and hold a real multi-turn conversation."}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white"
          >
            <Link to="/speaking">
              <Mic className="size-4" aria-hidden="true" />
              Start speaking
            </Link>
          </Button>
        </GlassCard>
      </section>

      <GlassCard className="flex items-start gap-3 p-5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-indigo-500" aria-hidden="true" />
        <p className="text-sm leading-6 text-slate-600">
          Tip: play one vocabulary round, then immediately use those words in a
          speaking session. New words stick when you say them out loud.
        </p>
      </GlassCard>
    </div>
  );
}

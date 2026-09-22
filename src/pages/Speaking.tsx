import { AiModeBadge, Chip } from "@/components/Badges";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader, SectionTitle } from "@/components/SectionTitle";
import { LoadingState } from "@/components/states";
import { TopicCard } from "@/components/TopicCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { SPEAKING_TOPICS } from "@/convex/content/speaking";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Info, Mic, MicOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { EnglishLevel } from "@/types/learner";

export default function Speaking() {
  const overview = useQuery(api.progress.overview);
  const stats = useQuery(api.progress.stats);
  const aiStatus = useQuery(api.ai.status);
  const [levelOverride, setLevelOverride] = useState<EnglishLevel | null>(null);

  if (overview === undefined || stats === undefined) {
    return <LoadingState message="Loading conversation topics..." />;
  }

  const level: EnglishLevel =
    levelOverride ?? overview?.profile.englishLevel ?? "basic";
  const completed = new Set(
    stats?.topics.filter((topic) => topic.completed).map((topic) => topic.id) ?? [],
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Speaking practice"
        subtitle="Talk with the coach about real career situations. Every answer earns XP, and every mistake becomes a correction you can reuse."
      >
        <div className="flex flex-wrap items-center gap-2">
          <AiModeBadge aiEnabled={Boolean(aiStatus?.aiEnabled)} />
          <Chip>
            <Mic className="size-3.5 text-indigo-500" aria-hidden="true" />
            Speak out loud
          </Chip>
        </div>
      </PageHeader>

      {aiStatus && !aiStatus.aiEnabled ? (
        <GlassCard tone="subtle" className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-indigo-500" aria-hidden="true" />
          <p className="text-sm leading-6 text-slate-700">
            <span className="font-semibold">Practice mode is active.</span> No AI
            provider is connected to this project yet, so the coach follows the
            scripted questions for your topic and checks your sentences against
            common mistakes. Connect an AI key and the same conversation becomes
            fully adaptive — the flow stays identical.
          </p>
        </GlassCard>
      ) : null}

      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-indigo-600 uppercase">
            Difficulty
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {level === "basic"
              ? "Basic: short questions, hints and example phrases available."
              : "Intermediate: longer answers, workplace scenarios and less guidance."}
          </p>
        </div>
        <div
          className="flex w-full gap-1 rounded-full bg-white/60 p-1 sm:w-auto"
          role="group"
          aria-label="Choose difficulty"
        >
          {(["basic", "intermediate"] as EnglishLevel[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLevelOverride(option)}
              aria-pressed={level === option}
              className={cn(
                "min-h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors sm:flex-none",
                level === option
                  ? "bg-brand text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/70",
              )}
            >
              {option === "basic" ? "🟢 Basic" : "🟡 Intermediate"}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col gap-2 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Sparkles className="size-4 text-indigo-500" aria-hidden="true" />
          {level === "basic"
            ? "Example questions you will hear"
            : "Example intermediate questions"}
        </p>
        <ul className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
          {level === "basic" ? (
            <>
              <li>“What is your name?”</li>
              <li>“Where do you study?”</li>
              <li>“What are your hobbies?”</li>
              <li>“Tell me about yourself.”</li>
            </>
          ) : (
            <>
              <li>“Tell me about your strengths.”</li>
              <li>“Why do you want this job?”</li>
              <li>“How would you handle an angry customer?”</li>
              <li>“Describe a time you worked in a team.”</li>
            </>
          )}
        </ul>
      </GlassCard>

      <section className="flex flex-col gap-3">
        <SectionTitle
          eyebrow="Career topics"
          title="Choose a topic to practice"
          description="Each conversation takes about five minutes and ends with feedback you can act on."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPEAKING_TOPICS.map((topic) => {
            const progress = stats?.topics.find((item) => item.id === topic.id);
            return (
              <TopicCard
                key={topic.id}
                emoji={topic.emoji}
                title={topic.title}
                blurb={topic.blurb}
                level={level}
                difficulty={topic.difficulty}
                minutes={topic.minutes}
                xp={topic.xp}
                sessions={progress?.sessions ?? 0}
                bestScore={progress?.bestScore ?? null}
                completed={completed.has(topic.id)}
                href={`/speaking/session?topic=${topic.id}&level=${level}`}
              />
            );
          })}
        </div>
      </section>

      <GlassCard className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/70 text-slate-500">
            <MicOff className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-slate-600">
            Speaking practice needs microphone access. If your browser blocks it,
            you can still type your answer — the coach corrects it the same way.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="w-fit rounded-full border-white/80 bg-white/70 text-slate-700"
        >
          <Link to="/games">Not ready to speak? Play a game</Link>
        </Button>
      </GlassCard>
    </div>
  );
}

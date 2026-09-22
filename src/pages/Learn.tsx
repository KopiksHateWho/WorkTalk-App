import { Chip } from "@/components/Badges";
import { GlassCard } from "@/components/GlassCard";
import { PageHeader, SectionTitle } from "@/components/SectionTitle";
import { LoadingState } from "@/components/states";
import { TopicCard } from "@/components/TopicCard";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { SPEAKING_TOPICS } from "@/convex/content/speaking";
import { useQuery } from "convex/react";
import { BookOpen, Mic, Sparkles } from "lucide-react";
import { Link } from "react-router";

const BASIC_CONTENT = [
  "Greetings",
  "Self Introduction",
  "Education",
  "School",
  "Hobbies",
  "Interests",
  "Simple Workplace Vocabulary",
  "Asking for Help",
  "Simple Workplace Questions",
];

const INTERMEDIATE_CONTENT = [
  "Job Interview",
  "Work Experience",
  "Skills",
  "Strengths",
  "Weaknesses",
  "Workplace Problems",
  "Meetings",
  "Teamwork",
  "Customer Service",
  "Professional Communication",
  "Giving Opinions",
  "Making Requests",
];

export default function Learn() {
  const stats = useQuery(api.progress.stats);

  if (stats === undefined) {
    return <LoadingState message="Loading your career topics..." />;
  }

  const level = stats?.profile.englishLevel ?? "basic";

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Learn"
        subtitle="Eight career topics, one conversation at a time. Speaking is the main path — vocabulary and quizzes support it."
      >
        <div className="flex flex-wrap gap-2">
          <Chip>
            <Mic className="size-3.5 text-indigo-500" aria-hidden="true" />
            {stats?.totals.speakingSessions ?? 0} conversations
          </Chip>
          <Chip>
            <BookOpen className="size-3.5 text-teal-600" aria-hidden="true" />
            {stats?.totals.wordsMastered ?? 0} words mastered
          </Chip>
        </div>
      </PageHeader>

      <section className="flex flex-col gap-3">
        <SectionTitle
          eyebrow="Career topics"
          title="Your learning path"
          description="Finish a topic to make it count towards the Job Ready achievement."
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
                level={progress?.completed ? "intermediate" : level}
                difficulty={topic.difficulty}
                minutes={topic.minutes}
                xp={topic.xp}
                sessions={progress?.sessions ?? 0}
                bestScore={progress?.bestScore ?? null}
                completed={progress?.completed ?? false}
                href={`/speaking/session?topic=${topic.id}&level=${level}`}
              />
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              🟢
            </span>
            <h3 className="text-base font-bold text-slate-900">Basic content</h3>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Short questions, hints and example phrases. Perfect when you want to
            speak without long preparation.
          </p>
          <div className="flex flex-wrap gap-2">
            {BASIC_CONTENT.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
          <p className="text-sm text-slate-600 italic">
            “What is your name?” · “Where do you study?” · “Tell me about
            yourself.”
          </p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              🟡
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Intermediate content
            </h3>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Longer answers, workplace scenarios and fewer hints. The coach asks
            follow-up questions based on what you say.
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERMEDIATE_CONTENT.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
          <p className="text-sm text-slate-600 italic">
            “Tell me about your strengths.” · “How would you handle an angry
            customer?”
          </p>
        </GlassCard>
      </section>

      <GlassCard
        tone="strong"
        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <Sparkles
            className="mt-0.5 size-5 shrink-0 text-indigo-500"
            aria-hidden="true"
          />
          <p className="text-sm leading-6 text-slate-700">
            Not sure where to start? The self introduction topic works for every
            level and takes about five minutes.
          </p>
        </div>
        <Button
          asChild
          className="w-fit rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white"
        >
          <Link to="/speaking/session?topic=self-introduction">Start now</Link>
        </Button>
      </GlassCard>
    </div>
  );
}

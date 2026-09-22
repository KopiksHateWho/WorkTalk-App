import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, Lightbulb, PenLine, Sparkles } from "lucide-react";
import type { Correction, SpeakingFeedback } from "@/types/learner";

const CATEGORY_LABELS: Record<Correction["category"], string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  phrasing: "Phrasing",
  spelling: "Spelling",
};

/** Turns a mistake into a learning moment — never just "Wrong". */
export function CorrectionCard({
  correction,
  onTryAgain,
  tryAgainLabel = "Try again",
  className,
}: {
  correction: Correction;
  onTryAgain?: () => void;
  tryAgainLabel?: string;
  className?: string;
}) {
  const sameSentence = correction.corrected === correction.original;

  return (
    <GlassCard
      tone="strong"
      className={cn("flex flex-col gap-3 p-4 sm:p-5", className)}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-indigo-500" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-wide text-indigo-700 uppercase">
          {sameSentence ? "A more professional way" : "Let's improve your sentence"}
        </h3>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="glass-subtle rounded-2xl p-3">
          <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
            You said
          </p>
          <p className="text-sm leading-6 text-slate-700 italic">
            “{correction.original}”
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/12 p-3">
          <p className="mb-1 text-[11px] font-bold tracking-[0.12em] text-emerald-700 uppercase">
            {sameSentence ? "A natural alternative" : "A more natural way"}
          </p>
          <p className="text-sm leading-6 font-medium text-slate-800">
            “{correction.corrected}”
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl bg-white/50 p-3">
        <Lightbulb
          className="mt-0.5 size-4 shrink-0 text-amber-500"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            {CATEGORY_LABELS[correction.category]}
          </p>
          <p className="text-sm leading-6 text-slate-700">
            {correction.explanation}
          </p>
        </div>
      </div>

      {correction.tip ? (
        <p className="flex items-start gap-2 text-sm text-slate-600">
          <BookOpen
            className="mt-0.5 size-4 shrink-0 text-indigo-500"
            aria-hidden="true"
          />
          <span>
            <span className="font-semibold text-slate-700">
              Useful expression:{" "}
            </span>
            {correction.tip}
          </span>
        </p>
      ) : null}

      {onTryAgain ? (
        <Button
          type="button"
          variant="outline"
          onClick={onTryAgain}
          className="mt-1 w-full gap-2 rounded-full border-white/80 bg-white/70 text-slate-700 hover:bg-white sm:w-auto"
        >
          <PenLine className="size-4" aria-hidden="true" />
          {tryAgainLabel}
        </Button>
      ) : null}
    </GlassCard>
  );
}

const METRIC_ICONS = {
  grammar: PenLine,
  vocabulary: BookOpen,
  pronunciation: Sparkles,
  fluency: ArrowRight,
} as const;

/** Qualitative feedback only — no invented scores. */
export function FeedbackCard({
  feedback,
  className,
}: {
  feedback: SpeakingFeedback;
  className?: string;
}) {
  const entries: Array<{
    key: keyof SpeakingFeedback;
    title: string;
    line: { label: string; text: string };
  }> = [
    { key: "grammar", title: "Grammar", line: feedback.grammar },
    { key: "vocabulary", title: "Vocabulary", line: feedback.vocabulary },
    { key: "pronunciation", title: "Pronunciation", line: feedback.pronunciation },
    { key: "fluency", title: "Fluency", line: feedback.fluency },
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {entries.map((entry) => {
        const Icon = METRIC_ICONS[entry.key];
        return (
          <GlassCard key={entry.key} className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-white/70 text-indigo-600 shadow-sm">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
                {entry.title}
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">{entry.line.label}</p>
            <p className="text-sm leading-6 text-slate-600">{entry.line.text}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}

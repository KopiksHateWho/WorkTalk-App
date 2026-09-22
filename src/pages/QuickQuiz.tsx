import { AnswerOption } from "@/components/AnswerOption";
import { Chip, LevelPill } from "@/components/Badges";
import { GameResult } from "@/components/GameResult";
import { GlassCard } from "@/components/GlassCard";
import { QuestionCard } from "@/components/QuestionCard";
import { PageHeader } from "@/components/SectionTitle";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { QUIZ_TOPICS, pickQuizQuestions, type QuizQuestion } from "@/data/quiz";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Timer, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ActivityResultSummary, EnglishLevel } from "@/types/learner";

const QUESTIONS_PER_ROUND = 8;
const SECONDS_PER_QUESTION = 30;

type Phase = "setup" | "playing" | "result";

export default function QuickQuiz() {
  const overview = useQuery(api.progress.overview);
  const recordRound = useMutation(api.progress.recordQuizRound);

  const [phase, setPhase] = useState<Phase>("setup");
  const [topicId, setTopicId] = useState<string>("all");
  const [level, setLevel] = useState<EnglishLevel>("basic");
  const [levelTouched, setLevelTouched] = useState(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredTotal, setAnsweredTotal] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<ActivityResultSummary | null>(null);

  useEffect(() => {
    if (!levelTouched && overview?.profile.englishLevel) {
      setLevel(overview.profile.englishLevel);
    }
  }, [overview, levelTouched]);

  const locked = selected !== null;
  const question = questions[index];
  const topicLabel =
    QUIZ_TOPICS.find((topic) => topic.id === topicId)?.title ?? "Workplace English";

  const startRound = () => {
    setQuestions(
      pickQuizQuestions({ level, topicId, limit: QUESTIONS_PER_ROUND }),
    );
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setAnsweredTotal(0);
    setSummary(null);
    setSecondsLeft(SECONDS_PER_QUESTION);
    setPhase("playing");
  };

  const finishRound = async (finalCorrect: number, finalTotal: number) => {
    setSaving(true);
    try {
      const result = await recordRound({
        topicId,
        topicLabel,
        level,
        correct: finalCorrect,
        total: finalTotal,
      });
      setSummary(result as ActivityResultSummary);
      setPhase("result");
    } catch (error) {
      console.error("Saving quiz round failed:", error);
      toast.error("We couldn't save this quiz. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (locked || !question) return;
    setSelected(optionIndex);
    setAnsweredTotal((value) => value + 1);
    if (optionIndex === question.correctIndex) {
      setCorrectCount((value) => value + 1);
    }
  };

  useEffect(() => {
    if (phase !== "playing" || locked || !question) return;
    setSecondsLeft(SECONDS_PER_QUESTION);
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, index, locked, question]);

  useEffect(() => {
    if (phase !== "playing" || locked || !question) return;
    if (secondsLeft === 0) {
      setSelected(-1);
      setAnsweredTotal((value) => value + 1);
    }
  }, [secondsLeft, phase, locked, question]);

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      void finishRound(correctCount, answeredTotal);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setSecondsLeft(SECONDS_PER_QUESTION);
  };

  if (overview === undefined) {
    return <LoadingState message="Loading quiz questions..." />;
  }

  if (phase === "result" && summary) {
    return (
      <GameResult
        emoji="⚡"
        title={`${topicLabel} quick quiz`}
        correct={correctCount}
        total={answeredTotal}
        summary={summary}
        onPlayAgain={startRound}
      />
    );
  }

  if (phase === "setup") {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Quick quiz ⚡"
          subtitle="Real English in real situations: reply to your manager, handle a customer, finish a sentence. Choose the best answer and learn why it works."
        >
          <Chip>+20 XP per correct</Chip>
        </PageHeader>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900">1. Choose a theme</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => setTopicId("all")}
              aria-pressed={topicId === "all"}
              className={cn(
                "flex flex-col gap-1.5 rounded-3xl border p-4 text-left transition-all",
                topicId === "all"
                  ? "border-indigo-500/50 bg-indigo-500/12 shadow-sm"
                  : "border-white/70 bg-white/55 hover:bg-white/80",
              )}
            >
              <span className="text-2xl" aria-hidden="true">
                🎲
              </span>
              <span className="text-sm font-bold text-slate-900">Mixed</span>
              <span className="text-xs text-slate-600">
                A bit of everything — best for a quick warm-up.
              </span>
            </button>
            {QUIZ_TOPICS.map((topic) => {
              const active = topicId === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setTopicId(topic.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-3xl border p-4 text-left transition-all",
                    active
                      ? "border-indigo-500/50 bg-indigo-500/12 shadow-sm"
                      : "border-white/70 bg-white/55 hover:bg-white/80",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {topic.emoji}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {topic.title}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900">2. Choose difficulty</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            {(["basic", "intermediate"] as EnglishLevel[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setLevel(option);
                  setLevelTouched(true);
                }}
                aria-pressed={level === option}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-3xl border p-4 text-left transition-all",
                  level === option
                    ? "border-teal-500/50 bg-teal-500/12"
                    : "border-white/70 bg-white/55 hover:bg-white/80",
                )}
              >
                <LevelPill level={option} />
                <span className="text-sm text-slate-600">
                  {option === "basic"
                    ? "Simple replies and word meaning"
                    : "Scenario decisions and professional tone"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <Button
          type="button"
          size="lg"
          onClick={startRound}
          className="w-full gap-2 rounded-full bg-brand text-white sm:w-fit sm:px-10"
        >
          Start quiz
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  if (!question) return <LoadingState message="Preparing your questions..." />;

  const isCorrect = selected === question.correctIndex;
  const timedOut = selected === -1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader
        title="Quick Quiz ⚡"
        subtitle={`${topicLabel} · choose the best answer`}
      >
        <LevelPill level={level} />
      </PageHeader>

      <QuestionCard
        index={index}
        total={questions.length}
        timerSeconds={locked ? null : secondsLeft}
        xpAvailable={20}
        prompt={
          <span className="flex flex-col gap-3">
            {question.context ? (
              <span className="text-sm font-medium text-slate-500">
                {question.context}
              </span>
            ) : null}
            {question.quote ? (
              <span className="rounded-2xl bg-white/70 p-4 text-base font-semibold text-slate-800">
                “{question.quote}”
              </span>
            ) : null}
            <span>{question.prompt}</span>
          </span>
        }
      >
        <div className="grid gap-2.5">
          {question.options.map((option, optionIndex) => {
            const letter = String.fromCharCode(65 + optionIndex);
            const state = !locked
              ? "idle"
              : optionIndex === question.correctIndex
                ? "correct"
                : optionIndex === selected
                  ? "wrong"
                  : "muted";
            return (
              <AnswerOption
                key={option}
                letter={letter}
                state={state}
                disabled={locked}
                onClick={() => handleAnswer(optionIndex)}
              >
                {option}
              </AnswerOption>
            );
          })}
        </div>

        {locked ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "flex flex-col gap-3 rounded-3xl border p-4",
              isCorrect
                ? "border-emerald-500/30 bg-emerald-500/12"
                : "border-amber-500/30 bg-amber-400/15",
            )}
          >
            <p className="flex items-center gap-2 text-base font-extrabold text-slate-900">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
                  ✓ Correct!
                </>
              ) : timedOut ? (
                <>
                  <Timer className="size-5 text-amber-600" aria-hidden="true" />
                  Time's up! Here's the natural answer 😅
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-amber-600" aria-hidden="true" />
                  Almost! Here's the natural answer 😅
                </>
              )}
            </p>

            <p className="rounded-2xl bg-white/65 p-3 text-sm font-semibold text-slate-800">
              {question.options[question.correctIndex]}
            </p>
            <p className="text-sm leading-6 text-slate-700">
              {question.explanation}
            </p>
            {isCorrect ? (
              <p className="text-sm font-bold text-emerald-700">+20 XP</p>
            ) : null}

            <Button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="w-full gap-2 rounded-full bg-brand text-white sm:w-fit sm:px-8"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {index + 1 >= questions.length ? "See my result" : "Next question"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </motion.div>
        ) : null}
      </QuestionCard>

      <GlassCard className="flex items-center justify-between gap-3 p-4">
        <p className="text-xs text-slate-500">
          In a real conversation you can pause — here, speed keeps you sharp.
        </p>
        <span className="text-xs font-bold text-slate-600 tabular-nums">
          {correctCount} / {questions.length} correct
        </span>
      </GlassCard>
    </div>
  );
}

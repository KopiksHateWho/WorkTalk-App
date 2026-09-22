import { AnswerOption } from "@/components/AnswerOption";
import { Chip, LevelPill } from "@/components/Badges";
import { GameResult } from "@/components/GameResult";
import { GlassCard } from "@/components/GlassCard";
import { QuestionCard } from "@/components/QuestionCard";
import { PageHeader } from "@/components/SectionTitle";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  VOCAB_TOPICS,
  buildMeaningOptions,
  getVocabTopic,
  type VocabWord,
} from "@/data/vocabulary";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Timer, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ActivityResultSummary, EnglishLevel } from "@/types/learner";

const QUESTIONS_PER_ROUND = 10;
const LIVES = 3;

interface VocabQuestion {
  word: VocabWord;
  options: string[];
  correctIndex: number;
}

function buildRound(topicId: string): VocabQuestion[] {
  const topic = getVocabTopic(topicId) ?? VOCAB_TOPICS[0];
  const words = [...topic.words]
    .sort(() => Math.random() - 0.5)
    .slice(0, QUESTIONS_PER_ROUND);
  return words.map((word) => ({ word, ...buildMeaningOptions(word, topic) }));
}

type Phase = "setup" | "playing" | "result";

export default function VocabularyGame() {
  const overview = useQuery(api.progress.overview);
  const recordRound = useMutation(api.progress.recordVocabularyRound);

  const [phase, setPhase] = useState<Phase>("setup");
  const [topicId, setTopicId] = useState(VOCAB_TOPICS[0].id);
  const [level, setLevel] = useState<EnglishLevel>("basic");
  const [levelTouched, setLevelTouched] = useState(false);

  const [questions, setQuestions] = useState<VocabQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mastered, setMastered] = useState<string[]>([]);
  const [lives, setLives] = useState(LIVES);
  const [secondsLeft, setSecondsLeft] = useState(25);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<ActivityResultSummary | null>(null);
  const [answeredTotal, setAnsweredTotal] = useState(0);

  useEffect(() => {
    if (!levelTouched && overview?.profile.englishLevel) {
      setLevel(overview.profile.englishLevel);
    }
  }, [overview, levelTouched]);

  const timerSeconds = level === "basic" ? 25 : 18;
  const locked = selected !== null;
  const question = questions[index];
  const topic = getVocabTopic(topicId) ?? VOCAB_TOPICS[0];

  const finishRound = useCallback(
    async (finalCorrect: number, finalTotal: number, masteredIds: string[]) => {
      setSaving(true);
      try {
        const result = await recordRound({
          topicId,
          topicLabel: topic.title,
          level,
          correct: finalCorrect,
          total: finalTotal,
          masteredWordIds: masteredIds,
        });
        setSummary(result as ActivityResultSummary);
        setPhase("result");
      } catch (error) {
        console.error("Saving vocabulary round failed:", error);
        toast.error("We couldn't save this round. Check your connection.");
      } finally {
        setSaving(false);
      }
    },
    [level, recordRound, topic.title, topicId],
  );

  const startRound = () => {
    setQuestions(buildRound(topicId));
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setMastered([]);
    setLives(LIVES);
    setAnsweredTotal(0);
    setSummary(null);
    setSecondsLeft(level === "basic" ? 25 : 18);
    setPhase("playing");
  };

  const handleAnswer = (optionIndex: number) => {
    if (locked || !question) return;
    setSelected(optionIndex);
    setAnsweredTotal((value) => value + 1);

    if (optionIndex === question.correctIndex) {
      setCorrectCount((value) => value + 1);
      setMastered((current) =>
        current.includes(question.word.id)
          ? current
          : [...current, question.word.id],
      );
    } else {
      setLives((value) => Math.max(0, value - 1));
    }
  };

  // Per-question timer. Running out reveals the answer instead of failing silently.
  useEffect(() => {
    if (phase !== "playing" || locked || !question) return;
    setSecondsLeft(timerSeconds);
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, index, locked, question, timerSeconds]);

  useEffect(() => {
    if (phase !== "playing" || locked || !question) return;
    if (secondsLeft === 0) {
      setSelected(-1);
      setAnsweredTotal((value) => value + 1);
      setLives((value) => Math.max(0, value - 1));
    }
  }, [secondsLeft, phase, locked, question]);

  const handleNext = () => {
    const isLastQuestion = index + 1 >= questions.length;
    const isLastLife = lives === 0;
    if (isLastQuestion || isLastLife) {
      void finishRound(correctCount, answeredTotal, mastered);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setSecondsLeft(timerSeconds);
  };

  if (overview === undefined) {
    return <LoadingState message="Loading your vocabulary deck..." />;
  }

  if (phase === "result" && summary) {
    return (
      <GameResult
        emoji="🎮"
        title={`${topic.emoji} ${topic.title} vocabulary`}
        correct={correctCount}
        total={answeredTotal}
        summary={summary}
        onPlayAgain={() => {
          setPhase("setup");
          startRound();
        }}
      />
    );
  }

  if (phase === "setup") {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Vocabulary Game 🎮"
          subtitle="Guess the meaning of real workplace words. Ten questions, three lives, and every mistake comes with an example sentence."
        >
          <Chip>+10 XP per correct</Chip>
        </PageHeader>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            1. Choose a topic
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VOCAB_TOPICS.map((item) => {
              const active = item.id === topicId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTopicId(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-3xl border p-4 text-left transition-all",
                    active
                      ? "border-indigo-500/50 bg-indigo-500/12 shadow-sm"
                      : "border-white/70 bg-white/55 hover:bg-white/80",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-600">{item.description}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {item.words.length} words
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900">
            2. Choose difficulty
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            {(["basic", "intermediate"] as EnglishLevel[]).map((option) => {
              const active = level === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setLevel(option);
                    setLevelTouched(true);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-3xl border p-4 text-left transition-all",
                    active
                      ? "border-teal-500/50 bg-teal-500/12"
                      : "border-white/70 bg-white/55 hover:bg-white/80",
                  )}
                >
                  <LevelPill level={option} />
                  <span className="text-sm text-slate-600">
                    {option === "basic"
                      ? "25 seconds per question"
                      : "18 seconds per question"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <Button
          type="button"
          size="lg"
          onClick={startRound}
          className="w-full gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white sm:w-fit sm:px-10"
        >
          Play
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  if (!question) return <LoadingState message="Preparing your words..." />;

  const isCorrect = selected === question.correctIndex;
  const timedOut = selected === -1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader
        title={`${topic.emoji} ${topic.title}`}
        subtitle="What does each word mean? Choose the best answer."
      >
        <LevelPill level={level} />
      </PageHeader>

      <QuestionCard
        index={index}
        total={questions.length}
        lives={lives}
        timerSeconds={locked ? null : secondsLeft}
        xpAvailable={10}
        prompt={
          <span>
            What does this word mean?
            <span className="mt-3 block rounded-2xl bg-white/70 px-4 py-3 text-center text-2xl font-extrabold tracking-wide text-indigo-700 uppercase">
              {question.word.word}
            </span>
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
                  🎉 Correct!
                </>
              ) : timedOut ? (
                <>
                  <Timer className="size-5 text-amber-600" aria-hidden="true" />
                  Time's up! Let's look at it together 😅
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-amber-600" aria-hidden="true" />
                  Almost! Let's learn it properly 😅
                </>
              )}
            </p>

            <p className="text-sm text-slate-700">
              <span className="font-bold uppercase">
                {question.word.word}
              </span>{" "}
              = {question.word.meaning}{" "}
              <span className="text-slate-500">
                ({question.word.translation})
              </span>
            </p>
            <p className="rounded-2xl bg-white/60 p-3 text-sm text-slate-600 italic">
              “{question.word.example}”
            </p>
            {isCorrect ? (
              <p className="text-sm font-bold text-emerald-700">+10 XP</p>
            ) : (
              <p className="text-sm text-slate-600">
                Correct answer:{" "}
                <span className="font-semibold">
                  {String.fromCharCode(65 + question.correctIndex)}.{" "}
                  {question.options[question.correctIndex]}
                </span>
              </p>
            )}

            <Button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="w-full gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white sm:w-fit sm:px-8"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {index + 1 >= questions.length || lives === 0
                ? "See my result"
                : "Next"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>

            {lives === 0 ? (
              <p className="text-xs text-slate-500">
                No lives left — this round is finished. You can play again
                straight away.
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </QuestionCard>

      <GlassCard className="flex items-center justify-between gap-3 p-4">
        <p className="text-xs text-slate-500">
          Every correct word adds up in your Progress page.
        </p>
        <span className="text-xs font-bold text-slate-600 tabular-nums">
          {correctCount} / {questions.length} correct
        </span>
      </GlassCard>
    </div>
  );
}

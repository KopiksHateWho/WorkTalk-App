import { GlassBackground } from "@/components/GlassBackground";
import { GlassCard } from "@/components/GlassCard";
import { Wordmark } from "@/components/Navbar";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, PartyPopper } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { EnglishLevel } from "@/types/learner";

const LEVELS: Array<{
  value: EnglishLevel;
  emoji: string;
  title: string;
  description: string;
}> = [
  {
    value: "basic",
    emoji: "🟢",
    title: "Basic",
    description: "I know simple English and short sentences.",
  },
  {
    value: "intermediate",
    emoji: "🟡",
    title: "Intermediate",
    description: "I can have simple conversations and explain my ideas.",
  },
];

const GOALS = [
  { id: "vocabulary", label: "Vocabulary", emoji: "📚" },
  { id: "speaking", label: "Speaking", emoji: "🎙️" },
  { id: "workplace", label: "Workplace English", emoji: "💼" },
  { id: "interview", label: "Job Interview", emoji: "🧑‍💼" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const status = useQuery(api.progress.status);
  const saveOnboarding = useMutation(api.progress.saveOnboarding);

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [level, setLevel] = useState<EnglishLevel | null>(null);
  const [goals, setGoals] = useState<string[]>(GOALS.map((goal) => goal.id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status?.onboardingCompleted) {
      navigate("/home", { replace: true });
    }
  }, [status, navigate]);

  const toggleGoal = (id: string) => {
    setGoals((current) =>
      current.includes(id)
        ? current.filter((goal) => goal !== id)
        : [...current, id],
    );
  };

  const handleStart = async () => {
    if (!level) return;
    setSaving(true);
    try {
      await saveOnboarding({
        displayName: displayName.trim() || undefined,
        englishLevel: level,
        goals,
      });
      toast.success("Your learning plan is ready!");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Onboarding save failed:", error);
      toast.error("We couldn't save your preferences. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-dvh">
      <GlassBackground />
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <Wordmark />
          <span className="glass-chip rounded-full px-3 py-1 text-xs font-bold text-slate-600">
            Step {step + 1} of 3
          </span>
        </div>

        <ProgressBar value={((step + 1) / 3) * 100} size="sm" />

        <GlassCard tone="strong" className="overflow-hidden p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {step === 0 ? (
                <>
                  <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                      What's your English level?
                    </h1>
                    <p className="text-sm leading-6 text-slate-600">
                      We use this to choose how much guidance the coach gives you.
                      You can change it later in settings.
                    </p>
                  </header>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {LEVELS.map((option) => {
                      const active = level === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setLevel(option.value)}
                          aria-pressed={active}
                          className={cn(
                            "flex flex-col gap-2 rounded-3xl border p-5 text-left transition-all",
                            active
                              ? "border-indigo-500/50 bg-indigo-500/12 shadow-sm"
                              : "border-white/70 bg-white/55 hover:bg-white/80",
                          )}
                        >
                          <span className="flex items-center justify-between">
                            <span className="text-2xl" aria-hidden="true">
                              {option.emoji}
                            </span>
                            {active ? (
                              <span className="grid size-6 place-items-center rounded-full bg-indigo-600 text-white">
                                <Check className="size-4" aria-hidden="true" />
                              </span>
                            ) : null}
                          </span>
                          <span className="text-base font-bold text-slate-900">
                            {option.title}
                          </span>
                          <span className="text-sm leading-5 text-slate-600">
                            {option.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="displayName">
                      What should we call you?{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="e.g. Rina"
                      maxLength={40}
                      className="h-11 rounded-2xl border-white/70 bg-white/70"
                    />
                  </div>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <header className="flex flex-col gap-1">
                    <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                      What do you want to improve?
                    </h2>
                    <p className="text-sm leading-6 text-slate-600">
                      Pick everything that matters to you. Speaking stays the main
                      focus — the others support it.
                    </p>
                  </header>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {GOALS.map((goal) => {
                      const active = goals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => toggleGoal(goal.id)}
                          aria-pressed={active}
                          className={cn(
                            "flex items-center gap-3 rounded-3xl border p-4 text-left transition-all",
                            active
                              ? "border-teal-500/50 bg-teal-500/12"
                              : "border-white/70 bg-white/55 hover:bg-white/80",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-9 place-items-center rounded-2xl",
                              active ? "bg-teal-500 text-white" : "bg-white/80",
                            )}
                            aria-hidden="true"
                          >
                            {active ? (
                              <Check className="size-4" />
                            ) : (
                              <span className="text-base">{goal.emoji}</span>
                            )}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {goal.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <div className="flex flex-col items-center gap-4 py-2 text-center">
                  <span
                    className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg"
                    aria-hidden="true"
                  >
                    <PartyPopper className="size-8" />
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    You're ready!
                  </h2>
                  <p className="max-w-md text-sm leading-6 text-slate-600">
                    Let's start your English journey. Your first mission: speak
                    for 30 seconds with the AI coach and earn 100 XP.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="glass-chip rounded-full px-3 py-1 text-xs font-semibold text-slate-700">
                      {level === "basic" ? "🟢 Basic" : "🟡 Intermediate"}
                    </span>
                    {goals.map((goal) => (
                      <span
                        key={goal}
                        className="glass-chip rounded-full px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {GOALS.find((item) => item.id === goal)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0 || saving}
              className="gap-2 rounded-full text-slate-600"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Button>

            {step < 2 ? (
              <Button
                type="button"
                onClick={() => setStep((value) => value + 1)}
                disabled={step === 0 && !level}
                className="gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 px-6 text-white"
              >
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleStart}
                disabled={saving || !level}
                className="gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 px-6 text-white"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Start learning
              </Button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

import { AiModeBadge, Chip } from "@/components/Badges";
import { GlassCard } from "@/components/GlassCard";
import { MicrophoneButton } from "@/components/MicrophoneButton";
import { Modal } from "@/components/Modal";
import { PageHeader, SectionTitle } from "@/components/SectionTitle";
import { LoadingState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, Check, KeyRound, Loader2, Mic, Sparkles, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import type { EnglishLevel } from "@/types/learner";

const GOALS = [
  { id: "vocabulary", label: "Vocabulary", emoji: "📚" },
  { id: "speaking", label: "Speaking", emoji: "🎙️" },
  { id: "workplace", label: "Workplace English", emoji: "💼" },
  { id: "interview", label: "Job interview", emoji: "🧑‍💼" },
];

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function Settings() {
  const me = useQuery(api.progress.me);
  const aiStatus = useQuery(api.ai.status);
  const updateProfile = useMutation(api.progress.updateProfile);
  const resetProgress = useMutation(api.progress.resetProgress);
  const { signOut } = useAuth();
  const speech = useSpeechRecognition();
  const micSupported = speech.supported;
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [level, setLevel] = useState<EnglishLevel>("basic");
  const [goals, setGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!me) return;
    setDisplayName(me.profile.displayName ?? "");
    setLevel(me.profile.englishLevel ?? "basic");
    setGoals(me.profile.goals);
  }, [me]);

  if (me === undefined) {
    return <LoadingState message="Loading your settings..." />;
  }

  if (me === null) {
    return <LoadingState message="Preparing your settings..." />;
  }

  const toggleGoal = (id: string) => {
    setGoals((current) =>
      current.includes(id)
        ? current.filter((goal) => goal !== id)
        : [...current, id],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        englishLevel: level,
        goals,
      });
      toast.success("Preferences saved");
    } catch (error) {
      console.error("Saving settings failed:", error);
      toast.error("We couldn't save your settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetProgress();
      toast.success("Your progress has been reset");
      setResetOpen(false);
      navigate("/home");
    } catch (error) {
      console.error("Reset failed:", error);
      toast.error("We couldn't reset your progress. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleMicToggle = () => {
    if (speech.listening) {
      speech.stop();
      return;
    }
    speech.clearError();
    void speech.start();
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        subtitle="Adjust how WorkTalk Quest coaches you. Changes apply to your next conversation."
      />

      <section className="flex flex-col gap-3">
        <SectionTitle eyebrow="Learning" title="Your preferences" />
        <GlassCard tone="strong" className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-name">Display name</Label>
            <Input
              id="settings-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={40}
              placeholder="e.g. Rina"
              className="h-11 rounded-2xl border-white/70 bg-white/70 sm:max-w-sm"
            />
            <p className="text-xs text-slate-500">
              Used in your dashboard greeting and coach replies.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-800">English level</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {(["basic", "intermediate"] as EnglishLevel[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLevel(option)}
                  aria-pressed={level === option}
                  className={cn(
                    "min-h-11 flex-1 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
                    level === option
                      ? "border-indigo-500/40 bg-indigo-500/12 text-indigo-700"
                      : "border-white/70 bg-white/60 text-slate-600 hover:bg-white/80",
                  )}
                >
                  {option === "basic"
                    ? "🟢 Basic — hints and example phrases"
                    : "🟡 Intermediate — workplace scenarios"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-800">
              What do you want to improve?
            </p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((goal) => {
                const active = goals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    aria-pressed={active}
                    className={cn(
                      "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
                      active
                        ? "border-teal-500/40 bg-teal-500/12 text-teal-700"
                        : "border-white/70 bg-white/60 text-slate-600 hover:bg-white/80",
                    )}
                  >
                    {active ? "✓ " : ""}
                    {goal.emoji} {goal.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="w-full gap-2 rounded-full bg-brand text-white sm:w-fit sm:px-8"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            Save preferences
          </Button>
        </GlassCard>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle eyebrow="Speaking" title="Assistant & microphone" />
        <div className="grid gap-3 sm:grid-cols-2">
          <GlassCard className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-indigo-500" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-900">
                Speaking assistant
              </p>
              <AiModeBadge aiEnabled={Boolean(aiStatus?.aiEnabled)} />
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {aiStatus?.aiEnabled
                ? `Adaptive AI conversations are active${aiStatus.model ? ` (${aiStatus.model})` : ""}. The coach generates follow-up questions from what you actually say.`
                : "No AI provider is connected yet, so the coach follows the scripted topic questions and checks your sentences against common mistakes. Everything else works exactly the same."}
            </p>
            {!aiStatus?.aiEnabled ? (
              <p className="flex items-start gap-2 rounded-2xl bg-white/60 p-3 text-xs leading-5 text-slate-600">
                <KeyRound className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                To enable adaptive AI, add an API key in the project's Keys tab
                (<code className="font-mono">AI_API_KEY</code> or{" "}
                <code className="font-mono">VLY_INTEGRATION_KEY</code>), then send a
                new speaking answer.
              </p>
            ) : null}
          </GlassCard>

          <GlassCard className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <Mic className="size-4 text-indigo-500" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-900">Microphone</p>
              <Chip
                className={cn(
                  micSupported
                    ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-700"
                    : "border-amber-500/30 bg-amber-400/20 text-amber-800",
                )}
              >
                {micSupported ? "Speech ready" : "Type-only"}
              </Chip>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {micSupported
                ? "Your browser supports speech recognition. WorkTalk Quest only listens while the microphone button shows “Recording”, and audio is never stored."
                : "Speech recognition isn't available in this browser, so you can type your answers. Everything else — corrections, feedback and XP — stays the same."}
            </p>
          </GlassCard>
        </div>

        <GlassCard tone="strong" className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Mic className="size-4 text-indigo-500" aria-hidden="true" />
            <p className="text-sm font-bold text-slate-900">
              Test your microphone
            </p>
            <Chip
              className={cn(
                !micSupported
                  ? "border-amber-500/30 bg-amber-400/20 text-amber-800"
                  : speech.listening
                    ? "border-rose-500/30 bg-rose-500/12 text-rose-700"
                    : "border-emerald-500/30 bg-emerald-500/12 text-emerald-700",
              )}
            >
              {!micSupported
                ? "Unavailable"
                : speech.listening
                  ? "Recording"
                  : "Ready"}
            </Chip>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Tap the microphone and speak normally. This shows exactly what the
            recogniser hears, live — the same engine used in speaking practice.
            Nothing is recorded or saved.
          </p>

          <div className="flex flex-col items-center gap-3">
            <MicrophoneButton
              state={
                !micSupported
                  ? "disabled"
                  : speech.listening
                    ? "listening"
                    : "idle"
              }
              onToggle={handleMicToggle}
            />
            <p className="text-xs font-semibold tabular-nums text-slate-500">
              {formatSeconds(
                speech.listening ? speech.seconds : speech.totalSeconds,
              )}{" "}
              recorded
            </p>
          </div>

          <div
            role="status"
            aria-live="polite"
            className={cn(
              "glass-inset max-h-40 min-h-20 w-full overflow-y-auto rounded-2xl p-4 text-sm leading-6",
              speech.transcript ? "text-slate-700" : "text-slate-400",
            )}
          >
            {speech.transcript ? (
              speech.transcript
            ) : speech.listening ? (
              <span className="inline-flex items-center gap-2 text-slate-500">
                <span className="relative flex size-2" aria-hidden="true">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400/70" />
                  <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                </span>
                Listening — start speaking to see your words here.
              </span>
            ) : (
              "Your words will appear here as you speak."
            )}
          </div>

          {speech.error ? (
            <div className="flex items-start gap-2 rounded-2xl bg-rose-500/10 p-3 text-xs leading-5 text-rose-700">
              <AlertTriangle
                className="mt-0.5 size-3.5 shrink-0 text-rose-500"
                aria-hidden="true"
              />
              <p className="flex-1">{speech.error}</p>
              <button
                type="button"
                onClick={speech.clearError}
                className="font-semibold underline-offset-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          {speech.transcript || speech.totalSeconds > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={speech.reset}
              className="w-fit rounded-full border-white/80 bg-white/70 text-slate-700"
            >
              Clear transcript
            </Button>
          ) : null}
        </GlassCard>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle eyebrow="Account" title="Sign-in & data" />
        <GlassCard className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-600">
              {me.isGuest
                ? "You are signed in as a guest. Guest progress may not be permanently saved."
                : `Signed in as ${me.profile.email ?? "your account"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {me.isGuest ? (
              <Button
                asChild
                className="gap-2 rounded-full bg-brand text-white"
              >
                <Link to="/signup">
                  <UserPlus className="size-4" aria-hidden="true" />
                  Create an account
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSignOut()}
              className="rounded-full border-white/80 bg-white/70 text-slate-700"
            >
              Log out
            </Button>
          </div>
        </GlassCard>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle eyebrow="Danger zone" title="Reset your progress" />
        <GlassCard className="flex flex-col gap-3 border-rose-500/25 bg-rose-500/8 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-rose-600"
              aria-hidden="true"
            />
            <p className="text-sm leading-6 text-slate-700">
              Delete all XP, streaks, sessions, quiz results and achievements. This
              cannot be undone.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setResetOpen(true)}
            className="w-fit rounded-full"
          >
            Reset progress
          </Button>
        </GlassCard>
      </section>

      <Modal
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all progress?"
        description="Your XP, streak, vocabulary, quiz history and achievements will be permanently deleted."
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetOpen(false)}
              className="rounded-full border-white/80 bg-white/70 text-slate-700"
            >
              Keep my progress
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={resetting}
              onClick={() => void handleReset()}
              className="gap-2 rounded-full"
            >
              {resetting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Yes, reset everything
            </Button>
          </>
        }
      />
    </div>
  );
}

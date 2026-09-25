import { AiModeBadge, Chip, LevelPill, XPBadge } from "@/components/Badges";
import { ConversationBubble } from "@/components/ConversationBubble";
import { CorrectionCard } from "@/components/FeedbackCard";
import { GlassCard } from "@/components/GlassCard";
import { MicrophoneButton, type MicState } from "@/components/MicrophoneButton";
import { ProgressBar } from "@/components/ProgressBar";
import { RecordingIndicator } from "@/components/RecordingIndicator";
import { PageHeader, SectionTitle } from "@/components/SectionTitle";
import { SpeakingResult } from "@/components/SpeakingResult";
import {
  ErrorState,
  LoadingState,
  SpeechUnsupportedState,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SPEAKING_TOPICS, topicById } from "@/convex/content/speaking";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  Lightbulb,
  Mic,
  Sparkles,
  Square,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import type { EnglishLevel, SpeakingSummary } from "@/types/learner";

const MIN_ANSWERS_TO_FINISH = 3;

type Phase = "setup" | "active" | "result";

export default function SpeakingSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const overview = useQuery(api.progress.overview);
  const aiStatus = useQuery(api.ai.status);
  const startSession = useMutation(api.speaking.startSession);
  const finishSession = useMutation(api.speaking.finishSession);
  const tutorTurn = useAction(api.coach.tutorTurn);

  const topicParam = searchParams.get("topic");
  const levelParam = searchParams.get("level");
  const sessionParam = searchParams.get("session");

  const [topicId] = useState(topicParam ?? "self-introduction");
  const [level, setLevel] = useState<EnglishLevel>(
    levelParam === "intermediate" ? "intermediate" : "basic",
  );
  const [levelTouched, setLevelTouched] = useState(Boolean(levelParam));
  const [phase, setPhase] = useState<Phase>(sessionParam ? "active" : "setup");
  const [sessionId, setSessionId] = useState<Id<"speakingSessions"> | null>(
    (sessionParam as Id<"speakingSessions"> | null) ?? null,
  );
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SpeakingSummary | null>(null);

  const speech = useSpeechRecognition({ lang: "en-US" });
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const sessionQuery = useQuery(
    api.speaking.session,
    sessionId ? { sessionId } : "skip",
  );

  const topic = topicById(topicId) ?? SPEAKING_TOPICS[0];

  useEffect(() => {
    if (!levelTouched && overview?.profile.englishLevel) {
      setLevel(overview.profile.englishLevel);
    }
  }, [overview, levelTouched]);

  // Mirror the live transcript into the composer so learners can watch their
  // words appear (including while they are still speaking). Adjusting state
  // during render avoids a second render pass in an effect.
  const [lastTranscript, setLastTranscript] = useState(speech.transcript);
  if (speech.transcript !== lastTranscript) {
    setLastTranscript(speech.transcript);
    setDraft(speech.transcript);
  }

  const turns = sessionQuery?.turns ?? [];
  const lastAiTurn = [...turns].reverse().find((turn) => turn.role === "ai");
  const userTurns = sessionQuery?.userTurns ?? 0;

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ block: "end" });
  }, [turns.length]);

  const beginSession = useCallback(
    async (options?: { resume?: Id<"speakingSessions"> }) => {
      setStarting(true);
      setStartError(null);
      try {
        const result = await startSession({
          topicId,
          level,
          resumeSessionId: options?.resume,
        });
        setSessionId(result.sessionId);
        setPhase("active");
      } catch (error) {
        console.error("Starting speaking session failed:", error);
        setStartError(
          "We couldn't start the speaking assistant. Please check your connection and try again.",
        );
      } finally {
        setStarting(false);
      }
    },
    [level, startSession, topicId],
  );

  const handleSend = async () => {
    const text = draft.trim();
    if (!sessionId || !text || sending) return;
    setSending(true);
    setSendError(null);
    try {
      await tutorTurn({ sessionId, text: text.slice(0, 600) });
      setDraft("");
      speech.clearTranscript();
    } catch (error) {
      console.error("Coach turn failed:", error);
      setSendError(
        "We couldn't connect to the speaking assistant. Your answer is safe — try sending it again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    setFinishing(true);
    setFinishError(null);
    try {
      const result = await finishSession({
        sessionId,
        speechSeconds: speech.totalSeconds,
      });
      setSummary(result as SpeakingSummary);
      setPhase("result");
      if (result.mission?.completedNow) {
        toast.success(`Daily mission complete! +${result.mission.xpAwarded} XP`);
      } else {
        toast.success(`Session saved · +${result.xpEarned} XP`);
      }
    } catch (error) {
      console.error("Finishing session failed:", error);
      setFinishError(
        "Something went wrong while saving your session. Please check your connection and try again.",
      );
    } finally {
      setFinishing(false);
    }
  };

  const handlePracticeAgain = async () => {
    speech.reset();
    setSummary(null);
    setDraft("");
    setSessionId(null);
    setPhase("setup");
    await beginSession();
  };

  const micState: MicState = !speech.supported
    ? "disabled"
    : sending
      ? "processing"
      : speech.listening
        ? "listening"
        : "idle";

  const handleMicToggle = () => {
    if (sending) return;
    if (speech.listening) {
      speech.stop();
      return;
    }
    setSendError(null);
    setDraft("");
    void speech.start();
  };

  if (overview === undefined) {
    return <LoadingState message="Loading conversation..." />;
  }

  if (phase === "result" && summary) {
    return (
      <SpeakingResult
        summary={summary}
        topicTitle={`${topic.emoji} ${topic.title}`}
        onPracticeAgain={handlePracticeAgain}
        onContinue={() => navigate("/home")}
      />
    );
  }

  /* ----------------------------- Set-up screen ---------------------------- */
  if (phase === "setup") {
    const guidance = topic.levels[level][0];
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PageHeader
          title={`${topic.emoji} ${topic.title}`}
          subtitle={topic.blurb}
        >
          <div className="flex flex-wrap gap-2">
            <LevelPill level={level} />
            <AiModeBadge aiEnabled={Boolean(aiStatus?.aiEnabled)} />
          </div>
        </PageHeader>

        <GlassCard tone="strong" className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-mark text-white">
              <Mic className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Speak for about {topic.targetSeconds} seconds per answer
              </p>
              <p className="text-sm leading-6 text-slate-600">
                The coach asks one question at a time. Answer out loud, check the
                transcript, then send it to get a correction.
              </p>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4">
            <p className="text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">
              The coach will start with
            </p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {guidance.ai}
            </p>
            {level === "basic" ? (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-semibold">Example:</span> {guidance.example}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {topic.keyWords.map((word) => (
              <Chip key={word}>{word}</Chip>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
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
                  "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors",
                  level === option
                    ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-700"
                    : "border-white/70 bg-white/60 text-slate-600 hover:bg-white/80",
                )}
              >
                {option === "basic" ? "🟢 Basic mode" : "🟡 Intermediate mode"}
              </button>
            ))}
          </div>

          {startError ? (
            <ErrorState
              message={startError}
              actionLabel="Try again"
              onAction={() => void beginSession()}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          ) : null}

          <Button
            type="button"
            size="lg"
            onClick={() => void beginSession()}
            disabled={starting}
            className="w-full gap-2 rounded-full bg-brand text-white sm:w-fit sm:px-10"
          >
            <Mic className="size-4" aria-hidden="true" />
            {starting ? "Opening the conversation..." : "Start speaking"}
          </Button>
        </GlassCard>

        {!speech.supported ? (
          <GlassCard className="flex items-start gap-3 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-indigo-500" aria-hidden="true" />
            <p className="text-sm leading-6 text-slate-700">
              This browser doesn't support speech recognition, so you'll type your
              answers. The coach still replies and corrects every sentence.
            </p>
          </GlassCard>
        ) : null}
      </div>
    );
  }

  /* --------------------------- Active conversation ------------------------ */
  const guidance = topic.levels[level][Math.min(userTurns, topic.levels[level].length - 1)];
  const showHints = level === "basic" || sessionQuery?.coachSource !== "ai";
  const missionSeconds = Math.min(
    (overview?.mission.speechSeconds ?? 0) + speech.totalSeconds,
    overview?.mission.targetSeconds ?? 30,
  );
  const canFinish = userTurns >= MIN_ANSWERS_TO_FINISH;
  // The backend caps a conversation at 12 turns (6 answers + 6 replies).
  const conversationFull = turns.length >= 12;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader
        title={`${topic.emoji} ${topic.title}`}
        subtitle={`${userTurns} answer(s) so far · answer at least ${MIN_ANSWERS_TO_FINISH} to finish`}
      >
        <div className="flex flex-wrap gap-2">
          <LevelPill level={level} />
          <AiModeBadge aiEnabled={sessionQuery?.coachSource === "ai"} />
          {overview ? <XPBadge xp={overview.profile.xp} /> : null}
        </div>
      </PageHeader>

      <GlassCard className="flex flex-col gap-3 p-4">
        <ProgressBar
          label={`Daily mission · speak for ${overview?.mission.targetSeconds ?? 30} seconds`}
          valueLabel={`${missionSeconds}s`}
          value={
            ((missionSeconds / (overview?.mission.targetSeconds ?? 30)) * 100) || 0
          }
          tone={overview?.mission.completed ? "teal" : "amber"}
          size="sm"
        />
      </GlassCard>

      {sessionQuery === undefined && sessionId ? (
        <LoadingState message="Loading conversation..." />
      ) : null}

      {sessionQuery === null && sessionId ? (
        <ErrorState
          message="We couldn't load this conversation. It may have been removed."
          actionLabel="Start a new conversation"
          onAction={() => {
            setSessionId(null);
            setPhase("setup");
          }}
        />
      ) : null}

      {sessionQuery ? (
        <>
          <section
            aria-label="Conversation with the AI coach"
            className="flex max-h-[46vh] flex-col gap-4 overflow-y-auto rounded-3xl p-1 pr-2"
          >
            {turns.map((turn, index) => (
              <ConversationBubble
                key={`${turn.createdAt}-${index}`}
                role={turn.role}
                text={turn.text}
              >
                {turn.role === "user" && turn.correction ? (
                  <div className="mt-2 text-left">
                    <CorrectionCard
                      correction={turn.correction}
                      onTryAgain={() => {
                        setDraft("");
                        speech.clearTranscript();
                        void speech.start();
                      }}
                    />
                  </div>
                ) : null}
              </ConversationBubble>
            ))}

            {sending ? (
              <div className="flex items-center gap-2 pl-12 text-sm text-slate-500">
                <Sparkles className="size-4 animate-pulse text-indigo-500" aria-hidden="true" />
                Checking your answer...
              </div>
            ) : null}

            <div ref={conversationEndRef} />
          </section>

          {speech.error ? (
            <ErrorState
              message={speech.error}
              actionLabel="Try again"
              onAction={() => {
                speech.clearError();
                void speech.start();
              }}
              secondary={
                <Button
                  type="button"
                  variant="outline"
                  onClick={speech.clearError}
                  className="rounded-full border-white/80 bg-white/70 text-slate-700"
                >
                  Type my answer instead
                </Button>
              }
            />
          ) : null}

          {sendError ? (
            <ErrorState
              message={sendError}
              actionLabel="Retry sending"
              onAction={() => void handleSend()}
              secondary={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSendError(null)}
                  className="rounded-full border-white/80 bg-white/70 text-slate-700"
                >
                  Keep editing
                </Button>
              }
            />
          ) : null}

          {!speech.supported ? (
            <SpeechUnsupportedState
              className="border-0 bg-transparent p-0 shadow-none"
              onType={() => setDraft(speech.transcript)}
            />
          ) : null}

          {/* Speaking controls */}
          <GlassCard
            tone="strong"
            className="flex flex-col items-center gap-4 p-5 sm:p-6"
          >
            {lastAiTurn ? (
              <div className="w-full rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                <p className="text-[11px] font-bold tracking-[0.12em] text-indigo-700 uppercase">
                  Current question
                </p>
                <p className="mt-1 text-base font-semibold text-slate-800">
                  {lastAiTurn.text}
                </p>
                {showHints ? (
                  <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                    <Lightbulb
                      className="mt-0.5 size-4 shrink-0 text-amber-500"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="font-semibold">Hint:</span> {guidance.hint}
                      {" "}
                      <span className="italic">
                        Try: “{guidance.example}”
                      </span>
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                    <Target
                      className="mt-0.5 size-4 shrink-0 text-indigo-500"
                      aria-hidden="true"
                    />
                    <span>
                      Answer in two or three sentences and add one real example.
                    </span>
                  </p>
                )}
              </div>
            ) : null}

            {speech.listening ? (
              <RecordingIndicator
                seconds={speech.seconds}
                targetSeconds={topic.targetSeconds}
                interim={speech.interim}
              />
            ) : null}

            <MicrophoneButton state={micState} onToggle={handleMicToggle} />

            <p className="text-center text-sm font-semibold text-slate-700">
              {sending
                ? "Processing your speech..."
                : speech.listening
                  ? "Recording... tap the square to stop"
                  : speech.supported
                    ? "Tap the microphone and start speaking"
                    : "Speech recognition isn't supported in this browser"}
            </p>
            {!speech.listening && !sending && speech.supported ? (
              <p className="flex items-center gap-1.5 text-center text-xs text-slate-500">
                <Square className="size-3" aria-hidden="true" />
                Your microphone is only used while the button shows “Recording”.
              </p>
            ) : null}
          </GlassCard>

          {/* Transcript + composer */}
          <GlassCard className="flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                Your response
              </h2>
              {speech.transcript ? (
                <span className="text-xs text-slate-500">
                  {speech.transcript.trim().split(/\s+/).filter(Boolean).length}{" "}
                  words captured
                </span>
              ) : null}
            </div>

            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                speech.supported
                  ? "Your speech appears here. You can also fix the wording before sending."
                  : "Type your English answer here..."
              }
              rows={4}
              aria-label="Your spoken answer"
              className="rounded-2xl border-white/70 bg-white/70 text-base"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {conversationFull
                  ? "This conversation is full — finish it to see your feedback and start a new one."
                  : "Nothing is stored as audio — only the text you send."}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!draft.trim() || sending}
                  onClick={() => {
                    setDraft("");
                    speech.clearTranscript();
                  }}
                  className="rounded-full border-white/80 bg-white/70 text-slate-600"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  disabled={
                    !draft.trim() || sending || conversationFull || speech.listening
                  }
                  onClick={() => void handleSend()}
                  className="gap-2 rounded-full bg-brand text-white"
                >
                  Send answer
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Finish */}
          <GlassCard className="flex flex-col gap-3 p-5">
            <SectionTitle
              eyebrow="Ready?"
              title="Finish and get your feedback"
              description={
                canFinish
                  ? "You have enough answers. Finishing saves your XP and shows your speaking feedback."
                  : `Answer at least ${MIN_ANSWERS_TO_FINISH} questions to unlock your feedback.`
              }
            />
            {finishError ? (
              <ErrorState
                message={finishError}
                actionLabel="Try again"
                onAction={() => void handleFinish()}
                className="border-0 bg-transparent p-0 shadow-none"
              />
            ) : null}
            <Button
              type="button"
              size="lg"
              disabled={!canFinish || finishing}
              onClick={() => void handleFinish()}
              className="w-full gap-2 rounded-full bg-brand text-white sm:w-fit sm:px-10"
            >
              {finishing ? "Saving your session..." : "Finish & see feedback"}
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </Button>
          </GlassCard>
        </>
      ) : null}
    </div>
  );
}

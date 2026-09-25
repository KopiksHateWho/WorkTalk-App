import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Browser speech recognition wrapper.
 *
 * Behaviour:
 *  - never pretends speech was understood: an empty transcript stays empty
 *  - reports friendly, non-technical error messages
 *  - when the browser has no SpeechRecognition implementation, `supported` is
 *    false and the caller offers a typed fallback
 *
 * Reliability fixes (these are why the microphone used to look "deaf"):
 *  - `recognition.start()` runs synchronously inside the user gesture. We no
 *    longer call `getUserMedia` first: acquiring a stream and immediately
 *    stopping its tracks left Chrome's recogniser capturing no audio at all,
 *    which surfaced as silence or `audio-capture`.
 *  - Browsers end a `continuous` session on silence, so the recogniser is
 *    transparently restarted while the learner is still recording. Later
 *    sentences are no longer dropped.
 *  - When a session ends (or the learner stops) any still-interim words are
 *    committed. Short answers such as "hello my name is Kira" frequently
 *    arrive as an interim result; they used to be discarded and the transcript
 *    stayed empty.
 */

interface RecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface RecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: RecognitionAlternative;
}

interface RecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: RecognitionResult;
  };
}

interface RecognitionErrorEvent {
  error: string;
  message?: string;
}

interface RecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
}

type RecognitionConstructor = new () => RecognitionInstance;

interface SpeechWindow {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
}

/** How many silent restarts before we stop retrying and nudge the learner. */
const MAX_EMPTY_RESTARTS = 8;
/** Small pause between a session ending and the automatic restart. */
const RESTART_DELAY_MS = 300;

function getConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  if (window.isSecureContext === false) return null;
  const scoped = window as unknown as SpeechWindow;
  return scoped.SpeechRecognition ?? scoped.webkitSpeechRecognition ?? null;
}

function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function friendlyError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return isEmbedded()
        ? "Your browser blocked the microphone in this embedded preview. Open the app in its own tab (or allow microphone access) and try again."
        : "Microphone access is required for speaking practice. Allow the microphone in your browser and try again.";
    case "no-speech":
      return "We didn't hear anything. Move closer to the microphone and try again.";
    case "audio-capture":
      return "We couldn't find a working microphone. Check your device, then try again.";
    case "network":
      return "Speech recognition needs a connection. Please check your internet and try again.";
    case "aborted":
      return "";
    default:
      return "We couldn't process your speech. Please try again.";
  }
}

function joinText(...parts: Array<string | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface UseSpeechRecognition {
  supported: boolean;
  listening: boolean;
  /** Everything captured so far, including in-progress words. */
  transcript: string;
  /** Live in-progress words for the current phrase. */
  interim: string;
  /** Elapsed seconds of the current recording. */
  seconds: number;
  /** Total recorded seconds since the last reset. */
  totalSeconds: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
  clearError: () => void;
  /** Clears the current transcript but keeps the accumulated speaking time. */
  clearTranscript: () => void;
  /** Lets the caller supply text directly (typed fallback / manual edit). */
  setTranscript: (value: string) => void;
}

export function useSpeechRecognition({
  lang = "en-US",
}: { lang?: string } = {}): UseSpeechRecognition {
  const [supported] = useState(() => getConstructor() !== null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscriptState] = useState("");
  const [interim, setInterim] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<RecognitionInstance | null>(null);
  /** True while the learner wants to be recording (drives auto-restart). */
  const intentRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const emptyRestartsRef = useRef(0);
  const heardRef = useRef(false);
  const secondsRef = useRef(0);

  /** Text from earlier sessions in this recording (survives restarts). */
  const committedRef = useRef("");
  /** Final text of the current recogniser session. */
  const liveFinalRef = useRef("");
  /** Interim text of the current recogniser session. */
  const liveInterimRef = useRef("");

  /** Set to the latest `spawn` so handlers can restart without a cycle. */
  const spawnRef = useRef<() => void>(() => {});

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const publish = useCallback(() => {
    setTranscriptState(
      joinText(committedRef.current, liveFinalRef.current, liveInterimRef.current),
    );
    setInterim(liveInterimRef.current.trim());
  }, []);

  const commitLive = useCallback(() => {
    committedRef.current = joinText(
      committedRef.current,
      liveFinalRef.current,
      liveInterimRef.current,
    );
    liveFinalRef.current = "";
    liveInterimRef.current = "";
    setTranscriptState(committedRef.current);
    setInterim("");
  }, []);

  const flushSeconds = useCallback(() => {
    const elapsed = secondsRef.current;
    if (elapsed > 0) {
      secondsRef.current = 0;
      setSeconds(0);
      setTotalSeconds((previous) => previous + elapsed);
    }
  }, []);

  const spawn = useCallback(() => {
    const Recognition = getConstructor();
    if (!Recognition) {
      intentRef.current = false;
      setListening(false);
      setError("Speech recognition isn't supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const alternative = result?.[0];
        if (!alternative) continue;
        if (result.isFinal) {
          finalText += ` ${alternative.transcript}`;
        } else {
          interimText += ` ${alternative.transcript}`;
        }
      }
      liveFinalRef.current = finalText.trim();
      liveInterimRef.current = interimText.trim();
      if (liveFinalRef.current || liveInterimRef.current) {
        heardRef.current = true;
        emptyRestartsRef.current = 0;
      }
      publish();
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;

      const fatal =
        event.error === "not-allowed" ||
        event.error === "service-not-allowed" ||
        event.error === "audio-capture";

      if (fatal) {
        intentRef.current = false;
        clearRestartTimer();
        const message = friendlyError(event.error);
        if (message) setError(message);
        setListening(false);
        flushSeconds();
        return;
      }

      // Recoverable errors (`no-speech`, `network`) are retried by `onend`.
      // Only `network` is worth surfacing right away, since retrying will
      // likely fail the same way.
      if (event.error === "network") {
        setError(friendlyError(event.error));
      }
    };

    recognition.onend = () => {
      // Persist whatever we heard before the session ended.
      commitLive();

      if (!intentRef.current) {
        setListening(false);
        flushSeconds();
        return;
      }

      if (!heardRef.current) {
        emptyRestartsRef.current += 1;
      } else {
        emptyRestartsRef.current = 0;
      }
      heardRef.current = false;

      if (emptyRestartsRef.current > MAX_EMPTY_RESTARTS) {
        intentRef.current = false;
        setListening(false);
        flushSeconds();
        setError(
          "We couldn't hear anything. Move closer to the microphone, then tap the microphone and try again.",
        );
        return;
      }

      // Continuous recognition ends on silence — restart so we keep listening.
      clearRestartTimer();
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null;
        if (!intentRef.current) return;
        spawnRef.current();
      }, RESTART_DELAY_MS);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      intentRef.current = false;
      setListening(false);
      setError("We couldn't start the microphone. Please try again.");
    }
  }, [clearRestartTimer, commitLive, flushSeconds, lang, publish]);

  useEffect(() => {
    spawnRef.current = spawn;
  }, [spawn]);

  const stop = useCallback(() => {
    intentRef.current = false;
    clearRestartTimer();
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        // Graceful stop lets the browser flush its final result, which
        // `onend` then commits. No extra commit here, so words are never
        // recorded twice.
        recognition.stop();
      } catch {
        /* already stopped */
      }
    }
    setListening(false);
    flushSeconds();
  }, [clearRestartTimer, flushSeconds]);

  const start = useCallback(async () => {
    if (intentRef.current) return;

    setError(null);
    committedRef.current = "";
    liveFinalRef.current = "";
    liveInterimRef.current = "";
    secondsRef.current = 0;
    emptyRestartsRef.current = 0;
    heardRef.current = false;
    setTranscriptState("");
    setInterim("");
    setSeconds(0);

    if (!supported) {
      setError("Speech recognition isn't supported in this browser.");
      return;
    }

    // Start inside the click gesture: no awaiting beforehand.
    intentRef.current = true;
    clearRestartTimer();
    spawnRef.current();
  }, [clearRestartTimer, supported]);

  useEffect(() => {
    if (!listening) return;
    const timer = window.setInterval(() => {
      secondsRef.current += 1;
      setSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [listening]);

  useEffect(() => {
    return () => {
      intentRef.current = false;
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  const reset = useCallback(() => {
    intentRef.current = false;
    clearRestartTimer();
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    }
    committedRef.current = "";
    liveFinalRef.current = "";
    liveInterimRef.current = "";
    secondsRef.current = 0;
    emptyRestartsRef.current = 0;
    heardRef.current = false;
    setListening(false);
    setTranscriptState("");
    setInterim("");
    setSeconds(0);
    setTotalSeconds(0);
    setError(null);
  }, [clearRestartTimer]);

  const clearError = useCallback(() => setError(null), []);

  const clearTranscript = useCallback(() => {
    committedRef.current = "";
    liveFinalRef.current = "";
    liveInterimRef.current = "";
    setTranscriptState("");
    setInterim("");
  }, []);

  const setTranscript = useCallback((value: string) => {
    committedRef.current = value;
    liveFinalRef.current = "";
    liveInterimRef.current = "";
    setTranscriptState(value);
    setInterim("");
  }, []);

  return {
    supported,
    listening,
    transcript,
    interim,
    seconds,
    totalSeconds,
    error,
    start,
    stop,
    reset,
    clearError,
    clearTranscript,
    setTranscript,
  };
}

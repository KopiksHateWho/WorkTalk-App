import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Browser speech recognition wrapper.
 *
 * Behaviour:
 *  - asks for microphone permission explicitly before listening
 *  - reports friendly, non-technical error messages
 *  - never pretends speech was understood: an empty transcript stays empty
 *
 * When the browser has no SpeechRecognition implementation, `supported` is
 * false and the caller offers a typed fallback.
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

function getConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const scoped = window as unknown as SpeechWindow;
  return scoped.SpeechRecognition ?? scoped.webkitSpeechRecognition ?? null;
}

function friendlyError(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is required for speaking practice.";
    case "no-speech":
      return "We didn't hear anything. Move closer to the microphone and try again.";
    case "audio-capture":
      return "We couldn't find a microphone. Check your device and try again.";
    case "network":
      return "Speech recognition needs a connection. Please check your internet and try again.";
    case "aborted":
      return "";
    default:
      return "We couldn't process your speech. Please try again.";
  }
}

export interface UseSpeechRecognition {
  supported: boolean;
  listening: boolean;
  /** Final transcript of the current recording. */
  transcript: string;
  /** Live in-progress words. */
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
  const stoppingRef = useRef(false);
  const secondsRef = useRef(0);
  const finalRef = useRef("");

  const setTranscript = useCallback((value: string) => {
    finalRef.current = value;
    setTranscriptState(value);
  }, []);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    stoppingRef.current = true;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    }
    setListening(false);
    setInterim("");
    setTotalSeconds((previous) => previous + secondsRef.current);
    secondsRef.current = 0;
    setSeconds(0);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    finalRef.current = "";
    setTranscriptState("");
    setInterim("");
    secondsRef.current = 0;
    setSeconds(0);

    if (!supported) {
      setError("Speech recognition isn't supported in this browser.");
      return;
    }

    // Ask for the microphone first so permission problems surface clearly.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      setError("Microphone access is required for speaking practice.");
      return;
    }

    const Recognition = getConstructor();
    if (!Recognition) {
      setError("Speech recognition isn't supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      stoppingRef.current = false;
      setListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const alternative = result[0];
        if (!alternative) continue;
        if (result.isFinal) {
          finalText += `${alternative.transcript} `;
        } else {
          interimText += alternative.transcript;
        }
      }
      if (finalText) {
        finalRef.current = `${finalRef.current}${finalText}`.replace(/\s+/g, " ");
        setTranscriptState(finalRef.current.trim());
      }
      setInterim(interimText.trim());
    };

    recognition.onerror = (event) => {
      const message = friendlyError(event.error);
      if (message) setError(message);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setListening(false);
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
      if (!stoppingRef.current) {
        setTotalSeconds((previous) => previous + secondsRef.current);
        secondsRef.current = 0;
        setSeconds(0);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("We couldn't start the microphone. Please try again.");
      setListening(false);
    }
  }, [lang, supported]);

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
    const recognition = recognitionRef.current;
    stoppingRef.current = true;
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    }
    recognitionRef.current = null;
    finalRef.current = "";
    secondsRef.current = 0;
    setListening(false);
    setTranscriptState("");
    setInterim("");
    setSeconds(0);
    setTotalSeconds(0);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const clearTranscript = useCallback(() => {
    finalRef.current = "";
    setTranscriptState("");
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

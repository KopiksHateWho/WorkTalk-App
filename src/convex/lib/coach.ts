/**
 * Deterministic speaking-coach logic.
 *
 * Two responsibilities:
 *  1. `analyzeUtterance` – a small, honest rule set over ~20 common Indonesian
 *     speaker mistakes. It never invents scores; it either finds a concrete
 *     pattern or reports nothing.
 *  2. `scriptedReply` – the follow-up question used when no AI provider is
 *     configured (the UI labels this "Practice mode").
 */

import type { CareerTopic, EnglishLevel } from "../content/speaking";

export type CorrectionCategory =
  | "grammar"
  | "vocabulary"
  | "phrasing"
  | "spelling";

export interface LocalCorrection {
  category: CorrectionCategory;
  original: string;
  corrected: string;
  explanation: string;
  tip?: string;
}

interface GrammarRule {
  id: string;
  pattern: RegExp;
  replacement: string;
  explanation: string;
  tip?: string;
}

/**
 * Patterns are matched case-insensitively and applied with `.replace`, so the
 * sentence keeps its original casing and the fix stays surgical.
 */
const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: "good-in",
    pattern: /\b(good|great|excellent) in\b/i,
    replacement: "$1 at",
    explanation: "Use “good at” before a skill or activity.",
    tip: "“I am good at communication.”",
  },
  {
    id: "work-in-company",
    pattern: /\bwork in (a |an )?(company|office|firm|bank)\b/i,
    replacement: "work at $2",
    explanation: "We say “work at” a company or organisation.",
    tip: "“I work at a marketing agency.”",
  },
  {
    id: "years-old",
    pattern:
      /\b(i|she|he) (am|is|have|has) (\d+|twenty|twenty one|twenty two|twenty three) years? old\b/i,
    replacement: "$1 am $3 years old",
    explanation: "Age uses the verb “to be”: I am 21 years old.",
    tip: "“I am 21 years old.” / “She is 20 years old.”",
  },
  {
    id: "explain-me",
    pattern: /\bexplain me\b/i,
    replacement: "explain to me",
    explanation: "“Explain” needs “to” before the person.",
    tip: "“Could you explain the process to me?”",
  },
  {
    id: "discuss-about",
    pattern: /\bdiscuss(ed|ing)? about\b/i,
    replacement: "discuss",
    explanation: "“Discuss” is followed directly by the topic — no “about”.",
    tip: "“We discussed the budget yesterday.”",
  },
  {
    id: "i-am-agree",
    pattern: /\bi am agree\b/i,
    replacement: "I agree",
    explanation: "“Agree” is already a verb, so it does not need “am”.",
    tip: "“I agree with your suggestion.”",
  },
  {
    id: "more-better",
    pattern: /\bmore (better|easier|faster|clearer)\b/i,
    replacement: "$1",
    explanation: "These words are already comparatives.",
    tip: "“This version is better than the first one.”",
  },
  {
    id: "interest-in",
    pattern: /\b(i am|i'm) interest(ed)? in\b/i,
    replacement: "I am interested in",
    explanation: "Use the adjective “interested” with a person.",
    tip: "“I am interested in digital marketing.”",
  },
  {
    id: "look-forward-to",
    pattern: /\blook(ing)? forward to (hear|meet|see) from you\b/i,
    replacement: "look forward to hearing from you",
    explanation: "After “look forward to”, use the -ing form.",
    tip: "“I look forward to hearing from you.”",
  },
  {
    id: "people-is",
    pattern: /\bpeople (is|was)\b/i,
    replacement: "people are",
    explanation: "“People” is plural, so it takes “are”.",
    tip: "“People are friendly in this office.”",
  },
  {
    id: "borrow-me",
    pattern: /\bborrow me\b/i,
    replacement: "lend me",
    explanation: "You borrow *from* someone; you lend *to* someone.",
    tip: "“Could you lend me your notes?”",
  },
  {
    id: "in-day",
    pattern: /\bin (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    replacement: "on $1",
    explanation: "Use “on” with days of the week.",
    tip: "“The meeting is on Monday.”",
  },
  {
    id: "didnt-past",
    pattern: /\bdid ?n[o']?t (went|came|saw|took|made|gave)\b/i,
    replacement: "didn't go",
    explanation: "After “didn't”, use the base form of the verb.",
    tip: "“I didn't go to the office yesterday.”",
  },
  {
    id: "am-working-since",
    pattern: /\bi am working (here|there|in) since\b/i,
    replacement: "I have been working $1 since",
    explanation: "Use the present perfect for something that started in the past.",
    tip: "“I have been working here since 2023.”",
  },
  {
    id: "very-like",
    pattern: /\bi (very|so) like\b/i,
    replacement: "I really like",
    explanation: "“Very” does not go before a verb — use “really”.",
    tip: "“I really like working with clients.”",
  },
  {
    id: "am-boring",
    pattern: /\bi am boring\b/i,
    replacement: "I am bored",
    explanation: "“Boring” describes the thing; “bored” describes you.",
    tip: "“The training was long, so I was bored.”",
  },
  {
    id: "third-person-have",
    pattern: /\b(he|she|it) have\b/i,
    replacement: "$1 has",
    explanation: "Third person singular takes “has”.",
    tip: "“She has three years of experience.”",
  },
  {
    id: "hobby-play",
    pattern: /\bmy hobb(y|ies) is play\b/i,
    replacement: "my hobby is playing",
    explanation: "After “is”, a hobby uses the -ing form.",
    tip: "“My hobby is playing badminton.”",
  },
  {
    id: "communication-skill",
    pattern: /\bcommunication skill\b/i,
    replacement: "communication skills",
    explanation: "Skills are usually plural in this expression.",
    tip: "“I have strong communication skills.”",
  },
  {
    id: "very-very",
    pattern: /\b(\w+) very very\b/i,
    replacement: "$1 very",
    explanation: "English rarely repeats “very”.",
    tip: "“The task was very difficult.” (or “extremely difficult”)",
  },
];

interface VocabularyRule {
  id: string;
  pattern: RegExp;
  suggestion: string;
  explanation: string;
  tip: string;
}

/** Softer, workplace-flavoured suggestions. Applied only when grammar is clean. */
const VOCABULARY_RULES: VocabularyRule[] = [
  {
    id: "good-to-strong",
    pattern: /\b(i have a )?(good|nice) (communication|english|skill|skills)\b/i,
    suggestion: "strong",
    explanation:
      "In a professional context, “strong” sounds more confident than “good”.",
    tip: "“I have strong communication skills.”",
  },
  {
    id: "talk-about",
    pattern: /\btalk about\b/i,
    suggestion: "discuss",
    explanation: "“Discuss” is the more professional choice in a workplace.",
    tip: "“Let's discuss the schedule.”",
  },
  {
    id: "big-problem",
    pattern: /\bbig (problem|issue|mistake)\b/i,
    suggestion: "major",
    explanation: "“Major” is the natural word for a serious workplace problem.",
    tip: "“We solved a major issue with the supplier.”",
  },
  {
    id: "thing",
    pattern: /\b(a lot of things|many things|some things)\b/i,
    suggestion: "several tasks",
    explanation: "Naming the actual objects sounds clearer than “things”.",
    tip: "“I handled several tasks at the same time.”",
  },
  {
    id: "get",
    pattern: /\bget (a )?(reply|answer|email|response)\b/i,
    suggestion: "receive",
    explanation: "“Receive” is the standard verb in professional writing.",
    tip: "“I received your email this morning.”",
  },
  {
    id: "happy-to-glad",
    pattern: /\bi am (happy|very happy) to (help|work)\b/i,
    suggestion: "glad",
    explanation: "“I am glad to help” is a very common professional phrase.",
    tip: "“I am glad to help with the report.”",
  },
  {
    id: "fast-quick",
    pattern: /\bdo it fast\b/i,
    suggestion: "quickly",
    explanation: "“Fast” describes speed of movement; “quickly” describes how you do something.",
    tip: "“I will finish the report quickly.”",
  },
];

function firstMatch<T extends { pattern: RegExp }>(
  rules: T[],
  text: string,
): T | undefined {
  return rules.find((rule) => rule.pattern.test(text));
}

export interface UtteranceAnalysis {
  correction: LocalCorrection | null;
  correctedText: string;
  wordCount: number;
  words: string[];
  matchedKeyWords: string[];
}

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "at",
  "is",
  "am",
  "are",
  "i",
  "my",
  "me",
  "you",
  "it",
  "for",
  "with",
  "that",
  "this",
  "so",
  "but",
  "very",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function keyWordStem(keyword: string): string {
  const clean = keyword.toLowerCase().trim();
  return clean.length > 5 ? clean.slice(0, clean.length - 3) : clean;
}

export function matchKeyWords(text: string, keyWords: string[]): string[] {
  const tokens = tokenize(text);
  return keyWords.filter((keyword) => {
    const stem = keyWordStem(keyword);
    return tokens.some((token) => token.startsWith(stem));
  });
}

/**
 * Finds at most one concrete correction. Grammar first (most important), then
 * wording, then a light style check for missing punctuation.
 */
export function analyzeUtterance(
  text: string,
  keyWords: string[] = [],
): UtteranceAnalysis {
  const trimmed = text.trim().replace(/\s+/g, " ");
  const words = tokenize(trimmed);
  const matchedKeyWords = matchKeyWords(trimmed, keyWords);

  const base: UtteranceAnalysis = {
    correction: null,
    correctedText: trimmed,
    wordCount: words.length,
    words,
    matchedKeyWords,
  };

  if (!trimmed) return base;

  const grammarRule = firstMatch(GRAMMAR_RULES, trimmed);
  if (grammarRule) {
    const corrected = trimmed.replace(
      grammarRule.pattern,
      grammarRule.replacement,
    );
    if (corrected !== trimmed) {
      return {
        ...base,
        correctedText: corrected,
        correction: {
          category: "grammar",
          original: trimmed,
          corrected,
          explanation: grammarRule.explanation,
          tip: grammarRule.tip,
        },
      };
    }
  }

  const vocabularyRule = firstMatch(VOCABULARY_RULES, trimmed);
  if (vocabularyRule && words.length > 3) {
    return {
      ...base,
      correction: {
        category: "vocabulary",
        original: trimmed,
        corrected: trimmed,
        explanation: vocabularyRule.explanation,
        tip: vocabularyRule.tip,
      },
    };
  }

  if (!/[.!?]$/.test(trimmed)) {
    return {
      ...base,
      correctedText: `${trimmed}.`,
      correction: {
        category: "phrasing",
        original: trimmed,
        corrected: `${trimmed}.`,
        explanation:
          "Finish your sentence with a full stop — written English needs it.",
        tip: "Speak in complete sentences, then write them the same way.",
      },
    };
  }

  return base;
}

/* ------------------------------------------------------------------ *
 * Practice-mode (no AI provider) conversation
 * ------------------------------------------------------------------ */

const PRACTICE_ACKNOWLEDGEMENTS = [
  "Good try!",
  "Nice, thanks for sharing.",
  "That was clear.",
  "Great job.",
  "Well done.",
];

/**
 * Builds the next coach line for practice mode: a short, friendly
 * acknowledgement plus the next scripted question for the topic and level.
 * When the learner's answer repeats, we keep encouraging instead of pretending
 * to understand more than we do.
 */
export function scriptedReply(
  topic: CareerTopic,
  level: EnglishLevel,
  userTurns: number,
  matchedKeyWords: string[],
): string {
  const prompts = topic.levels[level];
  const next = prompts[Math.min(userTurns, prompts.length - 1)];
  const acknowledgement =
    PRACTICE_ACKNOWLEDGEMENTS[userTurns % PRACTICE_ACKNOWLEDGEMENTS.length];

  const keywordNote =
    matchedKeyWords.length > 0
      ? ` I noticed you used “${matchedKeyWords[0]}” — that is great career vocabulary.`
      : "";

  return `${acknowledgement}${keywordNote} ${next.ai}`.replace(/\s+/g, " ").trim();
}

export function promptCount(topic: CareerTopic, level: EnglishLevel): number {
  return topic.levels[level].length;
}

/** Words worth practising out loud, based on what the learner actually said. */
export function practiceWords(
  topic: CareerTopic,
  transcripts: string[],
  limit = 3,
): string[] {
  const spoken = transcripts.join(" ").toLowerCase();
  const used = topic.keyWords.filter((word) => spoken.includes(keyWordStem(word)));
  const unused = topic.keyWords.filter((word) => !used.includes(word));
  return [...used, ...unused].slice(0, limit);
}

export function countVocabWords(transcripts: string[]): number {
  const tokens = transcripts.flatMap((text) => tokenize(text));
  const unique = new Set(
    tokens.filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
  return unique.size;
}

export function averageWordsPerTurn(transcripts: string[]): number {
  if (transcripts.length === 0) return 0;
  const total = transcripts.reduce(
    (sum, text) => sum + tokenize(text).length,
    0,
  );
  return Math.round(total / transcripts.length);
}

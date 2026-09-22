export type EnglishLevel = "basic" | "intermediate";

export interface Correction {
  category: "grammar" | "vocabulary" | "phrasing" | "spelling";
  original: string;
  corrected: string;
  explanation: string;
  tip?: string;
}

export interface ChatTurn {
  role: "ai" | "user";
  text: string;
  correction?: Correction;
  createdAt: number;
}

export interface FeedbackLine {
  label: string;
  text: string;
}

export interface SpeakingFeedback {
  grammar: FeedbackLine;
  vocabulary: FeedbackLine;
  pronunciation: FeedbackLine;
  fluency: FeedbackLine;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextXp: number | null;
  progressPct: number;
  xpToNext: number;
}

export interface AchievementDefinition {
  id: string;
  emoji: string;
  title: string;
  description: string;
  requirement: string;
}

export interface AchievementView extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface ActivityView {
  id: string;
  kind: "speaking" | "vocabulary" | "quiz";
  label: string;
  score: number | null;
  xpEarned: number;
  createdAt: number;
}

export interface LearnerProfileView {
  displayName: string | null;
  englishLevel: EnglishLevel | null;
  goals: string[];
  isGuest: boolean;
  email: string | null;
  image: string | null;
  onboardingCompleted: boolean;
  xp: number;
  streak: number;
  bestStreak: number;
  wordsMastered: number;
  speakingSessions: number;
  speechSeconds: number;
  quizCorrect: number;
  quizTotal: number;
}

export interface ContinueLearning {
  kind: "speaking";
  label: string;
  subtitle: string;
  href: string;
}

export interface DailyMissionView {
  id: string;
  emoji: string;
  title: string;
  description: string;
  targetSeconds: number;
  xp: number;
  speechSeconds: number;
  completed: boolean;
  progressPct: number;
}

export interface ActivityResultSummary {
  xpEarned: number;
  xp: number;
  score: number;
  level: LevelInfo;
  leveledUp: boolean;
  newAchievements: AchievementDefinition[];
}

export interface SpeakingSummary {
  alreadyFinished: boolean;
  xpEarned: number;
  xp: number;
  level: LevelInfo;
  leveledUp: boolean;
  feedback: SpeakingFeedback | null;
  corrections: Correction[];
  vocabularyUsed: string[];
  practiceWords: string[];
  mission: {
    completedNow: boolean;
    xpAwarded: number;
    speechSeconds: number;
  } | null;
  newAchievements: AchievementDefinition[];
  userTurns: number;
  wordsSpoken: number;
  averageWordsPerTurn: number;
  coachSource: "ai" | "practice";
  speechSeconds: number;
}

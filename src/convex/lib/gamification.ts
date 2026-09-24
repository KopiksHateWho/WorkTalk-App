/**
 * Shared gamification rules for WorkTalk Quest.
 *
 * Pure module (no Convex imports) so the backend and the React frontend use
 * exactly the same numbers.
 */

export const XP = {
  vocabularyCorrect: 10,
  quizCorrect: 20,
  speakingTurn: 15,
  speakingSessionBonus: 60,
  dailyMission: 100,
} as const;

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  /** XP required for the next level, or null when maxed out. */
  nextXp: number | null;
  /** 0–100 progress towards the next level. */
  progressPct: number;
  /** XP still needed for the next level. */
  xpToNext: number;
}

const LEVEL_TABLE = [
  { level: 1, title: "English Starter", minXp: 0 },
  { level: 2, title: "Career English", minXp: 500 },
  { level: 3, title: "Workplace Communicator", minXp: 1200 },
  { level: 4, title: "Interview Ready", minXp: 2200 },
  { level: 5, title: "Professional Speaker", minXp: 3500 },
  { level: 6, title: "Career English Mentor", minXp: 5000 },
] as const;

export function levelForXp(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  let index = 0;
  for (let i = 0; i < LEVEL_TABLE.length; i += 1) {
    if (safeXp >= LEVEL_TABLE[i].minXp) index = i;
  }
  const current = LEVEL_TABLE[index];
  const next = LEVEL_TABLE[index + 1] ?? null;

  if (!next) {
    return {
      level: current.level,
      title: current.title,
      minXp: current.minXp,
      nextXp: null,
      progressPct: 100,
      xpToNext: 0,
    };
  }

  const span = next.minXp - current.minXp;
  const into = safeXp - current.minXp;
  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextXp: next.minXp,
    progressPct: Math.max(0, Math.min(100, Math.round((into / span) * 100))),
    xpToNext: Math.max(0, next.minXp - safeXp),
  };
}

export function levelTitle(level: number): string {
  return LEVEL_TABLE.find((item) => item.level === level)?.title ?? "English Starter";
}

/* ------------------------------------------------------------------ *
 * Achievements
 * ------------------------------------------------------------------ */

export interface AchievementDefinition {
  id: string;
  emoji: string;
  title: string;
  description: string;
  /** Human readable requirement, shown while locked. */
  requirement: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-step",
    emoji: "🏅",
    title: "First Step",
    description: "You completed your first practice activity.",
    requirement: "Finish 1 activity",
  },
  {
    id: "brave-speaker",
    emoji: "🎙️",
    title: "Brave Speaker",
    description: "You finished 5 speaking conversations with the coach.",
    requirement: "Finish 5 speaking sessions",
  },
  {
    id: "word-collector",
    emoji: "📚",
    title: "Word Collector",
    description: "You mastered 50 career vocabulary words.",
    requirement: "Master 50 vocabulary words",
  },
  {
    id: "job-ready",
    emoji: "💼",
    title: "Job Ready",
    description: "You completed 5 career speaking topics.",
    requirement: "Complete 5 career topics",
  },
  {
    id: "speaking-streak",
    emoji: "🔥",
    title: "Speaking Streak",
    description: "You practiced English 7 days in a row.",
    requirement: "Practice 7 days in a row",
  },
];

export interface AchievementStats {
  activitiesCompleted: number;
  speakingSessions: number;
  wordsMastered: number;
  careerTopicsCompleted: number;
  bestStreak: number;
}

export function achievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

/** Returns the ids of every achievement the given stats satisfy. */
export function eligibleAchievements(stats: AchievementStats): string[] {
  const unlocked: string[] = [];
  if (stats.activitiesCompleted >= 1) unlocked.push("first-step");
  if (stats.speakingSessions >= 5) unlocked.push("brave-speaker");
  if (stats.wordsMastered >= 50) unlocked.push("word-collector");
  if (stats.careerTopicsCompleted >= 5) unlocked.push("job-ready");
  if (stats.bestStreak >= 7) unlocked.push("speaking-streak");
  return unlocked;
}

/* ------------------------------------------------------------------ *
 * Dates + streaks (UTC day keys keep client and server in sync)
 * ------------------------------------------------------------------ */

export function dayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function shiftDayKey(key: string, days: number): string {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dayKey(date.getTime());
}

/** Streak after practicing on `today` given the previous day and streak. */
export function nextStreak(
  lastActiveDate: string | undefined,
  streak: number,
  today: string,
): number {
  if (!lastActiveDate) return 1;
  if (lastActiveDate === today) return Math.max(1, streak);
  if (lastActiveDate === shiftDayKey(today, -1)) return Math.max(1, streak) + 1;
  return 1;
}

export const DAILY_MISSION = {
  id: "speak-30s",
  emoji: "🎙️",
  title: "Speak for 30 seconds",
  description: "Hold a conversation with the AI coach and speak for at least 30 seconds.",
  targetSeconds: 30,
  xp: XP.dailyMission,
} as const;

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { EnglishLevel } from "../content/speaking";
import {
  ACHIEVEMENTS,
  DAILY_MISSION,
  XP,
  achievementDefinition,
  dayKey,
  eligibleAchievements,
  nextStreak,
  type AchievementDefinition,
  type AchievementStats,
} from "./gamification";

export type ActivityKind = "speaking" | "vocabulary" | "quiz";

export interface ActivityInput {
  kind: ActivityKind;
  label: string;
  topicId?: string;
  score?: number;
  xpEarned: number;
}

export async function getProfile(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"profiles"> | null> {
  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

/** Creates the profile row on first sign-in. */
export async function ensureProfile(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"profiles">> {
  const existing = await getProfile(ctx, userId);
  if (existing) return existing;

  const now = Date.now();
  const id = await ctx.db.insert("profiles", {
    userId,
    onboardingCompleted: false,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    wordsMastered: 0,
    speakingSessions: 0,
    speechSeconds: 0,
    quizCorrect: 0,
    quizTotal: 0,
    createdAt: now,
    updatedAt: now,
  });
  const created = await ctx.db.get(id);
  if (!created) throw new Error("Could not create learner profile");
  return created;
}

async function countActivities(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const rows = await ctx.db
    .query("activities")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return rows.length;
}

async function countCompletedTopics(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const rows = await ctx.db
    .query("topicProgress")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return rows.filter((row) => row.completed).length;
}

/** Unlocks every achievement the learner now qualifies for. */
export async function unlockEligibleAchievements(
  ctx: MutationCtx,
  userId: Id<"users">,
  progress: { speakingSessions: number; wordsMastered: number; bestStreak: number },
): Promise<AchievementDefinition[]> {
  const unlockedRows = await ctx.db
    .query("achievements")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const unlockedIds = new Set(unlockedRows.map((row) => row.achievementId));

  const stats: AchievementStats = {
    activitiesCompleted: await countActivities(ctx, userId),
    speakingSessions: progress.speakingSessions,
    wordsMastered: progress.wordsMastered,
    careerTopicsCompleted: await countCompletedTopics(ctx, userId),
    bestStreak: progress.bestStreak,
  };

  const newlyUnlocked: AchievementDefinition[] = [];
  for (const id of eligibleAchievements(stats)) {
    if (unlockedIds.has(id)) continue;
    const definition = achievementDefinition(id);
    if (!definition) continue;
    await ctx.db.insert("achievements", {
      userId,
      achievementId: id,
      unlockedAt: Date.now(),
    });
    newlyUnlocked.push(definition);
  }
  return newlyUnlocked;
}

/** Records an activity, updates the daily streak and returns the new streak. */
export async function logActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
  profile: Doc<"profiles">,
  activity: ActivityInput,
): Promise<number> {
  const now = Date.now();
  await ctx.db.insert("activities", {
    userId,
    kind: activity.kind,
    label: activity.label,
    topicId: activity.topicId,
    score: activity.score,
    xpEarned: activity.xpEarned,
    createdAt: now,
  });

  const today = dayKey(now);
  const streak = nextStreak(profile.lastActiveDate, profile.streak, today);
  await ctx.db.patch(profile._id, {
    streak,
    bestStreak: Math.max(streak, profile.bestStreak),
    lastActiveDate: today,
    updatedAt: now,
  });
  return streak;
}

export async function awardXp(
  ctx: MutationCtx,
  profile: Doc<"profiles">,
  amount: number,
): Promise<number> {
  const xp = profile.xp + amount;
  await ctx.db.patch(profile._id, { xp, updatedAt: Date.now() });
  return xp;
}

export async function upsertTopicProgress(
  ctx: MutationCtx,
  userId: Id<"users">,
  topicId: string,
  update: {
    speakingSession?: boolean;
    score?: number;
    completed?: boolean;
  },
): Promise<void> {
  const existing = await ctx.db
    .query("topicProgress")
    .withIndex("by_user_topic", (q) =>
      q.eq("userId", userId).eq("topicId", topicId),
    )
    .unique();

  const now = Date.now();
  if (!existing) {
    await ctx.db.insert("topicProgress", {
      userId,
      topicId,
      speakingSessions: update.speakingSession ? 1 : 0,
      bestScore: update.score,
      completed: update.completed ?? false,
      updatedAt: now,
    });
    return;
  }

  await ctx.db.patch(existing._id, {
    speakingSessions:
      existing.speakingSessions + (update.speakingSession ? 1 : 0),
    bestScore:
      update.score === undefined
        ? existing.bestScore
        : Math.max(existing.bestScore ?? 0, update.score),
    completed: existing.completed || (update.completed ?? false),
    updatedAt: now,
  });
}

/** Adds speaking seconds to today's mission row and completes it at 30s. */
export async function addDailyMissionProgress(
  ctx: MutationCtx,
  userId: Id<"users">,
  seconds: number,
): Promise<{ completedNow: boolean; speechSeconds: number; xpAwarded: number }> {
  const today = dayKey(Date.now());
  const existing = await ctx.db
    .query("dailyQuests")
    .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
    .unique();

  if (!existing) {
    const completedNow = seconds >= DAILY_MISSION.targetSeconds;
    await ctx.db.insert("dailyQuests", {
      userId,
      date: today,
      missionId: DAILY_MISSION.id,
      speechSeconds: seconds,
      sessionsCompleted: 1,
      xpEarned: completedNow ? DAILY_MISSION.xp : 0,
      completedAt: completedNow ? Date.now() : undefined,
    });
    return {
      completedNow,
      speechSeconds: seconds,
      xpAwarded: completedNow ? DAILY_MISSION.xp : 0,
    };
  }

  const speechSeconds = existing.speechSeconds + seconds;
  const completedNow =
    !existing.completedAt && speechSeconds >= DAILY_MISSION.targetSeconds;

  await ctx.db.patch(existing._id, {
    speechSeconds,
    sessionsCompleted: existing.sessionsCompleted + 1,
    completedAt: completedNow ? Date.now() : existing.completedAt,
    xpEarned: existing.xpEarned + (completedNow ? DAILY_MISSION.xp : 0),
  });

  return {
    completedNow,
    speechSeconds,
    xpAwarded: completedNow ? DAILY_MISSION.xp : 0,
  };
}

export function xpForSpeaking(level: EnglishLevel, userTurns: number): number {
  const turns = Math.max(1, Math.min(userTurns, 6));
  const bonus = level === "intermediate" ? 80 : 60;
  return turns * XP.speakingTurn + bonus;
}

export { ACHIEVEMENTS };

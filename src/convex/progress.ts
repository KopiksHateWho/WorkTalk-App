import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { SPEAKING_TOPICS, topicTitle } from "./content/speaking";
import {
  addDailyMissionProgress,
  awardXp,
  ensureProfile,
  getProfile,
  logActivity,
  unlockEligibleAchievements,
  upsertTopicProgress,
} from "./lib/accounting";
import {
  ACHIEVEMENTS,
  DAILY_MISSION,
  XP,
  dayKey,
  levelForXp,
  type LevelInfo,
} from "./lib/gamification";

/* ------------------------------------------------------------------ *
 * Shared shapes
 * ------------------------------------------------------------------ */

interface ProfileView {
  displayName: string | null;
  englishLevel: "basic" | "intermediate" | null;
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

const VALID_GOALS = [
  "vocabulary",
  "speaking",
  "workplace",
  "interview",
] as const;

function isEnglishLevel(value: unknown): value is "basic" | "intermediate" {
  return value === "basic" || value === "intermediate";
}

async function requireUserId(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("You need to be signed in to do that.");
  return userId;
}

async function buildProfileView(
  ctx: QueryCtx,
  profile: Doc<"profiles"> | null,
  userId: Id<"users">,
): Promise<ProfileView | null> {
  if (!profile) return null;
  const user = await ctx.db.get(userId);
  return {
    displayName: profile.displayName ?? user?.name ?? null,
    englishLevel: profile.englishLevel ?? null,
    goals: profile.goals ?? [],
    isGuest: user?.isAnonymous === true,
    email: user?.email ?? null,
    image: user?.image ?? null,
    onboardingCompleted: profile.onboardingCompleted,
    xp: profile.xp,
    streak: profile.streak,
    bestStreak: profile.bestStreak,
    wordsMastered: profile.wordsMastered,
    speakingSessions: profile.speakingSessions,
    speechSeconds: profile.speechSeconds,
    quizCorrect: profile.quizCorrect,
    quizTotal: profile.quizTotal,
  };
}

interface ActivityView {
  id: string;
  kind: "speaking" | "vocabulary" | "quiz";
  label: string;
  score: number | null;
  xpEarned: number;
  createdAt: number;
}

async function buildActivity(
  ctx: QueryCtx,
  userId: Id<"users">,
  limit: number,
): Promise<ActivityView[]> {
  const rows = await ctx.db
    .query("activities")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .take(limit);
  return rows.map((row) => ({
    id: row._id,
    kind: row.kind,
    label: row.label,
    score: row.score ?? null,
    xpEarned: row.xpEarned,
    createdAt: row.createdAt,
  }));
}

async function buildAchievements(ctx: QueryCtx, userId: Id<"users">) {
  const rows = await ctx.db
    .query("achievements")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const unlockedAt = new Map(rows.map((row) => [row.achievementId, row.unlockedAt]));
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlockedAt.has(achievement.id),
    unlockedAt: unlockedAt.get(achievement.id) ?? null,
  }));
}

async function topicRows(ctx: QueryCtx, userId: Id<"users">) {
  return await ctx.db
    .query("topicProgress")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

/** Cheap gate used by the app shell to decide about onboarding. */
export const status = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { hasProfile: false, onboardingCompleted: false };
    const profile = await getProfile(ctx, userId);
    return {
      hasProfile: profile !== null,
      onboardingCompleted: profile?.onboardingCompleted ?? false,
    };
  },
});

/** Everything the dashboard needs in one round trip. */
export const overview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfile(ctx, userId);
    const profileView = await buildProfileView(ctx, profile, userId);
    if (!profile || !profileView) return null;

    const [achievements, recentActivity, topics] = await Promise.all([
      buildAchievements(ctx, userId),
      buildActivity(ctx, userId, 4),
      topicRows(ctx, userId),
    ]);

    const today = dayKey(Date.now());
    const quest = await ctx.db
      .query("dailyQuests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();

    const todayActivities = await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    const activeSession = await ctx.db
      .query("speakingSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
    const unfinished = activeSession.find((row) => row.status === "active");

    const completedTopics = new Set(
      topics.filter((row) => row.completed).map((row) => row.topicId),
    );
    const nextTopic = SPEAKING_TOPICS.find(
      (topic) => !completedTopics.has(topic.id),
    );

    const continueLearning = unfinished
      ? {
          kind: "speaking" as const,
          label: `Continue: ${topicTitle(unfinished.topicId)}`,
          subtitle: "You stopped in the middle of this conversation.",
          href: `/speaking/session?session=${unfinished._id}`,
        }
      : recentActivity.length === 0
        ? null
        : nextTopic
          ? {
              kind: "speaking" as const,
              label: `Next up: ${nextTopic.title}`,
              subtitle: `Speaking · ${nextTopic.minutes} min · +${nextTopic.xp} XP`,
              href: `/speaking/session?topic=${nextTopic.id}`,
            }
          : null;

    const missionProgress = quest?.speechSeconds ?? 0;
    const missionCompleted = Boolean(quest?.completedAt);

    return {
      profile: profileView,
      level: levelForXp(profile.xp),
      mission: {
        id: DAILY_MISSION.id,
        emoji: DAILY_MISSION.emoji,
        title: DAILY_MISSION.title,
        description: DAILY_MISSION.description,
        targetSeconds: DAILY_MISSION.targetSeconds,
        xp: DAILY_MISSION.xp,
        speechSeconds: missionProgress,
        completed: missionCompleted,
        progressPct: Math.min(
          100,
          Math.round((missionProgress / DAILY_MISSION.targetSeconds) * 100),
        ),
      },
      achievements,
      recentActivity,
      continueLearning,
      hasActivity: recentActivity.length > 0,
      todayXp: todayActivities
        .filter((row) => dayKey(row.createdAt) === today)
        .reduce((sum, row) => sum + row.xpEarned, 0),
    };
  },
});

/** Data for the progress page. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfile(ctx, userId);
    const profileView = await buildProfileView(ctx, profile, userId);
    if (!profile || !profileView) return null;

    const [topics, recentActivity, achievements, vocabRows, quizRows, vocabRounds] =
      await Promise.all([
        topicRows(ctx, userId),
        buildActivity(ctx, userId, 10),
        buildAchievements(ctx, userId),
        ctx.db
          .query("vocabProgress")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("quizResults")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("vocabResults")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
      ]);

    const topicMap = new Map(topics.map((row) => [row.topicId, row]));
    const quizTotal = quizRows.reduce((sum, row) => sum + row.total, 0);
    const quizCorrect = quizRows.reduce((sum, row) => sum + row.correct, 0);
    const vocabTotal = vocabRounds.reduce((sum, row) => sum + row.total, 0);
    const vocabCorrect = vocabRounds.reduce((sum, row) => sum + row.correct, 0);

    return {
      profile: profileView,
      level: levelForXp(profile.xp) as LevelInfo,
      totals: {
        xp: profile.xp,
        streak: profile.streak,
        bestStreak: profile.bestStreak,
        wordsMastered: vocabRows.filter((row) => row.mastered).length,
        wordsSeen: vocabRows.length,
        speakingSessions: profile.speakingSessions,
        speechSeconds: profile.speechSeconds,
        quizRounds: quizRows.length,
        vocabularyRounds: vocabRounds.length,
        quizAverage:
          quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : null,
        vocabularyAverage:
          vocabTotal > 0 ? Math.round((vocabCorrect / vocabTotal) * 100) : null,
      },
      topics: SPEAKING_TOPICS.map((topic) => {
        const row = topicMap.get(topic.id);
        return {
          id: topic.id,
          title: topic.title,
          emoji: topic.emoji,
          blurb: topic.blurb,
          difficulty: topic.difficulty,
          minutes: topic.minutes,
          xp: topic.xp,
          keyWords: topic.keyWords,
          sessions: row?.speakingSessions ?? 0,
          bestScore: row?.bestScore ?? null,
          completed: row?.completed ?? false,
        };
      }),
      recentActivity,
      achievements,
      hasActivity: recentActivity.length > 0,
    };
  },
});

/** Profile + account details for the profile and settings pages. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await getProfile(ctx, userId);
    const [profileView, achievements] = await Promise.all([
      buildProfileView(ctx, profile, userId),
      buildAchievements(ctx, userId),
    ]);
    if (!profile || !profileView) return null;
    return {
      profile: profileView,
      level: levelForXp(profile.xp),
      achievements,
      isGuest: profileView.isGuest,
    };
  },
});

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

export const saveOnboarding = mutation({
  args: {
    displayName: v.optional(v.string()),
    englishLevel: v.union(v.literal("basic"), v.literal("intermediate")),
    goals: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ensureProfile(ctx, userId);
    const name = args.displayName?.trim().slice(0, 40);
    await ctx.db.patch(profile._id, {
      displayName: name && name.length > 0 ? name : profile.displayName,
      englishLevel: args.englishLevel,
      goals: args.goals.filter((goal) =>
        (VALID_GOALS as readonly string[]).includes(goal),
      ),
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    englishLevel: v.optional(
      v.union(v.literal("basic"), v.literal("intermediate")),
    ),
    goals: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ensureProfile(ctx, userId);
    const patch: Partial<Doc<"profiles">> = { updatedAt: Date.now() };
    if (args.displayName !== undefined) {
      patch.displayName = args.displayName.trim().slice(0, 40);
    }
    if (args.englishLevel !== undefined && isEnglishLevel(args.englishLevel)) {
      patch.englishLevel = args.englishLevel;
    }
    if (args.goals !== undefined) {
      patch.goals = args.goals.filter((goal) =>
        (VALID_GOALS as readonly string[]).includes(goal),
      );
    }
    await ctx.db.patch(profile._id, patch);
    return { ok: true };
  },
});

/** Called after a vocabulary round: XP, stats, activity and achievements. */
export const recordVocabularyRound = mutation({
  args: {
    topicId: v.string(),
    topicLabel: v.string(),
    level: v.union(v.literal("basic"), v.literal("intermediate")),
    correct: v.number(),
    total: v.number(),
    masteredWordIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ensureProfile(ctx, userId);
    const now = Date.now();
    const perfect = args.correct === args.total && args.total > 0;
    const xpEarned = args.correct * XP.vocabularyCorrect + (perfect ? 20 : 0);
    const score = args.total > 0 ? Math.round((args.correct / args.total) * 100) : 0;
    const levelBefore = levelForXp(profile.xp).level;

    for (const wordId of args.masteredWordIds) {
      const existing = await ctx.db
        .query("vocabProgress")
        .withIndex("by_user_word", (q) =>
          q.eq("userId", userId).eq("wordId", wordId),
        )
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          correct: existing.correct + 1,
          mastered: true,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("vocabProgress", {
          userId,
          wordId,
          topicId: args.topicId,
          correct: 1,
          mastered: true,
          updatedAt: now,
        });
      }
    }

    const masteredRows = await ctx.db
      .query("vocabProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const wordsMastered = masteredRows.filter((row) => row.mastered).length;

    await ctx.db.insert("vocabResults", {
      userId,
      topicId: args.topicId,
      level: args.level,
      correct: args.correct,
      total: args.total,
      xpEarned,
      createdAt: now,
    });

    await ctx.db.patch(profile._id, { wordsMastered, updatedAt: now });
    const xp = await awardXp(ctx, profile, xpEarned);
    await logActivity(ctx, userId, profile, {
      kind: "vocabulary",
      label: `${args.topicLabel} vocabulary`,
      topicId: args.topicId,
      score,
      xpEarned,
    });
    await upsertTopicProgress(ctx, userId, args.topicId, { score });

    const updated = await ctx.db.get(profile._id);
    const newAchievements = updated
      ? await unlockEligibleAchievements(ctx, userId, {
          speakingSessions: updated.speakingSessions,
          wordsMastered: updated.wordsMastered,
          bestStreak: updated.bestStreak,
        })
      : [];

    const level = levelForXp(xp);
    return {
      xpEarned,
      xp,
      score,
      level,
      leveledUp: level.level > levelBefore,
      newAchievements,
    };
  },
});

/** Called after a quick-quiz round. */
export const recordQuizRound = mutation({
  args: {
    topicId: v.string(),
    topicLabel: v.string(),
    level: v.union(v.literal("basic"), v.literal("intermediate")),
    correct: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ensureProfile(ctx, userId);
    const now = Date.now();
    const xpEarned = args.correct * XP.quizCorrect;
    const score = args.total > 0 ? Math.round((args.correct / args.total) * 100) : 0;
    const levelBefore = levelForXp(profile.xp).level;

    await ctx.db.insert("quizResults", {
      userId,
      topicId: args.topicId,
      level: args.level,
      correct: args.correct,
      total: args.total,
      xpEarned,
      createdAt: now,
    });

    await ctx.db.patch(profile._id, {
      quizCorrect: profile.quizCorrect + args.correct,
      quizTotal: profile.quizTotal + args.total,
      updatedAt: now,
    });
    const xp = await awardXp(ctx, profile, xpEarned);
    await logActivity(ctx, userId, profile, {
      kind: "quiz",
      label: `${args.topicLabel} quick quiz`,
      topicId: args.topicId,
      score,
      xpEarned,
    });
    await upsertTopicProgress(ctx, userId, args.topicId, { score });

    const updated = await ctx.db.get(profile._id);
    const newAchievements = updated
      ? await unlockEligibleAchievements(ctx, userId, {
          speakingSessions: updated.speakingSessions,
          wordsMastered: updated.wordsMastered,
          bestStreak: updated.bestStreak,
        })
      : [];

    const level = levelForXp(xp);
    return {
      xpEarned,
      xp,
      score,
      level,
      leveledUp: level.level > levelBefore,
      newAchievements,
    };
  },
});

/** Adds speaking seconds to today's mission without finishing a session. */
export const recordPracticeSeconds = mutation({
  args: { seconds: v.number() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const profile = await ensureProfile(ctx, userId);
    const seconds = Math.max(0, Math.min(600, Math.round(args.seconds)));
    const result = await addDailyMissionProgress(ctx, userId, seconds);
    if (result.completedNow) {
      await awardXp(ctx, profile, DAILY_MISSION.xp);
      await logActivity(ctx, userId, profile, {
        kind: "speaking",
        label: "Daily mission: speak for 30 seconds",
        xpEarned: DAILY_MISSION.xp,
      });
    }
    return result;
  },
});

/** Danger zone: clears all learning data for the signed-in learner. */
export const resetProgress = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of activities) await ctx.db.delete(row._id);

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of achievements) await ctx.db.delete(row._id);

    const quests = await ctx.db
      .query("dailyQuests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of quests) await ctx.db.delete(row._id);

    const quizzes = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of quizzes) await ctx.db.delete(row._id);

    const vocabRounds = await ctx.db
      .query("vocabResults")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of vocabRounds) await ctx.db.delete(row._id);

    const words = await ctx.db
      .query("vocabProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of words) await ctx.db.delete(row._id);

    const topics = await ctx.db
      .query("topicProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of topics) await ctx.db.delete(row._id);

    const sessions = await ctx.db
      .query("speakingSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of sessions) await ctx.db.delete(row._id);
    const profile = await getProfile(ctx, userId);
    if (profile) {
      await ctx.db.patch(profile._id, {
        xp: 0,
        streak: 0,
        bestStreak: 0,
        wordsMastered: 0,
        speakingSessions: 0,
        speechSeconds: 0,
        quizCorrect: 0,
        quizTotal: 0,
        lastActiveDate: undefined,
        updatedAt: Date.now(),
      });
    }
    return { ok: true };
  },
});

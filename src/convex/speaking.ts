import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  SPEAKING_TOPICS,
  topicById,
  topicTitle,
  type CareerTopic,
  type EnglishLevel,
} from "./content/speaking";
import { correctionValidator } from "./schema";
import {
  addDailyMissionProgress,
  awardXp,
  ensureProfile,
  getProfile,
  logActivity,
  unlockEligibleAchievements,
  upsertTopicProgress,
  xpForSpeaking,
} from "./lib/accounting";
import {
  averageWordsPerTurn,
  countVocabWords,
  matchKeyWords,
  practiceWords,
  type LocalCorrection,
} from "./lib/coach";
import { DAILY_MISSION, levelForXp } from "./lib/gamification";

const MAX_TURNS = 12;

async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("You need to be signed in to practice speaking.");
  return userId;
}

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

/** Live conversation for the speaking session page. */
export const session = query({
  args: { sessionId: v.id("speakingSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const doc = await ctx.db.get(args.sessionId);
    if (!doc || doc.userId !== userId) return null;
    const topic = topicById(doc.topicId);
    return {
      id: doc._id,
      topicId: doc.topicId,
      topicTitle: topic ? topic.title : "Speaking Practice",
      topicEmoji: topic ? topic.emoji : "🎙️",
      level: doc.level,
      status: doc.status,
      turns: doc.turns,
      startedAt: doc.startedAt,
      completedAt: doc.completedAt ?? null,
      feedback: doc.feedback ?? null,
      speechSeconds: doc.speechSeconds ?? null,
      xpEarned: doc.xpEarned ?? null,
      vocabularyUsed: doc.vocabularyUsed ?? [],
      practiceWords: doc.practiceWords ?? [],
      coachSource: doc.coachSource ?? null,
      userTurns: doc.turns.filter((turn) => turn.role === "user").length,
    };
  },
});

/** Most recent completed conversations, newest first. */
export const recentSessions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("speakingSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(Math.min(args.limit ?? 5, 20));
    return rows.map((row) => ({
      id: row._id,
      topicId: row.topicId,
      title: topicTitle(row.topicId),
      level: row.level,
      status: row.status,
      startedAt: row.startedAt,
      speechSeconds: row.speechSeconds ?? 0,
      xpEarned: row.xpEarned ?? 0,
      userTurns: row.turns.filter((turn) => turn.role === "user").length,
    }));
  },
});

/** Data the AI/practice coach needs to answer the next turn. */
export const sessionForCoach = internalQuery({
  args: { sessionId: v.id("speakingSessions") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.sessionId);
    if (!doc) return null;
    const topic = topicById(doc.topicId);
    if (!topic) return null;
    const profile = await getProfile(ctx, doc.userId);
    const user = await ctx.db.get(doc.userId);
    return {
      sessionId: doc._id,
      userId: doc.userId,
      topicId: doc.topicId,
      topic,
      level: doc.level,
      turns: doc.turns.map((turn) => ({
        role: turn.role,
        text: turn.text,
      })),
      learnerName: profile?.displayName ?? user?.name ?? null,
      goals: profile?.goals ?? [],
    };
  },
});

/* ------------------------------------------------------------------ *
 * Mutations
 * ------------------------------------------------------------------ */

/** Creates (or resumes) a speaking conversation and returns its id. */
export const startSession = mutation({
  args: {
    topicId: v.string(),
    level: v.union(v.literal("basic"), v.literal("intermediate")),
    resumeSessionId: v.optional(v.id("speakingSessions")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await ensureProfile(ctx, userId);

    if (args.resumeSessionId) {
      const existing = await ctx.db.get(args.resumeSessionId);
      if (existing && existing.userId === userId && existing.status === "active") {
        return { sessionId: existing._id, resumed: true };
      }
    }

    const topic = topicById(args.topicId) ?? SPEAKING_TOPICS[0];
    const opener = topic.levels[args.level][0].ai;
    const now = Date.now();
    const sessionId = await ctx.db.insert("speakingSessions", {
      userId,
      topicId: topic.id,
      level: args.level,
      status: "active",
      turns: [{ role: "ai", text: opener, createdAt: now }],
      startedAt: now,
    });
    return { sessionId, resumed: false };
  },
});

/** Persists the learner's utterance and the coach's reply. */
export const appendTurn = internalMutation({
  args: {
    sessionId: v.id("speakingSessions"),
    userText: v.string(),
    aiText: v.string(),
    correction: v.optional(correctionValidator),
    source: v.union(v.literal("ai"), v.literal("practice")),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.sessionId);
    if (!doc || doc.status !== "active") return { ok: false };
    if (doc.turns.length >= MAX_TURNS) return { ok: false };

    const now = Date.now();
    await ctx.db.patch(doc._id, {
      turns: [
        ...doc.turns,
        {
          role: "user" as const,
          text: args.userText,
          correction: args.correction,
          createdAt: now,
        },
        { role: "ai" as const, text: args.aiText, createdAt: now + 1 },
      ],
      coachSource: args.source,
    });
    return { ok: true };
  },
});

/** Finishes a conversation: computes feedback, XP, mission and achievements. */
export const finishSession = mutation({
  args: {
    sessionId: v.id("speakingSessions"),
    speechSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(args.sessionId);
    if (!doc || doc.userId !== userId) {
      throw new Error("We couldn't find that conversation.");
    }

    const topic: CareerTopic = topicById(doc.topicId) ?? SPEAKING_TOPICS[0];
    const level: EnglishLevel = doc.level;
    const seconds = Math.max(0, Math.min(900, Math.round(args.speechSeconds)));

    const userTurns = doc.turns.filter((turn) => turn.role === "user");
    const transcripts = userTurns.map((turn) => turn.text);
    const corrections = userTurns
      .map((turn) => turn.correction ?? null)
      .filter((value): value is LocalCorrection => value !== null);

    if (doc.status === "completed") {
      const profile = await getProfile(ctx, userId);
      return {
        alreadyFinished: true,
        xpEarned: doc.xpEarned ?? 0,
        xp: profile?.xp ?? 0,
        level: levelForXp(profile?.xp ?? 0),
        leveledUp: false,
        feedback: doc.feedback ?? null,
        corrections,
        vocabularyUsed: doc.vocabularyUsed ?? [],
        practiceWords: doc.practiceWords ?? [],
        mission: null,
        newAchievements: [],
        userTurns: userTurns.length,
        wordsSpoken: countVocabWords(transcripts),
        averageWordsPerTurn: averageWordsPerTurn(transcripts),
        coachSource: doc.coachSource ?? "practice",
        speechSeconds: doc.speechSeconds ?? 0,
      };
    }

    const profile = await ensureProfile(ctx, userId);
    const levelBefore = levelForXp(profile.xp).level;

    const vocabularyUsed = matchKeyWords(transcripts.join(" "), topic.keyWords);
    const wordsToPractice = practiceWords(topic, transcripts, 3);
    const avgWords = averageWordsPerTurn(transcripts);
    const wordsSpoken = countVocabWords(transcripts);

    const feedback = {
      grammar: {
        label:
          corrections.length === 0
            ? "Great"
            : corrections.length <= 2
              ? "Good"
              : "Keep practising",
        text:
          corrections.length === 0
            ? "No common mistakes found in this conversation. Keep the same sentence structure."
            : `We spotted ${corrections.length} sentence${
                corrections.length === 1 ? "" : "s"
              } we can polish. Review the notes above — small fixes add up quickly.`,
      },
      vocabulary: {
        label: vocabularyUsed.length > 0 ? "Great" : "Good",
        text:
          vocabularyUsed.length > 0
            ? `You used career words like ${vocabularyUsed.slice(0, 3).join(", ")}.`
            : `Try adding topic words such as ${topic.keyWords.slice(0, 3).join(", ")} in your next answers.`,
      },
      pronunciation: {
        label: wordsToPractice.length > 0 ? "Words to practice" : "Good",
        text:
          wordsToPractice.length > 0
            ? `Say these out loud slowly, then inside a full sentence: ${wordsToPractice.join(", ")}.`
            : "Repeat every answer once out loud, focusing on clear word endings.",
      },
      fluency: {
        label: avgWords >= 12 ? "Fluent" : avgWords >= 7 ? "Good" : "Building up",
        text:
          avgWords >= 12
            ? `You averaged ${avgWords} words per answer — full sentences. Keep this pace.`
            : avgWords >= 7
              ? `You averaged ${avgWords} words per answer. Add one more detail to each answer next time.`
              : `You averaged ${avgWords} words per answer. Try answering in longer sentences (8–12 words).`,
      },
    };

    const xpEarned = xpForSpeaking(level, userTurns.length);
    await ctx.db.patch(doc._id, {
      status: "completed",
      completedAt: Date.now(),
      speechSeconds: seconds,
      xpEarned,
      feedback,
      vocabularyUsed,
      practiceWords: wordsToPractice,
    });

    const refreshed = await ctx.db.get(profile._id);
    if (refreshed) {
      await ctx.db.patch(refreshed._id, {
        speakingSessions: refreshed.speakingSessions + 1,
        speechSeconds: refreshed.speechSeconds + seconds,
        updatedAt: Date.now(),
      });
    }
    const xp = await awardXp(ctx, refreshed ?? profile, xpEarned);
    await logActivity(ctx, userId, refreshed ?? profile, {
      kind: "speaking",
      label: `${topic.title} — ${userTurns.length} answer${
        userTurns.length === 1 ? "" : "s"
      }`,
      topicId: topic.id,
      xpEarned,
    });
    await upsertTopicProgress(ctx, userId, topic.id, {
      speakingSession: true,
      completed: userTurns.length >= 3,
    });

    const mission = await addDailyMissionProgress(ctx, userId, seconds);
    let missionXp = 0;
    if (mission.completedNow) {
      missionXp = DAILY_MISSION.xp;
      await awardXp(ctx, refreshed ?? profile, missionXp);
      await logActivity(ctx, userId, refreshed ?? profile, {
        kind: "speaking",
        label: "Daily mission: speak for 30 seconds",
        xpEarned: missionXp,
      });
    }

    const finalProfile = await ctx.db.get(profile._id);
    const newAchievements = finalProfile
      ? await unlockEligibleAchievements(ctx, userId, {
          speakingSessions: finalProfile.speakingSessions,
          wordsMastered: finalProfile.wordsMastered,
          bestStreak: finalProfile.bestStreak,
        })
      : [];

    const finalXp = finalProfile?.xp ?? xp;
    const levelInfo = levelForXp(finalXp);

    return {
      alreadyFinished: false,
      xpEarned: xpEarned + missionXp,
      xp: finalXp,
      level: levelInfo,
      leveledUp: levelInfo.level > levelBefore,
      feedback,
      corrections,
      vocabularyUsed,
      practiceWords: wordsToPractice,
      mission: {
        completedNow: mission.completedNow,
        xpAwarded: missionXp,
        speechSeconds: mission.speechSeconds,
      },
      newAchievements,
      userTurns: userTurns.length,
      wordsSpoken,
      averageWordsPerTurn: avgWords,
      coachSource: doc.coachSource ?? "practice",
      speechSeconds: seconds,
    };
  },
});

/** Leaves a conversation early without awarding the completion bonus. */
export const abandonSession = mutation({
  args: { sessionId: v.id("speakingSessions") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const doc = await ctx.db.get(args.sessionId);
    if (doc && doc.userId === userId && doc.status === "active") {
      const userTurns = doc.turns.filter((turn) => turn.role === "user").length;
      if (userTurns === 0) {
        await ctx.db.delete(doc._id);
        return { deleted: true };
      }
      await ctx.db.patch(doc._id, { status: "completed", completedAt: Date.now() });
    }
    return { deleted: false };
  },
});

/** Debug helper for the settings page: how much speaking time counts today. */
export const todayMission = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const today = new Date().toISOString().slice(0, 10);
    const quest = await ctx.db
      .query("dailyQuests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .unique();
    return {
      speechSeconds: quest?.speechSeconds ?? 0,
      completed: Boolean(quest?.completedAt),
      target: DAILY_MISSION.targetSeconds,
    };
  },
});

export type SpeakingSessionDoc = Doc<"speakingSessions">;

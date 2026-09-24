import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

/* ------------------------------------------------------------------ *
 * WorkTalk Quest data model
 * ------------------------------------------------------------------ */

export const englishLevelValidator = v.union(
  v.literal("basic"),
  v.literal("intermediate"),
);
export type EnglishLevel = Infer<typeof englishLevelValidator>;

// A single correction produced by the speaking coach.
export const correctionValidator = v.object({
  category: v.union(
    v.literal("grammar"),
    v.literal("vocabulary"),
    v.literal("phrasing"),
    v.literal("spelling"),
  ),
  original: v.string(),
  corrected: v.string(),
  explanation: v.string(),
  tip: v.optional(v.string()),
});
export type Correction = Infer<typeof correctionValidator>;

export const chatTurnValidator = v.object({
  role: v.union(v.literal("ai"), v.literal("user")),
  text: v.string(),
  correction: v.optional(correctionValidator),
  createdAt: v.number(),
});
export type ChatTurn = Infer<typeof chatTurnValidator>;

export const speakingFeedbackValidator = v.object({
  grammar: v.object({ label: v.string(), text: v.string() }),
  vocabulary: v.object({ label: v.string(), text: v.string() }),
  pronunciation: v.object({ label: v.string(), text: v.string() }),
  fluency: v.object({ label: v.string(), text: v.string() }),
});
export type SpeakingFeedback = Infer<typeof speakingFeedbackValidator>;

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    /** One row per learner. Holds level, XP, streak and onboarding answers. */
    profiles: defineTable({
      userId: v.id("users"),
      displayName: v.optional(v.string()),
      englishLevel: v.optional(englishLevelValidator),
      goals: v.optional(v.array(v.string())),
      onboardingCompleted: v.boolean(),
      xp: v.number(),
      streak: v.number(),
      bestStreak: v.number(),
      lastActiveDate: v.optional(v.string()), // YYYY-MM-DD (UTC)
      wordsMastered: v.number(),
      speakingSessions: v.number(),
      speechSeconds: v.number(),
      quizCorrect: v.number(),
      quizTotal: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId"]),

    /** Per-word vocabulary state, used for the "words learned" stat. */
    vocabProgress: defineTable({
      userId: v.id("users"),
      wordId: v.string(),
      topicId: v.string(),
      correct: v.number(),
      mastered: v.boolean(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_word", ["userId", "wordId"]),

    /** One row per finished quick-quiz round. */
    quizResults: defineTable({
      userId: v.id("users"),
      topicId: v.string(),
      level: englishLevelValidator,
      correct: v.number(),
      total: v.number(),
      xpEarned: v.number(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    /** One row per vocabulary round. */
    vocabResults: defineTable({
      userId: v.id("users"),
      topicId: v.string(),
      level: englishLevelValidator,
      correct: v.number(),
      total: v.number(),
      xpEarned: v.number(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    /** Multi-turn speaking conversations with the coach. */
    speakingSessions: defineTable({
      userId: v.id("users"),
      topicId: v.string(),
      level: englishLevelValidator,
      status: v.union(v.literal("active"), v.literal("completed")),
      turns: v.array(chatTurnValidator),
      startedAt: v.number(),
      completedAt: v.optional(v.number()),
      speechSeconds: v.optional(v.number()),
      xpEarned: v.optional(v.number()),
      feedback: v.optional(speakingFeedbackValidator),
      vocabularyUsed: v.optional(v.array(v.string())),
      practiceWords: v.optional(v.array(v.string())),
      coachSource: v.optional(v.union(v.literal("ai"), v.literal("practice"))),
    }).index("by_user", ["userId"]),

    /** Progress per career topic (any activity kind). */
    topicProgress: defineTable({
      userId: v.id("users"),
      topicId: v.string(),
      speakingSessions: v.number(),
      bestScore: v.optional(v.number()),
      completed: v.boolean(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_topic", ["userId", "topicId"]),

    /** Unlocked achievements. */
    achievements: defineTable({
      userId: v.id("users"),
      achievementId: v.string(),
      unlockedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_achievement", ["userId", "achievementId"]),

    /** Daily mission progress (e.g. "speak for 30 seconds"). */
    dailyQuests: defineTable({
      userId: v.id("users"),
      date: v.string(), // YYYY-MM-DD (UTC)
      missionId: v.string(),
      speechSeconds: v.number(),
      sessionsCompleted: v.number(),
      xpEarned: v.number(),
      completedAt: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_user_date", ["userId", "date"]),

    /** Activity feed shown on dashboard + progress pages. */
    activities: defineTable({
      userId: v.id("users"),
      kind: v.union(
        v.literal("speaking"),
        v.literal("vocabulary"),
        v.literal("quiz"),
      ),
      label: v.string(),
      topicId: v.optional(v.string()),
      score: v.optional(v.number()),
      xpEarned: v.number(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;

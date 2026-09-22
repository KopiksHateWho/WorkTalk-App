"use node";

/**
 * AI speaking coach.
 *
 * Uses an OpenAI-compatible chat-completions endpoint configured through
 * environment variables (the platform integration gateway by default). When no
 * key is configured — or the request fails — we fall back to the deterministic
 * practice coach and say so honestly in the response (`source: "practice"`).
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { analyzeUtterance, scriptedReply } from "./lib/coach";

const DEFAULT_VLY_BASE = "https://integrations.vly.ai";
const PETITION_TIMEOUT_MS = 14_000;

interface ProviderConfig {
  url: string;
  key: string;
  model: string;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Resolves the provider from environment variables:
 *  - VLY_INTEGRATION_KEY (+ optional VLY_INTEGRATION_BASE_URL, AI_MODEL)
 *  - AI_API_KEY / OPENAI_API_KEY (+ AI_BASE_URL, AI_MODEL) for any
 *    OpenAI-compatible provider
 */
export function resolveProvider(): ProviderConfig | null {
  if (typeof process === "undefined" || !process.env) return null;

  const key =
    process.env.VLY_INTEGRATION_KEY ||
    process.env.AI_API_KEY ||
    process.env.OPENAI_API_KEY;
  if (!key) return null;

  const explicitBase = process.env.AI_BASE_URL;
  if (explicitBase) {
    return {
      url: `${stripTrailingSlash(explicitBase)}/chat/completions`,
      key,
      model: process.env.AI_MODEL || "gpt-4o-mini",
    };
  }

  const base = stripTrailingSlash(
    process.env.VLY_INTEGRATION_BASE_URL || DEFAULT_VLY_BASE,
  );
  const url = base.endsWith("/v1/llm")
    ? `${base}/chat/completions`
    : `${base}/v1/llm/chat/completions`;

  return {
    url,
    key,
    model: process.env.AI_MODEL || "gpt-4o-mini",
  };
}

interface CoachCorrection {
  category: "grammar" | "vocabulary" | "phrasing" | "spelling";
  original: string;
  corrected: string;
  explanation: string;
  tip?: string;
}

interface CoachPayload {
  reply: string;
  correction: CoachCorrection | null;
}

const CATEGORIES = ["grammar", "vocabulary", "phrasing", "spelling"] as const;

function parsePayload(raw: string): CoachPayload | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const record = parsed as Record<string, unknown>;
  const reply = typeof record.reply === "string" ? record.reply.trim() : "";
  if (!reply) return null;

  let correction: CoachCorrection | null = null;
  const rawCorrection = record.correction;
  if (rawCorrection && typeof rawCorrection === "object") {
    const candidate = rawCorrection as Record<string, unknown>;
    const original =
      typeof candidate.original === "string" ? candidate.original.trim() : "";
    const corrected =
      typeof candidate.corrected === "string" ? candidate.corrected.trim() : "";
    const explanation =
      typeof candidate.explanation === "string"
        ? candidate.explanation.trim()
        : "";
    const category = CATEGORIES.find((value) => value === candidate.category);
    if (original && corrected && explanation && corrected !== original) {
      correction = {
        category: category ?? "grammar",
        original,
        corrected,
        explanation,
        tip: typeof candidate.tip === "string" ? candidate.tip.trim() : undefined,
      };
    }
  }

  return { reply, correction };
}

const SYSTEM_PROMPT = `You are Veritass Coach, a warm English speaking tutor for students who are preparing for their careers and for English competitions.

You always:
- Answer in 1-3 short sentences, encouraging and never shaming the learner. Use phrases like "Good try!", "Almost!", "Let's improve this sentence."
- End with exactly ONE follow-up question about the current career topic.
- Keep vocabulary at the learner's level (basic = simple words and short questions, intermediate = natural workplace English with less guidance).
- Point out at most ONE concrete improvement in the learner's last answer (grammar, vocabulary or phrasing). If the answer is already natural, set correction to null.
- NEVER invent scores, percentages, pronunciation ratings or fluency numbers.

Return ONLY valid JSON in exactly this shape:
{"reply": "your short reply ending with one question", "correction": null}
or
{"reply": "your short reply ending with one question", "correction": {"category": "grammar", "original": "the learner sentence", "corrected": "a more natural sentence", "explanation": "short, friendly explanation", "tip": "a useful expression to remember"}}`;

async function callProvider(
  provider: ProviderConfig,
  body: unknown,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PETITION_TIMEOUT_MS);
  try {
    const response = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.warn(
        `[Veritass coach] provider responded ${response.status}: ${await response
          .text()
          .catch(() => "")}`.slice(0, 400),
      );
      return null;
    }
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch (error) {
    console.warn("[Veritass coach] provider call failed", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const tutorTurn = action({
  args: {
    sessionId: v.id("speakingSessions"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.speaking.sessionForCoach, {
      sessionId: args.sessionId,
    });
    if (!session) {
      throw new Error("We couldn't find that conversation.");
    }

    const text = args.text.trim().slice(0, 600);
    const userTurns = session.turns.filter((turn) => turn.role === "user").length;
    const deterministic = analyzeUtterance(text, session.topic.keyWords);

    const provider = resolveProvider();
    if (provider) {
      const transcript = session.turns
        .slice(-6)
        .map((turn) => `${turn.role === "ai" ? "Coach" : "Learner"}: ${turn.text}`)
        .join("\n");

      const raw = await callProvider(provider, {
        model: provider.model,
        temperature: 0.6,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Career topic: ${session.topic.title} — ${session.topic.blurb}
Learner level: ${session.level}
Learner name: ${session.learnerName ?? "the learner"}
Learner goals: ${session.goals.join(", ") || "not set"}
Answer number: ${userTurns + 1}
Useful topic vocabulary: ${session.topic.keyWords.join(", ")}

Conversation so far:
${transcript || "(this is the first answer)"}

Learner's new spoken answer: "${text}"`,
          },
        ],
      });

      const payload = raw ? parsePayload(raw) : null;
      if (payload) {
        await ctx.runMutation(internal.speaking.appendTurn, {
          sessionId: args.sessionId,
          userText: text,
          aiText: payload.reply,
          correction: payload.correction ?? undefined,
          source: "ai",
        });
        return {
          reply: payload.reply,
          correction: payload.correction,
          source: "ai" as const,
        };
      }
    }

    const reply = scriptedReply(
      session.topic,
      session.level,
      userTurns,
      deterministic.matchedKeyWords,
    );
    await ctx.runMutation(internal.speaking.appendTurn, {
      sessionId: args.sessionId,
      userText: text,
      aiText: reply,
      correction: deterministic.correction ?? undefined,
      source: "practice",
    });
    return {
      reply,
      correction: deterministic.correction,
      source: "practice" as const,
    };
  },
});

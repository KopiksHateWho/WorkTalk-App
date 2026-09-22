import { query } from "./_generated/server";

/**
 * Tells the UI whether a real AI provider is configured for speaking practice.
 * The UI uses this to label conversations honestly: never claim AI when the
 * deterministic practice coach is answering.
 */
export const status = query({
  args: {},
  handler: async () => {
    if (typeof process === "undefined" || !process.env) {
      return { aiEnabled: false, model: null as string | null };
    }
    const key =
      process.env.VLY_INTEGRATION_KEY ||
      process.env.AI_API_KEY ||
      process.env.OPENAI_API_KEY;
    return {
      aiEnabled: Boolean(key),
      model: key ? process.env.AI_MODEL || "gpt-4o-mini" : null,
    };
  },
});

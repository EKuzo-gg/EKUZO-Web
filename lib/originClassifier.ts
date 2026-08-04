/**
 * First-touch acquisition-origin classifier.
 *
 * AI in-chat clicks (ChatGPT / Perplexity / Claude) strip the Referer
 * header, so AI-driven traffic otherwise shows up as "direct". This
 * classifies a request into one bucket from URL UTM params + Referer,
 * with crawler traffic excluded so it never pollutes the dataset.
 *
 * Phase 1 is measurement only — the value is persisted in a first-party
 * cookie by middleware.ts and threaded through register → PaymentIntent
 * → webhook to Klaviyo + Google Sheets. No Meta / CAPI side effects.
 */

export type Origin =
  | "ai_chatgpt"
  | "ai_perplexity"
  | "ai_claude"
  | "ai_other"
  | "organic_google"
  | "organic_other"
  | "social"
  | "paid_meta"
  | "paid_other"
  | "direct";

// Known crawlers/bots — when the UA matches, classifyOrigin returns null
// and the caller skips setting the cookie.
const BOT_RE =
  /gptbot|chatgpt-user|claudebot|perplexitybot|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|oai-searchbot/i;

// utm_source values that mean paid Meta (also covers utm_medium=cpc with
// one of these sources — that case is subsumed by the source match).
const META_SOURCE_RE = /^(meta|facebook|fb|ig|instagram)$/i;

// Any other paid medium → paid_other.
const PAID_MEDIUM_RE = /^(cpc|paid|ppc)$/i;

const ORGANIC_OTHER_HOSTS = [
  "bing.com",
  "duckduckgo.com",
  "yahoo.com",
  "ecosia.org",
];

const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "t.co",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "tiktok.com",
  "reddit.com",
  "pinterest.com",
];

// AI assistants / answer engines that don't have a dedicated bucket. Matched
// exact-or-subdomain (NOT substring) and checked BEFORE the organic + social
// lists, because gemini and bard live under *.google.com, and the "t.co"
// entry in SOCIAL_HOSTS is a loose substring match that also catches every
// host ending in "t.com" (copilot.microsoft.com among them).
const AI_OTHER_HOSTS = [
  "gemini.google.com",
  "bard.google.com",
  "aistudio.google.com",
  "copilot.microsoft.com",
  "m365.cloud.microsoft",
  "you.com",
  "phind.com",
  "poe.com",
  "grok.com",
  "meta.ai",
  "mistral.ai",
];

// utm_source values assistants stamp on out-links that don't map to one of
// the three named AI buckets. Compared lowercased + trimmed.
const AI_OTHER_UTM_SOURCES = new Set([
  "gemini",
  "gemini.google.com",
  "bard.google.com",
  "google-gemini",
  "copilot",
  "copilot.microsoft.com",
  "bingchat",
  "you.com",
  "phind.com",
  "poe.com",
  "grok",
  "grok.com",
  "meta.ai",
  "mistral.ai",
]);

function hostnameOf(referer: string | null): string {
  if (!referer) return "";
  try {
    return new URL(referer).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Returns the origin bucket, or `null` when the request is a known
 * bot/crawler (caller must NOT set the cookie in that case).
 *
 * Precedence: bot exclusion → UTM params → Referer host → 'direct'.
 */
export function classifyOrigin(input: {
  searchParams: URLSearchParams;
  referer: string | null;
  userAgent: string | null;
}): Origin | null {
  // a) Bot exclusion — keep crawler hits out of the dataset entirely.
  if (BOT_RE.test(input.userAgent || "")) return null;

  // b) UTM params (highest signal).
  const utmSource = (input.searchParams.get("utm_source") || "")
    .toLowerCase()
    .trim();
  const utmMedium = (input.searchParams.get("utm_medium") || "")
    .toLowerCase()
    .trim();

  if (
    utmSource === "chatgpt.com" ||
    utmSource === "chat.openai.com" ||
    utmSource === "openai.com"
  )
    return "ai_chatgpt";
  if (utmSource === "perplexity.ai") return "ai_perplexity";
  if (utmSource === "claude.ai" || utmSource === "claude.com")
    return "ai_claude";
  // Any other assistant that self-identifies in utm_source.
  if (AI_OTHER_UTM_SOURCES.has(utmSource)) return "ai_other";
  if (META_SOURCE_RE.test(utmSource)) return "paid_meta";
  if (PAID_MEDIUM_RE.test(utmMedium)) return "paid_other";

  // c) Referer hostname (only when no UTM match above).
  const host = hostnameOf(input.referer);
  if (host) {
    if (host.includes("chatgpt.com") || host.includes("chat.openai.com"))
      return "ai_chatgpt";
    if (host.includes("perplexity.ai")) return "ai_perplexity";
    if (host.includes("claude.ai") || host.includes("claude.com"))
      return "ai_claude";
    // Other assistant hosts. Must stay above the organic + social lists:
    // see the AI_OTHER_HOSTS comment for why.
    if (AI_OTHER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)))
      return "ai_other";
    if (host.includes("google.com") || /google\.co\.[a-z]/.test(host))
      return "organic_google";
    if (ORGANIC_OTHER_HOSTS.some((h) => host.includes(h)))
      return "organic_other";
    if (SOCIAL_HOSTS.some((h) => host.includes(h))) return "social";
  }

  // d) Fallback.
  return "direct";
}

/**
 * True when the bucket is one of the AI-sourced ones. Used by the client-side
 * referral capture in lib/attribution.ts to decide whether to emit the GA4
 * `ai_referral` event, and safe for any future Phase 2 CAPI gating.
 */
export type AiOrigin = Extract<Origin, `ai_${string}`>;

export function isAiOrigin(origin: Origin | null): origin is AiOrigin {
  return origin !== null && origin.startsWith("ai_");
}

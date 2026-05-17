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

  if (utmSource === "chatgpt.com" || utmSource === "chat.openai.com")
    return "ai_chatgpt";
  if (utmSource === "perplexity.ai") return "ai_perplexity";
  if (utmSource === "claude.ai" || utmSource === "claude.com")
    return "ai_claude";
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
    // gemini/bard live under *.google.com — must be checked before the
    // organic_google google.com substring match below.
    if (/(gemini|bard)\.google\.com/.test(host)) return "ai_other";
    if (host.includes("google.com") || /google\.co\.[a-z]/.test(host))
      return "organic_google";
    if (ORGANIC_OTHER_HOSTS.some((h) => host.includes(h)))
      return "organic_other";
    if (SOCIAL_HOSTS.some((h) => host.includes(h))) return "social";
  }

  // d) Fallback.
  return "direct";
}

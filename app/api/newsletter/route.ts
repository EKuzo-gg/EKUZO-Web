import { NextRequest, NextResponse } from "next/server";

// Allowlists for the optional utm_* fields (T1). Anything outside these
// sets is dropped, not rejected: the request still succeeds, the field
// just falls back to its default below.
const UTM_SOURCE_ALLOWLIST = new Set(["newsletter-signup", "blog"]);
const UTM_MEDIUM_ALLOWLIST = new Set(["popup", "sticky", "footer"]);
const UTM_CAMPAIGN_ALLOWLIST = new Set(["thumbs", "classic"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, utm_source, utm_medium, utm_campaign } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Missing or invalid utm_source falls back to today's hardcoded value.
    const resolvedUtmSource = UTM_SOURCE_ALLOWLIST.has(utm_source)
      ? utm_source
      : "newsletter-signup";
    // Missing or invalid utm_medium / utm_campaign are omitted entirely,
    // matching today's route, which never sends these keys at all.
    const resolvedUtmMedium = UTM_MEDIUM_ALLOWLIST.has(utm_medium)
      ? utm_medium
      : undefined;
    const resolvedUtmCampaign = UTM_CAMPAIGN_ALLOWLIST.has(utm_campaign)
      ? utm_campaign
      : undefined;

    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error("[Newsletter] Missing Beehiiv credentials");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Create Beehiiv subscription
    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          utm_source: resolvedUtmSource,
          // undefined-valued keys are dropped by JSON.stringify, so when
          // these fall back to undefined the outbound body is byte-identical
          // to today's (case (a): no utm_medium, no utm_campaign key at all).
          utm_medium: resolvedUtmMedium,
          utm_campaign: resolvedUtmCampaign,
          referring_site: "https://ekuzo.gg",
          custom_fields: firstName
            ? [{ name: "first_name", value: firstName }]
            : [],
        }),
      }
    );

    if (!beehiivRes.ok) {
      const errData = await beehiivRes.json().catch(() => ({}));
      console.error("[Newsletter] Beehiiv error:", errData);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    const beehiivData = await beehiivRes.json();
    const subId = beehiivData?.data?.id;

    // Tag the subscriber (non-blocking, fire-and-forget, per T3)
    if (subId) {
      // Blog signups never get source-newsletter (T2: strict either/or).
      // variant-<campaign> is only added when the campaign resolved to a
      // valid value; a blog signup with no valid campaign gets source-blog
      // alone.
      const tags =
        resolvedUtmSource === "blog"
          ? resolvedUtmCampaign
            ? ["source-blog", `variant-${resolvedUtmCampaign}`]
            : ["source-blog"]
          : ["source-newsletter"];

      fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subId}/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({ tags }),
        }
      ).catch((err) =>
        console.error("[Newsletter] Tagging failed:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Newsletter] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

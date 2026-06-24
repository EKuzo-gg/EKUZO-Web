import { NextRequest, NextResponse } from "next/server";

// EKUZO x UF League (Summer Swamp Showdown 2026) signup → Beehiiv.
// Near-verbatim clone of /api/newsletter and /api/woodward/subscribe;
// differs only in utm_source and the source-uf-swamp-2026 tag so these
// collegiate-community signups are segmentable in Beehiiv for the
// targeted follow-up later. Captures into the same "gaming matters"
// nurture as everyone else (per Jamie: not precluded from main messaging).
// NOTE for Jamie (API lane): confirm the tag name before going live.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error("[Swamp] Missing Beehiiv credentials");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

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
          utm_source: "uf-swamp-2026",
          referring_site: "https://ekuzo.gg/swamp",
          custom_fields: firstName
            ? [{ name: "first_name", value: firstName }]
            : [],
        }),
      }
    );

    if (!beehiivRes.ok) {
      const errData = await beehiivRes.json().catch(() => ({}));
      console.error("[Swamp] Beehiiv error:", errData);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    const beehiivData = await beehiivRes.json();
    const subId = beehiivData?.data?.id;

    // Tag the subscriber (non-blocking). Create-subscription doesn't accept
    // tags — they must be POSTed to the subscription's /tags endpoint.
    if (subId) {
      fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subId}/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({ tags: ["source-uf-swamp-2026"] }),
        }
      ).catch((err) => console.error("[Swamp] Tagging failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Swamp] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

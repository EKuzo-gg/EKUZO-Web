import { NextRequest, NextResponse } from "next/server";

// EKUZO x Woodward partner-page signup → Beehiiv.
// Capture-only: no welcome email, no automation. Tags source-woodward-pilot
// so the cohort is addressable; a coach follows up manually.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, age } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
      console.error("[Woodward] Missing Beehiiv credentials");
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
          send_welcome_email: false,
          utm_source: "woodward-signup",
          referring_site: "https://ekuzo.gg/woodward",
          custom_fields: [
            ...(firstName ? [{ name: "first_name", value: firstName }] : []),
            ...(age ? [{ name: "child_age", value: String(age) }] : []),
          ],
        }),
      }
    );

    if (!beehiivRes.ok) {
      const errData = await beehiivRes.json().catch(() => ({}));
      console.error("[Woodward] Beehiiv error:", errData);
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
          body: JSON.stringify({ tags: ["source-woodward-pilot"] }),
        }
      ).catch((err) => console.error("[Woodward] Tagging failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Woodward] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

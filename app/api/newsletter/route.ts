import { NextRequest, NextResponse } from "next/server";

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
          utm_source: "newsletter-signup",
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

    // Tag the subscriber (non-blocking)
    if (subId) {
      fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subId}/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({ tags: ["source-newsletter"] }),
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

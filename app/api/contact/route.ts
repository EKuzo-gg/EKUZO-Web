import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, organization, contactMethod, email, phone, message, pageUrl } = body;

    // Validate required fields
    if (!name || !contactMethod) {
      return NextResponse.json({ error: "Name and contact method are required" }, { status: 400 });
    }
    if (contactMethod === "email" && !email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (contactMethod === "text" && !phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();

    // 1. Write to Google Sheets via Apps Script (same pattern as registration)
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sheet: "contact_inquiries",
            name,
            organization: organization || "",
            contact_method: contactMethod,
            email: email || "",
            phone: phone || "",
            message: message || "",
            page_url: pageUrl || "",
            submitted_at: submittedAt,
          }),
        });
      } catch (sheetErr) {
        console.error("[Contact] Google Sheets write failed:", sheetErr);
        // Non-blocking — continue even if Sheets fails
      }
    }

    // 2. Add to Beehiiv as a lead (if they provided email)
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (email && BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
      try {
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
              utm_source: "contact-form",
              referring_site: pageUrl || "https://ekuzo.gg",
              custom_fields: [
                { name: "parent_first_name", value: name.split(" ")[0] || name },
                { name: "parent_last_name", value: name.split(" ").slice(1).join(" ") || "" },
                ...(phone ? [{ name: "parent_phone", value: phone }] : []),
              ],
            }),
          }
        );

        if (beehiivRes.ok) {
          const beehiivData = await beehiivRes.json();
          const subId = beehiivData?.data?.id;

          // Tag the subscriber
          if (subId) {
            await fetch(
              `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions/${subId}/tags`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${BEEHIIV_API_KEY}`,
                },
                body: JSON.stringify({ tags: ["source-contact-form"] }),
              }
            );
          }
        }
      } catch (beehiivErr) {
        console.error("[Contact] Beehiiv enrollment failed:", beehiivErr);
        // Non-blocking
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

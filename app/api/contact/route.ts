import { NextRequest, NextResponse } from "next/server";

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

    // 1. Add to Beehiiv as a lead (if they provided email)
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
                { name: "first_name", value: name.split(" ")[0] || name },
                { name: "last_name", value: name.split(" ").slice(1).join(" ") || "" },
                ...(phone ? [{ name: "phone", value: phone }] : []),
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

    // 3. Email notification to Karlin via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      try {
        const contactInfo = contactMethod === "email"
          ? `<strong>Email:</strong> <a href="mailto:${email}">${email}</a>`
          : `<strong>Phone:</strong> ${phone}`;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "EKUZO Website <onboarding@resend.dev>",
            to: "karlin@ekuzo.gg",
            subject: `New inquiry from ${name}${organization ? ` (${organization})` : ""}`,
            html: `
              <div style="font-family: sans-serif; max-width: 480px;">
                <h2 style="margin: 0 0 16px;">New "Talk to Humans" inquiry</h2>
                <p><strong>Name:</strong> ${name}</p>
                ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ""}
                <p><strong>Preferred contact:</strong> ${contactMethod}</p>
                <p>${contactInfo}</p>
                ${message ? `<p><strong>Message:</strong><br/>${message}</p>` : ""}
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                <p style="color: #999; font-size: 12px;">
                  From: ${pageUrl || "ekuzo.gg"}<br/>
                  Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}
                </p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("[Contact] Resend email failed:", emailErr);
        // Non-blocking
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

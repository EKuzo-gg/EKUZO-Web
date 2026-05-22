/**
 * Klaviyo event tracking — minimal helper for the mid-funnel capture
 * routes (`/api/camps/lead`, `/api/camps/abandoned`).
 *
 * Posting to `/api/events` upserts the profile (from the `profile` block)
 * AND records the event in a single call, so a metric-triggered Klaviyo
 * flow can nurture the person. This mirrors, mid-funnel, what the Stripe
 * webhook already does post-purchase ("Placed Order"): leads and
 * abandoners now land in Klaviyo too, not just Beehiiv.
 *
 * Best-effort by design — never throws. The capture routes treat this as
 * fire-and-forget; a Klaviyo outage must never block the registration
 * form or the payment flow.
 *
 * The webhook's richer Klaviyo path (profile-import + list + event) is
 * intentionally NOT refactored through here — it does more and is a
 * single call site. This helper stays scoped to the two capture routes.
 */

const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;

// Pinned to the same Klaviyo API revision the Stripe webhook uses, so
// both code paths speak one contract.
const KLAVIYO_REVISION = "2025-07-15";

type KlaviyoEventInput = {
  /** Metric name — the trigger a Klaviyo flow listens on. */
  metricName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  /** Event properties — flow filters / template variables read these. */
  properties?: Record<string, string>;
};

/**
 * Track a Klaviyo event (and upsert the profile it belongs to).
 * Resolves to void; failures are logged, never thrown.
 */
export async function trackKlaviyoEvent(input: KlaviyoEventInput): Promise<void> {
  if (!KLAVIYO_API_KEY) {
    console.warn(
      `⚠️  KLAVIYO_PRIVATE_API_KEY not set — skipping Klaviyo event "${input.metricName}"`
    );
    return;
  }

  try {
    const profileAttributes: Record<string, unknown> = { email: input.email };
    if (input.firstName) profileAttributes.first_name = input.firstName;
    if (input.lastName) profileAttributes.last_name = input.lastName;
    if (input.phone) profileAttributes.phone_number = input.phone;

    const payload = {
      data: {
        type: "event",
        attributes: {
          metric: {
            data: { type: "metric", attributes: { name: input.metricName } },
          },
          profile: {
            data: { type: "profile", attributes: profileAttributes },
          },
          properties: input.properties || {},
          time: new Date().toISOString(),
        },
      },
    };

    const res = await fetch("https://a.klaviyo.com/api/events", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `Klaviyo event "${input.metricName}" failed:`,
        res.status,
        errText
      );
    } else {
      console.log(
        `✅ Klaviyo event tracked: "${input.metricName}" for ${input.email}`
      );
    }
  } catch (err) {
    console.error(
      `Klaviyo event "${input.metricName}" error:`,
      err instanceof Error ? err.message : err
    );
  }
}

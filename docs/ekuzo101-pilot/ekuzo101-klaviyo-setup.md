# EKUZO 101 Pilot — Klaviyo Setup Checklist

**Owner:** Jamie  
**Status:** Pre-launch — complete before activating the first real registration  
**Trigger:** "Registered Pilot" metric (auto-created by first test POST to `/api/ekuzo101/register`)

---

## Overview

The register route fires a "Registered Pilot" Klaviyo event with these properties:

| Property | Example |
|----------|---------|
| `product` | `"EKUZO101"` |
| `weeks_label` | `"Tuesdays & Thursdays - Weeks of Jul 21, Jul 28 - 7-8:30 PM ET"` |
| `weeks_count` | `4` |
| `gamer_name` | `"Alex Fitch"` |
| `gamer_count` | `1` |

Use `{{ event.weeks_label }}`, `{{ event.gamer_name }}`, etc. in templates.

---

## Checklist

### Step 1 — Create the "Registered Pilot" metric via a test submission

Run the dev server and submit a test registration against `/api/ekuzo101/register`. This creates the "Registered Pilot" metric in Klaviyo so it appears as a flow trigger option. Do this BEFORE step 5 or the trigger metric won't be selectable.

```bash
npm run dev
# In another terminal or Insomnia/Postman:
curl -X POST http://localhost:3000/api/ekuzo101/register \
  -H "Content-Type: application/json" \
  -d '{
    "gamers": [{"firstName":"Test","lastName":"Gamer"}],
    "weeks": ["2026-07-22","2026-07-29","2026-08-05","2026-08-12"],
    "parentFirstName":"Test","parentLastName":"Parent",
    "parentEmail":"test@example.com","parentPhone":"5551234567",
    "timezone":"America/Chicago"
  }'
```

(Note: Use real upcoming Tuesday ISO dates when you run this — the weeks above are examples and may be past by the time you read this.)

### Step 2 — Clone the EKUZO100 confirmation flow

Go to: https://www.klaviyo.com/flow/UWMYHm/edit

Click the three-dot menu on the flow and select "Clone". Rename the clone to:

```
Pilot Confirmation - EKUZO 101
```

### Step 3 — Create the "Pilot Confirmation" email template

In Klaviyo: Campaigns > Email Templates > Create Template. Name it:

```
Pilot Confirmation - EKUZO 101
```

**Subject line:**
```
{{event.gamer_name}} is in - here are your EKUZO 101 weeks
```

**Preview text:**
```
No card, no pressure. Just your schedule, a real coach, and what to expect.
```

**Body** (plain-text structure — use your preferred Klaviyo drag-and-drop builder to style):

```
Hey {{event.parent_first_name}},

{{event.gamer_name}} is officially in the pilot. Here are the weeks you selected:

{{event.weeks_label}}

Sessions run Tuesdays and Thursdays, 7:00-8:30 PM ET. Same coach, same
teammates, every session.

A few things before Day 1:

- Your coach will reach out directly before the first session with a short
  intro. You'll know who's running the room before your gamer logs on.

- Get League of Legends downloaded and updated at leagueoflegends.com.
  Free to download. Make sure the game is updated and the account is ready
  to go before the first Tuesday.

- A headset with a mic is the only gear you need.

That's it. No homework, no prep packet. Just show up.

If anything comes up before your first session - schedule change, equipment
question, anything - reply to this email and a real person will respond.

Looking forward to having {{event.gamer_name}} on the team.

Karlin
Founder, EKUZO
```

### Step 4 — Create the "Pilot Toolkit" email template

In Klaviyo: Campaigns > Email Templates > Create Template. Name it:

```
Pilot Toolkit - EKUZO 101
```

**Subject line:**
```
Before Tuesday: what to install and what to expect
```

**Preview text:**
```
Day 1 checklist plus what a Tuesday/Thursday night actually looks like.
```

**Body:**

```
Hey {{event.parent_first_name}},

Your first session is coming up. Here's the short version of what to do
before {{event.gamer_name}} logs on.

---

BEFORE DAY 1: THREE THINGS

1. Download or update League of Legends.
   Free at leagueoflegends.com. Open the client, let it update fully,
   and log in to confirm the account is working. Takes 15-30 minutes
   depending on connection speed - don't leave it for the last minute.

2. Plug in a headset with a mic.
   Voice chat is how the team communicates. Built-in laptop speakers and
   mic work in a pinch but aren't great. A basic wired gaming headset
   ($15-20) is plenty.

3. Join the EKUZO Discord server.
   Your coach will send the invite link before the first session. This
   is where the team meets, where voice chat happens, and where your
   coach is reachable between sessions. The server is private,
   invite-only, and moderated by the coach.

---

WHAT TUESDAY/THURSDAY NIGHTS LOOK LIKE

7:00 PM - Everyone logs on to Discord. Coach takes attendance, does a
  quick team check-in.

7:05 - Warmup and session goal. Coach sets one specific thing the team
  is working on tonight.

7:10-8:10 - Coached play. The team runs matches together. Coach is on
  voice, actively guiding, not just watching.

8:10-8:30 - Debrief. Coach pulls up a play, the team talks through what
  happened, what worked, what to do differently next time.

8:30 - Session over. Hard stop.

---

If anything comes up - technical trouble, schedule conflict, questions
before the first session - reply here or reach us at hello@ekuzo.gg.

See you Tuesday.

Karlin
Founder, EKUZO
```

### Step 5 — Update the flow trigger to "Registered Pilot"

In the cloned flow ("Pilot Confirmation - EKUZO 101"):

1. Click the trigger block at the top.
2. Change the trigger metric from the existing EKUZO100 metric to **"Registered Pilot"**.
3. Save.

The "Registered Pilot" metric only appears here if you completed Step 1 first.

### Step 6 — Remove the product filter

In the cloned flow, look for a conditional split or filter that checks `product == "EKUZO100"`. Delete it or set it to pass everyone through. The 101 pilot flow should send to all "Registered Pilot" events.

### Step 7 — Swap Email #1 to the pilot confirmation template

Click the first email action in the flow. Swap the template to:

```
Pilot Confirmation - EKUZO 101
```

Save. Preview with a test profile that has `event.gamer_name` and `event.weeks_label` set.

### Step 8 — Wire the toolkit email (optional, recommended)

If the cloned flow has a second email (e.g. a 1-day delay email), swap its template to:

```
Pilot Toolkit - EKUZO 101
```

If you want to adjust the delay (e.g. send the toolkit email 1 day before their first session), this is the time to do it.

### Step 9 — Set the flow to DRAFT; activate when ready

Set the flow to **Draft** status now. Activate it only when you are ready for the first real gamer to register. This prevents accidental sends during testing.

### Step 10 — Send a test and confirm receipt

Add yourself as a test subscriber (use your own email, trigger a "Registered Pilot" event via the API or Klaviyo's "Send test" button). Confirm:

- Subject line renders correctly
- `{{event.gamer_name}}` and `{{event.weeks_label}}` populate
- No broken template variables (they appear as literal `{{...}}` text when undefined)
- No payment references appear anywhere in the email

Once confirmed, set the flow to **Live**.

---

## Beehiiv Custom Fields (Required Before Launch)

The register route sends these custom fields to Beehiiv. They must exist as custom fields in your Beehiiv publication settings or Beehiiv will silently drop them:

| Field name | Type | Notes |
|------------|------|-------|
| `weeks_label` | Text | New — must be created. Example: "Tuesdays & Thursdays - Weeks of Jul 21, Jul 28 - 7-8:30 PM ET" |
| `program` | Text | Should already exist (shared with camps/e100). Verify. |
| `gamer_name` | Text | Should already exist. Verify. |
| `gamer_count` | Text | Should already exist. Verify. |
| `first_name` | Text | Should already exist. Verify. |
| `last_name` | Text | Should already exist. Verify. |
| `phone` | Text | Should already exist. Verify. |
| `timezone` | Text | Should already exist. Verify. |

To create `weeks_label`: Beehiiv Dashboard > Publication Settings > Custom Fields > Add field. Type: Text, Name: `weeks_label`.

---

## Environment Variables Checklist

Confirm these are set in `.env.local` and in Netlify before Phase 4:

- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`
- `KLAVIYO_PRIVATE_API_KEY`
- `KLAVIYO_PURCHASERS_LIST_ID`
- `GOOGLE_SHEETS_WEBHOOK_URL`

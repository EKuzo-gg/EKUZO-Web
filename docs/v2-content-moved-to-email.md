# V2 Camps Page — Content Moved to Email

Aaron decided 2026-05-20 that two sections on `/programs/ekuzo-camps/v2`
were too detailed for the landing page but valuable enough to deliver
through email instead. The JSX is commented out (not deleted) at the
relevant section markers in `app/programs/ekuzo-camps/v2/page.tsx` so it
can be restored later if the call reverses.

This file is the canonical source for that copy — drop it into Beehiiv
emails as drafted, or rework as needed.

---

## Section: Team Matching — "A coach builds your team. Not an algorithm."

**Suggested use:** post-registration email (after Stripe confirmation,
before camp week starts). Sets the expectation that squad assignment is
deliberate, builds trust in the days between signup and Day 1.

**Eyebrow:** How Squads Are Built

**Headline:** A coach builds your team. Not an algorithm.

**Intro paragraph:**

> Before camp starts, a coach hand-picks every 5-player squad based on
> skill level, region, and the time slot you selected. Friends signing
> up together stay together, matched with similar-skill peers. The
> goal: everyone is challenged, no one is bored, and Day 1 doesn't feel
> like a coin flip.

**Three-step process:**

01. **You tell us about your gamer**
    Skill level, region, the time slot that fits your summer. Friends
    signing up together stay together.

02. **A coach hand-builds the squad**
    No algorithm. A real coach pairs kids by skill, region, and
    complementary roles so everyone is challenged and no one is bored.

03. **You meet your team Day 1**
    Squad name. Discord server. Five players. One coach. It's yours
    from the first minute of Monday.

---

## Section: Discord for Families — "Discord, but built for parents."

**Suggested use:** pre-camp orientation email (a few days before camp
starts) — covers the platform parents are about to encounter, addresses
the "what is Discord?" question without forcing a 5-minute primer on
the landing page.

**Eyebrow:** For Families

**Headline:** Discord, but built for parents.

**Intro paragraphs:**

> Discord is the platform we use for every squad — voice rooms, chat,
> screen sharing, post-camp hangouts. If you've never used it, here's
> the short version: it's a private, invite-only group chat for your
> gamer's squad. No public lobbies, no strangers.

> We built our setup with three layers of oversight so your family is
> never alone in there.

**Three layers:**

**Layer 01 — You own the Discord account**
Discord accounts belong to the parent, not the kid. You have access to
every chat, every voice room, every piece of content — whenever you
want to look.

**Layer 02 — Coach moderates the room**
Just like a teacher in a classroom. The coach sets the tone, enforces
the Code of Conduct, and handles anything that comes up in real time.

**Layer 03 — Admins watch every camp**
EKUZO admins have full visibility across every camp and class. They
can review, flag, and step in on anything — even after the fact.

**Closing reassurance:**

> The squad's Discord server stays open after camp week ends, under the
> same three-layer oversight. You don't lose the team, and you don't
> lose the moderation.

---

## Restoring these sections to the page

1. In `app/programs/ekuzo-camps/v2/page.tsx`, search for `HIDDEN —
   moved to docs/v2-content-moved-to-email.md`.
2. Uncomment the JSX block.
3. Renumber the surrounding sections back to their original positions
   if needed.
4. Re-check the torn paper chain — both hidden sections had divider
   neighbors that may need adjusting.

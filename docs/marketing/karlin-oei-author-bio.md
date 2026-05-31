# Karlin Oei — Author Page + Bio Asset

Created: 2026-05-25 · For the author-page + byline-normalization infra task.
Built from: `lib/schema.ts` (`coachKarlinSchema`), the EKUZO Camps page coach bio, the personal
story in `/blog/what-your-kids-gaming-is-telling-you`, and the methodology founder quotes.
LinkedIn (`https://www.linkedin.com/in/karlinoei/`) returned a login wall on fetch — items only it
would confirm are flagged **[verify from LinkedIn]** below.

---

## Authorship reality (so the author page is scoped right)

Karlin authored **5 of 7** posts; two are guest bylines.

| Post | Author (byline string today) | Normalize to |
|---|---|---|
| league-of-legends-youth-development | "Karlin" | **Karlin Oei** |
| summer-camps-for-kids-who-game-2026 | "Karlin" | **Karlin Oei** |
| what-your-kids-gaming-is-telling-you | "Karlin" | **Karlin Oei** |
| what-homeschool-parents-taught-us-about-gaming | "Karlin Oei" | Karlin Oei (already correct) |
| when-gaming-helps-homeschool-kids | "Karlin Oei" | Karlin Oei (already correct) |
| conquering-my-mountain… | "John Hay" (student guest) | leave as guest byline |
| our-family-s-esports-journey… | "Lisa Holt" (parent guest) | leave as guest byline |

**Byline normalization:** standardize Karlin's display byline to **"Karlin Oei"** everywhere (three
posts currently say just "Karlin") and link it to the author page. The two guest authors (John Hay,
Lisa Holt) don't need full author pages — a plain byline is fine, optionally a one-line "Guest
contributor" note.

**The "Faith" question:** the schema node name is currently `Karlin "Faith" Oei`. Jamie wants the
public byline to read consistently **Karlin Oei**. Recommendation: set the display `name` to
`Karlin Oei` and move the gamer handle to schema `alternateName: "Faith"` (keeps the entity tie for
anyone who knows him as Faith — e.g., the camps page "KARLIN \"FAITH\" OEI" and the
`coach-karlin-faith.jpg` image — without putting a nickname in the byline).

---

## Bio copy

### Short (byline card / end-of-post, ~45 words)

> **Karlin Oei** is the founder of EKUZO. A former national collegiate esports captain who earned
> $80,000+ in scholarships playing competitively, he started EKUZO to give kids the structure,
> coaching, and team he didn't have growing up — the missing container around a game they already
> love.

### Long (author page, ~180 words)

> **Karlin Oei** is the founder of EKUZO, a youth esports coaching program that turns a kid's
> existing gaming into a structured, coached, team-based experience.
>
> He builds EKUZO from the inside of the problem it solves. Karlin grew up gaming through social
> anxiety, low self-esteem, and a complicated home, and school rarely reached him — but games did.
> What he didn't have was anyone who knew what to do with that: no team, no routine, no coach to
> turn the hours into growth. He only started to see what gaming had taught him — ownership,
> accountability, how to lead — at 18, and stumbled into competitive League of Legends in college,
> where he became a national collegiate captain and earned $80,000+ in esports scholarships. EKUZO
> is the container he wishes he'd had.
>
> He writes here about what a kid's gaming is really telling parents, why structure beats
> restriction, and what coached play actually looks like.
>
> *"Our job isn't to add pedagogy to games; it's to help students see it, use it, and carry that
> mindset into school, careers, and life."*

---

## Schema enrichment for `coachKarlinSchema` (lib/schema.ts)

The node exists; add/confirm these fields (don't create a second Person — keep the one canonical
`@id`):

```
name: "Karlin Oei",                    // was: Karlin "Faith" Oei  → move nickname to alternateName
alternateName: "Faith",
jobTitle: "Founder",
worksFor: { "@id": ORG_ID },           // tie to the EducationalOrganization node
description: "Founder of EKUZO. Former national collegiate esports captain who earned $80,000+ in scholarships; builds EKUZO as the structured, coached environment he didn't have growing up.",
knowsAbout: ["youth esports", "esports coaching", "League of Legends", "youth development", "structured gaming", "screen time", "online safety for kids"],
sameAs: [
  "https://www.linkedin.com/in/karlinoei/"
  // [verify from LinkedIn] add any other public profiles (X, esports wiki, etc.)
],
image: `${SITE}/images/coach-karlin-faith.jpg`,
url: `${SITE}/blog/author/karlin-oei`   // the new author page, once it exists
```

On the author page itself, render the Person schema by reference (`{ "@id": KARLIN_ID }`) per the
`lib/schema.ts` single-canonical-entity rule — don't hand-roll a second Person node in the page.

---

## Facts to verify from LinkedIn before publishing

The bio above is safe on what the repo already states. These would sharpen it but should be
confirmed (couldn't pull LinkedIn — login wall):

- **Which college / collegiate team** he captained, and the years.
- Any **coaching certifications** or notable titles/placements worth a line.
- Current exact title phrasing (Founder, Founder & CEO, etc.) and whether he wants the LoL rank
  ("Peak Challenger Jungler," from the camps page) in the public bio or kept to the camps context.
- Any other public profile URLs for `sameAs` (X, esports fandom wiki, etc.).

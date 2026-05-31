# FAQ Handoff — All 5 Pages — 2026-05-25

Paste-ready FAQ sets for the five FAQ-bearing canonical pages. For each page: the **full recommended question set** (conversion-ordered, not capped at the current count), with answer copy for everything new or changed and a `KEEP` tag for answers that stay as-is.

## How to use this

- Answers are sourced from `knowledge-base/wiki/domains/ekuzo/ekuzo-faq-canon.md` (canon was updated 2026-05-25 to match). **If you change copy here, update canon first** so they don't drift again.
- Every page already wires `buildFAQPageSchema(...)` — keep it. Each Q/A pair is emitted as `FAQPage` JSON-LD for AI citation.
- Ordering rule: conversion-critical objections at the top (safety, fit, price, commitment), legitimacy/outcome and long-tail below. Accordion format means more questions is cheap, so list the right ones.
- Concurrency: produced while the repo was being edited in Claude Code. Re-verify each file's current array before pasting.

## Three facts confirmed 2026-05-25 (apply everywhere)

1. **Teams season length:** "about 15–16 weeks, following the school calendar" (varies by season/region). Not a hard 15.
2. **Teams sessions/week:** default is **two 90-minute** sessions. Home-track always two 90-min; some **school-based** teams run **three 60-minute** sessions.
3. **Teams pricing:** **$576 paid in full (10% off), or 4 × $160 = $640.**

---

# 1. /programs/ekuzo-teams

Audience: home-track parents (self-pay $640) first, school decision-makers second. Route deep institutional questions to `/schools`.

**1. How do you keep online spaces safe? What about strangers, toxic chat, older kids, or spending traps?**
EKUZO operates as a "walled garden" specifically designed to answer the four most common parent safety concerns: strangers, toxic chat, older kids, and in-game spending traps. Every session is coach-led and recorded. Our Discord and online platforms are actively moderated. Teams are verified, meaning your child plays with the same known teammates, not anonymous matchmaking. Opponents are limited to other youth participants in the same ecosystem, so your child is not randomly matched against unknown adults or older teens. Students sign a Code of Conduct, and expectations are clearly and consistently enforced. There are no in-session monetization prompts, loot boxes, or pressure to spend.

**2. Is this only for competitive students, or can a beginner join a full season?**
EKUZO Teams is built for any student who games, from casual to competitive; the focus is growth, not rank. Coaches meet students where they are, and teams are balanced by age and skill level, so a full season is plenty of time for a newer player to develop. If your gamer is brand new or hesitant, EKUZO100 (our 4-week program) is the lowest-pressure way to start before committing to a season.

**3. Do we have to commit to a full season, or can we try first?**
You can try first. EKUZO100 is a 4-week program designed as the low-risk on-ramp: the same coaching system in small groups, with no semester commitment. Many families start there, then move into EKUZO Teams for a full season once their gamer is hooked. There's no automatic renewal between seasons; your family decides each time.

**4. How much does EKUZOTEAMS cost?**
$576 paid in full (a 10% discount), or four monthly payments of $160 ($640 total). Like all EKUZO programs, that works out to roughly $20 per session of small-group, coach-led training. The price covers the full system behind the sessions: elite coach training, moderated team spaces, curriculum design, and competition infrastructure.

**5. How long is a season, and how many sessions per week?**
Each EKUZO Teams season runs about 15 to 16 weeks, following the school calendar (exact length varies by season and region). The default is two 90-minute sessions per week. Home-track teams always run two 90-minute sessions; some school-based teams opt for three 60-minute sessions to fit their schedule. Home teams practice after school (around 4:00–5:30) or in the evening (around 7:00–8:30).

**6. What's the difference between School and Home tracks?**
Both tracks deliver the same EKUZO coaching system. The School track runs in partnership with a school, often during or after school hours with a proctor present. The Home track is for families who want to participate independently, with sessions scheduled after school or in the evening.

**7. How are teams formed?**
Rosters are 10 to 12 players to support 5v5 match play. We balance teams by age and skill level and prioritize local cohorts when possible, so friendships can extend beyond the screen.

**8. What equipment does my child need?**
A computer (PC or Mac) that can run League of Legends, a stable internet connection, and a headset with a microphone. The game is free to download and does not require high-end hardware.

**9. What comes after a season?**
Students re-enroll each semester, and as relationships and skills deepen, teams often continue together across multiple seasons. There's no automatic renewal; your family decides each time. Some families also use EKUZO Camps during breaks to keep momentum between seasons.

---

# 2. /parents

Audience: skeptical parents evaluating EKUZO for their child. This is the objection-handling hub — it should use the deepest part of canon. Expanded from 6 to 10.

**1. How do you keep online spaces safe?**  *(UPGRADE — currently the thin version)*
EKUZO operates as a "walled garden" designed around the four safety concerns parents raise most: strangers, toxic chat, older kids, and in-game spending. Every session is coach-led and recorded, and our Discord and online platforms are actively moderated. Teams are verified, so your child plays with the same known teammates, not anonymous matchmaking, and opponents are limited to other youth in the EKUZO ecosystem, not random adults or older teens. Every student signs a Code of Conduct that's consistently enforced, and there are no in-session purchase prompts, loot boxes, or pressure to spend.

**2. Is gaming really educational?**  `KEEP current copy`

**3. Isn't this just more screen time?**  *(NEW)*
It's structured screen time that replaces the unproductive kind, not added on top of it. 86% of parents are already managing screen time and many feel they're losing the battle; the issue usually isn't the number of hours, it's whether those hours produce anything. EKUZO sessions are finite (90 minutes, coach-led, skill-building), and many parents report fewer transition fights at home because their child's "gaming need" is being met productively.

**4. What if my child has never played competitively, or is shy?**  *(replaces "never played competitively" with a stronger merge)*
That's exactly who EKUZO is built for. Our coaches meet students where they are, from total beginners to aspiring competitors, and teams are balanced by age and skill level. Many of our strongest parent testimonials come from families whose kids weren't "gamer kids" at all — they were kids who needed a team. EKUZO100, our 4-week program, is the lowest-pressure way to start.

**5. What outcomes should I expect?**  *(UPGRADE — add the stats)*
Parents most often notice greater confidence and motivation, improved communication and teamwork, reduced social anxiety through belonging, and new curiosity about STEAM projects and careers. Research on structured school esports backs this up: participants averaged 7.3 more school days per year, 33.5% lower absence rates, and a +0.11 GPA increase during the active season, and 52.1% reported significant life-skills development.

**6. How does this help with school?**  *(NEW on this page — sourced)*
The mechanism is belonging. About 90% of middle-school esports participants aren't in any other school extracurricular, so for many kids EKUZO is their first real connection at school, which correlates with the attendance and GPA gains above. On top of that, students build focus, discipline, time management, and collaboration that carry directly into academics. Our coaching method is built on established learning science.

**7. Do I need to be a gamer to support my child?**  *(NEW)*
No. The most useful thing a parent brings isn't controller skill, it's interest. EKUZO is designed for parents who don't play: we translate each session into plain terms — what your child did well, where they struggled, how they communicated — so you can have the conversation at dinner without learning the game. Curiosity matters far more than skill.

**8. What equipment does my child need?**  `KEEP current copy`

**9. What about college or careers?**  *(NEW on this page — sourced; keep it low)*
EKUZO builds professional skills — leadership, resilience, communication — and exposes students to esports, game design, broadcasting, and tech pathways. Collegiate esports scholarships now total over $15 million annually across hundreds of programs, and a majority of esports players go on to pick STEM careers. We treat these as bonuses, not the pitch: the core value is the transferable skills, whatever path your child takes.

**10. How do I enroll?**  `KEEP current copy`

---

# 3. /faq

Audience: everyone; this is the citability hub, so its answers should be the strongest, sourced versions. Keep the section structure. ~21 questions.

### Section 1 — About & Safety
**What is EKUZO?**  `KEEP`
**Who are the coaches?**  `KEEP`
**How do you keep online spaces safe?**  *(UPGRADE — use the walled-garden answer)*
EKUZO operates as a "walled garden" specifically designed to answer the four most common parent safety concerns: strangers, toxic chat, older kids, and in-game spending traps. Every session is coach-led and recorded, and our Discord and online platforms are actively moderated. Teams are verified, so your child plays with the same known teammates, not anonymous matchmaking, and opponents are limited to other youth in the EKUZO ecosystem, not random adults or older teens. Every student signs a Code of Conduct that's consistently enforced, and there are no in-session monetization prompts, loot boxes, or pressure to spend.
**Is this safe for beginners?**  `KEEP`
**Isn't gaming culture toxic? I don't want my child exposed to that.**  *(NEW — high-citation parent fear)*
Toxicity in gaming is real, but it isn't inherent to gaming; it's a symptom of unstructured, anonymous environments where players never meet again. EKUZO is built against that "solo queue" failure mode: your child plays on a stable team with the same teammates all season, a coach is on voice comms, there's a written Code of Conduct, and opponents come from the EKUZO ecosystem rather than random adults. In an accountable environment, the behaviors that wreck unstructured play are nearly impossible to sustain.
**What equipment does my child need?**  `KEEP`

### Section 2 — Programs & Scheduling
**What programs does EKUZO offer?**  *(FIX — season length)*
EKUZO offers three programs: EKUZOTEAMS (semester-based, about 15–16 weeks of coached team play), EKUZO100 (a 4-week competitive bootcamp), and EKUZOCAMPS (1-week intensive sessions during summer and holiday breaks). Each is built on the same coaching system with a different format and commitment level.
**What is EKUZO100?**  `KEEP`
**When are practices held?**  *(FIX — Teams session nuance)*
EKUZO100: two evenings per week, after school. EKUZOTEAMS: two 90-minute sessions per week by default (some school-based teams run three 60-minute sessions), during or after school. EKUZOCAMPS: daily sessions during summer or holiday breaks.
**How are teams formed?**  `KEEP`
**What's the difference between the School and Home tracks?**  `KEEP`
**Can homeschool families participate?**  `KEEP`
**What age range is EKUZO for?**  `KEEP`

### Section 3 — Outcomes & Benefits
**What outcomes should I expect?**  *(UPGRADE — add stats)*
Parents most often notice greater confidence and motivation, improved communication and teamwork, reduced social anxiety through belonging, and new curiosity about STEAM projects and careers. Research on structured school esports documents the gains: 7.3 more school days per year, 33.5% lower absence rates, a +0.11 GPA increase during the active season, and 52.1% of participants reporting significant life-skills development.
**How does this help with school?**  *(UPGRADE — replace "educators consistently report")*
The mechanism is belonging. About 90% of middle-school esports participants aren't in any other school extracurricular, so for many students EKUZO is their first real connection at school, which correlates with measurable attendance and GPA gains. Students also build focus, discipline, time management, and collaboration that carry directly into academics. The coaching method is built on established learning science.
**What about college or careers?**  *(UPGRADE — add the real numbers)*
EKUZO builds professional skills (leadership, resilience, communication) and exposes students to esports, game design, broadcasting, and tech pathways. Collegiate esports scholarships now total over $15 million annually across hundreds of university programs, and a majority of esports players go on to pick STEM careers. The skills transfer to college and work regardless of whether a student pursues esports itself.

### Section 4 — Pricing
**How is EKUZO priced?**  *(UPGRADE — surface the real numbers)*
All EKUZO programs are standardized around roughly $20 per session of small-group, coach-led instruction. EKUZO100 is $100 for the full 4-week program. EKUZO Teams is $576 paid in full (a 10% discount) or four monthly payments of $160 ($640 total). EKUZO Camps are $199 per week. See each program page to register.
**Why does it cost what it does?**  `KEEP`

### Section 5 — Getting Started
**How do I enroll?**  `KEEP`
**What happens after EKUZO100?**  `KEEP`

---

# 4. /programs (index)

Audience: someone choosing between programs. Job is orientation + comparison. Expanded from 5 to 7 (added a decision helper + a pricing comparison, both high-intent on an index).

**1. What programs does EKUZO offer?**  *(FIX — season length)*
EKUZO offers three programs, all built on the same coaching system: EKUZO Teams (semester-based, about 15–16 weeks of coached team play), EKUZO100 (a 4-week competitive bootcamp), and EKUZO Camps (1-week intensive sessions during summer and holiday breaks). Each has a different format and commitment level.

**2. Which program is right for my child?**  *(NEW — decision helper)*
Start with EKUZO100 if you want a low-commitment first taste: four weeks, $100, no contract. Choose EKUZO Teams if your child is ready for a full season with consistent teammates and real competition. Pick EKUZO Camps for an intensive week during summer or a school break. Many families start with EKUZO100 or a camp, then move into a Teams season.

**3. How much does each program cost?**  *(NEW — pricing comparison)*
EKUZO100 is $100 for four weeks. EKUZO Camps are $199 per week. EKUZO Teams is $576 paid in full (10% off) or four monthly payments of $160 ($640 total). All programs work out to roughly $20 per session of small-group, coach-led training.

**4. What is EKUZO100?**  `KEEP`

**5. When are practices held?**  *(FIX — Teams session nuance)*
EKUZO100: two evenings per week, after school. EKUZOTEAMS: two 90-minute sessions per week by default (some school-based teams run three 60-minute sessions). EKUZOCAMPS: daily sessions during summer or holiday breaks. Most sessions run about 90 minutes.

**6. What age range is EKUZO for?**  `KEEP`

**7. Can homeschool families participate?**  `KEEP`

---

# 5. /schools

Audience: school decision-makers (athletic director, principal, teacher). Job is institutional conversion. Note: "2–3 times per week" is correct here (school track is where the three 60-minute option lives). Expanded from 5 to 7.

**1. What does EKUZO require from the school?**  `KEEP`

**2. How does scheduling work?**  `KEEP`  *(2–3 sessions/week is accurate for the school track)*

**3. Is this only for competitive students?**  `KEEP`

**4. How does EKUZO handle safety and moderation?**  `KEEP`

**5. What outcomes do schools see?**  *(NEW — AD-relevant, sourced)*
Schools running structured esports report measurable gains: students average 7.3 more school days per year, 33.5% lower absence rates, and a +0.11 GPA increase during the active season. About 90% of middle-school esports participants aren't in any other extracurricular, so esports reaches students nothing else does, which is what drives the attendance and engagement gains.

**6. How do we bring EKUZO to our school, and what does it cost?**  *(NEW — answer now in canon, added 2026-05-25)*
School engagements are institutional and personalized to each school's needs. Every school is different — facilities, schedule, student population, and goals all vary — so we prefer to have a conversation before making commitments. Reach out via the contact form and we'll work through the right fit, scope, and structure together.
> Posture rule (do NOT print on the page): never quote a number to a school decision-maker; route to a conversation. Implement as a "Contact us to bring EKUZO to your school" CTA next to this answer.

**7. What games does EKUZO play?**  `KEEP`

---

## Open items for Jamie

1. ~~School pricing/engagement model (blocks /schools #6).~~ **Resolved 2026-05-25** — canon now answers it with a route-to-conversation posture; no number quoted.
2. ~~Decide who implements.~~ **Resolved 2026-05-25** — Jamie owns the FAQ page edits this round; Aaron may make updates in separate sessions later (not working concurrently now).
3. **After implementation:** the 8 dead duplicate pages should be deleted (listed in `faq-audit-2026-05-25.md`) so no one edits a redirected page by mistake. *(Still open.)*

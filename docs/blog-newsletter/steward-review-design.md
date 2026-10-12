# Steward review: blog newsletter capture (A/B) + inquiry-form attribution

Author: Steward. Date: 2026-09-15. Adversarial review, no fixes applied.

Reviewed: `02-copy-deck.md`, `welcome-email-thumbs.md` (Story); `02-contract.md` sections 1 to 6 and 9 (Relay); `00-brief.md`, `01-requirements.md` section C (Fable).

Rules applied: `system/methodology/anti-ai-writing.md` (hard rules), `system/methodology/voice-dna.md` (strong tendencies, section 4 protections, section 5 forbidden language, section 6 ship-state language gate), `company/knowledge/ekuzo-messaging-voice.md` (Commitment Voice, Language We Avoid, Author integrity).

**Headline.** The copy is the cleanest mechanical pass I have linted: zero hard-rule violations across both files. The problem is not how it is written, it is what it promises. Three load-bearing promises (an email tomorrow, a weekly that keeps coming, a working unsubscribe) depend on artifacts that do not exist at commit time. Under the ship-state language gate, the copy describes the intended future, not the present.

---

## A. Mechanical lint results

### Method

Two passes, because the gate applies to shipped strings, not to Story's rationale prose. A banned word in a deck's own notes is doc hygiene; a banned word in a button label ships.

Extractor (`scratchpad/lint/extract.py`) classifies every line of both files:

- **Shipped copy** = inline-code spans (`` `...` ``), blockquote lines (the email body in the deck), and fenced blocks (subject, preheader, plain-text version). Plus, for `welcome-email-thumbs.md`, the bare markdown body paragraphs at lines 21 to 37, which are shipped copy with no fence or quote around them.
- **Doc prose** = everything else, excluding headers and table rows.

Result: 61 shipped strings in the copy deck, 17 in the welcome email (plus its bare body paragraphs), 63 and 11 prose lines respectively.

Linter (`scratchpad/lint/lint.py`) then counts, per scope:

```
em-dash        U+2014 and U+2015, literal count
en-dash        U+2013, literal count
exclamation    "!" literal count
banned 3A      39 hard-banned words, word-boundary regex, plus the 7
               copulative-avoidance forms ("serves as", "stands as",
               "marks a", "represents a", "boasts a", "features a",
               "offers a")
banned 3C      21 banned phrases, substring match, lowercased
banned 3D      8 banned transitions, word-boundary regex
neg-parallel   12 regexes for the 1B patterns, including the sneaky and
               compressed forms: "isn't X. It's Y", "not X. Y",
               "not only / but also", "less X, more Y",
               "no X, no Y, just Z", "the question isn't / the question is",
               "you don't need / you need", "stop thinking / start thinking"
digits         \d+ , reported as a list so each hit is inspectable
```

Run: `python3 scratchpad/lint/extract.py && python3 scratchpad/lint/lint.py`

### Counts

| Check | Copy deck, whole file | Welcome email, whole file | Shipped copy strings, both files |
|---|---|---|---|
| Em-dashes | 0 | 0 | **0** |
| En-dashes | 0 | 0 | **0** |
| Banned words (3A) | 0 | 0 | **0** |
| Copulative avoidance | 0 | 0 | **0** |
| Banned phrases (3C) | 0 | 0 | **0** |
| Banned transitions (3D) | 0 | 0 | **0** |
| Negative parallelism (1B) | 0 | 0 | **0** |
| Exclamation marks | 0 | 0 | **0** |
| Digits | 30 (all structural) | 1 (structural) | **0** |

Digit hits are all file references and reference tables, never copy: `02-copy-deck.md`, `00-brief.md`, `01-requirements.md`, the P-numbers and C-numbers, the rationale list numbers 1 to 8, the contact-option numbers 1 to 8, and the character-count table (50, 37, 29, 19, 36, 77). Zero digits in any shipped string. **C3 passes mechanically.**

### Supplementary checks (the deck's own transcription rules)

| Check | Result |
|---|---|
| Curly apostrophe U+2019 | 0 in both files (19 and 4 straight apostrophes). Deck's "straight apostrophes only" rule holds. |
| Curly quotes U+201C / U+201D | 0 |
| Ellipsis character U+2026 | 0. `One moment...` uses three literal periods, which is what Atlas must transcribe. |
| Non-ASCII in shipped strings | 0. The only non-ASCII characters in either file are the section sign and the rightwards arrow, both in Story's notation, never in copy. Atlas must not transcribe the arrow in the email body; it marks "href follows". |
| Title case in headers (1G) | Clean. `The EKUZO weekly`, `How did you hear about us?`, `Choose one` are all sentence case. |
| Terminal periods on buttons | Correctly absent on `Try it`, `Join`, `Send me the one email`, `Join the weekly`. |

### One judgment finding from the lint

**Negation density.** No 1B violation, but the word "no" appears 9 times across the shipped copy: `no questions` x4, `No spam` x2, `no follow-up` x2, `no hype` x1. Plus `off the list` x4. Reassurance-by-negation is the deck's default rhetorical move on every surface.

This is not a hard-rule hit and the 1B frequency note explicitly protects single instances. But `Sources attached, no hype.` and `No questions, no follow-up.` are compressed two-part negations, and stacking that shape across four surfaces is the density the frequency rule tells us to watch. It is also slightly off the Commitment Voice, which says what we do rather than what we will not do. Recorded as LIGHT: worth Story's eye on the next pass, not a gate.

---

## B. Claims audit

Ship state I am working from, per the brief: the go-live checklist records **"No blog send exists today"** for the newsletter, and the Beehiiv **"Newsletter Welcome" automation is marked TBD**. Whether EKUZO currently sends a weekly newsletter at all is **unknown to me and is a question for the lead**. The ship-state language gate (voice-dna section 6) requires copy to describe what exists at commit time, not the intended future.

That gate is the spine of this section. Every row below is judged against commit-time reality.

| # | Promise (surface) | True at commit time? | What makes it false | Fix (owner) |
|---|---|---|---|---|
| 1 | `One email tomorrow, then you decide.` (sticky thumbs) | **No** | The automation that sends it does not exist (contract section 9 bullet 1; ship state TBD). Submitting the form subscribes the reader and sends nothing. Separately, I3 makes the 24h delay **optional**, so even once built, "tomorrow" may be "immediately". | Automation must exist with a 24h delay before this string ships (Fable). If the delay is dropped, the word "tomorrow" comes out (Story). |
| 2 | `Got it. Look for it tomorrow.` (sticky thumbs success) | **No** | Same dependency as 1, and it is worse: it tells a reader who has just acted that a specific thing is on its way. | Same gate (Fable). If no delay: `Got it. Check your inbox.` (Story). |
| 3 | `tomorrow I'll send one message` (popup thumbs body) | **No** | Same as 1. Also "one message": the reader is subscribed on submit, so if a weekly send exists and fires before the welcome email, more than one message arrives and the first one is not the promised one. | Same gate, plus confirm send-order safety (Fable). |
| 4 | `Thumbs down and you're off the list, no questions.` (popup thumbs, preheader, email) | **Unverified** | The thumbs-down link is `{{unsubscribe_url}}`, and contract section 9 bullet 2 says the exact merge tag is **unconfirmed**. Pre-flight row 5 is flagged as "the least certain item in the table". Separately, "no questions" is false if Beehiiv's unsubscribe flow shows a confirm step or a "why are you leaving?" survey rather than completing on one click. | Pre-flight must confirm both the tag name **and** that the flow is one click with no survey (Fable). If there is a confirm step, "no questions" changes (Story). |
| 5 | `Thumbs up and the weekly keeps coming: what I'm seeing in kids' gaming, sources attached.` (popup thumbs) | **Unknown, presumed no** | "The weekly keeps coming" asserts a recurring product. If no weekly send exists, this is the single largest false claim in the deck. Story's rationale 2 correctly fixed the mechanism mismatch ("keeps coming" rather than "you get"), but that change made the **cadence** claim stronger, not weaker. "Sources attached" promises an editorial property of every future issue, and nothing in the brief, requirements or contract binds the weekly's content. | Lead confirms a weekly send exists and at what cadence (Fable/Jamie). "Sources attached" needs a named owner as a standing editorial constraint, or it comes out (Jamie/Karlin to accept). |
| 6 | `One email a week on making gaming count.` (popup classic body) | **Unknown, presumed no** | Sharper version of 5: an explicit weekly cadence. False if no weekly exists, and false if the weekly is irregular. | Lead confirms cadence (Fable/Jamie). |
| 7 | `The weekly is free too.` (sticky classic, popup classic headline) | **Partly** | "Free" is true, no payment is collected. "The weekly" names a product as existing. Fails the gate on existence, not on price. | Lead confirms the weekly exists (Fable/Jamie). |
| 8 | `Free to read.` (both sticky lines) | **Yes** | Nothing. The blog is free and ungated. | None. |
| 9 | `You're on the list.` / `You're in.` (sticky and popup classic success) | **Yes** | Nothing. Create-subscription fires on submit (contract section 2), so the reader genuinely is on the list at that moment. Accurate, and notably more accurate than most success copy. | None. |
| 10 | `Got it.` (popup thumbs success) | **Yes** | Nothing. Deliberately claims nothing. Good choice. | None. |
| 11 | `No spam. Unsubscribe any time.` (both microcopy) | **Unverified** | Depends on the same merge tag as 4. "No spam" is conventional and defensible. | Pre-flight row 5 (Fable). |
| 12 | `or use the thumbs down tomorrow` (thumbs microcopy) | **No** | Same dependency as 1 and 4 combined. | Same gates. |
| 13 | `this is the one email I promised` (email body, both arms) | **False for ~50% of recipients** | The welcome email is sent to **both** A/B arms (brief line 9, locked). A classic-arm reader was promised "one email a week", never "one email". The email's first line therefore refers to a promise that was never made to half the people reading it, and the preheader ("Thumbs down and you're off the list") can read to a classic subscriber as a trick. | Arm-neutral opener (Story). Exact rewrite in section G. Segmenting the automation by variant tag is the alternative, but it is blocked by the section 3 tagging edge case, so the copy fix is the cheap one. |
| 14 | `takes you to this week's piece` (email, both versions) | **Conditionally false** | `{{THUMBS_UP_URL}}` goes to the **newest** post (`welcome-email-thumbs.md` line 5), not to a post published this week. If no post shipped that week, the link lands on an older piece and the sentence is false. Blog cadence is also unconfirmed. | `the newest piece` (Story). Cheapest true fix in the deck. |
| 15 | `I read the click as a yes` (email, both versions) | **Unbacked** | Nothing in the contract captures, surfaces or assigns anyone to read thumbs-up clicks. Beehiiv will record the click, but there is no tag, no segment, no metric and no owner. See section E for the consent question. | Make it true rather than rewrite it: add a UTM to the thumbs-up URL and a human-action item that Karlin reads the click rate (Fable/Relay). Section F4. |
| 16 | `does exactly that. No questions, no follow-up.` (email) | **Unverified** | Same merge-tag dependency as 4. Once unsubscribed, no follow-up is genuinely true; Beehiiv's inability to remove tags (brief line 40) does not affect sends. | Pre-flight row 5 (Fable). |
| 17 | `You are already on the list, so the thumbs down is the link that changes anything.` (email) | **Yes** | Nothing. This is the most honest line in the deck and the only place the subscribed-on-submit reality is disclosed to the reader. | None. Protect this line. |
| 18 | `A short list of parents who want the weekly is worth more to me than a long one.` (email) | **Yes** | Nothing to verify. Pure Commitment Voice: it names what Karlin refuses. | None. |
| 19 | `You are getting this because you left your address on the EKUZO blog.` (footer) | **Yes** | Nothing, for blog-sourced subscribers, which is the only population the automation targets (trigger tag `source-blog`). The section 3 edge case still yields `source-blog`, so the trigger still fires. | None. |
| 20 | `Optional. It tells us where parents are actually finding us.` (contact helper) | **Yes** | Nothing. True and it names why we ask. | None. |
| 21 | `That didn't go through. Try once more.` (all error lines) | **Yes** | Nothing. | None. |

### The pattern the table shows

Group the failures by dependency and there are only three:

1. **The welcome-email automation does not exist.** Kills rows 1, 2, 3, 12, and makes 13 to 15 moot until it does.
2. **The weekly's existence and cadence are unconfirmed.** Kills rows 5, 6, 7.
3. **The unsubscribe merge tag is unconfirmed.** Kills rows 4, 11, 16.

Every one of those three is a **human action in contract section 9**, and none of them is code. D1, D2 and D3 are code that Atlas can merge today. D4, the email, is a human action in Beehiiv with an unconfirmed merge tag. Nothing in `01-requirements.md` sequences them.

That is the central risk in this run and I am naming it as a gate, not a note: **the capture surfaces can ship before the thing they promise exists.** The first people to receive the broken promise are the exact parents the brand exists to earn trust from, and the promise is broken in the most visible way possible, by silence.

**Recommended gate (owner: Fable).** Add to `01-requirements.md` section C a requirement C4: no capture surface carrying a delivery promise ships until the Beehiiv automation exists, is confirmed sending, and pre-flight row 5 is closed. Acceptance: a dated line in the evidence ledger plus one real send to the disposable identity. Gate type H.

### A requirements gap worth recording

Section C's only claims gate is **C3**, which asks whether any claim needs a fact-library row (numbers, studies, outcomes). C3 passes cleanly and is almost irrelevant to this deck. Every risky claim here is a **service claim**: cadence, delivery timing, unsubscribe behavior, content properties. Section C has no gate for those, which is why a deck that passes C1, C2 and C3 can still promise a product that does not exist. The C4 above closes it.

---

## C. Author integrity

Per `ekuzo-messaging-voice.md` section Author integrity, Karlin's true standing is: founder, coaches this age group in League, was the kid-gamer in the origin story. The credential pool is that and nothing outside it.

| First-person claim | True for Karlin? | Note |
|---|---|---|
| `I coach kids this age, so it's what I'm actually seeing.` | **Yes** | Directly within the stated credential ("coaches this age group in League"). No fabrication. |
| `what I'm seeing in kids' gaming` | **Yes** | Same credential. He is in the room with these kids. |
| `tomorrow I'll send one message` | **Yes, with a convention** | The email is an automation, so "I'll send" is the ordinary convention of a founder-signed email, not a fabricated credential. Acceptable. |
| `I read the click as a yes` | **Not yet** | The credential is fine; the behavior is unbacked. Nothing makes anyone read it. See B15 and F4. |
| `A short list ... is worth more to me` | **Yes** | A stated preference, not a credential. |
| `this is the one email I promised` | **Yes for thumbs, no for classic** | Not a credential problem. A promise-attribution problem. See B13. |
| `Karlin Oei, founder, EKUZO` | **Yes** | Correct and correctly placed. |

**Two structural findings that outrank the line-by-line.**

**C-i. The brief said "we", Story wrote "I", and that is the right call.** `00-brief.md` line 24 had "what we're seeing in kids' gaming". Story changed it to "what I'm seeing". That moves the claim from unattributable company voice to a specific person who actually holds the credential, which is what the Author integrity rule wants. Keep the change.

**C-ii. The popup carries an unattributed "I" on a multi-author route, and that is an author-integrity violation waiting to fire. FIX.**

The deck's justification (line 7) is that the popup's "I" matches "the byline on the post the reader just finished." That holds only if **every** blog post is Karlin-bylined. Two things say it is not: `01-requirements.md` P4 and contract section 5 both carve out `/blog/author/*` routes, which exist because the blog has more than one author.

The popup fires at 50% scroll on **every** blog post page, by route, with no knowledge of the byline. So on a post bylined by anyone other than Karlin, a reader finishes that author's piece and is immediately shown an unattributed "I coach kids this age". The reader attributes it to the byline they just read. That is precisely the failure the rule names: *"Do not transplant Karlin's coaching credential onto Jamie's account or vice versa."*

Jamie's true standing is gamer, parent, scholastic esports co-founder, supporter. It does not include coaching this age group. On a Jamie-bylined post, this copy fabricates a credential.

Two fixes, cheapest first:

- **Add a visible byline to both popup variants.** One new string, matching the email sign-off, which also resolves the "whose voice is this" question the deck raises about itself. Owner: Story (string), Atlas (render).
- **Or gate the first-person variants to Karlin-bylined posts.** Correct but more code, and it would need a byline check the contract does not currently specify. Owner: Atlas, and it needs a requirement.

I recommend the byline. Exact string in section G.

---

## D. Never-say and posture

Checked against `ekuzo-messaging-voice.md` (Language We Avoid, Audience-Specific Never-Says, Posture guardrails) and `voice-dna.md` section 5.

| Check | Result |
|---|---|
| Argues that gaming matters (5E) | **Clean.** No sentence begins "Gaming is actually" or "Studies show gaming can". `making gaming count` asserts EKUZO's frame positively without defending the category. On-posture. |
| Sells discipline (5A) | **Clean.** No rigor, no accountability, no "build better habits". Nothing that adds an expectation to a parent who already feels they are failing. |
| Generic healthy-gaming language (5D) | **Clean, and notably so.** Zero instances of "healthy gaming", "screen time", "balance", "limits", "moderation". The deck never enters screen-time discourse. This is the hardest thing on the list to avoid in newsletter copy and Story avoided it completely. |
| Urgency | **Clean.** No countdown, no "limited", no "don't miss", no "act now". `One email tomorrow, then you decide` is the structural opposite of urgency: it hands the decision to the reader and delays it. |
| Scarcity | **Clean.** None. |
| "Community" framing | **Clean.** Zero instances of "community", "join our community", "our community is safe", all of which are explicitly banned. `Join` appears only as a button label and `Join the weekly` joins a mailing list, not a community. |
| Over-promises | **Present.** Rows 5, 6, 7 in section B. The over-promise is about EKUZO's own delivery, not about kid outcomes, which is the less dangerous of the two but still a promise the brand cannot keep today. |
| Overstated outcomes (5C) | **Clean.** No transfer claims, no IQ, no grades, no scholarship, no "go pro", no magical transformation. The deck promises a newsletter, not a result. |
| Frames gaming as a problem to fix (5A) | **Clean.** |
| Blames the child's character (5B) | **Clean.** No child appears as a subject at all, which sidesteps it. |
| Talks down to parents | **Clean.** `It tells us where parents are actually finding us` treats the reader as someone doing us a favor. Right register. |
| Unfalsifiable safety or vetting claims | **Clean.** No safety claim anywhere, correctly, since none belongs in newsletter copy. |
| Commitment Voice | **Strong where it appears.** `A short list of parents who want the weekly is worth more to me than a long one` names a refusal, which the doc calls the most credible form of commitment. `You are already on the list, so the thumbs down is the link that changes anything` volunteers a fact against interest. Both are the best writing in the deck. |
| Page-level redundancy (2L) | **Watch, not fail.** On a thumbs-arm page a reader can see the sticky bar and the popup at once. "One email" plus "tomorrow" then appears in the sticky line, the sticky success line, the popup headline, the popup body, the popup button and the popup microcopy. Story's rationale 7 shows this was considered for the microcopy specifically. The count is high but the surfaces are genuinely separate and only two are visible at once. LIGHT. |

### The eight contact-form options

| # | Option | Verdict |
|---|---|---|
| 1 | `X (Twitter)` | **PASS.** The parenthetical earns its place; a parent may not recognize "X" alone. |
| 2 | `Instagram` | **PASS.** |
| 3 | `TikTok or YouTube` | **PASS on brand.** One data note below. |
| 4 | `Google search` | **PASS.** |
| 5 | `ChatGPT or another AI` | **PASS, and the best option in the list.** A real and growing lane, it matches the existing `ai_referral` analytics event (contract section 6), and naming the product the parent actually used beats "AI assistant". |
| 6 | `A friend or another parent` | **PASS.** "Another parent" is the parent-register move; it recognizes the reader as a parent without saying so. |
| 7 | `My kid's school` | **PASS.** First-person possessive is correct and warm. |
| 8 | `Other` | **PASS.** |

Nothing off-brand. No corporate-speak ("Word of mouth", "Referral", "Channel partner"), no jargon, no option that flatters EKUZO. The label and helper text are both sentence case, honest, and name why we ask. Register mixes slightly (options 1 to 4 are bare proper nouns, 6 and 7 are first-person phrases), which is how people actually answer, so I would not touch it.

**Contract section 9's last open item is closed by this deck.** Relay asked Story to freeze the visible labels before Atlas builds the select. All eight match contract section 4's slug table exactly: `x`, `instagram`, `tiktok-youtube`, `google`, `ai`, `friend`, `school`, `other`. No translation layer needed. **Recorded as resolved.**

Two non-blocking notes for Jamie:

- **`TikTok or YouTube` is a one-way door.** Beehiiv tag removal is impossible (brief line 40), so `heard-tiktok-youtube` can never be split later. TikTok and YouTube are very different acquisition lanes. Acceptable if nobody will ever need them separated; worth ten seconds of thought now, because the cost of being wrong is permanent.
- **No option covers a camp, a tournament, or a coach.** A parent who met EKUZO at an event picks `Other`. Minor and acceptable, since the brief's stated target is the X follow lane, which option 1 captures cleanly.

---

## E. Offer integrity

The mechanism, as specified: **subscribed on submit** (contract section 2, create-subscription fires on POST); **thumbs-down link = `{{unsubscribe_url}}`**, a real unsubscribe; **thumbs-up = link to the newest post**, and nothing else happens.

### Gap 1: "then you decide" describes an opt-in. The mechanism is an opt-out. (Primary gap.)

`One email after you read this. Then you decide.` sets up a decision point: I give my address, I receive one email, then I choose whether this continues. A reasonable parent reads that as a preview before commitment.

The mechanism is the reverse. The reader is subscribed the instant the form posts. If they ignore the email completely, or never receive it, or it lands in spam, they stay subscribed indefinitely. **Silence equals consent.** The copy's framing implies silence equals no.

This is not a technicality. It is the difference between "one email, then you decide" and "you are subscribed, and here is a one-click exit". The second is still a perfectly good offer and arguably a better one, because it is what actually happens.

What makes this recoverable: **Story already wrote the honest version.** The email's line 4 says it outright, and says it well: *"You are already on the list, so the thumbs down is the link that changes anything."* The disclosure exists. It is just in the wrong place. It arrives after the address is captured, in a message that may not be sent at all.

**The fix is to move that disclosure upstream into the popup, at the point of capture.** Exact rewrite in section G. With the body disclosing it, the headline's "Then you decide" becomes true (you decide whether to stay), so the headline does not need to change.

**The sticky thumbs bar is the worst offender** and needs its own fix, because it has no body copy to carry the disclosure. It makes the opt-in-shaped promise in 50 characters with nothing to correct it.

### Gap 2: the thumbs up does not cause the thing it is offered as causing

The popup presents a fork: thumbs down ends it, thumbs up continues it. Only one half is real. Thumbs down genuinely unsubscribes. Thumbs up does nothing; the weekly continues because of inaction, not because of the click.

Story caught this at the mechanism level (rationale 2, changing "you get the weekly" to "the weekly keeps coming") and the email discloses it fully. The popup does not. Fixed by the same rewrite as Gap 1.

### Gap 3: "I read the click as a yes" (the question as asked)

**Is a click a consent signal the copy can honestly claim, given nothing changes on thumbs-up?**

Two separate questions, and they get different answers.

*Is the click a real signal?* Yes. A click on "Keep it coming" is a voluntary, affirmative act by a named subscriber who has just read what they were told they would get. As a signal of interest it is genuine and it is information. As **consent** it is nothing, because consent was already given at form submit; there is no permission state for the click to change. But the copy does not claim consent. It claims Karlin's reading of a signal, which is a much weaker and more honest claim. And crucially, the very next paragraph tells the reader plainly that the click changes nothing. The copy disarms its own strongest reading, in the same message, unprompted. That is the intellectual-honesty posture working correctly, and I would not rewrite the line.

*Can the copy claim Karlin reads it?* **Not as specified.** Nothing in the contract captures, surfaces, aggregates or assigns ownership of thumbs-up clicks. Beehiiv will record the click as ordinary ESP link tracking, but there is no tag, no segment, no GA event, no report and no person. The sentence asserts a behavior that the plan does not produce.

**Recommendation: make the line true rather than rewrite it.** It does real work, giving the click meaning without inventing a mechanism, and it is well written. Two cheap changes make it honest:

- Put a UTM on the thumbs-up URL: `?utm_source=beehiiv&utm_medium=email&utm_campaign=blog-welcome-thumbs`. The click becomes visible in GA4 next to the `newsletter_signup` event, which is where the rest of this run's data lives. Note for whoever implements it: this does **not** touch `/api/newsletter`'s allowlist, because it is an inbound page visit, not a newsletter POST. Nobody should "fix" it to match the allowlist.
- Add a human-action item: Karlin reads the welcome email's thumbs-up click rate. One line, and it converts an unbacked sentence into a described practice.

Owner: Relay to spec the URL, Fable to build it into the automation.

### Gap 4: "sources attached" is a content promise with no owner

Nothing in the brief, the requirements or the contract binds the weekly's content. If an issue ships without sources, the copy lied, and no process would catch it.

In practice this is probably the safest promise in the deck, because the claims-register discipline and messaging-voice's "named stats with source URLs" both push hard in that direction. But "probably true in practice" is not an owner. Either record it as a standing editorial constraint on the weekly, which makes it a real commitment and an on-brand one, or take it out. Owner: Jamie or Karlin to accept.

### Gap 5: the shared welcome email, and why the locked decision is still right

The thumbs email goes to both arms (brief line 9, locked). That creates B13's false opener and a preheader that can read as a trick to a classic subscriber.

**I am not recommending the decision be reversed.** Holding the email constant across arms is correct experimental design: the popup copy is the variable under test, and giving each arm a different welcome email would add a second variable and make the result unreadable. The locked decision is right for measurement. Its cost is purely copy coherence, and copy coherence is fixable in one sentence. Fix the opener, keep the decision.

### What the mechanism delivers correctly

Worth stating, because most of it does:

- `You're on the list.` and `You're in.` are accurate at the moment they appear.
- `Got it.` claims nothing, which is the right amount.
- Thumbs down genuinely unsubscribes, subject only to the merge tag.
- The email's paragraph 4 discloses the subscribed-on-submit reality against EKUZO's own interest.
- The sticky bar and popup share one variant per browser (P5), so a reader never sees two different offers on one page.

---

## F. Recommendations on the four section 9 decisions

### F1. Tagging edge case: a blog signup with no valid campaign gets `source-blog` only, no `variant-*`

**How often does this fire?** Almost never. `getOrAssignVariant` always returns a valid variant, including on the storage-unavailable path, so the client always sends one. A missing or invalid `utm_campaign` on a `utm_source: blog` request means a replayed or hand-crafted request, a future caller, or a client bug. This is a defensive branch, not a population.

**Should it default to `variant-classic`, as Relay asks?** No, and the reason is decisive rather than close. Defaulting fabricates data: it tags a subscriber as having seen classic copy when nobody knows what they saw, and it pollutes the one measurement the brief says must never be cut (line 53, "never D2's A/B integrity"). A silent miss from a segment is recoverable arithmetic; you can always compute `source-blog` minus the two variant tags. A wrong tag is not recoverable at all, because **Beehiiv tag removal is impossible** (brief line 40). The asymmetry is total: one error is reversible, the other is permanent.

**Recommend: sign off as specified. No variant default.**

One addition, which converts Relay's stated worry ("a segment will silently miss these subscribers") into something observable: assert the invariant `count(source-blog) == count(variant-thumbs) + count(variant-classic)`. Any drift is the size of this population, visible rather than silent. Owner: Relay to specify, Sentry to check.

### F2. Storage-unavailable fallback: always classic, never thumbs

Relay frames this as a fairness problem, that these readers never get the preferred variant. I think that framing points at the smaller issue.

**Which copy they see barely matters.** It is a tiny population (private mode, storage disabled) and the conversion difference on one arm of a two-arm test is noise.

**What matters is that they enter the classic arm's tally.** They are a non-random subpopulation being counted as if they were randomized. Direction of bias is unknown, which is worse than a known bias. That contaminates the comparison, not the fairness.

**Recommend: keep classic as the displayed fallback, and omit `utm_campaign` on that path** so these readers do not enter either arm. They then land in F1's branch as `source-blog` with no variant tag, which is exactly what that branch is for, and the two decisions become consistent: no storable variant means no measured variant. Cost is small: `getOrAssignVariant` signals that the value came from the fallback rather than from storage. Owner: Relay to amend the T4 interface, Atlas to implement.

If that is too much for this run, accept as specified and record the contamination as a known limitation in the evidence ledger. Do not leave it undecided.

**A separate finding that surfaced while working this decision, and nobody has flagged it.** T4 specifies "storage unavailable = show popup", so `shouldShowPopup` returns true whenever storage throws. Within one page the reader dismisses it and component state holds. But on the **next** blog post it fires again, because no dismissal can be recorded. A private-mode reader gets the popup at 50% scroll on every blog post they ever read, forever.

Fail-open is the right default for a popup you want shown, so the rule is not wrong. But the result is a reader being nagged indefinitely with no way to stop it, which is a brand problem on a surface whose entire pitch is "then you decide". Cheap fix: a module-scoped in-memory flag in `lib/newsletterAb.ts`, set on dismiss, checked by `shouldShowPopup`, so at least one tab session honors one dismissal. sessionStorage will not work here, because it throws in the same conditions. Owner: Atlas. Recommend including it; it is a few lines and it protects the posture.

### F3. `referring_site` hardcoded to `https://ekuzo.gg`

Relay recommends keeping it hardcoded, on three grounds: no requirement asks for a `pageUrl` field, the attribution the brief wants is already carried by `utm_medium` and `utm_campaign`, and per-post values are a follow-up. All three hold.

**One argument Relay did not make, which is stronger than the three given.** `referring_site` is a Beehiiv-semantics field meaning the **site** a subscriber came from, not the page. Setting it per-page would misuse the field and fragment Beehiiv's own reporting, where every blog subscriber should aggregate under one site. Keeping it hardcoded is not merely cheaper, it is more correct.

**Recommend: sign off as specified, no change.**

Record the named follow-up so the next person does not reach for the wrong field: **per-post attribution belongs in `utm_content = <slug>`, not in `referring_site`**, and it would need adding to T1's allowlist. Owner: Relay to note in the frozen spec.

### F4. `trackNewsletterSignup`: yes or no

**Yes.** But Relay's reason is the weaker one, and taking only the weaker reason leaves the run unable to answer its own question.

Relay argues convenience: one GA4 property rather than pulling a separate Beehiiv report. True, and thin on its own.

**The real argument is that without client-side events, this A/B produces counts and not rates.** Beehiiv tags tell you how many people in each arm subscribed. They cannot tell you how many people in each arm were **shown** the popup. Signups per arm without impressions per arm is not a conversion rate, and a conversion rate is the only thing that answers "which copy works". If the arms happen to split unevenly (a storage-unavailable skew per F2, a variant that correlates with traffic pattern, any 50/50 that lands 47/53 on real traffic) the raw counts mislead in a direction nobody can detect.

**Recommend: yes to `trackNewsletterSignup` exactly as Relay specifies it, and add a variant-stamped impression event.** Something of the shape `newsletter_popup_view` with the same `{ source, variant }` params, fired when the popup opens. Variant assignment already happens on the reader's first blog-post visit and the popup fires at 50% scroll, so impressions are already variant-stamped and no new state is needed.

This is not scope creep. It is one additional `ga4()` call at a point the code already reaches, and without it D2's A/B integrity, the thing the brief says never to cut, yields data that cannot be read as a rate. Owner: Relay to spec, Atlas to implement.

Two smaller notes on the signature as written:

- Privacy is clean. Source and variant only, no email, no PII, GA-only with no Pixel mirror. Relay's GA-only rationale is sound and matches `trackRegisterClick`.
- Consider `variant: "none"` rather than leaving it undefined for footer signups. GA4 drops undefined params, which leaves a silent gap in the breakdown rather than a labelled row. Minor.

### Also, since it was asked: my judgment on T4

The interface is sound, the injectable storage and RNG are the right shape for a pure module, and wrapping storage access inside each function rather than at the call site is the correct choice. Two amendments, both from F2: signal the fallback path so `utm_campaign` can be omitted, and add the in-memory dismissal flag. Neither changes the module's shape.

---

## G. Verdicts per surface

### 1. Sticky bar, thumbs variant: **BLOCK**

**Reason.** Both strings promise an email that nothing sends at commit time (B1, B2). The automation is TBD and I3 makes the 24h delay optional, so "tomorrow" is doubly unbacked. Separately, this surface makes the opt-in-shaped promise with no body copy to disclose subscribed-on-submit (E Gap 1), and it is the only surface where that disclosure has nowhere to go.

**Clears when:** the automation exists with a 24h delay and has sent once to the disposable identity. Then the copy below ships.

**Rewrite (Story).** Line, replacing `Free to read. One email tomorrow, then you decide.`:

`Free to read. One email tomorrow, unsubscribe inside.`

52 characters, close to the current 50. It keeps the offer and drops the implication that nothing happens until the reader decides. Story may substitute any wording that satisfies the constraint: **the sticky thumbs bar must not imply the reader is previewing before joining.**

Success line stays `Got it. Look for it tomorrow.` **only if** the 24h delay ships. If the automation fires immediately, it becomes:

`Got it. Check your inbox.`

### 2. Sticky bar, classic variant: **BLOCK**

**Reason.** `Free to read. The weekly is free too.` names "the weekly" as an existing product, and whether a weekly send exists is unconfirmed (B7). The go-live checklist records "No blog send exists today". Fails the ship-state gate on existence.

**Clears when:** the lead confirms a weekly send exists. No rewrite needed; this surface converts to **PASS** unchanged on that confirmation. `You're on the list.` and the error line are already accurate.

**Owner of the blocker:** Fable or Jamie, not Story.

### 3. Popup, thumbs variant: **BLOCK**

**Reason.** Three independent blockers: the email dependency (B3, B12), "the weekly keeps coming" plus "sources attached" (B5), and the opt-in framing at the point of capture (E Gaps 1 and 2). Plus one FIX that applies regardless: the unattributed "I" on a multi-author route (C-ii).

**Rewrite (Story), once the weekly and the automation are confirmed.** Body, replacing the current body:

`Leave your address and tomorrow I'll send one message with a thumbs up and a thumbs down. You're on the list from today, so the thumbs down is the one that changes anything, no questions. Thumbs up and the weekly keeps coming: what I'm seeing in kids' gaming, sources attached.`

This moves Story's own honest line (the email's paragraph 4) upstream to where the decision is made. With the body disclosing it, the headline `One email after you read this. Then you decide.` becomes true and needs no change.

**Add (Story string, Atlas render), both popup variants:**

- **byline (under the body):** `Karlin Oei, founder, EKUZO`

**Microcopy** stays as written once the email dependency clears.

### 4. Popup, classic variant: **BLOCK**

**Reason.** `One email a week on making gaming count.` is an explicit cadence claim on an unconfirmed product (B6). Plus the same unattributed "I" (C-ii), and one minor antecedent problem.

**Rewrite (Story), once cadence is confirmed.** Body, replacing the current body:

`One email a week on making gaming count. I coach kids who play, so it's what I'm actually seeing. Sources attached, no hype.`

`kids this age` has no antecedent inside the popup. It reads correctly on a post about a specific age group and reads as nothing on a post that is not, and this popup fires on every blog post. `kids who play` is true for Karlin, needs no antecedent, and works on every post.

**Add** the same byline line as variant 3.

Headline `Free to read. The weekly is free too.` clears with the same confirmation as surface 2.

### 5. Contact form field: **PASS**

All eight options on-brand (D). Label and helper text honest and sentence case. Labels match contract section 4's eight slugs exactly, which closes contract section 9's last open item. No rewrite.

Two non-blocking notes carried to Jamie, neither gating: `TikTok or YouTube` can never be split later because Beehiiv tag removal is impossible; no option covers a camp, tournament or coach, so those parents pick `Other`.

### 6. Welcome email (thumbs): **BLOCK**

**Reason.** The unsubscribe merge tag is unconfirmed (contract section 9 bullet 2, pre-flight row 5, flagged by Relay as the least certain item in the table). Both thumbs links carry the whole email, and one of them may not work. That is a hard blocker and it is not Story's to clear.

Three FIXes apply once it clears, all cheap:

**Rewrite 1 (Story), B13, the arm-neutral opener.** Both the markdown body and the plain-text version, replacing `You left your address on the EKUZO blog, so this is the one email I promised.`:

`You left your address on the EKUZO blog, so here is the first email.`

True for both arms, keeps the register, drops a promise that was never made to the classic half of the list.

**Rewrite 2 (Story), B14, the newest piece.** Markdown body:

`Thumbs up: [Keep it coming]({{THUMBS_UP_URL}}) takes you to the newest piece, and I read the click as a yes.`

Plain text:

`That link takes you to the newest piece, and I read the click as a yes.`

`this week's piece` is false whenever no post shipped that week. `the newest piece` is true unconditionally and costs nothing.

**Rewrite 3: none. Keep `I read the click as a yes` and make it true instead (Relay, Fable).** Put `?utm_source=beehiiv&utm_medium=email&utm_campaign=blog-welcome-thumbs` on `{{THUMBS_UP_URL}}`, and add a human-action item that Karlin reads the click rate. Reasoning in E Gap 3. Do not change this to match `/api/newsletter`'s allowlist; that allowlist governs newsletter POSTs, not inbound page visits.

**Protect unchanged:** `You are already on the list, so the thumbs down is the link that changes anything.` and `A short list of parents who want the weekly is worth more to me than a long one.` These are the two best lines in the deck. The first is the only place the mechanism is disclosed honestly, and the second is textbook Commitment Voice. Any future compression pass will want to cut them. It should not.

Subject, preheader, footer and sign-off: **PASS** as written, subject to the merge tag.

### Requirements section C

| ID | Verdict |
|---|---|
| **C1** | **PASS.** Every required field present for all six surfaces, plus sticky success and error lines that C1 did not ask for and P3 needs. |
| **C2** | **PASS.** Zero hard-rule violations, verified mechanically (section A). No urgency, no scarcity, no "join our community". One LIGHT note on negation density. |
| **C3** | **PASS, and nearly irrelevant.** Zero digits, studies or outcome claims in any shipped string. Every risky claim in this deck is a service claim, which C3 does not cover. Add **C4** per section B. |

### Overall verdict

**BLOCK.** The most mechanically clean deck I have linted, genuinely on-voice, and it sells a product and a delivery mechanism that do not exist at commit time: five of six surfaces block on three human actions that are nobody's code, and the contact field is the only surface clear to ship today.

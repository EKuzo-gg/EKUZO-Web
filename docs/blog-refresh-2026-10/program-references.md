# Program references in the blog (for the funnel rebuild)

Jamie asked for the blog's program mentions laid out for the "join our league" cart work.

## After this pass (2026-10-13)

- Six posts carry one shared line, defined once in `components/blog/ProgramLine.tsx`: "EKUZO runs coached esports teams for kids ages 10 to 17. See the current programs." linking to `/programs`. Posts: when-gaming-helps-homeschool-kids, league-of-legends-youth-development, what-your-kids-gaming-is-telling-you, when-your-sons-only-friends-are-online, our-family-s-esports-journey-with-ekuzo-and-the-k1ng, conquering-my-mountain-and-giants-how-esports-changed-my-life. Change the constant and all six follow.
- what-homeschool-parents-taught-us-about-gaming: "coach kids through games" links to `/programs`.
- gaming-programs-for-kids: "EKUZO" links to `/programs`; names season one (2027) and the waitlist; no price.
- gaming-military-families and should-you-ban-fortnite (Muhammad's first-person posts): still say "EKUZO 101" and link `/programs/ekuzo101`, which is `noindex`. Left by decision.
- Every post's footer banner is the Season 01 override ("Season 01 starts in 2027. Get them on the list.").
- No post body names EKUZO100, EKUZO Camps or a price.

## Before this pass (Scout, 2026-10-12, from `origin/main` 3144459)

Grep pattern: `ekuzo ?100|ekuzo ?101|ekuzo ?camps?|camps?\b|ekuzo ?teams?|\bteams\b|season 0?1|waitlist|\$[0-9]|/programs` over `app/blog/**`, `components/blog/**`. Result: **no hits for "Season 01", "waitlist", "EKUZOTEAMS", "EKUZO Teams" in any blog post or blog component.** No `/programs/ekuzo-teams` link. Full-text hits below; non-program uses of "camp" (the "three camps" of parents in the homeschool/gaming-study posts), "teams"/"team" (esports teams generally) and `$80,000` / `$520M` are listed only where relevant.

### conquering-my-mountain-and-giants-how-esports-changed-my-life
- `:211-220` (closing italic paragraph, `<p className="italic text-black/60">`): "John's story is one person's experience, not a guarantee. If it resonates and you want a low-stakes way to put your gamer on a coached team, [EKUZO100] is a one-month trial for $100 — or read [when your son's only friends are online] for the bigger picture." href `/programs/ekuzo100` (`:214`), `/blog/when-your-sons-only-friends-are-online` (`:216`).
- `:268` `<FooterBanner heading="Enroll into a transformational program today" />`
- No author-bio block (guest author).

### our-family-s-esports-journey-with-ekuzo-and-the-k1ng
- `:247-255`: "Ryan's story is one family's experience, not a guarantee. For the bigger picture behind it, read [when your son's only friends are online]. And if you want a low-stakes way to try a coached team, [EKUZO100] is a one-month trial for $100." href `/blog/when-your-sons-only-friends-are-online` (`:250`), `/programs/ekuzo100` (`:254`).
- `:199`, `:205`: "teams" in testimonial quote (esports teams generally, not product).
- `:303` FooterBanner heading="Enroll into a transformational program today". No bio block (guest).

### summer-camps-for-kids-who-game-2026 (77 grep hits; product-relevant ones)
- Program links, all href `/programs/ekuzo-camps`, anchor text: `:389` "EKUZO Camps" (in "Representative camps include [EKUZO Camps], [NXT UP...]"), `:482` "EKUZO Camps" ("most structured esports programs (including [EKUZO Camps]) coach in League of Legends"), `:558` "EKUZO Camps" ("That's exactly the kid [EKUZO Camps] is built for, because what we teach in League shows up in whatever they're playing the rest of the week."), `:637` "camps schedule", `:646` "camps page".
- Price: `:414-416` "EKUZO runs a virtual half-day at a 1:5 coach-to-player ratio for $199 per week, which works out to roughly $13 per hour of dedicated top-1% coaching."
- Table: `:470-471` `<td>Structured esports camps</td> <td>$199–$1,900</td>`.
- `:572` H2 "What does a week at EKUZO Camp actually look like?"; `:574` "EKUZO Camps are built for the kid who loves games more deeply than the people around them realize."
- `:622-632`: "Camp is the thing I wish someone had built for me. Camps run weekly from **May 18 through August 8, 2026**. Sign up solo and we'll match your kid into a squad. Sign up with friends and you can stay together. Weeks are $199 (limited-time pricing, original price $299). Most weeks still have open slots."
- `:634-640`: "How do I sign up before the next week starts? Three steps. Pick a week from the [camps schedule]. Decide if your kid wants to sign up solo (we'll match them) or with friends (they stay together). Register. You'll get a welcome email ..."
- `:644-649`: "If you have questions about whether your kid is a fit, the [camps page] has the format details, common parent questions, and a way to talk to the team."
- Title (`:15-16`, also in llms.txt, blog index, Karlin author page): "Virtual summer camps for kids who'd rather be gaming (still open for summer 2026)".
- `:709` `<FooterBanner heading="Enroll into a transformational program today" />`. `:661` closing "— Karlin, founder of EKUZO" (blockquote signoff, `:660`; not the bio variant below).
- Competitor camps (Code Ninjas, CreatorCamp, Connected Camps, UT Austin/Dallas/Arlington, Ohio State, NXT UP, IMG) are external hrefs, not listed.

### league-of-legends-youth-development
- `:623-629`: "If you want to see what this looks like in practice, [our camps] are running all summer. We wrote [a longer guide on that] too." href `/programs/ekuzo-camps` (`:625`), `/blog/summer-camps-for-kids-who-game-2026` (`:627`).
- `:573` "Our players are on stable teams with the same teammates week ..." (no link).
- `:763-785` Keep-reading card -> `/blog/summer-camps-for-kids-who-game-2026`, alt/title "Virtual summer camps for kids who'd rather be gaming".
- `:792` FooterBanner heading="Enroll into a transformational program today". Bio block `:726-731` (variant A below).

### when-gaming-helps-homeschool-kids
- `:443-453`: "That's [what we built EKUZO to be]: stable rosters, trained coaches, clear goals, moderated spaces, and a conversation after the match. You can build a version of that at your own kitchen table. We're one place that does it, if you want the help. If you'd like to try it without a big commitment, [EKUZO100] is a one-month trial that puts your kid on a coached team for $100." href `/methodology` (`:445`), `/programs/ekuzo100` (`:451`).
- `:405` "$80,000 in esports scholarships" (backstory, see 4c). `:616` FooterBanner heading="Enroll into a transformational program today". Bio block `:562-567` (variant A).

### what-homeschool-parents-taught-us-about-gaming
- `:373-381`: "We [coach kids through games] for a living, so I read this less as a debate and more as a brief." href `/programs/ekuzo-camps` (`:376`).
- ("camp"/"camps" at `:19,21,162,167,213-216,222,225,244,252,256,272,281,284,301,327,335,343,358-360,369,406` are the three parent "camps", not the product.)
- `:463` FooterBanner heading="Enroll into a transformational program today". Bio block `:409-414` (variant A).

### what-your-kids-gaming-is-telling-you
- `:629-646`: H2 "A low-stakes way to test the container" -> "[EKUZO100] is our shortest version of that environment. One month, a small team of 5 players at their level, a coach, and a real practice rhythm. Not because every kid should become an esports athlete. Because some kids need a place where the thing they already care about can become social, coached, and healthier. Think of it as an experiment." href `/programs/ekuzo100` (`:636`). (No price in this post.)
- `:724` FooterBanner heading="Enroll into a transformational program today". No bio block.

### when-your-sons-only-friends-are-online
- `:502-507`: "If you want a low-stakes way to feel the difference between a crowd and a team, [EKUZO100] is a one-month trial to see if it might be valuable to your family." href `/programs/ekuzo100` (`:504`). (No price.)
- FAQ answer `:53` (schema string): "A coached team built around his game is one of the most direct ways to get all three at once." (no link)
- `:622` FooterBanner heading="Enroll into a transformational program today". No bio block.

### gaming-military-families
- `:533-541` (single product link by design; header comment `:77-78` "No FooterBanner on this page by design (non-promotional piece)." / "The one-link rule governs PRODUCT links only: exactly one, to EKUZO 101"): "... she'd basically described my week coaching [EKUZO 101]: same small group, private server, a coach in the voice channel. The money one was even easier: we don't have a sponsor; we're a small, self-funded startup." href `/programs/ekuzo101` (`:536`).
- `:733` `{/* FooterBanner intentionally omitted on this page — see header comment. */}`. No bio block.

### should-you-ban-fortnite
- `:589-594` (header `:36`, `:69-70`, `:160` same one-link rule): "... that lesson is my job: the kids I coach through [EKUZO 101] play on a private, moderated server with the same faces, the same coach, and the same video and voice channel every week." href `/programs/ekuzo101` (`:592`).
- `:416,439` "$520 million" (FTC/Epic fact, not a product price).
- `:776` FooterBanner intentionally omitted. No bio block.

### gaming-study-13-7-years-younger-what-it-means-for-kids
- No `/programs/*` link, no product name, no price. (`:173` "Teams and coaches do this for sports", `:437`,`:461` "camps" = reply groups.)
- `:789` `<FooterBanner heading="Every gamer deserves a team" />` (different heading from the other nine).
- Internal link `:628` "my coaches answer parent questions" -> `/parents`. No bio block.

### Components
- `components/blog/QuoteCards.tsx:3` "homeschool gaming thread, grouped by camp." `:94` "Four voices from one thread, grouped by camp."; `components/blog/ReplyQuoteCards.tsx:27` "Camp label on the right" (all thread-camp meaning, not product).
- `components/blog/AuthorPage.tsx:224` `<FooterBanner heading="Enroll into a transformational program today" />` (author pages; skipped when `footerBanner === false`, `AuthorPage.tsx:219-224`).

### FooterBanner behavior (affects every post that renders it)
`components/sections/FooterBanner.tsx:41-43`:
```
const ctaLabel =
  SEASON_ONE_MODE && ctaModal === "enroll" ? SEASON_ONE_COPY.navCta : ctaLabelProp ?? "Enroll my gamer";
const heading = SEASON_ONE_MODE && ctaModal === "enroll" ? SEASON_ONE_COPY.bannerHead : headingProp;
```
So with Season 01 mode on (default), the per-post `heading` props are ignored on all 9 posts that render FooterBanner; they render "Season 01 starts in 2027. Get them on the list." (`lib/seasonOne.ts` `bannerHead`) with button "Join Season 01". The gaming-study heading "Every gamer deserves a team" is also overridden. `getProgramRegisterContext` returns null in Season 01 mode (`lib/programRoutes.ts:41`), so no direct register link.
Posts WITH FooterBanner (9): conquering, our-family, summer-camps, league, what-homeschool, what-your-kids, when-gaming-helps, sons, gaming-study. Posts WITHOUT (2): gaming-military-families, should-you-ban-fortnite.

### Closing author bio blocks (distinct variants)
Variant A, `<p className="italic">` (3 posts: league `:726-731`, what-homeschool `:409-414`, when-gaming-helps `:562-567`):
> Karlin Oei is the founder of [EKUZO](/). He grew up playing League of Legends, paid for college through esports scholarships, and now builds the coaching system he wishes he'd had as a kid.

Variant B, summer-camps closing signoff (`:660-661`, 1 post): blockquote "If your kid would rather spend the summer gaming, that's a starting point, not a problem to fix. The right camp meets them where they already are and builds the community, the coach, and the challenge around it. That's what every great summer experience does. The medium changes; the shape stays the same." then `<p className="text-right">— Karlin, founder of EKUZO</p>`.

Variant C, Casey disclaimer (not a bio): gaming-military `:650-652` "Casey is a real parent sharing her real story, offered so yours can use it. Her surname, unit, and base do not appear here, by design."; should-you-ban `:684-686` "Casey is a real parent sharing her real story, offered so yours can use it."

No bio block in: conquering, our-family, what-your-kids, sons, gaming-study. (Byline rail + `/blog/author/*` pages carry author facts.)

---

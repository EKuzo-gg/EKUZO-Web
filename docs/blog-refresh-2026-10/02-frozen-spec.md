# Frozen spec (Fable)

The spec is the set of approved copy files plus the overrides below. Jamie's approval of each file is the
freeze; approvals and his exact words are in `03-decision-log.md`. Any later deviation is a logged spec change.

## Frozen 2026-10-12

| Copy file | Build as | Overrides to the file as written |
|---|---|---|
| `copy/01-homeschool-guide.md` | Section "The post as it would read" | Anchor text and keep-reading card title follow copy 2's new title. Strip the `(new)` / `(changed)` markers and bracketed stage directions. |
| `copy/02-homeschool-review.md` | Section "The post as it would read" and "Page furniture" | Quote-card caption: "Real comments from a homeschool parent discussion, anonymized. Names and avatars are generic; nothing here is a screenshot of the original thread." (Jamie confirmed the quotes are word for word.) |
| `copy/03-linking-round-one.md` | Both tables, "Proposed" column | Rows 12 and 13 are the card swaps, not the alternative sentences. |
| `copy/04-league.md` | Changes 1 to 11 and 13 | Change 12 dropped (FAQ skills answer stays as published; only repoint the 65% STEM link to the fact library's source, sentence unchanged). Change 14 dropped. Change 1's second sentence and the keep-reading card title wait for copy 9. |
| `copy/05-what-your-kids.md` | All seven changes (6 and 7 are em-dash fixes Steward found) | Steward batch: approve. |
| `copy/06-k1ng.md` | All six changes | Steward batch: approve. |
| `copy/07-conquering.md` | Changes 1 to 7 as the file now reads | No note about John leaving. Steward batch: approve. |
| `copy/08-when-your-sons.md` | Changes 1 to 3 | Shared program line (not the alternative sentence). Steward batch: approve. |

## Sitewide rules frozen

- **Shared program line** (one component, one constant): "EKUZO runs coached esports teams for kids ages 10 to 17. See the current programs." with "See the current programs" linked to `/programs`. Italic, set apart from body text. On: when-gaming-helps, LoL, what-your-kids, when-your-sons, K1NG, conquering.
- **Byline date:** every post shows "Updated [date]", where the date is `DATE_MODIFIED`. No "Published" on the page. Schema keeps `datePublished` and `dateModified`. Cards on /blog and author pages show the same date as the post.
- **A post's `DATE_MODIFIED`, OG `modifiedTime` and sitemap `lastModified`** move to the ship date only for posts whose text changes in this pass. Ship date placeholder: `2026-10-13`; Fable sets the final date before handoff.
- **Closing italic bio** ("Karlin Oei is the founder of EKUZO. He grew up...") removed from every post that has it.
- **FAQ related-reading line:** `FAQAccordion` items take an optional related link rendered under the answer, present in the HTML whether the item is open or closed, not added to FAQ schema, answer strings untouched.

## Camps guide: back in the pass (Jamie, 2026-10-12; supersedes the inactivation)

- Build `copy/09-camps-guide.md`, section "The post as it would read" and "Page furniture", as the file now reads with Jamie's five edits.
- New route `/blog/gaming-programs-for-kids`. The old route `/blog/summer-camps-for-kids-who-game-2026` gets a permanent redirect to it (replacing the temporary redirect to `/blog`), and its page directory is removed (git mv to the new slug so history follows).
- The guide returns to the /blog index, Karlin's author page, the sitemap and `llms.txt` under the new slug and title.
- League post: closing gets "We also keep [a guide to other programs for kids who game](/blog/gaming-programs-for-kids)." after the program line; its keep-reading card points at the guide.
- /faq "What programs does EKUZO offer?" gets "Related reading: Gaming programs for kids: a parent's guide".
- `datePublished` stays 2026-05-14; `DATE_MODIFIED` is the ship date.

## Copy 6 placement (Jamie, 2026-10-12)

The Faith editor's note in Lisa's post sits directly under the paragraph where she first mentions Faith ("...his coach, Faith, would send us emails..."), not under the later "founder of EKUZO, Faith" paragraph.

## Karlin's author page (approved by Jamie 2026-10-12)

- Author-page name line: Karlin "Faith" Oei (a separate display field; `name` stays "Karlin Oei" for bylines, titles and schema `name`).
- Bio: add the sentence "Faith was his gamertag as a jungler at UT Dallas, and it's the name his players know him by." after the sentence that ends "$80,000+ in esports scholarships." in the second bio paragraph.
- Schema: add `https://lol.fandom.com/wiki/Faith_(Karlin_Oei)` to Karlin's `sameAs` (`alternateName` "Faith" already exists).
- `description`: "Karlin Oei is the founder of EKUZO, a former national collegiate esports captain who earned..." (the em dash becomes a comma; nothing else changes).

## Human-action items

- Jamie pushes. Nothing leaves this machine from Claude.
- After deploy: request indexing per changed URL, annotate Search Console, recheck about 2026-11-09 (brief § E).
- The build needs `STRIPE_SECRET_KEY` on the command line in this worktree (no `.env.local`); a placeholder test value is used for `next build` only.

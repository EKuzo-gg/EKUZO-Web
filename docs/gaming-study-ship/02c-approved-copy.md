# Approved copy (Jamie, 2026-10-11 in session)

Jamie's words: "alternate. images in assets can probably be optimized. no concern about sign-up, that's fine. make updated posts and fixes you mentioned. subhead stays as is".

Read as: S1 = the alternate, original-post link only (no second link was asked for); subhead unchanged; the five inbound-link sentences go in as reviewed, with Steward's fixes; the three images are recompressed (spec change SC-1 below). S3 and S4 go in as Steward's fixed versions under "the fixes you mentioned"; both are shown to Jamie in the session reply and stay open to a veto. This file is the source for Sentry's copy-fidelity diff. Link target in every S2 item: `/blog/gaming-study-13-7-years-younger-what-it-means-for-kids`.

## S1 (post, second body paragraph, replaces "I saw the post the same day you did. ...")

I saw [a recent post on X](https://x.com/BrandonLuuMD/status/2099226796893798645), probably the same way you did. A physician with a big following put up a study abstract and one sentence: frequent gamers performed on cognitive tests like non-gamers about 13.7 years younger. Counting the posts that quoted it, it passed 30 million views in its first week. For three days my feed argued about whether video games make you smart.

## S2.1 `what-your-kids-gaming-is-telling-you` (replaces the existing link paragraph after the sign-off, same place)

If [the viral “13.7 years younger” gaming study](LINK) is why you’re here, that number isn’t in the paper. I read about a thousand of the replies and wrote up what it means for a twelve-year-old.

## S2.2 `league-of-legends-youth-development` (replaces the existing link paragraph after the bio, same place)

When [the viral “13.7 years younger” gaming study](LINK) went around, the most-liked reply under the original post was “The kind of gaming probably matters as much as the hours,” which is this whole page in eleven words. The 13.7 isn’t in the paper. I wrote up what is, and what it means for your kid.

## S2.3 `should-you-ban-fortnite` (replaces the existing link line after the sources list, same place, same styling; an editor's line outside Muhammad's prose)

Related: when [the viral “13.7 years younger” gaming study](LINK) went around (the number isn’t in the paper, and the study was of adults), parents in the replies asked, unprompted, how to get a kid off the game without the attitude. EKUZO founder Karlin Oei read about a thousand of the replies and wrote it up.

## S2.4 `what-homeschool-parents-taught-us-about-gaming` (remove the existing link paragraph after the italic bio; new paragraph directly after the paragraph ending "I wrote that one here.", above the bio)

This piece has a sibling. I ran the same read on about a thousand replies to [the viral “13.7 years younger” gaming study](LINK). That number isn’t in the paper. The replies sorted into camps there too.

## S2.5 `when-your-sons-only-friends-are-online` (new paragraph at the end of the section "The real question: alone or together", directly after the paragraph ending "The answers tell you whether to worry, and what to do about it.")

The same idea surfaced when [the viral “13.7 years younger” gaming study](LINK) made the rounds (the number isn’t in the paper; Karlin, our founder, read about a thousand of the replies). The most-liked reply under the original post was “The kind of gaming probably matters as much as the hours.”

`DATE_MODIFIED` on that post becomes 2026-10-12 (a body paragraph was added).

## S3 hero alt

A phone showing the X post that says gamers test “~13.7 years younger.” The number is underlined, and a taped note under it reads “not in the paper.” Sticky notes ask which games, how many hours, what age, better than sports. Karlin Oei in a headset.

## S4 Sources line (replaces "View counts as read September 15, 2026: ... across the wave.")

View counts: more than 30M across the original post and its quote-posts by September 15, 2026. Original post 17.2M as read October 11, 2026; the two largest quote-posts 5.8M and 7.9M, and about 33M across eight posts, as read October 6, 2026.

The sentence after it ("Likes as shown at the time.") stays. If Jamie re-reads the two quote-posts on ship day, the numbers and dates update; never a combined figure.

## Spec changes

- SC-1 (AS-1 to AS-3): the images are no longer byte-identical to `assets/final/`. Recompressed with sharp (mozjpeg q78 4:4:4 hero, q80 card; 8-bit palette PNG graphic), same dimensions: hero 281 to 242 KB, card 116 to 94 KB, graphic 164 to 46 KB. Hashes in `evidence/image-hashes-optimized.txt`. Gate becomes: dimensions match and Steward's visual parity against the finals.
- SC-2 (CP-12): Jamie approved the five sentences as a batch instead of one at a time.
- SC-3 (MN-7, D5): Jamie has no concern about test sign-ups. The Klaviyo-side proof runs locally the way the 10-11 loop did it (real Klaviyo key, no Meta env on the server, browser behind the proxy), with `team+gstest-1012-*@ekuzo.gg` identities and cleanup-ledger rows. The no-live-Meta-Lead rule (MN-4) is unchanged.

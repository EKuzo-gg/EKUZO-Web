# Copy fidelity, slice 4 (Atlas)

Rendered by the local dev server on port 3101 (test mode, open window, before the jersey cutoff), read in Chromium at 375px with analytics hosts blocked. Strings are the page text after load; sms and link targets are read from the anchors. Pages: join `/season1/join`, crew `/crew/{code}` (named: a real test-DB code; nameless: unknown code), signup `/season1/join/signup`. Welcome is Relay D's and not in this table.

| C-id | Page | Check | Rendered string | Match |
|---|---|---|---|---|
| P1 | join | query stripped client side after load | /season1/join | yes |
| C1 | join | eyebrow | Season 01 is open · Starts mid January | yes |
| C1 | join | urgency line | Spots are limited. Teams are small and hand-picked. | yes |
| C2 | join | pay-up-front option gone, optional line | Rather pay up front? You can choose that at lock-in. | yes |
| C3 | join | friend row 4 | 4 friends \| Free. We refund your $100. | yes |
| C3 | join | friend note | Per family. Siblings don't count as friends. Credits apply at lock-in. Four friends make the season free. You get your link right after you save a spot. | yes |
| C4 | join | refund line + terms link | Fully refundable until December 31, 2026, and any time we can't place your kid | yes |
| C5 | join | ages | Online team play for kids ages 10 to 17, from home. / Kids ages 10 to 17. Outside that range? | yes |
| C7 | join | every sms link from config | sms:+18324438679 x2 | yes |
| C8 | join | jersey line before cutoff, no counter | Free jersey for the first 100 families | yes |
| C10 | join | timeline row | Dec 31 \| Lock-in. Your spot becomes final. Until then, a full refund. | yes |
| C15 | join | dev banner gone, test bar in test mode | Test mode. No real charges. (test mode); no 'Preview on dev' | yes |
| P1 | join | CTAs go to join/signup | /season1/join/signup, /season1/join/signup, /season1/join/signup | yes |
| P1 | crew (named) | query stripped client side | /crew/75701491 | yes |
| C1 | crew (named) | urgency line | Spots are limited. Teams are small and hand-picked. | yes |
| C3 | crew (named) | credits timing | Then invite your own friends: every friend who joins gets you another free month. Credits apply at lock-in. | yes |
| C4 | crew (named) | refund line + terms link, 2 places | Fully refundable until December 31, 2026, and any time we can't place your kid | yes |
| C5 | crew (named) | ages | kids ages 10 to 17 / Kids ages 10 to 17 | yes |
| C7 | crew (named) | sms from config | sms:+18324438679 x2 | yes |
| C8 | crew (named) | jersey line before cutoff | Free jersey for the first 100 families | yes |
| C9 | crew (named) | jersey step copy | A team jersey they design together, a schedule, and a final tournament in May. | yes |
| C10 | crew (named) | no timeline on this page | n/a (no timeline; no 'Jan 1' either) | yes |
| C15 | crew (named) | no preview bar; test bar in test | Test mode. No real charges. | yes |
| P1 | crew (nameless) | query stripped client side | /crew/00000000 | yes |
| C1 | crew (nameless) | urgency line | Spots are limited. Teams are small and hand-picked. | yes |
| C3 | crew (nameless) | nameless drops credit promises (T14) | (no credit line) Invite link not active? You can still join. Text Karlin about credits. | yes |
| C4 | crew (nameless) | refund line + terms link, 2 places | Fully refundable until December 31, 2026, and any time we can't place your kid | yes |
| C5 | crew (nameless) | ages | kids ages 10 to 17 / Kids ages 10 to 17 | yes |
| C7 | crew (nameless) | sms from config | sms:+18324438679 x3 | yes |
| C8 | crew (nameless) | jersey line before cutoff | Free jersey for the first 100 families | yes |
| C9 | crew (nameless) | jersey step copy | A team jersey they design together, a schedule, and a final tournament in May. | yes |
| C10 | crew (nameless) | no timeline on this page | n/a (no timeline; no 'Jan 1' either) | yes |
| C15 | crew (nameless) | no preview bar; test bar in test | Test mode. No real charges. | yes |
| P1 | signup | query stripped client side | /season1/join/signup | yes |
| C4 | signup | refund line in consent (C16) | Fully refundable until December 31, 2026, and any time EKUZO can't place my kid. | yes |
| C5 | signup | age label and warning | Age (10 to 17); Season 01 is built for ages 10 to 17. Karlin will check in to make sure it's a fit. | yes |
| C7 | signup | sms from config | sms:+18324438679 x4 | yes |
| C8 | signup | jersey receipt line only before cutoff | Founding jersey (first 100) \| Free | yes |
| C10 | signup | no timeline on this page | n/a (no timeline; no 'Jan 1') | yes |
| C15 | signup | test bar | Test mode. No real charges. | yes |

Result: 40 of 40 rows match.

## Sentry D4: "Invite link not active? You can still join. Text Karlin about credits."

Shows only when resolveCode returns null (unknown or void code). Checked by curl against the dev server:

| Case | Occurrences of the line | Expected |
|---|---|---|
| Unknown code `/crew/00000000` | 1 | 1 |
| Valid code, crawler UA (facebookexternalhit), nameless copy | 0 | 0 |
| Valid code, named render | 0 | 0 |

Other valid-but-nameless causes (rate limit, show_name false, partner without display name) take the same path (resolveCode returns a row with named false), so they also omit the line. A DB error during lookup renders nameless and also omits the line (it is not an inactive code).

# 03 Decision log, round 2 (Fable), most overrulable first

| # | Decision | Why | Undo |
|---|---|---|---|
| R2-D1 | Quiet threshold 10 an hour per IP, not 5 (Jamie agreed 5 in chat 11:16 CT; changed on red team evidence) | Carrier CGNAT and school or office wifi cluster real parents at 7 to 8:30 pm; quiet costs real Leads silently. 30 an hour still blocks. A global ceiling (150 new sign-ups an hour) covers proxy farms. | one constant |
| R2-D2 | The limiter counts only `new` sign-ups and lives in the claim transaction | Retries, repeats and failed writes must not burn a family's budget; one round trip keeps the time budget (red team ops 1, 2). | n/a |
| R2-D3 | IP from Netlify's `x-nf-client-connection-ip` only; IPv6 by /64; no IP, no limit | `x-forwarded-for` is client-set; an empty key would put everyone in one bucket (money 6, 7; ops 3). Also fixes the live Meta IP fallback. | n/a |
| R2-D4 | Steps: eventId match, else email match for old pages; no match is a silent 200 with a `step_dropped` warn | A visible error would tell a stranger whether an email signed up. The Text Karlin card only exists on the confirmation in the same page view, so a reload has no card to tap (trust 12 is moot for the landing). | n/a |
| R2-D5 | Stay indexed when sign-ups close; Offer becomes SoldOut | Avoids deindex churn; the page copy is honest when closed. | robots flag |
| R2-D6 | No FAQPage JSON-LD on /join | Google shows FAQ rich results only for government and health sites, and the markup must equal visible text, which is Aaron's B copy; AI crawlers read the visible FAQ anyway. Course plus Offer carries the price. | add later from canon |
| R2-D7 | No bot exclusion from tags this round | GA4 filters known bots; Pixel noise from crawlers is small next to ad traffic. Revisit if ViewContent counts jump after indexing. | one regex in tags.ts |
| R2-D8 | Offer price is the season ($580) with the $100 and $160 described, never $100 as the price | A $100 Offer reads as the season price in AI answers (money 25). | n/a |
| R2-D9 | Origin guard on `/api/season-one` | Cheap; a hostile page cannot use visitors' browsers as proxies. | n/a |
| R2-D10 | Hero fix by moving the 1.2 MB of inline base64 images to files, not by hiding the form until the hero is ready | Hiding trades the shift for a blank screen of about 7 s on throttled phones; moving the images lets the script run about 1 s in, speeds every ad page, and matches how d19 to d21 already load. Real-user Clarity CLS on d2 and d4 is 0.062 and 0.001, so the lab numbers overstate today's harm. | revert one commit |
| R2-D11 | A repeat sign-up claims the ev key again, so its Text Karlin and games steps go through | Sentry A SA-1: without it a returning parent's Text Karlin request is silently dropped behind a success card. The reopened gap (a stranger re-signing up as someone to post a step) is bounded by the 3-per-day Text Karlin cap and is far smaller than before this round. | n/a |
| R2-D12 | Steps without an eventId keep the email-only fallback for now (SA-2); remove it once pages cached before this release have aged out (a week) | Old open tabs must not lose steps on deploy day. | follow-up |
| R2-D13 | Season 01 FAQ canon written (seven entries, pricing line, refund pointer), Jamie approved 11:47 CT | KB `company/knowledge/ekuzo-faq-canon.md` § Season 01 | n/a |

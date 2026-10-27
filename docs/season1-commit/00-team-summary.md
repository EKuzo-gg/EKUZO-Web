# Season 01 commit: try it this morning (test mode, no real money)

Everything from the overnight build works end to end on the test site: a family pays $100, gets a
share link, a friend joins through it, and the team sees it in Klaviyo.

- Season page: https://season1-commit--ekuzo.netlify.app/season1/join
- Karlin's link to text a parent: https://season1-commit--ekuzo.netlify.app/karlin
- A friend's invite (test family "Zoë"): https://season1-commit--ekuzo.netlify.app/crew/75701491
- The welcome page opens after you pay.

On your phone: card 4242 4242 4242 4242, any future date, any CVC, any ZIP. Use an email like
`aaron+s1@ekuzo.gg` or `team+s1test-you@ekuzo.gg` so Klaviyo receives the test events. Then open the
friend link from an Instagram DM and pay again as the friend.

Watch: Klaviyo shows "Season 01 Committed" and "Season 01 Friend Joined". Discord posts are built but
off until a channel webhook exists (`#s1-commits-test`).

Not done yet: the one-tap Apple Pay button above the form (wallets show inside the form for now),
prefilled email links, the jersey size and address step.

Decide today (each is built this way; say no to change it):
1. Terms: approve or edit the one-page Season 01 terms, now marked Draft on the site (Jamie).
2. Refunds and the jersey: pages say "fully refundable until lock-in"; the draft terms add "$65 back if
   the jersey has shipped". Pick one story (recommendation: drop the $65 rule until jerseys ship)
   (Jamie, Karlin).
3. Invite wording: the banner reads "Invited by Zoë's family" instead of "Joining Zoë's team", and
   friends are placed together only after Karlin checks (Aaron).

To go live Wednesday:
- Jamie: approve terms; production database and live keys; live webhook; Apple Pay domains; `S1_REF_SECRET`.
- Jamie: one live $100 commit on a real phone, then refund it.
- Aaron: Committed receipt flow with the share link; waitlist suppression filter; his delta sheet.
- Karlin: Google Voice number and season dates into the config; `#s1-commits` channel.
- Everyone: the next.js security update ships as its own small release first.

Aaron: your pages next to ours, with each change marked forced or your call: see the delta sheet in
the shared drive.

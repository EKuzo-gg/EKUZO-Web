# Decision log (most overrulable first)

| # | Decision | Whose | Why | To overrule |
|---|---|---|---|---|
| D1 | A link arrival shows a panel and loads answers only on the parent's tap, where the approved plan had the wizard reopen by itself | Fable, after the red team (A1, B3, B6); told to Jamie in session | A planted link, a script-running mail scanner and a slow answer all fail safe when nothing loads without a tap. Cost: one tap | Auto-resume: drop the panel step in the script |
| D2 | After the tap the link returns the player's first name, age, fun fact and the chip answers; never the parent note, time zone or times | Fable | The note is where health and family details go; the rest is the feature | Add or remove keys in the restore route's strip list |
| D3 | New on-page strings (three): panel "Welcome back." / "Your answers are saved under {email}. Pick up where you left off?" / buttons "Pick up where I left off", "Start fresh"; dead link "That link has run out. Start below and your answers will save as you go." Voice stack loaded before drafting (anti-ai-writing, voice-dna, ekuzo-messaging-voice) | Fable drafted; Aaron and Jamie own copy | Jamie: "we don't want people in a blank"; the panel uses the page's existing classes | Change the strings in `betaProgressScript.ts` |
| D4 | Validity 14 days from the last real progress (the session message at 14:23 said 30) | Fable, after the red team (A5, B4, C13) | The link is a bearer secret in mail and logs; a dead link now shows a line and the first screen, so the cost of expiry is small | `RESTART_VALID_DAYS` |
| D5 | Finished family: the page's existing end screen, generic headline, no player card | Jamie's direction (existing design), Fable's detail | A finished family's link unlocks no kid data | |
| D6 | Zone guess from an explicit US and Canada table, in our appended script; Atlantic and Newfoundland read "Outside the US" until the page has an option for them | Fable | Offsets mislabel Latin American zones; `start.html` is Aaron's | Aaron adds an Atlantic option; the table and the server's `TIME_ZONES` follow |
| D7 | The restore endpoint is its own route file | Fable | Zero diff on the protected `/api/season-one` route | |
| D8 | `cleanPath` in shared attribution code gains one collapse rule | Fable, after C1 | Without it the token lands in a cookie and in Neon | |

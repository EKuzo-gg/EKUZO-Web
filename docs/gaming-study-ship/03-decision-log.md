# Decision log (Fable), most overrulable first

| # | Decision | Why | To overrule |
|---|---|---|---|
| D1 | Work on a new local branch `build/gaming-study-ship` in a worktree, with `origin/main` merged there (`8bab088`), instead of merging in Jamie's checkout on `blog/gaming-study-13-7` | "Stop before any push or merge" plus a dirty checkout holding other work. The worktree leaves the checkout, the ten docs and the post branch untouched; on the go the post branch fast-forwards to these commits | Say so; the same commits can be made on the post branch directly |
| D2 | Keep Reading converted to the three-card pattern, with blurbs and categories copied from the `/blog` index entries. The homeschool card's category label now reads "Case Studies" and its author line is gone, because the pattern has neither | Change list: "Add ... if the block takes more than one"; no new copy written | Revert to the single card |
| D3 | Visible date shows "Updated October 12, 2026" only (the summer-camps pattern); the component cannot show Published and Updated together | Decision 2; go-live checklist | Show Published instead |
| D4 | `app/sitemap.ts` and `public/llms.txt` gained an entry for the post. The llms line reuses the page title and `DESCRIPTION` verbatim | ai-optimization checklist § Robots; not in the change list | Remove either line |
| D5 | No Klaviyo, Meta or Beehiiv write before Jamie's go. Local QA intercepts the sign-up POST in the browser and runs the server with fake keys. The Klaviyo-side proof waits for the deploy and a Netlify env readout | Local `.env.local` would send a live server-side Meta Lead; campaign is live | Approve a local run with the real Klaviyo key and the Meta token blanked |
| D6 | The Season 01 popup has no live-host guard (the `/season1` page has one), so any sign-up on a deploy fires live GA4 and pixel Leads. Not changed here | Decision 8: no new tracking code | Ask for a follow-up change |
| D7 | Dates built as 2026-10-12 | Decision 2: the merge day, expected Monday | Re-set on the day |
| D8 | S1, S2, S3, S4 and the C7 sentence are not in the build until Jamie approves each. The old opening, old hero alt, old view-count sentence and the four September link sentences are still in the tree | Brief: Jamie approves each | n/a |

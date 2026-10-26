# docs/ai-optimization-checklist.md run, Robux post (2026-10-26)

| Item | Result |
|---|---|
| SERP read, target query and format | Done in the 2026-10-24 session (knowledge-base/explorations/2026-10-24-blog-next-post/01, 02): "should I buy my kid Robux", Robux prices, Roblox parental controls; question-titled post with a short answer first |
| Not splitting an existing page's topic | No other EKUZO page covers Robux or Roblox spending |
| Non-commodity content, unique point of view | A real family's $20 pilot, with the dad's own quotes and her actual spending |
| Lead with the answer | Short answer first (about 60 words; the checklist's 134 to 167 target is not met; Jamie's copy is final) |
| Question-shaped headings | Five question-shaped FAQ headings; body headings are story headings (copy of record) |
| Named expert quote | Karlin's byline; the dad's two quotes are anonymous by design (privacy) |
| Numbers with sources | 13 sources, each linked; prices re-read on ship day (evidence/price-check-2026-10-26.txt) |
| Real images, alt text | Real family photo, game text blurred; graphic alt text from the copy of record; tables are HTML, not images |
| Indexable, canonical, server-rendered | index,follow; canonical /blog/should-i-buy-my-kid-robux; static (○) route in next build |
| Mobile | 375/768/1440 screenshots; no horizontal overflow after D2 fix |
| Core Web Vitals | Not measurable locally; run PageSpeed on the deployed URL (after-deploy list) |
| Semantic HTML, headings | One h1; h2 then h3 without skips (Sentry resp-a11y.txt) |
| 5 or more internal links in | 5 approved inbound sentences, plus /blog featured card and Karlin's author page |
| Anchors carry the entity | Yes (for example "here's how one dad turned it into a $20 money lesson") |
| Visible updated date | Rail shows Updated October 26, 2026 |
| Schema in lib/schema.ts, server-rendered | BlogPosting, FAQPage, BreadcrumbList from lib/schema.ts via JsonLd; parsed and matched to visible FAQ (Sentry head-schema-retest2.txt). validator.schema.org paste: do on the deployed URL |
| No fabricated schema data | Dates real; no ratings or prices in schema |
| Sitemap, robots, llms.txt | Sitemap entry with lastmod 2026-10-26; robots allows / and /_next/; llms.txt entry added |
| /audit on the preview URL | Pending: run once the dev deploy is up (needs Jamie's push to dev) |

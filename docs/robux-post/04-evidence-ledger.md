# Sentry results (2026-10-26, http://localhost:3311). Evidence paths relative to /home/claude/qa/sentry/

| Req | Test | Evidence | Result |
|---|---|---|---|
| R19 | Guard self-test: facebook, clarity, GTM captured, all got guard 204 stub, none real | guard-selftest.txt | PASS |
| R1 | Copy fidelity: 125/125 sentences, 1549/1549 words identical (quotes normalized); only tables + rail added | fidelity-diff.txt, rendered.json, fidelity.py | PASS |
| R2 | H1, title, meta description exact (157 chars) | head-schema.txt | PASS |
| R3 | Byline Karlin Oei, Updated Oct 26 2026 visible; "Published" date NOT visible (template shows Updated only; Published only in meta/JSON-LD) | head-schema.txt, links-post.txt | FAIL (minor, see D1) |
| R4 | Hero source 1916x809; card 1200x630 200 image/jpeg; og:image = twitter:image | hero-dims.txt, head-schema.txt | PASS |
| R5 | In-post graphic present, alt equals copy of record | rendered.json | PASS |
| R6 | Two real tables, th + thead, captions exact | rendered.json, resp-a11y.txt | PASS |
| R7 | Canonical; 4 JSON-LD blocks parse; FAQPage 5/5 Q and A equal visible; BlogPosting author @id #coach-karlin (defined); BreadcrumbList Home>Blog>Post | head-schema.txt | PASS |
| R8 | First "Roblox" link = Parental Controls Overview; 3 internal links 200; 13 sources 13 links; 3 Keep Reading cards 200; externals 11x200, 2x403 via curl (help.roblox.com, bot block, not verifiable here) | links-post.txt, ext-link-status.txt | PASS (2 externals unverified, D4) |
| R15 | Four inbound links present, visible, in body, Updated October 26, 2026 | inbound-links.txt | PASS |
| R15 | /parents FAQ "How do you keep online spaces safe?" related link "How one dad handled the Robux ask" visible after opening (collapsed to height 0 before) | inbound-links.txt, resp-a11y.txt, parents-faq-open.png | PASS |
| R11 | /blog: post first and labelled "Perspective · Featured"; gaming-study not featured, "recent" absent | blog-author.txt, blog-index-1440.png | PASS |
| R16 | /blog/author/karlin-oei lists post first | blog-author.txt | PASS |
| R12 | sitemap: post + 4 posts + /parents + 3 author pages = 2026-10-26; no duplicates; others unchanged-looking | sitemap.xml | PASS |
| R13 | llms.txt entry plain sentences, blog index line has no em dash | llms.txt | PASS |
| R14 | robots.txt: only Disallow /api/; post and /_next/ allowed | robots.txt | PASS |
| R9 | Dashes: post body 0/0/0/0, llms entry 0, blog index line 0, five inbound sentences 0 | dashes.txt, resp-a11y.txt | PASS |
| R18 | Console/page errors, 11 pages x 375/1440: 0 page errors; only torn-paper 404 (known) on most; EXTRA 404s: testimonial-videos posters on /parents (8) and when-your-sons (1) | browser-truth.txt, browser-truth.json | FAIL (minor infra-gap, D3) |
| R20 | 375 doc scrollWidth = 375 (no doc overflow); tables fit (321px, inside viewport); BUT 5 source URLs run past the right edge and are clipped by article overflow-hidden | resp-a11y.txt, clip.txt, shots/sources-375.png, shots/table*-375.png | FAIL (D2) |
| R20 | Screenshots 375/768/1440 of post | shots/post-375.png, post-768.png, post-1440.png | PASS |
| A11y | All content images have alt (decorative alt=""); tables have th with scope; headings 1>2>3, no skips, one h1 | resp-a11y.txt | PASS |

## Retest, repair cycle 1
| Req | Test | Evidence | Result |
|---|---|---|---|
| R20 (D2) | 375 wide: no .blog-content element extends past viewport (previously 5 source links to x=451) | clip-retest.txt, shots/sources-375-retest.png | PASS |
| R9 | New llms.txt entry and blog index line: 0 em, en, spaced hyphen, double hyphen | dashes-retest.txt, llms-retest.txt | PASS |
| R1 | Copy fidelity rerun: 125/125 sentences, 1549/1549 words, 0 diffs | fidelity-diff-retest.txt | PASS |
| R8 (D4) | en.help.roblox.com sources load in a real browser | PM verification | CLOSED (verified by PM) |

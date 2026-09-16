# 06 Cleanup ledger (Relay/Fable): every production write

| When (UTC) | System | Write | Identity | Id | Status | Cleanup |
|---|---|---|---|---|---|---|
| 2026-09-16 pre-flight (Fable, Jamie's machine) | Beehiiv | POST subscription with utm_source=blog, utm_medium=popup, utm_campaign=thumbs, send_welcome_email=false, double_opt_override=off | newsletter-test+1789503074@ekuzo.gg | sub_17b7fb9c-c1dc-4847-a7e2-e6ca21f47b56 | status "validating" | Keep until the Blog welcome automation has sent to it once; then DELETE /subscriptions/{id}. Owner: Jamie/Fable. |
| 2026-09-16 pre-flight | Beehiiv | POST tags source-blog, variant-thumbs, preflight-test on the row above | same | same | 201, tags readable on GET | Removed with the subscriber (tags cannot be removed via API). |

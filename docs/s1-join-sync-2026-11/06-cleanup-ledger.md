# 06 Cleanup ledger (production writes)

| When (CT) | System | Write | Identity | Cleanup |
|---|---|---|---|---|
| 2026-11-05 10:16 | Klaviyo | Season 01 Waitlist event, profile props, list XGTv2F subscribe (hotfix proof, ad d19) | team+s1test-1105-ad@ekuzo.gg (profile 01M6P7ZD0ZD84THHM078KKMEHZ) | Test prefix excluded by the readout; leave, or suppress the profile in Klaviyo |
| 2026-11-05 10:16 | Meta CAPI | One Lead, content_name season_one_d19, event_id s1test-1105-ad-hotfix-0001 | same (hashed) | Cannot be deleted; one test Lead on 11-05 |
| 2026-11-05 10:15 | GitHub main | 8ce0e17 fast-forward from c1f01e6 (Jamie's go 10:14 CT) | n/a | n/a |

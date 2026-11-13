# Evidence ledger

The requirement by requirement table (L1 to L10, Z1, Z2, M1 to M8, J1 to J6) is Sentry's, in `evidence/sentry/results.md` § E, run on cc867cb. What that table marked "not proven here" was closed on the deploy:

| What | Evidence | Result |
|---|---|---|
| Restore query on real Postgres; link written to Klaviyo; panel, tap, resume; one-shot cookie; reusable link; tampered link; finished family; profile link reset | `evidence/relay/preview-round-trip.md` (deploy preview 7, build 9203e97) | pass, after R-1 |
| Redirect headers and cookies through Netlify, with and without a query | same file | pass |
| `S1_REF_SECRET` in the Production context | read in the Netlify UI, 15:25 CT | set, right scopes |
| Production: pages 200 (`/`, `/season1`, `/season1/join`, `/season1/beta`, launch, start), redirect headers, foreign Origin 403, link written to the profile as an ekuzo.gg address, peek reads resume | Fable, 15:35 to 15:36 CT on ekuzo.gg build 0cbf872 | pass |
| Pick-up email link | Klaviyo render of UASFfq with the property (the link) and without (the plain address) | pass |
| Safari, iOS Mail, Gmail in-app browser | not run | open: Jamie's phone |
| A real send of the pick-up email | not run (Wf7Nam is Draft) | open |

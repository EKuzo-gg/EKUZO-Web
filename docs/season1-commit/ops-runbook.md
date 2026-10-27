# Season 01 commit: ops runbook

For Karlin and Jamie. Plain language. This file is in a public repo, so it holds no secrets, no
family data and no strategy beyond the public prices. Examples use made-up ids.

Sources: `02b-spec-slice2.md` (O4, O13, O15, T1 to T3, T10, T12), `redteam-ops.md` (rows 4, 5, 6, 7,
10, 11, 12, 13, 15), `redteam-trust.md` (row 12).

## The five commands

Run them from the repo with `npm run`. Every one prints what it would do and changes nothing until you
add `--apply`. They print order ids and codes but never a full email (you see `a***@domain.com`) and
never a secret. They refuse to run when the database and the Stripe key disagree (test with test,
live with live), and they refuse anything live unless you pass `--live`.

| Need | Command |
|---|---|
| Look up a family | `npm run s1:find -- --email <email>` or `--order <order id>` or `--kid <first name>` or `--code <code>` |
| Refund | `npm run s1:refund -- --order <order id> [--kid <first name>] [--amount <cents>] [--apply]` |
| Credit a friend by hand | `npm run s1:attach-code -- --order <order id> --code <code> [--apply]` |
| Partner link, void, rotate, hide a name | `npm run s1:code -- partner|void|rotate|hide-name|show-name ...` |
| Clean up abandoned orders | `npm run s1:sweep [-- --apply]` |

Working on production: put the production `DATABASE_URL` and the live Stripe key in your local
`.env.local` (never commit it), add `--live` to the command, and put the test values back afterwards.
A mixed setup (live key with the test database, or the reverse) is refused.

## How a commit shows up

When a parent pays, three things happen on their own, usually within a minute:

1. **Stripe**: a successful payment on the Season 01 product (the order id is in the payment's
   metadata as `order_id`). If you turned on Stripe's "successful payment" email notifications you get
   an email.
2. **Klaviyo**: the parent gets the Committed email through the outbox, and the inviter (if any) gets
   the Friend Joined email.
3. **Discord**: a commit post appears in the ops channel, but only once `S1_DISCORD_WEBHOOK_URL` is
   set. Until then the outbox marks those rows `skipped_no_config` and nothing is lost. Flags and alerts
   (see "Flags" below) use the same channel.

The family also lands on the welcome page with their share link right after paying. If the Klaviyo
email is missing, run the outbox (below) before anything else.

## Finding a family

```
npm run s1:find -- --email parent@example.com
npm run s1:find -- --order kdh7b8ucgk        # the order id on the welcome page; also accepts a pi_ id
npm run s1:find -- --kid Zoe                 # accents and capitals do not matter; may list several families
npm run s1:find -- --code "1326 4037"        # quote it if you include the space
```

It prints, per family: guardians (masked), orders (status, amount, paid time, flags, failed
payments), kids (first name, age, status), codes, referrals, and an outbox summary. Referrals show
counts only: the inviter view never lists friend names.

Order statuses: `pending` (started, not paid), `paid`, `failed`, `partially_refunded`, `refunded`,
`canceled`.

## Refunds

The refund rule, as written in the Season 01 terms (section 4):

> Your $100 is fully refundable until lock-in, two weeks before your session starts. If your free
> jersey has already shipped, we refund $65 and the jersey is yours to keep, or send it back for the
> full $100. If we can't place your kid on a team, you get the full $100 back and keep the jersey.
> Once the season starts, it isn't refundable, like any team sport.

Do refunds with the script so the system knows who left.

```
# Whole order (everything still refundable):
npm run s1:refund -- --order kdh7b8ucgk
# One kid on a multi-kid order (amount defaults to that kid's price):
npm run s1:refund -- --order kdh7b8ucgk --kid Zoe
# Jersey already shipped, keeping the jersey: the script prints the $65 amount as advice
npm run s1:refund -- --order kdh7b8ucgk --kid Zoe --jersey-shipped
npm run s1:refund -- --order kdh7b8ucgk --kid Zoe --amount 6500 --apply
```

Read the dry run, then add `--apply`. Notes:

- The `--jersey-shipped` amount is advice only. There is no "jersey shipped" date in the database
  yet; you tell the script. The rule text names $65 of $100. Sibling prices are lower, so confirm
  the amount with Karlin before you apply.
- Two kids with the same first name on one order: the script stops and asks for `--kid-id` (the id
  is shown by `s1:find`).
- Running the same command twice within a day does not refund twice; Stripe returns the first
  refund.
- Never refund from the Stripe Dashboard unless you must. A Dashboard refund has no kid attached, so
  the system flags the order `refund_unattributed`, posts an alert, and no kid is marked refunded. A
  full Dashboard refund still works (the whole order is marked refunded). A partial one needs a
  manual fix: ask Jamie.
- A refund that is full in total counts as full even if it was paid back in pieces.
- What the system does on its own after a refund: marks the kid (or all kids) `refunded`, lowers the
  inviter's friend count by one per refunded kid, voids the friend credit when no kids are left, and
  voids the family's own link when the family has no other paid order. If the family pays again later,
  their link comes back. Klaviyo sends a Refunded email.
- If a refund fails (rare) the order gets the `refund_failed` flag and an alert. Check Stripe.

### Refund metadata contract (for whoever wires the webhook)

The script creates the Stripe refund with:

| Key | Value | Meaning |
|---|---|---|
| `s1_order` | the order public id | informational |
| `s1_kid_id` | the kid's `s1_kids.id` (uuid) | present on a one-kid refund only |

On `charge.refunded` the handler lists the charge's refunds and reads `metadata.s1_kid_id` on each.
A uuid marks that kid `refunded` (only if the kid is on this order), lowers `friend_kids` by one on the
order's referral (status `void` at zero), and sets the order `partially_refunded` (or `refunded` when
`charge.amount_refunded === charge.amount`). A partial refund with no `s1_kid_id` is flagged
`refund_unattributed` with an `ops_alert` outbox row. Idempotency key: `s1-refund:<order>:<kid id or all>`.

## Friend links, partner links, hiding a name

A friend link is `/crew/<code>` and shows the first name of one kid in the family ("Anyone with this
link sees {Kid}'s first name. Share it with families you know." is on the welcome page). Three tools:

**Hide the name on a link** (a parent asks, or a link ended up somewhere public). The link still works
and credits the family; it just renders without a name.

```
npm run s1:code -- hide-name --code 13264037 --apply
npm run s1:code -- show-name --code 13264037 --apply      # undo
```

**Rotate a link** (the link leaked, got posted, or is being abused). The old link stops working
immediately, a new one is made and printed. Friends who already joined keep their credit. Send the
family the new link.

```
npm run s1:code -- rotate --family-code 13264037 --apply
```

**Void a code** (it should simply stop working, no replacement). Existing credits stay.

```
npm run s1:code -- void --code 13264037 --apply
```

**Partner and creator links.** Only for partners and creators, never for a family. Rules (T3):

- A partner link has a display name that appears instead of a kid name. The script requires
  `--name`.
- The slug is 3 to 20 lowercase letters, nothing else.
- Never use a kid's name or any surname in the slug or the display name. The script blocks first
  names of kids in the target family; it cannot check surnames, so you do.
- The `--target` family code is the family that receives the credit.

```
npm run s1:code -- partner --target 13264037 --name "Display Name" --slug displayname --apply
```

## Attaching a friend code by hand

A parent says "I came from a friend's link and no credit shows" (the welcome page tells them to text
Karlin the friend code; the invite page shows it as "Friend code 4827 1937").

```
npm run s1:find -- --code "4827 1937"          # confirm whose code it is
npm run s1:attach-code -- --order kdh7b8ucgk --code 48271937
npm run s1:attach-code -- --order kdh7b8ucgk --code 48271937 --apply
```

It applies the same rules as an invite at checkout: the order must be paid, the code must be an
active family link (or an active partner link), it cannot be the order's own family, and the email
must not have an earlier paid order. It records a pending credit, queues the inviter's email,
and logs `referral.attached_by_hand` in the event log. Run it twice and nothing doubles. If an order
already has a credit on a different code, it refuses; ask Jamie. Then run the outbox so the email goes.

## Placement rule

A referral never decides which team a kid lands on (T1). If a family asks to be put on the same team
as their friend:

- Karlin confirms with both parents before doing anything.
- Never for a code that has the `burst` flag.
- Placement stays Karlin's call; credits and teams are separate.

## Deletion request checklist

A parent asks us to delete their family's data (T12, redteam-trust row 12). Take it step by step and
log it. Money first, data second.

1. Confirm the request comes from the email on file (`s1:find --email ...`). Note the family id.
2. If they also want their money back, do the refund first (section above) and wait until the order shows
   `refunded`. Do not scrub a family with a live payment still open.
3. Stop the link: `npm run s1:code -- void --code <their code> --apply`. Void any partner code that
   points at the family too (`s1:find` lists them).
4. Remove kid names but keep counts, in the Neon console, in one transaction, with the family id
   filled in. These are reviewed statements:
   ```sql
   begin;
   update s1_kids set first_name = 'removed', first_name_key = 'removed'
    where family_id = (select id from s1_families where public_id = '<family id>');
   update s1_guardians set first_name = null, phone = null
    where family_id = (select id from s1_families where public_id = '<family id>');
   update s1_orders set payer_first_name = null, payer_phone = null
    where family_id = (select id from s1_families where public_id = '<family id>');
   commit;
   ```
   Full erasure of the email address as well: ask Jamie first (we keep a consent record and the
   payment trail for accounting).
5. Klaviyo: open the parent's profile and delete it (or suppress it and clear the `kid_name` and
   `sibling_names` properties). Joiner profiles no longer carry another family's kid name.
6. Discord: search the ops channel for the order id and the family code and delete those posts.
7. Google Sheets or any other mirror (if one exists): delete the rows with that order id.
8. Stripe keeps its own payment records for accounting. Tell the parent that. If asked, edit the
   customer's name in the Dashboard.
9. Meta receives hashed identifiers through the Conversions API; there is nothing to delete from our side.
10. Log the request (replace the id, set `livemode` to `true` in production):
    ```sql
    insert into s1_events (source, type, subject, data, livemode)
    values ('ops', 'privacy.deletion_request', '<family id>',
            '{"by":"<your name>","done":"kids,guardian,code,klaviyo,discord"}'::jsonb, true);
    ```
11. Reply to the parent when done.

## Outbox and the sweep

**Outbox.** Everything that leaves the system (Klaviyo, Meta, Discord) is queued first and sent by the
outbox sender. If something did not arrive:

```
npm run s1:outbox                       # drain up to 20 pending rows
npm run s1:outbox -- --order=kdh7b8ucgk # only that order's rows
```

Statuses you will see: `pending`, `sent`, `failed` (it retries), `stale` (too old to send; Klaviyo
rows after 48 hours, Meta after 6 days; this is on purpose), `skipped_no_config` (that channel is not
set up yet).

**Sweep.** Parents who start checkout and leave leave a pending order behind. The sweep cleans them:
orders with no payment started after 1 hour, and orders whose payment was never completed after 24
hours (it also cancels the payment in Stripe). It never touches a payment that is processing or
paid.

```
npm run s1:sweep             # shows what it would do
npm run s1:sweep -- --apply
```

Run it once a day during the launch week, or whenever the numbers look off. It also blanks kid first
names and phone numbers for families that never paid (every order canceled or failed, the newest over
7 days old); the dry-run prints how many it would touch.

## Reading the logs

Netlify function logs carry one line per step. They have no email, name or IP, only an order id and a
short code:

```
s1 step=fulfil.claim order=kdh7b8ucgk ok=true
s1 step=webhook.payment_failed order=kdh7b8ucgk ok=false err=card_declined
```

Search the log for `ok=false` first, or for an order id. Steps you will meet: `commit.*` (checkout
start), `fulfil.*` (turning a payment into a committed family), `webhook.*` (Stripe's messages),
`webhook.signature` or `webhook.config` (setup problems: check the webhook secret and the endpoint's
events), `fulfil.orphan` (a payment with no order; there is also an alert), `webhook.card_testing`
(a card-testing pattern was stopped).

## Flags you may see

| Flag | Meaning | What to do |
|---|---|---|
| `refund_unattributed` | A partial refund came from the Dashboard with no kid named | Ask Jamie to fix the kid status; use the script next time |
| `refund_failed` | Stripe could not complete a refund | Check Stripe, retry the script |
| `card_testing_suspect` | Three failed payments on one checkout; the payment was canceled | Look at the family; usually nothing |
| `pi_mismatch` | Stripe amount or order did not match the order | Stop; ask Jamie before touching it |
| `late_confirm` | Paid after the window closed | Karlin decides |
| `paid_after_cancel` | Paid after the sweep or a retry had canceled the order | Fine; the family is committed |
| `duplicate_kid` | The same first name was committed twice in a family | Ask the parent |
| `global_ceiling` (ops alert) | More than 1000 checkouts started in one hour; new ones get "try again later" until the hour ends | Look for a bot run in Stripe and the logs; one alert per hour at most |
| `shared_card`, `same_zip`, `burst` | Friend-credit checks. They flag, never block | Look before the credit is used |

## Hand-run SQL

Do not edit the production database by hand when a command above exists. If you must run SQL, use a
read-only Neon role (SELECT on the `s1_*` tables), and for writes always wrap in `begin; ... commit;`
with a `where` on a family or order id. An `update` without a `where` is the mistake to avoid.

## Launch order

Do these in this order (redteam-ops rows 5, 6, 7, 10, 11, 12). Tick as you go.

- [ ] 1. Note the Neon point-in-time-restore point (write the time down).
- [ ] 2. Run the migrations against production: `node --env-file=.env.local scripts/s1-migrate.mjs --live`, and check `s1_migrations` lists 0001 to 0004.
- [ ] 3. Scope production `DATABASE_URL`, the live Stripe keys, the live webhook secret and `S1_COMMIT_MODE` to the **Production** context only. Previews and branch deploys keep the test values.
- [ ] 3a. Set `S1_REF_SECRET` (Production only) to a new random value (for example `openssl rand -base64 32`). With a live Stripe key it is required: invite cookies and the rate-limit email hashes refuse the webhook-secret fallback, so without it invites are ignored, `/crew/<code>` sets no cookie and checkout answers "try again" (security review L4, L10).
- [ ] 4. Deploy with `S1_COMMIT_MODE` unset (it resolves to off).
- [ ] 5. In the Stripe Dashboard, create the live webhook endpoint for `/api/season1/stripe-webhook` with the Season 01 events from the spec (payment succeeded, payment failed, charge refunded, refund failed, dispute created, dispute closed). Put its signing secret in `S1_STRIPE_WEBHOOK_SECRET` (Production only). Confirm the legacy endpoint is unchanged.
- [ ] 6. Turn on Stripe email notifications for successful payments and refunds, for Jamie and Karlin.
- [ ] 7. Turn on Radar card-testing rules.
- [ ] 8. Set `S1_DISCORD_WEBHOOK_URL` if the ops channel is ready. Before pointing the sender at a database that holds test rows, mark them stale: `npm run s1:outbox -- --mark-stale-test`.
- [ ] 9. Neon: turn off scale-to-zero (or keep a one-minute ping) for the launch window, and check the Neon region matches the Netlify functions region.
- [ ] 10. Reset the production Neon role password as a precaution, after the first live check works.
- [ ] 11. Set `S1_COMMIT_MODE=live` and redeploy.
- [ ] 12. **Canary:** Jamie pays $100 live, then refunds it with `npm run s1:refund -- --live --order <id> --apply`. Check `s1_events` has both a payment and a refund event with source `webhook`, and that the welcome page, the Klaviyo email and the Discord post all appeared.
- [ ] 13. Send the lead blast in 2 or 3 batches about 30 minutes apart, not all at once.
- [ ] 14. Run `npm run s1:find` and `npm run s1:sweep` the next morning.

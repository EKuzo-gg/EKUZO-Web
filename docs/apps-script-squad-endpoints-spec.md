# Apps Script — Squad Link Endpoints Spec

This is the Apps Script side of the squad_link build (see
`docs/squad-link-build-brief.md`). Jamie pastes these changes into the
existing Apps Script web app and redeploys — Claude does NOT deploy.

After editing the script: **Deploy → Manage deployments → pencil icon on
the active deployment → New version → Deploy**. The web app URL stays the
same, so `GOOGLE_SHEETS_WEBHOOK_URL` in Netlify does not need to change.

---

## 1. New sheet tabs

Create two new tabs in the same spreadsheet the webhook already writes to.
Header rows must match exactly — the webhook appends rows by position.

### Tab: `squads`

| squad_token | product | owner_parent_email | owner_gamer_name | week | slot | week_dates | cohort_month | cohort_label | cohort_start | cohort_end | created_at |
|---|---|---|---|---|---|---|---|---|---|---|---|

One row per squad-owning registration. `product` is the discriminator
column added 2026-05-25 when e100 joined the squad system. Camps rows
populate `week` / `slot` / `week_dates` and leave the `cohort_*` cells
empty. E100 rows do the inverse — populate `cohort_month` / `cohort_label`
/ `cohort_start` / `cohort_end` and leave the camps cells empty. Legacy
rows (pre-2026-05-25) have a blank `product` cell; the `doGet` endpoint
treats absent `product` as `"camps"`.

### Tab: `squad_members`

| squad_token | product | member_parent_email | member_gamer_name | member_week | member_slot | member_cohort_month | member_cohort_label | joined_at |
|---|---|---|---|---|---|---|---|---|

One row per gamer when a family registers via someone else's crew link.
A 3-gamer family joining one crew writes 3 rows with the same
`squad_token`. Same product-discriminator pattern as `squads`: camps rows
fill the `member_week` / `member_slot` cells, e100 rows fill the
`member_cohort_*` cells. The cohort is registration-level for e100, but
we still stamp each member row so a single-tab FILTER by token surfaces
the schedule without joining back to `squads`.

---

## 2. `doPost` — header-mapped append (applies to ALL tabs)

The existing webhook POSTs look like `{ rows: [...] }` and get appended to
the default registrations sheet. Squad writes add a `tab` field so the
script knows which sheet to target.

**IMPORTANT — this replaces the existing positional append.** The current
Apps Script appends rows to `ekuzo-purchases` by position (either via
`Object.values(row)` or a hardcoded column array). That causes silent
column-shift bugs whenever the JS object key order in the webhook drifts
from the sheet's header row order. Symptom: a value like "Week 02" lands
in the `gender` column, or a field appears empty with everything after
it shifted left one column. See Jamie's April 13 WORKLOG entry and the
gender-column report on 2026-04-15 — those are both this bug.

**The fix: map by header NAME, not by position, for every tab.** This
makes the write resilient to column order drift on either side.

Replace `doPost` with:

```javascript
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var tab = payload.tab || ""; // "" → default registrations sheet
    var rows = payload.rows || [];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName;

    if (tab === "squads") {
      sheetName = "squads";
    } else if (tab === "squad_members") {
      sheetName = "squad_members";
    } else {
      // Default registrations sheet — match whatever name your existing
      // sheet uses (commonly "ekuzo-purchases"). Change the string below
      // if your tab is named differently.
      sheetName = "ekuzo-purchases";
    }

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "sheet_not_found", sheet: sheetName })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Read the sheet's header row once, then append each row in header
    // order by looking up each field NAME in the incoming row object.
    // This is the ONLY safe way to append rows — positional appends
    // silently corrupt data whenever columns drift out of sync.
    //
    // Rules:
    //   - If the row object has a key matching a header, write its value.
    //   - If the row object has no matching key, write "" (blank cell).
    //   - If the row object has EXTRA keys not in the sheet, drop them
    //     silently (log once at the end for visibility).
    var headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map(function (h) { return String(h).trim(); });

    var droppedKeys = {};
    rows.forEach(function (row) {
      var line = headers.map(function (h) {
        return row[h] !== undefined && row[h] !== null ? row[h] : "";
      });
      sheet.appendRow(line);
      // Track any row keys that didn't map to a header, for debugging.
      Object.keys(row).forEach(function (k) {
        if (headers.indexOf(k) === -1) droppedKeys[k] = true;
      });
    });

    var dropped = Object.keys(droppedKeys);
    if (dropped.length > 0) {
      Logger.log("doPost: dropped unknown keys on " + sheetName + ": " + dropped.join(", "));
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        ok: true,
        written: rows.length,
        tab: sheetName,
        droppedKeys: dropped,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Canonical header row for the `ekuzo-purchases` tab

The webhook sends **these 29 keys** (28 original + `preferred_days` added 2026-05-25), for every row. The
sheet's header row (row 1) should contain exactly these names — spelling,
underscores, and casing matter. Order doesn't matter with the
header-mapped append, but using this order keeps the sheet readable.

```
registration_id
family_id
product
parent_first_name
parent_last_name
parent_email
parent_phone
gamer_name
gamer_tag
week
slot
week_dates
birthday
gender
gaming_experience
tshirt_size
time_preference
first_semester
preferred_games
timezone
location
amount_paid
stripe_pi_id
registration_date
additional_info
squad_status
squad_token
joining_squad_token
preferred_days
```

**`squad_token` / `joining_squad_token` on the main tab** — added so ops
has a single-tab view of crew membership. For a Building-a-squad
registration, every gamer row in the registration carries the same
`squad_token`. For a family joining someone else's crew, every gamer row
carries the same `joining_squad_token`. Blank for Looking purchases and
for ekuzo100/teams. To find everyone in a given crew in one filter:

```
=FILTER('ekuzo-purchases'!A:AB,
  ('ekuzo-purchases'!squad_token_col = "abc123") +
  ('ekuzo-purchases'!joining_squad_token_col = "abc123"))
```

The normalized `squads` + `squad_members` tabs still exist as the
lookup-optimized store that `doGet` hits for the squad-link landing
page.

**To align the existing sheet:** open `ekuzo-purchases`, and make sure
row 1 contains exactly these 28 names. Add missing columns (`product`,
`gender`, `gaming_experience`, `time_preference`, `first_semester`,
`additional_info`, `squad_status`) — you can insert them anywhere; the
name-mapped append will fill them correctly. Rename `skill_level` →
`gaming_experience` if it's still the old name (or leave `skill_level`
and we'll update the webhook to match — see below).

**Alternative: keep the sheet name `skill_level` and update the
webhook.** If you prefer not to rename the column, we can change the
webhook's `gaming_experience:` key back to `skill_level:`. Pick one —
but once you do, don't let them drift apart again.

### Backfilling historical rows

Historical rows that were written under the positional append will have
data in the wrong columns. Options:

1. **Leave them as historical noise** — ops knows they're corrupt, new
   rows will be correct from the Apps Script update forward.
2. **Manual cleanup** — identify affected rows by `registration_date`
   being pre-deploy and manually shift the values.
3. **Write a one-shot fix script** — read each affected row, re-parse
   from Stripe metadata (via `stripe.paymentIntents.retrieve`), rewrite
   the row with the correct column mapping. Most thorough but most work.

Recommendation: option 1 unless you actually need to run ops reports
against the historical rows.

---

## 3. `doGet` — `?action=squad&token=X`

Handler for looking up a crew owner. The register pages and
`/squad/[token]` page both hit this via Next.js server code.

Extended 2026-05-25 to return e100 shape (`product`, `cohort_month`,
`cohort_label`) alongside the camps shape. Camps lookups stay
backward-compatible — legacy rows without a `product` cell default to
`"camps"`. The Next.js side (`lib/squad.ts`) reads `data.product` to
decide which shape it got and renders the matching pre-pin banner.

Returns `{ product, owner_gamer_name, week_label, slot, week_dates,
cohort_month, cohort_label }` JSON on hit (load-bearing fields vary by
product; the rest are empty strings). Returns `{ error: "not_found" }`
on miss. Apps Script can't set HTTP status codes for web apps, so the
Next.js side treats any response with `error` or a missing
`owner_gamer_name` as "not found."

```javascript
function doGet(e) {
  try {
    var action = (e.parameter && e.parameter.action) || "";

    if (action === "squad") {
      var token = e.parameter.token || "";
      if (!token) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: "missing_token" })
        ).setMimeType(ContentService.MimeType.JSON);
      }

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("squads");
      if (!sheet) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: "no_squads_sheet" })
        ).setMimeType(ContentService.MimeType.JSON);
      }

      var data = sheet.getDataRange().getValues();
      if (data.length < 2) {
        return ContentService.createTextOutput(
          JSON.stringify({ error: "not_found" })
        ).setMimeType(ContentService.MimeType.JSON);
      }

      var headers = data[0];
      var tokenCol       = headers.indexOf("squad_token");
      var nameCol        = headers.indexOf("owner_gamer_name");
      var productCol     = headers.indexOf("product");
      // Camps fields:
      var weekCol        = headers.indexOf("week");
      var slotCol        = headers.indexOf("slot");
      var datesCol       = headers.indexOf("week_dates");
      // E100 fields:
      var cohortMonthCol = headers.indexOf("cohort_month");
      var cohortLabelCol = headers.indexOf("cohort_label");

      for (var i = 1; i < data.length; i++) {
        if (String(data[i][tokenCol]) === token) {
          // Defaults to "camps" for legacy rows that pre-date the
          // product column (so existing camps squads keep working).
          var product = productCol >= 0
            ? (String(data[i][productCol] || "").trim() || "camps")
            : "camps";

          return ContentService.createTextOutput(
            JSON.stringify({
              product: product,
              owner_gamer_name: String(data[i][nameCol] || ""),
              // Camps fields (empty for e100 rows):
              week_label: weekCol >= 0 ? String(data[i][weekCol] || "") : "",
              slot:       slotCol >= 0 ? String(data[i][slotCol] || "") : "",
              week_dates: datesCol >= 0 ? String(data[i][datesCol] || "") : "",
              // E100 fields (empty for camps rows):
              cohort_month: cohortMonthCol >= 0 ? String(data[i][cohortMonthCol] || "") : "",
              cohort_label: cohortLabelCol >= 0 ? String(data[i][cohortLabelCol] || "") : "",
            })
          ).setMimeType(ContentService.MimeType.JSON);
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ error: "not_found" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Fall through / default response
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

**PII check:** this endpoint is public (anyone can call any token). We
only return `owner_gamer_name` (first name), week label, slot, and dates.
We do NOT return `owner_parent_email` or any other PII. Keep it that way.

---

## 4. Follow-ups / known gaps

- **Late-May manual test for `hasWeekPassed`.** No automated test harness
  exists in the repo. On or after **2026-05-25** (the day after Week 01
  ends), manually create a test `squads` row with `week_dates = "May 18 -
  22"` and hit `/squad/{token}`. Expected: state 2 — "this crew's camp
  week has already happened." Put this on the calendar now; it's the
  only way to validate the date-parse logic in `lib/squad.ts` against
  real time-of-day behavior before relying on it at scale.
- **Generalizing to ekuzo100 + teams.** ✅ DONE for ekuzo100 (2026-05-25).
  `squads` and `squad_members` now carry a `product` discriminator
  column plus product-specific cohort/week columns; `doGet` returns the
  matching shape based on the row's `product` value. Teams will follow
  the same pattern when it ships — add a `teams` value to `product` and
  whatever the Teams cohort shape is (likely `semester_label`).

## 5. Deploy checklist

1. Paste the updated `doPost` and new `doGet` into the script editor.
2. Create the `squads` and `squad_members` tabs with the header rows
   above — header names must match exactly (spelling, underscores).
3. Save the script.
4. **Deploy → Manage deployments → pencil icon on the active deployment
   → New version → enter a description → Deploy.**
5. The web app URL is unchanged. No Netlify env var edit needed.
6. Smoke test:
   - `curl "$URL?action=squad&token=nonexistent"` → `{ "error": "not_found" }`
   - Manually add a fake row to `squads` and call the endpoint with that
     token → should return the 4 fields.

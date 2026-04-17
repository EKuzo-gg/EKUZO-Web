/**
 * Apps Script backup — pre-squad_link deploy
 * Captured: 2026-04-15
 *
 * This is the Google Apps Script that was active on the spreadsheet
 * bound to GOOGLE_SHEETS_WEBHOOK_URL immediately BEFORE the squad_link
 * Apps Script update (doPost header-mapping + new doGet for ?action=squad).
 *
 * Roll-back procedure if the new script breaks:
 *   1. Open the Apps Script editor (Extensions → Apps Script from the sheet).
 *   2. Select all in Code.gs, delete.
 *   3. Paste the contents of this file (everything below the closing */ ).
 *   4. Deploy → Manage deployments → pencil → New version → Deploy.
 *
 * Known issues with this version (why we replaced it):
 *   - Uses getActiveSheet() — writes to whichever tab happens to be first.
 *     Would silently corrupt main tab if squad tabs existed.
 *   - Writes 20 hardcoded positional columns, but the webhook now sends 26
 *     keys. Missing: product, gender, gaming_experience, time_preference,
 *     first_semester, additional_info, squad_status.
 *   - Uses row.skill_level (undefined — webhook sends gaming_experience),
 *     so that position writes blank every time.
 *   - Silent column-shift when sheet headers and JS key order diverge.
 *     Documented symptom: gender column empty, everything right of it
 *     shifted one column left.
 *
 * See docs/apps-script-squad-endpoints-spec.md for the replacement.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  data.rows.forEach(function(row) {
    sheet.appendRow([
      row.registration_id,
      row.family_id,
      row.parent_first_name,
      row.parent_last_name,
      row.parent_email,
      row.parent_phone,
      row.gamer_name,
      row.gamer_tag,
      row.week,
      row.slot,
      row.week_dates,
      row.birthday,
      row.skill_level,
      row.tshirt_size,
      row.preferred_games,
      row.timezone,
      row.location,
      row.amount_paid,
      row.stripe_pi_id,
      row.registration_date
    ]);
  });

  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", rows: data.rows.length })
  ).setMimeType(ContentService.MimeType.JSON);
}

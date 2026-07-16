/**
 * EKUZO — New Registration Notifier
 * ---------------------------------
 * Emails karlin@ekuzo.gg whenever new rows land on the first tab of the
 * orchestration sheet (1H7Unx0zMpaeSAXRMlnJDLNWXeZoX4k7iV_T92tREoNA),
 * skipping rows where the parent name, gamer name, or email contains "test".
 *
 * INSTALL (standalone script — does NOT touch the existing doPost web app):
 *   1. Open the orchestration sheet → Extensions → Apps Script.
 *   2. Add a new script file (e.g. "notifier.gs"), paste this whole file.
 *   3. Run `initNotifier` once (authorize when prompted). This baselines the
 *      current last row so existing rows never trigger emails, and installs
 *      the 5-minute trigger.
 *   4. Done. To verify wiring without waiting, run `sendTestEmail`.
 *
 * Detection is polling-based (time trigger), so it works for rows added by
 * the Stripe webhook's web app, manual edits, or the Sheets API alike.
 */

var NOTIFY_EMAIL = "karlin@ekuzo.gg";
var PROP_KEY = "LAST_NOTIFIED_ROW";
var HEADER_ROWS = 1;

// Column indexes (1-based) on the first tab — matches the ekuzo-purchases shape.
var COL = {
  PARENT_FIRST: 3,   // parent_first_name
  PARENT_LAST: 4,    // parent_last_name
  PARENT_EMAIL: 5,   // parent_email
  PARENT_PHONE: 6,   // parent_phone
  GAMER_NAME: 7,     // gamer_name
  WEEK: 10,          // week / cohort
  SLOT: 11,          // slot
  WEEK_DATES: 12,    // week_dates
  AMOUNT: 19,        // amount_paid
  REG_DATE: 21,      // registration_date
  PRODUCT: 22        // product
};

/** Run once to baseline the sheet and install the 5-minute trigger. */
function initNotifier() {
  var sheet = getWatchedSheet_();
  PropertiesService.getScriptProperties().setProperty(
    PROP_KEY,
    String(sheet.getLastRow())
  );

  // Remove any existing triggers for this handler, then install fresh.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "checkForNewRegistrations") {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("checkForNewRegistrations")
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log(
    "Notifier initialized. Baseline row: " + sheet.getLastRow() +
    ". Trigger installed (every 5 min)."
  );
}

/** Trigger handler — runs every 5 minutes. */
function checkForNewRegistrations() {
  // Lock so overlapping runs can't double-send.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) return;

  try {
    var sheet = getWatchedSheet_();
    var props = PropertiesService.getScriptProperties();
    var lastNotified = parseInt(props.getProperty(PROP_KEY), 10);

    // Safety: if the property is missing, baseline instead of blasting history.
    if (isNaN(lastNotified)) {
      props.setProperty(PROP_KEY, String(sheet.getLastRow()));
      return;
    }

    var lastRow = sheet.getLastRow();
    if (lastRow <= lastNotified) return;

    var numNew = lastRow - lastNotified;
    var values = sheet
      .getRange(lastNotified + 1, 1, numNew, sheet.getLastColumn())
      .getValues();

    var newRegs = values.filter(function (row) {
      return !isTestRow_(row) && !isEmptyRow_(row);
    });

    if (newRegs.length > 0) {
      sendNotification_(newRegs, sheet);
    }

    // Advance the pointer past everything we scanned (test rows included,
    // so they're never re-scanned).
    props.setProperty(PROP_KEY, String(lastRow));
  } finally {
    lock.releaseLock();
  }
}

/** True if parent name, gamer name, or email contains "test" (case-insensitive). */
function isTestRow_(row) {
  var haystack = [
    row[COL.PARENT_FIRST - 1],
    row[COL.PARENT_LAST - 1],
    row[COL.PARENT_EMAIL - 1],
    row[COL.GAMER_NAME - 1]
  ]
    .join(" ")
    .toLowerCase();
  return haystack.indexOf("test") !== -1;
}

function isEmptyRow_(row) {
  return row.join("").trim() === "";
}

function sendNotification_(rows, sheet) {
  var sheetUrl = sheet.getParent().getUrl();
  var count = rows.length;
  var subject =
    "🎮 New EKUZO registration" + (count > 1 ? "s (" + count + ")" : "") +
    ": " + rows.map(function (r) { return gamerLabel_(r); }).join(", ");

  var blocks = rows.map(function (r) {
    return [
      "Gamer:      " + gamerLabel_(r),
      "Parent:     " + (r[COL.PARENT_FIRST - 1] + " " + r[COL.PARENT_LAST - 1]).trim(),
      "Email:      " + r[COL.PARENT_EMAIL - 1],
      "Phone:      " + r[COL.PARENT_PHONE - 1],
      "Product:    " + r[COL.PRODUCT - 1],
      "Week/slot:  " + [r[COL.WEEK - 1], r[COL.SLOT - 1], r[COL.WEEK_DATES - 1]]
        .filter(String).join(" · "),
      "Paid:       " + r[COL.AMOUNT - 1],
      "Registered: " + r[COL.REG_DATE - 1]
    ].join("\n");
  });

  var body =
    count + " new registration" + (count > 1 ? "s" : "") +
    " just landed on the orchestration sheet:\n\n" +
    blocks.join("\n\n---\n\n") +
    "\n\nOpen the sheet: " + sheetUrl + "\n";

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function gamerLabel_(row) {
  var gamer = String(row[COL.GAMER_NAME - 1] || "").trim();
  if (gamer) return gamer;
  var parent = (row[COL.PARENT_FIRST - 1] + " " + row[COL.PARENT_LAST - 1]).trim();
  return parent || "Unknown";
}

function getWatchedSheet_() {
  // First tab (gid=0) of the container spreadsheet.
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

/** Optional: run manually to confirm email delivery works. */
function sendTestEmail() {
  MailApp.sendEmail(
    NOTIFY_EMAIL,
    "EKUZO notifier — test",
    "If you're reading this, the registration notifier can reach you. " +
    "Real alerts will arrive within ~5 minutes of a new signup."
  );
}

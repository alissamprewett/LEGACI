/**
 * Legaci Usage Log — Apps Script Web App backend.
 *
 * SETUP:
 * 1. Go to sheets.google.com, create a new blank spreadsheet, name it "Legaci Usage Log".
 * 2. In the Sheet: Extensions -> Apps Script.
 * 3. Delete anything in the default Code.gs, paste this whole file in, save.
 * 4. Deploy -> New deployment -> gear icon next to "Select type" -> Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 *    Click Deploy. Authorize when prompted (first-time consent for the script
 *    to write to this Sheet).
 * 5. Copy the deployment URL (ends in /exec) — that's LEGACI_ANALYTICS_ENDPOINT
 *    in analytics-snippet.js and in each tool's HTML.
 *
 * NOTE ON ACCESS: "Anyone" access means the endpoint has no auth — this is a
 * write-only event log (it appends rows, it never returns Sheet contents to
 * the caller), so the realistic risk is someone spamming junk rows into the
 * Sheet, not a data leak. If that becomes a real problem, add a simple shared
 * secret check (see the commented-out block below) and update the client
 * snippet to send it.
 *
 * v1.1 CHANGES:
 * - Every day gets its own tab (e.g. "Events_2026-08-19"), created automatically
 *   the first time an event comes in that day, and placed as the leftmost tab —
 *   applies going forward only; the original all-in-one "Events" tab from before
 *   this change is left exactly as it was, as a historical record. If you want
 *   that older data split retroactively into daily tabs too, that's a separate,
 *   one-time migration script, not something this file does automatically.
 * - New rows land at the top (row 2, right under the header) instead of the
 *   bottom, so the most recent activity is always visible without scrolling.
 *   The day-tab's date reflects the spreadsheet's own timezone setting (File ->
 *   Settings in the Sheet), not the visitor's browser, so the day boundary is
 *   consistent no matter who's using it or where from.
 */
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'bad json' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Optional shared-secret check — uncomment if "Anyone" access attracts spam.
  // if (data.key !== 'PASTE_A_SHARED_SECRET_HERE') {
  //   return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'unauthorized' }))
  //     .setMimeType(ContentService.MimeType.JSON);
  // }

  const tz = ss.getSpreadsheetTimeZone();
  const dayTabName = 'Events_' + Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  let sheet = ss.getSheetByName(dayTabName);
  if (!sheet) {
    sheet = ss.insertSheet(dayTabName, 0); // index 0 = leftmost tab, so today's is always easiest to find
    sheet.appendRow(['Timestamp', 'Tool', 'Event', 'Detail', 'Session']);
    sheet.setFrozenRows(1);
  }

  const row = [
    new Date(),
    String(data.tool || '').slice(0, 60),
    String(data.event || '').slice(0, 60),
    String(data.detail || '').slice(0, 300),
    String(data.session || '').slice(0, 60)
  ];

  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, row.length).setValues([row]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, note: 'POST only' }))
    .setMimeType(ContentService.MimeType.JSON);
}

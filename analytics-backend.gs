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
 */
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Events') || ss.insertSheet('Events');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Tool', 'Event', 'Detail', 'Session']);
  }

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

  sheet.appendRow([
    new Date(),
    String(data.tool || '').slice(0, 60),
    String(data.event || '').slice(0, 60),
    String(data.detail || '').slice(0, 300),
    String(data.session || '').slice(0, 60)
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, note: 'POST only' }))
    .setMimeType(ContentService.MimeType.JSON);
}

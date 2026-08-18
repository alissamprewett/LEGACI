/* =========================================================
   LEGACI ANALYTICS — structure/behavior only, never content.
   Logs things like "which flag type got dismissed" or "which export
   format was used" — never caption text, filenames, character names,
   or video/image content. See README's Analytics section.

   Paste your deployed Apps Script Web App URL below (ends in /exec).
   Leave it as-is (containing "PASTE_YOUR") to keep logging silently
   disabled — every tool works identically either way.
========================================================= */
const LEGACI_ANALYTICS_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
const LEGACI_SESSION_ID = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())+'-'+Math.random().toString(36).slice(2);

function logEvent(tool, event, detail){
  if(!LEGACI_ANALYTICS_ENDPOINT || LEGACI_ANALYTICS_ENDPOINT.indexOf('PASTE_YOUR')!==-1) return;
  const payload = JSON.stringify({ tool, event, detail: detail||'', session: LEGACI_SESSION_ID, ts: new Date().toISOString() });
  try{
    // sendBeacon survives the page navigating away right after (e.g. clicking a hub
    // tile) — a plain fetch() can get aborted mid-flight in that exact case.
    if(navigator.sendBeacon){
      navigator.sendBeacon(LEGACI_ANALYTICS_ENDPOINT, new Blob([payload], {type:'text/plain'}));
      return;
    }
    fetch(LEGACI_ANALYTICS_ENDPOINT, {
      method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body: payload
    }).catch(()=>{});
  }catch(e){}
}

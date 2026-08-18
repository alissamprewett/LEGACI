# Legaci

Caption QC, transcription, translation, audio description, format conversion, ad-breakpoint discovery, artwork prep, and cast-matched speaker ID — all client-side, no server, no upload.

## Deploying to GitHub Pages

1. Create a new repository (private or public — see note below) and upload every `.html` file in this folder to the **root** of the repo (not a subfolder). `index.html` must be at the root for GitHub Pages to serve it as the homepage.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment," set **Source** to "Deploy from a branch."
4. Set **Branch** to `main` (or whichever branch has the files) and folder to `/ (root)`.
5. Click **Save**. GitHub will give you a URL — something like `https://yourusername.github.io/repo-name/` — usually live within a minute or two.
6. Bookmark that URL. Every tool works from it exactly the way it does locally: nothing is uploaded, caption/video files never leave the browser, AI-model tools still reach out to their own CDN (Hugging Face, face-api.js's model host) the same way they always have.

### Public vs. private

- A **public** repo means anyone with the URL can open the tools. Nothing sensitive lives in the code itself — no show content, no credentials — but the tooling/approach itself would be visible to anyone who finds it.
- A **private** repo requires GitHub Pro, Team, or Enterprise to serve Pages privately (GitHub Enterprise orgs, which Paramount/Pluto likely already has, support this natively). If you're on an Enterprise org, use that — it's the closer match to how this has been treated so far (internal tooling, not public).

### Updating later

Every time you want to push a change, replace the files in the repo (via the GitHub web UI, or `git push` if you're comfortable with git) and Pages redeploys automatically within a minute or two. Everyone using the bookmarked URL gets the new version immediately — no more re-downloading a zip and re-running a local server.

## Analytics (optional)

Every tool has a small, self-contained analytics snippet built in, disabled by default. It logs **structure and behavior only — never content**: which flag types get dismissed, which export format got used, which analyzer ran — never caption text, filenames, character names, or video/image content.

### Setting it up

1. Create a new Google Sheet, name it "Legaci Usage Log."
2. Extensions → Apps Script. Paste in `analytics-backend.gs` (included in this folder), save.
3. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone. Deploy, authorize when prompted.
4. Copy the deployment URL (ends in `/exec`).
5. In every `.html` file, find the line `const LEGACI_ANALYTICS_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';` and replace the placeholder with your URL.

Until you do step 5, logging stays silently disabled — every tool works identically either way.

### A note on "Anyone" access

The endpoint has no authentication, which is fine here because it's write-only (it appends a row; it never returns Sheet contents to whoever calls it). The realistic risk is someone spamming junk rows into the Sheet, not a data leak. If that happens, there's a commented-out shared-secret check at the top of `analytics-backend.gs` you can enable.

### What actually gets sent

Each event is one row: a timestamp, which tool, an event name (e.g. `flag_validated`, `export`, `run_analysis`), a short detail string (e.g. an issue-type code, or a format name), and a random per-page-load session ID (not tied to any account or person). Full event list is in each file's own JS, searchable for `logEvent(`.

## Files

| File | Purpose |
|---|---|
| `index.html` | Hub — links to everything below |
| `legaci.html` | Analyze — the core caption QC tool |
| `transcribe.html` | Transcribe — draft captions from audio |
| `translate.html` | Translate — ES/FR/IT/DE |
| `audio-description.html` | Audio Description — gap-finding + draft scene descriptions |
| `convert.html` | Convert — VTT ⇄ SRT ⇄ SCC |
| `markups.html` | Markups — ad-breakpoint discovery |
| `artwork.html` | Artwork — batch resize/crop/compress |
| `roster.html` | Roster — cast-matched speaker ID |
| `analytics-backend.gs` | Paste into Google Apps Script — the receiving endpoint |


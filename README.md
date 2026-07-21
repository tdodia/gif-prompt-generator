# GifForThat — Corporate Edition

Type a work scenario or mood, get matching GIFs plus an AI-generated "corporate translator" caption. Static `index.html` + one Vercel serverless function (`api/caption.js`) for the AI caption — everything else (GIF search) still runs client-side with a built-in GIPHY key.

## How the two API keys are handled differently, and why

- **GIPHY key**: baked directly into `index.html` (the `API_KEY` constant). This is fine — worst case if someone extracts it from view-source is hitting GIPHY's free rate limit.
- **Anthropic key**: never goes in any file. It's set as an environment variable in Vercel's dashboard and only read server-side by `api/caption.js`. If it were embedded client-side like the GIPHY key, anyone viewing page source could run up real charges on your account — so this one has to stay server-only.

If the AI caption call ever fails (bad key, rate limit, network issue), the app automatically falls back to a local, rule-based caption generator built into `index.html` — so the feature degrades instead of breaking.

## Run locally

Don't just double-click `index.html` — opening it via `file://` makes the browser send a `null` origin, which GIPHY's API rejects. Also, the `/api/caption` serverless function only runs in Vercel's environment, not with a plain static server, so for local testing you have two options:

**Quick UI check (GIFs work, AI captions fall back to the local generator):**
```
python3 -m http.server 8000
```
Then open `http://localhost:8000/`.

**Full local test including the AI caption (needs the Vercel CLI):**
```
npm install -g vercel
vercel dev
```
This pulls your environment variables and runs the serverless function locally too.

## Deploy

### Push to GitHub

```
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

(Create the empty repo on github.com first, then run the commands above from this folder — make sure `api/caption.js` stays inside an `api/` folder, that's what tells Vercel it's a serverless function.)

### Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you just pushed.
2. Framework preset: **Other** (no build command, no output directory needed).
3. Click **Deploy**.

### Set the Anthropic API key

1. In your Vercel project, go to **Settings → Environment Variables**.
2. Add a new variable: name it `ANTHROPIC_API_KEY`, paste your key as the value.
3. Save, then go to **Deployments** and redeploy (env var changes need a redeploy to take effect).

Every push to `main` after that auto-deploys, using the same env var automatically.

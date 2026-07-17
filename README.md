# GIF Prompt Generator

Type a scenario or mood, get matching GIFs. Single static `index.html`, no build step, no backend. Ships with GIPHY's public demo API key so it works with zero signup — testers can use it immediately. A "use your own key" option is built into the settings toggle if the shared key gets rate-limited.

## Run locally

Don't just double-click `index.html` — opening it via `file://` makes the browser send a `null` origin, which GIPHY's API rejects (shows up as "Failed to fetch"). Serve it instead:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Deploy

### Push to GitHub

```
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

(Create the empty repo on github.com first, then run the commands above from this folder.)

### Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo you just pushed.
2. Framework preset: **Other** (it's a static site — no build command, no output directory needed).
3. Click **Deploy**. Vercel serves `index.html` at the root automatically.

Every push to `main` after that auto-deploys.

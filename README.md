# Meteora DLMM Web App (Parity First) — Bootstrap

This repo hosts a minimal static homepage and a Vercel Serverless Function so you can confirm your Vercel wiring before building the real app.

## Files
- `index.html` — placeholder homepage with a link to `/api/ping`
- `api/ping.js` — serverless function returning `{ status: "ok" }` and showing which env vars are set

## Deploy Steps (no CLI)
1. Upload these files to your GitHub repo (root) via the web UI.
2. In Vercel, open the project and trigger a redeploy (or it will auto-deploy on push).
3. Visit the deployment URL and click **Check API: /api/ping**.
   - You should see JSON with `"status":"ok"`.
   - If `env.has_meteora_api_key` is `true` and `upstream_referer` shows a URL, your env vars are wired.

## Next
Once confirmed, we will:
- Add proxy routes under `/api/solscan/...` and `/api/meteora/...`.
- Build the two parity UI tabs with table + CSV export.

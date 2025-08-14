# Meteora DLMM Web App (Parity First) — Bootstrap + Proxy

This repo hosts:
- `index.html` — placeholder homepage
- `api/hello.js` — basic Node function (test)
- `api/proxy.js` — whitelisted proxy for Solscan & Meteora (and httpbin for testing)
- (optional) `api/ping.js` — Node function showing env vars presence

## Proxy usage
Call:
```
/api/proxy?url=<ENCODED_UPSTREAM_URL>
```
Allowed hosts (whitelist): `public-api.solscan.io`, `pro-api.solscan.io`, `api.solscan.io`, `solscan.io`, `meteora.ag`, `www.meteora.ag`, `api.meteora.ag`, and `httpbin.org` for testing.

The proxy injects:
- `x-api-key` (from `METEORA_API_KEY`) and
- `referer` (from `UPSTREAM_REFERER`)
**only** when the URL host includes `meteora`.

It also applies a simple rate-limit (`RATE_LIMIT_RPS`, default 5 req/s per serverless instance).

## Next
- Add UI tabs (PositionPnL, WalletPoolPnL)
- Replace direct upstream calls with `/api/proxy?url=...`
- Implement CSV export on the client

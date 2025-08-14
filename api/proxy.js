// Whitelisted proxy for Solscan + Meteora (and httpbin for testing)
const ALLOWED_HOSTS = new Set([
  "public-api.solscan.io",
  "pro-api.solscan.io",
  "api.solscan.io",
  "solscan.io",
  "meteora.ag",
  "www.meteora.ag",
  "api.meteora.ag",
  "httpbin.org" // for quick GET testing
]);

const RATE_LIMIT_RPS = parseInt(process.env.RATE_LIMIT_RPS || "5", 10);
// Simple per-instance token bucket
let tokens = RATE_LIMIT_RPS;
let lastRefill = Date.now();
function refillTokens() {
  const now = Date.now();
  const elapsed = (now - lastRefill) / 1000;
  const add = Math.floor(elapsed * RATE_LIMIT_RPS);
  if (add > 0) {
    tokens = Math.min(RATE_LIMIT_RPS, tokens + add);
    lastRefill = now;
  }
}
async function takeToken() {
  while (true) {
    refillTokens();
    if (tokens > 0) { tokens--; return; }
    await new Promise(r => setTimeout(r, 100)); // wait 100ms
  }
}

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      res.status(400).json({ error: "Missing 'url' query parameter" });
      return;
    }
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      res.status(400).json({ error: "Invalid URL" });
      return;
    }
    if (!ALLOWED_HOSTS.has(parsed.host)) {
      res.status(400).json({ error: `Host not allowed: ${parsed.host}` });
      return;
    }

    await takeToken();

    // Prepare headers
    const upstreamHeaders = {
      "user-agent": "meteora-webapp-proxy/1.0",
      // copy content-type for POST/PUT if provided
      ...(req.headers["content-type"] ? { "content-type": req.headers["content-type"] } : {}),
    };

    // Inject Meteora headers if calling their hosts
    const isMeteora = parsed.host.includes("meteora");
    if (isMeteora) {
      if (process.env.METEORA_API_KEY) {
        upstreamHeaders["x-api-key"] = process.env.METEORA_API_KEY;
      }
      if (process.env.UPSTREAM_REFERER) {
        upstreamHeaders["referer"] = process.env.UPSTREAM_REFERER;
      }
    }

    const method = req.method || "GET";
    let body = undefined;
    if (method !== "GET" && method !== "HEAD") {
      body = req.body;
    }

    const upstreamResp = await fetch(url, {
      method,
      headers: upstreamHeaders,
      body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
      redirect: "follow",
    });

    // Forward status and headers (with safe CORS)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    // Try to stream JSON/text
    const contentType = upstreamResp.headers.get("content-type") || "";
    res.status(upstreamResp.status);
    if (contentType.includes("application/json")) {
      const data = await upstreamResp.json();
      res.json({ ok: upstreamResp.ok, status: upstreamResp.status, host: parsed.host, data });
    } else {
      const text = await upstreamResp.text();
      res.send(text);
    }
  } catch (err) {
    res.status(500).json({ error: "Proxy error", message: String(err) });
  }
}

export default function handler(req, res) {
  const now = new Date().toISOString();
  const payload = {
    status: "ok",
    time: now,
    region: process.env.VERCEL_REGION || null,
    env: {
      has_meteora_api_key: Boolean(process.env.METEORA_API_KEY) || false,
      upstream_referer: process.env.UPSTREAM_REFERER || null,
      rate_limit_rps: process.env.RATE_LIMIT_RPS || null
    }
  };
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).json(payload);
}

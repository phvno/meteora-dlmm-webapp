export const config = { runtime: "edge" };

export default async function handler(req) {
  const now = new Date().toISOString();
  const body = JSON.stringify({
    status: "ok-edge",
    time: now
  });
  return new Response(body, {
    headers: { "content-type": "application/json; charset=utf-8" },
    status: 200
  });
}

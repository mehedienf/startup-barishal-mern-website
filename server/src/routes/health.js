// `GET /api/health` — used by curl probes, uptime checks, and the
// cPanel reverse-proxy to verify the Node process is alive.

export function registerHealth(app) {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });
}

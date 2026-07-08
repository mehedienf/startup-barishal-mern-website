/**
 * API helpers for the public site.
 *
 * Why this exists:
 *   In production the client is served from `startupbarishal.olivosoft.com`
 *   while the Express API lives on `api.startupbarishal.olivosoft.com`.
 *   A bare `fetch("/api/...")` would hit the client host, which has no
 *   `/api` route and falls through to the SPA shell (returning the HTML
 *   `index.html` instead of JSON). So every fetch needs the absolute API
 *   origin baked in at build time.
 *
 *   In dev, `VITE_API_ORIGIN` is intentionally unset so the helper falls
 *   back to a relative path. The Vite dev server's `proxy` config then
 *   forwards `/api/*` and `/uploads/*` to `http://localhost:3000`, which
 *   is exactly the same shape as production — minus the cookie-domain
 *   bit, which only matters when two different hosts are involved.
 *
 * Usage:
 *   import { apiFetch, apiUrl, resolveAssetUrl } from "../lib/api.js";
 *   const res = await apiFetch("/api/stats");
 *   const res = await apiFetch("/api/contact", { method: "POST", body: ... });
 *   <img src={resolveAssetUrl(item.imageUrl)} />
 *
 *   The `apiFetch` wrapper sets `credentials: "include"` by default so any
 *   server-side cookies that may be set in future still ride along. None
 *   of the public-site endpoints rely on auth today, but it costs nothing
 *   to send and keeps the helper forward-compatible.
 */

// `import.meta.env` is statically replaced by Vite at build time. An
// undefined value here is fine — dev (and the helper) treat it as "use a
// relative path and let the Vite proxy handle it."
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "";

/**
 * Build an absolute API URL.
 *
 *   - Inputs starting with `http://` or `https://` pass through.
 *   - Inputs starting with `/` get the API origin prepended (when set).
 *   - Bare paths get a leading slash added before the prefix.
 *   - When API_ORIGIN is empty (dev), the path is returned as a relative
 *     URL so the Vite proxy can forward it.
 */
export function apiUrl(path) {
  if (!path) return path;
  // Already absolute or a client-side URL scheme — don't touch.
  if (/^(https?|blob|data):\/\//i.test(path)) return path;
  if (!API_ORIGIN) {
    // Dev path: keep it relative.
    return path.startsWith("/") ? path : `/${path}`;
  }
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
}

/**
 * Thin `fetch` wrapper that always sends to the API origin. Defaults
 * `credentials: "include"` so future server-set cookies still reach us.
 * The body, headers, and method from `init` are spread first so callers
 * can override any of those (including `credentials` if they need to).
 */
export function apiFetch(path, init = {}) {
  const { credentials = "include", ...rest } = init;
  return fetch(apiUrl(path), { credentials, ...rest });
}

/**
 * Resolve a server-relative asset URL (typically an `/uploads/...` path
 * coming back from the API as `imageUrl`, `coverImage`, `gallery[i]`, etc.)
 * to a fully-qualified URL the browser can actually load.
 *
 *   - Absolute URLs pass through.
 *   - Empty / nullish input returns an empty string (so React can render
 *     `<img src="">` without logging a noisy warning).
 *   - When API_ORIGIN is set, the path gets prefixed so the request hits
 *     the API host where the file is actually served.
 *   - In dev (no API_ORIGIN), returns the path unchanged so the Vite
 *     proxy can serve the upload.
 */
export function resolveAssetUrl(path) {
  if (!path) return "";
  // Already absolute OR a client-side URL scheme (blob:, data:) — pass through.
  // `blob:` URLs embed a full authority (e.g. `blob:https://host/uuid`) so we
  // match on the scheme prefix only, not on `://`.
  if (/^(https?|blob|data):/i.test(path)) return path;
  if (!API_ORIGIN) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
}

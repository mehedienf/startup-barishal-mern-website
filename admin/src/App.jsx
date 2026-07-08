import React, { useCallback, useEffect, useState } from "react";
import {
  Database,
  ExternalLink,
  ArrowLeft,
  ShieldCheck,
  Menu,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import { Outlet } from "react-router-dom";

/**
 * Auth gate.
 *
 * Mounts the login page until /api/auth/me confirms a valid session cookie,
 * then renders the full admin layout (sidebar + top bar + routed content).
 * Cross-origin fetches include credentials so the HTTP-only session cookie
 * round-trips between the admin (port 5174) and API (port 3000) origins.
 */
export default function App() {
  const [authState, setAuthState] = useState({
    status: "checking", // "checking" | "authed" | "unauthed"
    username: "",
  });

  // Controls the off-canvas sidebar drawer (mobile only). The sidebar is
  // permanently docked at `lg` and above, so this state only affects
  // viewports below that breakpoint.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setAuthState({ status: "authed", username: data?.username || "admin" });
        return;
      }
    } catch {
      // Network error: fall through to the unauthed state below.
    }
    setAuthState({ status: "unauthed", username: "" });
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleAuthenticated = useCallback((username) => {
    setAuthState({ status: "authed", username: username || "admin" });
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Even if the network call fails, we still flip the UI to the login
      // screen so the user can re-authenticate.
    }
    setAuthState({ status: "unauthed", username: "" });
  }, []);

  // Initial probe: show a neutral loading splash, not the login page, so a
  // refresh doesn't flash the sign-in form for a returning admin.
  if (authState.status === "checking") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b1f3a] text-white">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking session…
        </div>
      </div>
    );
  }

  if (authState.status === "unauthed") {
    return <Login onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Persistent sidebar / mobile drawer */}
      <Sidebar
        username={authState.username}
        onSignOut={handleSignOut}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Right side: top bar + routed content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        {/* Admin Top Bar */}
        <header className="sticky top-0 z-30 h-[72px] flex items-center bg-[#0b1f3a] text-white border-b border-white/10">
          <div className="px-4 md:px-8 flex justify-between items-center w-full gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger — only visible below `lg` */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
                className="lg:hidden p-2 -ml-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="p-2 bg-emerald-500/15 rounded-lg shrink-0">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none truncate">
                  Startup Barishal Admin
                </h1>
                <p className="text-[10px] sm:text-[11px] text-white/60 tracking-widest uppercase mt-0.5 truncate">
                  Database Control Console
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live
              </span>
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Public Site</span>
                <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline" />
              </a>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Re-export so other modules (e.g. Sidebar) can show a "session expired" hint
// when a guarded fetch returns 401 mid-session.
export { ShieldAlert };
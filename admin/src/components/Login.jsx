import React, { useEffect, useState } from "react";
import { Lock, User, LogIn, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * Admin sign-in page.
 *
 * Posts credentials to /api/auth/login (server sets the HTTP-only session
 * cookie). On success it calls onAuthenticated with the returned username so
 * the parent <App /> can flip into the gated layout.
 */
export default function Login({ onAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Focus the username field on mount for a faster sign-in.
  useEffect(() => {
    const el = document.getElementById("admin-login-username");
    if (el) el.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Sign-in failed. Please try again.");
        return;
      }
      onAuthenticated?.(data?.username || username.trim());
    } catch (err) {
      setError("Could not reach the server. Make sure it is running on port 3000.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0b1f3a] via-[#102b54] to-[#0b1f3a] px-4 py-10">
      {/* Subtle decorative watermark */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-orange/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-secondary-blue/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-orange/15 border border-primary-orange/30 mb-4">
            <Lock className="w-6 h-6 text-primary-orange" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Admin Sign-in
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Startup Barishal Control Console
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-7 shadow-2xl shadow-black/40"
          noValidate
        >
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label
            htmlFor="admin-login-username"
            className="text-[11px] font-bold text-white/60 uppercase tracking-widest"
          >
            Username
          </label>
          <div className="relative mt-1.5 mb-4">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              id="admin-login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={submitting}
              className="w-full bg-white/[0.06] border border-white/15 text-white placeholder-white/30 rounded-xl pl-9 pr-3 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all disabled:opacity-60"
            />
          </div>

          <label
            htmlFor="admin-login-password"
            className="text-[11px] font-bold text-white/60 uppercase tracking-widest"
          >
            Password
          </label>
          <div className="relative mt-1.5 mb-6">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              id="admin-login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
              className="w-full bg-white/[0.06] border border-white/15 text-white placeholder-white/30 rounded-xl pl-9 pr-10 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary-orange hover:bg-primary-orange/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold tracking-wide rounded-xl py-3 text-sm transition-all shadow-[0_8px_24px_rgba(255,107,0,0.35)] hover:shadow-[0_10px_28px_rgba(255,107,0,0.45)]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign in
              </>
            )}
          </button>

          <p className="text-[11px] text-white/40 mt-5 text-center leading-relaxed">
            Sign-in is restricted to authorized administrators. New credentials
            are seeded by the server on first launch — see the server startup
            log for the default username and password.
          </p>
        </form>
      </div>
    </div>
  );
}

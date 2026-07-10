import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  GraduationCap,
  Mail,
  MessageSquare,
  FileText,
  Handshake,
  UserPlus,
  ImageIcon,
  BarChart3,
  Rocket,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import logo from "../assets/startupbarishal-logo.png";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/team", label: "Team Members", icon: Users, resource: "teamMembers" },
  { to: "/events", label: "Events", icon: Calendar, resource: "events" },
  { to: "/programs", label: "Incubation Programs", icon: GraduationCap, resource: "incubationPrograms" },
  { to: "/contacts", label: "Contact Inquiries", icon: MessageSquare, resource: "contacts" },
  { to: "/applications", label: "Cohort Applicants", icon: FileText, resource: "applications" },
  { to: "/subscribers", label: "Newsletter", icon: Mail, resource: "subscribers" },
  { to: "/partners", label: "Partners", icon: Handshake, resource: "partners" },
  { to: "/memberships", label: "Membership Applications", icon: UserPlus, resource: "memberships" },
  { to: "/featured", label: "Hero Carousel", icon: ImageIcon, resource: "featured" },
  { to: "/initiatives", label: "Initiatives", icon: Rocket, resource: "initiatives" },
  { to: "/home-stats", label: "Home Page Stats", icon: BarChart3, resource: "homeStats" },
];

/**
 * Persistent left-side navigation. Receives the signed-in username and a
 * sign-out handler from <App />; clicking the footer button clears the
 * session cookie and bounces the operator back to the login page.
 *
 * On desktop (>= lg) it docks permanently on the left edge. On smaller
 * screens it becomes an off-canvas drawer that the parent opens via the
 * `mobileOpen` prop; tapping a link or the overlay closes it.
 */
export default function Sidebar({
  username = "admin",
  onSignOut,
  mobileOpen = false,
  onCloseMobile,
}) {
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();

  // Auto-close the drawer after every route change so the user lands on
  // the freshly-navigated page and isn't staring at a half-closed panel.
  useEffect(() => {
    if (mobileOpen && onCloseMobile) onCloseMobile();
    // Intentionally only depending on pathname so the same route re-rendered
    // by param changes still triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll while the drawer is open on small screens so the page
  // underneath doesn't move when you try to dismiss the overlay.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  // Press Escape to dismiss the drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && onCloseMobile) onCloseMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await onSignOut?.();
    } finally {
      setSigningOut(false);
    }
  };

  const navContent = (
    <div
      // `flex flex-col h-full` so the inner footer sticks to the bottom on
      // both the fixed sidebar and the slide-in drawer.
      className="flex flex-col h-full"
    >
      <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white rounded-lg shrink-0">
            <img
              src={logo}
              alt="Startup Barishal"
              className="h-7 w-auto max-w-[140px] object-contain"
            />
          </div>
        </div>
        {/* Close button — only visible inside the drawer (mobile). */}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="lg:hidden p-2 -mr-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary-orange text-white shadow-[0_4px_20px_rgba(255,107,0,0.25)]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/40 leading-relaxed space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-300 mb-2 font-semibold uppercase tracking-widest text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Signed in
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white/80 text-sm font-semibold truncate">
                {username}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              aria-label="Sign out"
              className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest bg-white/10 hover:bg-red-500/20 hover:text-red-200 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">
                {signingOut ? "…" : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop (only on mobile when the drawer is open) */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer / fixed sidebar — same markup, same slide behaviour */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[260px] bg-[#0b1f3a] text-white border-r border-white/10
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {navContent}
      </aside>
    </>
  );
}
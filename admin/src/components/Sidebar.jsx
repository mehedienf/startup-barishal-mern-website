import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  GraduationCap,
  Database,
  Mail,
  MessageSquare,
  FileText,
  Handshake,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/team", label: "Team Members", icon: Users, resource: "teamMembers" },
  { to: "/events", label: "Events", icon: Calendar, resource: "events" },
  { to: "/programs", label: "Incubation Programs", icon: GraduationCap, resource: "incubationPrograms" },
  { to: "/contacts", label: "Contact Inquiries", icon: MessageSquare, resource: "contacts" },
  { to: "/applications", label: "Cohort Applicants", icon: FileText, resource: "applications" },
  { to: "/subscribers", label: "Newsletter", icon: Mail, resource: "subscribers" },
  { to: "/partners", label: "Partners", icon: Handshake, resource: "partners" },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-[260px] bg-[#0b1f3a] text-white flex-col border-r border-white/10 z-50">
      <div className="h-[72px] flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary-orange/15 rounded-lg">
            <Database className="w-5 h-5 text-primary-orange" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight leading-none">SB Admin</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
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

      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/40 leading-relaxed">
        <p className="font-semibold text-white/60 mb-1">Storage</p>
        <p>JSON file: <code className="text-white/50">server/data/db.json</code></p>
      </div>
    </aside>
  );
}
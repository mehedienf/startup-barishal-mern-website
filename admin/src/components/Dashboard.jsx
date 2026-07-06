import React, { useEffect, useState } from "react";
import {
  Database,
  Cpu,
  FileText,
  MessageSquare,
  Mail,
  Users,
  Calendar,
  GraduationCap,
} from "lucide-react";

const TILES = [
  { key: "currentApplicationsCount", label: "Cohort Submissions", icon: FileText, color: "text-secondary-blue", bg: "bg-blue-100/60" },
  { key: "currentContactsCount",    label: "Contact Messages",   icon: MessageSquare, color: "text-primary-orange", bg: "bg-orange-100/60" },
  { key: "currentSubscribersCount", label: "Newsletter Units",   icon: Mail, color: "text-emerald-700", bg: "bg-emerald-100/60" },
  { key: "currentTeamCount",        label: "Team Members",       icon: Users, color: "text-violet-700",  bg: "bg-violet-100/60" },
  { key: "eventsCount",             label: "Events",             icon: Calendar, color: "text-rose-700",   bg: "bg-rose-100/60" },
  { key: "currentProgramsCount",    label: "Incubation Programs", icon: GraduationCap, color: "text-amber-700", bg: "bg-amber-100/60" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="animate-fadeIn py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <section className="bg-gradient-to-r from-slate-900 to-[#002B47] text-white rounded-2xl p-6 md:p-8 mb-10 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full self-start border border-emerald-500/20">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>Server-side DB Connected</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Database className="w-8 h-8 text-primary-orange shrink-0" />
            <span>MERN Stack Database Control Centre</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-[650px] leading-relaxed">
            Live counts from <strong>db.json</strong>. Use the sidebar to manage team, events, programs, and inbound inquiries.
          </p>
        </div>
        <button onClick={load} className="bg-primary-orange hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer shrink-0">
          Refresh
        </button>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {TILES.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">{label}</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-secondary-blue mt-1">
                  {loading || !stats ? "—" : (stats[key] ?? 0)}
                </h3>
              </div>
              <div className={`p-2 ${bg} rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
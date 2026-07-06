import React, { useState } from "react";
import { Search, Mail, CheckCircle2 } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData.js";

export default function SubscribersPage() {
  const { subscribers, loading, refresh } = useAdminData();
  const [search, setSearch] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const filtered = subscribers.filter((s) => (s.email || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-sm text-slate-500 mt-1">Emails collected from the public site's newsletter opt-in form.</p>
        </div>
        <button onClick={refresh} className="text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Refresh</button>
      </header>

      <div className="relative w-full md:w-96 mb-6">
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {actionMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {actionMessage}
        </div>
      )}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-orange animate-spin" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <Mail className="w-8 h-8 text-slate-300" /> No subscribers stored currently.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-4">Subscription Date</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-slate-700">{s.email}</td>
                    <td className="p-4 text-xs text-emerald-600 font-bold">Active Double Opt-In</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
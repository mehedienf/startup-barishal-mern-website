import React, { useState } from "react";
import { Search, MessageSquare, CheckCircle2 } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData.js";

export default function ContactsPage() {
  const { contacts, loading, refresh } = useAdminData();
  const [search, setSearch] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.email || "").toLowerCase().includes(q) ||
      (c.firstName || "").toLowerCase().includes(q) ||
      (c.subject || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contact Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">Inbound messages from the public site's contact form.</p>
        </div>
        <button onClick={refresh} className="text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Refresh</button>
      </header>

      <div className="relative w-full md:w-96 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or subject…"
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
            <MessageSquare className="w-8 h-8 text-slate-300" /> No contact inquiry logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-4">Date</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-slate-400 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <p className="font-bold text-[#191c1e]">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </td>
                    <td className="p-4 font-semibold text-secondary-blue">{c.subject}</td>
                    <td className="p-4 max-w-[340px]">
                      <p className="text-slate-700 text-xs leading-relaxed line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-100">{c.message}</p>
                    </td>
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
import React, { useState } from "react";
import { Search, FileText, CheckCircle2 } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData.js";
import ApplicationAuditModal from "./ApplicationAuditModal.jsx";

const STATUS_STYLE = {
  Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Declined: "bg-red-100 text-red-800 border-red-200",
  Reviewed: "bg-slate-100 text-slate-700 border-slate-200",
  default:  "bg-amber-100 text-amber-800 border-amber-200",
};

export default function ApplicationsPage() {
  const { applications, loading, refresh } = useAdminData();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const filtered = applications.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.startupName || "").toLowerCase().includes(q) ||
      (a.fullName || "").toLowerCase().includes(q) ||
      (a.id || "").toLowerCase().includes(q)
    );
  });

  const handleStatus = async (nextStatus) => {
    if (!selected) return;
    const res = await fetch(`/api/applications/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, notes: note }),
    });
    if (res.ok) {
      setActionMessage(`Updated status to ${nextStatus}.`);
      setSelected(null);
      setNote("");
      await refresh();
      setTimeout(() => setActionMessage(""), 4000);
    }
  };

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cohort Applicants</h1>
          <p className="text-sm text-slate-500 mt-1">Audit, approve, or decline incubator applications from the public site.</p>
        </div>
        <button onClick={refresh} className="text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Refresh</button>
      </header>

      <div className="relative w-full md:w-96 mb-6">
        <input
          type="text"
          placeholder="Search by reference, founder, or project…"
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
            <FileText className="w-8 h-8 text-slate-300" /> No cohort applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Founder & Project</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-slate-500 uppercase whitespace-nowrap">{app.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-[#191c1e] text-sm">{app.startupName}</p>
                      <p className="text-xs text-slate-500">Lead: {app.fullName} ({app.email})</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[app.status] || STATUS_STYLE.default}`}>
                        {app.status}
                      </span>
                      {app.notes && (
                        <p className="text-[11px] text-emerald-700 mt-1 max-w-[200px] line-clamp-1 italic">Note: {app.notes}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-secondary-blue bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">{app.stage}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setSelected(app); setNote(app.notes || ""); }}
                        className="inline-flex items-center gap-1 text-secondary-blue hover:text-primary-orange border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <Search className="w-3.5 h-3.5" /> Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ApplicationAuditModal
        application={selected}
        note={note}
        onNoteChange={setNote}
        onClose={() => { setSelected(null); setNote(""); }}
        onStatus={handleStatus}
        message={actionMessage}
      />
    </div>
  );
}
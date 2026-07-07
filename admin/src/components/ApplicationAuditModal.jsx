import React from "react";
import { X, CheckCircle2, XCircle, Clock } from "lucide-react";

/**
 * Formats an ISO timestamp into a human-readable date + time string.
 * Falls back to "—" when missing/invalid.
 */
function formatSubmittedAt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart} · ${timePart}`;
}

/**
 * Auditing modal for cohort applications. Posts a status update with
 * an optional note to /api/applications/:id.
 */
export default function ApplicationAuditModal({ application, note, onNoteChange, onClose, onStatus, message }) {
  if (!application) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-[600px] w-full p-6 border border-slate-200 shadow-2xl relative animate-scaleIn">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auditing Candidate Detail</span>
            <h3 className="text-xl font-bold text-secondary-blue mt-0.5">{application.startupName}</h3>
            {application.programName && (
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Cohort: <span className="text-secondary-blue">{application.programName}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5">✕</button>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block">Proposed Team Lead</span>
              <span className="font-bold text-[#191c1e]">{application.fullName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Pitch Phase</span>
              <span className="font-bold text-secondary-blue">{application.stage}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Candidate Email</span>
              <span className="font-medium text-slate-600">{application.email}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Current Status</span>
              <span className="font-semibold text-amber-800">{application.status}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-slate-400 block">Submission Timestamp</span>
              <div className="inline-flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span
                  className="font-semibold text-[#191c1e]"
                  title={application.createdAt || ""}
                >
                  {formatSubmittedAt(application.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider mb-1">Company Pitch Summary</span>
            <p className="text-slate-700 text-xs md:text-sm bg-[#F8FAFC] border border-slate-200 p-3 rounded-lg leading-relaxed max-h-[120px] overflow-y-auto">
              {application.description}
            </p>
          </div>

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs font-semibold">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="reviewNote">Custom Assessment Notes</label>
            <input
              type="text"
              id="reviewNote"
              placeholder="e.g., Outstanding founders, workspace desk allocated"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 justify-end">
            <button onClick={() => onStatus("Declined")}  className="bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> Decline
            </button>
            <button onClick={() => onStatus("Reviewed")}  className="bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Mark Reviewed
            </button>
            <button onClick={() => onStatus("Approved")}  className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Approve Cohort
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
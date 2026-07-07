import React from "react";
import { X, CheckCircle2, XCircle, Clock, Mail, Phone, Building2 } from "lucide-react";

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

const INTEREST_LABELS = {
  mentorship: "1:1 mentorship",
  cohort: "Cohort / incubation program",
  community: "Founder community",
  workspace: "Co-working / desk space",
  learning: "Workshops & learning",
};

/**
 * Auditing modal for public-site membership applications.
 * Posts a status update + optional note to /api/memberships/:id.
 */
export default function MembershipAuditModal({ membership, note, onNoteChange, onClose, onStatus }) {
  if (!membership) return null;

  const interests = (membership.interests || []).map((id) => INTEREST_LABELS[id] || id);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-[640px] w-full p-6 border border-slate-200 shadow-2xl relative animate-scaleIn">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Membership Application
            </span>
            <h3 className="text-xl font-bold text-secondary-blue mt-0.5">
              {membership.fullName}
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
              {membership.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          {/* Identity panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block">Email</span>
              <span className="font-bold text-[#191c1e] inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href={`mailto:${membership.email}`} className="hover:text-primary-orange">
                  {membership.email}
                </a>
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Phone</span>
              <span className="font-bold text-[#191c1e] inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {membership.phone || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Organization</span>
              <span className="font-bold text-secondary-blue inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {membership.organization || "—"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Role</span>
              <span className="font-bold text-secondary-blue">{membership.role || "—"}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-slate-400 block">Interests</span>
              {interests.length === 0 ? (
                <span className="text-slate-400 text-xs">No interests selected.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {interests.map((label) => (
                    <span
                      key={label}
                      className="text-[11px] font-semibold text-primary-orange bg-primary-orange/10 border border-primary-orange/20 px-2 py-0.5 rounded-full"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-slate-400 block">Submitted</span>
              <div className="inline-flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-[#191c1e]" title={membership.createdAt || ""}>
                  {formatSubmittedAt(membership.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Message body */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Their message
            </span>
            <p className="text-slate-700 text-xs md:text-sm bg-[#F8FAFC] border border-slate-200 p-3 rounded-lg leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap">
              {membership.message || "—"}
            </p>
          </div>

          {/* Reviewer note */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-bold text-slate-500 uppercase tracking-widest"
              htmlFor="reviewNote"
            >
              Custom Assessment Notes
            </label>
            <input
              type="text"
              id="reviewNote"
              placeholder="e.g., Approved for community tier — onboard next Monday"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all w-full"
            />
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 justify-end">
            <button
              onClick={() => onStatus("Rejected")}
              className="bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button
              onClick={() => onStatus("Reviewed")}
              className="bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" /> Mark Reviewed
            </button>
            <button
              onClick={() => onStatus("Approved")}
              className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

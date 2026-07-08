import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, UserPlus, CheckCircle2, Clock } from "lucide-react";
import BulkActionBar from "./BulkActionBar.jsx";
import FilterDropdown from "./FilterDropdown.jsx";
import Pagination from "./Pagination.jsx";
import MembershipAuditModal from "./MembershipAuditModal.jsx";
import { apiFetch } from "../lib/api.js";

const PAGE_SIZE = 50;

const STATUS_STYLE = {
  Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Reviewed: "bg-slate-100 text-slate-700 border-slate-200",
  default:  "bg-amber-100 text-amber-800 border-amber-200",
};

const INTEREST_LABELS = {
  mentorship: "Mentorship",
  cohort: "Cohort",
  community: "Community",
  workspace: "Workspace",
  learning: "Learning",
};

function formatSubmittedDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatSubmittedTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

async function postBulkDelete(body) {
  const res = await apiFetch("/api/memberships/bulk", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/**
 * Admin inbox for public-site membership applications.
 * Reads /api/memberships, supports status filter, search, pagination,
 * audit modal (PUT status + note), and bulk delete.
 */
export default function MembershipsPage() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [page, setPage] = useState(1);
  const tableContainerRef = useRef(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/memberships");
      if (res.ok) setMemberships(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return memberships.filter((m) => {
      const matchesText =
        !q ||
        (m.fullName || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.organization || "").toLowerCase().includes(q) ||
        (m.role || "").toLowerCase().includes(q) ||
        (m.id || "").toLowerCase().includes(q);
      if (!matchesText) return false;
      if (activeFilter && m.status !== activeFilter.value) return false;
      return true;
    });
  }, [memberships, search, activeFilter]);

  // Prune selections that fall out of the visible/filtered set.
  useEffect(() => {
    const visible = new Set(filtered.map((m) => m.id));
    setSelectedIds((prev) => prev.filter((id) => visible.has(id)));
  }, [filtered]);

  // Reset to page 1 when search/filter changes.
  useEffect(() => { setPage(1); }, [search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((m) => selectedIds.includes(m.id));

  const toggleAll = () => {
    if (allFilteredSelected) setSelectedIds([]);
    else setSelectedIds(filtered.map((m) => m.id));
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4000);
  };

  const handleStatus = async (nextStatus) => {
    if (!selected) return;
    const res = await apiFetch(`/api/memberships/${selected.id}`, {
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

  const handleDeleteSelected = async () => {
    const data = await postBulkDelete({ ids: selectedIds });
    setSelectedIds([]);
    await refresh();
    return data;
  };

  const handleDeleteFiltered = async () => {
    if (!activeFilter) throw new Error("No filter active");
    const data = await postBulkDelete({
      filter: { field: "status", op: "equals", value: activeFilter.value },
    });
    setSelectedIds([]);
    setActiveFilter(null);
    await refresh();
    return data;
  };

  const statusChips = useMemo(() => {
    const counts = new Map();
    memberships.forEach((m) => {
      const key = m.status || "Pending";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }));
  }, [memberships]);

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Membership Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submissions from the public site's <span className="font-mono">/membership</span> form. Approve, reject, or note for follow-up.
          </p>
        </div>
        <button
          onClick={refresh}
          className="text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl cursor-pointer"
        >
          Refresh
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name, email, organization, role, or id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {statusChips.length > 1 && (
          <FilterDropdown
            label="Filter by status"
            placeholder="All statuses"
            accent="orange"
            value={activeFilter?.value}
            onChange={(v) =>
              setActiveFilter(v ? { value: v, label: `status = "${v}"` } : null)
            }
            options={statusChips.map((c) => ({ value: c.value, label: c.value, count: c.count }))}
          />
        )}
      </div>

      <BulkActionBar
        selectedIds={selectedIds}
        totalVisible={filtered.length}
        onSelectAllVisible={() => setSelectedIds(filtered.map((m) => m.id))}
        onClearSelection={() => setSelectedIds([])}
        onDeleteSelected={handleDeleteSelected}
        onDeleteFiltered={handleDeleteFiltered}
        filterLabel={activeFilter?.label}
        itemLabel="membership"
        onMessage={showToast}
      />

      {actionMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {actionMessage}
        </div>
      )}

      <section
        ref={tableContainerRef}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-orange animate-spin" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Syncing…
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <UserPlus className="w-8 h-8 text-slate-300" />
            No membership applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm table-fixed">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      aria-label="Select all visible membership applications"
                      className="w-4 h-4 accent-primary-orange cursor-pointer"
                    />
                  </th>
                  <th className="p-4 w-[28%]">Applicant</th>
                  <th className="p-4 w-[20%]">Organization / Role</th>
                  <th className="p-4 w-[16%]">Interests</th>
                  <th className="p-4 w-[12%]">Status</th>
                  <th className="p-4 w-[14%]">Submitted</th>
                  <th className="p-4 w-[10%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((m) => {
                  const checked = selectedIds.includes(m.id);
                  const interests = (m.interests || []).map(
                    (id) => INTEREST_LABELS[id] || id
                  );
                  return (
                    <tr
                      key={m.id}
                      className={`transition-colors ${checked ? "bg-amber-50/40" : "hover:bg-slate-50/50"}`}
                    >
                      <td className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(m.id)}
                          aria-label={`Select membership ${m.id}`}
                          className="w-4 h-4 accent-primary-orange cursor-pointer"
                        />
                      </td>
                      <td className="p-4 align-top w-[28%]">
                        <p className="font-bold text-[#191c1e] text-sm break-words">
                          {m.fullName}
                        </p>
                        <p className="text-xs text-slate-500 break-all">
                          {m.email}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 break-all">
                          {m.id}
                        </p>
                      </td>
                      <td className="p-4 align-top w-[20%]">
                        <p className="font-semibold text-secondary-blue text-sm break-words">
                          {m.organization || "—"}
                        </p>
                        <p className="text-xs text-slate-500 break-words">
                          {m.role || "—"}
                        </p>
                        {m.phone && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{m.phone}</p>
                        )}
                      </td>
                      <td className="p-4 align-top w-[16%]">
                        {interests.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {interests.slice(0, 3).map((label) => (
                              <span
                                key={label}
                                className="text-[10px] font-semibold text-primary-orange bg-primary-orange/10 border border-primary-orange/20 px-1.5 py-0.5 rounded-full"
                              >
                                {label}
                              </span>
                            ))}
                            {interests.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{interests.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-top w-[12%]">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            STATUS_STYLE[m.status] || STATUS_STYLE.default
                          }`}
                        >
                          {m.status}
                        </span>
                        {m.notes && (
                          <p className="text-[11px] text-emerald-700 mt-1 max-w-[200px] line-clamp-1 italic">
                            Note: {m.notes}
                          </p>
                        )}
                      </td>
                      <td className="p-4 align-top w-[14%]">
                        <div className="flex flex-col leading-tight">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span title={m.createdAt || ""} className="truncate">
                              {formatSubmittedDate(m.createdAt)}
                            </span>
                          </span>
                          <span
                            className="text-[11px] text-slate-500 font-mono pl-4 mt-0.5"
                            title={m.createdAt || ""}
                          >
                            {formatSubmittedTime(m.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelected(m);
                            setNote(m.notes || "");
                          }}
                          className="inline-flex items-center gap-1 text-secondary-blue hover:text-primary-orange border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="application"
          scrollRef={tableContainerRef}
        />
      </section>

      <MembershipAuditModal
        membership={selected}
        note={note}
        onNoteChange={setNote}
        onClose={() => {
          setSelected(null);
          setNote("");
        }}
        onStatus={handleStatus}
      />
    </div>
  );
}
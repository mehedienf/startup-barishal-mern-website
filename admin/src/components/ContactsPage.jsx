import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, MessageSquare, CheckCircle2 } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData.js";
import BulkActionBar from "./BulkActionBar.jsx";
import FilterDropdown from "./FilterDropdown.jsx";
import Pagination from "./Pagination.jsx";

const PAGE_SIZE = 50;

async function postBulkDelete(resource, body) {
  const res = await fetch(`/api/${resource}/bulk`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export default function ContactsPage() {
  const { contacts, loading, refresh } = useAdminData();
  const [search, setSearch] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null); // { value, label, filter }
  const tableContainerRef = useRef(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const q = search.toLowerCase();
      const matchesText =
        !q ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.firstName || "").toLowerCase().includes(q) ||
        (c.subject || "").toLowerCase().includes(q);
      if (!matchesText) return false;
      if (activeFilter && c.subject !== activeFilter.value) return false;
      return true;
    });
  }, [contacts, search, activeFilter]);

  useEffect(() => {
    const visible = new Set(filtered.map((c) => c.id));
    setSelectedIds((prev) => prev.filter((id) => visible.has(id)));
  }, [filtered]);

  // Reset to page 1 when the search or filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, activeFilter]);

  // Slice for the current page; full filtered set still drives counts and
  // selection-pruning so the bulk action sees the entire result set.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((c) => selectedIds.includes(c.id));

  const toggleAll = () => {
    if (allFilteredSelected) setSelectedIds([]);
    else setSelectedIds(filtered.map((c) => c.id));
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

  const handleDeleteSelected = async () => {
    const data = await postBulkDelete("contacts", { ids: selectedIds });
    setSelectedIds([]);
    await refresh();
    return data;
  };

  const handleDeleteFiltered = async () => {
    if (!activeFilter) throw new Error("No filter active");
    const data = await postBulkDelete("contacts", {
      filter: { field: "subject", op: "equals", value: activeFilter.value },
    });
    setSelectedIds([]);
    setActiveFilter(null);
    await refresh();
    return data;
  };

  // Unique subjects → filter chips, with counts.
  const subjectChips = useMemo(() => {
    const map = new Map();
    contacts.forEach((c) => {
      const key = c.subject || "General Inquiry";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }));
  }, [contacts]);

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contact Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">Inbound messages from the public site's contact form.</p>
        </div>
        <button onClick={refresh} className="text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Refresh</button>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name, email, or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {subjectChips.length > 1 && (
          <FilterDropdown
            label="Filter by subject"
            placeholder="All subjects"
            accent="blue"
            value={activeFilter?.value}
            onChange={(v) =>
              setActiveFilter(
                v
                  ? {
                      value: v,
                      label: `subject = "${v}"`,
                    }
                  : null
              )
            }
            options={subjectChips.map((c) => ({ value: c.value, label: c.value, count: c.count }))}
          />
        )}
      </div>

      <BulkActionBar
        selectedIds={selectedIds}
        totalVisible={filtered.length}
        onSelectAllVisible={() => setSelectedIds(filtered.map((c) => c.id))}
        onClearSelection={() => setSelectedIds([])}
        onDeleteSelected={handleDeleteSelected}
        onDeleteFiltered={handleDeleteFiltered}
        filterLabel={activeFilter?.label}
        itemLabel="inquiry"
        onMessage={showToast}
      />

      {actionMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {actionMessage}
        </div>
      )}

      <section ref={tableContainerRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAll}
                      aria-label="Select all visible inquiries"
                      className="w-4 h-4 accent-primary-orange cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((c) => {
                  const checked = selectedIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${checked ? "bg-amber-50/40" : "hover:bg-slate-50/50"}`}
                    >
                      <td className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(c.id)}
                          aria-label={`Select inquiry from ${c.email}`}
                          className="w-4 h-4 accent-primary-orange cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <p className="font-bold text-[#191c1e]">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </td>
                      <td className="p-4 font-semibold text-secondary-blue">{c.subject}</td>
                      <td className="p-4 max-w-[340px]">
                        <div className="max-h-32 overflow-y-auto bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap break-words">{c.message}</p>
                        </div>
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
          itemLabel="inquiry"
          scrollRef={tableContainerRef}
        />
      </section>
    </div>
  );
}
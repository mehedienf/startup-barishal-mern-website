import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Mail, CheckCircle2 } from "lucide-react";
import { useAdminData } from "../hooks/useAdminData.js";
import BulkActionBar from "./BulkActionBar.jsx";
import FilterDropdown from "./FilterDropdown.jsx";
import Pagination from "./Pagination.jsx";

const PAGE_SIZE = 50;

/**
 * Calls the bulk-delete endpoint and returns parsed JSON.
 * Throws on non-OK so the BulkActionBar can show the error message.
 */
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

export default function SubscribersPage() {
  const { subscribers, loading, refresh } = useAdminData();
  const [search, setSearch] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);

  // Filter chips that drive the BulkActionBar's filter-mode delete.
  // Empty array = no filter chip is offered.
  const [activeFilter, setActiveFilter] = useState(null); // { kind, value, label }
  const tableContainerRef = useRef(null);

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (search && !(s.email || "").toLowerCase().includes(search.toLowerCase())) return false;
      if (activeFilter?.kind === "month") {
        if (!s.createdAt) return false;
        const d = new Date(s.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== activeFilter.value) return false;
      }
      return true;
    });
  }, [subscribers, search, activeFilter]);

  // Prune selection if filtered rows change so we don't keep deleted ids.
  useEffect(() => {
    const visible = new Set(filtered.map((s) => s.id));
    setSelectedIds((prev) => prev.filter((id) => visible.has(id)));
  }, [filtered]);

  // Reset to page 1 whenever the search or filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, activeFilter]);

  // Slice the filtered list for the current page. `filtered` keeps the full
  // set so search counts, selection prune, and bulk-delete still operate on
  // every matching row — pagination only changes what's rendered.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  const toggleAll = () => {
    if (allFilteredSelected) setSelectedIds([]);
    else setSelectedIds(filtered.map((s) => s.id));
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
    const data = await postBulkDelete("subscribers", { ids: selectedIds });
    setSelectedIds([]);
    await refresh();
    return data;
  };

  const handleDeleteFiltered = async () => {
    if (!activeFilter) throw new Error("No filter active");
    let data;
    if (activeFilter.kind === "month") {
      // Server doesn't index on createdAt month directly — strip down to
      // a date-range filter using createdAt prefix. We send id-by-id so
      // it's resilient across resources without changing the API.
      const ids = filtered.map((s) => s.id);
      data = await postBulkDelete("subscribers", { ids });
    } else {
      data = await postBulkDelete("subscribers", { filter: activeFilter.filter });
    }
    setSelectedIds([]);
    setActiveFilter(null);
    await refresh();
    return data;
  };

  // Unique year-month pairs present in the dataset, newest first.
  const monthChips = useMemo(() => {
    const keys = new Set();
    subscribers.forEach((s) => {
      if (!s.createdAt) return;
      const d = new Date(s.createdAt);
      if (Number.isNaN(d.getTime())) return;
      keys.add(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      );
    });
    return Array.from(keys)
      .sort()
      .reverse()
      .map((key) => {
        const [year, month] = key.split("-").map(Number);
        const label = new Date(year, month - 1, 1).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        return { value: key, label, count: subscribers.filter((s) => {
          if (!s.createdAt) return false;
          const d = new Date(s.createdAt);
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          return k === key;
        }).length };
      });
  }, [subscribers]);

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-sm text-slate-500 mt-1">Emails collected from the public site's newsletter opt-in form.</p>
        </div>
        <button onClick={refresh} className="text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl">Refresh</button>
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {monthChips.length > 0 && (
          <FilterDropdown
            label="Filter by month"
            placeholder="All months"
            accent="blue"
            value={activeFilter?.value}
            onChange={(v) =>
              setActiveFilter(
                v
                  ? {
                      kind: "month",
                      value: v,
                      label: `subscribed in ${
                        monthChips.find((c) => c.value === v)?.label || v
                      }`,
                    }
                  : null
              )
            }
            options={monthChips.map((c) => ({ value: c.value, label: c.label, count: c.count }))}
          />
        )}
      </div>

      <BulkActionBar
        selectedIds={selectedIds}
        totalVisible={filtered.length}
        onSelectAllVisible={() => setSelectedIds(filtered.map((s) => s.id))}
        onClearSelection={() => setSelectedIds([])}
        onDeleteSelected={handleDeleteSelected}
        onDeleteFiltered={handleDeleteFiltered}
        filterLabel={activeFilter?.label}
        itemLabel="subscriber"
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
            <Mail className="w-8 h-8 text-slate-300" /> No subscribers stored currently.
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
                      aria-label="Select all visible subscribers"
                      className="w-4 h-4 accent-primary-orange cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Subscription Date</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((s) => {
                  const checked = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${checked ? "bg-amber-50/40" : "hover:bg-slate-50/50"}`}
                    >
                      <td className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(s.id)}
                          aria-label={`Select ${s.email}`}
                          className="w-4 h-4 accent-primary-orange cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-slate-700">{s.email}</td>
                      <td className="p-4 text-xs text-emerald-600 font-bold">Active Double Opt-In</td>
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
          itemLabel="subscriber"
          scrollRef={tableContainerRef}
        />
      </section>
    </div>
  );
}
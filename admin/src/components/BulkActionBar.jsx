import React, { useState } from "react";
import { Trash2, X, AlertTriangle, Filter } from "lucide-react";

/**
 * BulkActionBar — appears above any resource table once the admin has
 * selected at least one row OR has an active filter applied.
 *
 * Props
 * ─────
 *  selectedIds        string[]      currently-checked row ids
 *  totalVisible       number        count of rows in the current filter view
 *  onSelectAllVisible () => void    check every row in the filter view
 *  onClearSelection   () => void    uncheck everything
 *  onDeleteSelected   () => Promise fires DELETE /api/<resource>/bulk { ids }
 *  onDeleteFiltered   () => Promise fires DELETE /api/<resource>/bulk { filter }
 *                       — only mounted when `filterLabel` is provided
 *  filterLabel        string?       e.g. "Status = Pending" — shows filter chip
 *  itemLabel          string        singular noun for the resource
 *                                    (default: "item")
 *  onMessage          (text) => void surface a status toast in the host page
 */
export default function BulkActionBar({
  selectedIds,
  totalVisible,
  onSelectAllVisible,
  onClearSelection,
  onDeleteSelected,
  onDeleteFiltered,
  filterLabel,
  itemLabel = "item",
  onMessage,
}) {
  const [confirm, setConfirm] = useState(null); // { kind: "selected" | "filtered", phrase: string }
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedCount = selectedIds.length;
  const hasFilter = Boolean(filterLabel);

  // Nothing to show? Render an empty fragment so callers can mount it
  // unconditionally without leaving a dead bar.
  if (selectedCount === 0 && !hasFilter) return null;

  const openConfirm = (kind) => {
    const phraseText =
      kind === "selected"
        ? `delete ${selectedCount} ${itemLabel}${selectedCount === 1 ? "" : "s"}`
        : `delete all ${itemLabel}s where ${filterLabel}`;
    setPhrase("");
    setConfirm({ kind, phrase: phraseText });
  };

  const closeConfirm = () => {
    if (busy) return;
    setConfirm(null);
    setPhrase("");
  };

  const runDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      const fn =
        confirm.kind === "selected" ? onDeleteSelected : onDeleteFiltered;
      const result = await fn();
      const deleted = result?.deleted ?? 0;
      onMessage?.(
        `Deleted ${deleted} ${itemLabel}${deleted === 1 ? "" : "s"}.`
      );
      setConfirm(null);
      setPhrase("");
    } catch (err) {
      onMessage?.(err.message || "Bulk delete failed.");
    } finally {
      setBusy(false);
    }
  };

  const phraseMatches = phrase.trim().toLowerCase() === "delete";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fadeIn">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
          Bulk Actions
        </span>

        {selectedCount > 0 ? (
          <>
            <span className="text-xs font-semibold text-slate-700 bg-white border border-amber-200 px-2.5 py-1 rounded-lg">
              {selectedCount} selected
            </span>
            <button
              type="button"
              onClick={onSelectAllVisible}
              className="text-xs font-semibold text-secondary-blue hover:text-primary-orange underline-offset-2 hover:underline"
            >
              Select all {totalVisible} visible
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => openConfirm("selected")}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete selected
              </button>
            </div>
          </>
        ) : (
          <span className="text-xs text-slate-500">
            Select rows from the table below to enable bulk actions.
          </span>
        )}

        {hasFilter && onDeleteFiltered && (
          <div
            className={`flex items-center gap-2 ${
              selectedCount > 0 ? "ml-2 pl-3 border-l border-amber-200" : "ml-auto"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg">
              <Filter className="w-3 h-3 text-slate-400" />
              {filterLabel}
            </span>
            <button
              type="button"
              onClick={() => openConfirm("filtered")}
              className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete all matching
            </button>
          </div>
        )}
      </div>

      {/* Confirm dialog — requires typing "delete" to enable the button.
          Prevents one-click catastrophic deletes. */}
      {confirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeConfirm();
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-[460px] w-full p-6 relative animate-scaleIn">
            <button
              type="button"
              onClick={closeConfirm}
              disabled={busy}
              className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
              aria-label="Close confirmation"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 self-start">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary-blue">
                  Confirm bulk delete
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  You are about to{" "}
                  <span className="font-bold text-slate-800">
                    {confirm.phrase}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Type <span className="text-red-600">delete</span> to confirm
                </span>
                <input
                  type="text"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  disabled={busy}
                  placeholder="delete"
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none transition-all"
                  autoFocus
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeConfirm}
                  disabled={busy}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={runDelete}
                  disabled={!phraseMatches || busy}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {busy ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
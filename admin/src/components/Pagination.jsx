import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Compact pagination control for admin tables.
 *
 * Renders nothing when the dataset fits on a single page.
 *
 * Props:
 *  - page:         current 1-based page index
 *  - totalPages:   total number of pages
 *  - totalItems:   total number of items across all pages
 *  - pageSize:     items per page
 *  - onPageChange: (nextPage: number) => void
 *  - itemLabel:    singular noun, e.g. "subscriber"
 *  - scrollRef:    optional React ref to the element that should be scrolled
 *                  into view when the page changes (so the user actually
 *                  sees the start of the new page rather than staying at the
 *                  scroll position the previous page ended on).
 */
export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = "item",
  scrollRef,
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const go = (next) => {
    if (next < 1 || next > totalPages || next === page) return;
    onPageChange(next);
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/40">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Showing <span className="text-slate-800">{start}–{end}</span> of{" "}
        <span className="text-slate-800">{totalItems}</span> {itemLabel}{totalItems === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-slate-600 px-2">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

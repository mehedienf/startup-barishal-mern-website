import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";

/**
 * Compact single-select filter dropdown.
 *
 * Replaces the previous chip-row filter UI on the inbox pages so that
 * long filter lists (many months, many subjects, many statuses) collapse
 * into a single chip-style button that opens a panel.
 *
 * Props:
 *  - label:        short caption rendered inside the trigger button, e.g. "Month"
 *  - placeholder:  trigger text when no filter is active
 *  - options:      [{ value, label, count }]  (count optional)
 *  - value:        currently selected value, or null/undefined for "All"
 *  - onChange:     (valueOrNull) => void  — pass null to clear
 *  - accent:       "orange" | "blue"   visual accent when a filter is active
 *  - align:        "left" | "right"     panel alignment
 */
export default function FilterDropdown({
  label,
  placeholder = "All",
  options = [],
  value,
  onChange,
  accent = "blue",
  align = "left",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = options.find((o) => o.value === value);
  const activeAccent =
    accent === "orange"
      ? "bg-primary-orange/10 text-primary-orange border-primary-orange/30"
      : "bg-secondary-blue/10 text-secondary-blue border-secondary-blue/30";
  const idleAccent = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";

  const select = (v) => {
    onChange?.(v);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative inline-flex items-center gap-1.5">
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 self-center">
          {label}:
        </span>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
          active ? activeAccent : idleAccent
        }`}
      >
        <span className="truncate max-w-[180px]">
          {active ? active.label : placeholder}
        </span>
        {active ? (
          <span className="text-slate-400 font-mono">({active.count ?? 0})</span>
        ) : null}
        {active ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(null);
            }}
            className="ml-0.5 -mr-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/5"
            aria-label="Clear filter"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute z-30 mt-1 top-full min-w-[220px] max-h-[320px] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/5 py-1 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <button
            type="button"
            onClick={() => select(null)}
            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 ${
              !active ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <span>All {label?.toLowerCase() || "items"}</span>
            {!active && <Check className="w-3.5 h-3.5 text-primary-orange" />}
          </button>
          <div className="h-px bg-slate-100 my-1" />
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-400 italic">No options available</p>
          ) : (
            options.map((opt) => {
              const isActive = active?.value === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => select(opt.value)}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 ${
                    isActive ? "text-slate-900 bg-slate-50" : "text-slate-600"
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  <span className="inline-flex items-center gap-2">
                    {typeof opt.count === "number" && (
                      <span className="text-slate-400 font-mono">{opt.count}</span>
                    )}
                    {isActive && <Check className="w-3.5 h-3.5 text-primary-orange" />}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

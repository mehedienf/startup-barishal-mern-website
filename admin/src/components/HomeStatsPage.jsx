import React, { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Sparkles,
} from "lucide-react";

/**
 * Admin page for editing the four "by the numbers" counters shown on the
 * public homepage:
 *
 *   - Events & Workshops
 *   - Startups Mentored
 *   - Investors Onboarded
 *   - Cohorts Completed
 *
 * Stored under `homeStats` on the DB via PUT /api/homeStats. The public
 * /api/stats route reads these (when set) and falls back to legacy
 * auto-derivation. Sending an empty input for any field clears that
 * override for that one tile.
 */
const FIELDS = [
  {
    name: "eventsCount",
    label: "Events & Workshops",
    hint: "Total events and workshops hosted or co-hosted.",
    color: "text-rose-700",
  },
  {
    name: "startupsMentored",
    label: "Startups Mentored",
    hint: "Total founder teams that went through mentorship or a cohort.",
    color: "text-secondary-blue",
  },
  {
    name: "investorsOnboarded",
    label: "Investors Onboarded",
    hint: "Angel / VC partners actively engaged with the ecosystem.",
    color: "text-emerald-700",
  },
  {
    name: "cohortsCompleted",
    label: "Cohorts Completed",
    hint: "Incubation / accelerator cohorts that ran to completion.",
    color: "text-amber-700",
  },
];

export default function HomeStatsPage() {
  const [form, setForm] = useState(() =>
    Object.fromEntries(FIELDS.map((f) => [f.name, ""]))
  );
  const [original, setOriginal] = useState(() =>
    Object.fromEntries(FIELDS.map((f) => [f.name, ""]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, kind = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/homeStats");
      if (res.ok) {
        const data = await res.json();
        const next = {};
        const orig = {};
        FIELDS.forEach((f) => {
          // Display 0 (or whatever the DB stored) by default; "" is the
          // sentinel the server interprets as "clear override".
          next[f.name] = data[f.name] ?? 0;
          orig[f.name] = data[f.name] ?? 0;
        });
        setForm(next);
        setOriginal(orig);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setField = (name, value) => {
    // Allow blank string (clears the override on save) or a non-negative
    // integer being typed. Strip leading zeros and non-digits as the user
    // types so the input never ends up with junk characters.
    if (value === "" || value === null) {
      setForm((p) => ({ ...p, [name]: "" }));
      return;
    }
    const cleaned = String(value).replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    setForm((p) => ({ ...p, [name]: cleaned }));
  };

  const dirty = FIELDS.some(
    (f) => String(form[f.name] ?? "") !== String(original[f.name] ?? "")
  );

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      FIELDS.forEach((f) => {
        const v = form[f.name];
        payload[f.name] = v === "" ? null : Number(v);
      });
      const res = await fetch("/api/homeStats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(body.error || "Save failed.", "error");
        return;
      }
      const next = {};
      const orig = {};
      FIELDS.forEach((f) => {
        next[f.name] = body[f.name] ?? 0;
        orig[f.name] = body[f.name] ?? 0;
      });
      setForm(next);
      setOriginal(orig);
      showToast("Home page stats updated.");
    } catch (err) {
      showToast("Network error: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setForm({ ...original });
  };

  const clearOne = (name) => setForm((p) => ({ ...p, [name]: "" }));

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1080px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-orange" />
            Home Page Stats
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Edit the four counters shown in the "By the Numbers" band on the public homepage.
          </p>
        </div>
        <div className="inline-flex gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" /> Reload
          </button>
          <button
            type="submit"
            form="home-stats-form"
            disabled={saving || loading || !dirty}
            className="inline-flex items-center gap-2 bg-primary-orange hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      {toast && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            toast.kind === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {toast.kind === "error" ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {FIELDS.map((f) => {
          const value = form[f.name];
          const cleared = value === "";
          return (
            <div
              key={f.name}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${f.color}`} />
                  {f.label}
                </label>
                {value !== "" && (
                  <button
                    type="button"
                    onClick={() => clearOne(f.name)}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest"
                  >
                    Clear override
                  </button>
                )}
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => setField(f.name, e.target.value)}
                placeholder={loading ? "Loading…" : "0"}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-2xl font-extrabold text-secondary-blue tracking-tight focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
              />
              <p className="text-[11px] text-slate-500">
                {cleared
                  ? "No override saved — public site falls back to auto-derived value."
                  : f.hint}
              </p>
            </div>
          );
        })}
      </section>

      <form
        id="home-stats-form"
        onSubmit={submit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        <p className="text-xs text-slate-500 leading-relaxed">
          Clearing a field saves no override for that stat — the public page will keep using
          the old auto-derived value (events from the events table, etc.) until you set a new
          number. Click <strong>Save changes</strong> to apply.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty || saving}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving || !dirty}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-orange hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Generic CRUD page used by Team, Events, and Programs.
 *
 * Props:
 *   - resource: "teamMembers" | "events" | "incubationPrograms"
 *   - title:    page heading
 *   - subtitle: short blurb under the heading
 *   - fields:   array of field definitions:
 *                 { name, label, type, required, placeholder, options? }
 *               type ∈ "text" | "textarea" | "url" | "date" | "number" | "select" | "tags"
 *   - renderItem: optional custom cell renderer (item) => ReactNode for the table's first content column
 *   - searchFields: keys searched by the top-bar search (defaults to ["name", "title"])
 */
export default function ResourcePage({ resource, title, subtitle, fields, renderItem, searchFields = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | item
  const [toast, setToast] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${resource}`);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const showToast = (msg, kind = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    const res = await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      showToast("Record deleted.");
    } else {
      showToast("Delete failed.", "error");
    }
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const keys = searchFields.length ? searchFields : ["name", "title"];
    return keys.some((k) => String(item[k] || "").toLowerCase().includes(q));
  });

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 bg-primary-orange hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add new
        </button>
      </header>

      <div className="relative w-full md:w-96 mb-6">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {toast && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          toast.kind === "error" ? "bg-red-50 text-red-800 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
        }`}>
          {toast.kind === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-orange animate-spin" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center text-sm text-slate-400">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-4">Record</th>
                  <th className="p-4 w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-top">
                      {renderItem ? renderItem(item) : (
                        <div>
                          <p className="font-bold text-[#191c1e]">{item.name || item.title}</p>
                          <p className="text-xs text-slate-500">{item.role || item.summary || ""}</p>
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => setEditing(item)} className="inline-flex items-center gap-1 text-secondary-blue hover:text-primary-orange border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-1 text-red-700 hover:text-white border border-red-200 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <ResourceForm
          resource={resource}
          fields={fields}
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setItems((prev) => {
              const idx = prev.findIndex((x) => x.id === saved.id);
              if (idx === -1) return [saved, ...prev];
              const next = [...prev]; next[idx] = saved; return next;
            });
            setEditing(null);
            showToast("Saved.");
          }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
    </div>
  );
}

function ResourceForm({ resource, fields, initial, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() => {
    const base = {};
    fields.forEach((f) => { base[f.name] = initial ? (initial[f.name] ?? "") : (f.default ?? ""); });
    return base;
  });
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = initial ? `/api/${resource}/${initial.id}` : `/api/${resource}`;
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        onError(body.error || "Save failed.");
        return;
      }
      onSaved(body.data || body);
    } catch (err) {
      onError("Network error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl max-w-[640px] w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-2xl">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-xl font-bold text-secondary-blue">
            {initial ? "Edit record" : "New record"}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  required={!!f.required}
                  value={form[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={f.rows || 4}
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all resize-y"
                />
              ) : f.type === "select" ? (
                <select
                  required={!!f.required}
                  value={form[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                >
                  <option value="">Select…</option>
                  {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : f.type === "tags" ? (
                <input
                  type="text"
                  value={Array.isArray(form[f.name]) ? form[f.name].join(", ") : form[f.name]}
                  onChange={(e) => setField(f.name, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder={f.placeholder || "comma, separated, values"}
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                />
              ) : (
                <input
                  type={f.type || "text"}
                  required={!!f.required}
                  value={form[f.name]}
                  onChange={(e) => setField(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                  placeholder={f.placeholder}
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-5 mt-5 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-orange hover:bg-primary-hover disabled:opacity-50">
            {saving ? "Saving…" : (initial ? "Save changes" : "Create")}
          </button>
        </div>
      </form>
    </div>
  );
}
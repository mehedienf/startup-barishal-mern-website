import React, { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X, CheckCircle2, AlertCircle, Upload, Handshake } from "lucide-react";

const FIELDS = [
  { name: "name",    label: "Partner name",  type: "text",   required: true,  placeholder: "e.g. BRAC Bank" },
  { name: "website", label: "Website URL",   type: "url",    placeholder: "https://…" },
  { name: "order",   label: "Display order", type: "number", placeholder: "1, 2, 3…" },
];

export default function PartnersPage() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [editing, setEditing]           = useState(null); // null | "new" | item
  const [toast, setToast]               = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partners");
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const showToast = (msg, kind = "success") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this partner? This cannot be undone.")) return;
    const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      showToast("Partner deleted.");
    } else {
      showToast("Delete failed.", "error");
    }
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [item.name, item.website].some((v) => String(v || "").toLowerCase().includes(q));
  });

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Partners &amp; Sponsors</h1>
          <p className="text-sm text-slate-500 mt-1">
            Logos uploaded here will scroll across the homepage and about-page partner strips.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 bg-primary-orange hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add new
        </button>
      </header>

      <div className="relative w-full md:w-96 mb-6">
        <input
          type="text"
          placeholder="Search by name or website…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {toast && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          toast.kind === "error"
            ? "bg-red-50 text-red-800 border border-red-200"
            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
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
          <div className="p-20 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <Handshake className="w-8 h-8 text-slate-300" /> No partners yet — click "Add new" to upload a logo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-4">Partner</th>
                  <th className="p-4">Website</th>
                  <th className="p-4 w-32">Order</th>
                  <th className="p-4 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center overflow-hidden">
                          {item.logoUrl ? (
                            <img
                              src={item.logoUrl}
                              alt={item.name}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <Handshake className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <p className="font-bold text-[#191c1e]">{item.name}</p>
                      </div>
                    </td>
                    <td className="p-4 align-top text-xs text-secondary-blue">
                      {item.website ? (
                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                          {item.website}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 align-top text-xs text-slate-500 font-mono">{item.order ?? "—"}</td>
                    <td className="p-4 align-top text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => setEditing(item)}
                          className="inline-flex items-center gap-1 text-secondary-blue hover:text-primary-orange border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 text-red-700 hover:text-white border border-red-200 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
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
        <PartnerForm
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

function PartnerForm({ initial, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() => ({
    name:    initial?.name    ?? "",
    website: initial?.website ?? "",
    order:   initial?.order   ?? "",
  }));
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initial?.logoUrl || "");
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let record;
      if (initial) {
        // PATCH text fields first
        const res = await fetch(`/api/partners/${initial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            website: form.website,
            order: form.order === "" ? undefined : Number(form.order),
          }),
        });
        const body = await res.json();
        if (!res.ok) { onError(body.error || "Save failed."); return; }
        record = body.data;
      } else {
        const res = await fetch("/api/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            website: form.website,
            order: form.order === "" ? undefined : Number(form.order),
          }),
        });
        const body = await res.json();
        if (!res.ok) { onError(body.error || "Save failed."); return; }
        record = body.data;
      }

      // Upload logo if a new file was picked
      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        const up = await fetch(`/api/partners/${record.id}/logo`, { method: "POST", body: fd });
        const upBody = await up.json();
        if (!up.ok) { onError(upBody.error || "Logo upload failed."); return; }
        record = upBody.data;
      }
      onSaved(record);
    } catch (err) {
      onError("Network error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-2xl"
      >
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-xl font-bold text-secondary-blue">
            {initial ? "Edit partner" : "New partner"}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {FIELDS.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <input
                type={f.type || "text"}
                required={!!f.required}
                value={form[f.name]}
                onChange={(e) => setField(f.name, f.type === "number" ? e.target.value : e.target.value)}
                placeholder={f.placeholder}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Logo {initial?.logoUrl ? "(replace)" : "(optional)"}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="logo preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Handshake className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer bg-[#F8FAFC] border border-slate-300 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 transition-all">
                <Upload className="w-4 h-4" />
                <span>{logoFile ? "Change file" : "Choose file"}</span>
                <input type="file" accept="image/*" onChange={onPickFile} className="hidden" />
              </label>
              {logoFile && (
                <button
                  type="button"
                  onClick={() => { setLogoFile(null); setLogoPreview(initial?.logoUrl || ""); }}
                  className="text-xs font-bold text-slate-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">PNG / JPG / SVG / WebP, up to 2 MB.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-5 mt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-orange hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? "Saving…" : initial ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
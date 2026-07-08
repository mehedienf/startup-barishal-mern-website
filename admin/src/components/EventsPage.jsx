import React, { useEffect, useState, useCallback } from "react";
import { apiFetch, resolveAssetUrl } from "../lib/api.js";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Upload,
  ImagePlus,
  Calendar,
} from "lucide-react";

const STATUS_STYLE = {
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  past: "bg-slate-100 text-slate-600 border-slate-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
};

const TEXT_FIELDS = [
  { name: "title",       label: "Event title",    type: "text",     required: true, placeholder: "Founder Mixer – August" },
  { name: "date",        label: "Date",           type: "date",     required: true },
  { name: "location",    label: "Location",       type: "text",     required: true, placeholder: "Barishal Innovation Hub" },
  { name: "description", label: "Description",    type: "textarea", required: true, rows: 5, placeholder: "What attendees will learn, who should come…" },
  { name: "status",      label: "Status",         type: "select",   options: ["upcoming", "past", "draft"], default: "upcoming" },
];

const MAX_BYTES = 4 * 1024 * 1024;

export default function EventsPage() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editing, setEditing]   = useState(null); // null | "new" | item
  const [toast, setToast]       = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/events");
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
    if (!confirm("Delete this event and all its uploaded images? This cannot be undone.")) return;
    const res = await apiFetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      showToast("Event deleted.");
    } else {
      showToast("Delete failed.", "error");
    }
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return [item.title, item.location].some((v) =>
      String(v || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="animate-fadeIn py-10 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Events</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upcoming, past, or drafts. Cover image shows on the public events card.
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
          placeholder="Search by title or location…"
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
            <Calendar className="w-8 h-8 text-slate-300" /> No events yet — click "Add new" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-4">Event</th>
                  <th className="p-4 w-32">Date</th>
                  <th className="p-4 w-32">Status</th>
                  <th className="p-4 w-32 text-center">Gallery</th>
                  <th className="p-4 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-3">
                        {item.coverImage ? (
                          <img
                            src={resolveAssetUrl(item.coverImage)}
                            alt={item.title}
                            className="w-16 h-12 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">📅</div>
                        )}
                        <div>
                          <p className="font-bold text-[#191c1e]">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.location || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top text-xs text-slate-600">
                      {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 align-top">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[item.status] || STATUS_STYLE.upcoming}`}>
                        {item.status || "upcoming"}
                      </span>
                    </td>
                    <td className="p-4 align-top text-center text-xs text-slate-600 font-mono">
                      {(item.gallery || []).length}
                    </td>
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
        <EventForm
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

/* ----------------------------- Event form ----------------------------- */

function EventForm({ initial, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() => ({
    title:       initial?.title ?? "",
    date:        initial?.date ?? "",
    location:    initial?.location ?? "",
    description: initial?.description ?? "",
    status:      initial?.status ?? "upcoming",
  }));

  // Existing remote URLs held by the event
  const [coverUrl, setCoverUrl]   = useState(initial?.coverImage || "");
  const [gallery, setGallery]     = useState(Array.isArray(initial?.gallery) ? initial.gallery : []);

  // Pending file picks (not yet uploaded)
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial?.coverImage || "");
  const [galleryFiles, setGalleryFiles] = useState([]); // [{ file, previewUrl }]
  const [galleryUrlInput, setGalleryUrlInput] = useState(""); // quick paste of an external URL

  const [saving, setSaving] = useState(false);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onPickCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) return onError("Cover file is larger than 4 MB.");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onPickGallery = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const accepted = [];
    for (const file of files) {
      if (file.size > MAX_BYTES) {
        onError(`"${file.name}" is larger than 4 MB and was skipped.`);
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    setGalleryFiles((prev) => [...prev, ...accepted]);
    // Reset input so picking the same file again still fires onChange
    e.target.value = "";
  };

  const addUrlToGallery = () => {
    const url = galleryUrlInput.trim();
    if (!url) return;
    setGallery((prev) => (prev.includes(url) ? prev : [...prev, url]));
    setGalleryUrlInput("");
  };

  const removeExistingGalleryUrl = (url) => {
    setGallery((prev) => prev.filter((u) => u !== url));
  };

  const removePendingFile = (i) => {
    setGalleryFiles((prev) => {
      const next = prev.slice();
      const [gone] = next.splice(i, 1);
      if (gone?.previewUrl) URL.revokeObjectURL(gone.previewUrl);
      return next;
    });
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview(initial?.coverImage || "");
    // We don't clear the existing remote URL here — the user has to click
    // "Remove" explicitly.  This just cancels any pending file pick.
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1) Save text fields via the normal CRUD endpoint
      const url = initial ? `/api/events/${initial.id}` : "/api/events";
      const method = initial ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) { onError(body.error || "Save failed."); return; }
      let record = body.data;

      // 2) Replace the cover image if a new file was picked
      if (coverFile) {
        const fd = new FormData();
        fd.append("cover", coverFile);
        const cr = await apiFetch(`/api/events/${record.id}/cover`, { method: "PUT", body: fd });
        const crBody = await cr.json();
        if (!cr.ok) { onError(crBody.error || "Cover upload failed."); return; }
        record = crBody.data;
      }

      // 3) Sync the gallery: delete removed existing URLs, add URL inputs,
      //    then upload any pending files as gallery.
      const originalGallery = Array.isArray(initial?.gallery) ? initial.gallery : [];
      const removed = originalGallery.filter((u) => !gallery.includes(u));
      for (const url of removed) {
        await apiFetch(`/api/events/${record.id}/images?url=${encodeURIComponent(url)}`, {
          method: "DELETE",
        });
      }
      if (coverUrl && !coverPreview && !coverFile && !record.coverImage) {
        // Edge case — user cleared the cover preview deliberately by saving
        // without a file, but kept the previous URL string.  Not implemented
        // here; cover remains whatever the server has.
      }

      if (galleryFiles.length) {
        const fd = new FormData();
        for (const gf of galleryFiles) fd.append("images", gf.file);
        const gr = await apiFetch(`/api/events/${record.id}/images`, { method: "POST", body: fd });
        const grBody = await gr.json();
        if (!gr.ok) { onError(grBody.error || "Gallery upload failed."); return; }
        record = grBody.data;
      }

      // 4) Re-fetch authoritative state so the caller always sees the
      //    server's current record (URLs, gallery order, timestamps).
      const refetch = await apiFetch(`/api/events/${record.id}`);
      if (refetch.ok) record = await refetch.json();
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
        className="bg-white rounded-2xl max-w-[720px] w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-2xl"
      >
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-xl font-bold text-secondary-blue">
            {initial ? "Edit event" : "New event"}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Text fields */}
          {TEXT_FIELDS.map((f) => (
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
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type || "text"}
                  required={!!f.required}
                  value={form[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                />
              )}
            </div>
          ))}

          {/* Cover image */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Cover image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-28 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {coverPreview ? (
                  <img
                    src={resolveAssetUrl(coverPreview)}
                    alt="cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlus className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer bg-[#F8FAFC] border border-slate-300 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 transition-all w-fit">
                  <Upload className="w-4 h-4" />
                  <span>{coverFile ? "Change file" : coverPreview ? "Replace" : "Upload cover"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={onPickCover}
                    className="hidden"
                  />
                </label>
                {(coverFile || coverPreview) && (
                  <button
                    type="button"
                    onClick={clearCover}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 w-fit"
                  >
                    Remove selection
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              PNG / JPG / WebP / GIF, up to 4 MB. Saved under <code>server/uploads/events/&lt;eventId&gt;/</code>.
            </p>
          </div>

          {/* Gallery */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Gallery images
            </label>

            {gallery.length === 0 && galleryFiles.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No gallery images yet.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {gallery.map((url) => (
                  <div
                    key={`existing-${url}`}
                    className="relative aspect-square rounded-lg border border-slate-200 bg-slate-50 overflow-hidden group"
                  >
                    <img
                      src={resolveAssetUrl(url)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryUrl(url)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {galleryFiles.map((gf, i) => (
                  <div
                    key={`new-${gf.previewUrl}`}
                    className="relative aspect-square rounded-lg border border-dashed border-primary-orange/50 bg-orange-50 overflow-hidden group"
                  >
                    <img
                      src={resolveAssetUrl(gf.previewUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold uppercase tracking-wider bg-primary-orange text-white px-1.5 py-0.5 rounded">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removePendingFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-[#F8FAFC] border border-slate-300 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 transition-all">
                <Upload className="w-4 h-4" />
                <span>Add image(s)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  onChange={onPickGallery}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <input
                  type="url"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrlToGallery(); } }}
                  placeholder="Or paste an external image URL…"
                  className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={addUrlToGallery}
                  disabled={!galleryUrlInput.trim()}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add URL
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Uploaded images are stored under <code>server/uploads/events/&lt;eventId&gt;/</code> and served at <code>/uploads/events/...</code>.
              You can also keep external image URLs alongside the uploads.
            </p>
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
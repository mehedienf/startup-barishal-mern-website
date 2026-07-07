import React, { useEffect, useState, useCallback } from "react";
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
  User,
} from "lucide-react";

const COVER_MAX_BYTES = 4 * 1024 * 1024;

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
 *   - coverUpload: optional { fieldName, folderHint, aspectOptions } that, when set, enables a
 *                  cover-image picker in the form, a thumbnail column in the list,
 *                  and POST/PUT/DELETE calls to /api/<resource>/<id>/cover.  The
 *                  cover image URL is stored in the record at `coverUpload.fieldName`.
 *                  If `aspectOptions` is provided, a "Cover ratio" select is rendered
 *                  underneath the picker and the chosen value is saved into
 *                  `coverUpload.aspectField` (default "coverRatio") on the record.
 *                  aspectOptions = [{ value: "4/2", label: "Wide (4:2)", className: "aspect-[4/2]" }, ...]
 *   - photoUpload: optional { fieldName, folderHint, maxMb, endpointSuffix } that, when set,
 *                  enables a round photo picker in the form, a circular avatar column in the
 *                  list, and POST/PUT/DELETE calls to /api/<resource>/<id>/<endpointSuffix>
 *                  (default suffix "photo"). The URL is stored on record.photoUpload.fieldName.
 *                  Use this for resources where the asset is a portrait/avatar (e.g. team
 *                  members) and you want the form preview to render as a circle.
 */
export default function ResourcePage({
  resource,
  title,
  subtitle,
  fields,
  renderItem,
  searchFields = [],
  coverUpload,
  photoUpload,
}) {
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
                    {coverUpload && <th className="p-4 w-24">Cover</th>}
                    {photoUpload && !renderItem && <th className="p-4 w-20">Photo</th>}
                    <th className="p-4">Record</th>
                    <th className="p-4 w-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {coverUpload && (
                        <td className="p-4 align-top">
                          {item[coverUpload.fieldName] ? (
                            <img
                              src={item[coverUpload.fieldName]}
                              alt="cover"
                              className="w-20 h-14 rounded-lg object-cover border border-slate-200 bg-slate-50"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-20 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200">
                              <ImagePlus className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                      )}
                      {photoUpload && !renderItem && (
                        <td className="p-4 align-top">
                          {item[photoUpload.fieldName] ? (
                            <img
                              src={item[photoUpload.fieldName]}
                              alt="photo"
                              className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-50"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                      )}
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
            coverUpload={coverUpload}
            photoUpload={photoUpload}
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

function ResourceForm({ resource, fields, initial, coverUpload, photoUpload, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() => {
    const base = {};
    fields.forEach((f) => {
      if (initial) {
        // `tags` fields are edited as a comma-separated string so typing
        // commas doesn't fight the cursor. Arrays are joined for display.
        if (f.type === "tags") {
          const v = initial[f.name];
          base[f.name] = Array.isArray(v) ? v.join(", ") : (v ?? "");
        } else {
          base[f.name] = initial[f.name] ?? "";
        }
      } else {
        base[f.name] = f.default ?? "";
      }
    });
    return base;
  });
  const [saving, setSaving] = useState(false);

  // Cover ratio state — only used when the page was created with coverUpload
  // AND passed `aspectOptions`. The chosen ratio is persisted on the record
  // so the public site can render the cover at the right aspect class.
  const aspectField = coverUpload?.aspectField || "coverRatio";
  const aspectOptions = coverUpload?.aspectOptions || null;
  const aspectDefault =
    aspectOptions?.find((o) => o.value === (coverUpload?.aspectDefault))?.value ||
    aspectOptions?.[0]?.value || "";
  const initialRatio = aspectOptions
    ? (initial?.[aspectField] && aspectOptions.some((o) => o.value === initial[aspectField])
        ? initial[aspectField]
        : aspectDefault)
    : "";
  const [coverRatio, setCoverRatio] = useState(initialRatio);

  // Cover image state.  Only used when the page was created with coverUpload.
  // `coverFile` is the new picked file; `coverRemoved` is set when the user
  // explicitly clicks Remove (so we DELETE the existing asset, not just stop
  // uploading a new one).
  const initialCover = coverUpload ? initial?.[coverUpload.fieldName] || "" : "";
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initialCover);
  const [coverRemoved, setCoverRemoved] = useState(false);

  // Photo upload state — only used when the page was created with `photoUpload`.
  // Mirrors the cover* state above but routes through /<endpointSuffix> (default
  // "photo") and persists onto the field named by photoUpload.fieldName. The
  // picker renders the preview as a circle because portraits are square.
  const initialPhoto = photoUpload ? initial?.[photoUpload.fieldName] || "" : "";
  const photoMaxBytes = (photoUpload?.maxMb || 4) * 1024 * 1024;
  const photoEndpoint = photoUpload?.endpointSuffix || "photo";
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  // Revoke any preview blob URL we created when the picker is closed.
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
    // We only want this on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const onPickCover = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > COVER_MAX_BYTES) {
      onError("Cover file is larger than 4 MB.");
      e.target.value = "";
      return;
    }
    // Revoke any previous blob preview
    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoved(false);
    e.target.value = "";
  };

  const onRemoveCover = () => {
    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverFile(null);
    setCoverPreview("");
    // Only mark as removed if there was an existing cover — otherwise
    // there is nothing to delete on the server.
    setCoverRemoved(Boolean(initialCover));
  };

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > photoMaxBytes) {
      onError(`Photo file is larger than ${photoUpload.maxMb || 4} MB.`);
      e.target.value = "";
      return;
    }
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoRemoved(false);
    e.target.value = "";
  };

  const onRemovePhoto = () => {
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview("");
    setPhotoRemoved(Boolean(initialPhoto));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = initial ? `/api/${resource}/${initial.id}` : `/api/${resource}`;
      const method = initial ? "PUT" : "POST";
      // `tags` fields are stored as plain strings in the form (so commas
      // type naturally without the cursor jumping). Convert to an array
      // right before sending.
      const payload = {};
      fields.forEach((f) => {
        if (f.type === "tags") {
          const v = form[f.name];
          payload[f.name] = (typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          payload[f.name] = form[f.name];
        }
      });
      // Persist the chosen cover ratio (if the page is configured for it).
      if (coverUpload && aspectOptions) {
        payload[aspectField] = coverRatio || aspectDefault;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        onError(body.error || "Save failed.");
        return;
      }
      let record = body.data || body;

      // Cover image handling — only when this resource supports it.
      if (coverUpload && record && record.id) {
        // 1) Delete the existing cover first if user removed it.
        if (coverRemoved && initialCover && !coverFile) {
          const dr = await fetch(`/api/${resource}/${record.id}/cover`, { method: "DELETE" });
          const drBody = await dr.json().catch(() => ({}));
          if (!dr.ok) {
            onError(drBody.error || "Failed to remove cover image.");
            return;
          }
          record = drBody.data || record;
        }
        // 2) Upload the new cover file (replace).
        if (coverFile) {
          const fd = new FormData();
          fd.append("cover", coverFile);
          const cr = await fetch(`/api/${resource}/${record.id}/cover`, {
            method: "PUT",
            body: fd,
          });
          const crBody = await cr.json().catch(() => ({}));
          if (!cr.ok) {
            onError(crBody.error || "Cover upload failed.");
            return;
          }
          record = crBody.data || record;
        }
        // 3) Re-fetch the authoritative record so the list shows the
        //    server's current coverImage URL (and updatedAt).
        const refetch = await fetch(`/api/${resource}/${record.id}`);
        if (refetch.ok) record = await refetch.json();
      }

      // Photo upload stage — only when this resource supports it.
      // Mirrors the cover pipeline: explicit remove first, then upload.
      if (photoUpload && record && record.id) {
        if (photoRemoved && initialPhoto && !photoFile) {
          const dr = await fetch(`/api/${resource}/${record.id}/${photoEndpoint}`, { method: "DELETE" });
          const drBody = await dr.json().catch(() => ({}));
          if (!dr.ok) {
            onError(drBody.error || "Failed to remove photo.");
            return;
          }
          record = drBody.data || record;
        }
        if (photoFile) {
          const fd = new FormData();
          fd.append("photo", photoFile);
          const pr = await fetch(`/api/${resource}/${record.id}/${photoEndpoint}`, {
            method: "PUT",
            body: fd,
          });
          const prBody = await pr.json().catch(() => ({}));
          if (!pr.ok) {
            onError(prBody.error || "Photo upload failed.");
            return;
          }
          record = prBody.data || record;
        }
        const refetchPhoto = await fetch(`/api/${resource}/${record.id}`);
        if (refetchPhoto.ok) record = await refetchPhoto.json();
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
      <form onSubmit={submit} className="bg-white rounded-2xl max-w-[640px] w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-2xl">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-xl font-bold text-secondary-blue">
            {initial ? "Edit record" : "New record"}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col gap-4">            {/* Cover image picker (only when coverUpload config is set). */}
            {coverUpload && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Cover image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
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
                      <span>
                        {coverFile
                          ? "Change file"
                          : coverPreview
                            ? "Replace"
                            : "Upload cover"}
                      </span>
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
                        onClick={onRemoveCover}
                        className="text-xs font-bold text-slate-500 hover:text-red-600 w-fit"
                      >
                        Remove cover
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  PNG / JPG / WebP / GIF, up to 4&nbsp;MB. Saved under{" "}
                  <code>
                    server/uploads/{coverUpload.folderHint || resource}/&lt;id&gt;/
                  </code>.
                </p>

                {/* Cover ratio (only when the page was configured with
                    aspectOptions). Lets admins pick how the cover frames on
                    the public site without having to crop the image. */}
                {aspectOptions && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Cover ratio
                    </label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        value={coverRatio}
                        onChange={(e) => setCoverRatio(e.target.value)}
                        className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                      >
                        {aspectOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <span className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                        Preview:
                        <span
                          className={
                            "inline-block w-20 bg-slate-100 border border-slate-200 rounded-md overflow-hidden align-middle " +
                            (aspectOptions.find((o) => o.value === coverRatio)?.className || "aspect-[4/2]")
                          }
                        >
                          {coverPreview && (
                            <img
                              src={coverPreview}
                              alt="ratio preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Photo upload picker (only when photoUpload config is set). */}
            {photoUpload && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="photo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-slate-300" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-[#F8FAFC] border border-slate-300 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 transition-all w-fit">
                      <Upload className="w-4 h-4" />
                      <span>
                        {photoFile
                          ? "Change file"
                          : photoPreview
                            ? "Replace"
                            : "Upload photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={onPickPhoto}
                        className="hidden"
                      />
                    </label>
                    {(photoFile || photoPreview) && (
                      <button
                        type="button"
                        onClick={onRemovePhoto}
                        className="text-xs font-bold text-slate-500 hover:text-red-600 w-fit"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  PNG / JPG / WebP / GIF, up to {photoUpload.maxMb || 4}&nbsp;MB. Saved under{" "}
                  <code>
                    server/uploads/{photoUpload.folderHint || resource}/&lt;id&gt;/
                  </code>.
                </p>
              </div>
            )}
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
                  value={typeof form[f.name] === "string" ? form[f.name] : ""}
                  onChange={(e) => setField(f.name, e.target.value)}
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
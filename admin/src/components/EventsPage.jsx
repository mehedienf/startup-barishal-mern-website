import React from "react";
import ResourcePage from "./ResourcePage.jsx";

const FIELDS = [
  { name: "title",       label: "Event Title",  type: "text",     required: true, placeholder: "Founder Mixer – August" },
  { name: "date",        label: "Date",         type: "date",     required: true },
  { name: "location",    label: "Location",     type: "text",     required: true, placeholder: "Barishal Innovation Hub" },
  { name: "description", label: "Description",  type: "textarea", required: true, rows: 5, placeholder: "What attendees will learn, who should come…" },
  { name: "coverImage",  label: "Cover Image URL", type: "url",                   placeholder: "https://…" },
  { name: "status",      label: "Status",       type: "select",   options: ["upcoming", "past", "draft"], default: "upcoming" },
  { name: "gallery",     label: "Gallery (comma-separated URLs)", type: "tags", placeholder: "https://a.jpg, https://b.jpg" },
];

const STATUS_STYLE = {
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  past:     "bg-slate-100 text-slate-600 border-slate-200",
  draft:    "bg-amber-50 text-amber-700 border-amber-200",
};

export default function EventsPage() {
  return (
    <ResourcePage
      resource="events"
      title="Events"
      subtitle="Upcoming, past, or drafts. Cover image shows on the public events card."
      fields={FIELDS}
      searchFields={["title", "location"]}
      renderItem={(item) => (
        <div className="flex items-start gap-3">
          {item.coverImage ? (
            <img src={item.coverImage} alt={item.title} className="w-16 h-12 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">📅</div>
          )}
          <div>
            <p className="font-bold text-[#191c1e]">{item.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.date ? new Date(item.date).toLocaleDateString() : "No date"} · {item.location || "—"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLE[item.status] || STATUS_STYLE.upcoming}`}>
                {item.status || "upcoming"}
              </span>
              <span className="text-[10px] text-slate-400">{(item.gallery || []).length} gallery</span>
            </div>
          </div>
        </div>
      )}
    />
  );
}
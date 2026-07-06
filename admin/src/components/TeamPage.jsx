import React from "react";
import ResourcePage from "./ResourcePage.jsx";

const FIELDS = [
  { name: "name",        label: "Name",          type: "text",     required: true, placeholder: "Jane Doe" },
  { name: "role",        label: "Role / Title",  type: "text",     required: true, placeholder: "Programme Director" },
  { name: "bio",         label: "Short Bio",     type: "textarea", rows: 3,        placeholder: "1–2 lines shown on the card" },
  { name: "photoUrl",    label: "Photo URL",     type: "url",                       placeholder: "https://…" },
  { name: "linkedinUrl", label: "LinkedIn URL",  type: "url",                       placeholder: "https://linkedin.com/in/…" },
  { name: "order",       label: "Display Order", type: "number",   default: 0 },
];

export default function TeamPage() {
  return (
    <ResourcePage
      resource="teamMembers"
      title="Team Members"
      subtitle="Drag-and-drop via display order. Photo URL is loaded directly on the public site."
      fields={FIELDS}
      searchFields={["name", "role"]}
      renderItem={(item) => (
        <div className="flex items-start gap-3">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt={item.name} className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-50 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">{(item.name || "?").charAt(0)}</div>
          )}
          <div>
            <p className="font-bold text-[#191c1e]">{item.name}</p>
            <p className="text-xs text-primary-orange font-semibold uppercase tracking-wider">{item.role}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md line-clamp-2">{item.bio || "—"}</p>
          </div>
        </div>
      )}
    />
  );
}
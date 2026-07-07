import React from "react";
import ResourcePage from "./ResourcePage.jsx";

const FIELDS = [
  { name: "name",        label: "Name",          type: "text",     required: true, placeholder: "Jane Doe" },
  { name: "role",        label: "Role / Title",  type: "text",     required: true, placeholder: "Programme Director" },
  { name: "bio",         label: "Short Bio",     type: "textarea", rows: 3,        placeholder: "1–2 lines shown on the card" },
  // photoUrl is no longer edited as a text field — the photo picker writes
  // back to this field on save. See `photoUpload` below.
  { name: "email",       label: "Email",         type: "email",                    placeholder: "name@example.com" },
  { name: "phone",       label: "Phone Number",  type: "tel",                      placeholder: "+880 1XXX-XXXXXX" },
  { name: "linkedinUrl", label: "LinkedIn URL",  type: "url",                       placeholder: "https://linkedin.com/in/…" },
  { name: "facebookUrl", label: "Facebook URL",  type: "url",                       placeholder: "https://facebook.com/…" },
  { name: "twitterUrl",  label: "X (Twitter) URL", type: "url",                     placeholder: "https://x.com/…" },
  { name: "order",       label: "Display Order", type: "number",   default: 0 },
];

export default function TeamPage() {
  return (
    <ResourcePage
      resource="teamMembers"
      title="Team Members"
      subtitle="Drag-and-drop via display order. Profile photos upload to server/uploads/teams/."
      fields={FIELDS}
      searchFields={["name", "role"]}
      // Enables the round photo picker in the form, a circular avatar column
      // in the list, and PUT /api/teamMembers/:id/photo on save. Existing
      // remote photoUrl values stay intact unless the admin replaces them.
      photoUpload={{
        fieldName: "photoUrl",
        folderHint: "teams",
        maxMb: 4,
        endpointSuffix: "photo",
      }}
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
import React from "react";
import { Rocket } from "lucide-react";
import { resolveAssetUrl } from "../lib/api.js";
import ResourcePage from "./ResourcePage.jsx";

// Mentored startups / apps shown on the public home page in the
// "Our initiatives (Startup we mentored)" section. Schema mirrors the
// server's POST handler in `server/src/routes/initiatives.js`:
//
//   name        — required display name
//   website     — link target (optional)
//   tagline     — single-line description shown under the name
//   category    — e.g. "Fintech", "Healthtech" (optional)
//   description — long-form blurb (optional)
//   order       — controls display order in the public grid
//
// Logo upload rides through ResourcePage's `photoUpload` slot using
// endpoint suffix "logo" → `PUT /api/initiatives/:id/logo`.
const FIELDS = [
  { name: "name",        label: "Startup / App name", type: "text",     required: true,  placeholder: "e.g. Chaldal" },
  { name: "website",     label: "Website URL",        type: "url",                       placeholder: "https://…" },
  { name: "tagline",     label: "Tagline",            type: "text",                     placeholder: "One line about what they do", rows: undefined },
  { name: "category",    label: "Category",           type: "text",                     placeholder: "e.g. Fintech" },
  { name: "description", label: "Description",        type: "textarea", rows: 3,        placeholder: "Longer blurb (optional)" },
  { name: "order",       label: "Display order",      type: "number",                   placeholder: "1, 2, 3…" },
];

export default function InitiativesPage() {
  return (
    <ResourcePage
      resource="initiatives"
      title="Our Initiatives"
      subtitle="Mentored startups and apps shown on the home page above the partner strip."
      fields={FIELDS}
      searchFields={["name", "tagline", "category"]}
      photoUpload={{
        fieldName: "logoUrl",
        folderHint: "initiatives",
        maxMb: 4,
        endpointSuffix: "logo",
        shape: "square",
      }}
      renderItem={(item) => (
        <div className="flex items-start gap-3">
          {item.logoUrl ? (
            <img
              src={resolveAssetUrl(item.logoUrl)}
              alt={item.name}
              className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-slate-50 shrink-0"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-[#191c1e] truncate">{item.name}</p>
            {item.tagline ? (
              <p className="text-xs text-slate-500 line-clamp-1">{item.tagline}</p>
            ) : item.website ? (
              <a
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-secondary-blue hover:underline break-all"
              >
                {item.website}
              </a>
            ) : (
              <p className="text-xs text-slate-400">—</p>
            )}
          </div>
        </div>
      )}
    />
  );
}
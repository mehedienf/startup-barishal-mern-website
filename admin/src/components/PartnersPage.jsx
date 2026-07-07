import React from "react";
import { Handshake } from "lucide-react";
import ResourcePage from "./ResourcePage.jsx";

const FIELDS = [
  { name: "name",    label: "Partner name",  type: "text",   required: true,  placeholder: "e.g. BRAC Bank" },
  { name: "website", label: "Website URL",   type: "url",    placeholder: "https://…" },
  { name: "order",   label: "Display order", type: "number", placeholder: "1, 2, 3…" },
];

export default function PartnersPage() {
  return (
    <ResourcePage
      resource="partners"
      title="Partners & Sponsors"
      subtitle="Logos uploaded here will scroll across the homepage and about-page partner strips."
      fields={FIELDS}
      searchFields={["name", "website"]}
      // Enables the square logo picker in the form, a square avatar column
      // in the list, and PUT /api/partners/:id/logo on save. Existing remote
      // logoUrl values stay intact unless the admin replaces them.
      photoUpload={{
        fieldName: "logoUrl",
        folderHint: "partners",
        maxMb: 4,
        endpointSuffix: "logo",
        shape: "square",
      }}
      renderItem={(item) => (
        <div className="flex items-start gap-3">
          {item.logoUrl ? (
            <img src={item.logoUrl} alt={item.name} className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-slate-50 shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="font-bold text-[#191c1e]">{item.name}</p>
            {item.website ? (
              <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary-blue hover:underline break-all">
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

import React from "react";
import ResourcePage from "./ResourcePage.jsx";

const FIELDS = [
  { name: "title",       label: "Programme Title",  type: "text",     required: true, placeholder: "AgriTech Pre-Seed Cohort" },
  { name: "summary",     label: "Summary",          type: "textarea", required: true, rows: 3, placeholder: "One paragraph that hooks the reader" },
  { name: "duration",    label: "Duration",         type: "text",     required: true, placeholder: "12 weeks" },
  { name: "benefits",    label: "Benefits (comma-separated)", type: "tags", placeholder: "Mentorship, Office space, ৳2 Lakh seed" },
  { name: "eligibility", label: "Eligibility",      type: "textarea", rows: 4,        placeholder: "Who can apply…" },
];

export default function ProgramsPage() {
  return (
    <ResourcePage
      resource="incubationPrograms"
      title="Incubation Programs"
      subtitle="Each card on the public site pulls title, duration, summary, and benefits from here."
      fields={FIELDS}
      searchFields={["title", "summary"]}
      renderItem={(item) => (
        <div>
          <p className="font-bold text-[#191c1e]">{item.title}</p>
          <p className="text-xs text-primary-orange font-semibold uppercase tracking-wider mt-0.5">{item.duration}</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xl line-clamp-2">{item.summary}</p>
          {(item.benefits || []).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.benefits.slice(0, 4).map((b, i) => (
                <span key={i} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{b}</span>
              ))}
              {item.benefits.length > 4 && (
                <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5">+{item.benefits.length - 4} more</span>
              )}
            </div>
          )}
        </div>
      )}
    />
  );
}
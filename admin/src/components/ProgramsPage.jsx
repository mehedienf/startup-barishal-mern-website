import React from "react";
import ResourcePage from "./ResourcePage.jsx";

const FIELDS = [
  { name: "title",       label: "Programme Title",  type: "text",     required: true, placeholder: "AgriTech Pre-Seed Cohort" },
  { name: "summary",     label: "Summary",          type: "textarea", required: true, rows: 3, placeholder: "One paragraph that hooks the reader" },
  { name: "duration",    label: "Duration",         type: "text",     required: true, placeholder: "12 weeks" },
  { name: "benefits",    label: "Benefits (comma-separated)", type: "tags", placeholder: "Mentorship, Office space, ৳2 Lakh seed" },
  { name: "eligibility", label: "Eligibility",      type: "textarea", rows: 4,        placeholder: "Who can apply…" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["live", "closed"],
  },
  {
    name: "applyButtonLabel",
    label: "Apply Button Label (Optional)",
    type: "text",
    placeholder: "Start Application",
    required: false,
  },
  {
    name: "applyButtonLink",
    label: "Apply Button Link (optional)",
    type: "text",
    placeholder: "https://forms.gle/… (leave blank to open form inline)",
    required: false,
  },
];

export default function ProgramsPage() {
  return (
    <ResourcePage
        resource="incubationPrograms"
        title="Incubation Programs"
        subtitle="Only one program can be Live at a time — setting another to Live will automatically close the current one."
        fields={FIELDS}
        searchFields={["title", "summary"]}
        coverUpload={{
          fieldName: "coverImage",
          folderHint: "cohorts",
          aspectField: "coverRatio",
          aspectDefault: "4/2",
          aspectOptions: [
            { value: "6/2",  label: "Ultra Wide (6:2)",  className: "aspect-[6/2]" },
            { value: "5/2",  label: "Banner (5:2)",      className: "aspect-[5/2]" },
            { value: "4/2",  label: "Wide (4:2)",        className: "aspect-[4/2]" },
            { value: "16/9", label: "Widescreen (16:9)", className: "aspect-video" },
            { value: "3/2",  label: "Photo (3:2)",       className: "aspect-[3/2]" },
            { value: "1/1",  label: "Square (1:1)",      className: "aspect-square" },
            { value: "21/9", label: "Cinematic (21:9)",  className: "aspect-[21/9]" },
            { value: "2/3",  label: "Portrait (2:3)",    className: "aspect-[2/3]" },
          ],
        }}
      renderItem={(item) => {
        const isLive = item.status === "live";
        return (
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-[#191c1e]">{item.title}</p>
              <span
                className={
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border " +
                  (isLive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200")
                }
              >
                {isLive ? "● Live" : "Closed"}
              </span>
            </div>
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
        );
      }}
    />
  );
}
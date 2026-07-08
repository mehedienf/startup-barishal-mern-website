import React from "react";
import { ImageIcon } from "lucide-react";
import { resolveAssetUrl } from "../lib/api.js";
import ResourcePage from "./ResourcePage.jsx";

/**
 * Admin page for the homepage hero carousel.
 *
 * Each record stores one uploaded image plus optional caption copy.
 * The public client fetches /api/featured and falls back to the bundled
 * hero images when this list is empty, so removing every record leaves
 * the site in a known-good state.
 *
 * Fields:
 *   - title:    small caption shown nowhere on the public site yet, kept
 *               for admin-side labelling.
 *   - altText:  forwarded to the <img alt="..."> on the homepage for a11y.
 *   - order:    lower = earlier in the carousel. Defaults to record count.
 *   - active:   when false, the record stays in the database but is hidden
 *               from /api/featured (the client filters it out client-side
 *               as a safety net).
 */
const FIELDS = [
  {
    name: "title",
    label: "Caption (Required)",
    type: "text",
    placeholder: "Optional label to recognise this image in the admin",
  },
  {
    name: "altText",
    label: "Alt text",
    type: "textarea",
    placeholder: "Describe the photo for screen readers (a short sentence works best)",
    rows: 2,
  },
  {
    name: "order",
    label: "Display order",
    type: "number",
    placeholder: "1, 2, 3…",
  },
];

export default function FeaturedImagesPage() {
  return (
    <ResourcePage
      resource="featured"
      title="Hero Carousel Images"
      subtitle="Upload the photos that rotate through the homepage hero."
      fields={FIELDS}
      searchFields={["title", "altText"]}
      hideSearch
      photoUpload={{
        fieldName: "imageUrl",
        folderHint: "featured",
        maxMb: 5,
        endpointSuffix: "image",
        shape: "square",
      }}
      renderItem={(item) => (
        <div className="flex items-start gap-3">
          {item.imageUrl ? (
            <img
              src={resolveAssetUrl(item.imageUrl)}
              alt={item.altText || item.title || "hero"}
              className="w-24 h-16 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-24 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200 shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-[#191c1e] truncate">
              {item.title || <span className="text-slate-400 font-medium">Untitled</span>}
            </p>
            {item.altText ? (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.altText}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No alt text</p>
            )}
            <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Order #{item.order ?? "—"}</span>
            </div>
          </div>
        </div>
      )}
    />
  );
}
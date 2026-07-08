import React, { useEffect, useState } from "react";
import { apiFetch, resolveAssetUrl } from "../lib/api.js";
import {
  Rocket,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Clock,
  Building,
  Users,
  FileText,
  Loader2,
  Layers,
  Calendar,
  ListChecks,
  Award,
  UserCheck,
  Target,
  X,
} from "lucide-react";

// Maps the cohort's `coverRatio` (chosen in admin) to a Tailwind aspect
// class. Keep in sync with the `aspectOptions` list in
// admin/src/components/ProgramsPage.jsx.
const COVER_RATIO_CLASS = {
  "6/2":  "aspect-[6/2]",
  "5/2":  "aspect-[5/2]",
  "4/2":  "aspect-[4/2]",
  "16/9": "aspect-video",
  "3/2":  "aspect-[3/2]",
  "1/1":  "aspect-square",
  "21/9": "aspect-[21/9]",
  "2/3":  "aspect-[2/3]",
};

export default function IncubationView() {
  const [activeCohort, setActiveCohort] = useState(null);
  const [cohortLoading, setCohortLoading] = useState(true);
  const [cohortMissing, setCohortMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiFetch("/api/incubationPrograms/active");
        if (res.status === 404) {
          if (!cancelled) {
            setActiveCohort(null);
            setCohortMissing(true);
          }
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setActiveCohort(data);
          setCohortMissing(false);
        }
      } catch (err) {
        console.error("Failed to load active cohort:", err);
        if (!cancelled) setCohortMissing(true);
      } finally {
        if (!cancelled) setCohortLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    startupName: "",
    stage: "Idea",
    description: "",
    teamSize: 1
  });
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState("");
  const [cohortStatus, setCohortStatus] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form visibility — the application form starts collapsed. It opens when
  // the user clicks the "Start Application" button under the cohort card,
  // and closes via the close button inside the form. Admins can override
  // the button label and (optionally) point it at an external link.
  const [formOpen, setFormOpen] = useState(false);
  const formPanelRef = React.useRef(null);

  const openForm = () => {
    setFormOpen(true);
    // Wait a tick so the panel mounts, then scroll to it.
    setTimeout(() => {
      formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const applyButtonLabel =
    (activeCohort?.applyButtonLabel && activeCohort.applyButtonLabel.trim()) ||
    "Start Application";
  const applyButtonLink =
    (activeCohort?.applyButtonLink && activeCohort.applyButtonLink.trim()) || "";

  // Lock body scroll while the application overlay is open, and let the
  // user dismiss it with the Escape key.
  useEffect(() => {
    if (!formOpen && !success) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape" && !success) setFormOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [formOpen, success]);

  const closeOverlay = () => {
    setFormOpen(false);
    setSuccess(false);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [id]: id === "teamSize" ? Number(value) : value 
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.startupName || !formData.description) {
      setErrorMessage("Please fill out all required fields marked with *.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await apiFetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setAppId(data.data.id);
        setCohortStatus(data.data);
        // Reset form data
        setFormData({
          fullName: "",
          email: "",
          startupName: "",
          stage: "Idea",
          description: "",
          teamSize: 1
        });
      } else {
        setErrorMessage(data.error || "Cohort submission failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error. Unable to register cohort application with server database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn py-12 md:py-20 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      
      {/* Title Segment */}
      <section className="mb-14 text-center max-w-[800px] mx-auto flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-primary-orange px-4 py-1.5 rounded-full select-none self-center text-xs font-semibold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Cohort: {cohortLoading ? "Loading…" : (activeCohort?.title || "No cohort running")}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-blue mt-2">
          Apply For Cohort Incubation
        </h1>
        <p className="text-[#5a4136]/80 text-base md:text-lg leading-relaxed max-w-[650px] mx-auto">
          Startup incubation programme designed to formulate founder groups, connect matching global investors, and secure structural resource allocations.
        </p>
      </section>

      {/* Live cohort card (single) */}
      <section className="mb-14">
        {/* <div className="text-center flex flex-col gap-2 mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary-blue/10 border border-secondary-blue/20 text-secondary-blue px-4 py-1.5 rounded-full self-center text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>Currently Running</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-blue tracking-tight">
            The cohort open for applications right now
          </h2>
        </div> */}

        {cohortLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 text-primary-orange animate-spin" /></div>
        ) : cohortMissing || !activeCohort ? (
          <div className="max-w-[640px] mx-auto bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-secondary-blue">No cohort is running at the moment</h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              Applications are paused while the next cohort is being prepared. Follow our newsletter or check back soon to apply for the next round.
            </p>
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            {/* Cover image — only rendered when one is uploaded. The aspect
                ratio is read from the cohort record's `coverRatio` so admins
                can switch between wide, square, cinematic, etc. from the
                admin panel without re-uploading. */}
            {activeCohort.coverImage && (
              <div
                className={
                  "relative w-full bg-slate-100 overflow-hidden " +
                  (COVER_RATIO_CLASS[activeCohort.coverRatio] || COVER_RATIO_CLASS["4/2"])
                }
              >
                <img
                  src={resolveAssetUrl(activeCohort.coverImage)}
                  alt={`${activeCohort.title} cover`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
            )}

            {/* Info column */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Programme Title */}
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary-orange">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm shadow-orange-500/30">
                    <Rocket className="w-4 h-4" />
                  </span>
                  Programme Title
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-secondary-blue leading-tight">
                  {activeCohort.title}
                </h3>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-secondary-blue">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/30">
                    <Calendar className="w-4 h-4" />
                  </span>
                  Duration
                </span>
                <p className="text-base md:text-lg font-semibold text-[#191c1e]">
                  {activeCohort.duration || "Self-paced"}
                </p>
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-rose-600">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/30">
                    <FileText className="w-4 h-4" />
                  </span>
                  Programme Summary
                </span>
                <p className="text-base text-[#5a4136]/80 leading-relaxed">
                  {activeCohort.summary}
                </p>
              </div>

              {/* Benefits */}
              {activeCohort.benefits && activeCohort.benefits.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
                  <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30">
                      <ListChecks className="w-4 h-4" />
                    </span>
                    What You Get — Member Benefits
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                    {activeCohort.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Eligibility */}
              {activeCohort.eligibility && (
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-5">
                  <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-violet-700">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm shadow-violet-500/30">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    Who Can Apply — Eligibility
                  </span>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {activeCohort.eligibility}
                  </p>
                </div>
              )}

              {/* Footer meta */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/30">
                    <Award className="w-3.5 h-3.5" />
                  </span>
                  Status: <span className="text-emerald-600">Accepting Applications</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/30">
                    <Users className="w-3.5 h-3.5" />
                  </span>
                  Cohort Type: <span className="text-secondary-blue">Open Cohort</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Information blocks — full-width balanced layout. The form is now an
          overlay, so these two cards are centered on their own row instead
          of being squeezed into a 5-col sidebar. */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Member Cohort Benefits — col 8 */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-5">
          <h3 className="text-xl md:text-2xl font-bold text-secondary-blue">Member Cohort Benefits</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-primary-orange shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#191c1e]">Tech Park Workspace</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Physical co-working desk allocation on the 6th floor Software Technology Park with clean high-speed utilities and meeting rooms.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-secondary-blue shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#191c1e]">Investor Pitch Matching</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Personal coordination and practice modules leading to a closed-door Demo Day showcasing to Bangladeshi matching angel networks.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#191c1e]">Structural Support Units</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Corporate registration assistance, free AWS/Google Cloud computing credits, legal advisement, and senior developer support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility — col 4, balanced to the right of the benefits card */}
        <div className="md:col-span-4 bg-slate-50 rounded-2xl border border-slate-200/60 p-6 h-full">
          <h4 className="text-sm font-bold text-secondary-blue flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-4 h-4 text-primary-orange" />
            <span>Who is eligible?</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Early-stage entrepreneurs, students, software engineers, and founders located in Barishal division or building solutions tailored for the southern markets of Bangladesh.
          </p>
        </div>
      </section>

      {/* Start-Application call-to-action — pinned to the very bottom of the
          page after the info blocks. By default it opens the inline form on
          click, but if the cohort record has `applyButtonLink` set in the
          admin panel, the button becomes an external <a> instead. */}
      {activeCohort && (
        <section className="mt-12 mb-2 flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
            Ready to build with us?
          </p>
          {applyButtonLink ? (
            <a
              href={applyButtonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-4 px-10 font-bold text-sm tracking-wide flex items-center justify-center gap-2 group"
            >
              <span>{applyButtonLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <button
              type="button"
              onClick={openForm}
              className="btn-primary py-4 px-10 font-bold text-sm tracking-wide flex items-center justify-center gap-2 group"
            >
              <span>{applyButtonLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </section>
      )}

      {/* ============================================================
          Overlay — Application Form (rendered at page root so it can sit
          above everything via fixed positioning).
          ============================================================ */}
      {(formOpen || success) && (
        <div
          ref={formPanelRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            // Click on the dim backdrop (but not on the panel itself)
            // dismisses the overlay.
            if (e.target === e.currentTarget && !success) setFormOpen(false);
          }}
        >
          <div className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xl animate-scaleIn">
            <button
              type="button"
              onClick={closeOverlay}
              aria-label="Close application form"
              className="absolute top-3 right-3 z-10 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {success ? (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 self-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-secondary-blue">Application Submitted!</h3>
                  <p className="text-slate-600 text-sm mt-1.5">
                    Your startup information is registered on the Barishal database. Here is your tracking profile:
                  </p>
                </div>

                {cohortStatus && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col gap-3 text-sm">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-400 font-semibold text-xs tracking-wider uppercase">Application Tracking ID:</span>
                      <span className="font-mono text-xs text-primary-orange font-bold uppercase">{cohortStatus.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Startup Project Name:</span>
                      <span className="font-bold text-[#191c1e]">{cohortStatus.startupName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proposed Team Lead:</span>
                      <span className="font-medium text-[#191c1e]">{cohortStatus.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Startup Stage:</span>
                      <span className="font-semibold text-secondary-blue">{cohortStatus.stage}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500">Submission Status:</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 select-none animate-pulse">
                        {cohortStatus.status}
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-center text-slate-500 leading-relaxed px-4">
                  We will review your startup profile and contact with you soon.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setFormOpen(true);
                    }}
                    className="bg-[#065ca9]/10 hover:bg-[#065ca9]/15 text-secondary-blue py-3 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all px-8"
                  >
                    Submit another application
                  </button>
                  <button
                    onClick={closeOverlay}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all px-8"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                <h2 className="text-2xl font-bold text-secondary-blue mb-1">Incubation Application</h2>
                <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider mb-2">Cohort Enrollment Form</p>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-800 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="fullName">
                    Proposed Founder / Team Lead <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    placeholder="Jane Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="email">
                    Preferred Contact Email <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="jane@greeninnovations.bd"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="startupName">
                      Startup Name <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      id="startupName"
                      required
                      placeholder="GreenInnovations Barishal"
                      value={formData.startupName}
                      onChange={handleInputChange}
                      className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="stage">Current Phase</label>
                    <select
                      id="stage"
                      value={formData.stage}
                      onChange={handleInputChange}
                      className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all appearance-none cursor-pointer font-medium"
                      disabled={loading}
                    >
                      <option value="Idea">Idea Stage</option>
                      <option value="Prototype">Active Prototype</option>
                      <option value="Early Traction">Early Market Traction</option>
                      <option value="Scaling">Scaling Phase</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="teamSize">Active Core Team Size</label>
                    <input
                      type="number"
                      id="teamSize"
                      min={1}
                      max={12}
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                      disabled={loading}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-6 leading-tight">
                    For teams larger than 12, additional co-working seats will require approval on Demo Day.
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="description">
                    Startup Pitch Summary <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    placeholder="Tell us what problem your company solves, who your target customer is in Barishal, and how your team executes."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all resize-none"
                    disabled={loading}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-4 px-8 font-bold text-sm tracking-wide flex items-center justify-center gap-2 group w-full sm:w-auto self-stretch sm:self-start disabled:opacity-50"
                >
                  <span>{loading ? "Registering startup..." : "Submit Startup Application"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

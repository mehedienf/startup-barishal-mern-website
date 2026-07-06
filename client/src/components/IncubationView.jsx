import React, { useState, useEffect } from "react";
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
  Layers
} from "lucide-react";

export default function IncubationView() {
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/incubationPrograms");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setPrograms(data);
      } catch (err) {
        console.error("Failed to load programs:", err);
      } finally {
        if (!cancelled) setProgramsLoading(false);
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
      const res = await fetch("/api/applications", {
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
          <span>Active Cohort: June 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-blue mt-2">
          Apply For Cohort Incubation
        </h1>
        <p className="text-[#5a4136]/80 text-base md:text-lg leading-relaxed max-w-[650px] mx-auto">
          Startup incubation programme designed to formulate founder groups, connect matching global investors, and secure structural resource allocations.
        </p>
      </section>

      {/* Active Programs from API */}
      <section className="mb-14">
        <div className="text-center flex flex-col gap-2 mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary-blue/10 border border-secondary-blue/20 text-secondary-blue px-4 py-1.5 rounded-full self-center text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>Active Programs</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-blue tracking-tight">
            Pick the program that fits your stage
          </h2>
        </div>

        {programsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 text-primary-orange animate-spin" /></div>
        ) : programs.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6">No programs published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-orange bg-primary-orange/10 px-2.5 py-1 rounded-full">
                    {p.duration || "Self-paced"}
                  </span>
                  <Rocket className="w-5 h-5 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-secondary-blue leading-tight">{p.title}</h3>
                <p className="text-sm text-[#5a4136]/80 leading-relaxed">{p.summary}</p>

                {p.benefits && p.benefits.length > 0 && (
                  <ul className="flex flex-col gap-1.5 text-xs text-slate-600">
                    {p.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {p.eligibility && (
                  <div className="border-t border-slate-100 pt-3 mt-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Eligibility</span>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{p.eligibility}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Grid: Instructions vs Active Form */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Why Join Cohort / Information Blocks (Col 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-5">
            <h3 className="text-xl md:text-2xl font-bold text-secondary-blue">Member Cohort Benefits</h3>
            
            <div className="flex flex-col gap-4">
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
            
            <div className="border-t border-slate-100 pt-4 flex gap-2 items-center text-slate-400">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Cohort Period: 12 Weeks (Semi-remote layout)</span>
            </div>
          </div>

          {/* Incubation FAQ bubble */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-6">
            <h4 className="text-sm font-bold text-secondary-blue flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-4 h-4 text-primary-orange" />
              <span>Who is eligible?</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Early-stage entrepreneurs, students, software engineers, and founders located in Barishal division or building solutions tailored for the southern markets of Bangladesh.
            </p>
          </div>
        </div>

        {/* Application Form panel / Receipts panel (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-205 p-6 md:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
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

              <button 
                onClick={() => setSuccess(false)}
                className="bg-[#065ca9]/10 hover:bg-[#065ca9]/15 text-secondary-blue py-3 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all self-center px-12"
              >
                Submit another application
              </button>
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

      </section>

    </div>
  );
}

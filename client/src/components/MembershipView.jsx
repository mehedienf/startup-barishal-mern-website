import React, { useState } from "react";
import {
  Rocket,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  Lightbulb,
  Briefcase,
  GraduationCap,
} from "lucide-react";

// Curated interest buckets — admins see these as tags in the inbox so they
// can route the membership to the right team.
const INTEREST_OPTIONS = [
  { id: "mentorship", label: "1:1 mentorship", icon: Lightbulb },
  { id: "cohort", label: "Cohort / incubation program", icon: Rocket },
  { id: "community", label: "Founder community", icon: Users },
  { id: "workspace", label: "Co-working / desk space", icon: Briefcase },
  { id: "learning", label: "Workshops & learning", icon: GraduationCap },
];

export default function MembershipView() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    interests: [],
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const toggleInterest = (id) => {
    setFormData((prev) => {
      const has = prev.interests.includes(id);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((x) => x !== id)
          : [...prev.interests, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Full name, email, and message are required.");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessData(null);
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccessData(result.data);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          organization: "",
          role: "",
          interests: [],
          message: "",
        });
      } else {
        setErrorMsg(result.error || "Failed to submit membership application.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to reach the MERN Express API server. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn py-12 md:py-20 max-w-[960px] mx-auto px-5 md:px-[64px]">
      {/* Hero */}
      <section className="mb-12 text-center max-w-[720px] mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary-orange/10 text-primary-orange px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
          <Rocket className="w-3.5 h-3.5" />
          Membership
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-blue mb-4">
          Join the Startup Barishal ecosystem
        </h1>
        <p className="text-base md:text-lg text-[#5a4136]/80 leading-relaxed">
          Apply for membership and unlock mentorship, workspace credits, cohort
          eligibility, and a community of founders building from southern
          Bangladesh. Tell us a bit about you — we read every submission and
          reply within five business days.
        </p>
      </section>

      {/* Form Card */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.02)] relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-blue/5 rounded-full filter blur-[48px] translate-x-16 -translate-y-16 pointer-events-none" />

        {/* Success card */}
        {successData && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-emerald-900 flex gap-3 mb-8 animate-fadeIn">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-base">
                Your membership application is in. Thank you, {successData.fullName.split(" ")[0]}!
              </p>
              <p className="text-sm text-emerald-900/80 mt-1">
                We've logged it as <strong>{successData.id}</strong>. The
                Startup Barishal team reviews every submission and replies to
                {" "}<strong>{successData.email}</strong> within five business days.
              </p>
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="mt-3 text-xs font-bold uppercase tracking-widest text-emerald-700 hover:text-emerald-900"
              >
                Submit another application
              </button>
            </div>
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 flex gap-3 mb-6 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-5">
          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                required
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Contact + org */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="phone">
                Phone (optional)
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="+880 1XXX-XXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="organization">
                Organization / Startup
              </label>
              <input
                type="text"
                id="organization"
                placeholder="Independent / Acme Inc."
                value={formData.organization}
                onChange={handleChange}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="role">
              Your role
            </label>
            <input
              type="text"
              id="role"
              placeholder="Founder / Student / Designer / …"
              value={formData.role}
              onChange={handleChange}
              className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
              disabled={isSubmitting}
            />
          </div>

          {/* Interests */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              What are you most interested in?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTEREST_OPTIONS.map(({ id, label, icon: Icon }) => {
                const active = formData.interests.includes(id);
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => toggleInterest(id)}
                    disabled={isSubmitting}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                      active
                        ? "border-primary-orange bg-primary-orange/10 text-secondary-blue"
                        : "border-slate-200 bg-[#F8FAFC] text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? "bg-primary-orange text-white" : "bg-white text-slate-400 border border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">
              Select one or more — admins use these tags to route your
              application.
            </p>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="message">
              Tell us about you and what you want to build <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              required
              rows={5}
              placeholder="What are you working on? What kind of support would be most useful?"
              value={formData.message}
              onChange={handleChange}
              className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all resize-none"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary py-3.5 px-8 font-bold text-sm tracking-wide flex items-center justify-center gap-2 group w-full sm:w-auto self-stretch sm:self-start disabled:opacity-50"
          >
            <span>{isSubmitting ? "Submitting…" : "Apply for Membership"}</span>
            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-xs text-slate-400 mt-1">
            By applying you agree to receive membership-related emails from
            Startup Barishal. We never share contact details.
          </p>
        </form>
      </section>
    </div>
  );
}

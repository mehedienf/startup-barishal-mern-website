import React, { useState } from "react";
import { 
  Send, 
  MapPin, 
  Mail, 
  Phone, 
  Navigation,
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export default function ContactView() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      setErrorMsg("Email address and Message are required field aggregates *.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setResponseMsg("");
    setSuccessData(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        setSuccessData(result.data);
        setResponseMsg(result.message);
        // Clear form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "General Inquiry",
          message: ""
        });
      } else {
        setErrorMsg(result.error || "Failed to submit message.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to reach the MERN Express API server. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn py-12 md:py-20 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      
      {/* Editorial Hero Title */}
      <section className="mb-14 max-w-[700px]">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-blue mb-4">
          Let's Connect
        </h1>
        <p className="text-base md:text-lg text-[#5a4136]/80 leading-relaxed">
          Whether you have a question about our incubation program, need mentoring, or want to explore partnerships, we're here to help foster your entrepreneurial journey.
        </p>
      </section>

      {/* Contact Bento Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Form Container (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] relative overflow-hidden">
          {/* Transparent color blur bubble background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-orange/5 rounded-full filter blur-[40px] translate-x-12 -translate-y-12 pointer-events-none"></div>
          
          <h2 className="text-2xl font-bold text-secondary-blue mb-6 relative z-10">Send us a message</h2>
          
          {/* Notifications Success panel */}
          {successData && (
            <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-emerald-800 flex gap-3 mb-6 animate-fadeIn">
              <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm leading-tight text-emerald-950">{responseMsg}</p>
                <div className="text-xs text-slate-500 mt-2 p-3 bg-white/70 rounded-lg border border-slate-100">
                  <p><strong>Ref Code:</strong> {successData.id}</p>
                  <p><strong>Sent To:</strong> {successData.email}</p>
                  <p className="line-clamp-2"><strong>Message snippet:</strong> {successData.message}</p>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 flex gap-3 mb-6 animate-fadeIn">
              <AlertCircle className="w-5.5 h-5.5 text-red-650 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold leading-tight">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="relative z-10 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  placeholder="Jane" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  placeholder="Doe" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="email">
                Email Address <span className="text-red-500 font-bold">*</span>
              </label>
              <input 
                type="email" 
                id="email" 
                required
                placeholder="jane@example.com" 
                value={formData.email}
                onChange={handleInputChange}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="subject">Subject</label>
              <select 
                id="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all appearance-none cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="Incubation Program">Incubation Program</option>
                <option value="Mentorship">Mentorship</option>
                <option value="Partnership">Partnership</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="message">
                Message <span className="text-red-500 font-bold">*</span>
              </label>
              <textarea 
                id="message" 
                required
                rows={5}
                placeholder="How can we help your team today?" 
                value={formData.message}
                onChange={handleInputChange}
                className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all resize-none"
                disabled={isSubmitting}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary py-3.5 px-8 font-bold text-sm tracking-wide flex items-center justify-center gap-2 group w-full sm:w-auto self-stretch sm:self-start disabled:opacity-50"
            >
              <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Support Cards & Map Column (Col 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* Direct Address & Phone card panel */}
          <div className="bg-secondary-blue text-white rounded-2xl p-6 md:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <h3 className="text-xl md:text-2xl font-bold text-white">Contact Information</h3>
            
            <ul className="flex flex-col gap-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-primary-orange">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-extrabold text-white/70 mb-1">Office Address</h4>
                  <p className="text-sm md:text-base leading-relaxed text-slate-100">
                    6th Floor, Software Technology Park,<br />
                    Barishal, Bangladesh
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-primary-orange">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-extrabold text-white/70 mb-1">Email Us</h4>
                  <a className="text-sm md:text-base text-slate-100 hover:text-primary-orange transition-colors underline" href="mailto:startupbarishal@gmail.com">
                    startupbarishal@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-primary-orange">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-extrabold text-white/70 mb-1">Call Us</h4>
                  <a className="text-sm md:text-base text-slate-100 hover:text-primary-orange transition-colors font-medium underline" href="tel:+8801838765607">
                    +8801838-765607
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Map Location Card image with direction navigation */}
          <div className="bg-white rounded-2xl border border-slate-205 overflow-hidden shadow-md flex flex-col relative group h-[200px] min-[400px]:h-[240px] sm:h-[270px]">
            <img 
              alt="Vector map location coordinates representation of Barishal city center software facility" 
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdAaYIT0ccS-RJcwDYTh2aoqQxIUIMQX4oO5xTMLAXtC3tB4nATFEi7TAutrQ_9S6MoVcCDtHMXCckpX-h0ZESqaSuJ-cScp3uS_3sq8cM6gLVKB5h9IQmtgonIJkFuN-g2NILnVcd0pomPf4MdBD0a6Q8rpx5iv4w5rPyQP9o49UfrmYeV2HXCzJhkJF7JXW7RYWTLOSc2gcqVM9hivARnWnoVvig8bCdJS-JM3vCg8pQcB1_42ZDFPEfTF5lRcb94jA62cM1XDc"
            />
            {/* Ambient Map gradient overlay matching HTML */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent flex items-end p-5">
              <a 
                href="https://maps.google.com/?q=Software+Technology+Park+Barishal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white hover:bg-slate-50 text-secondary-blue hover:text-primary-orange border border-slate-200/80 rounded-xl px-5 py-3 shadow flex items-center gap-2 text-xs font-bold transition-all hover:translate-y-[-1.5px]"
              >
                <Navigation className="w-4 h-4 fill-secondary-blue/10" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}

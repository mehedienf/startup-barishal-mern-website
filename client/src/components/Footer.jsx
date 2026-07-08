import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import logoWatermark from "../assets/startup-barishal-logo-2.png";
import logoPrimary from "../assets/startupbarishal-logo.png";

const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/startupbarishal" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/startupbarishal" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/startupbarishal" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@startupbarishal" },
];

export default function Footer({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorStatus("Please provide a valid email address.");
      return;
    }

    setSubmitting(true);
    setErrorStatus("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        setErrorStatus(data.error || "Subscription failure.");
      }
    } catch (err) {
      console.error(err);
      setErrorStatus("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative pt-16 pb-8 bg-white/80 backdrop-blur-[10px] border-t border-[#065ca9]/8 mt-auto overflow-hidden">
      {/* Decorative background watermark — large, low-opacity logo with a
          soft drop-shadow so it reads as ambient depth rather than content.
          pointer-events-none keeps it from blocking any clicks on the
          actual footer UI. Width is locked to a sane fraction of the
          footer on every breakpoint so the absolutely-positioned image
          cannot extend past the document on narrow viewports. */}
      <img
        aria-hidden="true"
        alt=""
        src={logoWatermark}
        className="pointer-events-none select-none absolute inset-y-0 right-0 md:right-[20%] my-auto h-[100%] w-[55%] sm:w-[45%] md:w-[35%] max-w-full object-contain opacity-[0.07] blur-[2px] drop-shadow-[0_25px_30px_rgba(6,92,169,0.25)]"
      />
      <div className="relative max-w-[1280px] mx-auto px-5 md:px-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <div
              onClick={() => onNavigate("home")}
              className="flex items-center mb-4 cursor-pointer group"
            >
              <img
                alt="Startup Barishal Logo"
                className="h-10 w-auto max-w-[140px] object-contain drop-shadow-sm"
                src={logoPrimary}
              />
            </div>
            <p className="text-sm text-[#5a4136]/80 max-w-[280px] leading-relaxed mb-4">
              Empowering the next generation of innovators by connecting dots for entrepreneurs in the Barishal region and beyond.
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${label}`}
                  className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary-orange hover:border-primary-orange/40 hover:bg-primary-orange/5 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs tracking-wider font-bold uppercase mb-4 text-secondary-blue">Quick Links</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate("home")} className="text-slate-600 hover:text-primary-orange transition-colors cursor-pointer text-left">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("about")} className="text-slate-600 hover:text-primary-orange transition-colors cursor-pointer text-left">
                  About Us & Story
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("incubation")} className="text-slate-600 hover:text-primary-orange transition-colors cursor-pointer text-left">
                  Incubation Cohorts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("events")} className="text-slate-600 hover:text-primary-orange transition-colors cursor-pointer text-left">
                  Upcoming Events
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("contact")} className="text-slate-600 hover:text-primary-orange transition-colors cursor-pointer text-left">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Location & Support Contacts */}
          <div>
            <h3 className="text-xs tracking-wider font-bold uppercase mb-4 text-secondary-blue">Contact Us</h3>
            <p className="text-sm text-slate-600 mb-2 leading-relaxed">
              Software Technology Park,<br />
              6th Floor, Barishal, Bangladesh
            </p>
            <p className="text-sm text-slate-600 font-medium">
              info@startupbarishal.org
            </p>
          </div>

          {/* Interactive Newsletter */}
          <div>
            <h3 className="text-xs tracking-wider font-bold uppercase mb-4 text-secondary-blue">Newsletter</h3>
            <p className="text-sm text-[#5a4136]/80 mb-3">
              Get weekly updates of our events.
            </p>
            {subscribed ? (
              <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-lg text-emerald-800 flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-990 leading-tight">
                  <span className="font-bold">Subscribed!</span> Thank you for joining Startup Barishal announcements.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Email Address *" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all pr-10"
                    disabled={submitting}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                {errorStatus && (
                  <p className="text-[11px] text-red-650 font-medium">{errorStatus}</p>
                )}
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-secondary-blue text-sm hover:bg-[#003ba3] text-white py-2.5 rounded-xl transition-all duration-200 mt-1 cursor-pointer font-medium flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>{submitting ? "Subscribing..." : "Subscribe"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Legal and Bottom Notes */}
        <div className="border-t border-slate-200 pt-6 text-center flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#5a4136]/60">
            © {new Date().getFullYear()} Startup Barishal. Empowering the next generation of innovators in Bangladesh.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <button className="hover:text-primary-orange hover:underline cursor-pointer">Privacy Policy</button>
            <button className="hover:text-primary-orange hover:underline cursor-pointer">Terms of Service</button>
            <button className="hover:text-primary-orange hover:underline cursor-pointer">Cookie Settings</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

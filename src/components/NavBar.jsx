import React, { useState } from "react";
import { Menu, X, Rocket, ShieldCheck } from "lucide-react";

export default function NavBar({ currentView, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "events", label: "Events" },
    { id: "incubation", label: "Incubation" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full glass-nav z-50 h-[80px] flex items-center transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-5 md:px-[64px] flex justify-between items-center w-full">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              alt="Startup Barishal Logo"
              className="h-10 w-10 object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKM7aA1POvUUDo89K0PIYsP1A6TD0UwSbnZVLbsxlIBU8uW7QrsCtg-mkJN4GKkgtesuedTOUYB9ubGgY4bfh_B3lDqGA3Iqi0BQaux2QNDVKyIgnbXxlROkJOI0A3wtU_AN69U7UTI9lSUVCBRHdq7b8Df3zlm0JblS4VeQRR1gRk_9TsHcLQnKuTz-HnFzFNTqMh2WsGJug7Vzu16Eq5fzfyYJn6Uj-nuojlzU_dbou12bfIUo3n_V18Eqpuo9FtszUMSZQf4Gk"
            />
            <div className="absolute -top-1 -right-1 bg-primary-orange w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </div>
          </div>
          <span className="text-lg min-[360px]:text-xl sm:text-2xl font-bold tracking-tight text-secondary-blue group-hover:text-secondary-hover transition-colors">
            Startup Barishal
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`text-sm tracking-wide font-medium transition-all cursor-pointer ${currentView === link.id
                  ? "text-primary-orange font-bold border-b-2 border-primary-orange pb-1"
                  : "text-[#5a4136]/80 hover:text-primary-orange"
                }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Controls & Admin Link */}
        <div className="hidden md:flex gap-4 items-center">
          <button
            onClick={() => onNavigate("admin")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer ${currentView === "admin"
                ? "bg-[#065ca9]/10 text-secondary-blue border border-[#065ca9]/20"
                : "border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            title="MERN Database Control Console"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MERN Admin DB</span>
          </button>

          <button
            onClick={() => onNavigate("incubation")}
            className="btn-outline px-5 py-2 cursor-pointer text-sm"
          >
            Membership
          </button>
          <button
            onClick={() => onNavigate("incubation")}
            className="btn-primary px-5 py-2 cursor-pointer text-sm font-semibold flex items-center gap-1.5"
          >
            <Rocket className="w-4 h-4" />
            <span>Apply Now</span>
          </button>
        </div>

        {/* Mobile Header Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => onNavigate("admin")}
            className={`p-2 rounded-lg transition-all ${currentView === "admin" ? "bg-[#065ca9]/10 text-secondary-blue" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </button>
          <button
            className="text-secondary-blue p-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-[80px] left-0 w-full bg-white border-b border-slate-200 shadow-lg md:hidden flex flex-col p-5 gap-4 animate-fadeIn z-50 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-base py-2 font-medium border-b border-slate-50 ${currentView === link.id
                    ? "text-primary-orange font-bold pl-2 border-l-2 border-primary-orange"
                    : "text-slate-700 hover:text-primary-orange"
                  }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onNavigate("admin");
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>MERN Admin DB Console</span>
            </button>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  onNavigate("incubation");
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-outline py-2.5 text-center text-sm"
              >
                Membership
              </button>
              <button
                onClick={() => {
                  onNavigate("incubation");
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-primary py-2.5 text-center text-sm font-semibold"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

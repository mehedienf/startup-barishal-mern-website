import React, { useEffect, useRef, useState } from "react";
import { Menu, X, Rocket } from "lucide-react";
import logo from "../assets/startupbarishal-logo.png";

export default function NavBar({ currentView, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide the navbar when the user scrolls down past a small threshold,
  // and reveal it again as soon as they scroll up. At the very top of the
  // page (within the first 80px) we always show it so the brand is visible.
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // If we're still near the top, always show.
      if (y < 80) {
        setVisible(true);
        lastScrollY.current = y;
        return;
      }
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const delta = y - lastScrollY.current;
          // Scrolling down -> hide, scrolling up -> show. A 4px deadzone
          // prevents jitter from small trackpad wobble.
          if (delta > 4) setVisible(false);
          else if (delta < -4) setVisible(true);
          lastScrollY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "events", label: "Events" },
    { id: "incubation", label: "Incubation" },
    { id: "members", label: "Members" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full glass-nav z-50 h-[80px] flex items-center transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-[64px] flex justify-between items-center w-full">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onNavigate("home")}
          className="flex items-center cursor-pointer group"
        >
          <img
            alt="Startup Barishal Logo"
            className="h-10 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform"
            src={logo}
          />
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
              className={`text-sm tracking-wide font-medium transition-all cursor-pointer ${
                currentView === link.id
                  ? "text-primary-orange font-bold border-b-2 border-primary-orange pb-1"
                  : "text-[#5a4136]/80 hover:text-primary-orange"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex gap-4 items-center">
          <button
            onClick={() => onNavigate("membership")}
            className="btn-outline-pill px-5 py-2 cursor-pointer text-sm"
          >
            Membership
          </button>
          <button
            onClick={() => onNavigate("incubation")}
            className="btn-primary-pill px-5 py-2.5 cursor-pointer text-sm font-semibold flex items-center gap-1.5"
          >
            <Rocket className="w-4 h-4" />
            <span>Apply Now</span>
          </button>
        </div>

        {/* Mobile Header Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            className="text-secondary-blue p-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
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
                className={`text-left text-base py-2 font-medium border-b border-slate-50 ${
                  currentView === link.id
                    ? "text-primary-orange font-bold pl-2 border-l-2 border-primary-orange"
                    : "text-slate-700 hover:text-primary-orange"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => {
                  onNavigate("membership");
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-outline-pill py-2.5 text-center text-sm"
              >
                Membership
              </button>
              <button
                onClick={() => {
                  onNavigate("incubation");
                  setMobileMenuOpen(false);
                }}
                className="w-full btn-primary-pill py-2.5 text-center text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <Rocket className="w-4 h-4" />
                <span>Apply Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

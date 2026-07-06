import React from "react";
import { ShieldCheck, ExternalLink, ArrowLeft } from "lucide-react";
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Persistent sidebar navigation */}
      <Sidebar />

      {/* Right side: top bar + routed content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        {/* Admin Top Bar */}
        <header className="sticky top-0 z-40 h-[72px] flex items-center bg-[#0b1f3a] text-white border-b border-white/10">
          <div className="px-5 md:px-8 flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/15 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">
                  Startup Barishal Admin
                </h1>
                <p className="text-[11px] text-white/60 tracking-widest uppercase mt-0.5">
                  Database Control Console
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                MERN Live
              </span>
              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Public Site</span>
                <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline" />
              </a>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
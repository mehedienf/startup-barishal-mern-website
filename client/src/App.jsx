import React, { useEffect, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import AboutView from "./components/AboutView";
import EventsView from "./components/EventsView";
import ContactView from "./components/ContactView";
import IncubationView from "./components/IncubationView";
import MembershipView from "./components/MembershipView";
import MembersView from "./components/MembersView";

// Map legacy short ids to URL paths.  This keeps components like HomeView /
// EventsView / NavBar that still pass `onNavigate("events")` working unchanged
// while the real source of truth is the URL.
export const ID_TO_PATH = {
  home: "/",
  about: "/about",
  events: "/events",
  incubation: "/incubation",
  contact: "/contact",
  membership: "/membership",
  members: "/members",
};

export const PATH_TO_ID = Object.fromEntries(
  Object.entries(ID_TO_PATH).map(([id, path]) => [path, id])
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Smooth scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Backwards-compatible navigation helper: child components still call
  // onNavigate("events") etc.  Also accepts an object
  //   { id: "events", eventId: "evt-xxx" }
  // to deep-link into a specific event card via a URL hash, e.g.
  //   /events#evt-xxx
  const navigateById = useCallback(
    (arg) => {
      if (arg && typeof arg === "object") {
        const { id, eventId, hash } = arg;
        const path = ID_TO_PATH[id] || `/${id}`;
        navigate(path + (eventId ? `#${eventId}` : hash || ""));
        return;
      }
      const id = arg;
      const path = ID_TO_PATH[id] || `/${id}`;
      navigate(path);
    },
    [navigate]
  );

  const currentView = PATH_TO_ID[location.pathname] || "home";

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
      {/* Top Navigation Component */}
      <NavBar currentView={currentView} onNavigate={navigateById} />

      {/* Primary Display Content Canvas */}
      <main className="flex-grow pt-[80px]">
        <Routes>
          <Route path="/" element={<HomeView onNavigate={navigateById} />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/events" element={<EventsView onNavigate={navigateById} />} />
          <Route path="/incubation" element={<IncubationView />} />
          <Route path="/membership" element={<MembershipView />} />
          <Route path="/members" element={<MembersView onNavigate={navigateById} />} />
          <Route path="/contact" element={<ContactView />} />
          {/* Fallback: any unknown URL takes the user home rather than 404'ing
              inside the SPA.  A real deploy would also serve index.html for
              these paths (Vite history fallback handles this in dev). */}
          <Route path="*" element={<HomeView onNavigate={navigateById} />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateById} />
    </div>
  );
}
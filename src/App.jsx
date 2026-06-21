import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HomeView from "./components/HomeView";
import AboutView from "./components/AboutView";
import EventsView from "./components/EventsView";
import ContactView from "./components/ContactView";
import IncubationView from "./components/IncubationView";
import AdminConsole from "./components/AdminConsole";

export default function App() {
  const [currentView, setCurrentView] = useState("home");

  // Automatically scroll to the top of the viewport on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomeView onNavigate={setCurrentView} />;
      case "about":
        return <AboutView />;
      case "events":
        return <EventsView />;
      case "incubation":
        return <IncubationView />;
      case "contact":
        return <ContactView />;
      case "admin":
        return <AdminConsole />;
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
      {/* Top Navigation Component */}
      <NavBar currentView={currentView} onNavigate={setCurrentView} />

      {/* Primary Display Content Canvas with standard top padding offset for fixed header */}
      <main className="flex-grow pt-[80px]">
        {renderView()}
      </main>

      {/* Display standard Footer on general screens; suppress on administration views */}
      {currentView !== "admin" && (
        <Footer onNavigate={setCurrentView} />
      )}
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import {
  Rocket,
  Network,
  Users,
  GraduationCap,
  Coins,
  HeartHandshake,
  Building,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar, // Added for Events Overview
  MapPin,   // Added for Events Overview
  Linkedin, // Added for Team section
  Loader2,  // Added for loading states
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";

const HERO_IMAGES = [
  {
    src: img1,
    alt: "A diverse team of young startup founders collaborating together on notebooks and software kits around a modern co-working desk"
  },
  {
    src: img2,
    alt: "Diverse tech team brainstorming ideas and drawing workflows on wireframes"
  },
  {
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80",
    alt: "Developers and designers discussing interface models and business strategies"
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    alt: "Group workshop mentoring session for budding local innovators"
  }
];

function useCountUp(target, start, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) {
      setValue(0);
      return;
    }

    let frameId;
    let startTime;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameId = requestAnimationFrame(step);
    };

    setValue(0);
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, start, duration]);

  return value;
}

export default function HomeView({ onNavigate }) {
  // Fetch the active cohort so the hero CTA button can mirror the exact
  // label / link configured in the admin panel for "Start Application".
  const [activeCohort, setActiveCohort] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/incubationPrograms/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setActiveCohort(data && data.id ? data : null);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const applyButtonLabel =
    (activeCohort?.applyButtonLabel && activeCohort.applyButtonLabel.trim()) ||
    "Apply for Incubation";
  const applyButtonLink =
    (activeCohort?.applyButtonLink && activeCohort.applyButtonLink.trim()) || "";
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Live team + events from API
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadPartners() {
      try {
        const res = await fetch("/api/partners");
        if (res.ok && !cancelled) setPartners(await res.json());
      } catch (err) {
        console.error("Failed to load partners:", err);
      }
    }
    loadPartners();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetch("/api/teamMembers");
        if (res.ok) {
          const data = await res.json();
          const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setTeam(sorted);
        }
      } catch (err) {
        console.error("Failed to load team:", err);
      } finally {
        setTeamLoading(false);
      }
    }
    loadTeam();
  }, []);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          // Pick the four most recent upcoming + past events for the preview grid
          const sorted = [...data].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          setEvents(sorted.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setEventsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const [stats, setStats] = useState({
    cohortsCompleted: 4,
    eventsCount: 32,
    startupsMentored: 15,
    investorsOnboarded: 8,
    contactsCount: 2,
    subscribersCount: 2,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const statsRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shouldAnimateStats = statsInView && !loadingStats;
  const animatedEvents = useCountUp(stats.eventsCount, shouldAnimateStats);
  const animatedStartups = useCountUp(stats.startupsMentored, shouldAnimateStats);
  const animatedInvestors = useCountUp(stats.investorsOnboarded, shouldAnimateStats);
  const animatedCohorts = useCountUp(stats.cohortsCompleted, shouldAnimateStats);

  // Fetch live stats from MERN Express API
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            cohortsCompleted: data.cohortsCompleted || 4,
            eventsCount: data.eventsCount || 32,
            startupsMentored: data.startupsMentored || 15,
            investorsOnboarded: data.investorsOnboarded || 8,
            contactsCount: data.currentContactsCount || 2,
            subscribersCount: data.currentSubscribersCount || 2,
          });
        }
      } catch (err) {
        console.error("Failed to load server stats, using fallback preset:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="py-12 md:py-20 max-w-[1280px] mx-auto px-5 md:px-[64px]" id="hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Hero Content Left */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-primary-orange px-4 py-1.5 rounded-full self-start text-xs font-semibold tracking-wide shadow-sm animate-pulse">
              <Rocket className="w-3.5 h-3.5 fill-primary-orange" />
              <span>Incubation Cohorts Open</span>
            </div>

            <h1 className="text-3xl min-[380px]:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-secondary-blue leading-[1.12]">
              Accelerate Your <br />
              <span className="text-primary-orange">Startup Journey</span>
            </h1>

            <p className="text-base md:text-lg text-[#5a4136]/80 max-w-[580px] leading-relaxed">
              Startup incubation programme to form investor and creators forum and entrepreneurship connection. We provide the resources, mentorship, and network you need to foster your growth.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {applyButtonLink ? (
                <a
                  href={applyButtonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-8 py-4 text-sm font-bold flex items-center gap-2 group cursor-pointer"
                >
                  <span>Apply for Incubation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <button
                  onClick={() => onNavigate("incubation")}
                  className="btn-primary px-8 py-4 text-sm font-bold flex items-center gap-2 group cursor-pointer"
                >
                  <span>Apply for Incubation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button
                onClick={() => onNavigate("about")}
                className="btn-outline px-8 py-4 text-sm font-semibold cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Hero Image Right */}
          <div className="lg:col-span-6 relative animate-fadeIn">
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary-orange/20 to-secondary-blue/10 rounded-[2rem] blur-2xl opacity-75"></div>
            <div className="relative w-full aspect-[16/10] sm:aspect-[5/3] lg:aspect-[3/2] rounded-[2rem] overflow-hidden border-2 border-white bg-slate-900 shadow-[0_20px_50px_rgba(6,92,169,0.12)]">
              {HERO_IMAGES.map((img, idx) => (
                <img
                  key={idx}
                  alt={img.alt}
                  className={`absolute inset-0 w-full h-full object-cover hover:scale-105 transition-[opacity,transform] duration-750 ease-in-out ${idx === currentImgIndex ? "opacity-95 z-10 scale-100" : "opacity-0 z-0 scale-105"
                    }`}
                  referrerPolicy="no-referrer"
                  src={img.src}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent z-20 pointer-events-none"></div>

              {/* Subtle indicators at the bottom */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 bg-slate-950/60 px-2.5 py-1.5 rounded-full border border-white/10">
                {HERO_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentImgIndex
                      ? "bg-primary-orange w-4 hover:bg-primary-orange"
                      : "bg-white/60 hover:bg-white"
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Dynamic Statistics Block */}
      <section className="py-8 bg-slate-50 border-y border-slate-200/60" id="stats" ref={statsRef}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-[64px]">
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center">

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-orange">
                {loadingStats ? "..." : `${animatedEvents}+`}
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Events & Workshops</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-orange">
                {loadingStats ? "..." : `${animatedStartups}+`}
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Startups Mentored</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-orange">
                {loadingStats ? "..." : `${animatedInvestors}+`}
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Investors Onboarded</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-orange">
                {loadingStats ? "..." : `${animatedCohorts}+`}
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Cohorts Completed</p>
            </div>

          </div>
        </div>
      </section>

      {/* Offerings Bento Grid */}
      <section className="py-16 md:py-24 max-w-[1280px] mx-auto px-5 md:px-[64px]" id="offerings">
        <div className="text-center flex flex-col gap-3 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-blue tracking-tight">
            What We Offer
          </h2>
          <p className="text-base md:text-lg text-[#5a4136]/80 max-w-[600px] mx-auto leading-relaxed">
            Comprehensive support designed specifically for early-stage startup founders and student teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Networking Box */}
          <div className="md:col-span-2 bg-gradient-to-br from-white to-slate-50 p-8 rounded-[1.8rem] border border-slate-200/80 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute right-0 bottom-0 opacity-[0.03] text-secondary-blue translate-x-12 translate-y-12">
              <Network className="w-64 h-64" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-orange/10 text-primary-orange flex items-center justify-center mb-6 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-blue mb-3">Networking & Collaborative Hub</h3>
                <p className="text-slate-600 max-w-[500px] leading-relaxed">
                  Participate in weekly high-engagement startup talk sessions, set actionable goals for your business, and engage in feedback loops with other founders.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary-orange cursor-pointer group-hover:translate-x-1 transition-transform">
                <span>Engage with the hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Mentoring Box */}
          <div className="bg-white p-8 rounded-[1.8rem] border border-slate-200/80 hover:border-primary-orange/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-secondary-blue/10 text-secondary-blue flex items-center justify-center mb-6">
                <GraduationCap className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-xl font-bold text-secondary-blue mb-2">Expert Mentorship</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect directly with international advisors and join intensive courses led by industry pioneers.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-slate-400">Startup School Course Syllabus Included</div>
          </div>

          {/* Funding Support */}
          <div className="bg-white p-8 rounded-[1.8rem] border border-slate-200/80 hover:border-primary-orange/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#d95a00] flex items-center justify-center mb-6">
                <Coins className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-xl font-bold text-secondary-blue mb-2">Seed Funding Access</h3>
              <p className="text-sm text-slate-650 leading-relaxed">
                Learn the mechanics of equity, cap sheets, and presentation layout to securely pitch early-stage venture capital.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-slate-400">Direct Demo Day Pitch Matching</div>
          </div>

          {/* Consultation */}
          <div className="bg-white p-8 rounded-[1.8rem] border border-slate-200/80 hover:border-primary-orange/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#0062a1]/10 text-secondary-blue flex items-center justify-center mb-6">
                <HeartHandshake className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-xl font-bold text-secondary-blue mb-2">Corporate Consultation</h3>
              <p className="text-sm text-slate-650 leading-relaxed">
                Receive support on product design, developer hiring, financial modeling, and intellectual property registration.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-slate-400">Legal Support desk access</div>
          </div>

          {/* Co-Working Space */}
          <div className="bg-white p-8 rounded-[1.8rem] border border-slate-200/80 hover:border-primary-orange/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-primary-orange flex items-center justify-center mb-6">
                <Building className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-xl font-bold text-secondary-blue mb-2">Premium Co-Working</h3>
              <p className="text-sm text-slate-650 leading-relaxed">
                Work shoulder-to-shoulder with other builders in a dedicated high-speed desk space in the central Software Technology Park.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-slate-400">6th Floor High Tech facility active</div>
          </div>

        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-8 md:py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]" id="team">
        <div className="text-center flex flex-col gap-3 mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-primary-orange px-4 py-1.5 rounded-full self-center text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Users className="w-3.5 h-3.5" />
            <span>Our People</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-blue tracking-tight">
            Meet the Team
          </h2>
          <p className="text-base md:text-lg text-[#5a4136]/80 max-w-[600px] mx-auto leading-relaxed">
            Operators, mentors, and ecosystem builders behind Startup Barishal.
          </p>
        </div>

        {teamLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-primary-orange animate-spin" /></div>
        ) : team.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No team members to show yet.</p>
        ) : (
          <TeamAvatarRow team={team} />
        )}
      </section>

      {/* NEW SECTION: New Events Overview Section (Added Before CTA) */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/50" id="events-overview">
        <div className="max-w-[1280px] mx-auto px-5 md:px-[64px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-blue tracking-tight">
                Latest Events & Ecosystem Highlights
              </h2>
              <p className="text-base text-[#5a4136]/80 max-w-[600px] leading-relaxed">
                Catch up with the latest startup community summits, developer sprint bootcamps, and workshop galleries.
              </p>
            </div>
            <button
              onClick={() => onNavigate("events")}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-primary-orange/40 text-secondary-blue hover:text-primary-orange px-6 py-3 rounded-full text-sm font-bold shadow-sm hover:shadow transition-all whitespace-nowrap self-start md:self-auto cursor-pointer"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Highlight Cards Grid */}
          {eventsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 text-primary-orange animate-spin" /></div>
          ) : events.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No upcoming events to highlight yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-[1.8rem] border border-slate-200/80 p-5 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-full h-40 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={event.coverImage || "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80"; }}
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-orange">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.date ? new Date(event.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "TBA"}</span>
                      </div>
                      <h3 className="text-xl font-bold text-secondary-blue leading-snug line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{event.location || "TBA"}</span>
                      </div>
                      <button
                        onClick={() => onNavigate("events")}
                        className="text-xs font-bold text-primary-orange hover:text-primary-hover inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>More</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CALL TO ACTION with Orange-Crimson glass style mapping */}
      <section className="py-12 max-w-[1280px] mx-auto px-5 md:px-[64px]" id="cta">
        <div className="bg-gradient-to-r from-primary-orange to-[#d95a00] text-white rounded-[2rem] p-8 md:p-14 relative overflow-hidden shadow-xl shadow-orange-500/10">

          {/* Subtle linear decorative shapes */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[150%] bg-white rounded-full blur-3xl rotate-12"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[120%] bg-slate-900 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-[800px] mx-auto gap-6">
            <div className="bg-white/10 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
              Barishal Tech Ecosystem Pulse
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Launch?
            </h2>
            <p className="text-sm md:text-base text-white/95 leading-relaxed max-w-[650px]">
              Join our next incubation cohort. Get access to the physical office desk resources, direct capital networks, and senior engineering mentors needed to scale your project.
            </p>
            {applyButtonLink ? (
              <a
                href={applyButtonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-primary-orange hover:text-primary-hover px-8 py-4 rounded-xl font-bold text-sm shadow-md transition-all hover:bg-slate-50 hover:translate-y-[-2px] mt-4 z-10 cursor-pointer"
              >
                <span>Apply for Incubation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            ) : (
              <button
                onClick={() => onNavigate("incubation")}
                className="bg-white text-primary-orange hover:text-primary-hover px-8 py-4 rounded-xl font-bold text-sm shadow-md transition-all hover:bg-slate-50 hover:translate-y-[-2px] mt-4 z-10 cursor-pointer"
              >
                Apply for Incubation
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Partners Logos section with infinite scrolling marquee — full-bleed */}
      <section className="py-16 text-center w-full overflow-hidden" id="partners">
        <h2 className="text-2xl font-bold mb-3 text-secondary-blue px-5 md:px-[64px]">Our Ecosystem Partners</h2>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-8 px-5 md:px-[64px]">Aligned for Local Growth</p>

        {partners.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Partner logos will appear here once added from the admin panel.</p>
        ) : (
          /* Infinite sliding container with beautiful fading gradients */
          <div className="relative w-full overflow-hidden hover-pause before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-12 sm:before:w-28 before:bg-gradient-to-r before:from-white before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-12 sm:after:w-28 after:bg-gradient-to-l after:from-white after:to-transparent">
            <div className="animate-marquee flex items-center gap-4 py-2">
              {[...Array(6)].map((_, loopIdx) => (
                <React.Fragment key={loopIdx}>
                  {partners.map((part) => (
                    <a
                      key={`${loopIdx}-${part.id}`}
                      href={part.website || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={part.name}
                      className="px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:scale-[1.03] transition-transform w-36 h-20 flex items-center justify-center shrink-0"
                    >
                      <img
                        alt={part.name}
                        className="max-h-12 max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                        src={part.logoUrl}
                        referrerPolicy="no-referrer"
                      />
                    </a>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TeamAvatarRow — 5-up circular avatar row, center one enlarged      */
/* ------------------------------------------------------------------ */
function TeamAvatarRow({ team }) {
  const [index, setIndex] = useState(0);
  const total = team.length;

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  // Keyboard arrow support
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Distance-from-active determines each avatar's appearance.
  // Use wrap-around distance so the leftmost & rightmost members
  // appear close to the active one (matching the "circle" feel).
  const dist = (i) => {
    const d = Math.abs(i - index);
    return Math.min(d, total - d);
  };

  // Signed offset for the X transform — also wrap-around so that when
  // crossing from last -> 0 (or 0 -> last) every avatar moves by exactly
  // one slot, never flying across the row.
  const signedOffset = (i) => {
    let raw = i - index;
    const half = total / 2;
    if (raw > half) raw -= total;
    else if (raw < -half) raw += total;
    return raw;
  };

  const slotFor = (i) => {
    const d = dist(i);
    if (d === 0) return "active";
    if (d === 1) return "near";
    if (d === 2) return "mid";
    return "far";
  };

  const slotStyles = {
    active: {
      wrapper: "w-28 h-28 sm:w-36 sm:h-36 opacity-100 -translate-y-2 z-30 ring-4 ring-white shadow-2xl",
      fontSize: "2.25rem",
    },
    near: {
      wrapper: "w-20 h-20 sm:w-24 sm:h-24 opacity-70 hover:opacity-100 -translate-y-0 z-20 ring-2 ring-white shadow-md",
      fontSize: "1.25rem",
    },
    mid: {
      wrapper: "w-16 h-16 sm:w-20 sm:h-20 opacity-50 hover:opacity-80 translate-y-1 z-10 ring-2 ring-white shadow-sm",
      fontSize: "0.95rem",
    },
    far: {
      wrapper: "w-12 h-12 sm:w-14 sm:h-14 opacity-30 hover:opacity-60 translate-y-2 z-0 ring-2 ring-white shadow-sm",
      fontSize: "0.8rem",
    },
  };

  const active = team[index];

  return (
    <div className="flex flex-col items-center">
      {/* Avatar row */}
      <div className="relative w-full max-w-[920px]">
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous team member"
              className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-secondary-blue hover:text-primary-orange hover:border-primary-orange/40 hover:scale-105 transition-all items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next team member"
              className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-secondary-blue hover:text-primary-orange hover:border-primary-orange/40 hover:scale-105 transition-all items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Track: avatars absolutely positioned around a fixed center point,
            so the active one always stays in the middle regardless of total. */}
        <div
          className="team-avatar-step relative h-44 sm:h-52 mx-auto"
          style={{ width: "min(100%, 760px)" }}
        >
          {team.map((m, i) => {
            const slot = slotFor(i);
            const s = slotStyles[slot];
            const offset = signedOffset(i); // wrap-around signed offset
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${m.name}`}
                aria-current={slot === "active" ? "true" : undefined}
                style={{
                  left: "50%",
                  top: "50%",
                  // Translate by (offset * step) on x, then center the button
                  // on that point, then lift it. Step ≈ 110px on mobile, 150px on sm+.
                  transform: `translate(calc(-50% + ${offset} * (var(--avatar-step, 110px))), -50%)`,
                }}
                className={`absolute rounded-full transition-all duration-500 ease-out cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-primary-orange/40 ${s.wrapper}`}
              >
                {m.photoUrl ? (
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span
                    className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-primary-orange/30 to-secondary-blue/30 font-bold text-primary-orange"
                    style={{ fontSize: s.fontSize }}
                  >
                    {(m.name || "?").charAt(0)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active member details — static shell, only the inner crossfading
          layer swaps, so the card never "rebuilds" on member change. */}
      <div className="mt-8 text-center max-w-xl mx-auto px-4 min-h-[120px]">
        {/* key={active.id} makes React swap the inner div for the crossfade,
            but the outer wrapper stays mounted across rotations. */}
        <div key={active.id} className="animate-fadeUp will-change-transform">
          <h3 className="text-xl sm:text-2xl font-semibold text-secondary-blue tracking-tight">
            {active.name}
          </h3>
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary-orange mt-1">
            {active.role}
          </p>
          {active.bio && (
            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              {active.bio}
            </p>
          )}
          {active.linkedinUrl && (
            <a
              href={active.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-blue hover:text-primary-orange transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>Connect on LinkedIn</span>
            </a>
          )}
        </div>
      </div>

      {/* Counter */}
      <div className="mt-6 text-xs font-semibold text-slate-500 tracking-wider">
        <span className="text-primary-orange">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="mx-1.5 text-slate-300">/</span>
        <span>{String(total).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

function TeamMemberCard({ member, compact = false }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center text-center p-6 sm:p-8 transition-opacity duration-500 ${
        compact ? "opacity-90" : ""
      }`}
    >
      {member.photoUrl ? (
        <img
          src={member.photoUrl}
          alt={member.name}
          className={`rounded-full object-cover border-4 border-white shadow-md ${
            compact ? "w-16 h-16 mb-3" : "w-28 h-28 mb-5"
          }`}
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <div
          className={`rounded-full bg-gradient-to-br from-primary-orange/20 to-secondary-blue/20 flex items-center justify-center font-bold text-primary-orange border-4 border-white shadow-md ${
            compact
              ? "w-16 h-16 text-xl mb-3"
              : "w-28 h-28 text-4xl mb-5"
          }`}
        >
          {(member.name || "?").charAt(0)}
        </div>
      )}
      <h3
        className={`font-bold text-secondary-blue ${
          compact ? "text-sm" : "text-xl"
        }`}
      >
        {member.name}
      </h3>
      <p
        className={`font-bold uppercase tracking-wider text-primary-orange ${
          compact ? "text-[10px] mt-0.5" : "text-xs mt-1.5"
        }`}
      >
        {member.role}
      </p>
      {!compact && member.bio && (
        <p className="text-sm text-slate-500 mt-4 leading-relaxed max-w-sm">
          {member.bio}
        </p>
      )}
      {!compact && member.linkedinUrl && (
        <a
          href={member.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-blue hover:text-primary-orange transition-colors"
        >
          <Linkedin className="w-3.5 h-3.5" />
          <span>Connect on LinkedIn</span>
        </a>
      )}
    </div>
  );
}
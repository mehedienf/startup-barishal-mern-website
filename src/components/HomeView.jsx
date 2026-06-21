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
  Award
} from "lucide-react";

const HERO_IMAGES = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT_HAzmMi34jNeme-OGSl-OQxLzNU_GkB5O5Dg_AGEMrwz-WdiGFyYRNbqq6nxWwbVW4SU9eYk-MOqOslPHgSomf7wibXhFkL9p_X1_bMOILJEe9xKa6m37VXNSaPH6eHGYY0PxPEEW1Oq_f0DK44Snx1Giov5LZOl5k0IAv0cvc43JyRGYkIKVO3T4MnkiXC4jzjQNgF0jqFoGH7ioIFegzVppvkO2652bgwBxpq-YzFX_qigsgFrUvKl2irKOFWdxekJxBY7UeQ",
    alt: "A diverse team of young startup founders collaborating together on notebooks and software kits around a modern co-working desk"
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    alt: "Diverse tech team brainstorming ideas and drawing workflows on wireframes"
  },
  {
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80",
    alt: "Developers and designers discussing interface models and business strategies"
  },
  {
    src: "https://images.unsplash.com/photo-1531535934027-667f687cada1?auto=format&fit=crop&w=1000&q=80",
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
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
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
              <button
                onClick={() => onNavigate("incubation")}
                className="btn-primary px-8 py-4 text-sm font-bold flex items-center gap-2 group cursor-pointer"
              >
                <span>Start Application</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate("about")}
                className="btn-outline px-8 py-4 text-sm font-semibold cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Hero Image Right with catch light shadow and smooth transition slideshow */}
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

          {/* Networking Box (Large Bento Grid Item) */}
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
            <button
              onClick={() => onNavigate("incubation")}
              className="bg-white text-primary-orange hover:text-primary-hover px-8 py-4 rounded-xl font-bold text-sm shadow-md transition-all hover:bg-slate-50 hover:translate-y-[-2px] mt-4 z-10 cursor-pointer"
            >
              Apply for Incubation
            </button>
          </div>
        </div>
      </section>

      {/* Partners Logos section with infinite scrolling marquee */}
      <section className="py-16 text-center max-w-[1280px] mx-auto px-5 md:px-[64px] overflow-hidden" id="partners">
        <h3 className="text-xs uppercase tracking-widest font-extrabold text-slate-400 mb-8">
          Our Valued Partners
        </h3>

        {/* Infinite sliding container with beautiful fading gradients */}
        <div className="relative w-full overflow-hidden hover-pause before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-12 sm:before:w-28 before:bg-gradient-to-r before:from-white before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-12 sm:after:w-28 after:bg-gradient-to-l after:from-white after:to-transparent">
          <div className="animate-marquee flex items-center gap-4 py-2">
            {[...Array(3)].map((_, loopIdx) => (
              <React.Fragment key={loopIdx}>
                {[
                  { id: 1, name: "Partner 1", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGPZ4tLah88gWmXJ3ChTBWgMyg6b4VxrUv-ExYkE0VNU6B9Ri7waY9kXIUiDVCnZDVg9HEvNioUYLpx6SUuiEwGWqy0xUx0Lt-HmCAmTojJsyZhSIfE2vRvgRwv8OsPitl8ttT8INKsYlxAw6ZY4GN22xeSOpLCos9OhuvMfSHHO85MCgmK9e9b0osbyR_5JXHllAw-FQYl5NUTy7FohCs08oeXhScP30NEWVBwbKsm4Uq_bfDPMnC7BoE6rM739q9jaSqsmD-ub8" },
                  { id: 2, name: "Partner 2", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDa5a86_GWLWI-9PoytVtgH8pYK6njTEU2opUdA0UGg7vcrsOn4BPqNaIt8_6HmTs9-uXWkw-kEG2ypzCFEomKfE9leW0-OzDy2x4EiBqubOri5q6Hg3FTBHA26ay3W1kxrFyVTDti5ugYEdloMQxOK0gQe7MQLewkORQToy1ytZSjHhHDR0lrfKUvkLa36wA426nlkjmEUXCYWCtuxywIcFOsyReapBJIyZ8NwQ6AhYbpPQoAugGk25oLwNiaz80OxTWoyWgRCrx0" },
                  { id: 3, name: "Partner 3", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8OMnMiMbSaXLvGLNZwTuvPOeMSWhnPK5GWhJJyyYLDtf_Ix3WKfubODZX-9SdI8hdkwlj4OURi3EM0dH5B9YO4mF7JcFsCF60KDLD1n4loK1rDKqsHEUyOla6PqRszu3K8j_P8PVsT22ONOsnxkOHEdLqcwxd7avhmxtuZ1EqrUku0mgC0PgHY7UOo0pT4agisOZaRjgewLcJmn-uIBevduonVuRQTBDE9fHSlcefhcRH7u7eMT-SE_WbZFDxGLtMThB2tp2YebM" },
                  { id: 4, name: "Partner 4", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjMr8T_k8wjN2tkt1l7dE7OtTJw1XIFuz9c3pbBgv7OjOppDMs831jGIjIWo0rW6PpXLrgNmPgf5THqKXGZLzaPgP4C2Y2hegFV38OuZwJuOH9gk_K8j6hTMPFQjGgndyN_iWxsqd0vEbNstst52LIAUhYmeIEfXdSDoMf7oGqH4gIBOAegb5xxptCX4yKFWgt6d1hpy3wdRAyjKa86D-qB_tfOX8m7Kr8Ge9NgG1m1RpVVwI20K7Oo2CR5xziPsoSU5jWDaU5smhU" },
                ].map((part) => (
                  <div
                    key={`${loopIdx}-${part.id}`}
                    className="px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:scale-[1.03] transition-transform w-36 h-20 flex items-center justify-center shrink-0 mx-2"
                  >
                    <img
                      alt={part.name}
                      className="max-h-12 max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                      src={part.logo}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

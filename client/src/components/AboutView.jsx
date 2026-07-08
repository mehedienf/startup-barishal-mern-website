import React, { useEffect, useState } from "react";
import { Rocket, Eye, Loader2, Mail, Phone, Linkedin, Facebook, Twitter, Sparkles, ArrowRight } from "lucide-react";

export default function AboutView() {
  // Live team members from the MERN API
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  // Live partners from the MERN API
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadTeam() {
      try {
        const res = await fetch("/api/teamMembers");
        if (!cancelled && res.ok) {
          const data = await res.json();
          // sort by display order so admins can control the listing
          const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setTeam(sorted);
        }
      } catch (err) {
        console.error("Failed to load team:", err);
      } finally {
        if (!cancelled) setTeamLoading(false);
      }
    }
    loadTeam();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadPartners() {
      try {
        const res = await fetch("/api/partners");
        if (!cancelled && res.ok) setPartners(await res.json());
      } catch (err) {
        console.error("Failed to load partners:", err);
      }
    }
    loadPartners();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="py-12 md:py-20 max-w-[1280px] mx-auto px-5 md:px-[64px]">

      {/* Editorial Title Header */}
      <div className="text-center mb-16 max-w-[800px] mx-auto flex flex-col gap-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-secondary-blue leading-tight">
          Connecting The Dots for Entrepreneurs
        </h1>
        <div className="w-16 h-1 bg-primary-orange mx-auto rounded"></div>
        <p className="text-base md:text-lg text-[#5a4136]/80 leading-relaxed mt-2">
          We aim to provide entrepreneurship resources and connect local founders with the national and global network to foster sustainable growth and regional development.
        </p>
      </div>

      {/* Mission & Vision Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">

        {/* Mission Card */}
        <div className="bg-white border border-slate-205 rounded-2xl p-5 sm:p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-300 hover:translate-y-[-2px] transition-all duration-300 flex flex-col gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary-orange/10 text-primary-orange mb-2 border border-primary-orange/5 animate-pulse">
            <Rocket className="w-6 h-6 fill-primary-orange/15" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-secondary-blue">Our Mission</h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            To build a robust platform where early-stage entrepreneurs can acquire essential business knowledge. We facilitate connections among like-minded individuals, serving as an ideal launching pad for students and new founders embarking on their entrepreneurial journey in the Barishal region.
          </p>
        </div>

        {/* Vision Card */}
        <div className="bg-white border border-slate-205 rounded-2xl p-5 sm:p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-300 hover:translate-y-[-2px] transition-all duration-300 flex flex-col gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#065ca9]/10 text-secondary-blue mb-2 border border-[#065ca9]/5 animate-pulse">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-secondary-blue">Our Vision</h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            We envision an established, self-sustaining entrepreneurial community in Barishal where local startups can seamlessly showcase their innovative ideas. By providing critical resources &amp; active global network access, we aim to nurture today's young leaders into tomorrow's national industry pioneers.
          </p>
        </div>

      </div>

      {/* Team Members Section — dynamic from /api/teamMembers */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-blue mb-3">Our Team</h2>
          <div className="w-16 h-1 bg-primary-orange mx-auto rounded mb-4"></div>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Meet the passionate individuals driving the entrepreneurial ecosystem forward in Barishal.
          </p>
        </div>

        {teamLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 text-primary-orange animate-spin" />
          </div>
        ) : team.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No team members to show yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-orange/50 hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center pt-8 pb-6 px-6"
              >
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-slate-100 shadow-md shrink-0 bg-slate-100">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover object-[center_20%]"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-orange/20 to-secondary-blue/20 text-3xl font-bold text-primary-orange">
                      {(member.name || "?").charAt(0)}
                    </span>
                  )}
                </div>
                <div className="mt-5 text-center flex flex-col items-center gap-2">
                  <h3 className="font-bold text-secondary-blue text-lg">{member.name}</h3>
                  <p className="text-primary-orange font-semibold text-sm">{member.role}</p>
                  {member.bio && (
                    <p className="text-slate-500 text-xs line-clamp-2">{member.bio}</p>
                  )}
                  {(member.email || member.phone || member.linkedinUrl || member.facebookUrl || member.twitterUrl) && (
                    <div className="mt-3 flex items-center justify-center gap-3 text-secondary-blue">
                      {member.email && (
                        <a href={`mailto:${member.email}`} title={member.email} className="hover:text-primary-orange transition-colors">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {member.phone && (
                        <a href={`tel:${member.phone.replace(/\s+/g, "")}`} title={member.phone} className="hover:text-primary-orange transition-colors">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {member.linkedinUrl && (
                        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:text-primary-orange transition-colors">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.facebookUrl && (
                        <a href={member.facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook" className="hover:text-primary-orange transition-colors">
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}
                      {member.twitterUrl && (
                        <a href={member.twitterUrl} target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="hover:text-primary-orange transition-colors">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* "Next you?" — invitation CTA card to round out the team grid */}
            <div className="relative bg-gradient-to-br from-secondary-blue via-[#0b1f3a] to-secondary-blue text-white border border-secondary-blue rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-orange/50 hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center justify-center text-center pt-8 pb-6 px-6">
              {/* "Your spot" badge — pinned to top-left corner */}
              <span className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-[0.25em] text-primary-orange bg-white/10 border border-primary-orange/40 px-2 py-1 rounded-full backdrop-blur-sm">
                Your spot
              </span>

              {/* Decorative sparkle accent */}
              <div className="pointer-events-none absolute top-4 right-4 text-primary-orange/40">
                <Sparkles className="w-6 h-6" />
              </div>

              {/* Avatar circle now hosts the human silhouette as the visual */}
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white/10 shadow-md shrink-0 bg-gradient-to-br from-primary-orange/20 to-secondary-blue/20 flex items-end justify-center">
                <svg
                  viewBox="0 0 200 200"
                  className="w-[88%] h-[88%] text-primary-orange"
                  fill="currentColor"
                  preserveAspectRatio="xMidYMax meet"
                >
                  <circle cx="100" cy="62" r="34" />
                  <path d="M30 200 C30 138 60 110 100 110 C140 110 170 138 170 200 Z" />
                </svg>
              </div>
              <div className="relative mt-5 flex flex-col items-center gap-2">
                <h3 className="font-bold text-white text-lg">Next you?</h3>
                <p className="text-white/70 text-xs leading-relaxed max-w-[220px]">
                  Send us a mail with your CV and a short note about what you'd
                  love to build at Startup Barishal.
                </p>
                <a
                  href="mailto:startupbarishal.bd@gmail.com?subject=Joining%20the%20Startup%20Barishal%20team&body=Hi%20team%2C%0A%0AI%27d%20love%20to%20join%20the%20team.%20Here%27s%20a%20bit%20about%20me%20and%20my%20CV%3A%0A%0A"
                  className="mt-3 inline-flex items-center gap-1.5 bg-primary-orange hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-md"
                >
                  <Mail className="w-3.5 h-3.5" />Email Us
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      </div>

      {/* Partners Grid — responsive card grid */}
      <section className="py-14 bg-slate-50 border-y border-slate-200/60 w-full" id="partners">
        <div className="text-center mb-10 px-5 md:px-[64px]">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-secondary-blue">Our Ecosystem Partners</h2>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Aligned for Local Growth</p>
        </div>

        {partners.length === 0 ? (
          <p className="text-center text-sm text-slate-400 italic px-5 md:px-[64px]">
            Partner logos will appear here once added from the admin panel.
          </p>
        ) : (
          /* Responsive grid of partner cards. Each card keeps its name + a
             short website link visible at rest (rather than only on hover),
             so the grid reads as a directory, not a logo strip. */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 px-5 md:px-[64px] max-w-[1280px] mx-auto">
            {partners.map((part) => (
              <a
                key={part.id}
                href={part.website || "#"}
                target="_blank"
                rel="noopener noreferrer"
                title={part.name}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-orange/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center p-6"
              >
                <div className="w-full h-24 flex items-center justify-center mb-4">
                  {part.logoUrl ? (
                    <img
                      alt={part.name}
                      className="max-h-20 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                      src={part.logoUrl}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <span className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-bold">
                      {(part.name || "?").charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-secondary-blue tracking-tight line-clamp-1">
                  {part.name}
                </h3>
                {part.website ? (
                  <p className="text-[11px] text-slate-500 mt-1 truncate max-w-full group-hover:text-primary-orange transition-colors">
                    {part.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Website not set</p>
                )}
              </a>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

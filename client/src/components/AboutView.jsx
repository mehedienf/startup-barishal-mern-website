import React, { useEffect, useState } from "react";
import { Rocket, Eye, Loader2, Mail, Phone, Linkedin, Facebook, Twitter } from "lucide-react";

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
          </div>
        )}
      </section>

      </div>

      {/* Partners Grid — full-bleed strip */}
      <section className="text-center py-14 bg-slate-50 border-y border-slate-200/60 w-full overflow-hidden" id="partners">
        <h2 className="text-2xl font-bold mb-3 text-secondary-blue px-5 md:px-[64px]">Our Ecosystem Partners</h2>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-8 px-5 md:px-[64px]">Aligned for Local Growth</p>

        {partners.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Partner logos will appear here once added from the admin panel.</p>
        ) : (
          /* Infinite sliding container with beautiful fading gradients */
          <div className="relative w-full overflow-hidden hover-pause before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-12 sm:before:w-28 before:bg-gradient-to-r before:from-slate-50 before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-12 sm:after:w-28 after:bg-gradient-to-l after:from-slate-50 after:to-transparent">
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
                      className="px-3 sm:px-6 py-3 sm:py-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:scale-[1.03] transition-transform w-[120px] min-[380px]:w-[145px] sm:w-[160px] h-16 sm:h-20 flex items-center justify-center text-[#5a4136] font-bold shrink-0"
                    >
                      <img
                        alt={part.name}
                        className="max-h-10 sm:max-h-12 max-w-full object-contain opacity-80"
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

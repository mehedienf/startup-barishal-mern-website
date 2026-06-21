import React from "react";
import { Rocket, Eye } from "lucide-react";

export default function AboutView() {
  return (
    <div className="animate-fadeIn py-12 md:py-20 max-w-[1280px] mx-auto px-5 md:px-[64px]">

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

      {/* Team Members Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-blue mb-3">Our Team</h2>
          <div className="w-16 h-1 bg-primary-orange mx-auto rounded mb-4"></div>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Meet the passionate individuals driving the entrepreneurial ecosystem forward in Barishal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Founder Name", designation: "Founder & CEO", role: "Overall Leadership", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces" },
            { name: "Team Member", designation: "Co-Founder", role: "Strategic Planning", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces" },
            { name: "Team Member", designation: "Operations Lead", role: "Program Management", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces" },
            { name: "Team Member", designation: "Community Manager", role: "Member Relations", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces" },
            { name: "Team Member", designation: "Technical Lead", role: "Platform Development", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces" },
            { name: "Team Member", designation: "Marketing Head", role: "Growth & Outreach", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces" },
            { name: "Team Member", designation: "Finance Manager", role: "Financial Planning", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces" },
            { name: "Team Member", designation: "Event Coordinator", role: "Program Execution", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces" },
          ].map((member, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-orange/50 hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center pt-8 pb-6 px-6"
            >
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-slate-100 shadow-md shrink-0 bg-slate-100">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-[center_20%]"
                />
              </div>
              <div className="mt-5 text-center flex flex-col items-center gap-2">
                <h3 className="font-bold text-secondary-blue text-lg">{member.name}</h3>
                <p className="text-primary-orange font-semibold text-sm">{member.designation}</p>
                <p className="text-slate-500 text-xs">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Grid */}
      <section className="text-center py-10 rounded-2xl bg-slate-50 border border-slate-200/60 overflow-hidden" id="partners">
        <h2 className="text-2xl font-bold mb-3 text-secondary-blue">Our Ecosystem Partners</h2>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-8">Aligned for Local Growth</p>

        {/* Infinite sliding container with beautiful fading gradients */}
        <div className="relative w-full overflow-hidden hover-pause before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-12 sm:before:w-28 before:bg-gradient-to-r before:from-slate-50 before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-12 sm:after:w-28 after:bg-gradient-to-l after:from-slate-50 after:to-transparent">
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
                    className="px-3 sm:px-6 py-3 sm:py-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:scale-[1.03] transition-transform w-[120px] min-[380px]:w-[145px] sm:w-[160px] h-16 sm:h-20 flex items-center justify-center text-[#5a4136] font-bold shrink-0 mx-2"
                  >
                    <img
                      alt={part.name}
                      className="max-h-10 sm:max-h-12 max-w-full object-contain opacity-80"
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

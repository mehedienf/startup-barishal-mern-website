import React, { useEffect, useState, useRef, useMemo } from "react";
import { apiFetch } from "../lib/api.js";
import {
  Users,
  Lightbulb,
  Rocket,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Mail,
  Search,
} from "lucide-react";
import Pagination from "./Pagination.jsx";

// Curated interest buckets — must stay in lockstep with MembershipView
// (admin inbox relies on the same ids).
const INTEREST_META = {
  mentorship: { label: "1:1 mentorship", icon: Lightbulb },
  cohort: { label: "Cohort / incubation", icon: Rocket },
  community: { label: "Founder community", icon: Users },
  workspace: { label: "Co-working space", icon: Briefcase },
  learning: { label: "Workshops & learning", icon: GraduationCap },
};

const PAGE_SIZE = 50;

function MemberRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-2.5 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="h-3 w-28 bg-slate-200 rounded" />
        <div className="h-2.5 w-20 bg-slate-200 rounded mt-2" />
      </td>
      <td className="p-4">
        <div className="h-3 w-40 bg-slate-200 rounded" />
        <div className="h-2.5 w-24 bg-slate-200 rounded mt-2" />
      </td>
      <td className="p-4">
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
        </div>
      </td>
      <td className="p-4">
        <div className="h-3 w-16 bg-slate-200 rounded" />
      </td>
    </tr>
  );
}

export default function MembersView({ onNavigate }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const tableContainerRef = useRef(null);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/memberships");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (err) {
      setError(
        err.message || "Could not load members right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const stats = useMemo(() => {
    const total = members.length;
    let founders = 0;
    let mentors = 0;
    let cohorts = 0;
    members.forEach((m) => {
      const interests = m.interests || [];
      if (interests.includes("cohort")) cohorts++;
      if (interests.includes("mentorship")) mentors++;
      if (interests.includes("community") || interests.includes("workspace")) founders++;
    });
    return { total, founders, mentors, cohorts };
  }, [members]);

  // Filter by name, organization, role, or email.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      return (
        (m.fullName || "").toLowerCase().includes(q) ||
        (m.organization || "").toLowerCase().includes(q) ||
        (m.role || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q)
      );
    });
  }, [members, search]);

  // Reset to page 1 whenever the search term changes.
  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="animate-fadeIn py-12 md:py-16 relative overflow-hidden">
      {/* Decorative blur orbs */}
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 bg-secondary-blue/5 rounded-full filter blur-[48px]" />
      <div className="pointer-events-none absolute -bottom-24 left-0 w-72 h-72 bg-primary-orange/5 rounded-full filter blur-[48px]" />

      <section className="relative max-w-[1100px] mx-auto px-5 md:px-[64px] text-center">
        <span className="inline-block text-[11px] font-bold text-primary-orange uppercase tracking-[0.3em] mb-4 border border-primary-orange/20 bg-primary-orange/5 px-3 py-1 rounded-full">
          Our Community
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-secondary-blue leading-tight tracking-tight">
          Meet the members powering
          <br className="hidden md:block" />
          Startup Barishal
        </h1>
        <p className="mt-5 max-w-[640px] mx-auto text-base text-slate-500 leading-relaxed">
          Founders, mentors, and operators building from southern Bangladesh.
          Browse the directory of approved members — and apply to join the next cohort.
        </p>

        {/* Stat strip */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-[760px] mx-auto">
          <StatTile label="Active members" value={stats.total} accent="orange" />
          <StatTile label="Founders" value={stats.founders} accent="blue" />
          <StatTile label="Mentors" value={stats.mentors} accent="orange" />
          <StatTile label="Cohort alumni" value={stats.cohorts} accent="blue" />
        </div>
      </section>

      <section
        ref={tableContainerRef}
        className="relative max-w-[1180px] mx-auto px-5 md:px-[64px] mt-14"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-secondary-blue tracking-tight">
              Approved Members
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Public directory of approved members. Reach out via the contact
              column to start a conversation.
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, organization, role, or email…"
              aria-label="Search members"
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-semibold mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {!loading && filtered.length === 0 ? (
            search.trim() ? (
              <div className="p-16 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-secondary-blue">
                  No members match “{search.trim()}”
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Try a different name, organization, role, or email — or
                  clear the search to see everyone.
                </p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs font-bold text-secondary-blue hover:text-primary-orange border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="p-16 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-secondary-blue">
                  No members published yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Once admins approve membership applications, accepted members
                  will show up here automatically.
                </p>
                {typeof onNavigate === "function" && (
                  <button
                    type="button"
                    onClick={() => onNavigate("membership")}
                    className="mt-2 inline-flex items-center gap-1.5 btn-primary px-5 py-2.5 text-sm font-semibold rounded-xl"
                  >
                    Apply to join <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="p-4 w-[26%]">Member</th>
                    <th className="p-4 w-[20%]">Organization / Role</th>
                    <th className="p-4 w-[20%]">Contact</th>
                    <th className="p-4 w-[22%]">Interests</th>
                    <th className="p-4 w-[12%]">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <MemberRowSkeleton key={i} />
                      ))
                    : pageItems.map((m) => {
                        const interestTags = (m.interests || [])
                          .map((id) => INTEREST_META[id])
                          .filter(Boolean);
                        // Derive avatar initials from fullName when the API
                        // doesn't ship a precomputed `initials` field.
                        const initials =
                          (m.initials && String(m.initials).trim()) ||
                          (m.fullName || "")
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase() ||
                          "?";
                        // Joined date — prefer `joinedAt`, fall back to
                        // `createdAt` which is what the API actually returns.
                        const joinedRaw = m.joinedAt || m.createdAt;
                        const joinedDisplay = joinedRaw
                          ? new Date(joinedRaw).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—";
                        return (
                          <tr
                            key={m.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 align-top">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary-orange/15 to-secondary-blue/20 text-primary-orange flex items-center justify-center font-extrabold text-sm border border-white shadow-sm">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-secondary-blue text-sm leading-tight truncate">
                                    {m.fullName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 align-top">
                              <p className="font-semibold text-slate-700 text-sm truncate">
                                {m.organization || "—"}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {m.role || "—"}
                              </p>
                            </td>
                            <td className="p-4 align-top">
                              <div className="flex flex-col gap-1">
                                {m.email ? (
                                  <a
                                    href={`mailto:${m.email}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-blue hover:text-primary-orange break-all"
                                  >
                                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                    <span className="truncate">{m.email}</span>
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400">No email</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 align-top">
                              {interestTags.length === 0 ? (
                                <span className="text-xs text-slate-400">—</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {interestTags.map(({ label, icon: Icon }) => (
                                    <span
                                      key={label}
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary-blue bg-secondary-blue/5 border border-secondary-blue/15 px-2 py-1 rounded-full"
                                    >
                                      <Icon className="w-3 h-3" />
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="p-4 align-top">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                {joinedDisplay}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="member"
            scrollRef={tableContainerRef}
          />
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative max-w-[900px] mx-auto px-5 md:px-[64px] mt-16">
        <div className="bg-gradient-to-br from-secondary-blue to-[#0b1f3a] rounded-2xl px-6 md:px-10 py-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Want to be listed here?
            </h3>
            <p className="text-white/70 text-sm mt-1 max-w-md">
              Submit a membership application and our team will review it
              within a few business days.
            </p>
          </div>
          {typeof onNavigate === "function" ? (
            <button
              type="button"
              onClick={() => onNavigate("membership")}
              className="inline-flex items-center gap-2 bg-primary-orange hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20"
            >
              Apply for Membership
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <a
              href="/membership"
              className="inline-flex items-center gap-2 bg-primary-orange hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20"
            >
              Apply for Membership
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value, accent }) {
  const accentClass =
    accent === "orange"
      ? "text-primary-orange border-primary-orange/20 bg-primary-orange/5"
      : "text-secondary-blue border-secondary-blue/20 bg-secondary-blue/5";
  return (
    <div className={`rounded-2xl border ${accentClass} px-4 py-3 backdrop-blur-sm`}>
      <div className="text-2xl md:text-3xl font-extrabold leading-none">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1.5">
        {label}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Database,
  Users,
  Mail,
  MessageSquare,
  CheckCircle,
  XSquare,
  Eye,
  Cpu,
  BookOpen,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightCircle,
  FileText
} from "lucide-react";
import { apiFetch } from "../lib/api.js";

export default function AdminConsole() {
  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, conRes, subRes] = await Promise.all([
        apiFetch("/api/applications"),
        apiFetch("/api/contacts"),
        apiFetch("/api/subscribers")
      ]);
      if (appRes.ok) setApplications(await appRes.json());
      if (conRes.ok) setContacts(await conRes.json());
      if (subRes.ok) setSubscribers(await subRes.json());
    } catch (err) {
      console.error("Error reading database files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const res = await apiFetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, notes: reviewNote })
      });
      if (res.ok) {
        setActionMessage(`Successfully updated application status to ${nextStatus}!`);
        // Refresh
        await fetchData();
        setSelectedItem(null);
        setReviewNote("");
        setTimeout(() => setActionMessage(""), 4000);
      }
    } catch (err) {
      console.error("PUT Status failure:", err);
    }
  };

  // Filter calculations
  const filteredApplications = applications.filter(a => 
    a.startupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(c => 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fadeIn py-12 md:py-16 max-w-[1280px] mx-auto px-5 md:px-[64px]">
      
      {/* DB Header section */}
      <section className="bg-gradient-to-r from-slate-900 to-[#002B47] text-white rounded-2xl p-6 md:p-8 mb-10 border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full self-start border border-emerald-500/20">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>Server-side DB Connected</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Database className="w-8 h-8 text-primary-orange shrink-0" />
            <span>Database Control Centre</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-[650px] leading-relaxed">
            This administration gateway retrieves, audits, and persists records directly inside the <strong>db.json</strong> file on our Node.js and Express backend server. Use this portal to test dynamic reactive data actions!
          </p>
        </div>

        <button 
          onClick={fetchData}
          className="bg-primary-orange hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          Refresh
        </button>
      </section>

      {/* Dynamic database sizing counters cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Cohort Submissions</span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-secondary-blue mt-1">{applications.length}</h3>
            </div>
            <div className="p-2 bg-blue-100/60 rounded-lg text-secondary-blue">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Contact Messages</span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#d95a00] mt-1">{contacts.length}</h3>
            </div>
            <div className="p-2 bg-orange-100/60 rounded-lg text-primary-orange">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Newsletter Units</span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-700 mt-1">{subscribers.length}</h3>
            </div>
            <div className="p-2 bg-emerald-100/60 rounded-lg text-emerald-600">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">MERN Architecture</span>
          <p className="text-xs font-bold text-slate-700 mt-2 leading-relaxed">
            Standard React UI paired with an live Node &amp; Express routing engine executing local JSON DB queries.
          </p>
        </div>
      </section>

      {/* Tabs list Controls & Search bar */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 pb-4">
        
        {/* Navigation tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 max-w-full w-full scroll-smooth flex-nowrap shrink-0">
          {[
            { id: 'applications', label: 'Incubator Applicants', count: applications.length },
            { id: 'contacts', label: 'Contact Inquiries', count: contacts.length },
            { id: 'subscribers', label: 'Newsletter list', count: subscribers.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm("");
                setSelectedItem(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider cursor-pointer border select-none transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-secondary-blue text-white border-secondary-blue shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic Context Search */}
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder={`Search across DB...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

      </section>

      {/* Feedback panel notifications inline */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-350 text-emerald-800 p-4 rounded-xl text-sm font-semibold mb-6 animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Responsive Table Swiping Indicator for Mobile/Tablets */}
      <div className="flex lg:hidden justify-end mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 select-none animate-pulse">
          ← Swipe left/right to view full columns →
        </span>
      </div>

      {/* Primary DB Lists Table layout */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-orange animate-spin"></div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing database values...</span>
          </div>
        ) : (
          <>
            {/* Applications List */}
            {activeTab === 'applications' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="p-4">Reference Code</th>
                      <th className="p-4">Founder &amp; Project Info</th>
                      <th className="p-4">Status &amp; Auditing</th>
                      <th className="p-4">Enrollment Stage</th>
                      <th className="p-4">Custom Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-xs text-slate-405">
                          No cohort applications found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono text-xs font-bold text-slate-500 uppercase">{app.id}</td>
                          <td className="p-4">
                            <p className="font-bold text-[#191c1e] text-sm">{app.startupName}</p>
                            <p className="text-xs text-slate-500 font-medium">Lead: {app.fullName} ({app.email})</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold leading-none border ${
                              app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                              app.status === 'Declined' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {app.status}
                            </span>
                            {app.notes && (
                              <p className="text-[11px] text-emerald-700/85 mt-1 max-w-[200px] line-clamp-1 italic">
                                Note: {app.notes}
                              </p>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-semibold text-secondary-blue bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                              {app.stage}
                            </span>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => {
                                setSelectedItem(app);
                                setReviewNote(app.notes || "");
                              }}
                              className="text-secondary-blue hover:text-primary-orange hover:bg-slate-100 p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shrink-0"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>Audit Applicant</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Contacts Inquiry List */}
            {activeTab === 'contacts' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="p-4">Created Details</th>
                      <th className="p-4">User Contact Info</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Message Log Body</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-20 text-center text-xs text-slate-405">
                          No contact inquiry logs found.
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map((con) => (
                        <tr key={con.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-xs font-mono text-slate-400">
                            {new Date(con.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-medium">
                            <p className="font-bold text-[#191c1e]">{con.firstName} {con.lastName}</p>
                            <p className="text-xs text-slate-500">{con.email}</p>
                          </td>
                          <td className="p-4 font-semibold text-secondary-blue">{con.subject}</td>
                          <td className="p-4 max-w-[340px]">
                            <p className="text-slate-655 text-xs leading-relaxed line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              {con.message}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Newsletter Subscription emails */}
            {activeTab === 'subscribers' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="p-4">Subscription Date</th>
                      <th className="p-4">Active Database Email</th>
                      <th className="p-4">Audit Trace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-20 text-center text-xs text-slate-405">
                          No subscribers stored currently.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-xs font-mono text-slate-400">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-semibold text-slate-700">{sub.email}</td>
                          <td className="p-4 text-xs text-emerald-600 font-bold">Active Double Opt-In</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* Auditing Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-[600px] w-full p-6 border border-slate-200 shadow-2xl relative animate-scaleIn">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-450 uppercase uppercase tracking-wider block">Auditing Candidate Detail</span>
                <h3 className="text-xl font-bold text-secondary-blue mt-0.5">{selectedItem.startupName}</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-lg p-1.5"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block">Proposed Team Lead:</span>
                  <span className="font-bold text-[#191c1e]">{selectedItem.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Pitch Phase:</span>
                  <span className="font-bold text-secondary-blue">{selectedItem.stage}</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-slate-400 block">Candidate Email:</span>
                  <span className="font-medium text-slate-600">{selectedItem.email}</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-slate-400 block">Current Status:</span>
                  <span className="font-semibold text-amber-800">{selectedItem.status}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-455 block font-bold uppercase tracking-wider mb-1">Company Pitch Summary</span>
                <p className="text-slate-700 text-xs md:text-sm bg-[#F8FAFC] border border-slate-200 p-3 rounded-lg leading-relaxed max-h-[120px] overflow-y-auto">
                  {selectedItem.description}
                </p>
              </div>

              {/* Status Update Options */}
              <div className="mt-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="reviewNote">Custom Assessment Notes</label>
                <input 
                  type="text" 
                  id="reviewNote"
                  placeholder="e.g., Outstanding founders, workspace desk allocated"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary-orange focus:border-primary-orange outline-none transition-all w-full"
                />
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 justify-end">
                <button 
                  onClick={() => handleUpdateStatus(selectedItem.id, 'Declined')}
                  className="bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-100 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Decline</span>
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedItem.id, 'Reviewed')}
                  className="bg-slate-100 text-slate-700 border border-slate-250 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Mark Reviewed</span>
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedItem.id, 'Approved')}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-250 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-100 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Approve Cohort</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

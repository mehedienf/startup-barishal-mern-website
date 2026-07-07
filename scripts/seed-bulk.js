// One-shot seed script: pads db.json with ~100 synthetic entries per inbox
// resource (subscribers, applications, contacts) so the admin panel can
// exercise pagination, filter chips, and bulk-delete end-to-end.
//
// Run from the project root with:
//     node scripts/seed-bulk.js
//
// Safe to run multiple times: it skips the header seeds (those with
// rich-content ids like sub-1, app-9876) and only ever appends, never
// deletes. To re-seed, edit DB_PATH below or delete generated ids.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "server", "data", "db.json");

const COUNT_PER_RESOURCE = 100;
const BATCH_TAG = "seed-bulk"; // every generated id starts with this so we can identify and wipe later

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(n, w = 4) {
  return String(n).padStart(w, "0");
}

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const rng = seededRandom(20260708);

const FIRST_NAMES = [
  "Sabbir", "Nadia", "Tahmid", "Sumaiya", "Mehedi", "Zamil", "Tahmina",
  "Rashed", "Afsana", "Sohan", "Riyad", "Mim", "Tasnim", "Iftekhar", "Puja",
  "Sajid", "Nazia", "Faisal", "Maruf", "Shirin", "Rohit", "Pranto", "Ayon",
  "Labib", "Farzana", "Taher", "Anika", "Nazmul", "Sadia", "Rimon",
];
const LAST_NAMES = [
  "Hassan", "Islam", "Rahman", "Akter", "Hasan", "Ahmed", "Karim",
  "Khan", "Molla", "Biswas", "Chowdhury", "Alam", "Sarker", "Roy",
  "Das", "Barua", "Jamil", "Tuli", "Sultana", "Begum",
];

const STAGES = ["Idea", "Prototype", "Early Traction", "Scaling"];
const STATUSES = ["Pending", "Approved", "Declined", "Reviewed"];
const STAGE_WEIGHT = ["Idea", "Idea", "Prototype", "Prototype", "Early Traction", "Scaling"];
const STATUS_WEIGHT = ["Pending", "Pending", "Pending", "Approved", "Declined", "Reviewed"];

const EMAIL_DOMAINS = [
  "gmail.com", "outlook.com", "yahoo.com", "startup.bd", "barishalhub.org",
  "iut.ac.bd", "cu.ac.bd", "du.ac.bd", "ku.ac.bd", "bracu.ac.bd",
];
const SUBJECTS = ["Partnership", "Mentorship", "Sponsorship", "General Inquiry", "Incubation Program", "Press"];
const CITIES = ["Dhaka", "Barishal", "Chattogram", "Sylhet", "Khulna", "Rajshahi"];

const STARTUP_PREFIXES = ["Green", "Smart", "Agri", "Edu", "Fin", "Medi", "Aqua", "Logi", "Tech", "Cloud"];
const STARTUP_SUFFIXES = ["Barishal", "Delta", "Wave", "Lab", "Hub", "Works", "Network", "Studio", "Connect", "Forge"];

const STOCK_MESSAGES = {
  Partnership: "We represent a regional micro-angel syndicate actively scouting seed-stage founders in the Barishal division. Could we schedule a 30-minute introductory call next week to discuss potential co-investment opportunities and warm intros to our network?",
  Mentorship: "I'm a final-year CSE student at Barishal University with a working prototype in the agritech space. Would love to get structural mentoring on business registration, fundraising strategy, and MVP scoping from anyone on your team.",
  Sponsorship: "Our organization runs an annual regional impact summit and we'd like to explore Startup Barishal as a community partner — primarily through speaker slots, workshop space, and a sponsorship package that fits your current budget.",
  "General Inquiry": "Hello team — curious about the upcoming cohort timing, the application timeline, and whether remote founders from outside Barishal division are eligible to apply. Any guidance appreciated.",
  "Incubation Program": "I'm applying on behalf of a 3-person team building a B2B SaaS for regional pharmacies. We have an early prototype, paying pilot customers, and would benefit from the structured workspace and mentor network you provide.",
  Press: "Journalist with a regional business publication writing a feature on the Barishal ecosystem. Could your comms lead share recent milestones, founder spotlights, and any press kit assets? Happy to coordinate interview timing.",
};

const APP_DESCRIPTIONS = [
  "An AI-assisted logistics platform matching regional perishable-goods suppliers with last-mile cold-chain capacity to reduce spoilage across southern Bangladesh.",
  "An offline-first interactive learning kit pairing regional primary-school syllabi with global computer-science curriculum standards and accessible teacher training.",
  "A B2B SaaS for micro-pharmacies that automates inventory reconciliation, vendor reordering, and expiry tracking using lightweight barcode workflows.",
  "A mobile-first agricultural advisory service that turns satellite soil data into per-plot fertilizer recommendations and helps farmers finance inputs in instalments.",
  "A climate-tech mesh of low-cost river-quality sensors streaming open data to fishermen and municipal planners around the Barishal delta.",
  "An HR-tech platform helping Bangladeshi garment factories digitize attendance, payroll, and grievance workflows across multi-site operations.",
  "A fintech rails layer that lets smallholders pool harvests, take warehouse receipts, and unlock working-capital credit at lower cost than informal lending.",
  "An edtech analytics suite for university admins surfacing early-warning signals on dropout risk across regional public universities.",
  "A vertical SaaS for clinic chains digitizing patient intake, prescription refills, and basic diagnostic-history sharing in low-bandwidth settings.",
  "An aquaculture marketplace connecting Barishal shrimp farmers directly with HORECA buyers and exporters via traceable provenance and forward contracts.",
];

const DATE_MS_DAY = 24 * 60 * 60 * 1000;
const today = new Date("2026-07-08T00:00:00.000Z").getTime();

// Generate timestamps spanning ~120 days so month-filter chips have material.
function randomDate() {
  const offsetDays = Math.floor(rng() * 120);
  const offsetHours = Math.floor(rng() * 24);
  const offsetMinutes = Math.floor(rng() * 60);
  const ms = today - offsetDays * DATE_MS_DAY - offsetHours * 60 * 60 * 1000 - offsetMinutes * 60 * 1000;
  return new Date(ms).toISOString();
}

function rngFromOffset(i) {
  return seededRandom(20260708 + i);
}

function buildSubscribers() {
  const items = [];
  for (let i = 0; i < COUNT_PER_RESOURCE; i++) {
    const r = rngFromOffset(i);
    const fn = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)].toLowerCase();
    const ln = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)].toLowerCase();
    const dom = EMAIL_DOMAINS[Math.floor(r() * EMAIL_DOMAINS.length)];
    items.push({
      id: `sub-${BATCH_TAG}-${pad(i + 1)}`,
      email: `${fn}.${ln}${Math.floor(r() * 999)}@${dom}`,
      createdAt: randomDate(),
    });
  }
  return items;
}

function buildApplications() {
  const items = [];
  for (let i = 0; i < COUNT_PER_RESOURCE; i++) {
    const r = rngFromOffset(i + 1000);
    const fn = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)];
    const pre = STARTUP_PREFIXES[Math.floor(r() * STARTUP_PREFIXES.length)];
    const suf = STARTUP_SUFFIXES[Math.floor(r() * STARTUP_SUFFIXES.length)];
    const stage = STAGE_WEIGHT[Math.floor(r() * STAGE_WEIGHT.length)];
    const status = STATUS_WEIGHT[Math.floor(r() * STATUS_WEIGHT.length)];
    const teamSize = 1 + Math.floor(r() * 7);
    const dom = EMAIL_DOMAINS[Math.floor(r() * EMAIL_DOMAINS.length)];
    items.push({
      id: `app-${BATCH_TAG}-${pad(i + 1)}`,
      fullName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(r() * 999)}@${dom}`,
      startupName: `${pre}${suf}`,
      stage,
      description: APP_DESCRIPTIONS[Math.floor(r() * APP_DESCRIPTIONS.length)],
      teamSize,
      status,
      programName: ["Early-Stage Cohort", "Scale Catalyst", "Founder-in-Residence"][Math.floor(r() * 3)],
      createdAt: randomDate(),
    });
  }
  return items;
}

function buildContacts() {
  const items = [];
  for (let i = 0; i < COUNT_PER_RESOURCE; i++) {
    const r = rngFromOffset(i + 2000);
    const fn = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)];
    const subject = SUBJECTS[Math.floor(r() * SUBJECTS.length)];
    const dom = EMAIL_DOMAINS[Math.floor(r() * EMAIL_DOMAINS.length)];
    const city = CITIES[Math.floor(r() * CITIES.length)];
    items.push({
      id: `msg-${BATCH_TAG}-${pad(i + 1)}`,
      firstName: fn,
      lastName: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(r() * 999)}@${dom}`,
      subject,
      message: `${STOCK_MESSAGES[subject]} — sent from ${city}.`,
      createdAt: randomDate(),
    });
  }
  return items;
}

const dbRaw = fs.readFileSync(DB_PATH, "utf8");
const db = JSON.parse(dbRaw);

const existingSubIds = new Set((db.subscribers || []).map((s) => s.id));
const existingAppIds = new Set((db.applications || []).map((a) => a.id));
const existingMsgIds = new Set((db.contacts || []).map((c) => c.id));

const newSubs = buildSubscribers().filter((s) => !existingSubIds.has(s.id));
const newApps = buildApplications().filter((a) => !existingAppIds.has(a.id));
const newContacts = buildContacts().filter((c) => !existingMsgIds.has(c.id));

db.subscribers = [...(db.subscribers || []), ...newSubs];
db.applications = [...(db.applications || []), ...newApps];
db.contacts = [...(db.contacts || []), ...newContacts];

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + "\n", "utf8");

console.log(`Padded db.json:`);
console.log(`  subscribers: ${db.subscribers.length} (added ${newSubs.length})`);
console.log(`  applications: ${db.applications.length} (added ${newApps.length})`);
console.log(`  contacts:     ${db.contacts.length} (added ${newContacts.length})`);

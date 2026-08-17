/* =====================================================================
   ROADMAP DATA  —  this is the only file you need to edit week to week.
   =====================================================================
   Everything on the dashboard is rendered from this one object.
   Add a task here and it appears in the Timeline, the List and the Board
   automatically. Nothing in assets/ needs to change.

   TASK FIELDS
     id        unique string, e.g. "t-101"
     title     what shows on the card
     note      optional one-line "why" / impact statement
     team      must match a `teams[].id` below
     status    one of: request | none | backlog | committed | design |
                       ready | progress | done
     people    array of `people[].id`
     start/end "YYYY-MM-DD" (end is inclusive)
     subtasks  optional { done: 0, total: 3 }
     ref       optional external ticket key, e.g. "PLA-842"
     impact    optional text shown in the List view's Impact column
   ===================================================================== */

window.ROADMAP_DATA = {
  /* ---------- meta ------------------------------------------------- */
  meta: {
    orgName: "Company",
    // Set to a fixed "YYYY-MM-DD" to freeze the dashboard to a reporting
    // date, or leave null to always use the real today.
    today: "2026-08-17",
    yearEnd: "2026-12-31",
  },

  /* ---------- the one number everything ladders up to -------------- */
  goal: {
    label: "Company goal",
    title: "Reach $20M ARR by end of year",
    current: 10_400_000,
    target: 20_000_000,
    unit: "ARR",
    format: "currency",
    asOf: "Last month",
  },

  /* ---------- teams / initiatives ---------------------------------- */
  /* `slot` is the categorical colour slot (1-8). Assign in fixed order;
     never recycle a slot onto a second team. Teams past slot 8 use
     "other", a neutral grey, so no two teams share an identity colour. */
  teams: [
    { id: "core",   name: "Core product & intelligence", short: "Core product",  slot: 1,
      mission: "Delight user + no churn",       current: 11_000_000, target: 20_000_000, unit: "ARR",  trend: 0.10 },
    { id: "event",  name: "Event cloud",                 short: "Event cloud",   slot: 2,
      mission: "Get $1M in contracts by EOY",   current: 0,          target: 1_000_000,  unit: "",     trend: null },
    { id: "bottom", name: "Bottom up",                   short: "Bottom-up",     slot: 3,
      mission: "Self-serve revenue",            current: 240_000,    target: 2_000_000,  unit: "ARR",  trend: 240_000, trendAbs: true },
    { id: "auto",   name: "Automation",                  short: "Automation",    slot: 4, mission: "Internal leverage" },
    { id: "impl",   name: "Implementation",              short: "Implementation",slot: 5, mission: "Get logos launched" },
    { id: "infra",  name: "Infra",                       short: "Infra",         slot: 6, mission: "Keep the lights on" },
    { id: "fin",    name: "Finance",                     short: "Finance",       slot: 7, mission: "Cash + margin" },
    { id: "cs",     name: "CS",                          short: "CS",            slot: 8, mission: "Retention" },
    { id: "gtm",    name: "GTM",                         short: "GTM",           slot: "other" },
    { id: "mkt",    name: "Marketing",                   short: "Marketing",     slot: "other" },
    { id: "supply", name: "Supply",                      short: "Supply",        slot: "other" },
    { id: "none",   name: "No team",                     short: "No team",       slot: "other" },
  ],

  /* Which teams get a swimlane on the Timeline, in order. */
  timelineTeams: ["core", "event", "bottom", "auto", "impl", "infra"],

  /* ---------- sprints ---------------------------------------------- */
  sprints: [
    { id: 7,  name: "Sprint 7",  start: "2026-07-20", end: "2026-08-02" },
    { id: 8,  name: "Sprint 8",  start: "2026-08-03", end: "2026-08-16",
      theme: "Sharpen the AI-native experience: guide users through the product" },
    { id: 9,  name: "Sprint 9",  start: "2026-08-17", end: "2026-08-30" },
    { id: 10, name: "Sprint 10", start: "2026-08-31", end: "2026-09-13" },
    { id: 11, name: "Sprint 11", start: "2026-09-14", end: "2026-09-27" },
    { id: 12, name: "Sprint 12", start: "2026-09-28", end: "2026-10-11" },
  ],

  /* ---------- people ------------------------------------------------ */
  /* role: pm | designer | engineer | growth | other                     */
  people: [
    { id: "iris",    name: "Iris",           team: "auto",   role: "pm" },
    { id: "jungwoon",name: "Jungwoon",       team: "auto",   role: "designer" },
    { id: "sehal",   name: "Sehal",          team: "auto",   role: "engineer", available: true },
    { id: "thai",    name: "Thai",           team: "auto",   role: "engineer", available: true },
    { id: "tj",      name: "Tj",             team: "auto",   role: "engineer", available: true, next: "Scope the call capture tool with CS" },

    { id: "chen",    name: "Chen",           team: "core",   role: "pm" },
    { id: "nina",    name: "Nina",           team: "core",   role: "designer" },
    { id: "allan",   name: "Allan",          team: "core",   role: "engineer" },
    { id: "karim",   name: "Karim",          team: "core",   role: "engineer", available: true },
    { id: "matt",    name: "Matt",           team: "core",   role: "engineer" },
    { id: "nikola",  name: "Nikola",         team: "core",   role: "engineer", available: true },
    { id: "yann",    name: "Yann",           team: "core",   role: "engineer" },

    { id: "emeric",  name: "Emeric Noël",    team: "event",  role: "pm" },
    { id: "denny",   name: "Denny",          team: "event",  role: "designer" },
    { id: "ceyhun",  name: "Ceyhun",         team: "event",  role: "engineer", available: true },
    { id: "eric",    name: "Eric",           team: "event",  role: "engineer", available: true },
    { id: "ervin",   name: "Ervin",          team: "event",  role: "engineer" },
    { id: "hiba",    name: "Hiba",           team: "event",  role: "engineer", available: true },

    { id: "owen",    name: "Owen",           team: "impl",   role: "pm" },
    { id: "italo",   name: "Italo",          team: "impl",   role: "engineer", available: true },
    { id: "osman",   name: "Osman",          team: "impl",   role: "engineer" },
    { id: "rubens",  name: "Rubens",         team: "impl",   role: "engineer", available: true, next: "CitiBank Integration" },
    { id: "dylan",   name: "Dylan",          team: "impl",   role: "other" },

    { id: "alex",    name: "Alex Beauchemin",team: "infra",  role: "engineer" },

    { id: "naureen", name: "Naureen",        team: "bottom", role: "growth" },
    { id: "yueran",  name: "Yueran",         team: "bottom", role: "engineer", available: true },

    { id: "cooper",  name: "Cooper",         team: "gtm",    role: "other" },
    { id: "liv",     name: "Liv",            team: "gtm",    role: "other" },
    { id: "logan",   name: "Logan",          team: "gtm",    role: "other" },
    { id: "marc",    name: "Marc",           team: "gtm",    role: "other" },

    { id: "felix",   name: "Felix",          team: "fin",    role: "other" },
    { id: "myriam",  name: "Myriam",         team: "cs",     role: "other" },

    { id: "charlie", name: "Charlie",        team: "mkt",    role: "other" },
    { id: "janine",  name: "Janine",         team: "mkt",    role: "other" },
    { id: "preslea", name: "Preslea",        team: "mkt",    role: "other" },

    { id: "erica",   name: "Erica",          team: "supply", role: "other" },

    { id: "anis",    name: "Anis",           team: "none",   role: "designer" },
    { id: "rohit",   name: "Rohit",          team: "none",   role: "engineer", available: true },
  ],

  /* Headcount that exists in the org but isn't listed individually above.
     Keeps the team-composition counts honest without inventing names. */
  headcountPadding: { none: 37 },

  /* ---------- tasks ------------------------------------------------- */
  tasks: [
    /* ===== Core product & intelligence ===== */
    { id: "t-1",  title: "Improved guidance in AI-chat", team: "core", status: "progress",
      people: ["yann", "nina"], start: "2026-08-03", end: "2026-08-15" },
    { id: "t-2",  title: "AI Tool Call Permissions", note: "Enable MCP use case for OpenAI / public release",
      team: "core", status: "done", people: ["ervin"], start: "2026-08-03", end: "2026-08-12", subtasks: { done: 1, total: 1 } },
    { id: "t-3",  title: "V2 of AI Generated Text Aligning with Planner Voice", note: "Increase adoption for CS team on Plans",
      team: "core", status: "done", people: ["matt"], start: "2026-08-03", end: "2026-08-14" },
    { id: "t-4",  title: "MCP – Explore using views for guaranteeing safe access", note: "Enable MCP reporting for OpenAI",
      team: "core", status: "done", people: ["rubens"], start: "2026-08-04", end: "2026-08-14" },
    { id: "t-5",  title: "Supplier identity improvement in conversation", note: "Quality — CSM + clients know who they're talking to",
      team: "core", status: "done", people: ["nikola"], start: "2026-08-05", end: "2026-08-16" },
    { id: "t-6",  title: "Improve dedupe flow", note: "Cleaner discovery results",
      team: "core", status: "done", people: ["allan"], start: "2026-08-03", end: "2026-08-09" },
    { id: "t-7",  title: "Separate filter for venue type", note: "Event planners choose faster",
      team: "core", status: "done", people: ["allan"], start: "2026-08-10", end: "2026-08-16" },

    { id: "t-8",  title: "Speed up time to supplier response", team: "core", status: "none",
      people: ["chen"], start: "2026-08-17", end: "2026-08-25" },
    { id: "t-9",  title: "Activity log / Agent interface / Time log", team: "core", status: "none",
      people: ["karim", "nina"], start: "2026-08-17", end: "2026-08-27" },
    { id: "t-10", title: "AI-native – OAI Feedback & Rollout", team: "core", status: "committed",
      people: ["yann"], start: "2026-08-17", end: "2026-08-28" },
    { id: "t-11", title: "Off-platform contract signature flow", team: "core", status: "backlog",
      people: ["nikola"], start: "2026-08-17", end: "2026-08-29" },
    { id: "t-12", title: "Billing process automations", team: "core", status: "none",
      people: ["nikola"], start: "2026-08-18", end: "2026-08-30" },

    { id: "t-13", title: "Improve Cold Start of User Profile", team: "core", status: "none",
      people: ["matt"], start: "2026-08-31", end: "2026-09-09" },
    { id: "t-14", title: "Memory system <> Plan system", team: "core", status: "none",
      people: [], start: "2026-08-31", end: "2026-09-25" },
    { id: "t-15", title: "External supplier shortlist to inquiry", team: "core", status: "none",
      people: ["yann"], start: "2026-08-31", end: "2026-09-06" },
    { id: "t-16", title: "Multi-Language", team: "core", status: "backlog",
      people: [], start: "2026-09-28", end: "2026-10-03" },

    /* Core — shipped earlier, shows up in List + Board "Done" */
    { id: "t-20", title: "AI-Native Launch for Sales", team: "core", status: "done", people: ["chen"],
      start: "2026-06-25", end: "2026-07-11", impact: "Start GTM TOFU motion for AI-native platform" },
    { id: "t-21", title: "Event creation (Journey)", team: "core", status: "done", people: ["ervin"],
      start: "2026-07-25", end: "2026-08-01", subtasks: { done: 1, total: 1 } },
    { id: "t-22", title: "Event brief (per category)", team: "core", status: "done", people: ["yann"],
      start: "2026-06-14", end: "2026-06-25", impact: "Enable better sourcing procedure" },
    { id: "t-23", title: "Web suppliers in marketplace", team: "core", status: "done", people: ["matt"],
      start: "2026-06-26", end: "2026-07-11" },
    { id: "t-24", title: "Chat tools / agents for attendee support", team: "core", status: "done", people: ["rohit"],
      start: "2026-07-09", end: "2026-07-16" },
    { id: "t-25", title: "Overview modules (RSVP, hotel block, agenda)", team: "core", status: "done", people: ["ervin"],
      start: "2026-07-01", end: "2026-07-10" },
    { id: "t-26", title: "Cut over internal spaces to AI-native", team: "core", status: "done", people: ["ceyhun"],
      start: "2026-06-22", end: "2026-07-02" },
    { id: "t-27", title: "Cut over inbox widgets to AI-native", team: "core", status: "done", people: ["eric"],
      start: "2026-06-10", end: "2026-06-22" },
    { id: "t-28", title: "Adjustments for AI-native for certain customers", team: "core", status: "done", people: ["yann"],
      start: "2026-07-13", end: "2026-07-18" },
    { id: "t-29", title: "Pre-fill event brief via chat message", team: "core", status: "done", people: ["yann"],
      start: "2026-07-02", end: "2026-07-05" },
    { id: "t-30", title: "AI Chat Upload File OC", team: "core", status: "done", people: ["eric"],
      start: "2026-07-14", end: "2026-07-17" },
    { id: "t-31", title: "Platform/Company/User insight surfacing", team: "core", status: "done", people: ["yann"],
      start: "2026-06-21", end: "2026-06-26" },
    { id: "t-32", title: "Event status", team: "core", status: "done", people: ["yann"],
      start: "2026-07-16", end: "2026-07-19" },
    { id: "t-33", title: "UI V2 Final Touches and QA", team: "core", status: "done", people: ["eric"],
      start: "2026-06-11", end: "2026-06-20", subtasks: { done: 4, total: 4 } },
    { id: "t-34", title: "Fallback to Google place photos in web", team: "core", status: "done", people: ["allan"],
      start: "2026-07-16", end: "2026-07-23" },

    /* ===== Event cloud ===== */
    { id: "t-40", title: "Custom Registration Forms/path", team: "event", status: "ready",
      people: ["eric"], start: "2026-08-17", end: "2026-08-29" },
    { id: "t-41", title: "Custom-Branded Event Website", note: "Build a custom branded site in days instead of weeks",
      team: "event", status: "ready", people: ["hiba"], start: "2026-08-17", end: "2026-08-29", ref: "PLA-1455" },
    { id: "t-42", title: "Ticketing + payments & remittance", team: "event", status: "ready",
      people: ["ceyhun"], start: "2026-08-17", end: "2026-08-29" },
    { id: "t-43", title: "Core architecture", team: "event", status: "progress",
      people: ["ervin"], start: "2026-08-17", end: "2026-08-28" },
    { id: "t-44", title: "MVP demo", team: "event", status: "progress",
      people: ["emeric", "denny"], start: "2026-08-18", end: "2026-08-28" },
    { id: "t-45", title: "AI guided flow DEMO", team: "event", status: "committed",
      people: ["chen"], start: "2026-08-24", end: "2026-08-30" },

    { id: "t-46", title: "Surveys & feedback", team: "event", status: "committed",
      people: [], start: "2026-08-31", end: "2026-09-11" },
    { id: "t-47", title: "Badge creation", team: "event", status: "committed",
      people: [], start: "2026-08-31", end: "2026-09-11" },
    { id: "t-48", title: "Reporting on attendee", team: "event", status: "committed",
      people: [], start: "2026-08-31", end: "2026-09-11" },
    { id: "t-49", title: "Speaker management", team: "event", status: "committed",
      people: [], start: "2026-08-31", end: "2026-09-11" },
    { id: "t-50", title: "Persistent attendee profiles", team: "event", status: "backlog",
      people: [], start: "2026-08-31", end: "2026-09-11" },
    { id: "t-51", title: "Mobile event app", team: "event", status: "committed",
      people: [], start: "2026-09-01", end: "2026-09-13", subtasks: { done: 0, total: 3 } },
    { id: "t-52", title: "Comms autopilot (AI manages guests for you)", team: "event", status: "committed",
      people: [], start: "2026-09-02", end: "2026-09-13" },

    { id: "t-53", title: "Attendee Types / Group Management + waitlist", team: "event", status: "design",
      people: ["denny"], start: "2026-09-14", end: "2026-09-26" },
    { id: "t-54", title: "Cancellation/Modification Management", team: "event", status: "committed",
      people: [], start: "2026-09-14", end: "2026-09-25" },
    { id: "t-55", title: "Email Marketing & comm templates", team: "event", status: "committed",
      people: [], start: "2026-09-14", end: "2026-09-25" },
    { id: "t-56", title: "Checkin (QR code)", team: "event", status: "committed",
      people: [], start: "2026-09-14", end: "2026-09-25" },
    { id: "t-57", title: "Sessions & agenda builder", team: "event", status: "committed",
      people: [], start: "2026-09-15", end: "2026-09-27" },
    { id: "t-58", title: "Onsite printing & kiosks", team: "event", status: "committed",
      people: [], start: "2026-09-28", end: "2026-10-09" },

    /* ===== Bottom up ===== */
    { id: "t-60", title: "Setup audience", team: "bottom", status: "done",
      people: ["naureen"], start: "2026-06-22", end: "2026-06-30" },
    { id: "t-61", title: "Launch planner landing page", team: "bottom", status: "done",
      people: ["yueran"], start: "2026-06-28", end: "2026-07-04" },
    { id: "t-62", title: "Planner self-onboarding v1", team: "bottom", status: "done",
      people: ["yueran"], start: "2026-06-21", end: "2026-07-07" },
    { id: "t-63", title: "Ads LinkedIn", team: "bottom", status: "done",
      people: ["naureen"], start: "2026-07-02", end: "2026-07-05", subtasks: { done: 0, total: 1 } },
    { id: "t-64", title: "Launch HeyReach (20 accounts)", team: "bottom", status: "done",
      people: ["naureen"], start: "2026-07-06", end: "2026-07-14" },
    { id: "t-65", title: "Watch every session / talk with every user", team: "bottom", status: "none",
      people: [], start: "2026-06-29", end: "2026-07-06" },
    { id: "t-66", title: "1 event created / 7 meetings booked", team: "bottom", status: "none",
      people: [], start: "2026-06-19", end: "2026-06-26" },
    { id: "t-67", title: "Self-serve pricing experiment", team: "bottom", status: "progress",
      people: ["yueran"], start: "2026-08-17", end: "2026-08-28" },
    { id: "t-68", title: "Activation email sequence", team: "bottom", status: "committed",
      people: ["naureen"], start: "2026-08-31", end: "2026-09-11" },

    /* ===== Automation ===== */
    { id: "t-70", title: "Calls captured in Plans", team: "auto", status: "none",
      people: [], start: "2026-08-31", end: "2026-09-12" },
    { id: "t-71", title: "Event gap analysis", team: "auto", status: "none",
      people: ["denny"], start: "2026-08-31", end: "2026-09-17" },
    { id: "t-72", title: "Scope the call capture tool with CS", team: "auto", status: "committed",
      people: ["tj"], start: "2026-08-17", end: "2026-08-28" },
    { id: "t-73", title: "CS portal hardening", team: "auto", status: "progress",
      people: ["sehal"], start: "2026-08-17", end: "2026-08-30" },
    { id: "t-74", title: "Internal OS rollout prep", team: "auto", status: "committed",
      people: ["thai"], start: "2026-09-14", end: "2026-09-28" },

    /* ===== Implementation ===== */
    { id: "t-80", title: "ISOS Integration", note: "Unlocks more EY deals and clears the path for other enterprise logos",
      team: "impl", status: "progress", people: ["osman"], start: "2026-06-22", end: "2026-07-08",
      ref: "PLA-41", subtasks: { done: 0, total: 1 } },
    { id: "t-81", title: "CitiBank Integration", note: "Facilitate integration",
      team: "impl", status: "none", people: ["rubens"], start: "2026-08-26", end: "2026-09-07" },
    { id: "t-82", title: "Semantic Reporting", note: "Improve spend/finance insights",
      team: "impl", status: "none", people: [], start: "2026-08-22", end: "2026-09-03" },
    { id: "t-83", title: "Deeper Sourcing Insights", team: "impl", status: "design",
      people: ["allan"], start: "2026-08-14", end: "2026-08-26" },
    { id: "t-84", title: "EY: Reporting updates", team: "impl", status: "none",
      people: [], start: "2026-06-22", end: "2026-06-30" },
    { id: "t-85", title: "Off-platform & contracting", team: "impl", status: "none",
      people: [], start: "2026-06-15", end: "2026-06-23" },
    { id: "t-86", title: "Onboarding & event-brief wizard", team: "impl", status: "none",
      people: [], start: "2026-06-15", end: "2026-06-22" },
    { id: "t-87", title: "Task execution UI", team: "impl", status: "none",
      people: [], start: "2026-06-15", end: "2026-06-22" },
    { id: "t-88", title: "Externally signed contracts in platform (Settings)", team: "impl", status: "none",
      people: [], start: "2026-06-22", end: "2026-06-30" },

    /* ===== Infra ===== */
    { id: "t-90", title: "Infra-wide runtime upgrade", team: "infra", status: "committed",
      people: ["alex"], start: "2026-07-27", end: "2026-08-08", ref: "PLA-842", subtasks: { done: 0, total: 2 } },
    { id: "t-91", title: "Fallow Static Analysis", note: "Improve code quality of AI codegen",
      team: "infra", status: "committed", people: ["alex"], start: "2026-08-24", end: "2026-09-04" },
    { id: "t-92", title: "Supply chain attacks mitigation", note: "Improve security so devs don't handle supply-chain risk by hand",
      team: "infra", status: "committed", people: ["alex"], start: "2026-08-10", end: "2026-08-15", ref: "PLA-446" },
    { id: "t-93", title: "Fix VPC/NAT issues", team: "infra", status: "committed",
      people: ["alex"], start: "2026-08-17", end: "2026-08-22", ref: "PLA-735" },
    { id: "t-94", title: "Improve pubsub implementation", team: "infra", status: "committed",
      people: ["alex"], start: "2026-08-17", end: "2026-08-22" },
    { id: "t-95", title: "Cloud functions migrations to Gen2", note: "Unblock runtime upgrade",
      team: "infra", status: "progress", people: ["alex"], start: "2026-07-09", end: "2026-08-01", ref: "PLA-141" },

    /* ===== GTM / Finance / CS / Marketing ===== */
    { id: "t-100", title: "GBTA (Booth)", note: "70 opps / 160 discovery calls",
      team: "gtm", status: "progress", people: [], start: "2026-08-03", end: "2026-08-08" },
    { id: "t-101", title: "Secure Factoring (TS accepted)", note: "+ $7M",
      team: "fin", status: "progress", people: ["felix"], start: "2026-06-29", end: "2026-08-29" },
    { id: "t-102", title: "Fill SR&ED 2025", note: "$1M cash",
      team: "fin", status: "progress", people: [], start: "2026-08-03", end: "2026-08-28" },
    { id: "t-103", title: "Close books in 15 days", team: "fin", status: "none",
      people: [], start: "2026-09-07", end: "2026-09-12" },
    { id: "t-104", title: "Supplier collection", team: "fin", status: "none",
      people: [], start: "2026-09-14", end: "2026-09-25" },
    { id: "t-105", title: "Account analysis — which accounts are profitable",
      team: "cs", status: "request", people: ["myriam"], start: "2026-07-20", end: "2026-07-23" },
    { id: "t-106", title: "Account health Dashboard", team: "cs", status: "design",
      people: ["liv"], start: "2026-08-10", end: "2026-08-15" },
    { id: "t-107", title: "Contract upload flow", team: "core", status: "request",
      people: [], start: "2026-08-03", end: "2026-08-09" },
    { id: "t-108", title: "Product releases", team: "mkt", status: "request",
      people: ["preslea"], start: "2026-07-20", end: "2026-07-25", subtasks: { done: 0, total: 3 } },
    { id: "t-109", title: "User preference onboarding", team: "core", status: "request",
      people: [], start: "2026-08-03", end: "2026-08-15" },
    { id: "t-110", title: "Intelligence → Budget", team: "core", status: "request",
      people: [], start: "2026-07-20", end: "2026-07-25" },
    { id: "t-111", title: "Finance: centralize invoicing in the tool", team: "core", status: "request",
      people: [], start: "2026-07-20", end: "2026-07-28" },
    { id: "t-112", title: "Automate hotel room block approval updates", team: "event", status: "done",
      people: ["ervin"], start: "2026-06-08", end: "2026-07-04" },
  ],

  /* Board column counts in the source system include archived items that
     aren't listed above. Set a number to show "listed / total" in the
     column header, or null to just count what's here. */
  boardTotals: {
    request: 43, none: 81, committed: 34, design: 3, ready: 3, progress: 15, done: 164,
  },

  /* ---------- milestones -------------------------------------------- */
  milestones: [
    { date: "2026-07-04", title: "Launch bottom-up MVP",  team: "bottom" },
    { date: "2026-07-04", title: "Launch CS portal",      team: "auto" },
    { date: "2026-07-17", title: "New v2 launch",         team: "core" },
    { date: "2026-07-30", title: "Roadmap milestone",     team: "none" },
    { date: "2026-09-28", title: "Launch of OS internally", team: "auto" },
    { date: "2026-10-24", title: "Launch event cloud MVP", team: "event", major: true },
  ],

  /* ---------- operations -------------------------------------------- */
  ops: {
    // Counts of everything in the source system, including rows not
    // itemised in `tasks` above.
    unassignedTotal: 175,
    overdueTotal: 160,
  },

  /* ---------- metrics ----------------------------------------------- */
  metrics: {
    months: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    // index of the first month that is a projection, not an actual
    projectionFrom: 3,
    groups: [
      {
        rows: [
          { team: "core",   label: "Core product & intelligence", format: "currency",
            values: [9_290_000, 10_000_000, 11_000_000, null, null, null, null, null],
            target: 20_000_000, targetUnit: "ARR", trend: "+10%", trendDir: "up" },
          { team: "event",  label: "Event cloud", format: "currency",
            values: [0, 0, 0, null, null, null, null, null],
            target: 1_000_000, targetUnit: "", trend: null },
          { team: "bottom", label: "Bottom up", format: "currency",
            values: [0, 0, 240_000, null, null, null, null, null],
            target: 2_000_000, targetUnit: "ARR", trend: "+$240k", trendDir: "up" },
          { team: "fin",    label: "Take Rate", format: "percent",
            values: [null, null, 8.8, null, null, null, null, null],
            target: 10, targetUnit: "Margin", trend: null },
        ],
      },
      {
        rows: [
          { team: "auto",   label: "OS", format: "currency",
            values: [48_000, 42_000, 56_000, null, null, null, null, null],
            target: 75_000, targetUnit: "MRR per CS", trend: "+33.3%", trendDir: "up" },
        ],
      },
      {
        rows: [
          { team: "impl",   label: "Implementation", format: "number",
            values: [32, 32, 32, null, null, null, null, null],
            target: 54, targetUnit: "Logos launched", trend: null },
        ],
      },
      {
        rows: [
          { team: "gtm",    label: "TOFU", format: "number",
            values: [null, 23, 29, null, null, null, null, null],
            target: 330, targetUnit: "Opps created", trend: "+26.1%", trendDir: "up" },
          { team: "gtm",    label: "BOFU", format: "number",
            values: [8, 9, null, null, null, null, null, null],
            target: 35, targetUnit: "Logos signed", trend: "+12.5%", trendDir: "up" },
        ],
      },
      {
        rows: [
          { team: "supply", label: "Event Quality", format: "number",
            values: [null, 0, null, null, null, null, null, null],
            target: 5, targetUnit: "CSAT", trend: null },
        ],
      },
    ],
  },

  /* ---------- tracked goals (the cards under the metrics table) ------ */
  trackedGoals: [
    { team: "core",   label: "Core product & intelligence", current: 11_000_000, target: 20_000_000,
      unit: "ARR", trend: "+10%", trendDir: "up", projectedDec: 15_300_000,
      series: [9_290_000, 10_000_000, 11_000_000, 12_000_000, 12_900_000, 13_700_000, 14_500_000, 15_300_000] },
    { team: "event",  label: "Event cloud", current: 0, target: 1_000_000,
      unit: "", trend: null, projectedDec: 0,
      series: [0, 0, 0, 0, 0, 0, 0, 0] },
    { team: "bottom", label: "Bottom up", current: 240_000, target: 2_000_000,
      unit: "ARR", trend: "+$240k", trendDir: "up", projectedDec: 840_000,
      series: [0, 0, 240_000, 330_000, 430_000, 550_000, 690_000, 840_000] },
  ],
};

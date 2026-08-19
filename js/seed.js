import { addDays, todayISO, uid } from './utils.js';

function mkClubs(names) {
  return names.map((name) => ({
    id: uid('club'), name, goal: '', theyGet: '', weGet: '',
    progressCurrent: 0, progressTarget: 100, eventDate: '', partnershipDate: '',
  }));
}

export const TEAMS = [
  { id: 'team-a', name: 'Team A', color: '#6c8cff' },
  { id: 'team-b', name: 'Team B', color: '#ef6f6c' },
  { id: 'team-c', name: 'Team C', color: '#57c785' },
];

export const PEOPLE = [
  { id: 'p1', name: 'Alex', role: 'Engineer', teamId: 'team-a' },
  { id: 'p2', name: 'Sam', role: 'Engineer', teamId: 'team-a' },
  { id: 'p3', name: 'Taylor', role: 'Engineer', teamId: 'team-a' },
  { id: 'p4', name: 'Jordan', role: 'Product Manager', teamId: 'team-a' },
  { id: 'p5', name: 'Riley', role: 'Designer', teamId: 'team-a' },
  { id: 'p6', name: 'Casey', role: 'Product Manager', teamId: 'team-b' },
  { id: 'p7', name: 'Morgan', role: 'Designer', teamId: 'team-b' },
  { id: 'p8', name: 'Drew', role: 'Engineer', teamId: 'team-b' },
  { id: 'p9', name: 'Blake', role: 'Engineer', teamId: 'team-b' },
  { id: 'p10', name: 'Quinn', role: 'Product Manager', teamId: 'team-c' },
  { id: 'p11', name: 'Sage', role: 'Designer', teamId: 'team-c' },
  { id: 'p12', name: 'Reese', role: 'Engineer', teamId: 'team-c' },
];

export const INITIATIVES = [
  { id: 'init-1', name: 'Initiative 1', teamId: 'team-a', goalLabel: 'Reach target', current: 0, target: 100, unit: '%' },
  { id: 'init-2', name: 'Initiative 2', teamId: 'team-b', goalLabel: 'Reach target', current: 0, target: 100, unit: '%' },
  { id: 'init-3', name: 'Initiative 3', teamId: 'team-c', goalLabel: 'Reach target', current: 0, target: 100, unit: '%' },
];

const TASK_STATUSES = ['Backlog', 'Ready', 'In progress', 'In design', 'Committed', 'Done'];

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function seedTasks() {
  const tasks = [];
  INITIATIVES.forEach((init) => {
    const teamPeople = PEOPLE.filter((p) => p.teamId === init.teamId);
    const count = randomInt(2, 4);
    for (let i = 1; i <= count; i++) {
      const startOffset = randomInt(-21, 45);
      const duration = randomInt(3, 12);
      const assignee = teamPeople.length ? teamPeople[randomInt(0, teamPeople.length - 1)] : null;
      tasks.push({
        id: uid('task'),
        title: `Task ${i}`,
        description: 'Example task description — replace with the real scope of work.',
        impact: 'Example impact statement.',
        status: TASK_STATUSES[randomInt(0, TASK_STATUSES.length - 1)],
        assigneeId: assignee ? assignee.id : null,
        startDate: addDays(todayISO(), startOffset),
        endDate: addDays(todayISO(), startOffset + duration),
        designDeadline: '',
        sectionId: init.id,
        teamId: init.teamId,
        client: '',
        createdBy: 'You',
        blockedBy: [],
        subtasks: [],
        comments: [],
      });
    }
  });
  return tasks;
}

function seedMilestones() {
  return [
    { id: 'ms1', date: addDays(todayISO(), -30), title: 'Milestone 1', teamId: 'team-a' },
    { id: 'ms2', date: addDays(todayISO(), -10), title: 'Milestone 2', teamId: 'team-b' },
    { id: 'ms3', date: addDays(todayISO(), 20), title: 'Milestone 3', teamId: 'team-c' },
    { id: 'ms4', date: addDays(todayISO(), 60), title: 'Milestone 4', teamId: 'team-a' },
  ];
}

function seedMonths() {
  const now = new Date();
  const months = [];
  for (let offset = -3; offset <= 4; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      isCurrent: offset === 0,
      isProjection: offset > 0,
    });
  }
  return months;
}

function seedWeeks() {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const weeks = [];
  for (let i = -2; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i * 7);
    weeks.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isCurrent: i === 0,
    });
  }
  return weeks;
}

function seedMetrics() {
  return [
    { id: 'metric-a', name: 'Metric A', teamId: 'team-a', target: 'Target', values: {} },
    { id: 'metric-b', name: 'Metric B', teamId: 'team-b', target: 'Target', values: {} },
    { id: 'metric-c', name: 'Metric C', teamId: 'team-c', target: 'Target', values: {} },
  ];
}

function seedOkrs() {
  return [
    {
      id: 'okr-company', objective: 'Company Objective 1', teamId: null,
      keyResults: [
        { id: 'kr-co-1', title: 'Key result 1', current: 0, target: 100, deadline: addDays(todayISO(), 90), assigneeIds: [] },
        { id: 'kr-co-2', title: 'Key result 2', current: 0, target: 100, deadline: addDays(todayISO(), 60), assigneeIds: [] },
      ],
    },
    {
      id: 'okr-1', objective: 'Objective 1', teamId: 'team-a',
      keyResults: [
        { id: 'kr-1-1', title: 'Key result 1', current: 0, target: 100, deadline: addDays(todayISO(), 30), assigneeIds: ['p1', 'p4'] },
        { id: 'kr-1-2', title: 'Key result 2', current: 0, target: 100, deadline: addDays(todayISO(), 45), assigneeIds: ['p2'] },
      ],
    },
    {
      id: 'okr-2', objective: 'Objective 2', teamId: 'team-b',
      keyResults: [{ id: 'kr-2-1', title: 'Key result 1', current: 0, target: 100, deadline: addDays(todayISO(), 30), assigneeIds: ['p6', 'p8'] }],
    },
    {
      id: 'okr-3', objective: 'Objective 3', teamId: 'team-c',
      keyResults: [{ id: 'kr-3-1', title: 'Key result 1', current: 0, target: 100, deadline: addDays(todayISO(), 30), assigneeIds: ['p10', 'p12'] }],
    },
  ];
}

function seedPaidConversions() {
  return [
    {
      id: 'pc-intro',
      isIntro: true,
      note: [
        "Mecka's buyer universe is 150 to 400 accounts globally: foundation model labs, humanoid companies, industrial integrators, a handful of auto and logistics programs. There is 300-400 companies that are a perfect fit.",
        'For lead generation, it doesn’t make great sense to do volume-based queries when there are so few targets. I would rather have a list of accounts and reach out to each individual through email, LinkedIn, conference meeting, and targeted ad, one by one, ensuring that each is covered on all four fronts.',
      ],
    },
    {
      id: 'pc-email',
      title: 'Email Outbound',
      metrics: [
        { id: 'm1', label: 'Number of leads', note: 'Reaching them through their email would be the best, with editorial and case studies.', target: 100, values: {} },
        { id: 'm2', label: 'Number of emails', target: 80, values: {} },
        { id: 'm3', label: 'Number of replies', target: 16, values: {} },
        { id: 'm4', label: '# Meeting Booked', target: 4, values: {} },
      ],
    },
    {
      id: 'pc-linkedin',
      title: 'Ads - LinkedIn',
      note: 'Note that this is a test — people are active on the platform and it’s for awareness building. $3,000 will give us an idea of whether it’s an avenue worth investing in.',
      metrics: [
        { id: 'm1', label: 'Spend', target: 100, values: {} },
        { id: 'm2', label: 'CTR creative 1', target: 100, values: {} },
        { id: 'm3', label: 'CTR creative 2', target: 100, values: {} },
        { id: 'm4', label: 'CTR creative 3', target: 100, values: {} },
        { id: 'm5', label: 'CTR creative 4', target: 100, values: {} },
        { id: 'm6', label: 'CTR creative 5', target: 100, values: {} },
        { id: 'm7', label: 'Cost per Meeting', target: 'Under $4', values: {} },
        { id: 'm8', label: '# Meeting Booked', target: 10, values: {} },
      ],
    },
    {
      id: 'pc-google',
      title: 'Ads - Google',
      note: 'An avenue worth investing in and bringing enough traffic. Note that not all of it can be AI-generated — Google will de-rank watermarked content.',
      metrics: [
        { id: 'm1', label: 'Spend', target: 100, values: {} },
        { id: 'm2', label: 'CTR ad group 1', target: 100, values: {} },
        { id: 'm3', label: 'CTR ad group 2', target: 100, values: {} },
        { id: 'm4', label: 'CTR ad group 3', target: 100, values: {} },
        { id: 'm5', label: 'CTR ad group 4', target: 100, values: {} },
        { id: 'm6', label: 'CTR ad group 5', target: 100, values: {} },
        { id: 'm7', label: 'Cost per Meeting', target: 'Under $4', values: {} },
        { id: 'm8', label: '# Meeting Booked', target: 15, values: {} },
      ],
    },
    {
      id: 'pc-seo',
      title: 'SEO/AEO',
      metrics: [
        { id: 'm1', label: '# of Blogs Posted', note: 'Having many blogs helps with AEO, since that’s what AI pulls from.', target: 150, values: {} },
        { id: 'm2', label: 'CTR', note: 'Since this is the metric we pay most based on, we want this as low as possible while keeping CVR as high as possible.', target: null, values: {} },
        { id: 'm3', label: 'CVR', note: 'We want every CTR to convert — highest-performing posts get reused, lowest-performing get changed.', target: null, values: {} },
        { id: 'm4', label: 'Impressions', target: 400, values: {} },
        { id: 'm5', label: 'Clicks', target: 40, values: {} },
        { id: 'm6', label: '# Meeting Booked', target: 15, values: {} },
        { id: 'm7', label: '% Meeting Booked', target: '37.50%', values: {} },
      ],
    },
    {
      id: 'pc-claude-skill',
      title: 'Claude Skill for Posting (LinkedIn and X)',
      note: 'Create a Claude Skill that writes posts in a set format after feeding it a couple of stats.',
      metrics: [
        { id: 'm1', label: 'Profiles Connected', target: 5, values: {} },
        { id: 'm2', label: 'Number of Posts', target: 5, values: {} },
        { id: 'm3', label: 'Post Type', note: 'Announcement, Statistic, Custom, Culture...', target: null, values: {} },
        { id: 'm4', label: 'Likes', target: 400, values: {} },
        { id: 'm5', label: 'Comments', target: 50, values: {} },
        { id: 'm6', label: 'CTR', target: '20%', values: {} },
      ],
    },
    {
      id: 'pc-reddit',
      title: 'Reddit',
      note: 'Posts get segmented by priority, then answered by a human since Reddit scrutiny is really high.',
      metrics: [
        { id: 'm1', label: 'Number of Posts', target: '50-100', values: {} },
        { id: 'm2', label: '# Likes', target: 20, values: {} },
        { id: 'm3', label: '# Comments', target: 10, values: {} },
        { id: 'm4', label: '# Replies', target: 5, values: {} },
        { id: 'm5', label: '# Meeting Booked', target: 3, values: {} },
      ],
    },
    {
      id: 'pc-newsletter',
      title: 'Newsletter Features',
      note: 'Helps with AEO and reach. Focus on newsletters read by researchers, engineers, and lab directors.',
      metrics: [
        { id: 'm1', label: 'Number of Posts', target: 1, values: {} },
        { id: 'm2', label: 'Audience demographic', target: 'Researchers, Founders, Lab Directors', values: {} },
        { id: 'm3', label: 'Number of views', target: 200, values: {} },
        { id: 'm4', label: '# Replies', target: 50, values: {} },
        { id: 'm5', label: '# Meeting Booked', target: 10, values: {} },
      ],
    },
    {
      id: 'pc-daily-summary',
      title: 'Daily Summary',
      metrics: [
        { id: 'm1', label: 'Spend', target: 'Under $100', values: {} },
        { id: 'm2', label: '# Meeting Booked', target: 53, values: {} },
      ],
    },
  ];
}

function seedRecruitment() {
  return [
    {
      id: 'rec-intro',
      isIntro: true,
      note: [
        'This is to bring top-of-funnel talent towards ElevenLabs.',
        'A note on events: it’s much more interesting to do events in partnership with others, since it has the same impact with much less effort and time spent. For school partnerships, the goal is to create relationships early, so when there is very strong talent, it gets funneled to us quickly.',
      ],
    },
    {
      id: 'rec-schools',
      title: 'School Partnerships',
      entities: [
        { name: 'MIT', links: mkClubs(['MIT Driverless']) },
        { name: 'Waterloo', links: mkClubs(['Coop Programs', 'Socratica', 'Design Teams', 'WATonomous', 'WAT.ai']) },
        { name: 'UBC', links: mkClubs(['UBC Thunderbots']) },
        { name: 'UofT', links: mkClubs(['UTMIST']) },
        { name: 'McGill', links: mkClubs(['McGill Ventures', 'McHacks', 'NOBE McGill', 'JEG Consulting', 'Nord Consulting', 'MES']) },
        { name: 'McMaster', links: mkClubs(['DeltaHacks', 'McMaster AI Society', 'McMaster Robotics']) },
        { name: 'TMU', links: mkClubs(['Hack the 6ix', 'TMU AI']) },
        { name: 'Simon Fraser', links: mkClubs(['SFU Surge', 'SFU AI Club']) },
        { name: 'Western', links: mkClubs(['Hack Western', 'Ivey FinTech Club']) },
        { name: 'Queen’s', links: mkClubs([]) },
        { name: 'Concordia', links: mkClubs(['ConUHacks', 'Space Concordia', 'District 3']) },
      ],
      metrics: [
        { id: 'm1', label: 'Leads (#)', target: 10, values: {} },
        { id: 'm2', label: 'Interview Booked (%)', target: '1%', values: {} },
        { id: 'm3', label: 'Interview Booked (#)', target: 5, values: {} },
      ],
    },
    {
      id: 'rec-sponsorships',
      title: 'Event Sponsorships',
      metrics: [
        { id: 'm1', label: 'Budget', target: '$1,000 / in-kind / intros', values: {} },
        { id: 'm2', label: 'Our interest', target: 'Videos, talent', values: {} },
        { id: 'm3', label: 'Type of talent', target: 'Eng / Ops / Sales', values: {} },
        { id: 'm4', label: 'Number of events', note: 'Look at hiring from that same level of talent.', target: null, values: {} },
        { id: 'm5', label: 'Demographic reached', target: null, values: {} },
        { id: 'm6', label: 'Leads (#)', target: '40 per event', values: {} },
        { id: 'm7', label: 'Interview Booked (%)', target: '75%', values: {} },
        { id: 'm8', label: 'Interview Booked (#)', target: '15 per event', values: {} },
      ],
    },
    {
      id: 'rec-attendance',
      title: 'Event Attendance',
      note: 'Simply attending these events will help bring visibility to ElevenLabs as well as act as a recruitment channel.',
      entities: [
        { name: 'Socratica Symposium', links: [] },
        { name: 'GenAI Genesis', links: [] },
        { name: 'TreeHacks', links: [] },
        { name: 'Hack the North', links: [] },
        { name: 'MILA ALL-IN', links: [] },
      ],
      metrics: [
        { id: 'm1', label: 'Leads (#)', target: 100, values: {} },
        { id: 'm2', label: 'Interview Booked (%)', target: '20%', values: {} },
        { id: 'm3', label: 'Interview Booked (#)', target: 20, values: {} },
      ],
    },
    {
      id: 'rec-partnerships',
      title: 'Partnership Events',
      entities: [
        { name: 'Mecka AI', note: 'Recruit same level of talent' },
        { name: 'Corgi', note: 'Recruit for people who bring high visibility' },
        { name: 'Turbopuffer', note: 'Strong technical talent, able to work under pressure' },
        { name: 'Afterquery', note: 'Able to fit the culture' },
        { name: 'Cambridge', note: 'New avenues of growth and sales skills' },
        { name: 'Physical Intelligence', note: 'Strong technical talent' },
        { name: 'The General Intelligence Company', note: 'Strong technical talent in New York, where ElevenLabs has a large office' },
        { name: 'NEO', note: 'Strong operator talent' },
        { name: 'Kodak Films', note: 'Bring more visibility to the Eleven-verse' },
      ],
      metrics: [
        { id: 'm1', label: 'Leads (#)', target: '40 per event', values: {} },
        { id: 'm2', label: 'Interview Booked (%)', target: '37.5%', values: {} },
        { id: 'm3', label: 'Interview Booked (#)', target: '15 per event', values: {} },
      ],
    },
    {
      id: 'rec-companies',
      title: 'Companies to Track Employees',
      note: 'Companies with a similar culture and ambition in the industry. There’s a lot of overlap and the right industry backgrounds. As these companies get significantly larger, employees lose ownership — ElevenLabs can offer all the benefits these companies provide, on top of responsibility and ownership.',
      entities: [
        { name: 'Sanctuary AI', links: [] },
        { name: 'Auki Labs', links: [] },
        { name: 'Afterquery', links: [] },
        { name: 'Mercor', links: [] },
        { name: 'Bracket Bot', links: [] },
        { name: 'AARU', links: [] },
        { name: 'Browserbase', links: [] },
        { name: 'Cognition', links: [] },
        { name: 'Simular', links: [] },
        { name: 'Nexos Technologies', links: [] },
        { name: 'Normal Computing', links: [] },
        { name: 'Mater Intelligence', links: [] },
        { name: 'General Intuition', links: [] },
      ],
      metrics: [
        { id: 'm1', label: 'Leads (#)', target: 130, values: {} },
        { id: 'm2', label: 'Interview Booked (%)', target: '15%', values: {} },
        { id: 'm3', label: 'Interview Booked (#)', target: 20, values: {} },
      ],
    },
    {
      id: 'rec-total',
      title: 'Total',
      metrics: [
        { id: 'm1', label: 'Leads (#)', target: null, values: {} },
        { id: 'm2', label: 'Interview Booked (%)', target: null, values: {} },
        { id: 'm3', label: 'Interview Booked (#)', target: null, values: {} },
      ],
    },
  ];
}

function seedDocs() {
  return [
    {
      id: 'docs-logins', title: 'Software Login',
      fields: [
        { key: 'name', label: 'Software Name' },
        { key: 'loginProcess', label: 'Login Process' },
        { key: 'adminAccess', label: 'Admin Access' },
        { key: 'useCases', label: 'Use Cases' },
      ],
      entries: [],
    },
    { id: 'docs-tmu', title: 'TMU Documentation', entries: [] },
    {
      id: 'docs-tofu', title: 'Top-of-Funnel',
      entries: [
        { id: 'tofu-1', title: 'Setting up HubSpot sequences', url: '', notes: '' },
        { id: 'tofu-2', title: 'Setting up HeyReach sequences', url: '', notes: '' },
        { id: 'tofu-3', title: 'Setting up Google Ads', url: '', notes: '' },
        { id: 'tofu-4', title: 'Setting up LinkedIn ads', url: '', notes: '' },
        { id: 'tofu-5', title: 'Setting up Meta ads', url: '', notes: '' },
      ],
    },
    {
      id: 'docs-bofu', title: 'Bottom-of-Funnel',
      fields: [
        { key: 'pricingDoc', label: 'Pricing Doc' },
        { key: 'title', label: 'Title' },
        { key: 'implementationStrategy', label: 'Implementation Strategy' },
      ],
      entries: [],
    },
    {
      id: 'docs-internal-ops', title: 'Internal Team Ops Documentation',
      entries: [
        { id: 'ops-doc-1', title: 'Insurance login process', url: '', notes: '' },
        { id: 'ops-doc-2', title: 'Expense login process', url: '', notes: '' },
        { id: 'ops-doc-3', title: 'Onboarding checklist', url: '', notes: '' },
      ],
    },
  ];
}

function seedInboundLeads() {
  const emptyRow = () => ({
    id: uid('lead'), company: '', userName: '', source: '', title: '', stage: '',
    positiveAnswer: '', demoBookedDate: '', demoHappenedDate: '', lostLead: '',
    meetingWithAeDate: '', estimatedQuantity: '', estimatedRevenue: '', note: '',
  });
  return { rows: [emptyRow(), emptyRow(), emptyRow(), emptyRow(), emptyRow()], notes: '' };
}

export function seedData() {
  const year = new Date().getFullYear();
  return {
    companyGoal: { title: 'Reach target', current: 0, target: 100, unit: '%', targetDate: `${year}-12-31` },
    teams: TEAMS,
    people: PEOPLE,
    initiatives: INITIATIVES,
    milestones: seedMilestones(),
    months: seedMonths(),
    weeks: seedWeeks(),
    metrics: seedMetrics(),
    okrs: seedOkrs(),
    paidConversions: seedPaidConversions(),
    recruitment: seedRecruitment(),
    docs: seedDocs(),
    inboundLeads: seedInboundLeads(),
    pageNotes: {},
    tasks: seedTasks(),
  };
}

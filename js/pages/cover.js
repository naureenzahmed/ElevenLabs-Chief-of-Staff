import { getData } from '../store.js';
import { escapeHtml } from '../utils.js';

export function renderCover(container) {
  const data = getData();
  const pages = buildManifest(data);

  container.innerHTML = `
    <div class="page-title">Canadian GTM</div>
    <div class="section-desc" style="margin-top:-14px; margin-bottom: 20px;">Jump to any page or section below.</div>
    <div class="cover-grid">
      ${pages.map((p) => `
        <div class="card cover-card">
          <a class="cover-page-title" href="#/${p.key}">${escapeHtml(p.label)}</a>
          ${p.subsections.length ? `
            <ul class="cover-sublist">
              ${p.subsections.map((s) => `<li><a href="#/${p.key}?anchor=${encodeURIComponent(s.id)}">${escapeHtml(s.label)}</a></li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function buildManifest(data) {
  return [
    {
      key: 'documentation', label: 'Documentation',
      subsections: data.docs.map((s) => ({ id: s.id, label: s.title })),
    },
    {
      key: 'roadmap', label: 'Roadmap',
      subsections: [
        { id: 'roadmap-timeline-section', label: 'Timeline / List / Board' },
        { id: 'roadmap-okr-section', label: 'OKRs' },
        { id: 'roadmap-calendar-section', label: 'Deadline Calendar' },
      ],
    },
    {
      key: 'operations', label: 'Team Management',
      subsections: [
        { id: 'ops-milestones', label: 'Key Milestones' },
        { id: 'ops-availability', label: 'Availability' },
        { id: 'ops-teams', label: 'Team Composition' },
      ],
    },
    {
      key: 'metrics', label: 'Metrics',
      subsections: [
        { id: 'metrics-log', label: 'Monthly Log' },
        { id: 'metrics-cards', label: 'Tracked Goals' },
      ],
    },
    {
      key: 'paidConversions', label: 'Paid Conversions',
      subsections: data.paidConversions.filter((s) => !s.isIntro).map((s) => ({ id: s.id, label: s.title })),
    },
    { key: 'inboundLeads', label: 'Inbound Leads', subsections: [] },
    {
      key: 'recruitment', label: 'Recruitment',
      subsections: data.recruitment.filter((s) => !s.isIntro).map((s) => ({ id: s.id, label: s.title })),
    },
  ];
}

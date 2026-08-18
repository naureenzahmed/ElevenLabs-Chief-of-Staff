import { getData, commit } from './store.js';
import { renderCover } from './pages/cover.js';
import { renderDocumentation } from './pages/documentation.js';
import { renderRoadmap } from './pages/roadmap.js';
import { renderOperations } from './pages/operations.js';
import { renderMetrics } from './pages/metrics.js';
import { renderPaidConversions } from './pages/paidConversions.js';
import { renderInboundLeads } from './pages/inboundLeads.js';
import { renderRecruitment } from './pages/recruitment.js';

const PAGES = {
  home: { label: 'Home', render: renderCover },
  documentation: { label: 'Documentation', render: renderDocumentation },
  roadmap: { label: 'Roadmap', render: renderRoadmap },
  operations: { label: 'Team Management', render: renderOperations },
  metrics: { label: 'Metrics', render: renderMetrics },
  paidConversions: { label: 'Paid Conversions', render: renderPaidConversions },
  inboundLeads: { label: 'Inbound Leads', render: renderInboundLeads },
  recruitment: { label: 'Recruitment', render: renderRecruitment },
};

function currentRoute() {
  const hash = location.hash.replace('#/', '').split('?')[0];
  return PAGES[hash] ? hash : 'home';
}

function currentAnchor() {
  const qIdx = location.hash.indexOf('?');
  if (qIdx === -1) return null;
  return new URLSearchParams(location.hash.slice(qIdx + 1)).get('anchor');
}

export function rerender() {
  const route = currentRoute();
  renderHeader(route);
  const page = document.getElementById('app-page');
  page.innerHTML = '';
  PAGES[route].render(page);

  const anchor = currentAnchor();
  if (anchor) {
    requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } else {
    window.scrollTo(0, 0);
  }
}

function renderHeader(route) {
  const data = getData();
  const header = document.getElementById('app-header');
  const pct = data.companyGoal.target ? Math.round((data.companyGoal.current / data.companyGoal.target) * 100) : 0;

  header.innerHTML = `
    <div class="header-left">
      <div class="wordmark">
        <svg fill="currentColor" viewBox="0 0 117 15" aria-hidden="true"><path d="M41.507 3.698h-2.975l3.595 11.054h3.203l3.595-11.054h-2.976l-2.25 8.327zM0 0h3.079v14.752H0zM6.115 0h3.079v14.752H6.115zM12.23 0h9.112v2.459H15.31V5.97h5.62V8.43h-5.62v3.863h6.033v2.46h-9.111zM23.222 0h2.913v14.752h-2.913zM27.892 9.215c0-4.029 2.004-5.765 5.124-5.765s4.896 1.715 4.896 5.806v.661h-7.148c.103 2.397.826 3.203 2.21 3.203 1.095 0 1.777-.64 1.901-1.756h2.913C37.602 13.802 35.578 15 32.974 15c-3.305 0-5.082-1.756-5.082-5.785m7.148-1.22c-.144-2.024-.847-2.685-2.066-2.685s-1.983.682-2.19 2.686zM49.482 9.215c0-4.029 2.005-5.765 5.124-5.765 3.12 0 4.897 1.715 4.897 5.806v.661h-7.149c.104 2.397.827 3.203 2.211 3.203 1.095 0 1.777-.64 1.9-1.756h2.914C59.193 13.802 57.17 15 54.565 15c-3.306 0-5.083-1.756-5.083-5.785m7.15-1.22c-.145-2.024-.848-2.685-2.067-2.685s-1.983.682-2.19 2.686zM73.304 0h3.079v12.293h5.785v2.46h-8.864z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M82.891 9.215c0-4.215 1.942-5.765 4.442-5.765 1.24 0 2.376.703 2.83 1.447V3.698h2.976v11.054h-2.892V13.45c-.434.868-1.653 1.55-2.996 1.55-2.645 0-4.36-1.694-4.36-5.785m5.207-3.595c1.446 0 2.231 1.095 2.231 3.595s-.785 3.616-2.231 3.616c-1.447 0-2.273-1.116-2.273-3.616s.826-3.595 2.273-3.595M98.284 13.45v1.302H95.39V0h2.913v4.897c.496-.765 1.653-1.447 2.893-1.447 2.438 0 4.38 1.55 4.38 5.765S103.676 15 101.135 15c-1.343 0-2.438-.682-2.851-1.55m2.086-7.81c1.447 0 2.273 1.075 2.273 3.575s-.826 3.616-2.273 3.616c-1.446 0-2.231-1.116-2.231-3.616s.785-3.574 2.231-3.574"></path><path d="M106.776 11.467h2.913c.041 1.157.661 1.715 1.756 1.715s1.715-.496 1.715-1.364c0-.785-.475-1.074-1.508-1.322l-.889-.227c-2.52-.64-3.781-1.323-3.781-3.41 0-2.086 1.942-3.409 4.422-3.409s4.359.972 4.442 3.265h-2.913c-.062-1.012-.682-1.446-1.571-1.446s-1.508.434-1.508 1.26c0 .764.496 1.054 1.364 1.26l.909.228c2.397.599 3.905 1.198 3.905 3.43 0 2.23-1.984 3.553-4.67 3.553-2.913 0-4.524-1.095-4.586-3.533M64.214 8.244c0-1.736.826-2.686 2.107-2.686 1.054 0 1.653.661 1.653 2.087v7.107h2.913V7.19c0-2.562-1.446-3.74-3.553-3.74-1.426 0-2.604.724-3.12 1.674V3.698h-2.955v11.054h2.955z"></path></svg>
        <span class="wordmark-divider"></span>
        <span class="wordmark-sub">Canadian GTM</span>
      </div>
      <nav class="nav-tabs">
        ${Object.entries(PAGES).map(([key, p]) => `
          <a class="nav-tab ${key === route ? 'active' : ''}" href="#/${key}">${p.label}</a>
        `).join('')}
      </nav>
    </div>
    <div class="header-goal" id="header-goal">
      <div>
        <div class="goal-sub">${escapeAttr(data.companyGoal.title)}</div>
        <div class="goal-value">${data.companyGoal.current}${data.companyGoal.unit} <span class="goal-sub">/ ${data.companyGoal.target}${data.companyGoal.unit}</span></div>
      </div>
      <span class="pill">${pct}%</span>
    </div>
  `;

  document.getElementById('header-goal').addEventListener('click', () => {
    const title = prompt('Goal title', data.companyGoal.title);
    if (title === null) return;
    const current = Number(prompt('Current value', data.companyGoal.current));
    const target = Number(prompt('Target value', data.companyGoal.target));
    data.companyGoal.title = title;
    if (!Number.isNaN(current)) data.companyGoal.current = current;
    if (!Number.isNaN(target)) data.companyGoal.target = target;
    commit();
    rerender();
  });
}

function escapeAttr(s) {
  return String(s ?? '').replace(/"/g, '&quot;');
}

window.addEventListener('hashchange', rerender);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/home';
  rerender();
});

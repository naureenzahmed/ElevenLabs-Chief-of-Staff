import { getData, commit } from './store.js';
import { renderRoadmap } from './pages/roadmap.js';
import { renderOkr } from './pages/okr.js';
import { renderOperations } from './pages/operations.js';
import { renderMetrics } from './pages/metrics.js';

const PAGES = {
  roadmap: { label: 'Roadmap', render: renderRoadmap },
  okr: { label: 'OKR', render: renderOkr },
  operations: { label: 'Operations', render: renderOperations },
  metrics: { label: 'Metrics', render: renderMetrics },
};

function currentRoute() {
  const hash = location.hash.replace('#/', '').split('?')[0];
  return PAGES[hash] ? hash : 'roadmap';
}

export function rerender() {
  const route = currentRoute();
  renderHeader(route);
  const page = document.getElementById('app-page');
  page.innerHTML = '';
  PAGES[route].render(page);
}

function renderHeader(route) {
  const data = getData();
  const header = document.getElementById('app-header');
  const pct = data.companyGoal.target ? Math.round((data.companyGoal.current / data.companyGoal.target) * 100) : 0;

  header.innerHTML = `
    <div class="header-left">
      <div class="wordmark"><span class="dot"></span>Chief of Staff</div>
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
  if (!location.hash) location.hash = '#/roadmap';
  rerender();
});

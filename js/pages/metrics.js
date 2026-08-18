import { getData, commit, findTeam } from '../store.js';
import { uid, clamp, escapeHtml } from '../utils.js';

export function renderMetrics(container) {
  const data = getData();
  const pct = data.companyGoal.target ? clamp(Math.round((data.companyGoal.current / data.companyGoal.target) * 100), 0, 100) : 0;

  container.innerHTML = `
    <div class="card" id="goal-card-top" style="cursor:pointer; margin-bottom:24px;">
      <div class="section-label">Company goal</div>
      <div class="goal-big" style="margin:6px 0;">${escapeHtml(data.companyGoal.title)}</div>
      <div style="font-size:30px; font-weight:800; margin-bottom:8px;">
        ${data.companyGoal.current}${data.companyGoal.unit}
        <span style="font-size:14px; font-weight:500; color:var(--text-dim);">/ ${data.companyGoal.target}${data.companyGoal.unit}</span>
        <span class="pill" style="margin-left:8px;">${pct}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill accent" style="width:${pct}%;"></div></div>
    </div>

    <div id="metrics-log">
      <div class="toolbar">
        <div class="section-label" style="margin:0;">Monthly log</div>
        <button class="btn btn-ghost" id="add-metric-btn" style="padding:4px 8px;">+ Add metric</button>
      </div>
      <div class="card" style="overflow-x:auto; margin-bottom:24px;">
        <table class="metrics-table" id="metrics-table"></table>
      </div>
    </div>

    <div id="metrics-cards">
      <div class="section-label">Tracked goals</div>
      <div class="grid-3" id="metric-cards"></div>
    </div>
  `;

  document.getElementById('goal-card-top').addEventListener('click', () => {
    const current = Number(prompt('Current value', data.companyGoal.current));
    if (Number.isNaN(current)) return;
    data.companyGoal.current = current;
    commit();
    renderMetrics(container);
  });

  document.getElementById('add-metric-btn').addEventListener('click', () => {
    const name = prompt('Metric name', 'New metric');
    if (!name) return;
    const teamNames = data.teams.map((t) => t.name).join(' / ');
    const teamInput = prompt(`Team (${teamNames}), or leave blank for company-wide`, '');
    const team = data.teams.find((t) => t.name.toLowerCase() === (teamInput || '').trim().toLowerCase());
    data.metrics.push({ id: uid('metric'), name, teamId: team ? team.id : null, target: 'Target', values: {} });
    commit();
    renderMetrics(container);
  });

  renderTable(data, container);
  renderCards(data);
}

function renderTable(data, container) {
  const table = document.getElementById('metrics-table');
  const colCount = 2 + data.months.length;

  const groups = [
    ...data.teams.map((t) => ({ teamId: t.id, label: `${t.name} metrics`, color: t.color })),
    { teamId: null, label: 'Company metrics', color: null },
  ];

  table.innerHTML = `
    <thead>
      <tr>
        <th>Metric</th>
        ${data.months.map((m) => `<th>${m.label}${m.isCurrent ? ' *' : ''}</th>`).join('')}
        <th>Target</th>
      </tr>
    </thead>
    <tbody>
      ${groups.map((g) => {
        const metrics = data.metrics.filter((m) => (m.teamId || null) === g.teamId);
        if (!metrics.length) return '';
        return `
          <tr class="metrics-group-row">
            <td colspan="${colCount}">
              ${g.color ? `<span class="team-dot" style="background:${g.color};"></span>` : ''}
              ${escapeHtml(g.label)}
            </td>
          </tr>
          ${metrics.map((metric) => `
            <tr>
              <td>${escapeHtml(metric.name)}</td>
              ${data.months.map((m) => {
                const v = metric.values[m.key];
                const cls = m.isProjection ? 'projection' : (m.isCurrent ? 'current-month' : '');
                const editable = !m.isProjection;
                return `<td class="${cls} ${editable ? 'editable-cell' : ''}" ${editable ? `data-cell="${metric.id}|${m.key}"` : ''}>${v ?? '—'}</td>`;
              }).join('')}
              <td>${escapeHtml(metric.target)}</td>
            </tr>
          `).join('')}
        `;
      }).join('')}
    </tbody>
  `;

  table.querySelectorAll('[data-cell]').forEach((cell) => {
    cell.addEventListener('click', () => {
      const [metricId, monthKey] = cell.dataset.cell.split('|');
      const metric = data.metrics.find((m) => m.id === metricId);
      const value = Number(prompt(`Value for ${metric.name}`, metric.values[monthKey] ?? ''));
      if (Number.isNaN(value)) return;
      metric.values[monthKey] = value;
      commit();
      renderMetrics(container);
    });
  });
}

function renderCards(data) {
  document.getElementById('metric-cards').innerHTML = data.metrics.map((metric) => {
    const team = findTeam(metric.teamId);
    const completedMonths = data.months.filter((m) => !m.isProjection);
    const series = completedMonths.map((m) => metric.values[m.key] ?? 0);
    const latest = series[series.length - 1] ?? 0;
    const prev = series[series.length - 2] ?? latest;
    const trendPct = prev ? Math.round(((latest - prev) / Math.abs(prev)) * 100) : 0;

    return `
      <div class="card goal-card">
        <div class="goal-card-top">
          <div><span class="team-dot" style="background:${team?.color || '#666'}; display:inline-block; margin-right:6px;"></span>${escapeHtml(metric.name)}</div>
          ${trendPct !== 0 ? `<span class="pill">${trendPct > 0 ? '▲' : '▼'} ${Math.abs(trendPct)}%</span>` : ''}
        </div>
        <div class="goal-card-value">${latest} <span>/ ${escapeHtml(metric.target)}</span></div>
        <div class="sparkline">${sparklineSvg(series)}</div>
      </div>
    `;
  }).join('');
}

function sparklineSvg(series) {
  const w = 200, h = 40, pad = 4;
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const range = max - min || 1;
  const step = series.length > 1 ? (w - pad * 2) / (series.length - 1) : 0;
  const points = series.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${points}" fill="none" stroke="var(--green)" stroke-width="2" /></svg>`;
}

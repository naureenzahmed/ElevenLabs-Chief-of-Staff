import { commit } from '../store.js';
import { uid, escapeHtml } from '../utils.js';

export function renderTrackerPage(container, data, key, opts) {
  const sections = data[key];
  const weeks = data.weeks;

  container.innerHTML = `
    <div class="toolbar">
      <div class="page-title" style="margin:0;">${escapeHtml(opts.title)}</div>
      <button class="btn btn-primary" id="add-section-btn">+ Section</button>
    </div>
    <div id="tracker-sections" class="stack-16"></div>
  `;

  document.getElementById('tracker-sections').innerHTML = sections.map((s) => renderSection(s, weeks)).join('');

  document.getElementById('add-section-btn').addEventListener('click', () => {
    const title = prompt('Section title', 'New section');
    if (!title) return;
    sections.push({ id: uid('sec'), title, metrics: [] });
    commit();
    renderTrackerPage(container, data, key, opts);
  });

  wireEvents(container, data, key, opts, sections);
}

function renderSection(s, weeks) {
  if (s.isIntro) {
    return `<div class="card page-intro">${(Array.isArray(s.note) ? s.note : [s.note]).map((p) => `<p style="margin:0 0 8px;">${escapeHtml(p)}</p>`).join('')}</div>`;
  }

  return `
    <div class="card tracker-card">
      <div class="toolbar" style="margin-bottom:6px;">
        <h4 style="margin:0;">${escapeHtml(s.title)}</h4>
        <button class="btn btn-ghost" data-add-metric="${s.id}" style="padding:4px 8px;">+ Add metric</button>
      </div>
      ${s.note ? `<div class="section-desc">${escapeHtml(s.note)}</div>` : ''}
      ${s.entities && s.entities.length ? `
        <div class="entity-list">
          ${s.entities.map((e) => `
            <div class="entity-row"><b>${escapeHtml(e.name)}</b>${e.links && e.links.length ? `<span class="entity-links"> — ${e.links.map((l) => escapeHtml(l)).join(' · ')}</span>` : ''}</div>
          `).join('')}
        </div>
      ` : ''}
      ${s.metrics && s.metrics.length ? `
        <div class="tracker-scroll">
          <table class="list-table tracker-table">
            <thead>
              <tr>
                <th class="tracker-sticky-col">Metric</th>
                <th>Notes</th>
                <th>Target</th>
                ${weeks.map((w) => `<th class="tracker-week-th ${w.isCurrent ? 'current-week' : ''}">${escapeHtml(w.label)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${s.metrics.map((m) => `
                <tr>
                  <td class="tracker-sticky-col">${escapeHtml(m.label)}</td>
                  <td class="tracker-note">${escapeHtml(m.note || '')}</td>
                  <td class="tracker-target">${m.target ?? '—'}</td>
                  ${weeks.map((w) => `
                    <td class="tracker-week-td ${w.isCurrent ? 'current-week' : ''}">
                      <input type="text" inputmode="decimal" class="tracker-input" data-metric="${s.id}|${m.id}|${w.key}" value="${escapeHtml(m.values?.[w.key] ?? '')}" />
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<div class="empty-hint">No metrics yet.</div>'}
    </div>
  `;
}

function wireEvents(container, data, key, opts, sections) {
  document.querySelectorAll('.tracker-input').forEach((input) => {
    input.addEventListener('input', () => {
      const [sectionId, metricId, weekKey] = input.dataset.metric.split('|');
      const section = sections.find((s) => s.id === sectionId);
      const metric = section.metrics.find((m) => m.id === metricId);
      metric.values = metric.values || {};
      if (input.value.trim() === '') delete metric.values[weekKey];
      else metric.values[weekKey] = input.value;
      commit();
    });
  });

  document.querySelectorAll('[data-add-metric]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = sections.find((s) => s.id === btn.dataset.addMetric);
      const label = prompt('Metric name', 'New metric');
      if (!label) return;
      section.metrics = section.metrics || [];
      section.metrics.push({ id: uid('m'), label, target: null, values: {} });
      commit();
      renderTrackerPage(container, data, key, opts);
    });
  });
}

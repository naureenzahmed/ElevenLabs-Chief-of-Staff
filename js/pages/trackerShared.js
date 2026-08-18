import { commit } from '../store.js';
import { uid, escapeHtml } from '../utils.js';
import { openClubSidebar } from '../clubSidebar.js';

export function renderTrackerPage(container, data, key, opts) {
  const sections = data[key];
  const weeks = data.weeks;

  container.innerHTML = `
    <div class="toolbar">
      <div class="page-title" style="margin:0;">${escapeHtml(opts.title)}</div>
      <button class="btn btn-primary" id="add-section-btn">+ Section</button>
    </div>
    <div class="inline-add-form" id="add-section-form" style="display:none;">
      <input type="text" id="add-section-input" placeholder="Section title" />
      <button class="btn btn-primary" id="add-section-confirm">Add</button>
      <button class="btn btn-ghost" id="add-section-cancel">Cancel</button>
    </div>
    <div id="tracker-sections" class="stack-16"></div>
  `;

  document.getElementById('tracker-sections').innerHTML = sections.map((s) => renderSection(s, weeks)).join('');

  const sectionForm = document.getElementById('add-section-form');
  const sectionInput = document.getElementById('add-section-input');

  document.getElementById('add-section-btn').addEventListener('click', () => {
    sectionForm.style.display = sectionForm.style.display === 'none' ? 'flex' : 'none';
    if (sectionForm.style.display === 'flex') sectionInput.focus();
  });
  document.getElementById('add-section-cancel').addEventListener('click', () => {
    sectionForm.style.display = 'none';
    sectionInput.value = '';
  });
  const confirmAddSection = () => {
    const title = sectionInput.value.trim();
    if (!title) return;
    sections.push({ id: uid('sec'), title, metrics: [] });
    commit();
    renderTrackerPage(container, data, key, opts);
  };
  document.getElementById('add-section-confirm').addEventListener('click', confirmAddSection);
  sectionInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmAddSection(); });

  wireEvents(container, data, key, opts, sections);
}

function renderSection(s, weeks) {
  if (s.isIntro) {
    return `<div class="card page-intro">${(Array.isArray(s.note) ? s.note : [s.note]).map((p) => `<p style="margin:0 0 8px;">${escapeHtml(p)}</p>`).join('')}</div>`;
  }

  return `
    <div class="card tracker-card" id="${s.id}">
      <div class="toolbar" style="margin-bottom:6px;">
        <h4 style="margin:0;">${escapeHtml(s.title)}</h4>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-ghost" data-add-metric="${s.id}" style="padding:4px 8px;">+ Add metric</button>
          <button class="btn btn-ghost btn-danger" data-remove-section="${s.id}" style="padding:4px 8px;">Remove section</button>
        </div>
      </div>
      ${s.note ? `<div class="section-desc">${escapeHtml(s.note)}</div>` : ''}
      ${s.entities && s.entities.length ? `
        <div class="entity-list">
          ${s.entities.map((e, entityIndex) => `
            <div class="entity-row">
              <div class="entity-name">${escapeHtml(e.name)}</div>
              ${e.note
                ? `<div class="entity-note">${escapeHtml(e.note)}</div>`
                : `<div class="entity-org-list">${e.links && e.links.length ? e.links.map((l) => `<button type="button" class="entity-org-box" data-open-club="${s.id}|${entityIndex}|${l.id}">${escapeHtml(l.name)}</button>`).join('') : '<span class="entity-org-empty">—</span>'}</div>`
              }
            </div>
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
                <th></th>
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
                  <td><button class="btn btn-ghost" data-remove-metric="${s.id}|${m.id}" style="padding:2px 7px;">✕</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<div class="empty-hint">No metrics yet.</div>'}
      ${renderMeetingsSummary(s)}
      <div class="inline-add-form" id="add-metric-form-${s.id}" style="display:none;">
        <input type="text" id="add-metric-input-${s.id}" placeholder="Metric name" />
        <button class="btn btn-primary" data-confirm-add-metric="${s.id}">Add</button>
        <button class="btn btn-ghost" data-cancel-add-metric="${s.id}">Cancel</button>
      </div>
    </div>
  `;
}

function renderMeetingsSummary(s) {
  const metric = s.metrics?.find((m) => /meeting(s)?\s*booked/i.test(m.label) && !/%/.test(m.label));
  if (!metric) return '';
  const total = Object.values(metric.values || {}).reduce((sum, v) => {
    const n = parseFloat(v);
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);
  return `<div class="tracker-summary">Meetings booked <b>${total}</b></div>`;
}

function wireEvents(container, data, key, opts, sections) {
  document.querySelectorAll('[data-open-club]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [sectionId, entityIndex, linkId] = btn.dataset.openClub.split('|');
      openClubSidebar(sections, sectionId, Number(entityIndex), linkId, () => renderTrackerPage(container, data, key, opts));
    });
  });

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
      const form = document.getElementById(`add-metric-form-${btn.dataset.addMetric}`);
      const input = document.getElementById(`add-metric-input-${btn.dataset.addMetric}`);
      form.style.display = form.style.display === 'none' ? 'flex' : 'none';
      if (form.style.display === 'flex') input.focus();
    });
  });

  document.querySelectorAll('[data-cancel-add-metric]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById(`add-metric-form-${btn.dataset.cancelAddMetric}`).style.display = 'none';
    });
  });

  const confirmAddMetric = (sectionId) => {
    const input = document.getElementById(`add-metric-input-${sectionId}`);
    const label = input.value.trim();
    if (!label) return;
    const section = sections.find((s) => s.id === sectionId);
    section.metrics = section.metrics || [];
    section.metrics.push({ id: uid('m'), label, target: null, values: {} });
    commit();
    renderTrackerPage(container, data, key, opts);
  };
  document.querySelectorAll('[data-confirm-add-metric]').forEach((btn) => {
    btn.addEventListener('click', () => confirmAddMetric(btn.dataset.confirmAddMetric));
  });
  document.querySelectorAll('[id^="add-metric-input-"]').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmAddMetric(input.id.replace('add-metric-input-', ''));
    });
  });

  document.querySelectorAll('[data-remove-metric]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [sectionId, metricId] = btn.dataset.removeMetric.split('|');
      const section = sections.find((s) => s.id === sectionId);
      section.metrics = section.metrics.filter((m) => m.id !== metricId);
      commit();
      renderTrackerPage(container, data, key, opts);
    });
  });

  document.querySelectorAll('[data-remove-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = sections.findIndex((s) => s.id === btn.dataset.removeSection);
      if (idx >= 0) sections.splice(idx, 1);
      commit();
      renderTrackerPage(container, data, key, opts);
    });
  });
}

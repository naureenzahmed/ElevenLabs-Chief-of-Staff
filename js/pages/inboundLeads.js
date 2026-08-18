import { getData, commit } from '../store.js';
import { uid, escapeHtml } from '../utils.js';

const SOURCE_OPTIONS = ['', 'Email', 'LinkedIn Ads', 'Google Ads', 'SEO/AEO', 'Reddit', 'Newsletter', 'Referral', 'Website', 'Other'];
const STAGE_OPTIONS = ['', 'New', 'Contacted', 'Demo Booked', 'Demo Completed', 'Negotiation', 'Won', 'Lost'];
const YES_NO_OPTIONS = ['', 'Yes', 'No'];

const COLUMNS = [
  { key: 'company', label: 'Company', type: 'text' },
  { key: 'userName', label: 'User Name', type: 'text' },
  { key: 'source', label: 'Source', type: 'select', options: SOURCE_OPTIONS },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'stage', label: 'Stage', type: 'select', options: STAGE_OPTIONS },
  { key: 'positiveAnswer', label: 'Positive Answer', type: 'select', options: YES_NO_OPTIONS },
  { key: 'demoBookedDate', label: 'Demo Booked Date', type: 'date' },
  { key: 'demoHappenedDate', label: 'Demo Happened Date', type: 'date' },
  { key: 'lostLead', label: 'Lost Lead', type: 'select', options: YES_NO_OPTIONS },
  { key: 'meetingWithAeDate', label: 'Meeting with AE date', type: 'date' },
  { key: 'estimatedQuantity', label: 'Estimated Quantity', type: 'text' },
  { key: 'estimatedRevenue', label: 'Estimated Revenue', type: 'text' },
  { key: 'note', label: 'Note', type: 'text' },
];

export function renderInboundLeads(container) {
  const data = getData();
  const tracker = data.inboundLeads;

  container.innerHTML = `
    <div class="toolbar">
      <div class="page-title" style="margin:0;">Inbound Leads</div>
      <button class="btn btn-primary" id="add-lead-btn">+ Add lead</button>
    </div>
    <div class="card" style="overflow-x:auto;">
      <table class="list-table leads-table" id="leads-table"></table>
    </div>
    <div class="section-label" style="margin-top:20px;">Notes</div>
    <textarea id="leads-notes" class="leads-notes" placeholder="General notes...">${escapeHtml(tracker.notes || '')}</textarea>
  `;

  renderTable(tracker, container);

  document.getElementById('add-lead-btn').addEventListener('click', () => {
    tracker.rows.push(emptyRow());
    commit();
    renderInboundLeads(container);
  });

  const notesEl = document.getElementById('leads-notes');
  notesEl.addEventListener('input', () => {
    tracker.notes = notesEl.value;
    commit();
  });
}

function emptyRow() {
  const row = { id: uid('lead') };
  COLUMNS.forEach((c) => { row[c.key] = ''; });
  return row;
}

function renderTable(tracker, container) {
  const table = document.getElementById('leads-table');
  table.innerHTML = `
    <thead>
      <tr>
        ${COLUMNS.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')}
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${tracker.rows.map((row) => `
        <tr>
          ${COLUMNS.map((c) => `<td>${renderCell(row, c)}</td>`).join('')}
          <td><button class="btn btn-ghost" data-remove-lead="${row.id}" style="padding:3px 7px;">✕</button></td>
        </tr>
      `).join('')}
    </tbody>
  `;

  table.querySelectorAll('[data-field]').forEach((input) => {
    const evt = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(evt, () => {
      const row = tracker.rows.find((r) => r.id === input.dataset.rowId);
      row[input.dataset.field] = input.value;
      commit();
    });
  });

  table.querySelectorAll('[data-remove-lead]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tracker.rows = tracker.rows.filter((r) => r.id !== btn.dataset.removeLead);
      commit();
      renderInboundLeads(container);
    });
  });
}

function renderCell(row, col) {
  const value = row[col.key] || '';
  if (col.type === 'select') {
    return `<select class="cell-input" data-row-id="${row.id}" data-field="${col.key}">
      ${col.options.map((o) => `<option value="${escapeHtml(o)}" ${o === value ? 'selected' : ''}>${o ? escapeHtml(o) : '—'}</option>`).join('')}
    </select>`;
  }
  if (col.type === 'date') {
    return `<input type="date" class="cell-input" data-row-id="${row.id}" data-field="${col.key}" value="${escapeHtml(value)}" />`;
  }
  return `<input type="text" class="cell-input" data-row-id="${row.id}" data-field="${col.key}" value="${escapeHtml(value)}" />`;
}

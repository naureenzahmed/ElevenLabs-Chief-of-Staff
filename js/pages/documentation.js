import { getData, commit } from '../store.js';
import { uid, escapeHtml } from '../utils.js';
import { notesBoxHtml } from '../notesBox.js';

export function renderDocumentation(container) {
  const data = getData();
  const sections = data.docs;

  container.innerHTML = `
    ${notesBoxHtml('documentation')}
    <div class="toolbar">
      <div class="page-title" style="margin:0;">Documentation &amp; SOPs</div>
      <button class="btn btn-primary" id="add-doc-section-btn">+ Section</button>
    </div>
    <div class="inline-add-form" id="add-doc-section-form" style="display:none;">
      <input type="text" id="add-doc-section-input" placeholder="Section title" />
      <button class="btn btn-primary" id="add-doc-section-confirm">Add</button>
      <button class="btn btn-ghost" id="add-doc-section-cancel">Cancel</button>
    </div>
    <div id="doc-sections" class="stack-16"></div>
  `;

  document.getElementById('doc-sections').innerHTML = sections.map(renderSection).join('');

  const sectionForm = document.getElementById('add-doc-section-form');
  const sectionInput = document.getElementById('add-doc-section-input');
  document.getElementById('add-doc-section-btn').addEventListener('click', () => {
    sectionForm.style.display = sectionForm.style.display === 'none' ? 'flex' : 'none';
    if (sectionForm.style.display === 'flex') sectionInput.focus();
  });
  document.getElementById('add-doc-section-cancel').addEventListener('click', () => {
    sectionForm.style.display = 'none';
    sectionInput.value = '';
  });
  const confirmAddSection = () => {
    const title = sectionInput.value.trim();
    if (!title) return;
    sections.push({ id: uid('docsec'), title, entries: [] });
    commit();
    renderDocumentation(container);
  };
  document.getElementById('add-doc-section-confirm').addEventListener('click', confirmAddSection);
  sectionInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmAddSection(); });

  wireEvents(container, sections);
}

function renderSection(s) {
  return s.fields ? renderStructuredSection(s) : renderSimpleSection(s);
}

/* Sections with a defined field schema (e.g. Software Login, Bottom-of-Funnel) */
function renderStructuredSection(s) {
  return `
    <div class="card doc-card" id="${s.id}">
      <div class="toolbar" style="margin-bottom:6px;">
        <h4 style="margin:0;">${escapeHtml(s.title)}</h4>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-ghost" data-add-doc-row="${s.id}" style="padding:4px 8px;">+ Add row</button>
          <button class="btn btn-ghost btn-danger" data-remove-doc-section="${s.id}" style="padding:4px 8px;">Remove section</button>
        </div>
      </div>
      ${s.entries.length ? `
        <div class="tracker-scroll">
          <table class="list-table doc-fields-table">
            <thead>
              <tr>
                ${s.fields.map((f) => `<th>${escapeHtml(f.label)}</th>`).join('')}
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${s.entries.map((entry) => `
                <tr>
                  ${s.fields.map((f) => `
                    <td><input type="text" class="cell-input" data-row-id="${entry.id}" data-section-id="${s.id}" data-field="${f.key}" value="${escapeHtml(entry[f.key] || '')}" /></td>
                  `).join('')}
                  <td><button class="btn btn-ghost" data-remove-doc-row="${s.id}|${entry.id}" style="padding:3px 7px;">✕</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<div class="empty-hint">No entries yet.</div>'}
    </div>
  `;
}

/* Simple sections: a list of documents with a title, optional link, and notes */
function renderSimpleSection(s) {
  return `
    <div class="card doc-card" id="${s.id}">
      <div class="toolbar" style="margin-bottom:6px;">
        <h4 style="margin:0;">${escapeHtml(s.title)}</h4>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-ghost" data-add-doc="${s.id}" style="padding:4px 8px;">+ Add document</button>
          <button class="btn btn-ghost btn-danger" data-remove-doc-section="${s.id}" style="padding:4px 8px;">Remove section</button>
        </div>
      </div>
      ${s.entries.length ? `
        <div class="doc-list">
          ${s.entries.map((e) => `
            <div class="doc-row">
              <div class="doc-row-main">
                ${e.url ? `<a href="${escapeHtml(e.url)}" target="_blank" rel="noopener" class="doc-title">${escapeHtml(e.title)}</a>` : `<span class="doc-title">${escapeHtml(e.title)}</span>`}
                ${e.notes ? `<div class="doc-notes">${escapeHtml(e.notes)}</div>` : ''}
              </div>
              <div class="doc-row-actions">
                <button class="btn btn-ghost" data-edit-doc="${s.id}|${e.id}" style="padding:3px 8px;">Edit</button>
                <button class="btn btn-ghost" data-remove-doc-entry="${s.id}|${e.id}" style="padding:3px 8px;">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-hint">No documents yet.</div>'}
      <div class="inline-add-form" id="add-doc-form-${s.id}" style="display:none;">
        <input type="text" id="add-doc-input-${s.id}" placeholder="Document title" />
        <button class="btn btn-primary" data-confirm-add-doc="${s.id}">Add</button>
        <button class="btn btn-ghost" data-cancel-add-doc="${s.id}">Cancel</button>
      </div>
    </div>
  `;
}

function wireEvents(container, sections) {
  /* Structured field tables */
  document.querySelectorAll('[data-add-doc-row]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = sections.find((s) => s.id === btn.dataset.addDocRow);
      const row = { id: uid('docrow') };
      section.fields.forEach((f) => { row[f.key] = ''; });
      section.entries.push(row);
      commit();
      renderDocumentation(container);
    });
  });

  document.querySelectorAll('.doc-fields-table .cell-input').forEach((input) => {
    input.addEventListener('input', () => {
      const section = sections.find((s) => s.id === input.dataset.sectionId);
      const entry = section.entries.find((e) => e.id === input.dataset.rowId);
      entry[input.dataset.field] = input.value;
      commit();
    });
  });

  document.querySelectorAll('[data-remove-doc-row]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [sectionId, rowId] = btn.dataset.removeDocRow.split('|');
      const section = sections.find((s) => s.id === sectionId);
      section.entries = section.entries.filter((e) => e.id !== rowId);
      commit();
      renderDocumentation(container);
    });
  });

  /* Simple doc lists */
  document.querySelectorAll('[data-add-doc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const form = document.getElementById(`add-doc-form-${btn.dataset.addDoc}`);
      const input = document.getElementById(`add-doc-input-${btn.dataset.addDoc}`);
      form.style.display = form.style.display === 'none' ? 'flex' : 'none';
      if (form.style.display === 'flex') input.focus();
    });
  });

  document.querySelectorAll('[data-cancel-add-doc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById(`add-doc-form-${btn.dataset.cancelAddDoc}`).style.display = 'none';
    });
  });

  const confirmAddDoc = (sectionId) => {
    const input = document.getElementById(`add-doc-input-${sectionId}`);
    const title = input.value.trim();
    if (!title) return;
    const section = sections.find((s) => s.id === sectionId);
    section.entries.push({ id: uid('doc'), title, url: '', notes: '' });
    commit();
    renderDocumentation(container);
  };
  document.querySelectorAll('[data-confirm-add-doc]').forEach((btn) => {
    btn.addEventListener('click', () => confirmAddDoc(btn.dataset.confirmAddDoc));
  });
  document.querySelectorAll('[id^="add-doc-input-"]').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmAddDoc(input.id.replace('add-doc-input-', ''));
    });
  });

  document.querySelectorAll('[data-edit-doc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [sectionId, entryId] = btn.dataset.editDoc.split('|');
      const section = sections.find((s) => s.id === sectionId);
      const entry = section.entries.find((e) => e.id === entryId);
      const title = prompt('Document title', entry.title);
      if (title === null) return;
      const url = prompt('Link (URL, optional)', entry.url || '');
      if (url === null) return;
      const notes = prompt('Notes (optional)', entry.notes || '');
      if (notes === null) return;
      entry.title = title.trim() || entry.title;
      entry.url = url.trim();
      entry.notes = notes.trim();
      commit();
      renderDocumentation(container);
    });
  });

  document.querySelectorAll('[data-remove-doc-entry]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [sectionId, entryId] = btn.dataset.removeDocEntry.split('|');
      const section = sections.find((s) => s.id === sectionId);
      section.entries = section.entries.filter((e) => e.id !== entryId);
      commit();
      renderDocumentation(container);
    });
  });

  /* Shared: remove a whole section */
  document.querySelectorAll('[data-remove-doc-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = sections.findIndex((s) => s.id === btn.dataset.removeDocSection);
      if (idx >= 0) sections.splice(idx, 1);
      commit();
      renderDocumentation(container);
    });
  });
}

import { getData, commit } from './store.js';
import { escapeHtml } from './utils.js';

export function notesBoxHtml(pageKey) {
  const data = getData();
  const value = data.pageNotes?.[pageKey] || '';
  return `
    <div class="page-notes-wrap">
      <div class="section-label">Notes</div>
      <textarea class="notes-box" id="page-notes-${pageKey}" placeholder="Jot down anything relevant to this page...">${escapeHtml(value)}</textarea>
    </div>
  `;
}

export function wireNotesBox(pageKey) {
  const data = getData();
  data.pageNotes = data.pageNotes || {};
  const el = document.getElementById(`page-notes-${pageKey}`);
  if (!el) return;
  el.addEventListener('input', () => {
    data.pageNotes[pageKey] = el.value;
    commit();
  });
}

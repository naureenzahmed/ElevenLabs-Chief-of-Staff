import { getData } from './store.js';
import { escapeHtml } from './utils.js';

export function notesBoxHtml(pageKey) {
  const data = getData();
  const value = data.pageNotes?.[pageKey] || '';
  return `
    <div class="page-notes-wrap">
      <div class="section-label">Notes</div>
      <textarea class="notes-box" id="page-notes-${pageKey}" readonly placeholder="No notes yet.">${escapeHtml(value)}</textarea>
    </div>
  `;
}

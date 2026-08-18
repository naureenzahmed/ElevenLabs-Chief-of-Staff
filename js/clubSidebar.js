import { commit } from './store.js';
import { escapeHtml, clamp } from './utils.js';

let onCloseCallback = null;

export function openClubSidebar(sections, sectionId, entityIndex, linkId, onClose) {
  onCloseCallback = onClose;
  render(sections, sectionId, entityIndex, linkId);
}

export function closeClubSidebar() {
  document.getElementById('sidebar-root').innerHTML = '';
  if (onCloseCallback) onCloseCallback();
}

function render(sections, sectionId, entityIndex, linkId) {
  const section = sections.find((s) => s.id === sectionId);
  const entity = section?.entities?.[entityIndex];
  const club = entity?.links?.find((l) => l.id === linkId);
  const root = document.getElementById('sidebar-root');
  if (!club) { root.innerHTML = ''; return; }

  const current = club.progressCurrent ?? 0;
  const target = club.progressTarget ?? 100;
  const pct = clamp(target ? (current / target) * 100 : 0, 0, 100);

  root.innerHTML = `
    <div class="sidebar-overlay" id="club-overlay"></div>
    <div class="task-sidebar">
      <div class="ts-header">
        <div style="font-weight:700; font-size:13px; color:var(--text-dim);">${escapeHtml(entity.name)} partnership</div>
        <button class="btn btn-ghost" id="club-close">✕</button>
      </div>
      <div class="ts-body">
        <input class="ts-title-input" id="club-name" value="${escapeHtml(club.name)}" placeholder="Club name" />

        <div class="ts-field">
          <div class="ts-field-label">Goal of the partnership</div>
          <textarea id="club-goal" placeholder="What are we trying to achieve with this partnership?">${escapeHtml(club.goal || '')}</textarea>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">What they get out of the partnership</div>
          <textarea id="club-theyget" placeholder="Value for the club/organization">${escapeHtml(club.theyGet || '')}</textarea>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">What we get out of the partnership</div>
          <textarea id="club-weget" placeholder="Value for us">${escapeHtml(club.weGet || '')}</textarea>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Progress</div>
          <div class="ts-inline">
            <input type="number" id="club-progress-current" value="${current}" />
            <input type="number" id="club-progress-target" value="${target}" />
          </div>
          <div class="progress-track" style="margin-top:8px;"><div class="progress-fill accent" style="width:${pct}%;"></div></div>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Date of the Event</div>
          <input type="date" id="club-event-date" value="${club.eventDate || ''}" />
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Date for the Partnership</div>
          <input type="date" id="club-partnership-date" value="${club.partnershipDate || ''}" />
        </div>
      </div>
    </div>
  `;

  const close = () => closeClubSidebar();
  document.getElementById('club-overlay').addEventListener('click', close);
  document.getElementById('club-close').addEventListener('click', close);

  const liveField = (id, key) => {
    document.getElementById(id).addEventListener('input', (e) => {
      club[key] = e.target.value;
      commit();
      if (onCloseCallback) onCloseCallback();
    });
  };
  liveField('club-name', 'name');
  liveField('club-goal', 'goal');
  liveField('club-theyget', 'theyGet');
  liveField('club-weget', 'weGet');
  liveField('club-event-date', 'eventDate');
  liveField('club-partnership-date', 'partnershipDate');

  const progressField = (id, key) => {
    document.getElementById(id).addEventListener('change', (e) => {
      club[key] = Number(e.target.value) || 0;
      commit();
      if (onCloseCallback) onCloseCallback();
      render(sections, sectionId, entityIndex, linkId);
    });
  };
  progressField('club-progress-current', 'progressCurrent');
  progressField('club-progress-target', 'progressTarget');
}

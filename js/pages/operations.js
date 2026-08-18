import { getData, commit, findTeam } from '../store.js';
import { uid, todayISO, fmtDate, relativeDay, initials, escapeHtml } from '../utils.js';

export function renderOperations(container) {
  const data = getData();

  container.innerHTML = `
    <div class="page-title">Team Management</div>

    <div id="ops-milestones">
      <div class="section-label">Key milestones</div>
      <div class="section-desc">Key dates across every roadmap, in order.</div>
      <div class="card" style="margin-bottom:24px;">
        <div id="milestones-list"></div>
        <button class="btn btn-ghost" id="add-milestone-btn" style="margin-top:8px; padding:4px 8px;">+ Add milestone</button>
      </div>
    </div>

    <div id="ops-availability">
      <div class="section-label">Availability</div>
      <div class="section-desc">Engineers &amp; designers — who's open right now.</div>
      <div class="card" style="margin-bottom:24px;">
        <div id="availability-summary"></div>
        <div id="people-list"></div>
      </div>
    </div>

    <div id="ops-teams">
      <div class="section-label">Team composition</div>
      <div class="section-desc">Who's on each team, grouped by role.</div>
      <div class="grid-3" id="team-grid"></div>
    </div>
  `;

  renderMilestones(data);
  renderAvailability(data);
  renderTeams(data);

  document.getElementById('add-milestone-btn').addEventListener('click', () => {
    const title = prompt('Milestone title', 'New milestone');
    if (!title) return;
    const date = prompt('Date (YYYY-MM-DD)', todayISO());
    if (!date) return;
    data.milestones.push({ id: uid('ms'), title, date, teamId: data.teams[0]?.id });
    commit();
    renderOperations(container);
  });
}

function renderMilestones(data) {
  const sorted = [...data.milestones].sort((a, b) => a.date.localeCompare(b.date));
  const el = document.getElementById('milestones-list');
  el.innerHTML = sorted.map((m) => {
    const team = findTeam(m.teamId);
    return `
      <div class="milestone-row">
        <div class="milestone-date">${fmtDate(m.date)}</div>
        <div><span class="team-dot" style="background:${team?.color || '#666'}; display:inline-block; margin-right:8px;"></span>${escapeHtml(m.title)}</div>
        <div style="color: var(--text-dim);">${escapeHtml(team?.name || '—')}</div>
        <div class="milestone-rel">${relativeDay(m.date)}</div>
      </div>
    `;
  }).join('') || '<div class="empty-hint">No milestones yet.</div>';
}

function busyPersonIds(data) {
  const today = todayISO();
  const busy = new Set();
  data.tasks.forEach((t) => {
    if (t.assigneeId && t.status !== 'Done' && t.startDate <= today && today <= t.endDate) {
      busy.add(t.assigneeId);
    }
  });
  return busy;
}

function renderAvailability(data) {
  const busy = busyPersonIds(data);
  const total = data.people.length;
  const freeCount = total - busy.size;
  const pct = total ? Math.round((freeCount / total) * 100) : 0;

  document.getElementById('availability-summary').innerHTML = `
    <div class="avail-bar-row">
      <div class="avail-big">${pct}%</div>
      <div style="color: var(--text-dim); font-size:12px;">of the team free right now</div>
      <div style="margin-left:auto; color: var(--text-dim); font-size:12px;">${freeCount} of ${total} available</div>
    </div>
    <div class="progress-track" style="margin-bottom:10px;">
      <div class="progress-fill green" style="width:${pct}%;"></div>
    </div>
    <div class="avail-legend">
      <span><span class="legend-dot" style="background:var(--green);"></span>${freeCount} free</span>
      <span><span class="legend-dot" style="background:var(--accent);"></span>${busy.size} active</span>
    </div>
  `;

  const list = document.getElementById('people-list');
  list.innerHTML = data.people.map((p) => {
    const isBusy = busy.has(p.id);
    const team = findTeam(p.teamId);
    return `
      <div class="person-row">
        <div class="person-name-cell">
          <span class="avatar" style="background:${team?.color || '#666'};">${initials(p.name)}</span>
          <div>${escapeHtml(p.name)}<span class="role">${escapeHtml(p.role)}</span></div>
        </div>
        <div style="color: var(--text-dim);">${escapeHtml(team?.name || '—')}</div>
        <div>${isBusy ? 'Working on a task' : 'Open to work'}</div>
        <div><span class="status-badge ${isBusy ? 'progress' : 'done'}">${isBusy ? 'Active' : 'Free'}</span></div>
      </div>
    `;
  }).join('');
}

function renderTeams(data) {
  document.getElementById('team-grid').innerHTML = data.teams.map((team) => {
    const members = data.people.filter((p) => p.teamId === team.id);
    const byRole = {};
    members.forEach((m) => { (byRole[m.role] = byRole[m.role] || []).push(m); });

    return `
      <div class="card team-card">
        <h4><span class="team-dot" style="background:${team.color}; display:inline-block; margin-right:6px;"></span>${escapeHtml(team.name)}</h4>
        ${Object.entries(byRole).map(([role, people]) => `
          <div class="team-role-label">${escapeHtml(role)}${people.length > 1 ? ` · ${people.length}` : ''}</div>
          ${people.map((p) => `
            <div class="team-member">
              <span class="avatar" style="background:${team.color};">${initials(p.name)}</span>
              ${escapeHtml(p.name)}
            </div>
          `).join('')}
        `).join('') || '<div class="empty-hint">No members yet.</div>'}
      </div>
    `;
  }).join('');
}

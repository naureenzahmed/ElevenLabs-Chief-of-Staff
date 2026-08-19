import { getData, commit, findTeam, findPerson } from '../store.js';
import { uid, clamp, escapeHtml, fmtDate, initials, colorForName } from '../utils.js';

export function renderOkrSection(container) {
  const data = getData();

  const groups = [
    { teamId: null, label: 'Sector Objectives', color: null },
    ...data.teams.map((t) => ({ teamId: t.id, label: t.name, color: t.color })),
  ];

  container.innerHTML = `
    <div class="toolbar">
      <div class="page-title" style="margin:0;">OKRs</div>
      <button class="btn btn-primary" id="add-objective-btn">+ Objective</button>
    </div>
    <div id="okr-groups" class="stack-16"></div>
  `;

  const root = document.getElementById('okr-groups');
  root.innerHTML = groups.map((g) => renderGroup(g, data)).join('');

  document.getElementById('add-objective-btn').addEventListener('click', () => {
    const title = prompt('Objective title', 'New objective');
    if (!title) return;
    const teamNames = data.teams.map((t) => t.name).join(' / ');
    const teamInput = prompt(`Team (${teamNames}), or leave blank for company-wide`, '');
    const team = data.teams.find((t) => t.name.toLowerCase() === (teamInput || '').trim().toLowerCase());
    data.okrs.push({ id: uid('okr'), objective: title, teamId: team ? team.id : null, keyResults: [] });
    commit();
    renderOkrSection(container);
  });

  wireEvents(container, data);
}

function renderGroup(group, data) {
  const okrs = data.okrs.filter((o) => (o.teamId || null) === group.teamId);
  if (!okrs.length) return '';

  return `
    <div>
      <div class="section-label" style="display:flex; align-items:center; gap:6px;">
        ${group.color ? `<span class="team-dot" style="background:${group.color};"></span>` : ''}
        ${escapeHtml(group.label)}
      </div>
      <div class="grid-3" style="margin-top:8px;">
        ${okrs.map((okr) => renderObjectiveCard(okr, data)).join('')}
      </div>
    </div>
  `;
}

function renderObjectiveCard(okr, data) {
  const avgPct = okr.keyResults.length
    ? Math.round(okr.keyResults.reduce((sum, kr) => sum + clamp(kr.target ? (kr.current / kr.target) * 100 : 0, 0, 100), 0) / okr.keyResults.length)
    : 0;

  return `
    <div class="card okr-card">
      <div class="okr-title-row">
        <h3 data-rename-okr="${okr.id}" style="cursor:text;">${escapeHtml(okr.objective)}</h3>
        <span class="pill">${avgPct}%</span>
      </div>
      <div style="margin-top:8px;">
        ${okr.keyResults.map((kr) => renderKeyResult(okr, kr, data)).join('') || '<div class="empty-hint">No key results yet.</div>'}
      </div>
      <button class="btn btn-ghost" data-add-kr="${okr.id}" style="margin-top:10px; padding: 4px 8px;">+ Add key result</button>
    </div>
  `;
}

function renderKeyResult(okr, kr, data) {
  const assignees = (kr.assigneeIds || []).map((id) => findPerson(id)).filter(Boolean);

  return `
    <div class="kr-row">
      <div class="kr-title-row">
        <span class="kr-title" data-edit-kr="${okr.id}|${kr.id}">${escapeHtml(kr.title)}</span>
        <span class="kr-values" data-edit-kr="${okr.id}|${kr.id}">${kr.current} / ${kr.target}</span>
      </div>
      <div class="progress-track"><div class="progress-fill accent" style="width:${clamp(kr.target ? (kr.current / kr.target) * 100 : 0, 0, 100)}%;"></div></div>
      <div class="kr-meta-row">
        <span class="kr-deadline" data-edit-deadline="${okr.id}|${kr.id}">${kr.deadline ? `Due ${fmtDate(kr.deadline)}` : 'Set deadline'}</span>
        <span class="kr-people" data-edit-people="${okr.id}|${kr.id}">
          ${assignees.map((p) => `<span class="avatar" style="background:${colorForName(p.name)};" title="${escapeHtml(p.name)}">${initials(p.name)}</span>`).join('')}
          ${!assignees.length ? '<span class="kr-people-empty">+ Add people</span>' : ''}
        </span>
      </div>
    </div>
  `;
}

function wireEvents(container, data) {
  container.querySelectorAll('[data-add-kr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const okr = data.okrs.find((o) => o.id === btn.dataset.addKr);
      const title = prompt('Key result title', 'New key result');
      if (!title) return;
      okr.keyResults.push({ id: uid('kr'), title, current: 0, target: 100, deadline: '', assigneeIds: [] });
      commit();
      renderOkrSection(container);
    });
  });

  container.querySelectorAll('[data-edit-kr]').forEach((el) => {
    el.addEventListener('click', () => {
      const [okrId, krId] = el.dataset.editKr.split('|');
      const okr = data.okrs.find((o) => o.id === okrId);
      const kr = okr.keyResults.find((k) => k.id === krId);
      const current = Number(prompt(`Current value for "${kr.title}"`, kr.current));
      if (Number.isNaN(current)) return;
      const target = Number(prompt('Target value', kr.target));
      kr.current = current;
      if (!Number.isNaN(target)) kr.target = target;
      commit();
      renderOkrSection(container);
    });
  });

  container.querySelectorAll('[data-edit-deadline]').forEach((el) => {
    el.addEventListener('click', () => {
      const [okrId, krId] = el.dataset.editDeadline.split('|');
      const okr = data.okrs.find((o) => o.id === okrId);
      const kr = okr.keyResults.find((k) => k.id === krId);
      const deadline = prompt('Deadline (YYYY-MM-DD)', kr.deadline || '');
      if (deadline === null) return;
      kr.deadline = deadline.trim();
      commit();
      renderOkrSection(container);
    });
  });

  container.querySelectorAll('[data-edit-people]').forEach((el) => {
    el.addEventListener('click', () => {
      const [okrId, krId] = el.dataset.editPeople.split('|');
      const okr = data.okrs.find((o) => o.id === okrId);
      const kr = okr.keyResults.find((k) => k.id === krId);
      const currentNames = (kr.assigneeIds || []).map((id) => findPerson(id)?.name).filter(Boolean).join(', ');
      const input = prompt('People working on this (comma-separated names)', currentNames);
      if (input === null) return;
      const names = input.split(',').map((n) => n.trim().toLowerCase()).filter(Boolean);
      kr.assigneeIds = data.people.filter((p) => names.includes(p.name.toLowerCase())).map((p) => p.id);
      commit();
      renderOkrSection(container);
    });
  });

  container.querySelectorAll('[data-rename-okr]').forEach((el) => {
    el.addEventListener('click', () => {
      const okr = data.okrs.find((o) => o.id === el.dataset.renameOkr);
      const title = prompt('Objective title', okr.objective);
      if (!title) return;
      okr.objective = title;
      commit();
      renderOkrSection(container);
    });
  });
}

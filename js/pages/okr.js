import { getData, commit, findTeam } from '../store.js';
import { uid, clamp, escapeHtml } from '../utils.js';

export function renderOkr(container) {
  const data = getData();

  container.innerHTML = `
    <div class="toolbar">
      <div class="page-title" style="margin:0;">OKRs</div>
      <button class="btn btn-primary" id="add-objective-btn">+ Objective</button>
    </div>
    <div class="grid-3" id="okr-grid"></div>
  `;

  const grid = document.getElementById('okr-grid');
  grid.innerHTML = data.okrs.map((okr) => renderObjectiveCard(okr, data)).join('');

  document.getElementById('add-objective-btn').addEventListener('click', () => {
    const title = prompt('Objective title', 'New objective');
    if (!title) return;
    data.okrs.push({ id: uid('okr'), objective: title, teamId: data.teams[0]?.id, keyResults: [] });
    commit();
    renderOkr(container);
  });

  grid.querySelectorAll('[data-add-kr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const okr = data.okrs.find((o) => o.id === btn.dataset.addKr);
      const title = prompt('Key result title', 'New key result');
      if (!title) return;
      okr.keyResults.push({ id: uid('kr'), title, current: 0, target: 100 });
      commit();
      renderOkr(container);
    });
  });

  grid.querySelectorAll('[data-edit-kr]').forEach((el) => {
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
      renderOkr(container);
    });
  });

  grid.querySelectorAll('[data-rename-okr]').forEach((el) => {
    el.addEventListener('click', () => {
      const okr = data.okrs.find((o) => o.id === el.dataset.renameOkr);
      const title = prompt('Objective title', okr.objective);
      if (!title) return;
      okr.objective = title;
      commit();
      renderOkr(container);
    });
  });
}

function renderObjectiveCard(okr, data) {
  const team = findTeam(okr.teamId);
  const avgPct = okr.keyResults.length
    ? Math.round(okr.keyResults.reduce((sum, kr) => sum + clamp(kr.target ? (kr.current / kr.target) * 100 : 0, 0, 100), 0) / okr.keyResults.length)
    : 0;

  return `
    <div class="card okr-card">
      <div class="okr-title-row">
        <h3 data-rename-okr="${okr.id}" style="cursor:text;"><span class="team-dot" style="background:${team?.color || '#666'}; display:inline-block; margin-right:6px;"></span>${escapeHtml(okr.objective)}</h3>
        <span class="pill">${avgPct}%</span>
      </div>
      <div style="margin-top:8px;">
        ${okr.keyResults.map((kr) => `
          <div class="kr-row">
            <div class="kr-title-row">
              <span class="kr-title" data-edit-kr="${okr.id}|${kr.id}">${escapeHtml(kr.title)}</span>
              <span class="kr-values" data-edit-kr="${okr.id}|${kr.id}">${kr.current} / ${kr.target}</span>
            </div>
            <div class="progress-track"><div class="progress-fill accent" style="width:${clamp(kr.target ? (kr.current / kr.target) * 100 : 0, 0, 100)}%;"></div></div>
          </div>
        `).join('') || '<div class="empty-hint">No key results yet.</div>'}
      </div>
      <button class="btn btn-ghost" data-add-kr="${okr.id}" style="margin-top:10px; padding: 4px 8px;">+ Add key result</button>
    </div>
  `;
}

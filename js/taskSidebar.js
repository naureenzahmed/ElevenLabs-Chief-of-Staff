import { getData, commit, findTask, findPerson } from './store.js';
import { uid, fmtDate, initials, colorForName, escapeHtml } from './utils.js';
import { notifySlack } from './slackNotify.js';

const STATUS_OPTIONS = ['No status', 'Backlog', 'Ready', 'In progress', 'In design', 'Committed', 'Done'];

let onCloseCallback = null;

export function openTaskSidebar(taskId, onClose) {
  onCloseCallback = onClose;
  render(taskId);
}

export function closeTaskSidebar() {
  document.getElementById('sidebar-root').innerHTML = '';
  if (onCloseCallback) onCloseCallback();
}

function computeConflicts(task, allTasks) {
  const conflicts = [];
  (task.blockedBy || []).forEach((bid) => {
    const blocker = allTasks.find((t) => t.id === bid);
    if (blocker && blocker.endDate > task.startDate) {
      conflicts.push(`Starts before its dependency “${blocker.title}” finishes (${fmtDate(blocker.endDate)})`);
    }
  });
  allTasks.forEach((t) => {
    if ((t.blockedBy || []).includes(task.id) && task.endDate > t.startDate) {
      conflicts.push(`“${t.title}” depends on this but starts before it finishes (${fmtDate(t.startDate)})`);
    }
  });
  return conflicts;
}

function render(taskId) {
  const task = findTask(taskId);
  const root = document.getElementById('sidebar-root');
  if (!task) { root.innerHTML = ''; return; }

  const data = getData();
  const needsInfo = !task.description?.trim() || !task.impact?.trim();
  const dependingTasks = data.tasks.filter((t) => (t.blockedBy || []).includes(task.id));
  const conflicts = computeConflicts(task, data.tasks);
  const conflictingBlockerIds = new Set(
    (task.blockedBy || []).filter((bid) => {
      const blocker = findTask(bid);
      return blocker && blocker.endDate > task.startDate;
    })
  );

  root.innerHTML = `
    <div class="sidebar-overlay" id="ts-overlay"></div>
    <div class="task-sidebar">
      <div class="ts-header">
        <button class="btn ${task.status === 'Done' ? 'btn-primary' : ''}" id="ts-complete">
          ${task.status === 'Done' ? '✓ Completed' : 'Mark complete'}
        </button>
        <button class="btn btn-ghost" id="ts-close">✕</button>
      </div>
      <div class="ts-body">
        <input class="ts-title-input" id="ts-title" value="${escapeHtml(task.title)}" placeholder="Task title" />

        ${needsInfo ? `<div class="ts-warning">Add a description and an impact before marking this task complete.</div>` : ''}
        ${conflicts.length ? `
          <div class="ts-conflict">
            <b>Scheduling conflict${conflicts.length > 1 ? 's' : ''}</b>
            <ul style="margin:4px 0 0; padding-left:16px;">
              ${conflicts.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="ts-field">
          <div class="ts-field-label">Description · Required</div>
          <textarea id="ts-description" placeholder="What is this task?">${escapeHtml(task.description)}</textarea>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Impact · Required</div>
          <input type="text" id="ts-impact" value="${escapeHtml(task.impact)}" placeholder="What's the impact? (short — quant or qual)" />
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Status</div>
          <select id="ts-status">
            ${STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === task.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Assignee</div>
          <select id="ts-assignee">
            <option value="">Unassigned</option>
            ${data.people.map((p) => `<option value="${p.id}" ${p.id === task.assigneeId ? 'selected' : ''}>${p.name} — ${p.role}</option>`).join('')}
          </select>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Dates</div>
          <div class="ts-inline">
            <input type="date" id="ts-start" value="${task.startDate}" />
            <input type="date" id="ts-end" value="${task.endDate}" />
          </div>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Design deadline</div>
          <input type="date" id="ts-design-deadline" value="${task.designDeadline || ''}" />
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Section</div>
          <select id="ts-section">
            ${data.initiatives.map((i) => `<option value="${i.id}" ${i.id === task.sectionId ? 'selected' : ''}>${i.name}</option>`).join('')}
          </select>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Created by</div>
          <div style="color: var(--text-dim); font-size: 13px;">${escapeHtml(task.createdBy || 'You')}</div>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Client</div>
          <input type="text" id="ts-client" value="${escapeHtml(task.client || '')}" placeholder="Who asked for this?" />
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Sprint</div>
          <div style="color: var(--text-dim); font-size: 13px;">${fmtDate(task.startDate)} – ${fmtDate(task.endDate)} · auto</div>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Team</div>
          <select id="ts-team">
            ${data.teams.map((t) => `<option value="${t.id}" ${t.id === task.teamId ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Blocked by (depends on)</div>
          <div id="ts-blockers">
            ${task.blockedBy.map((bid) => {
              const bt = findTask(bid);
              const conflictClass = conflictingBlockerIds.has(bid) ? ' ts-chip-conflict' : '';
              return bt ? `<span class="ts-chip${conflictClass}">${escapeHtml(bt.title)}<button data-remove-blocker="${bid}">✕</button></span>` : '';
            }).join('') || '<span class="empty-hint" style="padding:0;">None</span>'}
          </div>
          <button class="btn btn-ghost" id="ts-add-blocker" style="margin-top:6px; padding: 4px 8px;">+ Add dependency</button>
          <select id="ts-blocker-select" style="display:none; margin-top:6px;"></select>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Depending tasks</div>
          <div id="ts-dependents">
            ${dependingTasks.map((t) => `<span class="ts-chip">${escapeHtml(t.title)}</span>`).join('') || '<span class="empty-hint" style="padding:0;">Nothing depends on this yet</span>'}
          </div>
        </div>

        <div class="ts-field">
          <div class="ts-field-label">Subtasks</div>
          <div id="ts-subtasks">
            ${task.subtasks.map((s) => `
              <div class="ts-subtask-row">
                <input type="checkbox" data-subtask-toggle="${s.id}" ${s.done ? 'checked' : ''} />
                <span style="${s.done ? 'text-decoration: line-through; color: var(--text-faint);' : ''}">${escapeHtml(s.title)}</span>
                <button class="btn btn-ghost" data-subtask-remove="${s.id}" style="margin-left:auto; padding:2px 6px;">✕</button>
              </div>
            `).join('')}
          </div>
          <div class="ts-inline" style="margin-top:6px;">
            <input type="text" id="ts-subtask-input" placeholder="Add a subtask..." />
            <button class="btn" id="ts-subtask-add" style="flex: 0 0 auto;">Add</button>
          </div>
        </div>

        <div style="padding-top: 10px;">
          <div class="ts-field-label">Comments</div>
          <div id="ts-comments">
            ${task.comments.map((c) => `
              <div class="ts-comment">
                <div class="ts-comment-meta">${escapeHtml(c.author)} · ${new Date(c.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                <div>${escapeHtml(c.text)}</div>
              </div>
            `).join('')}
          </div>
          <div class="ts-inline" style="margin-top:8px;">
            <textarea id="ts-comment-input" placeholder="Write a comment..." style="min-height: 40px;"></textarea>
          </div>
          <button class="btn" id="ts-comment-add" style="margin-top:6px;">Send</button>
        </div>
      </div>
      <div class="ts-footer">
        <button class="btn btn-danger" id="ts-delete">Delete task</button>
      </div>
    </div>
  `;

  wireEvents(task);
}

function notifyConflictsIfAny(task, conflicts) {
  if (conflicts.length) {
    notifySlack(`⚠️ Conflict on task "${task.title}": ${conflicts[0]}${conflicts.length > 1 ? ` (+${conflicts.length - 1} more)` : ''}`);
  }
}

function wireEvents(task) {
  const data = getData();
  const close = () => closeTaskSidebar();

  document.getElementById('ts-overlay').addEventListener('click', close);
  document.getElementById('ts-close').addEventListener('click', close);

  const field = (id, key, label, { transform = (v) => v, checkConflicts = false } = {}) => {
    document.getElementById(id).addEventListener('change', (e) => {
      task[key] = transform(e.target.value);
      commit();
      notifySlack(`Task "${task.title}" updated — ${label} changed.`);
      if (checkConflicts) notifyConflictsIfAny(task, computeConflicts(task, data.tasks));
      if (onCloseCallback) onCloseCallback();
      render(task.id);
    });
  };
  const liveField = (id, key) => {
    document.getElementById(id).addEventListener('input', (e) => {
      task[key] = e.target.value;
      commit();
      if (onCloseCallback) onCloseCallback();
    });
  };

  liveField('ts-title', 'title');
  liveField('ts-description', 'description');
  liveField('ts-impact', 'impact');
  liveField('ts-client', 'client');
  field('ts-status', 'status', 'status');
  field('ts-assignee', 'assigneeId', 'assignee', { transform: (v) => v || null });
  field('ts-start', 'startDate', 'start date', { checkConflicts: true });
  field('ts-end', 'endDate', 'end date', { checkConflicts: true });
  field('ts-design-deadline', 'designDeadline', 'design deadline');
  field('ts-section', 'sectionId', 'section');
  field('ts-team', 'teamId', 'team');

  document.getElementById('ts-complete').addEventListener('click', () => {
    if (!task.description?.trim() || !task.impact?.trim()) {
      render(task.id);
      return;
    }
    task.status = task.status === 'Done' ? 'In progress' : 'Done';
    commit();
    notifySlack(`Task "${task.title}" marked ${task.status === 'Done' ? 'complete' : 'incomplete'}.`);
    if (onCloseCallback) onCloseCallback();
    render(task.id);
  });

  document.getElementById('ts-delete').addEventListener('click', () => {
    if (!confirm('Delete this task?')) return;
    const idx = data.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) data.tasks.splice(idx, 1);
    commit();
    notifySlack(`Task "${task.title}" deleted.`);
    closeTaskSidebar();
  });

  document.querySelectorAll('[data-remove-blocker]').forEach((btn) => {
    btn.addEventListener('click', () => {
      task.blockedBy = task.blockedBy.filter((id) => id !== btn.dataset.removeBlocker);
      commit();
      render(task.id);
    });
  });

  document.getElementById('ts-add-blocker').addEventListener('click', () => {
    const select = document.getElementById('ts-blocker-select');
    const candidates = data.tasks.filter((t) => t.id !== task.id && !task.blockedBy.includes(t.id));
    if (!candidates.length) { alert('No other tasks to depend on yet.'); return; }
    select.innerHTML = `<option value="">Choose a task…</option>` + candidates.map((t) => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join('');
    select.style.display = 'block';
    select.onchange = () => {
      if (select.value) {
        task.blockedBy.push(select.value);
        commit();
        const newConflicts = computeConflicts(task, data.tasks);
        notifySlack(`Task "${task.title}" now depends on "${findTask(select.value).title}".`);
        notifyConflictsIfAny(task, newConflicts);
        render(task.id);
      }
    };
  });

  document.getElementById('ts-subtask-add').addEventListener('click', () => {
    const input = document.getElementById('ts-subtask-input');
    if (!input.value.trim()) return;
    task.subtasks.push({ id: uid('sub'), title: input.value.trim(), done: false });
    commit();
    render(task.id);
  });

  document.querySelectorAll('[data-subtask-toggle]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const s = task.subtasks.find((s) => s.id === cb.dataset.subtaskToggle);
      if (s) s.done = cb.checked;
      commit();
      render(task.id);
    });
  });
  document.querySelectorAll('[data-subtask-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      task.subtasks = task.subtasks.filter((s) => s.id !== btn.dataset.subtaskRemove);
      commit();
      render(task.id);
    });
  });

  document.getElementById('ts-comment-add').addEventListener('click', () => {
    const input = document.getElementById('ts-comment-input');
    if (!input.value.trim()) return;
    task.comments.push({ id: uid('c'), author: 'You', text: input.value.trim(), ts: Date.now() });
    commit();
    render(task.id);
  });
}

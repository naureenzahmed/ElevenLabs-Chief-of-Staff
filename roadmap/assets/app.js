/* =====================================================================
   Roadmap dashboard — rendering
   ---------------------------------------------------------------------
   Reads window.ROADMAP_DATA (see data/roadmap.js) and renders every view.
   No build step, no dependencies. Edit the data file, reload the page.
   ===================================================================== */
(function () {
  "use strict";

  var D = window.ROADMAP_DATA;
  if (!D) { document.body.innerHTML = '<p class="empty-state">data/roadmap.js did not load.</p>'; return; }

  /* ---------- constants ------------------------------------------- */
  var DAY = 86400000;
  var DAY_W = 19;          // px per day on the timeline
  var LANE_H = 38;         // px per stacked lane inside a swimlane

  var STATUS = {
    request:   { label: "Request",     glyph: "↵", order: 0 },
    none:      { label: "No status",   glyph: "○", order: 1 },
    backlog:   { label: "Backlog",     glyph: "≡", order: 2 },
    committed: { label: "Committed",   glyph: "✓", order: 3 },
    design:    { label: "In design",   glyph: "◑", order: 4 },
    ready:     { label: "Ready",       glyph: "●", order: 5 },
    progress:  { label: "In progress", glyph: "◔", order: 6 },
    done:      { label: "Done",        glyph: "✓", order: 7 },
  };
  var BOARD_ORDER = ["request", "none", "committed", "design", "ready", "progress", "done"];
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  /* ---------- lookups --------------------------------------------- */
  var teamById = {}, personById = {};
  D.teams.forEach(function (t) { teamById[t.id] = t; });
  D.people.forEach(function (p) { personById[p.id] = p; });

  function teamColor(id) {
    var t = teamById[id];
    if (!t || t.slot === "other" || t.slot == null) return "var(--series-other)";
    return "var(--series-" + t.slot + ")";
  }
  function teamName(id) { return (teamById[id] || {}).short || "No team"; }

  /* ---------- dates ------------------------------------------------ */
  function d(s) { var p = String(s).split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function days(a, b) { return Math.round((b - a) / DAY); }
  function fmtDay(x) { return MONTHS[x.getUTCMonth()] + " " + x.getUTCDate(); }
  function fmtRange(a, b) {
    var s = d(a), e = d(b);
    return s.getUTCMonth() === e.getUTCMonth()
      ? fmtDay(s) + " – " + e.getUTCDate()
      : fmtDay(s) + " – " + fmtDay(e);
  }

  var TODAY = D.meta.today ? d(D.meta.today) : (function () {
    var n = new Date();
    return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  })();
  var YEAR_END = d(D.meta.yearEnd);

  /* ---------- numbers ---------------------------------------------- */
  function money(n) {
    if (n == null) return "—";
    var a = Math.abs(n);
    if (a >= 1e6) return "$" + trim(n / 1e6) + "M";
    if (a >= 1e3) return "$" + trim(n / 1e3) + "k";
    return "$" + n;
  }
  function trim(x) {
    var s = x.toFixed(x < 10 ? 2 : 1);
    s = s.replace(/\.?0+$/, "");
    return s;
  }
  function fmtVal(v, format) {
    if (v == null) return "—";
    if (format === "currency") return money(v);
    if (format === "percent") return v + "%";
    return String(v);
  }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function initials(name) {
    var w = name.trim().split(/\s+/);
    return (w.length > 1 ? w[0][0] + w[1][0] : name.slice(0, 2));
  }

  /* ---------- tiny DOM helper -------------------------------------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "style") n.setAttribute("style", v);
      else if (k === "html") n.innerHTML = v;
      else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function frag(kids) {
    var f = document.createDocumentFragment();
    kids.forEach(function (k) { if (k) f.appendChild(k); });
    return f;
  }
  function $(sel) { return document.querySelector(sel); }

  /* ---------- shared components ------------------------------------ */
  function statusPill(s) {
    var m = STATUS[s] || STATUS.none;
    return el("span", { class: "status status-" + s }, [
      el("span", { class: "glyph", "aria-hidden": "true", text: m.glyph }),
      el("span", { text: m.label }),
    ]);
  }

  function avatar(pid) {
    var p = personById[pid];
    if (!p) return el("span", { class: "avatar empty", title: "Unassigned", text: "–" });
    return el("span", { class: "avatar", title: p.name + " · " + teamName(p.team), text: initials(p.name) });
  }

  function avatars(ids, hideWhenEmpty) {
    if (!ids || !ids.length) {
      return hideWhenEmpty ? null : el("span", { class: "avatars" }, [avatar(null)]);
    }
    return el("span", { class: "avatars" }, ids.slice(0, 3).map(avatar));
  }

  function teamTag(id) {
    return el("span", { class: "tag", style: "--team-color:" + teamColor(id), text: teamName(id) });
  }

  /* ---------- task derivations ------------------------------------- */
  D.tasks.forEach(function (t) {
    t._s = d(t.start);
    t._e = d(t.end);
    // a task belongs to the sprint it starts in; if it started before the
    // tracked window, fall back to the sprint it lands in
    t._sprint = sprintFor(t._s) || sprintFor(t._e);
    t._overdue = t.status !== "done" && t._e < TODAY;
    t._overdueBy = t._overdue ? days(t._e, TODAY) : 0;
  });

  function sprintFor(dt) {
    for (var i = 0; i < D.sprints.length; i++) {
      var sp = D.sprints[i];
      if (dt >= d(sp.start) && dt <= d(sp.end)) return sp.id;
    }
    return null;
  }
  var CURRENT_SPRINT = sprintFor(TODAY);

  function sprintChip(t) {
    if (t._sprint == null) {
      var wks = Math.round(days(t._e, TODAY) / 14);
      if (wks > 0) return el("span", { class: "chip-sprint", text: wks + " ago" });
      return el("span", { class: "chip-sprint", text: "Later" });
    }
    var diff = t._sprint - CURRENT_SPRINT;
    if (diff === 0) return el("span", { class: "chip-sprint current", text: "Current" });
    if (diff === -1) return el("span", { class: "chip-sprint", text: "Last" });
    if (diff < 0) return el("span", { class: "chip-sprint", text: -diff + " ago" });
    return el("span", { class: "chip-sprint", text: "In " + diff });
  }

  /* =================================================================
     TOOLTIP
     ================================================================= */
  var tip = el("div", { id: "tooltip", role: "tooltip" });
  document.body.appendChild(tip);

  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.setAttribute("data-show", "true");
    var r = tip.getBoundingClientRect();
    var left = Math.min(x + 14, window.innerWidth - r.width - 10);
    var top = y + 18 + r.height > window.innerHeight ? y - r.height - 12 : y + 18;
    tip.style.left = Math.max(8, left) + "px";
    tip.style.top = Math.max(8, top) + "px";
  }
  function hideTip() { tip.setAttribute("data-show", "false"); }

  function bindTaskTip(node, t) {
    node.addEventListener("mousemove", function (e) {
      var rows = [
        ["Team", teamName(t.team)],
        ["Status", (STATUS[t.status] || STATUS.none).label],
        ["Dates", fmtRange(t.start, t.end)],
        ["Owner", t.people && t.people.length
          ? t.people.map(function (p) { return (personById[p] || {}).name || p; }).join(", ")
          : "Unassigned"],
      ];
      if (t.subtasks) rows.push(["Subtasks", t.subtasks.done + " / " + t.subtasks.total]);
      if (t.ref) rows.push(["Ref", t.ref]);
      if (t._overdue) rows.push(["Overdue", t._overdueBy + "d"]);
      var html = '<div class="tt-title">' + esc(t.title) + "</div>" +
        rows.map(function (r) {
          return '<div class="tt-row"><span>' + r[0] + "</span><span>" + esc(String(r[1])) + "</span></div>";
        }).join("") +
        (t.note ? '<div class="tt-note">' + esc(t.note) + "</div>" : "");
      showTip(html, e.clientX, e.clientY);
    });
    node.addEventListener("mouseleave", hideTip);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* =================================================================
     HEADER
     ================================================================= */
  function renderGoalBar() {
    var g = D.goal;
    var p = pct(g.current, g.target);
    $("#goalbar").appendChild(frag([
      el("div", { class: "goal-icon", "aria-hidden": "true", text: "◎" }),
      el("div", {}, [
        el("div", { class: "goal-label", text: g.label }),
        el("div", { class: "goal-title", text: g.title }),
      ]),
      el("div", { class: "goal-figures" }, [
        el("span", { class: "hero-number", text: money(g.current) }),
        el("span", { class: "hero-sub", text: "/ " + money(g.target) + " " + g.unit }),
        el("span", { class: "pill-pct", text: p + "%" }),
        el("span", { class: "hero-sub", style: "font-size:10px;text-transform:uppercase;letter-spacing:.06em", text: g.asOf }),
      ]),
      el("div", { class: "countdown" }, [
        el("div", { class: "n tabular", text: String(Math.max(0, days(TODAY, YEAR_END))) }),
        el("div", { class: "l", text: "days to EOY" }),
      ]),
    ]));
  }

  /* =================================================================
     TIMELINE
     ================================================================= */
  function renderTimeline() {
    var root = $("#view-timeline");
    root.innerHTML = "";

    var first = D.sprints[1] || D.sprints[0];
    var last = D.sprints[D.sprints.length - 1];
    var t0 = d(first.start), t1 = d(last.end);
    var total = days(t0, t1) + 1;
    var W = total * DAY_W;
    var x = function (dt) { return days(t0, dt) * DAY_W; };

    /* ---- header ---- */
    var sprintRow = el("div", { class: "tl-sprints", style: "width:" + W + "px" });
    var weekRow = el("div", { class: "tl-weeks", style: "width:" + W + "px" });

    D.sprints.forEach(function (sp) {
      var s = d(sp.start), e = d(sp.end);
      if (e < t0 || s > t1) return;
      var left = Math.max(0, x(s));
      var w = Math.min(W, x(e) + DAY_W) - left;
      sprintRow.appendChild(el("div", {
        class: "tl-sprint" + (sp.id === CURRENT_SPRINT ? " current" : ""),
        style: "left:" + left + "px;width:" + w + "px",
        text: sp.name.toUpperCase(),
      }));
      // one label per week inside the sprint
      for (var k = 0; k < 2; k++) {
        var ws = new Date(s.getTime() + k * 7 * DAY);
        if (ws > t1) break;
        weekRow.appendChild(el("div", {
          class: "tl-week",
          style: "left:" + x(ws) + "px;width:" + (7 * DAY_W) + "px",
          text: fmtDay(ws),
        }));
      }
    });

    var todayFlag = el("div", {
      class: "tl-today-flag",
      style: "left:" + (x(TODAY) + DAY_W / 2 - 6) + "px;top:27px",
      text: "Today",
    });

    var head = el("div", { class: "tl-head" }, [
      el("div", { class: "tl-gutter" }, [
        el("div", { class: "tl-gutter-head" }, [
          el("span", { text: "‹" }),
          el("span", { text: D.tasks.length + " tasks · " + D.timelineTeams.length + " initiatives" }),
        ]),
      ]),
      el("div", { class: "tl-canvas", style: "width:" + W + "px" }, [sprintRow, weekRow, todayFlag]),
    ]);

    /* ---- body ---- */
    var body = el("div", { class: "tl-body" });

    D.timelineTeams.forEach(function (tid) {
      var team = teamById[tid];
      var color = teamColor(tid);

      var mine = D.tasks.filter(function (t) {
        return t.team === tid && t._e >= t0 && t._s <= t1;
      }).sort(function (a, b) { return a._s - b._s || a.title.localeCompare(b.title); });

      // greedy lane packing so bars never overlap
      var laneEnds = [];
      mine.forEach(function (t) {
        var placed = false;
        for (var i = 0; i < laneEnds.length; i++) {
          if (t._s > laneEnds[i]) { t._lane = i; laneEnds[i] = t._e; placed = true; break; }
        }
        if (!placed) { t._lane = laneEnds.length; laneEnds.push(t._e); }
      });
      var laneCount = Math.max(1, laneEnds.length);

      var track = el("div", {
        class: "tl-track",
        style: "width:" + W + "px;height:" + (laneCount * LANE_H + 40) + "px",
      });

      // gridlines + current-sprint band
      var grid = el("div", { class: "tl-gridlines" });
      D.sprints.forEach(function (sp) {
        var s = d(sp.start);
        if (s < t0 || s > t1) return;
        grid.appendChild(el("div", { class: "tl-gridline sprint", style: "left:" + x(s) + "px" }));
        var mid = new Date(s.getTime() + 7 * DAY);
        if (mid <= t1) grid.appendChild(el("div", { class: "tl-gridline", style: "left:" + x(mid) + "px" }));
        if (sp.id === CURRENT_SPRINT) {
          grid.appendChild(el("div", {
            class: "tl-sprintband",
            style: "left:" + x(s) + "px;width:" + (days(s, d(sp.end)) + 1) * DAY_W + "px",
          }));
        }
      });
      track.appendChild(grid);
      track.appendChild(el("div", { class: "tl-today", style: "left:" + (x(TODAY) + DAY_W / 2) + "px" }));

      // per-sprint header line inside the lane
      D.sprints.forEach(function (sp) {
        var s = d(sp.start);
        if (s < t0 || s > t1) return;
        var inSprint = mine.filter(function (t) { return t._sprint === sp.id; });
        if (!inSprint.length) return;
        var done = inSprint.filter(function (t) { return t.status === "done"; }).length;
        var w = (days(s, d(sp.end)) + 1) * DAY_W;
        track.appendChild(el("div", {
          class: "tl-sprintmeta",
          style: "left:" + x(s) + "px;width:" + (w - 12) + "px",
        }, [
          el("span", { text: sp.name.toUpperCase() }),
          sp.theme ? el("span", { style: "overflow:hidden;text-overflow:ellipsis", text: "· " + sp.theme }) : null,
          el("span", { class: "count tabular", text: done + "/" + inSprint.length + " done" }),
        ]));
      });

      // bars
      mine.forEach(function (t) {
        var left = x(t._s);
        var w = Math.max(DAY_W * 2, (days(t._s, t._e) + 1) * DAY_W - 4);
        var bar = el("div", {
          class: "tl-bar" + (t.status === "done" ? " is-done" : ""),
          style: "--team-color:" + color + ";left:" + left + "px;width:" + w + "px;top:" +
                 (26 + t._lane * LANE_H) + "px",
          tabindex: "0",
        }, [
          t.status === "done"
            ? el("span", { class: "tl-bar-check done", "aria-hidden": "true", text: "✓" })
            : (t.status !== "none" && w >= 190 ? statusPill(t.status) : null),
          el("span", { class: "tl-bar-title", text: t.title }),
          t.note && w > 330 ? el("span", { class: "tl-bar-note", text: t.note }) : null,
          el("span", { class: "tl-bar-right" }, [
            t.subtasks && w >= 150 ? el("span", { class: "bc-sub tabular", text: t.subtasks.done + "/" + t.subtasks.total }) : null,
            w >= 110 ? avatars(t.people, true) : null,
          ]),
        ]);
        bindTaskTip(bar, t);
        track.appendChild(bar);
      });

      body.appendChild(el("div", { class: "tl-row" }, [
        el("div", { class: "tl-lane-label" }, [
          el("div", { class: "tl-lane-title" }, [
            el("span", { class: "team-dot", style: "--team-color:" + color }),
            el("span", { text: team.name }),
          ]),
          team.mission ? el("div", { class: "tl-lane-mission", text: team.mission }) : null,
          team.target ? el("div", { class: "tl-lane-figure" }, [
            document.createTextNode(money(team.current)),
            el("span", { class: "of", text: " / " + money(team.target) + " " + (team.unit || "") }),
            team.trend != null ? el("span", { class: "delta", text: "  ▲ " +
              (team.trendAbs ? money(team.trend) : Math.round(team.trend * 100) + "%") }) : null,
          ]) : null,
        ]),
        track,
      ]));
    });

    root.appendChild(el("div", { class: "timeline-scroll" }, [
      el("div", { class: "timeline" }, [head, body]),
    ]));
  }

  /* =================================================================
     LIST
     ================================================================= */
  var listSort = { key: "start", dir: 1 };

  function renderList() {
    var root = $("#view-list");
    root.innerHTML = "";

    var cols = [
      { key: "title",  label: "Name" },
      { key: "status", label: "Status" },
      { key: "people", label: "Assignee" },
      { key: "start",  label: "Dates" },
      { key: "impact", label: "Impact" },
      { key: "subtasks", label: "Subtasks", right: true },
      { key: "sprint", label: "Sprint", right: true },
    ];

    var thead = el("thead", {}, [
      el("tr", {}, cols.map(function (c) {
        var th = el("th", { scope: "col", style: c.right ? "text-align:right" : null }, [
          el("span", { text: c.label }),
          el("span", { class: "sortcue", text: listSort.key === c.key ? (listSort.dir > 0 ? "▲" : "▼") : "⇅" }),
        ]);
        th.addEventListener("click", function () {
          if (listSort.key === c.key) listSort.dir *= -1;
          else { listSort.key = c.key; listSort.dir = 1; }
          renderList();
        });
        return th;
      })),
    ]);

    var tbody = el("tbody");

    // group by team, teams in roadmap order
    var order = D.teams.map(function (t) { return t.id; });
    order.forEach(function (tid) {
      var team = teamById[tid];
      var rows = D.tasks.filter(function (t) { return t.team === tid; });
      if (!rows.length) return;

      rows.sort(function (a, b) {
        var k = listSort.key, av, bv;
        if (k === "people") { av = (a.people[0] || "~"); bv = (b.people[0] || "~"); }
        else if (k === "status") { av = STATUS[a.status].order; bv = STATUS[b.status].order; }
        else if (k === "start") { av = a._s; bv = b._s; }
        else if (k === "sprint") { av = a._sprint || 99; bv = b._sprint || 99; }
        else if (k === "subtasks") { av = a.subtasks ? a.subtasks.total : -1; bv = b.subtasks ? b.subtasks.total : -1; }
        else { av = (a[k] || "").toString().toLowerCase(); bv = (b[k] || "").toString().toLowerCase(); }
        return (av < bv ? -1 : av > bv ? 1 : 0) * listSort.dir;
      });

      tbody.appendChild(el("tr", { class: "list-group" }, [
        el("td", { colspan: String(cols.length) }, [
          el("div", { class: "list-group-inner" }, [
            el("span", { class: "list-group-name" }, [
              el("span", { class: "team-dot", style: "--team-color:" + teamColor(tid) }),
              el("span", { text: team.name }),
              el("span", { class: "list-count tabular", text: String(rows.length) }),
            ]),
            team.target ? el("span", { style: "font-weight:700" }, [
              document.createTextNode(money(team.current)),
              el("span", { class: "muted", style: "font-weight:400", text: " / " + money(team.target) + " " + (team.unit || "") }),
            ]) : null,
            team.trend != null ? el("span", { class: "delta", text: "▲ " +
              (team.trendAbs ? money(team.trend) : Math.round(team.trend * 100) + "%") }) : null,
          ]),
        ]),
      ]));

      rows.forEach(function (t) {
        var tr = el("tr", { class: "task" + (t.status === "done" ? " is-done" : "") }, [
          el("td", {}, [
            el("div", { class: "list-name" }, [
              el("span", { class: "tl-bar-check" + (t.status === "done" ? " done" : ""),
                           "aria-hidden": "true", text: t.status === "done" ? "✓" : "" }),
              el("span", { class: "txt", title: t.title, text: t.title }),
              t.ref ? el("span", { class: "ref", text: t.ref }) : null,
            ]),
          ]),
          el("td", {}, [statusPill(t.status)]),
          el("td", {}, [
            el("span", { class: "who" }, [
              avatar(t.people[0]),
              el("span", { class: t.people.length ? "" : "muted",
                           text: t.people.length ? (personById[t.people[0]] || {}).name : "Unassigned" }),
            ]),
          ]),
          el("td", { class: "col-dates" }, [
            el("span", { class: "tabular", text: fmtRange(t.start, t.end) }),
            t._overdue ? el("span", { class: "status status-overdue", style: "margin-left:7px" }, [
              el("span", { class: "glyph", "aria-hidden": "true", text: "⚠" }),
              el("span", { text: "Overdue " + t._overdueBy + "d" }),
            ]) : null,
          ]),
          el("td", { class: "col-impact", text: t.impact || t.note || "—" }),
          el("td", { class: "col-subtasks", style: "text-align:right" }, [
            t.subtasks
              ? el("span", { class: "tabular muted", text: t.subtasks.done + "/" + t.subtasks.total })
              : el("span", { class: "muted", text: "—" }),
          ]),
          el("td", { class: "col-sprint", style: "text-align:right" }, [sprintChip(t)]),
        ]);
        bindTaskTip(tr, t);
        tbody.appendChild(tr);
      });
    });

    root.appendChild(el("div", { class: "wrap", style: "max-width:none" }, [
      el("table", { class: "list-table" }, [thead, tbody]),
    ]));
  }

  /* =================================================================
     BOARD
     ================================================================= */
  function renderBoard() {
    var root = $("#view-board");
    root.innerHTML = "";

    var board = el("div", { class: "board" });

    BOARD_ORDER.forEach(function (s) {
      var cards = D.tasks.filter(function (t) { return t.status === s; });
      var total = (D.boardTotals || {})[s];

      var list = el("div", { class: "board-cards" });
      cards.forEach(function (t) {
        var card = el("div", { class: "board-card" + (t.status === "done" ? " is-done" : ""), tabindex: "0" }, [
          el("div", { class: "bc-title" }, [
            el("span", { class: "tl-bar-check" + (t.status === "done" ? " done" : ""),
                         "aria-hidden": "true", text: t.status === "done" ? "✓" : "" }),
            el("span", { text: t.title }),
          ]),
          t.note ? el("div", { class: "bc-note", text: t.note }) : null,
          el("div", { class: "bc-tags" }, [
            teamTag(t.team),
            statusPill(t.status),
            t.ref ? el("span", { class: "ref", text: t.ref }) : null,
          ]),
          t.subtasks ? el("div", {}, [
            el("div", { class: "bc-sub", text: "Subtasks " + t.subtasks.done + "/" + t.subtasks.total }),
            el("div", { class: "meter" }, [
              el("i", { style: "width:" + pct(t.subtasks.done, t.subtasks.total) + "%" }),
            ]),
          ]) : null,
          el("div", { class: "bc-foot" }, [
            avatar(t.people[0]),
            el("span", { class: "nm", text: t.people.length ? (personById[t.people[0]] || {}).name : "Unassigned" }),
            el("span", { class: "dates tabular" + (t._overdue ? " overdue" : ""), text: fmtRange(t.start, t.end) }),
          ]),
        ]);
        bindTaskTip(card, t);
        list.appendChild(card);
      });

      var col = el("div", { class: "board-col" }, [
        el("div", { class: "board-col-head" }, [
          el("span", { class: "team-dot status-dot status-" + s }),
          el("span", { text: STATUS[s].label }),
          el("span", { class: "n", text: total && total > cards.length ? cards.length + " of " + total : String(cards.length) }),
        ]),
        list,
      ]);
      if (total && total > cards.length) {
        col.appendChild(el("div", { class: "board-more",
          text: (total - cards.length) + " more not itemised in the data file" }));
      }
      board.appendChild(col);
    });

    root.appendChild(el("div", { class: "board-scroll" }, [board]));
  }

  /* =================================================================
     OPERATIONS
     ================================================================= */
  function renderOps() {
    var root = $("#view-operations");
    root.innerHTML = "";
    var wrap = el("div", { class: "wrap" });

    wrap.appendChild(el("h1", { style: "font-size:19px;margin:0 0 22px;display:flex;align-items:center;gap:8px" }, [
      el("span", { style: "color:var(--series-2)", "aria-hidden": "true", text: "◔" }),
      el("span", { text: "Operations" }),
    ]));

    /* ---- milestones ---- */
    var ms = D.milestones.slice().sort(function (a, b) { return d(a.date) - d(b.date); });
    var msCard = el("div", { class: "card" });
    ms.forEach(function (m) {
      var dt = d(m.date), past = dt < TODAY;
      var n = Math.abs(days(TODAY, dt));
      msCard.appendChild(el("div", { class: "ms-row" + (past ? " past" : "") }, [
        el("span", { class: "ms-date tabular", text: fmtDay(dt) }),
        el("span", { class: "ms-diamond", style: "--team-color:" + teamColor(m.team), "aria-hidden": "true" }),
        el("span", { class: "ms-title", text: m.title }),
        el("span", { class: "ms-team", text: teamName(m.team) }),
        el("span", { class: "ms-when", text: past ? n + "d ago" : "in " + n + "d" }),
      ]));
    });
    wrap.appendChild(el("section", { class: "section" }, [
      el("h2", { class: "section-title", text: "Key milestones" }),
      el("p", { class: "section-note", text: "Key dates across every roadmap, in order." }),
      msCard,
    ]));

    /* ---- availability ---- */
    var eng = D.people.filter(function (p) { return p.role === "engineer" || p.role === "designer"; });
    var free = eng.filter(function (p) { return p.available; });
    var active = eng.length - free.length;
    var segs = [
      { key: "free",    label: "free",       n: free.length, cls: "seg-free",    color: "var(--good)" },
      { key: "freeing", label: "freeing up", n: 0,           cls: "seg-freeing", color: "var(--warning)" },
      { key: "active",  label: "active",     n: active,      cls: "seg-active",  color: "var(--series-1)" },
      { key: "over",    label: "overloaded", n: 0,           cls: "seg-over",    color: "var(--critical)" },
    ];

    var stacked = el("div", { class: "stacked", role: "img",
      "aria-label": free.length + " free, 0 freeing up, " + active + " active, 0 overloaded, of " + eng.length });
    segs.forEach(function (s) {
      if (!s.n) return;
      stacked.appendChild(el("i", { class: s.cls, style: "width:" + (s.n / eng.length * 100) + "%" }));
    });

    var legend = el("div", { class: "legend" }, segs.map(function (s) {
      return el("span", { class: "legend-item" }, [
        el("span", { class: "legend-swatch " + s.cls, "aria-hidden": "true" }),
        el("b", { text: String(s.n) }),
        el("span", { text: s.label }),
      ]);
    }));

    wrap.appendChild(el("section", { class: "section" }, [
      el("h2", { class: "section-title", text: "Availability" }),
      el("p", { class: "section-note", text: "Engineers & designers — who's open right now, and who's about to free up." }),
      el("div", { class: "card avail-card" }, [
        el("div", { class: "avail-head" }, [
          el("span", { class: "avail-pct", text: pct(free.length, eng.length) + "%" }),
          el("span", { class: "muted", text: "of the team free right now" }),
          el("span", { class: "avail-of tabular", text: free.length + " of " + eng.length + " available" }),
        ]),
        stacked,
        legend,
      ]),
    ]));

    /* ---- free now table ---- */
    var freeTable = el("table", { class: "ops-table" }, [
      el("thead", {}, [el("tr", {}, ["Person", "Team", "Finishing / next", "Frees up", "Status"].map(function (h) {
        return el("th", { scope: "col", text: h });
      }))]),
      el("tbody", {}, free.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (p) {
        return el("tr", {}, [
          el("td", {}, [el("span", { class: "person" }, [
            avatar(p.id),
            el("span", {}, [
              el("div", { class: "nm", text: p.name }),
              el("div", { class: "rl", text: p.role[0].toUpperCase() + p.role.slice(1) }),
            ]),
          ])]),
          el("td", {}, [teamById[p.team] && teamById[p.team].slot !== "other"
            ? el("span", { class: "who" }, [
                el("span", { class: "team-dot", style: "--team-color:" + teamColor(p.team) }),
                el("span", { text: teamName(p.team) }),
              ])
            : el("span", { class: "muted", text: "—" })]),
          el("td", { class: p.next ? "" : "muted", text: p.next ? "Next: " + p.next : "Open to work" }),
          el("td", { class: "muted", text: "Now" }),
          el("td", {}, [el("span", { class: "pill-free", text: "Free" })]),
        ]);
      })),
    ]);

    wrap.appendChild(el("section", { class: "section" }, [
      el("div", { class: "subhead" }, [
        el("h3", {}, [
          el("span", { class: "legend-swatch seg-free", "aria-hidden": "true" }),
          el("span", { text: "Free now" }),
          el("span", { class: "badge tabular", text: String(free.length) }),
        ]),
      ]),
      el("div", { class: "card" }, [freeTable]),
    ]));

    /* ---- queues ---- */
    var unassigned = D.tasks.filter(function (t) { return !t.people.length && t.status !== "done"; })
      .sort(function (a, b) { return a._e - b._e; });
    var overdue = D.tasks.filter(function (t) { return t._overdue; })
      .sort(function (a, b) { return a._e - b._e; });

    var queues = { unassigned: unassigned, overdue: overdue };
    var qCard = el("div", { class: "card" });
    var qTabs = el("div", { class: "queue-tabs" });
    var qList = el("div");

    function drawQueue(which) {
      qList.innerHTML = "";
      queues[which].slice(0, 8).forEach(function (t) {
        qList.appendChild(el("div", { class: "queue-row" }, [
          el("span", { class: "t", text: t.title }),
          el("span", { class: "team", text: "· " + teamName(t.team) }),
          el("span", { class: "d tabular" + (which === "overdue" ? " overdue" : ""), text: fmtDay(t._e) }),
        ]));
      });
      var total = which === "unassigned" ? (D.ops.unassignedTotal || unassigned.length) : (D.ops.overdueTotal || overdue.length);
      qList.appendChild(el("div", { class: "queue-foot", text: "See all " + total }));
      Array.prototype.forEach.call(qTabs.children, function (b) {
        b.setAttribute("aria-selected", String(b.dataset.q === which));
      });
    }

    [["unassigned", "Unassigned", D.ops.unassignedTotal, "var(--warning)"],
     ["overdue", "Overdue", D.ops.overdueTotal, "var(--critical)"]].forEach(function (q) {
      var b = el("button", { class: "queue-tab", "data-q": q[0], role: "tab" }, [
        el("span", { class: "legend-swatch", style: "background:" + q[3], "aria-hidden": "true" }),
        el("span", { text: q[1] }),
        el("span", { class: "n", text: String(q[2]) }),
      ]);
      b.addEventListener("click", function () { drawQueue(q[0]); });
      qTabs.appendChild(b);
    });
    qCard.appendChild(qTabs);
    qCard.appendChild(qList);
    drawQueue("unassigned");
    wrap.appendChild(el("section", { class: "section" }, [qCard]));

    /* ---- team composition ---- */
    var ROLES = [["pm", "Product manager"], ["designer", "Designer"], ["growth", "Growth"],
                 ["engineer", "Engineer"], ["other", "Other"]];
    var grid = el("div", { class: "team-grid" });
    D.teams.forEach(function (team) {
      var members = D.people.filter(function (p) { return p.team === team.id; });
      var pad = (D.headcountPadding || {})[team.id] || 0;
      if (!members.length && !pad) return;
      var card = el("div", { class: "card team-card" }, [
        el("div", { class: "team-card-head" }, [
          el("span", { class: "team-dot", style: "--team-color:" + teamColor(team.id) }),
          el("span", { text: team.short }),
          el("span", { class: "n tabular", text: String(members.length + pad) }),
        ]),
      ]);
      ROLES.forEach(function (r) {
        var inRole = members.filter(function (p) { return p.role === r[0]; });
        var extra = r[0] === "other" ? pad : 0;
        if (!inRole.length && !extra) return;
        card.appendChild(el("div", { class: "role-block" }, [
          el("div", { class: "role-label", text: r[1] + (inRole.length + extra > 1 ? " · " + (inRole.length + extra) : "") }),
          el("div", { class: "role-people" }, inRole.map(function (p) {
            return el("span", { class: "person-chip" }, [avatar(p.id), el("span", { text: p.name })]);
          }).concat(extra ? [el("span", { class: "person-chip muted", text: "+ " + extra + " more" })] : [])),
        ]));
      });
      grid.appendChild(card);
    });

    wrap.appendChild(el("section", { class: "section" }, [
      el("h2", { class: "section-title", text: "Team composition" }),
      el("p", { class: "section-note", text: "Who's on each team, grouped by role." }),
      grid,
    ]));

    root.appendChild(wrap);
  }

  /* =================================================================
     METRICS
     ================================================================= */
  function renderMetrics() {
    var root = $("#view-metrics");
    root.innerHTML = "";
    var wrap = el("div", { class: "wrap" });
    var g = D.goal;

    /* hero */
    wrap.appendChild(el("div", { class: "card goal-hero" }, [
      el("div", { class: "goal-hero-top" }, [
        el("div", { class: "goal-icon", "aria-hidden": "true", text: "◎" }),
        el("div", {}, [
          el("div", { class: "goal-label", text: g.label }),
          el("div", { class: "goal-title", style: "font-size:16px", text: g.title }),
          el("div", { style: "margin-top:12px;display:flex;align-items:baseline;gap:9px" }, [
            el("span", { class: "hero-number", style: "font-size:34px", text: money(g.current) }),
            el("span", { class: "hero-sub", text: "/ " + money(g.target) + " " + g.unit }),
            el("span", { class: "pill-pct", text: pct(g.current, g.target) + "%" }),
          ]),
        ]),
        el("div", { class: "countdown" }, [
          el("div", { class: "n tabular", text: String(Math.max(0, days(TODAY, YEAR_END))) }),
          el("div", { class: "l", text: "days to EOY" }),
        ]),
      ]),
      el("div", { class: "progress-track" }, [
        el("div", { class: "progress-fill", style: "width:" + pct(g.current, g.target) + "%" }),
      ]),
    ]));

    /* monthly log */
    var M = D.metrics;
    var head = el("tr", {}, [el("th", { scope: "col", text: "Metric" })]
      .concat(M.months.map(function (m, i) {
        var cls = i === M.projectionFrom ? "cur" : (i > M.projectionFrom ? "proj" : "");
        return el("th", { scope: "col", class: cls, text: m + (i === M.projectionFrom ? " *" : "") });
      }))
      .concat([
        el("th", { scope: "col", text: "Target" }),
        el("th", { scope: "col", text: "MoM trend" }),
      ]));

    var tbody = el("tbody");
    M.groups.forEach(function (grp, gi) {
      if (gi) tbody.appendChild(el("tr", { class: "spacer" }, [
        el("td", { colspan: String(M.months.length + 3) }, [
          el("span", { class: "addcue", text: "+ Add metric" }),
        ]),
      ]));
      grp.rows.forEach(function (r) {
        tbody.appendChild(el("tr", {}, [
          el("td", {}, [el("span", { class: "metric-name" }, [
            el("span", { class: "team-dot", style: "--team-color:" + teamColor(r.team) }),
            el("span", { text: r.label }),
          ])]),
        ].concat(r.values.map(function (v, i) {
          return el("td", { class: i >= M.projectionFrom ? "proj" : "", text: fmtVal(v, r.format) });
        })).concat([
          el("td", {}, [
            document.createTextNode(fmtVal(r.target, r.format)),
            r.targetUnit ? el("span", { class: "target-unit", text: r.targetUnit }) : null,
          ]),
          el("td", {}, [r.trend
            ? el("span", { class: "delta" + (r.trendDir === "down" ? " down" : ""),
                           text: (r.trendDir === "down" ? "▼ " : "▲ ") + r.trend })
            : el("span", { class: "muted", text: "—" })]),
        ])));
      });
    });

    wrap.appendChild(el("section", { class: "section" }, [
      el("h2", { class: "section-title", text: "Monthly log" }),
      el("div", { class: "card", style: "overflow-x:auto" }, [
        el("table", { class: "metrics-table" }, [el("thead", {}, [head]), tbody]),
      ]),
      el("p", { class: "metrics-foot",
        text: "* Projection — not counted in the dashboard metrics until the month closes. Later months are forecast, shown muted, never counted as an actual." }),
    ]));

    /* tracked goals */
    var cards = el("div", { class: "goal-cards" });
    D.trackedGoals.forEach(function (tg) {
      cards.appendChild(el("div", { class: "card goal-card" }, [
        el("div", { class: "goal-card-top" }, [
          el("span", { class: "kind", text: "Initiative" }),
          el("span", { class: "team-dot", style: "--team-color:" + teamColor(tg.team) }),
          el("span", { class: "muted", text: teamName(tg.team) }),
          tg.trend ? el("span", { class: "delta", text: "▲ " + tg.trend }) : null,
        ]),
        el("h4", { text: tg.label }),
        el("div", { class: "fig" }, [
          document.createTextNode(money(tg.current)),
          el("span", { class: "of", text: " / " + money(tg.target) + " " + (tg.unit || "") }),
        ]),
        el("div", { class: "progress-track", style: "margin-top:2px" }, [
          el("div", { class: "progress-fill", style: "width:" + pct(tg.current, tg.target) + "%" }),
        ]),
        el("div", { class: "proj", text: "Projected Dec " + money(tg.projectedDec) }),
        sparkline(tg),
      ]));
    });

    wrap.appendChild(el("section", { class: "section" }, [
      el("h2", { class: "section-title", text: "Tracked goals" }),
      cards,
    ]));

    root.appendChild(wrap);
  }

  /* Single-series sparkline: actuals solid, forecast dashed.
     No legend — the card title names the series; values live in the
     monthly-log table above, which is the table view for this chart. */
  function sparkline(tg) {
    var NS = "http://www.w3.org/2000/svg";
    var vals = tg.series, n = vals.length;
    var w = 240, h = 46, pad = 3;
    var max = Math.max.apply(null, vals.concat([1]));
    var px = function (i) { return pad + (i / (n - 1)) * (w - pad * 2); };
    var py = function (v) { return h - pad - (v / max) * (h - pad * 2); };
    var cut = D.metrics.projectionFrom;

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "spark");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", tg.label + " trend, " + money(vals[0]) + " to a projected " + money(vals[n - 1]));

    function path(from, to, dashed) {
      var dstr = "";
      for (var i = from; i <= to; i++) dstr += (i === from ? "M" : "L") + px(i) + " " + py(vals[i]);
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", dstr);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", teamColor(tg.team));
      p.setAttribute("stroke-width", "2");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      if (dashed) { p.setAttribute("stroke-dasharray", "3 3"); p.setAttribute("opacity", "0.65"); }
      return p;
    }
    svg.appendChild(path(0, cut - 1, false));
    svg.appendChild(path(cut - 1, n - 1, true));

    // one marker: the last actual
    var dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", px(cut - 1));
    dot.setAttribute("cy", py(vals[cut - 1]));
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", teamColor(tg.team));
    dot.setAttribute("stroke", "var(--surface-1)");
    dot.setAttribute("stroke-width", "2");   // 2px surface ring
    svg.appendChild(dot);

    svg.addEventListener("mousemove", function (e) {
      var r = svg.getBoundingClientRect();
      var i = Math.round(((e.clientX - r.left) / r.width) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      showTip('<div class="tt-title">' + esc(tg.label) + " · " + D.metrics.months[i] + "</div>" +
        '<div class="tt-row"><span>' + (i >= cut ? "Forecast" : "Actual") + "</span><span>" + money(vals[i]) + "</span></div>",
        e.clientX, e.clientY);
    });
    svg.addEventListener("mouseleave", hideTip);
    return svg;
  }

  /* =================================================================
     NAVIGATION
     ================================================================= */
  var TABS = ["roadmap", "operations", "metrics"];
  var ROADMAP_VIEWS = ["timeline", "list", "board"];
  var state = { tab: "roadmap", roadmapView: "timeline" };
  var rendered = {};

  function show() {
    TABS.forEach(function (t) {
      var b = document.querySelector('[data-tab="' + t + '"]');
      if (b) b.setAttribute("aria-selected", String(t === state.tab));
    });
    ROADMAP_VIEWS.forEach(function (v) {
      var b = document.querySelector('[data-rview="' + v + '"]');
      if (b) b.setAttribute("aria-selected", String(v === state.roadmapView));
    });
    $("#roadmap-switcher").hidden = state.tab !== "roadmap";

    var active = state.tab === "roadmap" ? state.roadmapView : state.tab;
    ["timeline", "list", "board", "operations", "metrics"].forEach(function (v) {
      $("#view-" + v).hidden = v !== active;
    });

    if (!rendered[active]) {
      ({ timeline: renderTimeline, list: renderList, board: renderBoard,
         operations: renderOps, metrics: renderMetrics })[active]();
      rendered[active] = true;
    }
    if (location.hash.slice(1) !== active) history.replaceState(null, "", "#" + active);
  }

  document.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-tab]");
    if (tab) { state.tab = tab.dataset.tab; show(); return; }
    var rv = e.target.closest("[data-rview]");
    if (rv) { state.tab = "roadmap"; state.roadmapView = rv.dataset.rview; show(); }
  });

  /* theme toggle — dark is the default, light is a selected alternative */
  $("#theme-toggle").addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    this.textContent = next === "light" ? "◑" : "◐";
    rendered = {};                       // colours are read at render time
    show();
  });

  /* deep links: #timeline #list #board #operations #metrics */
  function applyHash() {
    var h = location.hash.slice(1);
    if (ROADMAP_VIEWS.indexOf(h) > -1) { state.tab = "roadmap"; state.roadmapView = h; }
    else if (TABS.indexOf(h) > -1) state.tab = h;
    else return false;
    return true;
  }
  window.addEventListener("hashchange", function () { if (applyHash()) show(); });

  /* ---------- boot -------------------------------------------------- */
  renderGoalBar();
  applyHash();
  show();
})();

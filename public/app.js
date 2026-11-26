(function () {
  'use strict';

  const STUDIED_KEY = 'fhirprep.studied.v1';
  const OVERVIEW = 'overview';
  const AXIS_MAX = 40; // percent, for the weighting chart

  const state = {
    data: null,
    admin: false,
    adminConfigured: false,
    route: OVERVIEW,
    filter: '',
    resourceFilter: '',
    lastCategory: null,
    resourceIndex: null,
    studied: loadStudied(),
    editing: null, // { id, original, draft, pane, busy, error, confirmRestore }
  };

  const $ = (sel) => document.querySelector(sel);
  const els = {
    nav: $('#nav'), main: $('#main'), progress: $('#progress'), adminBox: $('#admin-box'),
    sidebar: $('#sidebar'), scrim: $('#scrim'), menuBtn: $('#menu-btn'), filter: $('#topic-filter'),
    dialog: $('#login-dialog'), loginForm: $('#login-form'), loginPassword: $('#login-password'),
    loginError: $('#login-error'), loginSubmit: $('#login-submit'), loginCancel: $('#login-cancel'),
    toast: $('#toast'), resourceBar: $('#resource-bar'),
  };

  // ---------- Helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function loadStudied() {
    try { return new Set(JSON.parse(localStorage.getItem(STUDIED_KEY) || '[]')); } catch { return new Set(); }
  }
  function saveStudied() {
    try { localStorage.setItem(STUDIED_KEY, JSON.stringify([...state.studied])); } catch { /* storage unavailable */ }
  }
  function range(w) { return `${w[0]}–${w[1]}%`; }
  function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
  }

  if (window.DOMPurify) {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') || '')) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }
  function renderMarkdown(md) {
    if (!md || !md.trim()) return '<p class="notes-empty">No notes yet.</p>';
    const html = DOMPurify.sanitize(marked.parse(md, { gfm: true }));
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    tpl.content.querySelectorAll('table').forEach((t) => {
      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      t.replaceWith(wrap);
      wrap.appendChild(t);
    });
    const div = document.createElement('div');
    div.appendChild(tpl.content);
    return div.innerHTML;
  }

  let toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2600);
  }

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      credentials: 'same-origin',
      ...opts,
      headers: { ...(opts.body ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
    });
    let body = null;
    try { body = await res.json(); } catch { /* not JSON */ }
    if (!res.ok) {
      const err = new Error((body && body.error) || `The server answered ${res.status}.`);
      err.status = res.status;
      throw err;
    }
    return body;
  }

  // ---------- Data helpers ----------
  function topicList() {
    const list = [{ id: OVERVIEW, title: 'Exam overview', domain: null }];
    state.data.domains.forEach((d) => d.topics.forEach((t) => list.push({ ...t, domain: d })));
    return list;
  }
  function findTopic(id) {
    return topicList().find((t) => t.id === id) || null;
  }
  function studyTopics() {
    return topicList().filter((t) => t.id !== OVERVIEW);
  }

  // ---------- Sidebar ----------
  function renderNav() {
    const q = state.filter.trim().toLowerCase();
    const match = (t, d) => !q || t.title.toLowerCase().includes(q) || d.title.toLowerCase().includes(q);
    const link = (id, title, weight) => {
      const current = state.route === id ? ' aria-current="page"' : '';
      const done = state.studied.has(id);
      return `<a class="nav-link" href="#${id}"${current}>
        <span class="dot${done ? ' done' : ''}" title="${done ? 'Studied' : 'Not studied yet'}"></span>
        <span class="label">${esc(title)}</span>
        ${weight ? `<span class="weight">${range(weight)}</span>` : ''}
      </a>`;
    };

    let html = '';
    if (!q || 'exam overview'.includes(q)) {
      html += `<div class="nav-overview">${link(OVERVIEW, 'Exam overview')}</div>`;
    }
    state.data.domains.forEach((d) => {
      const topics = d.topics.filter((t) => match(t, d));
      if (!topics.length) return;
      html += `<section class="nav-domain" aria-label="${esc(d.title)}">
        <div class="nav-domain-head">
          <span class="nav-domain-title">${esc(d.title)}</span>
          <span class="nav-domain-weight">${range(d.weight)}</span>
        </div>
        ${topics.map((t) => link(t.id, t.title, t.weight)).join('')}
      </section>`;
    });
    els.nav.innerHTML = html || '<p class="nav-empty">No topics match that filter.</p>';
  }

  function renderProgress() {
    const topics = studyTopics();
    const done = topics.filter((t) => state.studied.has(t.id)).length;
    const pct = Math.round((done / topics.length) * 100);
    els.progress.innerHTML = `
      <div class="progress-label"><span>Studied</span><span>${done} of ${topics.length}</span></div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${topics.length}" aria-valuenow="${done}" aria-label="Topics studied">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>`;
  }

  function renderAdminBox() {
    if (state.admin) {
      els.adminBox.innerHTML = `<span class="admin-state"><span class="pip"></span><span class="admin-label">Admin</span></span>
        <button class="btn small ghost" type="button" data-action="logout">Sign out</button>`;
    } else {
      els.adminBox.innerHTML = `<button class="btn small ghost" type="button" data-action="login" aria-label="Admin sign-in"><span class="long">Admin sign-in</span><span class="short">Sign in</span></button>`;
    }
  }

  function renderSidebar() {
    renderNav();
    renderProgress();
    renderAdminBox();
  }

  // ---------- FHIR resources ----------
  const RESOURCE_PREFIX = 'resource-';
  const CATEGORY_PREFIX = 'resources-';

  function resourceCategories() {
    return state.data.resources.categories;
  }
  function allResources() {
    if (!state.resourceIndex) {
      state.resourceIndex = resourceCategories().flatMap((c) =>
        c.groups.flatMap((g) => g.resources.map((r) => ({ ...r, category: c, group: g.title }))),
      );
    }
    return state.resourceIndex;
  }
  function findResource(name) {
    return allResources().find((r) => r.name === name) || null;
  }
  function resourceCount(c) {
    return c.groups.reduce((n, g) => n + g.resources.length, 0);
  }

  function maturityBadge(m) {
    if (m === 'N') return '<span class="mat normative" title="Normative: stable content">Normative</span>';
    const level = Number(m);
    const bars = [1, 2, 3, 4, 5].map((i) => `<i class="${i <= level ? 'on' : ''}"></i>`).join('');
    return `<span class="mat" title="Trial use, FHIR Maturity Model level ${level} of 5">FMM ${level} <span class="mat-scale" aria-hidden="true">${bars}</span></span>`;
  }

  // Horizontal bar under the header: category tabs, then the resources of the
  // active category in one scrolling row.
  function renderResourceBar(route) {
    const bar = els.resourceBar;
    if (route.section !== 'resources') {
      bar.hidden = true;
      bar.innerHTML = '';
      return;
    }
    const active = route.category;
    const cats = resourceCategories().map((c) =>
      `<a href="#${CATEGORY_PREFIX}${c.id}"${c.id === active.id ? ' aria-current="true"' : ''}>${esc(c.title)} <span class="count">${resourceCount(c)}</span></a>`,
    ).join('');
    const strip = active.groups.map((g) => `<span class="grp">${esc(g.title)}</span>` +
      g.resources.map((r) => {
        const id = RESOURCE_PREFIX + r.name;
        const cur = route.resource && route.resource.name === r.name ? ' aria-current="page"' : '';
        const done = state.studied.has(id);
        return `<a href="#${id}"${cur}><span class="dot${done ? ' done' : ''}"></span>${esc(r.name)}</a>`;
      }).join(''),
    ).join('');
    bar.innerHTML = `<div class="res-cats" role="list">${cats}</div><div class="res-strip">${strip}</div>`;
    bar.hidden = false;
    const cur = bar.querySelector('.res-strip [aria-current="page"]');
    if (cur) {
      const s = bar.querySelector('.res-strip');
      s.scrollLeft = cur.offsetLeft - s.clientWidth / 2 + cur.offsetWidth / 2;
    }
  }

  function resourceCard(r) {
    const done = state.studied.has(RESOURCE_PREFIX + r.name);
    return `<a class="res-card" href="#${RESOURCE_PREFIX}${esc(r.name)}">
      <span class="res-card-top">
        <span class="dot${done ? ' done' : ''}" title="${done ? 'Studied' : 'Not studied yet'}"></span>
        <span class="name">${esc(r.name)}</span>${maturityBadge(r.maturity)}
      </span>
      <span class="desc">${esc(r.description)}</span>
    </a>`;
  }

  function renderResourceResults(route) {
    const q = state.resourceFilter.trim().toLowerCase();
    if (q) {
      const hits = allResources().filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
      hits.sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)));
      return `<div class="res-cat-head"><h2>${hits.length} ${hits.length === 1 ? 'match' : 'matches'}</h2>
          <p>Resources whose name or definition contains “${esc(state.resourceFilter.trim())}”.</p></div>
        ${hits.length ? `<div class="res-grid">${hits.map(resourceCard).join('')}</div>` : '<p class="res-empty">No resource matches. Try a shorter word, such as “medic” or “claim”.</p>'}`;
    }
    const c = route.category;
    return `<div class="res-cat-head"><h2>${esc(c.title)}</h2><p>${esc(c.description)}</p></div>
      ${c.groups.map((g) => `<section class="res-group">
        <h3>${esc(g.title)} <span class="n">${g.resources.length}</span></h3>
        <div class="res-grid">${g.resources.map(resourceCard).join('')}</div>
      </section>`).join('')}`;
  }

  function renderResourceIndex(route) {
    const all = allResources();
    const done = all.filter((r) => state.studied.has(RESOURCE_PREFIX + r.name)).length;
    return `<article class="page wide">
      <header class="page-head">
        <p class="eyebrow">FHIR R4 (4.0.1) · ${all.length} resources · ${done} studied</p>
        <h1 class="page-title">FHIR resources</h1>
        <p class="lead">Every resource in FHIR R4, grouped the way the specification’s
          <a href="${esc(state.data.resources.specBase)}resourcelist.html" target="_blank" rel="noopener noreferrer">resource list</a> groups them.
          Pick a category above, or search by name.</p>
      </header>
      <div class="res-tools">
        <label for="resource-filter" class="visually-hidden">Find a resource</label>
        <input id="resource-filter" type="search" placeholder="Find a resource, e.g. Observation" autocomplete="off" value="${esc(state.resourceFilter)}">
        <span class="legend">${maturityBadge('N')} stable ${maturityBadge('3')} trial use, maturity 0–5</span>
      </div>
      <div id="resource-results">${renderResourceResults(route)}</div>
    </article>`;
  }

  function renderResourcePage(route) {
    const r = route.resource;
    const id = RESOURCE_PREFIX + r.name;
    const note = state.data.notes[id] || { markdown: '', edited: false };
    const list = allResources();
    const i = list.findIndex((x) => x.name === r.name);
    const prev = list[i - 1];
    const next = list[i + 1];
    const studied = state.studied.has(id);
    const editing = state.editing && state.editing.id === id;
    const specUrl = state.data.resources.specBase + r.page;
    const hasNotes = note.markdown && note.markdown.trim();

    let notesBody;
    if (editing) notesBody = renderEditor();
    else if (hasNotes) notesBody = `<div class="notes">${renderMarkdown(note.markdown)}</div>`;
    else notesBody = `<div class="empty-notes"><p>No study notes for ${esc(r.name)} yet.</p>
      ${state.admin ? `<button class="btn small primary" type="button" data-action="edit" data-id="${id}">Add notes</button>` : ''}</div>`;

    return `<article class="page">
      <header class="page-head">
        <p class="eyebrow">${esc(r.category.title)} · ${esc(r.group)}</p>
        <h1 class="page-title res-title">${esc(r.name)}</h1>
        <div class="meta-row">
          ${maturityBadge(r.maturity)}
          ${notesMeta(note)}
          <span class="spacer"></span>
          <a class="btn small" href="${esc(specUrl)}" target="_blank" rel="noopener noreferrer">Open in the R4 spec ↗</a>
        </div>
      </header>
      ${storageNotice()}
      <section class="definition" aria-labelledby="def-${esc(r.name)}">
        <h2 id="def-${esc(r.name)}">Definition</h2>
        <p>${esc(r.description)}</p>
        <span class="src">From the FHIR R4 specification.</span>
      </section>
      <section aria-label="Study notes">
        <div class="notes-head"><h2>Study notes</h2>${!editing && hasNotes ? editButton(id) : ''}</div>
        ${notesBody}
      </section>
      <footer class="topic-foot">
        <label class="studied-toggle${studied ? ' on' : ''}">
          <input type="checkbox" id="studied-${esc(id)}" data-action="studied" data-id="${esc(id)}"${studied ? ' checked' : ''}>
          <span>${studied ? 'Studied. Nice work.' : 'Mark as studied'}</span>
        </label>
        <nav class="pager" aria-label="Previous and next resource">
          ${prev ? `<a class="prev" href="#${RESOURCE_PREFIX}${esc(prev.name)}"><span class="dir">Previous</span><span class="t">${esc(prev.name)}</span></a>` : ''}
          ${next ? `<a class="next" href="#${RESOURCE_PREFIX}${esc(next.name)}"><span class="dir">Next</span><span class="t">${esc(next.name)}</span></a>` : ''}
        </nav>
      </footer>
    </article>`;
  }

  // ---------- Pages ----------
  function storageNotice() {
    if (!state.admin) return '';
    const d = state.data;
    if (d.storageError) return `<div class="notice error">${esc(d.storageError)}</div>`;
    if (d.storage === 'read-only') return '<div class="notice">No database is connected, so edits can’t be saved. Add <code>DATABASE_URL</code> in Vercel and redeploy.</div>';
    if (d.storage === 'memory') return '<div class="notice">Local preview: edits are kept in memory and are lost when the dev server stops.</div>';
    return '';
  }

  function notesMeta(note) {
    return note && note.edited && note.updatedAt
      ? `<span class="chip edited" title="These notes were edited by the admin">Updated ${esc(formatDate(note.updatedAt))}</span>`
      : '';
  }

  function editButton(id) {
    return state.admin ? `<span class="spacer"></span><button class="btn small" type="button" data-action="edit" data-id="${id}">Edit notes</button>` : '';
  }

  function renderOverview() {
    const { exam, domains, notes } = state.data;
    const note = notes[OVERVIEW];
    const ticks = [0, 10, 20, 30, 40];
    const pos = (v) => `${(v / AXIS_MAX) * 100}%`;
    const rows = domains.map((d) => {
      const done = d.topics.filter((t) => state.studied.has(t.id)).length;
      return `<a class="weight-row" href="#${d.topics[0].id}">
        <span class="weight-name">${esc(d.title)}<small>${d.topics.length} topics · ${done} studied</small></span>
        <span class="weight-track" aria-label="${range(d.weight)} of the exam">
          ${ticks.map((t) => `<span class="weight-grid" style="left:${pos(t)}"></span>`).join('')}
          <span class="weight-bar" style="left:${pos(d.weight[0])};width:${pos(d.weight[1] - d.weight[0])}"></span>
          <span class="weight-label" style="left:${pos(d.weight[1])}">${range(d.weight)}</span>
        </span>
      </a>`;
    }).join('');

    return `<article class="page">
      <header class="page-head">
        <p class="eyebrow">HL7 FHIR ${esc(exam.fhirVersion)} certification</p>
        <h1 class="page-title">${esc(exam.name)} exam</h1>
        <div class="meta-row">${notesMeta(note)}${state.editing && state.editing.id === OVERVIEW ? '' : editButton(OVERVIEW)}</div>
      </header>
      ${storageNotice()}
      <div class="stats">
        <div class="stat"><div class="v">${exam.questions}</div><div class="k">multiple-choice questions</div></div>
        <div class="stat"><div class="v">${exam.minutes / 60} h</div><div class="k">to finish the exam</div></div>
        <div class="stat"><div class="v">${exam.passPercent}%</div><div class="k">needed to pass</div></div>
        <div class="stat"><div class="v">${esc(exam.fhirVersion)}</div><div class="k">FHIR version tested</div></div>
      </div>
      <h2 class="section-title">Where the marks are</h2>
      <p class="section-sub">Share of exam questions for each competency, from HL7’s study guide.</p>
      <div class="weights">
        ${rows}
        <div class="weight-axis" aria-hidden="true"><span></span>
          <span class="ticks">${ticks.map((t) => `<span class="tick" style="left:${pos(t)}">${t}%</span>`).join('')}</span>
        </div>
      </div>
      ${state.editing && state.editing.id === OVERVIEW ? renderEditor() : `<div class="notes overview-notes">${renderMarkdown(note.markdown)}</div>`}
    </article>`;
  }

  function renderTopic(t) {
    const note = state.data.notes[t.id];
    const list = topicList();
    const i = list.findIndex((x) => x.id === t.id);
    const prev = list[i - 1];
    const next = list[i + 1];
    const studied = state.studied.has(t.id);
    const editing = state.editing && state.editing.id === t.id;

    return `<article class="page">
      <header class="page-head">
        <p class="eyebrow">${esc(t.domain.title)} · ${range(t.domain.weight)}</p>
        <h1 class="page-title">${esc(t.title)}</h1>
        <div class="meta-row">
          <span class="chip" title="Share of exam questions">${range(t.weight)} of exam</span>
          ${notesMeta(note)}
          ${editing ? '' : editButton(t.id)}
        </div>
      </header>
      ${storageNotice()}
      <section class="objectives" aria-labelledby="obj-${t.id}">
        <h2 id="obj-${t.id}">What the exam expects</h2>
        <ul>${t.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
      </section>
      ${editing ? renderEditor() : `<div class="notes">${renderMarkdown(note.markdown)}</div>`}
      <footer class="topic-foot">
        <label class="studied-toggle${studied ? ' on' : ''}">
          <input type="checkbox" id="studied-${t.id}" data-action="studied" data-id="${t.id}"${studied ? ' checked' : ''}>
          <span>${studied ? 'Studied. Nice work.' : 'Mark as studied'}</span>
        </label>
        <nav class="pager" aria-label="Previous and next topic">
          ${prev ? `<a class="prev" href="#${prev.id}"><span class="dir">Previous</span><span class="t">${esc(prev.title)}</span></a>` : ''}
          ${next ? `<a class="next" href="#${next.id}"><span class="dir">Next</span><span class="t">${esc(next.title)}</span></a>` : ''}
        </nav>
      </footer>
    </article>`;
  }

  function renderEditor() {
    const e = state.editing;
    const note = state.data.notes[e.id];
    const dirty = e.draft !== e.original;
    return `<section class="editor" data-pane="${e.pane}" aria-label="Edit notes">
      <div class="editor-bar">
        <div class="editor-tabs" role="group" aria-label="Editor view">
          <button class="btn small" type="button" data-action="pane" data-pane="write" aria-pressed="${e.pane === 'write'}">Write</button>
          <button class="btn small" type="button" data-action="pane" data-pane="preview" aria-pressed="${e.pane === 'preview'}">Preview</button>
        </div>
        <span class="spacer"></span>
        ${note.edited ? '<button class="btn small ghost danger" type="button" data-action="restore-ask">Restore original notes</button>' : ''}
        <button class="btn small" type="button" data-action="cancel">Cancel</button>
        <button class="btn small primary" type="button" data-action="save"${e.busy || !dirty ? ' disabled' : ''}>${e.busy ? 'Saving…' : 'Save notes'}</button>
      </div>
      ${e.confirmRestore ? `<div class="notice confirm">This replaces your edits with the original study notes.
          <button class="btn small danger" type="button" data-action="restore">Restore original</button>
          <button class="btn small ghost" type="button" data-action="restore-cancel">Keep my edits</button></div>` : ''}
      ${e.error ? `<div class="notice error" role="alert">${esc(e.error)}</div>` : ''}
      <div class="editor-panes">
        <div>
          <label class="visually-hidden" for="editor-text">Notes in Markdown</label>
          <textarea id="editor-text" spellcheck="true">${esc(e.draft)}</textarea>
        </div>
        <div class="preview notes" id="editor-preview" aria-live="off">${renderMarkdown(e.draft)}</div>
      </div>
      <p class="editor-help">Write in Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>- list</code>, <code>| tables |</code>, <code>\`code\`</code> and fenced code blocks. Press Ctrl+S (⌘S on Mac) to save.</p>
    </section>`;
  }

  function renderMain() {
    if (!state.data) return;
    const route = parseRoute(state.route);
    let title = 'FHIR Foundational Prep';
    if (route.section === 'resources') {
      if (route.resource) {
        els.main.innerHTML = renderResourcePage(route);
        title = `${route.resource.name} · FHIR resources`;
      } else {
        els.main.innerHTML = renderResourceIndex(route);
        title = `FHIR resources · ${route.category.title}`;
      }
    } else {
      const t = route.topic;
      els.main.innerHTML = t.id === OVERVIEW ? renderOverview() : renderTopic(t);
      if (t.id !== OVERVIEW) title = `${t.title} · FHIR Foundational Prep`;
    }
    document.title = title;
  }

  function renderHeader(route) {
    document.body.dataset.section = route.section;
    document.querySelectorAll('.section-nav a').forEach((a) => {
      if (a.dataset.section === route.section) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    renderResourceBar(route);
    measureHeader();
  }

  function render() {
    renderHeader(parseRoute(state.route));
    renderSidebar();
    renderMain();
  }

  // ---------- Routing ----------
  // #overview and #<topic-id>            study guide
  // #resources, #resources-<category>    resource index
  // #resource-<Name>                     one FHIR resource
  function parseRoute(id) {
    const cats = resourceCategories();
    if (id === 'resources' || id.startsWith(CATEGORY_PREFIX)) {
      const c = cats.find((x) => CATEGORY_PREFIX + x.id === id)
        || cats.find((x) => x.id === state.lastCategory) || cats[0];
      return { section: 'resources', key: id === 'resources' ? id : CATEGORY_PREFIX + c.id, category: c, resource: null };
    }
    if (id.startsWith(RESOURCE_PREFIX)) {
      const r = findResource(id.slice(RESOURCE_PREFIX.length));
      if (r) return { section: 'resources', key: id, category: r.category, resource: r };
    }
    const t = findTopic(id) || findTopic(OVERVIEW);
    return { section: 'guide', key: t.id, topic: t };
  }

  function routeFromHash() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    const route = parseRoute(id || OVERVIEW);
    if (route.section === 'resources') state.lastCategory = route.category.id;
    return route.key;
  }

  // Keep --header-h in sync so the sidebar and drawer sit right under the header.
  function measureHeader() {
    const h = document.getElementById('site-header').getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-h', `${Math.round(h)}px`);
  }
  window.addEventListener('resize', measureHeader);

  function isDirty() {
    return state.editing && state.editing.draft !== state.editing.original;
  }

  window.addEventListener('hashchange', () => {
    if (!state.data) return;
    const next = routeFromHash();
    if (next === state.route) return;
    if (isDirty()) {
      history.replaceState(null, '', `#${state.route}`);
      state.editing.error = 'You have unsaved changes. Save them or press Cancel before leaving this page.';
      renderMain();
      closeDrawer();
      return;
    }
    state.editing = null;
    state.route = next;
    render();
    closeDrawer();
    window.scrollTo(0, 0);
    els.main.focus({ preventScroll: true });
  });

  window.addEventListener('beforeunload', (ev) => {
    if (isDirty()) { ev.preventDefault(); ev.returnValue = ''; }
  });

  // ---------- Drawer (phones) ----------
  function openDrawer() {
    els.sidebar.classList.add('open');
    els.scrim.hidden = false;
    els.menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    els.sidebar.classList.remove('open');
    els.scrim.hidden = true;
    els.menuBtn.setAttribute('aria-expanded', 'false');
  }
  els.menuBtn.addEventListener('click', () => (els.sidebar.classList.contains('open') ? closeDrawer() : openDrawer()));
  els.scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeDrawer();
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 's' && state.editing) {
      ev.preventDefault();
      saveEdit();
    }
  });

  els.filter.addEventListener('input', () => {
    state.filter = els.filter.value;
    renderNav();
  });

  // ---------- Admin ----------
  function openLogin() {
    els.loginError.hidden = true;
    els.loginPassword.value = '';
    if (!state.adminConfigured) {
      els.loginError.textContent = 'Admin sign-in isn’t set up yet. Add ADMIN_PASSWORD in Vercel’s environment variables and redeploy.';
      els.loginError.hidden = false;
    }
    if (typeof els.dialog.showModal === 'function') els.dialog.showModal();
    else els.dialog.setAttribute('open', '');
    els.loginPassword.focus();
  }
  function closeLogin() {
    if (typeof els.dialog.close === 'function') els.dialog.close();
    else els.dialog.removeAttribute('open');
  }
  els.loginCancel.addEventListener('click', closeLogin);
  els.loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    els.loginSubmit.disabled = true;
    els.loginError.hidden = true;
    try {
      await api('/api/auth', { method: 'POST', body: JSON.stringify({ password: els.loginPassword.value }) });
      state.admin = true;
      closeLogin();
      await reload();
      toast('Signed in. Use “Edit notes” on any topic.');
    } catch (err) {
      els.loginError.textContent = err.message;
      els.loginError.hidden = false;
    } finally {
      els.loginSubmit.disabled = false;
    }
  });

  async function logout() {
    if (isDirty()) {
      state.editing.error = 'Save or cancel your edits before signing out.';
      renderMain();
      return;
    }
    try { await api('/api/auth', { method: 'DELETE' }); } catch { /* cookie may already be gone */ }
    state.admin = false;
    state.editing = null;
    render();
    toast('Signed out');
  }

  function startEdit(id) {
    const md = state.data.notes[id].markdown;
    state.editing = { id, original: md, draft: md, pane: 'write', busy: false, error: null, confirmRestore: false };
    renderMain();
    const ta = document.getElementById('editor-text');
    if (ta) ta.focus();
  }

  async function saveEdit() {
    const e = state.editing;
    if (!e || e.busy || e.draft === e.original) return;
    e.busy = true; e.error = null;
    renderMain();
    try {
      const saved = await api(`/api/topics?id=${encodeURIComponent(e.id)}`, { method: 'PUT', body: JSON.stringify({ markdown: e.draft }) });
      state.data.notes[e.id] = { markdown: saved.markdown, edited: saved.edited, updatedAt: saved.updatedAt };
      state.editing = null;
      renderMain();
      toast('Notes saved');
    } catch (err) {
      e.busy = false;
      if (err.status === 401) {
        state.admin = false;
        renderAdminBox();
        e.error = 'Your admin session has ended. Your text is still here: sign in again from the sidebar, then save.';
      } else {
        e.error = err.message;
      }
      renderMain();
    }
  }

  async function restoreOriginal() {
    const e = state.editing;
    if (!e) return;
    e.busy = true;
    try {
      const saved = await api(`/api/topics?id=${encodeURIComponent(e.id)}`, { method: 'DELETE' });
      state.data.notes[e.id] = { markdown: saved.markdown, edited: false, updatedAt: null };
      state.editing = null;
      renderMain();
      toast('Original notes restored');
    } catch (err) {
      e.busy = false; e.confirmRestore = false; e.error = err.message;
      renderMain();
    }
  }

  // ---------- Event delegation ----------
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el || el.tagName === 'INPUT') return;
    const action = el.dataset.action;
    const e = state.editing;
    if (action === 'login') openLogin();
    else if (action === 'logout') logout();
    else if (action === 'edit') startEdit(el.dataset.id);
    else if (action === 'cancel') { state.editing = null; renderMain(); }
    else if (action === 'save') saveEdit();
    else if (action === 'pane' && e) { e.pane = el.dataset.pane; renderMain(); }
    else if (action === 'restore-ask' && e) { e.confirmRestore = true; renderMain(); }
    else if (action === 'restore-cancel' && e) { e.confirmRestore = false; renderMain(); }
    else if (action === 'restore') restoreOriginal();
  });

  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (el.dataset && el.dataset.action === 'studied') {
      if (el.checked) state.studied.add(el.dataset.id); else state.studied.delete(el.dataset.id);
      saveStudied();
      renderSidebar();
      renderResourceBar(parseRoute(state.route));
      const label = el.closest('.studied-toggle');
      label.classList.toggle('on', el.checked);
      label.querySelector('span').textContent = el.checked ? 'Studied. Nice work.' : 'Mark as studied';
    }
  });

  let previewTimer;
  document.addEventListener('input', (ev) => {
    if (ev.target.id === 'resource-filter') {
      state.resourceFilter = ev.target.value;
      const box = document.getElementById('resource-results');
      if (box) box.innerHTML = renderResourceResults(parseRoute(state.route));
      return;
    }
    if (ev.target.id !== 'editor-text' || !state.editing) return;
    const e = state.editing;
    e.draft = ev.target.value;
    const saveBtn = document.querySelector('[data-action="save"]');
    if (saveBtn) saveBtn.disabled = e.busy || e.draft === e.original;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const p = document.getElementById('editor-preview');
      if (p) p.innerHTML = renderMarkdown(e.draft);
    }, 150);
  });

  // ---------- Start ----------
  async function reload() {
    const [data, auth] = await Promise.all([
      api('/api/topics'),
      api('/api/auth').catch(() => ({ admin: false, configured: false })),
    ]);
    state.data = data;
    state.resourceIndex = null;
    state.admin = Boolean(data.admin);
    state.adminConfigured = Boolean(auth.configured);
    state.route = routeFromHash();
    render();
  }

  reload().catch((err) => {
    els.main.innerHTML = `<div class="page"><div class="notice error" role="alert">
      The topics couldn’t be loaded: ${esc(err.message)} Check that the site is running on Vercel (or with <code>npm run dev</code>) so the <code>/api</code> routes are available.
    </div></div>`;
  });
})();

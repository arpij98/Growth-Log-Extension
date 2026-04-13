const CATEGORIES = [
  { id: 'ai',         label: 'AI & Code',       color: '#534AB7' },
  { id: 'finance',    label: 'Finance',          color: '#1D9E75' },
  { id: 'firstprinc', label: 'First principles', color: '#c17f3a' },
  { id: 'boundaries', label: 'Boundaries',       color: '#993556' },
  { id: 'selfcare',   label: 'Self-care',        color: '#3a7a5c' },
  { id: 'gut',        label: 'Gut trust',        color: '#185FA5' },
];

const REFLECT_PROMPTS = {
  win: [
    "What did you do differently here that worked?",
    "What does this say about who you're becoming?",
    "How would past-you have handled this?",
    "What belief did you act from that you want to keep?",
    "What made this possible today?",
  ],
  ref: [
    "What would you do differently, knowing what you know now?",
    "What was the fear or assumption underneath your reaction?",
    "Where did you defer to someone else's view when you had your own?",
    "What would it look like to trust yourself more next time?",
    "What pattern do you notice, if any?",
  ]
};

const DAILY_PROMPTS = [
  "Did you hold a boundary today?",
  "When did you trust your gut — or override it?",
  "What was one moment you were proud of yourself?",
  "Was there a moment you doubted yourself? What happened after?",
  "What shifted in how you see something today?",
  "Did you take care of yourself today?",
  "Where did your first-principles thinking show up?",
];

let selectedCat = null;
let selectedType = 'win';
let detailFromHistory = false;
let currentFilter = 'all';
let todoTab = 'open';

function getEntries() {
  try { return JSON.parse(localStorage.getItem('gl_v2') || '[]'); } catch(e) { return []; }
}
function saveEntries(arr) { localStorage.setItem('gl_v2', JSON.stringify(arr)); }
function getTodos() {
  try { return JSON.parse(localStorage.getItem('gl_todos') || '[]'); } catch(e) { return []; }
}
function saveTodos(arr) { localStorage.setItem('gl_todos', JSON.stringify(arr)); }

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function isToday(ts) { return new Date(ts).toDateString() === new Date().toDateString(); }
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function getCat(id) { return CATEGORIES.find(c => c.id === id); }

function navTo(screen) {
  if (screen === 'log') { renderCatPills(); renderRecent(); renderStats(); showScreen('screen-home'); }
  if (screen === 'todo') { renderTodos(); showScreen('screen-todo'); }
}

function wireNav() {
  [['nav-log','log'],['nav-todo','todo'],['nav-log-2','log'],['nav-todo-2','todo']].forEach(([id, screen]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => navTo(screen));
  });
}

function renderCatPills() {
  const el = document.getElementById('cat-pills');
  el.innerHTML = '';
  CATEGORIES.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-pill' + (selectedCat === c.id ? ' selected' : '');
    btn.innerHTML = `<span class="dot" style="background:${selectedCat === c.id ? '#f7f4ef' : c.color}"></span>${c.label}`;
    btn.addEventListener('click', () => { selectedCat = selectedCat === c.id ? null : c.id; renderCatPills(); });
    el.appendChild(btn);
  });
}

function setType(t) {
  selectedType = t;
  document.getElementById('btn-win').classList.toggle('active', t === 'win');
  document.getElementById('btn-ref').classList.toggle('active', t === 'ref');
}

function saveEntry() {
  const ta = document.getElementById('entry-input');
  const text = ta.value.trim();
  if (!text) return;
  const entries = getEntries();
  entries.unshift({ id: Date.now().toString(), text, type: selectedType, cat: selectedCat, ts: Date.now(), note: '' });
  saveEntries(entries);
  ta.value = '';
  showToast(selectedType === 'win' ? 'Win logged ✓' : 'Reflection saved ✓');
  renderRecent(); renderStats();
}

function buildEntryEl(e, clickTarget) {
  const cat = getCat(e.cat);
  const wrap = document.createElement('div');
  wrap.className = `entry-item type-${e.type}`;
  const meta = document.createElement('div');
  meta.className = 'entry-meta';
  meta.innerHTML = `<span class="type-dot"></span>
    ${cat ? `<span class="entry-cat-lbl" style="color:${cat.color}">${cat.label}</span>` : ''}
    <span class="entry-date-lbl">${isToday(e.ts) ? 'Today' : formatDate(e.ts)}</span>`;
  const txt = document.createElement('div');
  txt.className = 'entry-text'; txt.textContent = e.text;
  wrap.appendChild(meta); wrap.appendChild(txt);
  wrap.addEventListener('click', () => showDetail(e.id, clickTarget));
  return wrap;
}

function renderRecent() {
  const entries = getEntries().slice(0, 5);
  const el = document.getElementById('recent-list');
  el.innerHTML = '';
  if (!entries.length) { el.innerHTML = '<div class="empty-state">Nothing yet.<br>Start with one small thing from today.</div>'; return; }
  entries.forEach(e => el.appendChild(buildEntryEl(e, 'home')));
}

function renderStats() {
  const entries = getEntries();
  const wins = entries.filter(e => e.type === 'win').length;
  const refs = entries.filter(e => e.type === 'ref').length;
  const today = entries.filter(e => isToday(e.ts)).length;
  document.getElementById('stats-strip').innerHTML = `
    <div class="stat-cell"><div class="stat-num">${wins}</div><div class="stat-lbl">Wins</div></div>
    <div class="stat-div"></div>
    <div class="stat-cell"><div class="stat-num">${refs}</div><div class="stat-lbl">Reflections</div></div>
    <div class="stat-div"></div>
    <div class="stat-cell"><div class="stat-num">${today}</div><div class="stat-lbl">Today</div></div>`;
}

function showHistory() {
  currentFilter = 'all'; renderFilters(); renderHistory(); showScreen('screen-history');
}
function renderFilters() {
  const filters = [
    { id: 'all', label: 'All' }, { id: 'win', label: 'Wins' }, { id: 'ref', label: 'Reflections' },
    ...CATEGORIES.map(c => ({ id: 'cat:' + c.id, label: c.label }))
  ];
  const el = document.getElementById('filter-row');
  el.innerHTML = '';
  filters.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (currentFilter === f.id ? ' active' : '');
    btn.textContent = f.label;
    btn.addEventListener('click', () => { currentFilter = f.id; renderFilters(); renderHistory(); });
    el.appendChild(btn);
  });
}
function renderHistory() {
  let entries = getEntries();
  if (currentFilter === 'win') entries = entries.filter(e => e.type === 'win');
  else if (currentFilter === 'ref') entries = entries.filter(e => e.type === 'ref');
  else if (currentFilter.startsWith('cat:')) entries = entries.filter(e => e.cat === currentFilter.slice(4));
  const el = document.getElementById('history-list');
  el.innerHTML = '';
  if (!entries.length) { el.innerHTML = '<div class="empty-state">No entries here yet.</div>'; return; }
  entries.forEach(e => {
    const wrap = buildEntryEl(e, 'history');
    wrap.className = `history-entry type-${e.type}`;
    if (e.note) { const n = document.createElement('div'); n.className = 'has-note'; n.textContent = '+ reflection note'; wrap.appendChild(n); }
    el.appendChild(wrap);
  });
}

function showDetail(id, from) {
  detailFromHistory = from === 'history';
  const entry = getEntries().find(e => e.id === id);
  if (!entry) return;
  const cat = getCat(entry.cat);
  const prompts = REFLECT_PROMPTS[entry.type] || REFLECT_PROMPTS['ref'];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  const body = document.getElementById('detail-body');
  body.innerHTML = '';

  const catRow = document.createElement('div'); catRow.className = 'detail-cat';
  if (cat) catRow.innerHTML = `<span class="dot" style="background:${cat.color}"></span><span style="color:${cat.color}">${cat.label}</span> · `;
  const ts = document.createElement('span'); ts.style.cssText = 'text-transform:none;letter-spacing:0;';
  ts.textContent = entry.type === 'win' ? 'Win' : 'Reflection';
  catRow.appendChild(ts);

  const textEl = document.createElement('div'); textEl.className = 'detail-text'; textEl.textContent = entry.text;
  const dateEl = document.createElement('div'); dateEl.className = 'detail-date'; dateEl.textContent = formatDate(entry.ts);

  const refBox = document.createElement('div');
  refBox.className = `reflection-box ${entry.type === 'win' ? 'win-box' : 'ref-box'}`;
  refBox.innerHTML = `<div class="reflection-label">${entry.type === 'win' ? 'Reflect on this win' : 'Go deeper'}</div><div class="reflection-prompt">${prompt}</div>`;

  const noteDiv = document.createElement('div'); noteDiv.className = 'note-area';
  const noteTa = document.createElement('textarea'); noteTa.placeholder = 'Add a deeper note... (optional)'; noteTa.value = entry.note || '';
  const noteSaveBtn = document.createElement('button'); noteSaveBtn.className = 'note-save-btn'; noteSaveBtn.textContent = 'Save note';
  noteSaveBtn.addEventListener('click', () => {
    const entries = getEntries(); const idx = entries.findIndex(e => e.id === id);
    if (idx >= 0) { entries[idx].note = noteTa.value.trim(); saveEntries(entries); }
    showToast('Note saved');
  });
  noteDiv.appendChild(noteTa); noteDiv.appendChild(noteSaveBtn);

  const delBtn = document.createElement('button'); delBtn.className = 'delete-btn'; delBtn.textContent = 'Remove this entry';
  delBtn.addEventListener('click', () => {
    saveEntries(getEntries().filter(e => e.id !== id));
    showToast('Removed');
    detailFromHistory ? showHistory() : navTo('log');
  });

  [catRow, textEl, dateEl, refBox, noteDiv, delBtn].forEach(el => body.appendChild(el));
  showScreen('screen-detail');
}

function renderTodos() {
  const todos = getTodos();
  const open = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);
  const showing = todoTab === 'open' ? open : done;
  const el = document.getElementById('todo-list');
  const countEl = document.getElementById('todo-done-count');

  document.getElementById('tab-open').className = 'todo-tab' + (todoTab === 'open' ? ' active' : '');
  document.getElementById('tab-done').className = 'todo-tab' + (todoTab === 'done' ? ' active' : '');

  if (todoTab === 'done' && done.length > 0) {
    countEl.style.display = 'block';
    countEl.textContent = `${done.length} thing${done.length !== 1 ? 's' : ''} done ✓`;
  } else { countEl.style.display = 'none'; }

  el.innerHTML = '';
  if (!showing.length) {
    el.innerHTML = `<div class="todo-empty">${todoTab === 'open' ? 'Nothing here.<br>Add something above.' : 'No completed tasks yet.'}</div>`;
    return;
  }
  showing.forEach(t => {
    const item = document.createElement('div');
    item.className = 'todo-item' + (t.done ? ' done' : '');
    const check = document.createElement('div');
    check.className = 'todo-check';
    if (t.done) check.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round"><path d="M2 5l2.5 2.5L8 3"/></svg>`;
    check.addEventListener('click', () => {
      const todos = getTodos(); const idx = todos.findIndex(x => x.id === t.id);
      if (idx >= 0) { todos[idx].done = !todos[idx].done; saveTodos(todos); if (todos[idx].done) showToast('Done ✓'); }
      renderTodos();
    });
    const label = document.createElement('div'); label.className = 'todo-label'; label.textContent = t.text;
    const del = document.createElement('button'); del.className = 'todo-del'; del.textContent = '×'; del.title = 'Remove';
    del.addEventListener('click', () => { saveTodos(getTodos().filter(x => x.id !== t.id)); renderTodos(); });
    item.appendChild(check); item.appendChild(label); item.appendChild(del);
    el.appendChild(item);
  });
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  const todos = getTodos();
  todos.unshift({ id: Date.now().toString(), text, done: false, ts: Date.now() });
  saveTodos(todos); input.value = ''; todoTab = 'open'; renderTodos();
}

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const h = now.getHours();
  const greet = h < 12 ? 'Good morning.' : h < 17 ? 'Afternoon.' : 'Evening.';
  const sub = h < 12 ? '<em>What intention will guide today?</em>' : h < 17 ? '<em>How\'s the day going?</em>' : '<em>How did today go?</em>';
  document.getElementById('greeting-text').innerHTML = `${greet}<br>${sub}`;
  document.getElementById('header-date').textContent = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  document.getElementById('daily-prompt').textContent = DAILY_PROMPTS[now.getDate() % DAILY_PROMPTS.length];

  wireNav();
  document.getElementById('btn-win').addEventListener('click', () => setType('win'));
  document.getElementById('btn-ref').addEventListener('click', () => setType('ref'));
  document.getElementById('btn-save').addEventListener('click', saveEntry);
  document.getElementById('btn-see-all').addEventListener('click', showHistory);
  document.getElementById('entry-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEntry(); }
  });
  document.getElementById('btn-history-back').addEventListener('click', () => navTo('log'));
  document.getElementById('btn-detail-back').addEventListener('click', () => {
    detailFromHistory ? showHistory() : navTo('log');
  });
  document.getElementById('todo-add-btn').addEventListener('click', addTodo);
  document.getElementById('todo-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(); });
  document.getElementById('tab-open').addEventListener('click', () => { todoTab = 'open'; renderTodos(); });
  document.getElementById('tab-done').addEventListener('click', () => { todoTab = 'done'; renderTodos(); });

  renderCatPills(); renderRecent(); renderStats();
});

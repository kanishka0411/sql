// ============ THEME ============
const themeBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('sql-theme');
if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  if (cur === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('sql-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('sql-theme', 'dark');
  }
});

// ============ TOC + PROGRESS ============
const lessons = [...document.querySelectorAll('.lesson')];
const tocEl = document.getElementById('toc');
const progressFill = document.getElementById('progress-fill');
const progressCount = document.getElementById('progress-count');

lessons.forEach((l, i) => {
  const a = document.createElement('a');
  a.href = '#' + l.id;
  a.dataset.lesson = l.id;
  a.innerHTML = `<span class="toc-num">${i + 1}</span><span>${l.dataset.title}</span>`;
  tocEl.appendChild(a);
});

const tocLinks = [...tocEl.querySelectorAll('a')];

const doneSet = new Set(JSON.parse(localStorage.getItem('sql-done') || '[]'));
function persistDone() { localStorage.setItem('sql-done', JSON.stringify([...doneSet])); }

function animateCount(el, from, to, dur = 500) {
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(from + (to - from) * eased);
    el.textContent = `${val} / ${lessons.length}`;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

let lastCount = 0;
function updateProgress() {
  document.querySelectorAll('.lesson-done').forEach(cb => {
    cb.checked = doneSet.has(cb.dataset.lesson);
  });
  tocLinks.forEach(l => l.classList.toggle('done', doneSet.has(l.dataset.lesson)));
  const total = lessons.length;
  const done = doneSet.size;
  animateCount(progressCount, lastCount, done);
  lastCount = done;
  progressFill.style.width = `${(done / total) * 100}%`;
}

document.querySelectorAll('.lesson-done').forEach(cb => {
  cb.addEventListener('change', (e) => {
    if (cb.checked) {
      doneSet.add(cb.dataset.lesson);
      const rect = cb.getBoundingClientRect();
      confetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    } else {
      doneSet.delete(cb.dataset.lesson);
    }
    persistDone();
    updateProgress();
  });
});

document.getElementById('reset-progress').addEventListener('click', () => {
  doneSet.clear();
  persistDone();
  updateProgress();
});

updateProgress();

// ============ MODULE PAGER (one module open at a time) ============
function showModule(id, instant) {
  lessons.forEach(l => { l.style.display = (l.id === id) ? '' : 'none'; });
  tocLinks.forEach(l => l.classList.toggle('active', l.dataset.lesson === id));
  if (instant) {
    document.querySelectorAll('#' + id + ' .reveal').forEach(el => el.classList.add('in'));
  }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

tocLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showModule(link.dataset.lesson, true);
  });
});

// show the first module on load (let the reveal observer animate it in)
showModule(lessons[0].id, false);

// ============ REVEAL ON SCROLL ============
document.querySelectorAll('.lesson-head, .sub-head, .card, .lesson-foot').forEach(el => el.classList.add('reveal'));

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ============ BUTTON RIPPLE ============
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--ripple-x', `${e.clientX - r.left}px`);
    btn.style.setProperty('--ripple-y', `${e.clientY - r.top}px`);
  });
});

// ============ CONFETTI ============
function confetti(x, y) {
  const colors = ['#c96442', '#1d9e75', '#378add', '#ba7517', '#7f77dd', '#e8845f'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = colors[i % colors.length];
    const angle = (Math.random() * Math.PI) - Math.PI / 2 + (Math.random() - 0.5) * 0.4;
    const v = Math.random() * 140 + 60;
    p.style.setProperty('--dx', `${Math.cos(angle) * v}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * v + 80}px`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}

// ============ LESSON 1: scale slider ============
const scl = document.getElementById('scl');
const exSt = document.getElementById('ex-st');
const exDt = document.getElementById('ex-dt');
const dbSt = document.getElementById('db-st');
const dbDt = document.getElementById('db-dt');
const scaleData = [
  { ex: ['Fine', 'Manageable in one sheet.', 'var(--success)'], db: ['Trivial', 'Returns in microseconds.', 'var(--success)'] },
  { ex: ['Fine', 'Still snappy. Filters work.', 'var(--success)'], db: ['Trivial', 'Returns in microseconds.', 'var(--success)'] },
  { ex: ['Slow', 'Filters lag, formulas drag.', 'var(--warning)'], db: ['Fast', 'Indexed lookup in ms.', 'var(--success)'] },
  { ex: ['Painful', 'Long opens. Frequent freezes.', 'var(--warning)'], db: ['Fast', 'Still ms-level with an index.', 'var(--success)'] },
  { ex: ['Breaking', 'Crashes are routine now.', 'var(--danger)'], db: ['Healthy', 'Right index = sub-second.', 'var(--success)'] },
  { ex: ['Dead', "Won't open. Hits row limit.", 'var(--danger)'], db: ['Tune it', 'Plan query, pick index.', 'var(--warning)'] },
  { ex: ['Impossible', 'Not the right tool. At all.', 'var(--danger)'], db: ['Healthy', 'Partition + index = sub-second.', 'var(--success)'] }
];
let lastEx = '', lastDb = '';
function paintScale() {
  const d = scaleData[+scl.value];
  exSt.textContent = d.ex[0];
  exDt.textContent = d.ex[1];
  exSt.style.color = d.ex[2];
  dbSt.textContent = d.db[0];
  dbDt.textContent = d.db[1];
  dbSt.style.color = d.db[2];
  if (d.ex[0] !== lastEx) { exSt.classList.remove('bump'); void exSt.offsetWidth; exSt.classList.add('bump'); lastEx = d.ex[0]; }
  if (d.db[0] !== lastDb) { dbSt.classList.remove('bump'); void dbSt.offsetWidth; dbSt.classList.add('bump'); lastDb = d.db[0]; }
}
scl.addEventListener('input', paintScale);
paintScale();

// ============ LESSON 3: anatomy hover ============
const anatomyOut = document.getElementById('anatomy-out');
document.querySelectorAll('[data-explain]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    const kind = el.dataset.explain;
    anatomyOut.classList.add('live');
    if (kind === 'column') {
      el.classList.add('hl');
      anatomyOut.innerHTML = `<strong>Column (a.k.a. field)</strong> — "${el.textContent}" is one property tracked for every customer.`;
    } else if (kind === 'row') {
      el.classList.add('hl');
      const name = el.cells[1].textContent;
      anatomyOut.innerHTML = `<strong>Row (a.k.a. record)</strong> — one full entry. This row holds everything we know about ${name}.`;
    }
  });
  el.addEventListener('mouseleave', () => {
    el.classList.remove('hl');
    anatomyOut.classList.remove('live');
    anatomyOut.textContent = 'Hover a header or a row.';
  });
});

// ============ LESSON 4: QUERY BUILDER GAME ============
const students = [
  { id: 1, name: 'Aisha Khan', city: 'Mumbai', is_active: 1, fees_paid: 1 },
  { id: 2, name: 'Raj Patel', city: 'Pune', is_active: 0, fees_paid: 1 },
  { id: 3, name: 'Meera Joshi', city: 'Mumbai', is_active: 1, fees_paid: 0 },
  { id: 4, name: 'Vikram Rao', city: 'Delhi', is_active: 1, fees_paid: 1 },
  { id: 5, name: 'Sara Iyer', city: 'Mumbai', is_active: 0, fees_paid: 0 },
  { id: 6, name: 'Arjun Das', city: 'Pune', is_active: 1, fees_paid: 1 }
];

const puzzles = [
  {
    goal: 'Get every student in the table.',
    teach: 'SELECT * means "all columns". FROM names the table you read from.',
    line: [
      { type: 'fixed', val: 'SELECT' },
      { type: 'empty', val: '*' },
      { type: 'fixed', val: 'FROM' },
      { type: 'empty', val: 'students' }
    ],
    chips: ['*', 'students', 'WHERE', 'is_active'],
    run: ss => ss
  },
  {
    goal: 'Get only the students where is_active = 1.',
    teach: 'WHERE filters rows. Only rows matching the condition come back.',
    line: [
      { type: 'fixed', val: 'SELECT' },
      { type: 'empty', val: '*' },
      { type: 'fixed', val: 'FROM' },
      { type: 'empty', val: 'students' },
      { type: 'fixed', val: 'WHERE' },
      { type: 'empty', val: 'is_active' },
      { type: 'empty', val: '=' },
      { type: 'empty', val: '1' }
    ],
    chips: ['*', 'students', 'is_active', '=', '1', 'fees_paid', '0', 'city'],
    run: ss => ss.filter(s => s.is_active)
  },
  {
    goal: "Get only the students from Mumbai.",
    teach: "Strings need single quotes. 'Mumbai' is a string. 1 is a number — different rules.",
    line: [
      { type: 'fixed', val: 'SELECT' },
      { type: 'empty', val: '*' },
      { type: 'fixed', val: 'FROM' },
      { type: 'empty', val: 'students' },
      { type: 'fixed', val: 'WHERE' },
      { type: 'empty', val: 'city' },
      { type: 'empty', val: '=' },
      { type: 'empty', val: "'Mumbai'" }
    ],
    chips: ['*', 'students', 'city', '=', "'Mumbai'", "'Pune'", 'name', 'is_active'],
    run: ss => ss.filter(s => s.city === 'Mumbai')
  },
  {
    goal: 'Get students from Mumbai who have also paid their fees.',
    teach: 'AND chains two conditions. BOTH must be true. OR would mean either one.',
    line: [
      { type: 'fixed', val: 'SELECT' },
      { type: 'empty', val: '*' },
      { type: 'fixed', val: 'FROM' },
      { type: 'empty', val: 'students' },
      { type: 'fixed', val: 'WHERE' },
      { type: 'empty', val: 'city' },
      { type: 'empty', val: '=' },
      { type: 'empty', val: "'Mumbai'" },
      { type: 'fixed', val: 'AND' },
      { type: 'empty', val: 'fees_paid' },
      { type: 'empty', val: '=' },
      { type: 'empty', val: '1' }
    ],
    chips: ['*', 'students', 'city', '=', '=', "'Mumbai'", 'fees_paid', '1', '0', 'OR', 'name'],
    run: ss => ss.filter(s => s.city === 'Mumbai' && s.fees_paid)
  },
  {
    goal: 'Get only the names of students who paid (not the whole row).',
    teach: 'Instead of * (all columns), name specific columns. Faster, less data over the wire.',
    line: [
      { type: 'fixed', val: 'SELECT' },
      { type: 'empty', val: 'name' },
      { type: 'fixed', val: 'FROM' },
      { type: 'empty', val: 'students' },
      { type: 'fixed', val: 'WHERE' },
      { type: 'empty', val: 'fees_paid' },
      { type: 'empty', val: '=' },
      { type: 'empty', val: '1' }
    ],
    chips: ['name', '*', 'students', 'fees_paid', '=', '1', '0', 'id', 'city', 'is_active'],
    run: ss => ss.filter(s => s.fees_paid).map(s => ({ name: s.name })),
    columns: ['name']
  }
];

let pIdx = 0, pScore = 0;
const qlineEl = document.getElementById('qline');
const paletteEl = document.getElementById('palette');
const pnEl = document.getElementById('pn');
const pscoreEl = document.getElementById('pscore');
const goalTextEl = document.getElementById('goal-text');
const runBtn = document.getElementById('run-q');
const resetBtn = document.getElementById('reset-q');
const hintBtn = document.getElementById('hint-q');
const nextBtn = document.getElementById('next-q');
const hintBox = document.getElementById('hint-box');
const presultEl = document.getElementById('puzzle-result');

const KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT'];
const OPERATORS = ['=', '!=', '<', '>', '<=', '>='];
const COLUMNS = ['id', 'name', 'city', 'is_active', 'fees_paid'];

function chipType(val) {
  if (KEYWORDS.includes(val)) return 'keyword';
  if (OPERATORS.includes(val)) return 'operator';
  if (COLUMNS.includes(val)) return 'column';
  return 'value';
}

function bumpScore(delta) {
  pScore = Math.max(0, pScore + delta);
  pscoreEl.textContent = pScore;
  pscoreEl.classList.remove('bump');
  void pscoreEl.offsetWidth;
  pscoreEl.classList.add('bump');
}

function renderPuzzle() {
  const p = puzzles[pIdx];
  pnEl.textContent = pIdx + 1;
  goalTextEl.textContent = p.goal;
  hintBox.classList.remove('show');
  hintBox.textContent = '';
  presultEl.innerHTML = '';
  nextBtn.style.display = 'none';
  runBtn.disabled = true;

  qlineEl.innerHTML = '';
  p.line.forEach(tok => {
    const slot = document.createElement('span');
    slot.className = 'slot ' + tok.type;
    slot.dataset.expect = tok.val;
    slot.textContent = tok.type === 'fixed' ? tok.val : '?';
    qlineEl.appendChild(slot);
  });

  paletteEl.innerHTML = '';
  const shuffled = [...p.chips].sort(() => Math.random() - 0.5);
  shuffled.forEach(val => {
    const chip = document.createElement('span');
    chip.className = 'chip ' + chipType(val);
    chip.dataset.value = val;
    chip.textContent = val;
    paletteEl.appendChild(chip);
    makeDraggable(chip);
  });
}

function makeDraggable(chip) {
  let dragging = false, startX, startY;

  chip.addEventListener('pointerdown', e => {
    if (chip.classList.contains('locked')) return;
    e.preventDefault();
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    chip.classList.add('dragging');
    chip.style.transition = 'none';
    try { chip.setPointerCapture(e.pointerId); } catch (_) {}
  });

  chip.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    chip.style.transform = `translate(${dx}px, ${dy}px) scale(1.08)`;

    document.querySelectorAll('#qline .slot.empty').forEach(s => {
      const r = s.getBoundingClientRect();
      const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      s.classList.toggle('hover', over);
    });
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    chip.classList.remove('dragging');

    const targetSlot = [...document.querySelectorAll('#qline .slot.empty')].find(s => {
      const r = s.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });

    document.querySelectorAll('#qline .slot.hover').forEach(s => s.classList.remove('hover'));

    if (targetSlot && targetSlot.dataset.expect === chip.dataset.value) {
      chip.style.transition = '';
      chip.style.transform = '';
      targetSlot.classList.remove('empty');
      targetSlot.classList.add('filled');
      targetSlot.textContent = '';
      targetSlot.appendChild(chip);
      chip.classList.add('locked', 'snap');
      bumpScore(10);
      setTimeout(() => chip.classList.remove('snap'), 450);
      checkComplete();
    } else {
      chip.classList.add('reject');
      chip.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      chip.style.transform = '';
      if (pScore > 0) bumpScore(-2);
      setTimeout(() => {
        chip.classList.remove('reject');
        chip.style.transition = '';
      }, 420);
    }
  }

  chip.addEventListener('pointerup', endDrag);
  chip.addEventListener('pointercancel', endDrag);
}

function checkComplete() {
  const empties = document.querySelectorAll('#qline .slot.empty').length;
  runBtn.disabled = empties > 0;
  if (empties === 0) {
    runBtn.classList.add('snap');
    setTimeout(() => runBtn.classList.remove('snap'), 450);
  }
}

function renderPuzzleResult(rows, cols) {
  if (!rows.length) return '<div class="muted" style="padding:10px 0;">0 rows.</div>';
  const columns = cols || Object.keys(rows[0]);
  let h = '<table class="rt"><thead><tr>';
  columns.forEach(c => h += `<th>${c}</th>`);
  h += '</tr></thead><tbody>';
  rows.forEach((r, i) => {
    h += `<tr style="opacity:0; animation: fadeInUp 0.4s cubic-bezier(0.4,0,0.2,1) ${i * 70}ms forwards;">`;
    columns.forEach(c => h += `<td>${r[c]}</td>`);
    h += '</tr>';
  });
  h += `</tbody></table><div class="rt-count">${rows.length} row${rows.length === 1 ? '' : 's'} returned.</div>`;
  return h;
}

runBtn.addEventListener('click', () => {
  if (runBtn.disabled) return;
  runBtn.disabled = true;
  const slots = [...qlineEl.querySelectorAll('.slot')];
  slots.forEach((s, i) => {
    setTimeout(() => {
      s.style.transform = 'translateY(-3px)';
      s.style.color = 'var(--success)';
      setTimeout(() => { s.style.transform = ''; }, 250);
    }, i * 70);
  });

  setTimeout(() => {
    const p = puzzles[pIdx];
    const rows = p.run(students);
    presultEl.innerHTML = renderPuzzleResult(rows, p.columns);
    bumpScore(50);

    const r = presultEl.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + 30);

    if (pIdx < puzzles.length - 1) {
      nextBtn.style.display = '';
    } else {
      const trophy = document.createElement('div');
      trophy.className = 'puzzle-win';
      trophy.innerHTML = `<div class="puzzle-win-emoji">🏆</div>
                          <div class="puzzle-win-title">All puzzles cleared</div>
                          <div class="puzzle-win-stat">Final score: <strong>${pScore}</strong></div>`;
      presultEl.appendChild(trophy);
      setTimeout(() => {
        const r2 = trophy.getBoundingClientRect();
        confetti(r2.left + r2.width * 0.3, r2.top + 40);
        confetti(r2.left + r2.width * 0.7, r2.top + 40);
      }, 300);
    }
  }, slots.length * 70 + 200);
});

resetBtn.addEventListener('click', () => {
  if (pScore > 0) bumpScore(-5);
  renderPuzzle();
});

hintBtn.addEventListener('click', () => {
  hintBox.textContent = '💡 ' + puzzles[pIdx].teach;
  hintBox.classList.add('show');
  if (pScore > 0) bumpScore(-3);
});

nextBtn.addEventListener('click', () => {
  pIdx++;
  renderPuzzle();
});

renderPuzzle();

// ============ LESSON 5: transaction ============
const dots = [document.getElementById('td1'), document.getElementById('td2'), document.getElementById('td3')];
const tstat = document.getElementById('tstat');
let txnRunning = false;
function setDot(i, cls) {
  dots[i].classList.remove('done', 'fail', 'run');
  if (cls) dots[i].classList.add(cls);
}
function resetTxn() {
  dots.forEach((_, i) => setDot(i, null));
  tstat.textContent = 'Idle. Wallet ₹10,000, status: Not paid.';
  tstat.style.borderLeftColor = 'var(--border-strong)';
}
async function runTxn(crash) {
  if (txnRunning) return;
  txnRunning = true;
  resetTxn();
  tstat.textContent = 'BEGIN TRANSACTION…';
  tstat.style.borderLeftColor = 'var(--info)';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  setDot(0, 'run'); await sleep(550);
  setDot(0, 'done'); tstat.textContent = 'Step 1: wallet ₹10,000 → ₹5,000.';
  await sleep(650);
  setDot(1, 'run'); await sleep(550);
  if (crash) {
    setDot(1, 'fail');
    tstat.innerHTML = '<span class="bad">CRASH mid-step 2.</span> Recovery reads the log…';
    tstat.style.borderLeftColor = 'var(--danger)';
    await sleep(950);
    setDot(0, null); setDot(1, null);
    tstat.innerHTML = '<span class="warn">ROLLBACK.</span> Wallet back to ₹10,000. No half-state visible.';
    tstat.style.borderLeftColor = 'var(--warning)';
    txnRunning = false;
    return;
  }
  setDot(1, 'done'); tstat.textContent = 'Step 2: payment row inserted.';
  await sleep(650);
  setDot(2, 'run'); await sleep(550);
  setDot(2, 'done');
  tstat.innerHTML = '<span class="ok">COMMIT.</span> Wallet ₹5,000, status: Fees paid. Survives any crash from here.';
  tstat.style.borderLeftColor = 'var(--success)';
  const r = tstat.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + 20);
  txnRunning = false;
}
document.getElementById('btn-pay').addEventListener('click', () => runTxn(false));
document.getElementById('btn-crash').addEventListener('click', () => runTxn(true));
document.getElementById('btn-reset').addEventListener('click', resetTxn);

// ============ LESSON 6: ACID ============
const acidExplain = {
  A: `<strong>Atomicity</strong> — A transaction is one unit. Either every step lands, or none do. You saw this in the pay-fees demo: when step 2 crashed, step 1 was undone automatically. The system never sits in "money gone, fees not paid".`,
  C: `<strong>Consistency</strong> — Every committed transaction respects the rules. Balance ≥ 0. Email unique. Marks 0–100. A transaction that would break a rule is rejected before commit. Bad data never becomes permanent.`,
  I: `<strong>Isolation</strong> — Many users work at once, but each transaction acts as if it's alone. Two people clicking "book last seat" simultaneously? Only one wins. The other gets a clean failure, not a corrupted half-state. Done with locks or MVCC.`,
  D: `<strong>Durability</strong> — Once the database says COMMIT, that change survives crashes, power loss, restarts. The write-ahead log on disk makes recovery possible — even if the server dies one second after COMMIT.`
};
const acidDetailEl = document.getElementById('acid-detail');
document.querySelectorAll('.acid-card').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('.acid-card').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    acidDetailEl.innerHTML = acidExplain[c.dataset.acid];
    acidDetailEl.classList.remove('fresh');
    void acidDetailEl.offsetWidth;
    acidDetailEl.classList.add('fresh');
  });
});

// ============ LESSON: DB INTERNALS — find Aisha game ============
const TARGET_ROW = 37;
const TOTAL_ROWS = 50;
const sgEl = document.getElementById('search-grid');
const stepCountEl = document.getElementById('step-count');
const timeCountEl = document.getElementById('time-count');
const stratNameEl = document.getElementById('strategy-name');
const searchResultEl = document.getElementById('search-result');
const runScanBtn = document.getElementById('run-scan');
const runIndexBtn = document.getElementById('run-index');
const resetSearchBtn = document.getElementById('reset-search');
let searchRunning = false;

function buildSearchGrid() {
  sgEl.innerHTML = '';
  for (let i = 1; i <= TOTAL_ROWS; i++) {
    const c = document.createElement('div');
    c.className = 'sg-cell';
    c.dataset.row = i;
    c.textContent = i;
    sgEl.appendChild(c);
  }
}

function resetSearchGrid() {
  sgEl.querySelectorAll('.sg-cell').forEach(c => c.className = 'sg-cell');
  stepCountEl.textContent = '0';
  timeCountEl.textContent = '0ms';
  stratNameEl.textContent = '—';
  searchResultEl.textContent = '';
  searchResultEl.classList.remove('win');
}

async function runFullScan() {
  if (searchRunning) return;
  searchRunning = true;
  resetSearchGrid();
  stratNameEl.textContent = 'Full scan';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let steps = 0;
  for (let i = 1; i <= TARGET_ROW; i++) {
    steps++;
    const cell = sgEl.querySelector(`[data-row="${i}"]`);
    cell.classList.add('scan');
    stepCountEl.textContent = steps;
    timeCountEl.textContent = `${steps}ms`;
    await sleep(55);
    if (i === TARGET_ROW) {
      cell.classList.remove('scan');
      cell.classList.add('target');
    }
  }
  searchResultEl.innerHTML = `Found <strong>Aisha Khan</strong> at row ${TARGET_ROW} in <strong>${TARGET_ROW} steps</strong>. Full scan walks every row until it hits the target. Painful at scale — imagine this with 10 million rows.`;
  searchResultEl.classList.add('win');
  searchRunning = false;
}

async function runBTreeSearch() {
  if (searchRunning) return;
  searchRunning = true;
  resetSearchGrid();
  stratNameEl.textContent = 'B-tree index';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const hops = [13, 31];
  let steps = 0;
  for (let i = 0; i < hops.length; i++) {
    steps++;
    const cell = sgEl.querySelector(`[data-row="${hops[i]}"]`);
    cell.classList.add('btree-hop');
    stepCountEl.textContent = steps;
    timeCountEl.textContent = `${steps}ms`;
    await sleep(450);
  }
  steps++;
  stepCountEl.textContent = steps;
  timeCountEl.textContent = `${steps}ms`;
  sgEl.querySelectorAll('.btree-hop').forEach(c => c.classList.remove('btree-hop'));
  const targetCell = sgEl.querySelector(`[data-row="${TARGET_ROW}"]`);
  targetCell.classList.add('target');
  await sleep(300);
  searchResultEl.innerHTML = `Found <strong>Aisha Khan</strong> in just <strong>3 hops</strong>. B-tree jumps to the right page using its index — no walking. This is why one query with an index can be 10,000× faster than the same query without one.`;
  searchResultEl.classList.add('win');
  const r = searchResultEl.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + 20);
  searchRunning = false;
}

if (sgEl) {
  buildSearchGrid();
  runScanBtn.addEventListener('click', runFullScan);
  runIndexBtn.addEventListener('click', runBTreeSearch);
  resetSearchBtn.addEventListener('click', resetSearchGrid);
}

// ============ LESSON: RELATIONAL vs NoSQL — use case picker ============
const useCases = [
  { q: 'Banking transaction system', correct: 'relational', why: 'Money cannot be wrong, ever. ACID + strict relationships are non-negotiable.' },
  { q: 'Social media news feed', correct: 'nosql', why: 'Massive scale, eventual consistency is fine, schema-less posts. Documents fit perfectly.' },
  { q: 'User session cache (login tokens)', correct: 'nosql', why: 'Key-value pairs, microsecond lookup, no relationships. Redis was built for exactly this.' },
  { q: 'Hospital patient records', correct: 'relational', why: 'Strict integrity. Patient ID must always link correctly to prescriptions, doctors, bills.' },
  { q: 'Real-time chat messages', correct: 'nosql', why: 'High volume, flexible schema (text, image, video), scale matters more than perfect ACID.' },
  { q: 'College fees + grades + courses', correct: 'relational', why: 'Students relate to fees relate to courses. Joins are exactly what relational does best.' }
];

const ucEl = document.getElementById('use-cases');
const ucScoreEl = document.getElementById('uc-score');
let ucAnswered = 0, ucCorrect = 0;

if (ucEl) {
  useCases.forEach((uc, i) => {
    const card = document.createElement('div');
    card.className = 'uc-card';
    card.innerHTML = `<div class="uc-q">${i + 1}. ${uc.q}</div>
      <div class="uc-options">
        <button class="uc-opt" data-uc="${i}" data-pick="relational">Relational</button>
        <button class="uc-opt" data-uc="${i}" data-pick="nosql">NoSQL</button>
      </div>
      <div class="uc-why" id="uc-why-${i}"></div>`;
    ucEl.appendChild(card);
  });

  ucEl.addEventListener('click', e => {
    const b = e.target.closest('.uc-opt');
    if (!b || b.disabled) return;
    const i = +b.dataset.uc;
    const pick = b.dataset.pick;
    const right = useCases[i].correct;
    const siblings = ucEl.querySelectorAll(`.uc-opt[data-uc="${i}"]`);
    if ([...siblings].some(s => s.disabled)) return;
    siblings.forEach(s => s.disabled = true);
    const correctBtn = ucEl.querySelector(`.uc-opt[data-uc="${i}"][data-pick="${right}"]`);
    correctBtn.classList.add('correct');
    if (pick !== right) b.classList.add('wrong');
    else ucCorrect++;
    ucAnswered++;
    const whyEl = document.getElementById(`uc-why-${i}`);
    whyEl.textContent = useCases[i].why;
    whyEl.classList.add('show');
    if (ucAnswered === useCases.length) {
      ucScoreEl.textContent = `Final: ${ucCorrect} / ${useCases.length}${ucCorrect >= 5 ? ' — nailed it' : ''}`;
      if (ucCorrect >= 5) {
        const r = ucScoreEl.getBoundingClientRect();
        confetti(r.left + r.width / 2, r.top + 20);
      }
    } else {
      ucScoreEl.textContent = `${ucCorrect} / ${ucAnswered} correct so far`;
    }
  });
}

// ============ LESSON: DBMS vs RDBMS — hierarchy ============
const hierExplain = {
  dbms: `<strong>DBMS</strong> — the software engine that sits between your app and the raw data on disk. It decides how data is physically stored, handles security, manages multiple users at once, and recovers data after a crash. Without a DBMS, you'd be reading raw files yourself and any crash would corrupt everything.`,
  rdbms: `<strong>RDBMS</strong> — the relational kind of DBMS. Tables with fixed schemas. Primary keys. Foreign keys. Joins. SQL as the query language. Full ACID guarantees. Examples: Postgres, MySQL, Oracle, SQL Server. This is what most "databases" you've heard of are.`,
  doc: `<strong>Document DBMS</strong> — NoSQL engine that stores JSON-like objects. No fixed schema — each "document" can have different fields. MongoDB is the famous one. Great for content (posts, products) where fields vary by item.`,
  kv: `<strong>Key-Value DBMS</strong> — NoSQL engine optimized for one thing: given a key, return the value. Insanely fast (microseconds). Used for caches, session tokens, rate limiters. Redis and Memcached are the classics.`,
  graph: `<strong>Graph DBMS</strong> — NoSQL engine that stores nodes (entities) and edges (relationships). Built for questions like "friends of friends" or "shortest path between two nodes". Neo4j is the famous one. Used in recommendations and social networks.`
};

const hierDetailEl = document.getElementById('hier-detail');
document.querySelectorAll('.hier-node').forEach(n => {
  n.addEventListener('click', () => {
    document.querySelectorAll('.hier-node').forEach(x => x.classList.remove('active'));
    n.classList.add('active');
    hierDetailEl.innerHTML = hierExplain[n.dataset.key];
    hierDetailEl.classList.remove('fresh');
    void hierDetailEl.offsetWidth;
    hierDetailEl.classList.add('fresh');
  });
});

// ============ LESSON: WHERE TO RUN — latency demo ============
const sendOnlineBtn = document.getElementById('send-online');
const sendLocalBtn = document.getElementById('send-local');
const resetLatBtn = document.getElementById('reset-latency');
const packetOnline = document.getElementById('packet-online');
const packetLocal = document.getElementById('packet-local');
const timeOnline = document.getElementById('time-online');
const timeLocal = document.getElementById('time-local');

function animateTime(el, target, dur) {
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / dur);
    const val = (target * t);
    el.textContent = target >= 1 ? `${Math.round(val)}ms` : `${val.toFixed(1)}ms`;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target >= 1 ? `${target}ms` : `${target}ms`;
  }
  requestAnimationFrame(step);
}

if (sendOnlineBtn) {
  sendOnlineBtn.addEventListener('click', () => {
    packetOnline.classList.remove('travel-online');
    void packetOnline.offsetWidth;
    packetOnline.classList.add('travel-online');
    const ms = 150 + Math.floor(Math.random() * 90);
    timeOnline.textContent = '…';
    timeOnline.style.color = 'var(--info)';
    setTimeout(() => animateTime(timeOnline, ms, 400), 1600);
  });

  sendLocalBtn.addEventListener('click', () => {
    packetLocal.classList.remove('travel-local');
    void packetLocal.offsetWidth;
    packetLocal.classList.add('travel-local');
    timeLocal.style.color = 'var(--success)';
    setTimeout(() => animateTime(timeLocal, 0.3, 200), 180);
  });

  resetLatBtn.addEventListener('click', () => {
    packetOnline.classList.remove('travel-online');
    packetLocal.classList.remove('travel-local');
    timeOnline.textContent = '—';
    timeLocal.textContent = '—';
    timeOnline.style.color = '';
    timeLocal.style.color = '';
  });
}

// ============ LESSON: DOCKER — image vs container ============
const ivExplain = {
  image: `<strong>Image</strong> — a pre-made, read-only blueprint. It packages the MySQL software, all its dependencies, and default settings into one bundle. You don't install MySQL manually — you just <em>pull</em> the image. One image, identical for everyone, on any OS.`,
  container: `<strong>Container</strong> — a running instance of an image. When you run the MySQL image, Docker spins up a container and starts MySQL inside it — like a tiny isolated mini-computer. You can have many containers from one image. Image = template, container = the live thing.`
};
const ivDetailEl = document.getElementById('iv-detail');
document.querySelectorAll('.iv-card').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('.iv-card').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    ivDetailEl.innerHTML = ivExplain[c.dataset.iv];
    ivDetailEl.classList.remove('fresh');
    void ivDetailEl.offsetWidth;
    ivDetailEl.classList.add('fresh');
  });
});

// ============ LESSON: DOCKER — config form ============
const dfStartBtn = document.getElementById('df-start');
const dfResetBtn = document.getElementById('df-reset');
const dfResult = document.getElementById('df-result');

if (dfStartBtn) {
  const fields = {
    name: document.getElementById('df-name'),
    port: document.getElementById('df-port'),
    rootpw: document.getElementById('df-rootpw'),
    db: document.getElementById('df-db'),
    user: document.getElementById('df-user'),
    userpw: document.getElementById('df-userpw')
  };

  dfStartBtn.addEventListener('click', () => {
    Object.values(fields).forEach(f => f.classList.remove('field-err'));
    const missing = [];
    if (!fields.name.value.trim()) { missing.push('container name'); fields.name.classList.add('field-err'); }
    if (!fields.rootpw.value.trim()) { missing.push('MYSQL_ROOT_PASSWORD'); fields.rootpw.classList.add('field-err'); }
    if (!fields.db.value.trim()) { missing.push('MYSQL_DATABASE'); fields.db.classList.add('field-err'); }

    if (missing.length) {
      dfResult.className = 'df-result warn';
      dfResult.innerHTML = `⚠️ Container won't start cleanly. Missing required: <strong>${missing.join(', ')}</strong>. Root password and a default database are the bare minimum.`;
      return;
    }

    const port = fields.port.value.trim() || '3306';
    const name = fields.name.value.trim();
    const cmd = `docker run --name ${name} \\
  -p ${port}:3306 \\
  -e MYSQL_ROOT_PASSWORD=${fields.rootpw.value.trim()} \\
  -e MYSQL_DATABASE=${fields.db.value.trim()}${fields.user.value.trim() ? ` \\
  -e MYSQL_USER=${fields.user.value.trim()}` : ''}${fields.userpw.value.trim() ? ` \\
  -e MYSQL_PASSWORD=${fields.userpw.value.trim()}` : ''} \\
  -d mysql:latest`;

    dfResult.className = 'df-result ok';
    dfResult.innerHTML = `✅ Container <strong>${name}</strong> started on port <strong>${port}</strong>. Behind the scenes Docker ran:<pre>${cmd}</pre>`;
    const r = dfResult.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + 20);
  });

  dfResetBtn.addEventListener('click', () => {
    Object.values(fields).forEach(f => { f.value = ''; f.classList.remove('field-err'); });
    dfResult.className = 'df-result';
    dfResult.textContent = 'Fill the form and start.';
  });
}

// ============ LESSON: DOCKER — Beekeeper test connection ============
const bkTestBtn = document.getElementById('bk-test');
const bkResult = document.getElementById('bk-result');
if (bkTestBtn) {
  bkTestBtn.addEventListener('click', () => {
    bkResult.className = 'bk-result';
    bkResult.style.color = 'var(--info)';
    bkResult.textContent = 'Connecting to localhost:3306…';
    bkTestBtn.disabled = true;
    setTimeout(() => {
      bkResult.className = 'bk-result ok';
      bkResult.textContent = '✓ Connection looks good. Save it as "tuf_practice_mysql" and start querying.';
      bkTestBtn.disabled = false;
      const r = bkResult.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + 10);
    }, 900);
  });
}

// ============ GENERIC CLICK-REVEAL ENGINE ============
const clickExplains = {
  // command families
  'fam-ddl': `<strong>DDL — Data Definition Language</strong>. Builds and changes <em>structure</em>, not data. Commands: <code>CREATE</code>, <code>ALTER</code>, <code>DROP</code>, <code>TRUNCATE</code>, <code>RENAME</code>. Think "design the database & tables".`,
  'fam-dml': `<strong>DML — Data Manipulation Language</strong>. Changes the <em>actual data</em> inside tables. Commands: <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>. Add, edit, remove rows.`,
  'fam-dql': `<strong>DQL — Data Query Language</strong>. Reads data. Really just one command: <code>SELECT</code>. Fetch rows and columns.`,
  'fam-dcl': `<strong>DCL — Data Control Language</strong>. Permissions and security. Commands: <code>GRANT</code>, <code>REVOKE</code>. Decides who can do what.`,
  'fam-tcl': `<strong>TCL — Transaction Control Language</strong>. Commit or undo a group of operations. Commands: <code>COMMIT</code>, <code>ROLLBACK</code>, <code>SAVEPOINT</code>. All-or-nothing safety.`,
  // keys
  'key-pk': `<strong>Primary key</strong> — uniquely identifies each row. Must be <em>unique</em> and <em>NOT NULL</em>. Define it inline (<code>user_id INT PRIMARY KEY</code>) or at the end (<code>PRIMARY KEY (user_id)</code>).`,
  'key-fk': `<strong>Foreign key</strong> — links one table to another table's primary key, creating a relationship. <code>FOREIGN KEY (user_id) REFERENCES users(user_id)</code>. Every order must belong to a real user.`,
  'key-composite': `<strong>Composite key</strong> — multiple columns together form the unique identifier. <code>PRIMARY KEY (email, batch_id)</code>: email alone can repeat across batches, but the <em>pair</em> must be unique. More columns = bigger index, so use only when needed.`,
  // constraints
  'con-auto': `<strong>AUTO_INCREMENT</strong> — the database fills in an ever-increasing number automatically, so you don't pass an id on insert. In MySQL it must sit on a key column (usually the PRIMARY KEY).`,
  'con-notnull': `<strong>NOT NULL</strong> — the column is mandatory. An insert without it (or with NULL) is rejected. Example: <code>email VARCHAR(50) NOT NULL</code>.`,
  'con-unique': `<strong>UNIQUE</strong> — no two rows can share the same value. Blocks duplicate emails, usernames, etc. Data safety at the database level.`,
  'con-check': `<strong>CHECK</strong> — enforces a rule or range. <code>CHECK (age >= 15 AND age <= 30)</code>. Insert age = 12 and the database refuses it.`,
  'con-default': `<strong>DEFAULT</strong> — if you don't pass a value, the database fills in this one. <code>is_active BOOLEAN DEFAULT TRUE</code> stores TRUE automatically.`,
  // relationships
  'rel-1n': `<strong>One-to-Many (1 : N)</strong> — the most common. One parent row links to many child rows. One student has many attendance records. The foreign key always lives on the "many" side (in <code>attendance</code>, not <code>students</code>).`,
  'rel-11': `<strong>One-to-One (1 : 1)</strong> — one row links to exactly one row in another table. Often used to split off sensitive or rarely-used data (e.g. <code>student_details</code> with a phone number). The FK is also marked UNIQUE so the match stays one-to-one.`,
  'rel-mn': `<strong>Many-to-Many (M : N)</strong> — both sides can link to many of the other. A student joins many batches; a batch has many students. SQL can't store this directly — you add a <em>junction table</em> (e.g. <code>enrollments</code>) holding one FK to each side.`,
  // host types (Module 13)
  'host-any': `<strong>'%' (wildcard)</strong> — the user can log in from <em>any</em> machine, as long as they have the username and password. <code>CREATE USER 'raj'@'%' IDENTIFIED BY '123456';</code>. Most permissive; convenient for cloud apps, riskier for security.`,
  'host-local': `<strong>'localhost'</strong> — the user can only connect from the <em>same machine</em> the MySQL server runs on. <code>CREATE USER 'raj_localhost'@'localhost' IDENTIFIED BY '123456';</code>. Gotcha: if MySQL runs in Docker, "localhost" is the <em>container</em>, not your host OS.`,
  'host-ip': `<strong>A specific IP</strong> — login is allowed only from one machine's address. <code>CREATE USER 'raj_ip'@'192.168.65.1' IDENTIFIED BY '123456';</code>. Common in companies for tighter security — bind the account to a known server or VPN.`,
  // InnoDB internals (Module 14)
  'idb-start': `<strong>START TRANSACTION</strong> — InnoDB builds a transaction context: a <em>transaction ID</em> to track this unit of work, and a <em>read view</em> for MVCC so other sessions keep seeing a consistent older snapshot. No table copy, no row changes yet — just setup.`,
  'idb-buffer': `<strong>Buffer pool &amp; dirty pages</strong> — rows live in <em>pages</em> on disk; a B+Tree index finds the right page. To change a row, InnoDB loads that page into RAM (the buffer pool) and edits it there. The modified-in-RAM-but-not-yet-flushed page is a <em>dirty page</em>.`,
  'idb-lock': `<strong>Locks</strong> — your write takes a lock on the affected row(s). Another transaction trying to write the same row <em>waits</em> (and may time out). Reads can still proceed because MVCC serves them an older version. The lock is held until you COMMIT or ROLLBACK.`,
  'idb-undo': `<strong>Undo log</strong> — before changing a row, InnoDB records its <em>previous</em> version. Two jobs: (1) <code>ROLLBACK</code> replays it to restore the old state, and (2) MVCC — other sessions follow the undo pointer to read the older version until you commit.`,
  'idb-redo': `<strong>Redo log</strong> — not for rollback, for <em>durability</em>. As you modify pages in RAM, InnoDB also records the change. If MySQL crashes before dirty pages are flushed, recovery replays the redo log so committed changes aren't lost.`,
  'idb-commit': `<strong>COMMIT</strong> — marks the transaction committed (finalizes its ID), <em>releases the locks</em>, and makes the changes visible to every other connection. ROLLBACK instead walks the undo log to reverse everything back to the last commit.`
};

document.querySelectorAll('.click-card').forEach(c => {
  c.addEventListener('click', () => {
    const group = c.dataset.group;
    document.querySelectorAll(`.click-card[data-group="${group}"]`).forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    const detail = document.querySelector(`.click-detail[data-group="${group}"]`);
    if (!detail) return;
    detail.innerHTML = clickExplains[c.dataset.key];
    detail.classList.remove('fresh');
    void detail.offsetWidth;
    detail.classList.add('fresh');
  });
});

// ============ GENERIC CLASSIFY GAME ENGINE ============
function buildClassify(containerId, scoreId, rounds) {
  const el = document.getElementById(containerId);
  const scoreEl = document.getElementById(scoreId);
  if (!el || !scoreEl) return;
  let answered = 0, correct = 0;

  rounds.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'uc-card';
    let h = `<div class="uc-q">`;
    if (r.label) h += `<span class="cg-label">${r.label}</span>`;
    h += r.code ? `<span class="cg-prompt">${r.prompt}</span>` : r.prompt;
    h += `</div><div class="uc-options">`;
    r.options.forEach((o, j) => {
      h += `<button class="uc-opt" data-i="${i}" data-j="${j}">${o.label}</button>`;
    });
    h += `</div><div class="uc-why" id="${containerId}-why-${i}"></div>`;
    card.innerHTML = h;
    el.appendChild(card);
  });

  el.addEventListener('click', e => {
    const b = e.target.closest('.uc-opt');
    if (!b || b.disabled) return;
    const i = +b.dataset.i, j = +b.dataset.j;
    const round = rounds[i];
    const sib = el.querySelectorAll(`.uc-opt[data-i="${i}"]`);
    if ([...sib].some(s => s.disabled)) return;
    sib.forEach(s => s.disabled = true);
    const answerIdx = round.options.findIndex(o => o.correct);
    if (sib[answerIdx]) sib[answerIdx].classList.add('correct');
    if (!round.options[j].correct) b.classList.add('wrong');
    else correct++;
    answered++;
    const why = document.getElementById(`${containerId}-why-${i}`);
    why.textContent = round.why;
    why.classList.add('show');
    if (answered === rounds.length) {
      scoreEl.textContent = `${correct} / ${rounds.length}${correct === rounds.length ? ' — perfect!' : ''}`;
      scoreEl.style.color = correct === rounds.length ? 'var(--success)' : 'var(--text-muted)';
      if (correct === rounds.length) {
        const rect = scoreEl.getBoundingClientRect();
        confetti(rect.left + rect.width / 2, rect.top + 20);
      }
    } else {
      scoreEl.textContent = `${correct} / ${answered} correct so far`;
    }
  });
}

function opt(label, correct) { return { label, correct: !!correct }; }

// command families game
buildClassify('fam-game', 'fam-score', [
  { label: 'Command', prompt: 'CREATE', code: true, options: [opt('DDL', true), opt('DML'), opt('DQL'), opt('DCL'), opt('TCL')], why: 'CREATE defines structure → DDL.' },
  { label: 'Command', prompt: 'INSERT', code: true, options: [opt('DDL'), opt('DML', true), opt('DQL'), opt('DCL'), opt('TCL')], why: 'INSERT adds rows of data → DML.' },
  { label: 'Command', prompt: 'SELECT', code: true, options: [opt('DDL'), opt('DML'), opt('DQL', true), opt('DCL'), opt('TCL')], why: 'SELECT reads data → DQL.' },
  { label: 'Command', prompt: 'GRANT', code: true, options: [opt('DDL'), opt('DML'), opt('DQL'), opt('DCL', true), opt('TCL')], why: 'GRANT sets permissions → DCL.' },
  { label: 'Command', prompt: 'COMMIT', code: true, options: [opt('DDL'), opt('DML'), opt('DQL'), opt('DCL'), opt('TCL', true)], why: 'COMMIT finalizes a transaction → TCL.' },
  { label: 'Command', prompt: 'ALTER', code: true, options: [opt('DDL', true), opt('DML'), opt('DQL'), opt('DCL'), opt('TCL')], why: 'ALTER changes table structure → DDL.' },
  { label: 'Command', prompt: 'ROLLBACK', code: true, options: [opt('DDL'), opt('DML'), opt('DQL'), opt('DCL'), opt('TCL', true)], why: 'ROLLBACK undoes a transaction → TCL.' },
  { label: 'Command', prompt: 'REVOKE', code: true, options: [opt('DDL'), opt('DML'), opt('DQL'), opt('DCL', true), opt('TCL')], why: 'REVOKE removes permissions → DCL.' }
]);

// data type matcher game
buildClassify('type-game', 'type-score', [
  { label: 'Store', prompt: 'account balance / money', options: [opt('DECIMAL(10,2)', true), opt('INT'), opt('VARCHAR(50)'), opt('TEXT')], why: 'Money needs exact decimals → DECIMAL(p,s). Floats would lose precision.' },
  { label: 'Store', prompt: 'a yes/no flag like is_active', options: [opt('BOOLEAN', true), opt('VARCHAR(5)'), opt('INT'), opt('DATE')], why: 'True/false → BOOLEAN (stored as 1/0).' },
  { label: 'Store', prompt: 'an email up to 50 characters', options: [opt('VARCHAR(50)', true), opt('TEXT'), opt('INT'), opt('CHAR(1)')], why: 'Short variable text with a limit → VARCHAR(n).' },
  { label: 'Store', prompt: 'a long blog post', options: [opt('TEXT', true), opt('VARCHAR(50)'), opt('INT'), opt('BOOLEAN')], why: 'Large free-form text → TEXT.' },
  { label: 'Store', prompt: 'a birthday (date only)', options: [opt('DATE', true), opt('DATETIME'), opt('VARCHAR(10)'), opt('INT')], why: 'Date with no time → DATE.' },
  { label: 'Store', prompt: 'a login timestamp (date + time)', options: [opt('DATETIME', true), opt('DATE'), opt('TEXT'), opt('BIGINT')], why: 'Both date and time → DATETIME / TIMESTAMP.' },
  { label: 'Store', prompt: 'a user age or a count', options: [opt('INT', true), opt('DECIMAL(10,2)'), opt('VARCHAR(3)'), opt('TEXT')], why: 'Whole numbers → INT.' }
]);

// constraints predict game
buildClassify('con-game', 'con-score', [
  { label: 'Insert', prompt: "(name, email) = ('Raj', 'raj@gmail.com')", code: true, options: [opt('PASS', true), opt('FAIL')], why: "PASS — id auto-increments, age can be NULL, is_active defaults to TRUE. All rules satisfied." },
  { label: 'Insert', prompt: "another row, same email 'raj@gmail.com'", code: true, options: [opt('PASS'), opt('FAIL', true)], why: "FAIL — email is UNIQUE, duplicates are blocked." },
  { label: 'Insert', prompt: "(name, email, age) with age = 12", code: true, options: [opt('PASS'), opt('FAIL', true)], why: "FAIL — CHECK requires age between 15 and 30." },
  { label: 'Insert', prompt: "(name) only, no email", code: true, options: [opt('PASS'), opt('FAIL', true)], why: "FAIL — email is NOT NULL, it's mandatory." },
  { label: 'Insert', prompt: "(name, email, age) with age = 20, new email", code: true, options: [opt('PASS', true), opt('FAIL')], why: "PASS — unique email, age in range, everything valid." },
  { label: 'Insert', prompt: "row without is_active", code: true, options: [opt('PASS', true), opt('FAIL')], why: "PASS — is_active has DEFAULT TRUE, so it's filled automatically." }
]);

// NULL vs 0 vs '' game
buildClassify('null-game', 'null-score', [
  { label: 'Scenario', prompt: 'A user has no middle name (not applicable)', options: [opt('NULL', true), opt('0'), opt("'' (empty string)")], why: "NULL — the value doesn't apply / isn't known." },
  { label: 'Scenario', prompt: 'An order line for exactly 0 items', options: [opt('NULL'), opt('0', true), opt("'' (empty string)")], why: "0 — we know the quantity, and it's zero." },
  { label: 'Scenario', prompt: 'User deliberately left nickname blank', options: [opt('NULL'), opt('0'), opt("'' (empty string)", true)], why: "Empty string — a known, intentional, zero-length text value." },
  { label: 'Scenario', prompt: 'Sensor reading not recorded yet (unknown)', options: [opt('NULL', true), opt('0'), opt("'' (empty string)")], why: "NULL — the value is unknown, not zero." },
  { label: 'Scenario', prompt: 'Shopping cart total is ₹0', options: [opt('NULL'), opt('0', true), opt("'' (empty string)")], why: "0 — a real number we know to be zero." },
  { label: 'Scenario', prompt: 'Optional bio saved as empty text', options: [opt('NULL'), opt('0'), opt("'' (empty string)", true)], why: "Empty string — valid text with zero characters." }
]);

// foreign key "ghost user" game — users 1 and 2 exist
buildClassify('fk-game', 'fk-score', [
  { label: 'Insert order', prompt: "user_id = 1", code: true, options: [opt('PASS', true), opt('FAIL')], why: "PASS — user 1 exists in the parent table." },
  { label: 'Insert order', prompt: "user_id = 99", code: true, options: [opt('PASS'), opt('FAIL', true)], why: "FAIL — no user 99 exists. The FK blocks this ghost reference." },
  { label: 'Insert order', prompt: "user_id = 2", code: true, options: [opt('PASS', true), opt('FAIL')], why: "PASS — user 2 exists." },
  { label: 'Action', prompt: "DROP TABLE users (orders still exist)", code: true, options: [opt('PASS'), opt('FAIL', true)], why: "FAIL — orders still reference users. Drop the child (orders) first." }
]);

// relationship type game
buildClassify('rel-game', 'rel-score', [
  { label: 'Scenario', prompt: 'One student has many attendance records', options: [opt('One-to-Many', true), opt('One-to-One'), opt('Many-to-Many')], why: "1 : N — one parent, many children. FK sits on attendance." },
  { label: 'Scenario', prompt: 'Students enroll in many batches; batches hold many students', options: [opt('One-to-Many'), opt('One-to-One'), opt('Many-to-Many', true)], why: "M : N — needs a junction table (enrollments)." },
  { label: 'Scenario', prompt: 'Each student has exactly one private profile row', options: [opt('One-to-Many'), opt('One-to-One', true), opt('Many-to-Many')], why: "1 : 1 — one row links to exactly one other (UNIQUE FK)." },
  { label: 'Scenario', prompt: 'One author writes many books', options: [opt('One-to-Many', true), opt('One-to-One'), opt('Many-to-Many')], why: "1 : N — one author, many books." },
  { label: 'Scenario', prompt: 'Actors appear in many movies; movies have many actors', options: [opt('One-to-Many'), opt('One-to-One'), opt('Many-to-Many', true)], why: "M : N — a junction table (castings) links them." }
]);

// should-you-index game
buildClassify('idx-game', 'idx-score', [
  { label: 'Column', prompt: 'email — looked up on every login', options: [opt('Index it', true), opt('Skip it')], why: "Index — searched constantly, high selectivity. Perfect candidate." },
  { label: 'Column', prompt: 'gender — only 2-3 possible values', options: [opt('Index it'), opt('Skip it', true)], why: "Skip — low selectivity. The index barely narrows anything down." },
  { label: 'Column', prompt: 'last_seen — updated every few seconds', options: [opt('Index it'), opt('Skip it', true)], why: "Skip — constant writes mean constant index updates = heavy load." },
  { label: 'Column', prompt: 'user_id — joined to orders all the time', options: [opt('Index it', true), opt('Skip it')], why: "Index — frequently joined/filtered foreign key. Big speedup." },
  { label: 'Column', prompt: 'full_name — often used in ORDER BY', options: [opt('Index it', true), opt('Skip it')], why: "Index — a sorted index serves ORDER BY without re-sorting." }
]);

// ============ MODULE 4: QUERY FUNDAMENTALS ============
const countries = [
  { id: 1, country: 'India',     population: 1400000000, area: 3287000, region: 'Asia' },
  { id: 2, country: 'China',     population: 1200000000, area: 4287000, region: 'Asia' },
  { id: 3, country: 'Brazil',    population: 214000000,  area: 8516000, region: 'South America' },
  { id: 4, country: 'Australia', population: 25700000,   area: 7692000, region: 'Oceania' },
  { id: 5, country: 'USA',       population: 331000000,  area: 9834000, region: 'North America' }
];
const TEXT_COLS = ['country', 'region'];
function qfFmt(v) { return typeof v === 'number' ? v.toLocaleString('en-US') : v; }
function qfTable(rows, cols, headerMap) {
  if (!rows.length) return '<div class="muted" style="padding:10px 0;">0 rows.</div>';
  let h = '<table class="rt"><thead><tr>';
  cols.forEach(c => h += `<th>${(headerMap && headerMap[c]) || c}</th>`);
  h += '</tr></thead><tbody>';
  rows.forEach(r => {
    h += '<tr>';
    cols.forEach(c => h += `<td>${qfFmt(r[c])}</td>`);
    h += '</tr>';
  });
  h += '</tbody></table>';
  return h;
}

// --- SELECT column picker ---
const qcols = document.getElementById('qcols');
if (qcols) {
  const allCols = ['id', 'country', 'population', 'area', 'region'];
  const selOut = document.getElementById('qsel-out');
  const selRes = document.getElementById('qsel-res');
  function paintSelect() {
    const chosen = allCols.filter(c => qcols.querySelector(`input[value="${c}"]`).checked);
    if (!chosen.length) {
      selOut.textContent = '-- pick at least one column';
      selRes.innerHTML = '<div class="muted" style="padding:10px 0;">No columns selected.</div>';
      return;
    }
    const colList = chosen.length === allCols.length ? '*' : chosen.join(', ');
    selOut.textContent = `SELECT ${colList} FROM countries;`;
    selRes.innerHTML = qfTable(countries, chosen);
  }
  qcols.addEventListener('change', paintSelect);
  paintSelect();
}

// --- WHERE filter playground ---
const wfRun = document.getElementById('wf-run');
if (wfRun) {
  const wfCol = document.getElementById('wf-col');
  const wfOp = document.getElementById('wf-op');
  const wfVal = document.getElementById('wf-val');
  const wfOut = document.getElementById('wf-out');
  const wfRes = document.getElementById('wf-res');
  const wfCount = document.getElementById('wf-count');
  function passes(row, col, op, val) {
    const a = row[col];
    const isText = TEXT_COLS.includes(col);
    const b = isText ? val : parseFloat(val);
    if (isText) {
      const cmp = String(a).localeCompare(String(b));
      switch (op) { case '=': return a === b; case '!=': return a !== b; case '<': return cmp < 0; case '>': return cmp > 0; case '<=': return cmp <= 0; case '>=': return cmp >= 0; }
    } else {
      if (isNaN(b)) return false;
      switch (op) { case '=': return a === b; case '!=': return a !== b; case '<': return a < b; case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b; }
    }
    return false;
  }
  function runWhere() {
    const col = wfCol.value, op = wfOp.value, val = wfVal.value;
    const isText = TEXT_COLS.includes(col);
    const shown = isText ? `'${val}'` : (val === '' ? '?' : val);
    wfOut.textContent = `SELECT * FROM countries\nWHERE ${col} ${op} ${shown};`;
    const cols = ['country', 'population', 'area', 'region'];
    let kept = 0;
    let h = '<table class="rt"><thead><tr><th></th>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    countries.forEach(r => {
      const ok = passes(r, col, op, val);
      if (ok) kept++;
      h += `<tr class="${ok ? 'row-pass' : 'row-fail'}"><td>${ok ? '✓' : '✗'}</td>` + cols.map(c => `<td>${qfFmt(r[c])}</td>`).join('') + '</tr>';
    });
    h += '</tbody></table>';
    wfRes.innerHTML = h;
    wfCount.textContent = `${kept} of 5 rows kept.`;
  }
  wfRun.addEventListener('click', runWhere);
  wfVal.addEventListener('keydown', e => { if (e.key === 'Enter') runWhere(); });
  runWhere();
}

// --- Logical AND/OR/NOT playground ---
const lgConn = document.getElementById('lg-conn');
if (lgConn) {
  const lgNot = document.getElementById('lg-not');
  const lgOut = document.getElementById('lg-out');
  const lgRes = document.getElementById('lg-res');
  let conn = 'AND';
  function runLogic() {
    const cols = ['country', 'population', 'area', 'region'];
    let kept = 0;
    let h = '<table class="rt"><thead><tr><th></th>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    countries.forEach(r => {
      const A = r.population > 50000000;
      const B = r.area < 5000000;
      let ok = conn === 'AND' ? (A && B) : (A || B);
      if (lgNot.checked) ok = !ok;
      if (ok) kept++;
      h += `<tr class="${ok ? 'row-pass' : 'row-fail'}"><td>${ok ? '✓' : '✗'}</td>` + cols.map(c => `<td>${qfFmt(r[c])}</td>`).join('') + '</tr>';
    });
    h += '</tbody></table>';
    lgRes.innerHTML = h;
    const inner = `population > 50000000 ${conn} area < 5000000`;
    lgOut.textContent = lgNot.checked
      ? `SELECT * FROM countries\nWHERE NOT (${inner});`
      : `SELECT * FROM countries\nWHERE ${inner};`;
  }
  lgConn.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    lgConn.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    conn = b.dataset.c;
    runLogic();
  }));
  lgNot.addEventListener('change', runLogic);
  runLogic();
}

// --- Arithmetic density ---
const arRun = document.getElementById('ar-run');
if (arRun) {
  const arRes = document.getElementById('ar-res');
  arRun.addEventListener('click', () => {
    const rows = countries.map(r => ({ country: r.country, population: r.population, area: r.area, density: Math.round(r.population / r.area) }));
    arRes.innerHTML = qfTable(rows, ['country', 'population', 'area', 'density']);
  });
  document.getElementById('ar-reset').addEventListener('click', () => { arRes.innerHTML = ''; });
}

// --- ORDER BY & LIMIT ---
const obCol = document.getElementById('ob-col');
if (obCol) {
  const obDir = document.getElementById('ob-dir');
  const obLim = document.getElementById('ob-lim');
  const obLimVal = document.getElementById('ob-lim-val');
  const obOut = document.getElementById('ob-out');
  const obRes = document.getElementById('ob-res');
  let dir = 'ASC';
  function runOrder() {
    const col = obCol.value;
    const lim = +obLim.value;
    const sorted = [...countries].sort((a, b) => {
      let r = TEXT_COLS.includes(col) ? String(a[col]).localeCompare(String(b[col])) : a[col] - b[col];
      return dir === 'ASC' ? r : -r;
    }).slice(0, lim);
    const cols = col === 'country' ? ['country', 'region'] : ['country', col];
    obOut.textContent = `SELECT ${cols.join(', ')} FROM countries\nORDER BY ${col} ${dir} LIMIT ${lim};`;
    obRes.innerHTML = qfTable(sorted, cols);
  }
  obDir.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    obDir.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    dir = b.dataset.d;
    runOrder();
  }));
  obCol.addEventListener('change', runOrder);
  obLim.addEventListener('input', () => { obLimVal.textContent = obLim.value; runOrder(); });
  runOrder();
}

// --- DISTINCT & AS ---
const dsDistinct = document.getElementById('ds-distinct');
if (dsDistinct) {
  const dsAlias = document.getElementById('ds-alias');
  const dsOut = document.getElementById('ds-out');
  const dsRes = document.getElementById('ds-res');
  function runDistinct() {
    const alias = dsAlias.value.trim();
    const header = alias || 'region';
    let regions = countries.map(r => r.region);
    if (dsDistinct.checked) regions = [...new Set(regions)];
    const aliasSql = alias ? ` AS ${alias}` : '';
    dsOut.textContent = `SELECT ${dsDistinct.checked ? 'DISTINCT ' : ''}region${aliasSql} FROM countries;`;
    dsRes.innerHTML = qfTable(regions.map(x => ({ region: x })), ['region'], { region: header })
      + `<div class="rt-count">${regions.length} row${regions.length === 1 ? '' : 's'}.</div>`;
  }
  dsDistinct.addEventListener('change', runDistinct);
  dsAlias.addEventListener('input', runDistinct);
  runDistinct();
}

// --- Predict the result game ---
function optN(n, correct) { return { label: String(n), correct: !!correct }; }
buildClassify('predict-game', 'predict-score', [
  { label: 'Returns?', prompt: "SELECT * FROM countries WHERE region = 'Asia';", code: true, options: [optN(1), optN(2, true), optN(3), optN(4)], why: "2 — India and China are both Asia." },
  { label: 'Returns?', prompt: "… WHERE region = 'Asia' OR region = 'Oceania';", code: true, options: [optN(2), optN(3, true), optN(4), optN(5)], why: "3 — India, China (Asia) + Australia (Oceania)." },
  { label: 'Returns?', prompt: "… WHERE NOT region = 'North America';", code: true, options: [optN(3), optN(4, true), optN(5), optN(2)], why: "4 — everyone except USA." },
  { label: 'Returns?', prompt: "… WHERE area > 8000000;", code: true, options: [optN(1), optN(2, true), optN(3), optN(4)], why: "2 — Brazil (8.516M) and USA (9.834M)." },
  { label: 'Returns?', prompt: "… WHERE population < 50000000;", code: true, options: [optN(1, true), optN(2), optN(0), optN(3)], why: "1 — only Australia (25.7M)." },
  { label: 'Returns?', prompt: "SELECT DISTINCT region FROM countries;", code: true, options: [optN(3), optN(4, true), optN(5), optN(2)], why: "4 — Asia, South America, Oceania, North America (Asia appears once)." }
]);

// ============ MODULE 5: FILTERING ESSENTIALS ============
const users = [
  { id: 1, email: 'raj@tuf.com', full_name: 'Raj', city: 'Bengaluru', last_purchase_inr: 999, last_coupon_code: 'WELCOME10' },
  { id: 2, email: 'test_user1@gmail.com', full_name: 'Test User One', city: 'Delhi', last_purchase_inr: 499, last_coupon_code: null },
  { id: 3, email: 'testXuser2@gmail.com', full_name: 'Test User Two', city: 'Delhi', last_purchase_inr: 750, last_coupon_code: 'WELCOME_2026' },
  { id: 4, email: 'aayush@company.com', full_name: 'Aayush', city: null, last_purchase_inr: null, last_coupon_code: null },
  { id: 5, email: 'neha@example.com', full_name: 'Neha', city: '', last_purchase_inr: 1500, last_coupon_code: 'TUF_50' },
  { id: 6, email: 'mohit@gmail.com', full_name: 'Mohit', city: 'Mumbai', last_purchase_inr: 299, last_coupon_code: 'NEWYEAR10' },
  { id: 7, email: 'sara@tuf.com', full_name: 'Sara', city: 'Bengaluru', last_purchase_inr: 2000, last_coupon_code: null },
  { id: 8, email: 'arjun@yahoo.com', full_name: 'Arjun', city: 'Pune', last_purchase_inr: 799, last_coupon_code: 'FLASH_SALE' },
  { id: 9, email: 'john.doe@gmail.com', full_name: 'John Doe', city: 'Chennai', last_purchase_inr: 300, last_coupon_code: null },
  { id: 10, email: 'jane_doe@gmail.com', full_name: 'Jane Doe', city: 'Chennai', last_purchase_inr: 1200, last_coupon_code: 'WELCOME_BACK' },
  { id: 11, email: 'support+trial@tuf.com', full_name: 'Support Trial', city: 'Gurugram', last_purchase_inr: null, last_coupon_code: null },
  { id: 12, email: 'priya@outlook.com', full_name: 'Priya', city: 'Hyderabad', last_purchase_inr: 999, last_coupon_code: 'WELCOME10' },
  { id: 13, email: 'sameer@rediffmail.com', full_name: 'Sameer', city: null, last_purchase_inr: 100, last_coupon_code: null },
  { id: 14, email: 'emptycity@demo.com', full_name: 'Empty City', city: ' ', last_purchase_inr: 499, last_coupon_code: null },
  { id: 15, email: 'khushi@gmail.com', full_name: 'Khushi', city: 'Delhi', last_purchase_inr: 500, last_coupon_code: 'REFERRAL5' },
  { id: 16, email: 'promo@demo.com', full_name: 'Promo', city: 'Mumbai', last_purchase_inr: 1499, last_coupon_code: 'TUF_50' },
  { id: 17, email: 'intern@tuf.com', full_name: 'Intern', city: 'Bengaluru', last_purchase_inr: 899, last_coupon_code: 'WELCOME_BACK' },
  { id: 18, email: 'hello@sample.com', full_name: 'Hello', city: 'Delhi', last_purchase_inr: null, last_coupon_code: null }
];
function uCell(v) {
  if (v === null || v === undefined) return '<span class="cell-null">NULL</span>';
  if (v === '') return '<span class="cell-null">(empty)</span>';
  if (typeof v === 'string' && v.length && v.trim() === '') return '<span class="cell-null">(space)</span>';
  return typeof v === 'number' ? v.toLocaleString('en-US') : v;
}
function uTable(rows, cols, headerMap) {
  if (!rows.length) return '<div class="muted" style="padding:10px 0;">0 rows.</div>';
  let h = '<table class="rt"><thead><tr>';
  cols.forEach(c => h += `<th>${(headerMap && headerMap[c]) || c}</th>`);
  h += '</tr></thead><tbody>';
  rows.forEach(r => { h += '<tr>'; cols.forEach(c => h += `<td>${uCell(r[c])}</td>`); h += '</tr>'; });
  h += '</tbody></table>';
  return h;
}

// source table
const feSource = document.getElementById('fe-source');
if (feSource) {
  feSource.innerHTML = uTable(users, ['id', 'email', 'full_name', 'city', 'last_purchase_inr', 'last_coupon_code']);
}

// --- IS NULL playground ---
const nlMode = document.getElementById('nl-mode');
if (nlMode) {
  const nlCol = document.getElementById('nl-col');
  const nlNorm = document.getElementById('nl-norm');
  const nlOut = document.getElementById('nl-out');
  const nlRes = document.getElementById('nl-res');
  const nlCount = document.getElementById('nl-count');
  let nMode = 'null';
  function runNull() {
    const col = nlCol.value;
    const norm = nlNorm.checked;
    const isMissing = v => (v === null) || (norm && typeof v === 'string' && v.trim() === '');
    const rows = users.filter(r => nMode === 'null' ? isMissing(r[col]) : !isMissing(r[col]));
    const expr = norm ? `NULLIF(TRIM(${col}), '')` : col;
    nlOut.textContent = `SELECT id, email, ${col} FROM users\nWHERE ${expr} ${nMode === 'null' ? 'IS NULL' : 'IS NOT NULL'};`;
    nlRes.innerHTML = uTable(rows, ['id', 'email', col]);
    nlCount.textContent = `${rows.length} of ${users.length} rows.`;
  }
  nlMode.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    nlMode.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    nMode = b.dataset.m; runNull();
  }));
  nlCol.addEventListener('change', runNull);
  nlNorm.addEventListener('change', runNull);
  runNull();
}

// --- IN / NOT IN playground ---
const inMode = document.getElementById('in-mode');
if (inMode) {
  const inCities = document.getElementById('in-cities');
  const inOut = document.getElementById('in-out');
  const inRes = document.getElementById('in-res');
  const inCount = document.getElementById('in-count');
  let iMode = 'in';
  function runIn() {
    const list = [...inCities.querySelectorAll('input:checked')].map(c => c.value);
    if (!list.length) {
      inOut.textContent = '-- pick at least one city';
      inRes.innerHTML = '<div class="muted" style="padding:10px 0;">No cities selected.</div>';
      inCount.textContent = '';
      return;
    }
    const quoted = list.map(c => `'${c}'`).join(', ');
    inOut.textContent = `SELECT id, email, city FROM users\nWHERE city ${iMode === 'in' ? 'IN' : 'NOT IN'} (${quoted});`;
    const rows = users.filter(r => {
      if (r.city === null) return false; // NULL never matches IN, and is excluded from NOT IN
      return iMode === 'in' ? list.includes(r.city) : !list.includes(r.city);
    });
    inRes.innerHTML = uTable(rows, ['id', 'email', 'city']);
    inCount.textContent = `${rows.length} of ${users.length} rows.`;
  }
  inMode.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    inMode.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    iMode = b.dataset.m; runIn();
  }));
  inCities.addEventListener('change', runIn);
  runIn();
}

// --- BETWEEN playground ---
const btRun = document.getElementById('bt-run');
if (btRun) {
  const btMin = document.getElementById('bt-min');
  const btMax = document.getElementById('bt-max');
  const btMode = document.getElementById('bt-mode');
  const btOut = document.getElementById('bt-out');
  const btRes = document.getElementById('bt-res');
  const btCount = document.getElementById('bt-count');
  let bMode = 'between';
  function runBetween() {
    const lo = parseFloat(btMin.value), hi = parseFloat(btMax.value);
    btOut.textContent = `SELECT full_name, last_purchase_inr FROM users\nWHERE last_purchase_inr ${bMode === 'between' ? 'BETWEEN' : 'NOT BETWEEN'} ${btMin.value} AND ${btMax.value};`;
    const rows = users.filter(r => {
      if (r.last_purchase_inr === null) return false;
      const inRange = r.last_purchase_inr >= lo && r.last_purchase_inr <= hi;
      return bMode === 'between' ? inRange : !inRange;
    });
    btRes.innerHTML = uTable(rows, ['full_name', 'last_purchase_inr']);
    btCount.textContent = `${rows.length} of ${users.length} rows (NULLs never match a range).`;
  }
  btMode.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    btMode.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    bMode = b.dataset.m; runBetween();
  }));
  btRun.addEventListener('click', runBetween);
  [btMin, btMax].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') runBetween(); }));
  runBetween();
}

// --- LIKE playground ---
const lkMode = document.getElementById('lk-mode');
if (lkMode) {
  const lkPat = document.getElementById('lk-pat');
  const lkOut = document.getElementById('lk-out');
  const lkRes = document.getElementById('lk-res');
  const lkCount = document.getElementById('lk-count');
  let lMode = 'like';
  function likeToRegex(pattern) {
    let out = '^';
    for (let i = 0; i < pattern.length; i++) {
      const ch = pattern[i];
      if (ch === '\\' && i + 1 < pattern.length) { out += pattern[i + 1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); i++; continue; }
      if (ch === '%') { out += '.*'; continue; }
      if (ch === '_') { out += '.'; continue; }
      out += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp(out + '$', 'i');
  }
  function runLike() {
    const pat = lkPat.value;
    lkOut.textContent = `SELECT id, email FROM users\nWHERE email ${lMode === 'like' ? 'LIKE' : 'NOT LIKE'} '${pat}';`;
    let rows;
    try {
      const re = likeToRegex(pat);
      rows = users.filter(r => lMode === 'like' ? re.test(r.email) : !re.test(r.email));
    } catch (_) { rows = []; }
    lkRes.innerHTML = uTable(rows, ['id', 'email']);
    lkCount.textContent = `${rows.length} of ${users.length} rows.`;
  }
  lkMode.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    lkMode.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    lMode = b.dataset.m; runLike();
  }));
  lkPat.addEventListener('input', runLike);
  document.querySelectorAll('.wildcard-legend .fbtn').forEach(b => b.addEventListener('click', () => {
    lkPat.value = b.dataset.pat; runLike();
  }));
  runLike();
}

// --- operator game ---
buildClassify('fe-opgame', 'fe-opscore', [
  { label: 'Goal', prompt: 'Find users with no city recorded', options: [opt('IS NULL', true), opt('IS NOT NULL'), opt('IN'), opt('LIKE')], why: "IS NULL — only it finds unknown/missing values." },
  { label: 'Goal', prompt: 'Users located in Delhi, Mumbai, or Pune', options: [opt('IN', true), opt('BETWEEN'), opt('LIKE'), opt('IS NULL')], why: "IN — clean membership check against a list." },
  { label: 'Goal', prompt: 'Purchases between ₹400 and ₹800', options: [opt('BETWEEN', true), opt('IN'), opt('LIKE'), opt('IS NOT NULL')], why: "BETWEEN — inclusive numeric range." },
  { label: 'Goal', prompt: 'Emails ending in @tuf.com', options: [opt('LIKE', true), opt('IN'), opt('BETWEEN'), opt('IS NULL')], why: "LIKE '%@tuf.com' — pattern match with a wildcard." },
  { label: 'Goal', prompt: 'Users who DID record a city', options: [opt('IS NOT NULL', true), opt('IS NULL'), opt('NOT IN'), opt('NOT LIKE')], why: "IS NOT NULL — keeps rows where the value is present." },
  { label: 'Goal', prompt: 'Hide all test% accounts from a report', options: [opt('NOT LIKE', true), opt('NOT IN'), opt('LIKE'), opt('BETWEEN')], why: "NOT LIKE 'test%' — exclude rows matching the pattern." }
]);

// ============ MODULE 6: AGGREGATION & GROUPING ============
const employees = [
  { emp_id: 1, employee_name: 'Alice', project: 'Alpha', years_experience: 3, hours_logged: 100, role: 'Developer' },
  { emp_id: 2, employee_name: 'Bob', project: 'Alpha', years_experience: 5, hours_logged: 120, role: 'QA' },
  { emp_id: 3, employee_name: 'Carol', project: 'Alpha', years_experience: 7, hours_logged: 105, role: 'Developer' },
  { emp_id: 4, employee_name: 'Dave', project: 'Alpha', years_experience: null, hours_logged: 0, role: 'Manager' },
  { emp_id: 5, employee_name: 'Eve', project: 'Beta', years_experience: 2, hours_logged: 80, role: 'Manager' },
  { emp_id: 6, employee_name: 'Frank', project: 'Beta', years_experience: 3, hours_logged: 110, role: 'Developer' },
  { emp_id: 7, employee_name: 'Grace', project: 'Beta', years_experience: 4, hours_logged: 130, role: 'Developer' },
  { emp_id: 8, employee_name: 'Hank', project: 'Beta', years_experience: 3, hours_logged: null, role: 'Developer' },
  { emp_id: 9, employee_name: 'Heidi', project: 'Gamma', years_experience: 5, hours_logged: 150, role: 'Developer' },
  { emp_id: 10, employee_name: 'Ivan', project: 'Gamma', years_experience: 6, hours_logged: 140, role: 'QA' }
];
const registrations = [
  { reg_id: 1, user_name: 'Aisha', email: 'aisha@example.com', event: 'TechFest', ticket_type: 'Paid', referrer: 'Instagram' },
  { reg_id: 2, user_name: 'Rohan', email: 'rohan@example.com', event: 'TechFest', ticket_type: 'Free', referrer: null },
  { reg_id: 3, user_name: 'Aisha', email: 'aisha@example.com', event: 'CodeCamp', ticket_type: 'Paid', referrer: 'Instagram' },
  { reg_id: 4, user_name: 'Mohit', email: null, event: 'TechFest', ticket_type: 'Free', referrer: 'LinkedIn' },
  { reg_id: 5, user_name: 'Neha', email: 'neha@example.com', event: 'CodeCamp', ticket_type: 'Free', referrer: 'Instagram' },
  { reg_id: 6, user_name: null, email: 'unknown@example.com', event: 'DesignCon', ticket_type: 'Paid', referrer: 'Twitter' },
  { reg_id: 7, user_name: 'Aisha', email: 'aisha@example.com', event: 'TechFest', ticket_type: 'Paid', referrer: 'Instagram' },
  { reg_id: 8, user_name: 'Vishal', email: null, event: 'DesignCon', ticket_type: 'Free', referrer: null },
  { reg_id: 9, user_name: 'Rohan', email: 'rohan@example.com', event: 'TechFest', ticket_type: 'Free', referrer: 'Instagram' },
  { reg_id: 10, user_name: 'Aisha', email: 'aisha@example.com', event: 'CodeCamp', ticket_type: 'Paid', referrer: null }
];

const empSource = document.getElementById('emp-source');
if (empSource) empSource.innerHTML = uTable(employees, ['emp_id', 'employee_name', 'project', 'years_experience', 'hours_logged', 'role']);
const regSource = document.getElementById('reg-source');
if (regSource) regSource.innerHTML = uTable(registrations, ['reg_id', 'user_name', 'email', 'event', 'ticket_type', 'referrer']);

const AGG_SQL = { count: 'COUNT(*)', sum_hours: 'SUM(hours_logged)', avg_exp: 'AVG(years_experience)', min_exp: 'MIN(years_experience)', max_exp: 'MAX(years_experience)' };
const AGG_LABEL = { count: 'count', sum_hours: 'total_hours', avg_exp: 'avg_experience', min_exp: 'min_experience', max_exp: 'max_experience' };
function aggValue(rows, type) {
  if (type === 'count') return rows.length;
  if (type === 'sum_hours') return rows.reduce((s, r) => s + (r.hours_logged == null ? 0 : r.hours_logged), 0);
  const v = rows.map(r => r.years_experience).filter(x => x != null);
  if (!v.length) return null;
  if (type === 'avg_exp') return parseFloat((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2));
  if (type === 'min_exp') return Math.min(...v);
  if (type === 'max_exp') return Math.max(...v);
  return null;
}
function groupRows(rows, cols) {
  const map = new Map();
  rows.forEach(r => {
    const key = cols.map(c => r[c]).join(' | ');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  });
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(e => e[1]);
}

// --- GROUP BY playground ---
const gbGroup = document.getElementById('gb-group');
if (gbGroup) {
  const gbAgg = document.getElementById('gb-agg');
  const gbOut = document.getElementById('gb-out');
  const gbRes = document.getElementById('gb-res');
  function runGroup() {
    const cols = gbGroup.value.split(',');
    const agg = gbAgg.value;
    const buckets = groupRows(employees, cols);
    const rows = buckets.map(grp => {
      const obj = {};
      cols.forEach(c => obj[c] = grp[0][c]);
      if (agg !== 'none') obj.__agg = aggValue(grp, agg);
      return obj;
    });
    const outCols = agg !== 'none' ? [...cols, '__agg'] : cols;
    const sel = agg !== 'none' ? `${cols.join(', ')}, ${AGG_SQL[agg]} AS ${AGG_LABEL[agg]}` : cols.join(', ');
    gbOut.textContent = `SELECT ${sel}\nFROM employees\nGROUP BY ${cols.join(', ')};`;
    gbRes.innerHTML = uTable(rows, outCols, { __agg: agg !== 'none' ? AGG_LABEL[agg] : '' });
  }
  gbGroup.addEventListener('change', runGroup);
  gbAgg.addEventListener('change', runGroup);
  runGroup();
}

// --- COUNT playground ---
const ctMode = document.getElementById('ct-mode');
if (ctMode) {
  const ctGroup = document.getElementById('ct-group');
  const ctOut = document.getElementById('ct-out');
  const ctRes = document.getElementById('ct-res');
  const CT_SQL = { star: 'COUNT(*)', email: 'COUNT(email)', distinct_user: 'COUNT(DISTINCT user_name)', distinct_email: 'COUNT(DISTINCT email)' };
  let ctG = 'none';
  function countOf(rows, mode) {
    if (mode === 'star') return rows.length;
    if (mode === 'email') return rows.filter(r => r.email != null).length;
    if (mode === 'distinct_user') return new Set(rows.filter(r => r.user_name != null).map(r => r.user_name)).size;
    if (mode === 'distinct_email') return new Set(rows.filter(r => r.email != null).map(r => r.email)).size;
    return 0;
  }
  function runCount() {
    const mode = ctMode.value;
    if (ctG === 'event') {
      ctOut.textContent = `SELECT event, ${CT_SQL[mode]} AS result\nFROM registrations\nGROUP BY event;`;
      const buckets = groupRows(registrations, ['event']);
      const rows = buckets.map(grp => ({ event: grp[0].event, result: countOf(grp, mode) }));
      ctRes.innerHTML = uTable(rows, ['event', 'result']);
    } else {
      ctOut.textContent = `SELECT ${CT_SQL[mode]} AS result\nFROM registrations;`;
      ctRes.innerHTML = uTable([{ result: countOf(registrations, mode) }], ['result']);
    }
  }
  ctGroup.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    ctGroup.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    ctG = b.dataset.g; runCount();
  }));
  ctMode.addEventListener('change', runCount);
  runCount();
}

// --- HAVING playground ---
const hvRun = document.getElementById('hv-run');
if (hvRun) {
  const hvAgg = document.getElementById('hv-agg');
  const hvOp = document.getElementById('hv-op');
  const hvVal = document.getElementById('hv-val');
  const hvOut = document.getElementById('hv-out');
  const hvRes = document.getElementById('hv-res');
  function cmp(a, op, b) { switch (op) { case '>': return a > b; case '>=': return a >= b; case '<': return a < b; case '<=': return a <= b; } return false; }
  function runHaving() {
    const agg = hvAgg.value, op = hvOp.value, thr = parseFloat(hvVal.value);
    hvOut.textContent = `SELECT project, ${AGG_SQL[agg]} AS ${AGG_LABEL[agg]}\nFROM employees\nGROUP BY project\nHAVING ${AGG_SQL[agg]} ${op} ${hvVal.value};`;
    const buckets = groupRows(employees, ['project']);
    let kept = 0;
    let h = '<table class="rt"><thead><tr><th></th><th>project</th><th>' + AGG_LABEL[agg] + '</th></tr></thead><tbody>';
    buckets.forEach(grp => {
      const val = aggValue(grp, agg);
      const ok = val != null && cmp(val, op, thr);
      if (ok) kept++;
      h += `<tr class="${ok ? 'row-pass' : 'row-fail'}"><td>${ok ? '✓' : '✗'}</td><td>${grp[0].project}</td><td>${uCell(val)}</td></tr>`;
    });
    h += '</tbody></table>';
    hvRes.innerHTML = h + `<div class="rt-count">${kept} of ${buckets.length} groups kept.</div>`;
  }
  hvAgg.addEventListener('change', runHaving);
  hvOp.addEventListener('change', runHaving);
  hvRun.addEventListener('click', runHaving);
  hvVal.addEventListener('keydown', e => { if (e.key === 'Enter') runHaving(); });
  runHaving();
}

// --- WHERE or HAVING game ---
buildClassify('wh-game', 'wh-score', [
  { label: 'Filter', prompt: "keep only rows where role = 'Developer'", options: [opt('WHERE', true), opt('HAVING')], why: "WHERE — it filters individual rows before grouping." },
  { label: 'Filter', prompt: "keep projects whose SUM(hours) > 300", options: [opt('WHERE'), opt('HAVING', true)], why: "HAVING — the condition uses an aggregate, computed after grouping." },
  { label: 'Filter', prompt: "keep only Paid tickets", options: [opt('WHERE', true), opt('HAVING')], why: "WHERE — a plain row condition, no aggregate." },
  { label: 'Filter', prompt: "keep events with COUNT(*) > 3", options: [opt('WHERE'), opt('HAVING', true)], why: "HAVING — filtering on a per-group count." },
  { label: 'Filter', prompt: "keep teams whose AVG(experience) >= 4", options: [opt('WHERE'), opt('HAVING', true)], why: "HAVING — average is an aggregate." },
  { label: 'Filter', prompt: "drop rows signed up before 2025", options: [opt('WHERE', true), opt('HAVING')], why: "WHERE — row-level date filter, runs before grouping." }
]);

// --- Predict the aggregate result ---
buildClassify('agg-predict', 'agg-predict-score', [
  { label: 'Result?', prompt: 'SELECT COUNT(*) FROM registrations;', code: true, options: [optN(8), optN(10, true), optN(5), optN(9)], why: "10 — COUNT(*) counts every row, NULLs included." },
  { label: 'Result?', prompt: 'SELECT COUNT(email) FROM registrations;', code: true, options: [optN(10), optN(8, true), optN(6), optN(9)], why: "8 — two emails are NULL (reg 4 and 8), skipped." },
  { label: 'Result?', prompt: 'SELECT COUNT(DISTINCT user_name) FROM registrations;', code: true, options: [optN(5, true), optN(6), optN(10), optN(4)], why: "5 — Aisha, Rohan, Mohit, Neha, Vishal (NULL name ignored)." },
  { label: 'Result?', prompt: "SELECT SUM(hours_logged) FROM employees WHERE project = 'Alpha';", code: true, options: [optN(325, true), optN(425), optN(300), optN(220)], why: "325 — 100+120+105+0 (Dave's 0 counts)." },
  { label: 'Groups kept?', prompt: '… GROUP BY event HAVING COUNT(*) > 3;', code: true, options: [optN(1, true), optN(2), optN(3), optN(0)], why: "1 — only TechFest has more than 3 registrations (it has 5)." }
]);

// ============ MODULE 7: NUMERIC & NULL FUNCTIONS ============
const nfStudents = [
  { id: 1, name: 'Aisha', city: 'Delhi', phone: null, fee_paid: 2804.45, score_change: -12.25, test1: 55, test2: 60, test3: 58 },
  { id: 2, name: 'Rohan', city: 'Mumbai', phone: '', fee_paid: 3303.06, score_change: -80.00, test1: 40, test2: null, test3: 52 },
  { id: 3, name: 'Meenal', city: null, phone: '8888000004', fee_paid: 7999.00, score_change: null, test1: null, test2: null, test3: 35 },
  { id: 4, name: 'Arjun', city: 'Pune', phone: '9777000005', fee_paid: 3717.94, score_change: 10.00, test1: 72, test2: 70, test3: 75 },
  { id: 5, name: 'Neha', city: 'Jaipur', phone: null, fee_paid: 3499.00, score_change: -30.75, test1: 10, test2: 15, test3: 12 },
  { id: 6, name: 'Vikas', city: 'Hyderabad', phone: '9666000007', fee_paid: 5099.00, score_change: 120.75, test1: 88, test2: 91, test3: 95 },
  { id: 7, name: 'Sana', city: 'Ahmedabad', phone: null, fee_paid: 7085.13, score_change: -15.00, test1: 65, test2: 64, test3: null },
  { id: 8, name: 'Imran', city: 'Kolkata', phone: '', fee_paid: 3303.06, score_change: -1.00, test1: 50, test2: 49, test3: 51 },
  { id: 9, name: 'Pallavi', city: '', phone: '9555000010', fee_paid: 3303.06, score_change: 5.25, test1: 92, test2: 90, test3: 91 },
  { id: 10, name: 'Deepak', city: 'Chennai', phone: null, fee_paid: null, score_change: -22.00, test1: 33, test2: 40, test3: 38 },
  { id: 11, name: 'Ananya', city: 'Bengaluru', phone: '9444000012', fee_paid: 3504.16, score_change: 18.50, test1: 78, test2: null, test3: null },
  { id: 12, name: 'Tanya', city: 'Kolkata', phone: '', fee_paid: 3303.06, score_change: -10.00, test1: 45, test2: 42, test3: 48 }
];
const coalesceDemo = [
  { id: 1, primary_email: 'aisha@company.com', work_email: null, personal_email: 'aisha@gmail.com', hours_logged: 5.0, default_hours: 0.0 },
  { id: 2, primary_email: null, work_email: 'rohan@company.com', personal_email: null, hours_logged: null, default_hours: 0.0 },
  { id: 3, primary_email: null, work_email: null, personal_email: 'meera@yahoo.com', hours_logged: 2.5, default_hours: 0.0 },
  { id: 4, primary_email: null, work_email: null, personal_email: null, hours_logged: null, default_hours: 0.0 },
  { id: 5, primary_email: '', work_email: null, personal_email: 'raj@gmail.com', hours_logged: 5.0, default_hours: 0.0 }
];

const studentsSource = document.getElementById('students-source');
if (studentsSource) studentsSource.innerHTML = uTable(nfStudents, ['id', 'name', 'city', 'phone', 'fee_paid', 'score_change', 'test1', 'test2', 'test3']);
const coalesceSource = document.getElementById('coalesce-source');
if (coalesceSource) coalesceSource.innerHTML = uTable(coalesceDemo, ['id', 'primary_email', 'work_email', 'personal_email', 'hours_logged', 'default_hours']);

// --- ROUND & ABS ---
const rdFn = document.getElementById('rd-fn');
if (rdFn) {
  const rdDec = document.getElementById('rd-dec');
  const rdDecVal = document.getElementById('rd-dec-val');
  const rdDecWrap = document.getElementById('rd-dec-wrap');
  const rdOut = document.getElementById('rd-out');
  const rdRes = document.getElementById('rd-res');
  function roundTo(x, d) { if (x == null) return null; const f = Math.pow(10, d); return Math.round(x * f) / f; }
  function runRound() {
    const fn = rdFn.value;
    rdDecWrap.style.display = fn === 'round' ? '' : 'none';
    if (fn === 'round') {
      const d = +rdDec.value;
      rdOut.textContent = `SELECT id, name, fee_paid, ROUND(fee_paid, ${d}) AS rounded\nFROM students ORDER BY id;`;
      const rows = nfStudents.map(r => ({ id: r.id, name: r.name, fee_paid: r.fee_paid, rounded: roundTo(r.fee_paid, d) }));
      rdRes.innerHTML = uTable(rows, ['id', 'name', 'fee_paid', 'rounded']);
    } else {
      rdOut.textContent = `SELECT id, name, score_change, ABS(score_change) AS abs_value\nFROM students ORDER BY id;`;
      const rows = nfStudents.map(r => ({ id: r.id, name: r.name, score_change: r.score_change, abs_value: r.score_change == null ? null : Math.abs(r.score_change) }));
      rdRes.innerHTML = uTable(rows, ['id', 'name', 'score_change', 'abs_value']);
    }
  }
  rdFn.addEventListener('change', runRound);
  rdDec.addEventListener('input', () => { rdDecVal.textContent = rdDec.value; runRound(); });
  runRound();
}

// --- GREATEST & LEAST ---
const glMode = document.getElementById('gl-mode');
if (glMode) {
  const glFix = document.getElementById('gl-fix');
  const glOut = document.getElementById('gl-out');
  const glRes = document.getElementById('gl-res');
  let gMode = 'greatest';
  function runGL() {
    const fix = glFix.checked;
    const fnSql = gMode === 'greatest' ? 'GREATEST' : 'LEAST';
    const args = fix ? "IFNULL(test1,0), IFNULL(test2,0), IFNULL(test3,0)" : 'test1, test2, test3';
    glOut.textContent = `SELECT id, name, test1, test2, test3,\n  ${fnSql}(${args}) AS result\nFROM students ORDER BY id;`;
    const rows = nfStudents.map(r => {
      let vals = [r.test1, r.test2, r.test3];
      let result;
      if (fix) { vals = vals.map(v => v == null ? 0 : v); result = gMode === 'greatest' ? Math.max(...vals) : Math.min(...vals); }
      else if (vals.some(v => v == null)) result = null;
      else result = gMode === 'greatest' ? Math.max(...vals) : Math.min(...vals);
      return { id: r.id, name: r.name, test1: r.test1, test2: r.test2, test3: r.test3, result };
    });
    glRes.innerHTML = uTable(rows, ['id', 'name', 'test1', 'test2', 'test3', 'result']);
  }
  glMode.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    glMode.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    gMode = b.dataset.m; runGL();
  }));
  glFix.addEventListener('change', runGL);
  runGL();
}

// --- IFNULL & NULLIF ---
const ifNullif = document.getElementById('if-nullif');
if (ifNullif) {
  const ifRepl = document.getElementById('if-repl');
  const ifOut = document.getElementById('if-out');
  const ifRes = document.getElementById('if-res');
  function runIf() {
    const useNullif = ifNullif.checked;
    const repl = ifRepl.value;
    ifOut.textContent = useNullif
      ? `SELECT id, name, phone,\n  IFNULL(NULLIF(phone, ''), '${repl}') AS result\nFROM students;`
      : `SELECT id, name, phone,\n  IFNULL(phone, '${repl}') AS result\nFROM students;`;
    const rows = nfStudents.map(r => {
      let p = r.phone;
      if (useNullif && p === '') p = null;
      return { id: r.id, name: r.name, phone: r.phone, result: (p == null ? repl : p) };
    });
    ifRes.innerHTML = uTable(rows, ['id', 'name', 'phone', 'result']);
  }
  ifNullif.addEventListener('change', runIf);
  ifRepl.addEventListener('input', runIf);
  runIf();
}

// --- COALESCE ---
const coCols = document.getElementById('co-cols');
if (coCols) {
  const coDefault = document.getElementById('co-default');
  const coClean = document.getElementById('co-clean');
  const coOut = document.getElementById('co-out');
  const coRes = document.getElementById('co-res');
  const ORDER = ['primary_email', 'work_email', 'personal_email'];
  function runCoalesce() {
    const chosen = ORDER.filter(c => coCols.querySelector(`input[value="${c}"]`).checked);
    const clean = coClean.checked;
    const def = coDefault.value.trim();
    const args = chosen.map(c => (clean && c === 'primary_email') ? `NULLIF(TRIM(${c}), '')` : c);
    if (def) args.push(`'${def}'`);
    coOut.textContent = `SELECT id,\n  COALESCE(${args.join(', ')}) AS contact_email\nFROM coalesce_demo;`;
    const rows = coalesceDemo.map(r => {
      let pick = null;
      for (const c of chosen) {
        let v = r[c];
        if (clean && c === 'primary_email') v = (v == null || String(v).trim() === '') ? null : v;
        if (v != null) { pick = v; break; }
      }
      if (pick == null && def) pick = def;
      return { id: r.id, primary_email: r.primary_email, work_email: r.work_email, personal_email: r.personal_email, contact_email: pick };
    });
    coRes.innerHTML = uTable(rows, ['id', 'primary_email', 'work_email', 'personal_email', 'contact_email']);
  }
  coCols.addEventListener('change', runCoalesce);
  coDefault.addEventListener('input', runCoalesce);
  coClean.addEventListener('change', runCoalesce);
  runCoalesce();
}

// --- which tool game ---
buildClassify('nf-toolgame', 'nf-toolscore', [
  { label: 'Goal', prompt: 'Filter to rows where city is missing', options: [opt('IS NULL', true), opt('IFNULL'), opt('COALESCE'), opt('NULLIF')], why: "IS NULL — used in WHERE to keep rows with no value." },
  { label: 'Goal', prompt: "Show 'Not Provided' instead of a NULL phone", options: [opt('IFNULL', true), opt('IS NULL'), opt('NULLIF'), opt('IS NOT NULL')], why: "IFNULL(phone, 'Not Provided') — one backup value." },
  { label: 'Goal', prompt: 'Pick the first email that exists from 3 columns', options: [opt('COALESCE', true), opt('IFNULL'), opt('GREATEST'), opt('IS NULL')], why: "COALESCE — returns the first non-NULL from a list." },
  { label: 'Goal', prompt: "Turn an empty string '' into NULL", options: [opt('NULLIF', true), opt('IFNULL'), opt('COALESCE'), opt('IS NULL')], why: "NULLIF(col, '') — returns NULL when the value equals ''." },
  { label: 'Goal', prompt: 'Keep only rows that DO have a phone', options: [opt('IS NOT NULL', true), opt('IS NULL'), opt('IFNULL'), opt('NULLIF')], why: "IS NOT NULL — filter to rows where the value is present." },
  { label: 'Goal', prompt: 'Replace NULL hours with 0 before summing many columns', options: [opt('COALESCE', true), opt('IS NULL'), opt('NULLIF'), opt('GREATEST')], why: "COALESCE(hours, 0) — safe math, avoids NULL poisoning the sum." }
]);

// ============ MODULE 8: CASE & CONDITIONAL LOGIC ============
const caseProducts = [
  { product_id: 1, name: 'Laptop Sleeve', price: 18 }, { product_id: 2, name: 'Wireless Mouse', price: 32 },
  { product_id: 3, name: 'Keyboard', price: 55 }, { product_id: 4, name: 'Monitor', price: 150 },
  { product_id: 5, name: 'USB Cable', price: 8 }, { product_id: 6, name: 'Webcam', price: 60 },
  { product_id: 7, name: 'HDMI Cable', price: 20 }, { product_id: 8, name: 'Mechanical Keyboard', price: 120 },
  { product_id: 9, name: 'Sticker Pack', price: 0 }, { product_id: 10, name: 'Gift Card', price: 19 },
  { product_id: 11, name: 'Mystery Box', price: null }, { product_id: 12, name: 'Refurb Monitor', price: 61 }
];
const caseRules = [
  { rule_id: 1, value: 75 }, { rule_id: 2, value: 40 }, { rule_id: 3, value: 60 }, { rule_id: 4, value: null },
  { rule_id: 5, value: 95 }, { rule_id: 6, value: 59 }, { rule_id: 7, value: 0 }, { rule_id: 8, value: 61 }
];
const caseBonus = [
  { emp_id: 101, salary: 50000, performance_score: 90 }, { emp_id: 102, salary: 45000, performance_score: null },
  { emp_id: 103, salary: 60000, performance_score: 74 }, { emp_id: 104, salary: 70000, performance_score: 75 },
  { emp_id: 105, salary: 80000, performance_score: 89 }, { emp_id: 106, salary: 0, performance_score: 92 },
  { emp_id: 107, salary: 52000, performance_score: 100 }, { emp_id: 108, salary: 50000, performance_score: 0 },
  { emp_id: 109, salary: 45000, performance_score: 85 }, { emp_id: 110, salary: 40000, performance_score: null }
];
const caseSales = [
  { item: 'apple', quantity: 10 }, { item: 'orange', quantity: 7 }, { item: 'apple', quantity: 5 },
  { item: 'banana', quantity: 3 }, { item: 'mango', quantity: 2 }, { item: 'apple', quantity: null }, { item: 'orange', quantity: null }
];

const productsSource = document.getElementById('products-source');
if (productsSource) productsSource.innerHTML = uTable(caseProducts, ['product_id', 'name', 'price']);

// --- price classifier ---
const pcBudget = document.getElementById('pc-budget');
if (pcBudget) {
  const pcPrem = document.getElementById('pc-prem');
  const pcBudgetVal = document.getElementById('pc-budget-val');
  const pcPremVal = document.getElementById('pc-prem-val');
  const pcOut = document.getElementById('pc-out');
  const pcRes = document.getElementById('pc-res');
  const CAT_CLASS = { 'Budget': 'cat-budget', 'Mid Range': 'cat-mid', 'Premium': 'cat-premium', 'Missing Price': 'cat-missing' };
  function classify(price, bMax, pMin) {
    if (price == null) return 'Missing Price';
    if (price <= bMax) return 'Budget';
    if (price <= pMin) return 'Mid Range';
    return 'Premium';
  }
  function runClassify() {
    let bMax = +pcBudget.value, pMin = +pcPrem.value;
    if (pMin <= bMax) pMin = bMax + 1;
    pcBudgetVal.textContent = bMax; pcPremVal.textContent = pMin;
    pcOut.textContent = `CASE\n  WHEN price IS NULL THEN 'Missing Price'\n  WHEN price <= ${bMax} THEN 'Budget'\n  WHEN price <= ${pMin} THEN 'Mid Range'\n  ELSE 'Premium'\nEND AS price_category`;
    let h = '<table class="rt"><thead><tr><th>product_id</th><th>name</th><th>price</th><th>price_category</th></tr></thead><tbody>';
    caseProducts.forEach(p => {
      const cat = classify(p.price, bMax, pMin);
      h += `<tr><td>${p.product_id}</td><td>${p.name}</td><td>${uCell(p.price)}</td><td><span class="cat-badge ${CAT_CLASS[cat]}">${cat}</span></td></tr>`;
    });
    h += '</tbody></table>';
    pcRes.innerHTML = h;
  }
  pcBudget.addEventListener('input', runClassify);
  pcPrem.addEventListener('input', runClassify);
  runClassify();
}

// --- searched vs simple game ---
buildClassify('ss-game', 'ss-score', [
  { label: 'Logic', prompt: 'Label price ranges: ≤20 Budget, >100 Premium', options: [opt('Searched CASE', true), opt('Simple CASE')], why: "Searched — uses ranges (<, >)." },
  { label: 'Logic', prompt: "Map status 'P' → Paid, 'D' → Delivered", options: [opt('Searched CASE'), opt('Simple CASE', true)], why: "Simple — equality against fixed codes." },
  { label: 'Logic', prompt: 'PASS if score >= 40, else FAIL', options: [opt('Searched CASE', true), opt('Simple CASE')], why: "Searched — a threshold comparison." },
  { label: 'Logic', prompt: "Translate grade 'A' → Excellent, 'B' → Good", options: [opt('Searched CASE'), opt('Simple CASE', true)], why: "Simple — direct code mapping." },
  { label: 'Logic', prompt: 'Flag rows where price IS NULL', options: [opt('Searched CASE', true), opt('Simple CASE')], why: "Searched — IS NULL is a boolean condition." }
]);

// --- verdict threshold ---
const vdThresh = document.getElementById('vd-thresh');
if (vdThresh) {
  const vdThreshVal = document.getElementById('vd-thresh-val');
  const vdOut = document.getElementById('vd-out');
  const vdRes = document.getElementById('vd-res');
  function runVerdict() {
    const t = +vdThresh.value;
    vdThreshVal.textContent = t;
    vdOut.textContent = `CASE\n  WHEN value IS NULL THEN 'Missing'\n  WHEN value >= ${t} THEN 'PASS'\n  ELSE 'FAIL'\nEND AS verdict`;
    const rows = caseRules.map(r => ({ rule_id: r.rule_id, value: r.value, verdict: r.value == null ? 'Missing' : (r.value >= t ? 'PASS' : 'FAIL') }));
    vdRes.innerHTML = uTable(rows, ['rule_id', 'value', 'verdict']);
  }
  vdThresh.addEventListener('input', runVerdict);
  runVerdict();
}

// --- bonus table ---
const bonusRes = document.getElementById('bonus-res');
if (bonusRes) {
  function bonusOf(salary, score) {
    if (score == null) return 0;
    if (score >= 90) return salary * 0.20;
    if (score >= 75) return salary * 0.10;
    return salary * 0.05;
  }
  const rows = caseBonus.map(e => ({ emp_id: e.emp_id, salary: e.salary, performance_score: e.performance_score, bonus_amount: bonusOf(e.salary, e.performance_score) }));
  bonusRes.innerHTML = uTable(rows, ['emp_id', 'salary', 'performance_score', 'bonus_amount']);
}

// --- conditional aggregation pivot ---
const pvPick = document.getElementById('pv-pick');
if (pvPick) {
  const pvOut = document.getElementById('pv-out');
  const pvRes = document.getElementById('pv-res');
  const PIVOTS = {
    apples: {
      sql: "SELECT\n  SUM(CASE WHEN item='apple'  THEN COALESCE(quantity,0) ELSE 0 END) AS apples_sold,\n  SUM(CASE WHEN item='orange' THEN COALESCE(quantity,0) ELSE 0 END) AS oranges_sold\nFROM sales;",
      run: () => {
        const a = caseSales.filter(s => s.item === 'apple').reduce((t, s) => t + (s.quantity || 0), 0);
        const o = caseSales.filter(s => s.item === 'orange').reduce((t, s) => t + (s.quantity || 0), 0);
        return [{ apples_sold: a, oranges_sold: o }];
      }, cols: ['apples_sold', 'oranges_sold']
    },
    passfail: {
      sql: "SELECT\n  COUNT(CASE WHEN value >= 40 THEN 1 END) AS pass_count,\n  COUNT(CASE WHEN value < 40 THEN 1 END) AS fail_count\nFROM rules;",
      run: () => {
        const p = caseRules.filter(r => r.value != null && r.value >= 40).length;
        const f = caseRules.filter(r => r.value != null && r.value < 40).length;
        return [{ pass_count: p, fail_count: f }];
      }, cols: ['pass_count', 'fail_count']
    },
    insta: {
      sql: "SELECT\n  SUM(CASE WHEN ticket_type='Paid' AND referrer='Instagram' THEN 1 ELSE 0 END) AS insta_paid_total\nFROM registrations;",
      run: () => [{ insta_paid_total: registrations.filter(r => r.ticket_type === 'Paid' && r.referrer === 'Instagram').length }],
      cols: ['insta_paid_total']
    },
    juniors: {
      sql: "SELECT\n  COUNT(CASE WHEN years_experience <= 3 THEN 1 END) AS juniors,\n  COUNT(CASE WHEN years_experience > 3 THEN 1 END) AS seniors\nFROM employees;",
      run: () => {
        const j = employees.filter(e => e.years_experience != null && e.years_experience <= 3).length;
        const s = employees.filter(e => e.years_experience != null && e.years_experience > 3).length;
        return [{ juniors: j, seniors: s }];
      }, cols: ['juniors', 'seniors']
    },
    nullpct: {
      sql: "SELECT\n  (SUM(CASE WHEN quantity IS NULL THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS null_percentage\nFROM sales;",
      run: () => {
        const nulls = caseSales.filter(s => s.quantity == null).length;
        return [{ null_percentage: parseFloat((nulls / caseSales.length * 100).toFixed(2)) }];
      }, cols: ['null_percentage']
    }
  };
  function runPivot() {
    const p = PIVOTS[pvPick.value];
    pvOut.textContent = p.sql;
    pvRes.innerHTML = uTable(p.run(), p.cols);
  }
  pvPick.addEventListener('change', runPivot);
  runPivot();
}

// --- predict the CASE output ---
buildClassify('cs-predict', 'cs-predict-score', [
  { label: 'price = 55', prompt: "WHEN price<=20 'Budget' / <=100 'Mid Range' / ELSE 'Premium'", options: [opt('Budget'), opt('Mid Range', true), opt('Premium'), opt('Missing Price')], why: "55 is > 20 and ≤ 100 → Mid Range." },
  { label: 'price = NULL', prompt: "WHEN price IS NULL 'Missing Price' / …", options: [opt('Missing Price', true), opt('Budget'), opt('Premium'), opt('NULL')], why: "The first WHEN catches NULL → Missing Price." },
  { label: 'value = 0', prompt: "WHEN IS NULL 'Missing' / >=40 'PASS' / ELSE 'FAIL'", options: [opt('PASS'), opt('FAIL', true), opt('Missing'), opt('0')], why: "0 is not NULL and < 40 → FAIL." },
  { label: 'value = NULL', prompt: "WHEN IS NULL 'Missing' / >=40 'PASS' / ELSE 'FAIL'", options: [opt('Missing', true), opt('FAIL'), opt('PASS'), opt('0')], why: "NULL hits the first WHEN → Missing (note: value=NULL would never match)." },
  { label: 'salary 50000, score 90', prompt: "score>=90 → salary*0.20", code: true, options: [optN(10000, true), optN(5000), optN(7500), optN(20000)], why: "50000 × 0.20 = 10000." }
]);

// ============ MODULE 9: STRING FUNCTIONS ============
function sfEsc(x) { return String(x).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function sfStrip(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }

const sfCustomers = [
  { id: 1, first_name: 'Raj', middle_name: 'Kumar', last_name: 'Patel', city: 'Mumbai', country: 'India' },
  { id: 2, first_name: 'Neha', middle_name: null, last_name: 'Gupta', city: 'Delhi', country: 'India' },
  { id: 3, first_name: 'Aayush', middle_name: null, last_name: 'Sharma', city: null, country: 'India' }
];

// --- collation compare ---
const clA = document.getElementById('cl-a');
if (clA) {
  const clB = document.getElementById('cl-b');
  const clCs = document.getElementById('cl-cs');
  const clAs = document.getElementById('cl-as');
  const clOut = document.getElementById('cl-out');
  function runCollation() {
    let x = clA.value, y = clB.value;
    if (!clCs.checked) { x = x.toLowerCase(); y = y.toLowerCase(); }
    if (!clAs.checked) { x = sfStrip(x); y = sfStrip(y); }
    const eq = x === y;
    const name = `utf8mb4_0900_${clAs.checked ? 'as' : 'ai'}_${clCs.checked ? 'cs' : 'ci'}`;
    clOut.innerHTML = `Under <code>${name}</code>: <strong style="color:var(--${eq ? 'success' : 'danger'})">${eq ? 'EQUAL' : 'NOT equal'}</strong>`;
  }
  [clA, clB, clCs, clAs].forEach(el => el.addEventListener('input', runCollation));
  [clCs, clAs].forEach(el => el.addEventListener('change', runCollation));
  runCollation();
}

// --- CONCAT / CONCAT_WS ---
const ccMode = document.getElementById('cc-mode');
if (ccMode) {
  const ccSep = document.getElementById('cc-sep');
  const ccOut = document.getElementById('cc-out');
  const ccRes = document.getElementById('cc-res');
  const custSource = document.getElementById('cust-source');
  if (custSource) custSource.innerHTML = uTable(sfCustomers, ['id', 'first_name', 'middle_name', 'last_name', 'city']);
  let ccM = 'concat';
  function runConcat() {
    const sep = ccSep.value;
    ccOut.textContent = ccM === 'concat'
      ? `SELECT id, CONCAT(first_name, '${sep}', middle_name, '${sep}', last_name) AS full_name FROM customers;`
      : `SELECT id, CONCAT_WS('${sep}', first_name, middle_name, last_name) AS full_name FROM customers;`;
    const rows = sfCustomers.map(c => {
      let full;
      if (ccM === 'concat') {
        const parts = [c.first_name, sep, c.middle_name, sep, c.last_name];
        full = parts.some(p => p == null) ? null : parts.join('');
      } else {
        full = [c.first_name, c.middle_name, c.last_name].filter(p => p != null).join(sep);
      }
      return { id: c.id, first_name: c.first_name, middle_name: c.middle_name, last_name: c.last_name, full_name: full };
    });
    ccRes.innerHTML = uTable(rows, ['id', 'first_name', 'middle_name', 'last_name', 'full_name']);
  }
  ccMode.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    ccMode.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    ccM = b.dataset.m; runConcat();
  }));
  ccSep.addEventListener('input', runConcat);
  runConcat();
}

// --- string lab ---
const labIn = document.getElementById('lab-in');
if (labIn) {
  const labOut = document.getElementById('lab-out');
  function runLab() {
    const s = labIn.value;
    const rows = [
      ['LOWER(s)', `[${s.toLowerCase()}]`],
      ['UPPER(s)', `[${s.toUpperCase()}]`],
      ['TRIM(s)', `[${s.trim()}]`],
      ['LTRIM(s)', `[${s.replace(/^\s+/, '')}]`],
      ['RTRIM(s)', `[${s.replace(/\s+$/, '')}]`],
      ['CHAR_LENGTH(s)', String([...s].length)],
      ['LENGTH(s) — bytes', String(new TextEncoder().encode(s).length)],
      ["REPLACE(s, ' ', '_')", `[${s.split(' ').join('_')}]`]
    ];
    let h = '<table class="rt"><thead><tr><th>function</th><th>result</th></tr></thead><tbody>';
    rows.forEach(r => h += `<tr><td class="mono">${r[0]}</td><td class="mono">${sfEsc(r[1])}</td></tr>`);
    h += '</tbody></table>';
    labOut.innerHTML = h;
  }
  labIn.addEventListener('input', runLab);
  runLab();
}

// --- slice ---
const slIn = document.getElementById('sl-in');
if (slIn) {
  const slLeft = document.getElementById('sl-left');
  const slRight = document.getElementById('sl-right');
  const slStart = document.getElementById('sl-start');
  const slLen = document.getElementById('sl-len');
  const slOut = document.getElementById('sl-out');
  function runSlice() {
    const arr = [...slIn.value];
    const ln = Math.max(0, +slLeft.value || 0);
    const rn = Math.max(0, +slRight.value || 0);
    const st = +slStart.value || 1;
    const len = +slLen.value || 0;
    const left = arr.slice(0, ln).join('');
    const right = rn === 0 ? '' : arr.slice(-rn).join('');
    const subFull = st >= 1 ? arr.slice(st - 1).join('') : '';
    const subLen = st >= 1 ? arr.slice(st - 1, st - 1 + len).join('') : '';
    const rows = [
      [`LEFT(s, ${ln})`, left],
      [`RIGHT(s, ${rn})`, right],
      [`SUBSTRING(s, ${st})`, subFull],
      [`SUBSTRING(s, ${st}, ${len})`, subLen]
    ];
    let h = '<table class="rt"><thead><tr><th>call</th><th>result</th></tr></thead><tbody>';
    rows.forEach(r => h += `<tr><td class="mono">${r[0]}</td><td class="mono">[${sfEsc(r[1])}]</td></tr>`);
    h += '</tbody></table>';
    slOut.innerHTML = h;
  }
  [slIn, slLeft, slRight, slStart, slLen].forEach(el => el.addEventListener('input', runSlice));
  runSlice();
}

// --- search (LOCATE / INSTR) ---
const seStr = document.getElementById('se-str');
if (seStr) {
  const seSub = document.getElementById('se-sub');
  const seOut = document.getElementById('se-out');
  function runSearch() {
    const str = seStr.value, sub = seSub.value;
    const i = sub === '' ? -1 : str.indexOf(sub);
    const pos = i < 0 ? 0 : i + 1;
    let highlighted = sfEsc(str);
    if (pos > 0) highlighted = sfEsc(str.slice(0, i)) + '<span class="hl-pos">' + sfEsc(str.slice(i, i + sub.length)) + '</span>' + sfEsc(str.slice(i + sub.length));
    seOut.innerHTML = `<code>LOCATE('${sfEsc(sub)}', str)</code> = <code>INSTR(str, '${sfEsc(sub)}')</code> = <strong>${pos}</strong>` +
      (pos > 0 ? ` &nbsp;·&nbsp; <span class="mono">${highlighted}</span>` : ` &nbsp;·&nbsp; <span class="muted">not found (0)</span>`);
  }
  [seStr, seSub].forEach(el => el.addEventListener('input', runSearch));
  runSearch();
}

// --- REPLACE ---
const rpStr = document.getElementById('rp-str');
if (rpStr) {
  const rpFind = document.getElementById('rp-find');
  const rpWith = document.getElementById('rp-with');
  const rpOut = document.getElementById('rp-out');
  const rpRes = document.getElementById('rp-res');
  function runReplace() {
    const s = rpStr.value, f = rpFind.value, w = rpWith.value;
    const result = f === '' ? s : s.split(f).join(w);
    rpOut.textContent = `REPLACE('${s}', '${f}', '${w}')`;
    rpRes.innerHTML = `→ <span class="mono">${sfEsc(result)}</span>`;
  }
  [rpStr, rpFind, rpWith].forEach(el => el.addEventListener('input', runReplace));
  runReplace();
}

// --- predict the output ---
buildClassify('sf-predict', 'sf-predict-score', [
  { label: 'Returns?', prompt: "LEFT('plus_user', 3)", code: true, options: [opt('plu', true), opt('plus'), opt('lus'), opt('user')], why: "First 3 characters → 'plu'." },
  { label: 'Returns?', prompt: "RIGHT('plus_user', 4)", code: true, options: [opt('user', true), opt('_use'), opt('plus'), opt('ser')], why: "Last 4 characters → 'user'." },
  { label: 'Returns?', prompt: "SUBSTRING('plus_user', 3, 2)", code: true, options: [opt('us', true), opt('lu'), opt('us_'), opt('ps')], why: "Start at position 3 (1-based), take 2 chars → 'us'." },
  { label: 'Returns?', prompt: "LOCATE('@', 'Raj@gmail.com')", code: true, options: [optN(4, true), optN(3), optN(0), optN(5)], why: "@ is the 4th character (1-based)." },
  { label: 'Returns?', prompt: "CHAR_LENGTH('😀')", code: true, options: [optN(1, true), optN(4), optN(2), optN(0)], why: "1 visible character (LENGTH would be 4 bytes)." },
  { label: 'Returns?', prompt: "CONCAT('Hello', NULL, 'Raj')", code: true, options: [opt('NULL', true), opt('HelloRaj'), opt('Hello Raj'), opt('HelloNULLRaj')], why: "CONCAT returns NULL if any argument is NULL." },
  { label: 'Returns?', prompt: "REPLACE('a_b_c', '_', '-')", code: true, options: [opt('a-b-c', true), opt('a_b_c'), opt('a-b_c'), opt('abc')], why: "Every '_' becomes '-' → 'a-b-c'." }
]);

// ============ MODULE 10: EDITING DATA & TABLES ============
const ED_TODAY = '2026-06-13';
const EMP_BASE = [
  { emp_id: 301, name: 'Neha Sharma', department: 'Sales', salary: 55000, hire_date: '2024-03-11', is_active: true },
  { emp_id: 302, name: 'Ishan Gupta', department: 'Engineering', salary: 110000, hire_date: '2023-08-20', is_active: true },
  { emp_id: 303, name: 'Priya Singh', department: 'Support', salary: 45000, hire_date: '2024-07-01', is_active: true },
  { emp_id: 304, name: 'Karan Joshi', department: 'Engineering', salary: 95000, hire_date: '2022-02-14', is_active: false },
  { emp_id: 305, name: 'Meera Nair', department: '', salary: 50000, hire_date: '2025-03-01', is_active: true },
  { emp_id: 306, name: 'Omar Farooq', department: null, salary: 62000, hire_date: '2025-04-18', is_active: true },
  { emp_id: 307, name: 'Ananya Das', department: 'Finance', salary: 72000, hire_date: '2024-10-05', is_active: true }
];
const ED_BASE_COLS = ['emp_id', 'name', 'department', 'salary', 'hire_date', 'is_active'];
let empCols = [...ED_BASE_COLS];
let emp = [];

function edCell(col, v) {
  if (v === null || v === undefined) return '<span class="cell-null">NULL</span>';
  if (v === '') return '<span class="cell-null">(empty)</span>';
  if (col === 'is_active') return v ? 'TRUE' : 'FALSE';
  if (col === 'salary') return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v;
}
function renderSandbox() {
  let h;
  if (!emp.length) {
    h = '<div class="muted" style="padding:10px 0;">No rows — the table is empty (structure intact).</div>';
  } else {
    h = '<table class="rt"><thead><tr>' + empCols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    emp.forEach(r => { h += '<tr>' + empCols.map(c => `<td>${edCell(c, r[c])}</td>`).join('') + '</tr>'; });
    h += '</tbody></table>';
  }
  document.querySelectorAll('.sandbox-view').forEach(el => el.innerHTML = h);
}
function resetSandbox() {
  empCols = [...ED_BASE_COLS];
  emp = EMP_BASE.map(r => ({ ...r }));
  renderSandbox();
}
const edSandboxExists = document.querySelector('.sandbox-view');
if (edSandboxExists) {
  resetSandbox();
  document.querySelectorAll('.ed-reset').forEach(b => b.addEventListener('click', () => {
    resetSandbox();
    document.querySelectorAll('#ins-msg, #up-msg, #upd-msg, #del-msg, #alt-msg').forEach(m => { m.textContent = ''; });
  }));

  // INSERT
  const insBtn = document.getElementById('ins-btn');
  if (insBtn) {
    const insMsg = document.getElementById('ins-msg');
    insBtn.addEventListener('click', () => {
      const id = parseInt(document.getElementById('ins-id').value, 10);
      const name = document.getElementById('ins-name').value.trim();
      const dept = document.getElementById('ins-dept').value;
      const sal = parseFloat(document.getElementById('ins-sal').value);
      if (!id || !name || isNaN(sal)) { insMsg.innerHTML = '<span style="color:var(--danger)">Need emp_id, name and salary.</span>'; return; }
      if (emp.some(r => r.emp_id === id)) { insMsg.innerHTML = `<span style="color:var(--danger)">ERROR 1062: Duplicate entry '${id}' for key PRIMARY.</span>`; return; }
      const row = {}; empCols.forEach(c => row[c] = null);
      row.emp_id = id; row.name = name; row.department = dept.trim() === '' ? null : dept;
      row.salary = sal; row.hire_date = ED_TODAY; row.is_active = true;
      emp.push(row);
      insMsg.innerHTML = `<span style="color:var(--success)">1 row inserted (emp_id ${id}).</span>`;
      renderSandbox();
    });
  }

  // UPSERT
  const upBtn = document.getElementById('up-btn');
  if (upBtn) {
    const upMode = document.getElementById('up-mode');
    const upMsg = document.getElementById('up-msg');
    const upOut = document.getElementById('up-out');
    let upM = 'update';
    function paintUpsert() {
      const id = document.getElementById('up-id').value, name = document.getElementById('up-name').value, dept = document.getElementById('up-dept').value, sal = document.getElementById('up-sal').value;
      upOut.textContent = upM === 'update'
        ? `INSERT INTO employees (emp_id, name, department, salary, hire_date)\nVALUES (${id}, '${name}', '${dept}', ${sal}, '${ED_TODAY}')\nON DUPLICATE KEY UPDATE name=VALUES(name), department=VALUES(department), salary=VALUES(salary);`
        : `INSERT IGNORE INTO employees (emp_id, name, department, salary, hire_date)\nVALUES (${id}, '${name}', '${dept}', ${sal}, '${ED_TODAY}');`;
    }
    upMode.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
      upMode.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
      upM = b.dataset.m; paintUpsert();
    }));
    ['up-id', 'up-name', 'up-dept', 'up-sal'].forEach(i => document.getElementById(i).addEventListener('input', paintUpsert));
    upBtn.addEventListener('click', () => {
      const id = parseInt(document.getElementById('up-id').value, 10);
      const name = document.getElementById('up-name').value, dept = document.getElementById('up-dept').value, sal = parseFloat(document.getElementById('up-sal').value);
      const existing = emp.find(r => r.emp_id === id);
      if (existing) {
        if (upM === 'update') {
          existing.name = name; existing.department = dept; existing.salary = sal;
          upMsg.innerHTML = `<span style="color:var(--warning)">Conflict on ${id} → existing row UPDATED.</span>`;
        } else {
          upMsg.innerHTML = `<span style="color:var(--info)">Conflict on ${id} → IGNORED, nothing changed.</span>`;
        }
      } else {
        const row = {}; empCols.forEach(c => row[c] = null);
        row.emp_id = id; row.name = name; row.department = dept === '' ? null : dept; row.salary = sal; row.hire_date = ED_TODAY; row.is_active = true;
        emp.push(row);
        upMsg.innerHTML = `<span style="color:var(--success)">No conflict on ${id} → new row INSERTED.</span>`;
      }
      renderSandbox();
    });
    paintUpsert();
  }

  // UPDATE
  const updBtn = document.getElementById('upd-btn');
  if (updBtn) {
    const updCol = document.getElementById('upd-col'), updVal = document.getElementById('upd-val'), updMul = document.getElementById('upd-mul');
    const updWhere = document.getElementById('upd-where'), updWval = document.getElementById('upd-wval');
    const updOut = document.getElementById('upd-out'), updMsg = document.getElementById('upd-msg');
    function predicate() {
      const w = updWhere.value, v = updWval.value;
      if (w === 'all') return () => true;
      if (w === 'id') return r => r.emp_id === parseInt(v, 10);
      if (w === 'sallt') return r => r.salary < parseFloat(v);
      if (w === 'hire') return r => r.hire_date >= v;
      return () => false;
    }
    function whereSql() {
      const w = updWhere.value, v = updWval.value;
      if (w === 'all') return '';
      if (w === 'id') return `\nWHERE emp_id = ${v}`;
      if (w === 'sallt') return `\nWHERE salary < ${v}`;
      if (w === 'hire') return `\nWHERE hire_date >= '${v}'`;
      return '';
    }
    function paintUpd() {
      const col = updCol.value, val = updVal.value;
      const setExpr = (col === 'salary' && updMul.checked) ? `salary = salary * ${val}` : `${col} = ${col === 'salary' || col === 'is_active' ? val : `'${val}'`}`;
      updOut.textContent = `UPDATE employees\nSET ${setExpr}${whereSql()};`;
    }
    updBtn.addEventListener('click', () => {
      const col = updCol.value, val = updVal.value, pred = predicate();
      let n = 0;
      emp.forEach(r => {
        if (!pred(r)) return;
        if (col === 'salary' && updMul.checked) r.salary = Math.round(r.salary * parseFloat(val) * 100) / 100;
        else if (col === 'salary') r.salary = parseFloat(val);
        else if (col === 'is_active') r.is_active = (val === 'TRUE' || val === 'true' || val === '1');
        else r[col] = val;
        n++;
      });
      const warn = updWhere.value === 'all' ? ' <span style="color:var(--danger)">⚠ global update — every row changed!</span>' : '';
      updMsg.innerHTML = `<span style="color:var(--success)">${n} row${n === 1 ? '' : 's'} updated.</span>${warn}`;
      renderSandbox();
    });
    [updCol, updVal, updMul, updWhere, updWval].forEach(el => el.addEventListener('input', paintUpd));
    [updCol, updWhere, updMul].forEach(el => el.addEventListener('change', paintUpd));
    paintUpd();
  }

  // DELETE & TRUNCATE
  const delBtn = document.getElementById('del-btn');
  if (delBtn) {
    const delWhere = document.getElementById('del-where'), delVal = document.getElementById('del-val');
    const delOut = document.getElementById('del-out'), delMsg = document.getElementById('del-msg');
    function paintDel() {
      const w = delWhere.value, v = delVal.value;
      delOut.textContent = w === 'all' ? 'DELETE FROM employees;'
        : w === 'in' ? `DELETE FROM employees\nWHERE emp_id IN (${v});`
        : `DELETE FROM employees\nWHERE emp_id = ${v};`;
    }
    delBtn.addEventListener('click', () => {
      const w = delWhere.value, v = delVal.value;
      const before = emp.length;
      if (w === 'all') emp = [];
      else if (w === 'in') { const ids = v.split(',').map(x => parseInt(x.trim(), 10)); emp = emp.filter(r => !ids.includes(r.emp_id)); }
      else { const id = parseInt(v, 10); emp = emp.filter(r => r.emp_id !== id); }
      const n = before - emp.length;
      const warn = w === 'all' ? ' <span style="color:var(--danger)">⚠ all rows deleted!</span>' : '';
      delMsg.innerHTML = `<span style="color:var(--success)">${n} row${n === 1 ? '' : 's'} deleted.</span>${warn}`;
      renderSandbox();
    });
    document.getElementById('trunc-btn').addEventListener('click', () => {
      emp = [];
      delOut.textContent = 'TRUNCATE TABLE employees;';
      delMsg.innerHTML = '<span style="color:var(--warning)">Table truncated — all rows wiped, structure kept.</span>';
      renderSandbox();
    });
    [delWhere, delVal].forEach(el => el.addEventListener('input', paintDel));
    delWhere.addEventListener('change', paintDel);
    paintDel();
  }

  // ALTER
  const altAdd = document.getElementById('alt-add');
  if (altAdd) {
    const altCol = document.getElementById('alt-col'), altFill = document.getElementById('alt-fill'), altOut = document.getElementById('alt-out'), altMsg = document.getElementById('alt-msg');
    altAdd.addEventListener('click', () => {
      const c = altCol.value.trim();
      if (!c) return;
      if (empCols.includes(c)) { altMsg.innerHTML = `<span style="color:var(--danger)">Column '${c}' already exists.</span>`; return; }
      empCols.push(c); emp.forEach(r => r[c] = null);
      altOut.textContent = `ALTER TABLE employees ADD COLUMN ${c} INT;`;
      altMsg.innerHTML = `<span style="color:var(--success)">Column '${c}' added (NULL for existing rows).</span>`;
      renderSandbox();
    });
    document.getElementById('alt-backfill').addEventListener('click', () => {
      const c = altCol.value.trim(), v = altFill.value;
      if (!empCols.includes(c) || ED_BASE_COLS.includes(c)) { altMsg.innerHTML = `<span style="color:var(--danger)">Add a custom column first.</span>`; return; }
      emp.forEach(r => r[c] = v);
      altOut.textContent = `UPDATE employees SET ${c} = ${v};`;
      altMsg.innerHTML = `<span style="color:var(--success)">Backfilled '${c}' for ${emp.length} rows.</span>`;
      renderSandbox();
    });
    document.getElementById('alt-drop').addEventListener('click', () => {
      const c = altCol.value.trim();
      if (ED_BASE_COLS.includes(c)) { altMsg.innerHTML = `<span style="color:var(--danger)">Won't drop a base column in this sandbox.</span>`; return; }
      if (!empCols.includes(c)) { altMsg.innerHTML = `<span style="color:var(--danger)">No such column.</span>`; return; }
      empCols = empCols.filter(x => x !== c); emp.forEach(r => delete r[c]);
      altOut.textContent = `ALTER TABLE employees DROP COLUMN ${c};`;
      altMsg.innerHTML = `<span style="color:var(--warning)">Column '${c}' dropped — its data is gone.</span>`;
      renderSandbox();
    });
  }
}

// AUTO_INCREMENT demo
const aiTable = document.getElementById('ai-table');
if (aiTable) {
  const AI_BASE = [{ id: 1, name: 'Aisha' }, { id: 2, name: 'Rohan' }, { id: 3, name: 'Meera' }];
  const aiNextEl = document.getElementById('ai-next');
  let aiRows = [], aiNext = 4;
  function renderAI() {
    aiTable.innerHTML = uTable(aiRows, ['id', 'name']);
    aiNextEl.innerHTML = `next <code>AUTO_INCREMENT</code> = <strong>${aiNext}</strong>`;
  }
  function resetAI() { aiRows = AI_BASE.map(r => ({ ...r })); aiNext = 4; renderAI(); }
  document.getElementById('ai-delete').addEventListener('click', () => {
    aiRows = [];                       // DELETE keeps the counter
    aiRows.push({ id: aiNext, name: 'Raj' });
    aiNext++;
    renderAI();
  });
  document.getElementById('ai-truncate').addEventListener('click', () => {
    aiRows = []; aiNext = 1;           // TRUNCATE resets the counter
    aiRows.push({ id: aiNext, name: 'Raj' });
    aiNext++;
    renderAI();
  });
  document.getElementById('ai-reset').addEventListener('click', resetAI);
  resetAI();
}

// command game
buildClassify('ed-cmdgame', 'ed-cmdscore', [
  { label: 'Goal', prompt: "Remove employees in dept 'HR' (keep the rest)", options: [opt('DELETE … WHERE', true), opt('TRUNCATE'), opt('DROP'), opt('UPDATE')], why: "DELETE with a WHERE removes only matching rows." },
  { label: 'Goal', prompt: 'Empty a test table fast, keep the structure', options: [opt('DELETE'), opt('TRUNCATE', true), opt('DROP'), opt('ALTER')], why: "TRUNCATE bulk-wipes all rows quickly; the table stays." },
  { label: 'Goal', prompt: 'Remove the entire table — rows and structure', options: [opt('DELETE'), opt('TRUNCATE'), opt('DROP', true), opt('UPDATE')], why: "DROP deletes the whole table object." },
  { label: 'Goal', prompt: "Insert if new, otherwise update the existing row", options: [opt('UPSERT (ON DUPLICATE KEY)', true), opt('INSERT'), opt('UPDATE'), opt('DELETE')], why: "UPSERT handles both in one atomic step." },
  { label: 'Goal', prompt: 'Give everyone hired in 2024+ a 50% raise', options: [opt('UPDATE … WHERE', true), opt('ALTER'), opt('INSERT'), opt('TRUNCATE')], why: "UPDATE with a WHERE and salary = salary * 1.5." },
  { label: 'Goal', prompt: 'Add a new column to the table', options: [opt('ALTER … ADD COLUMN', true), opt('UPDATE'), opt('INSERT'), opt('UPSERT')], why: "ALTER changes the table structure." }
]);

// ============ QUERY LIFECYCLE ANIMATION ============
const lifeBtn = document.getElementById('run-lifecycle');
if (lifeBtn) {
  const stages = ['ps-parse', 'ps-plan', 'ps-exec'].map(id => document.getElementById(id));
  const statusEl = document.getElementById('lifecycle-status');
  const texts = [
    'Parse — checking syntax… does customers exist? do name, email, city exist?',
    'Plan — is there an index on city? If yes, index scan. If no, full table scan.',
    'Execute — reading matching rows, picking name + email, building the result.'
  ];
  let lifeRunning = false;
  lifeBtn.addEventListener('click', async () => {
    if (lifeRunning) return;
    lifeRunning = true;
    stages.forEach(s => s.classList.remove('active', 'done'));
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < stages.length; i++) {
      stages[i].classList.add('active');
      statusEl.textContent = texts[i];
      await sleep(1100);
      stages[i].classList.remove('active');
      stages[i].classList.add('done');
    }
    statusEl.innerHTML = '<span class="ok">Done.</span> Result set returned to your tool / app.';
    const r = statusEl.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + 10);
    lifeRunning = false;
  });
}

// ============ MODULE 11: MERGING QUERY RESULTS ============
const mgDelhi = [
  { name: 'Raj Patel', role: 'Developer' },
  { name: 'Neha Sharma', role: 'Manager' },
  { name: 'Amit Kumar', role: 'QA' }
];
const mgMumbai = [
  { name: 'Sana Khan', role: 'Developer' },
  { name: 'Neha Sharma', role: 'Manager' },
  { name: 'Rahul Mehta', role: 'Sales' }
];
const mgOnline = [
  { item_name: 'Laptop', price: 50000 },
  { item_name: 'Mouse', price: 500 },
  { item_name: 'Keyboard', price: 1200 }
];
const mgShop = [
  { item_name: 'Mouse', price: 500 },
  { item_name: 'Monitor', price: 15000 }
];

// source tables
const mgDelhiSrc = document.getElementById('mg-delhi-src');
if (mgDelhiSrc) {
  mgDelhiSrc.innerHTML = uTable(mgDelhi, ['name', 'role']);
  document.getElementById('mg-mumbai-src').innerHTML = uTable(mgMumbai, ['name', 'role']);
  document.getElementById('mg-online-src').innerHTML = uTable(mgOnline, ['item_name', 'price']);
  document.getElementById('mg-shop-src').innerHTML = uTable(mgShop, ['item_name', 'price']);
}

// --- merge lab ---
const mgModeSeg = document.getElementById('mg-mode');
if (mgModeSeg) {
  const mgCols = document.getElementById('mg-cols');
  const mgOut = document.getElementById('mg-out');
  const mgRes = document.getElementById('mg-res');
  const mgNote = document.getElementById('mg-note');
  let mgMode = 'union';
  function runMerge() {
    const cols = mgCols.value.split(',');
    const combined = [
      ...mgDelhi.map(r => ({ ...r, _src: 'delhi_staff' })),
      ...mgMumbai.map(r => ({ ...r, _src: 'mumbai_staff' }))
    ];
    const seen = new Set();
    let removed = 0;
    const rows = combined.map(r => {
      const key = cols.map(c => r[c]).join('');
      let kept = true;
      if (mgMode === 'union') {
        if (seen.has(key)) { kept = false; removed++; }
        else seen.add(key);
      }
      return { ...r, _kept: kept };
    });
    const colSql = cols.join(', ');
    const op = mgMode === 'union' ? 'UNION' : 'UNION ALL';
    mgOut.textContent = `SELECT ${colSql} FROM delhi_staff\n${op}\nSELECT ${colSql} FROM mumbai_staff;`;
    let h = '<table class="rt"><thead><tr>';
    cols.forEach(c => h += `<th>${c}</th>`);
    h += '<th>source</th></tr></thead><tbody>';
    rows.forEach(r => {
      h += `<tr class="${r._kept ? '' : 'row-removed'}">`;
      cols.forEach(c => h += `<td>${uCell(r[c])}</td>`);
      h += `<td class="src-cell">${r._src}</td></tr>`;
    });
    h += '</tbody></table>';
    mgRes.innerHTML = h;
    if (mgMode === 'union') {
      mgNote.innerHTML = removed
        ? `<span class="ok">UNION</span> removed <strong>${removed}</strong> duplicate row${removed > 1 ? 's' : ''} → ${rows.length - removed} unique rows returned.`
        : `<span class="ok">UNION</span> found no duplicates on these columns → all ${rows.length} rows returned.`;
    } else {
      mgNote.innerHTML = `<span class="ok">UNION ALL</span> kept all <strong>${rows.length}</strong> rows — no comparison done.`;
    }
  }
  mgModeSeg.addEventListener('click', e => {
    const b = e.target.closest('.seg-btn');
    if (!b) return;
    mgMode = b.dataset.mode;
    [...mgModeSeg.children].forEach(c => c.classList.toggle('active', c === b));
    runMerge();
  });
  mgCols.addEventListener('change', runMerge);
  runMerge();
}

// --- revenue consolidation ---
const mgRevSeg = document.getElementById('mg-rev-mode');
if (mgRevSeg) {
  const mgRevOut = document.getElementById('mg-rev-out');
  const mgRevRes = document.getElementById('mg-rev-res');
  const mgRevTotal = document.getElementById('mg-rev-total');
  let revMode = 'all';
  function runRev() {
    const combined = [...mgOnline, ...mgShop];
    let rows, removed = 0;
    if (revMode === 'union') {
      const seen = new Set();
      rows = combined.filter(r => {
        const key = r.item_name + '' + r.price;
        if (seen.has(key)) { removed++; return false; }
        seen.add(key); return true;
      });
    } else {
      rows = combined;
    }
    const op = revMode === 'union' ? 'UNION' : 'UNION ALL';
    mgRevOut.textContent = `SELECT SUM(price) AS total_revenue FROM (\n    SELECT item_name, price FROM online_sales\n    ${op}\n    SELECT item_name, price FROM shop_sales\n) AS combined;`;
    mgRevRes.innerHTML = uTable(rows, ['item_name', 'price']);
    const total = rows.reduce((t, r) => t + r.price, 0);
    if (revMode === 'union') {
      mgRevTotal.innerHTML = `total_revenue = <strong>₹${total.toLocaleString('en-IN')}</strong> — <span class="bad">wrong!</span> UNION deleted ${removed} real sale${removed > 1 ? 's' : ''} (the second Mouse), undercounting revenue.`;
    } else {
      mgRevTotal.innerHTML = `total_revenue = <strong>₹${total.toLocaleString('en-IN')}</strong> — <span class="ok">correct.</span> Every transaction counted, including both Mouse sales.`;
    }
  }
  mgRevSeg.addEventListener('click', e => {
    const b = e.target.closest('.seg-btn');
    if (!b) return;
    revMode = b.dataset.mode;
    [...mgRevSeg.children].forEach(c => c.classList.toggle('active', c === b));
    runRev();
  });
  runRev();
}

// --- set explorer ---
const mgSetOp = document.getElementById('mg-set-op');
if (mgSetOp) {
  const setStore = ['Raj', 'Neha', 'Sana'];
  const setOnline = ['Raj', 'Amit', 'Sana'];
  const both = setStore.filter(n => setOnline.includes(n));
  const onlyA = setStore.filter(n => !setOnline.includes(n));
  const onlyB = setOnline.filter(n => !setStore.includes(n));
  document.getElementById('mg-bk-onlyA').textContent = onlyA.join(', ');
  document.getElementById('mg-bk-both').textContent = both.join(', ');
  document.getElementById('mg-bk-onlyB').textContent = onlyB.join(', ');
  const buckets = document.getElementById('mg-set-buckets');
  const setOut = document.getElementById('mg-set-out');
  const setRes = document.getElementById('mg-set-res');
  const SET_OPS = {
    union: { active: ['onlyA', 'both', 'onlyB'], rows: () => [...new Set([...setStore, ...setOnline])],
      sql: 'SELECT customer_name FROM store_customers\nUNION\nSELECT customer_name FROM online_customers;' },
    unionall: { active: ['onlyA', 'both', 'onlyB'], rows: () => [...setStore, ...setOnline],
      sql: 'SELECT customer_name FROM store_customers\nUNION ALL\nSELECT customer_name FROM online_customers;' },
    intersect: { active: ['both'], rows: () => both.slice(),
      sql: 'SELECT customer_name FROM store_customers\nINTERSECT\nSELECT customer_name FROM online_customers;' },
    except_ab: { active: ['onlyA'], rows: () => onlyA.slice(),
      sql: 'SELECT customer_name FROM store_customers\nEXCEPT\nSELECT customer_name FROM online_customers;' },
    except_ba: { active: ['onlyB'], rows: () => onlyB.slice(),
      sql: 'SELECT customer_name FROM online_customers\nEXCEPT\nSELECT customer_name FROM store_customers;' }
  };
  function runSet() {
    const op = SET_OPS[mgSetOp.value];
    [...buckets.children].forEach(b => b.classList.toggle('active', op.active.includes(b.dataset.bucket)));
    setOut.textContent = op.sql;
    setRes.innerHTML = uTable(op.rows().map(n => ({ customer_name: n })), ['customer_name']);
  }
  mgSetOp.addEventListener('change', runSet);
  runSet();
}

// --- capstone: UNION or UNION ALL? ---
buildClassify('mg-pick', 'mg-pick-score', [
  { label: 'Goal', prompt: 'Build a mailing list of unique subscribers across two tables', options: [opt('UNION', true), opt('UNION ALL')], why: "UNION — you must not email the same person twice." },
  { label: 'Goal', prompt: 'Total revenue for finance — sum every transaction', options: [opt('UNION'), opt('UNION ALL', true)], why: "UNION ALL — every sale must count, even identical ones." },
  { label: 'Goal', prompt: 'Combine orders_2023 and orders_2024 (no overlap possible)', options: [opt('UNION'), opt('UNION ALL', true)], why: "UNION ALL — duplicates are impossible, so skip the costly sort." },
  { label: 'Goal', prompt: 'Audit log: every login attempt from web + mobile servers', options: [opt('UNION'), opt('UNION ALL', true)], why: "UNION ALL — each attempt matters, even if it looks identical." },
  { label: 'Goal', prompt: 'One clean list of all distinct cities your offices are in', options: [opt('UNION', true), opt('UNION ALL')], why: "UNION — you want each city listed once." }
]);

// --- capstone: predict the result ---
buildClassify('mg-predict', 'mg-predict-score', [
  { label: 'A=[X,Y] B=[Y,Z]', prompt: 'How many rows does <span class="mono">A UNION B</span> return?', code: true, options: [optN(3, true), optN(4), optN(2), optN(1)], why: "X, Y, Z — the duplicate Y collapses to one → 3 rows." },
  { label: 'A=[X,Y] B=[Y,Z]', prompt: 'How many rows does <span class="mono">A UNION ALL B</span> return?', code: true, options: [optN(4, true), optN(3), optN(2), optN(6)], why: "All 4 rows kept: X, Y, Y, Z." },
  { label: 'A=[X,Y] B=[Y,Z]', prompt: 'How many rows does <span class="mono">A INTERSECT B</span> return?', code: true, options: [optN(1, true), optN(2), optN(3), optN(0)], why: "Only Y is in both lists → 1 row." },
  { label: 'A=[X,Y] B=[Y,Z]', prompt: 'Manual intersect via UNION ALL + GROUP BY + HAVING COUNT(*) — result?', options: [opt('Y', true), opt('X, Z'), opt('X, Y, Z'), opt('nothing')], why: "Only Y appears twice in the stacked list → HAVING COUNT(*)>1 keeps Y." },
  { label: 'Trap', prompt: 'You build the manual intersect but use plain UNION (not ALL). Result?', options: [opt('Empty — every count is 1', true), opt('Y'), opt('X, Y, Z'), opt('An error')], why: "UNION dedupes first, so no name ever counts >1 → intersection silently fails." }
]);

// ============ MODULE 12: JOINS DEEP DIVE ============
const joinCustomers = [
  { customer_id: 101, name: 'Aisha', email: 'aisha@demo.com', city: 'Delhi' },
  { customer_id: 102, name: 'Rohan', email: 'rohan@demo.com', city: 'Mumbai' },
  { customer_id: 103, name: 'Meera', email: 'meera@demo.com', city: null },
  { customer_id: 104, name: 'Arjun', email: 'arjun@demo.com', city: 'Delhi' },
  { customer_id: 106, name: 'Neha', email: 'neha@demo.com', city: 'Pune' },
  { customer_id: 107, name: 'Ishaan', email: 'ishaan@demo.com', city: 'Bengaluru' },
  { customer_id: 108, name: 'Riya', email: null, city: 'Delhi' },
  { customer_id: 109, name: 'Aisha', email: 'aisha2@demo.com', city: 'Jaipur' }
];
const joinOrders = [
  { order_id: 1, customer_id: 101, order_code: 'A', status: 'PAID', total_amount: 499.00 },
  { order_id: 2, customer_id: 102, order_code: 'B', status: 'PAID', total_amount: 299.00 },
  { order_id: 3, customer_id: 105, order_code: 'C', status: 'PAID', total_amount: 199.00 },
  { order_id: 4, customer_id: 101, order_code: 'D', status: 'CANCELLED', total_amount: 999.00 },
  { order_id: 5, customer_id: 106, order_code: 'E', status: 'PAID', total_amount: 799.00 },
  { order_id: 6, customer_id: 106, order_code: 'F', status: 'PENDING', total_amount: 149.00 },
  { order_id: 7, customer_id: null, order_code: 'G', status: 'PAID', total_amount: 249.00 },
  { order_id: 8, customer_id: 999, order_code: 'H', status: 'PAID', total_amount: 129.00 }
];
const joinEmployees = [
  { emp_id: 1, emp_name: 'Kriti', manager_id: null },
  { emp_id: 2, emp_name: 'Siddhant', manager_id: 1 },
  { emp_id: 3, emp_name: 'Anamika', manager_id: 1 },
  { emp_id: 4, emp_name: 'Utkarsh', manager_id: 2 },
  { emp_id: 5, emp_name: 'Ronit', manager_id: 2 },
  { emp_id: 6, emp_name: 'Shivi', manager_id: 3 }
];
const joinLoyalty = [
  { customer_id: 101, tier: 'GOLD' }, { customer_id: 102, tier: 'SILVER' },
  { customer_id: 104, tier: 'BRONZE' }, { customer_id: 106, tier: 'GOLD' },
  { customer_id: 201, tier: 'PINNACLE' }
];
const joinStudents = [
  { student_id: 1, name: 'Aisha' }, { student_id: 2, name: 'Ravi' },
  { student_id: 3, name: 'Neha' }, { student_id: null, name: 'Raj' }
];
const joinPayments = [
  { student_id: 1, amount: 500 }, { student_id: 2, amount: 700 }, { student_id: 4, amount: 800 }
];
const joinStoreLoc = [
  { customer_id: 101, city: 'Delhi', store_name: 'North Hub' },
  { customer_id: 102, city: 'Pune', store_name: 'West Hub' }
];
const joinCrossDemos = {
  catalog: { lcol: 'color_name', left: ['Red', 'Blue'], rcol: 'size_code', right: ['S', 'M', 'L'],
    from: 'colors c', join: 'sizes s', sel: 'c.color_name, s.size_code' },
  grid: { lcol: 'store_name', left: ['Delhi Central', 'Mumbai Hub'], rcol: 'month_name', right: ['January', 'February'],
    from: 'stores s', join: 'months m', sel: 's.store_name, m.month_name' },
  schedule: { lcol: 'teacher_name', left: ['Mr. Raj', 'Ms. Neha'], rcol: 'start_time', right: ['09:00 AM', '10:00 AM'],
    from: 'teachers t', join: 'slots sl', sel: 't.teacher_name, sl.start_time' }
};

// source tables
const jnCustSrc = document.getElementById('jn-cust-src');
if (jnCustSrc) {
  jnCustSrc.innerHTML = uTable(joinCustomers, ['customer_id', 'name', 'email', 'city']);
  document.getElementById('jn-ord-src').innerHTML =
    uTable(joinOrders, ['order_id', 'customer_id', 'order_code', 'status', 'total_amount']);
}

// shared row builder: pair a customer row with an order row (either may be null)
function jnPair(c, o) {
  return {
    customer_id: c ? c.customer_id : null,
    name: c ? c.name : null,
    city: c ? c.city : null,
    order_id: o ? o.order_id : null,
    order_code: o ? o.order_code : null,
    status: o ? o.status : null,
    total_amount: o ? o.total_amount : null
  };
}
const jnCustById = id => joinCustomers.find(c => c.customer_id === id) || null;

// --- join visualizer ---
const jnType = document.getElementById('jn-type');
if (jnType) {
  const jnOut = document.getElementById('jn-out');
  const jnRes = document.getElementById('jn-res');
  const jnNote = document.getElementById('jn-note');
  const cols = ['customer_id', 'name', 'city', 'order_id', 'order_code', 'status'];

  const JOINS = {
    inner: {
      sql: 'SELECT c.customer_id, c.name, c.city, o.order_id, o.order_code, o.status\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id;',
      rows: () => joinOrders.map(o => jnCustById(o.customer_id) && jnPair(jnCustById(o.customer_id), o)).filter(Boolean),
      note: r => `<span class="ok">INNER</span> kept only the <strong>${r.length}</strong> matched pairs — unmatched orders (105, 999, NULL) and order-less customers all dropped.`
    },
    left: {
      sql: 'SELECT c.customer_id, c.name, c.city, o.order_id, o.order_code, o.status\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;',
      rows: () => {
        const out = [];
        joinCustomers.forEach(c => {
          const m = joinOrders.filter(o => o.customer_id === c.customer_id);
          if (m.length) m.forEach(o => out.push(jnPair(c, o)));
          else out.push(jnPair(c, null));
        });
        return out;
      },
      note: r => `<span class="ok">LEFT</span> kept all <strong>8 customers</strong>. Those with no order show NULL on the order side → ${r.length} rows total.`
    },
    right: {
      sql: 'SELECT c.customer_id, c.name, c.city, o.order_id, o.order_code, o.status\nFROM customers c\nRIGHT JOIN orders o ON c.customer_id = o.customer_id;',
      rows: () => joinOrders.map(o => jnPair(jnCustById(o.customer_id), o)),
      note: r => `<span class="ok">RIGHT</span> kept all <strong>8 orders</strong>. Orders 3, 7, 8 have no matching customer → NULL on the customer side.`
    },
    full: {
      sql: 'SELECT c.customer_id, c.name, c.city, o.order_id, o.order_code, o.status\nFROM customers c\nFULL OUTER JOIN orders o ON c.customer_id = o.customer_id;\n-- MySQL: emulate with LEFT JOIN  UNION  RIGHT JOIN',
      rows: () => {
        const out = [];
        joinCustomers.forEach(c => {
          const m = joinOrders.filter(o => o.customer_id === c.customer_id);
          if (m.length) m.forEach(o => out.push(jnPair(c, o)));
          else out.push(jnPair(c, null));
        });
        joinOrders.forEach(o => { if (!jnCustById(o.customer_id)) out.push(jnPair(null, o)); });
        return out;
      },
      note: r => `<span class="ok">FULL OUTER</span> keeps both sides: order-less customers AND customer-less orders → ${r.length} rows. MySQL has no FULL OUTER — you stitch it from LEFT + RIGHT with UNION.`
    },
    cross: {
      sql: 'SELECT c.customer_id, c.name, o.order_id, o.order_code\nFROM customers c\nCROSS JOIN orders o;   -- no ON condition',
      rows: () => { const out = []; joinCustomers.forEach(c => joinOrders.forEach(o => out.push(jnPair(c, o)))); return out; },
      note: r => `<span class="warn">CROSS</span> pairs every customer with every order: 8 × 8 = <strong>${r.length}</strong> rows. No matching, no ON — combinations only.`
    }
  };

  function runJoin() {
    const j = JOINS[jnType.value];
    const rows = j.rows();
    jnOut.textContent = j.sql;
    jnRes.innerHTML = uTable(rows, cols);
    jnNote.innerHTML = j.note(rows);
  }
  jnType.addEventListener('change', runJoin);
  runJoin();
}

// --- inner-join aggregate ---
const jnAggRes = document.getElementById('jn-agg-res');
if (jnAggRes) {
  const rows = joinCustomers.map(c => {
    const m = joinOrders.filter(o => o.customer_id === c.customer_id);
    if (!m.length) return null;
    return {
      customer_id: c.customer_id, name: c.name,
      orders_count: m.length,
      revenue: m.reduce((t, o) => t + o.total_amount, 0)
    };
  }).filter(Boolean);
  jnAggRes.innerHTML = uTable(rows, ['customer_id', 'name', 'orders_count', 'revenue']);
}

// --- ON vs WHERE ---
const jnOwSeg = document.getElementById('jn-ow');
if (jnOwSeg) {
  const jnOwOut = document.getElementById('jn-ow-out');
  const jnOwRes = document.getElementById('jn-ow-res');
  const jnOwNote = document.getElementById('jn-ow-note');
  const cols = ['name', 'city', 'order_code', 'status', 'total_amount'];
  let owMode = 'on';
  function runOw() {
    let rows;
    if (owMode === 'on') {
      rows = [];
      joinCustomers.forEach(c => {
        const m = joinOrders.filter(o => o.customer_id === c.customer_id && o.status === 'PAID');
        if (m.length) m.forEach(o => rows.push(jnPair(c, o)));
        else rows.push(jnPair(c, null));
      });
      jnOwOut.textContent = "SELECT c.name, c.city, o.order_code, o.status, o.total_amount\nFROM customers c\nLEFT JOIN orders o\n  ON c.customer_id = o.customer_id\n  AND o.status = 'PAID';";
    } else {
      const full = [];
      joinCustomers.forEach(c => {
        const m = joinOrders.filter(o => o.customer_id === c.customer_id);
        if (m.length) m.forEach(o => full.push(jnPair(c, o)));
        else full.push(jnPair(c, null));
      });
      rows = full.filter(r => r.status === 'PAID');
      jnOwOut.textContent = "SELECT c.name, c.city, o.order_code, o.status, o.total_amount\nFROM customers c\nLEFT JOIN orders o\n  ON c.customer_id = o.customer_id\nWHERE o.status = 'PAID';";
    }
    jnOwRes.innerHTML = uTable(rows, cols);
    const kept = joinCustomers.filter(c => rows.some(r => r.name === c.name && r.city === c.city)).length;
    if (owMode === 'on') {
      jnOwNote.innerHTML = `<span class="ok">ON (soft filter)</span> → <strong>${rows.length} rows</strong>, all 8 customers preserved. Non-PAID orders just don't match, so those customers show NULL on the order side.`;
    } else {
      jnOwNote.innerHTML = `<span class="bad">WHERE (hard filter)</span> → only <strong>${rows.length} rows</strong>. Every order-less / non-PAID customer was deleted (NULL ≠ 'PAID'). The LEFT JOIN collapsed into an INNER JOIN.`;
    }
  }
  jnOwSeg.addEventListener('click', e => {
    const b = e.target.closest('.seg-btn');
    if (!b) return;
    owMode = b.dataset.mode;
    [...jnOwSeg.children].forEach(c => c.classList.toggle('active', c === b));
    runOw();
  });
  runOw();
}

// --- self join ---
const jnEmpSrc = document.getElementById('jn-emp-src');
if (jnEmpSrc) {
  jnEmpSrc.innerHTML = uTable(joinEmployees, ['emp_id', 'emp_name', 'manager_id']);
  const jnSelfPick = document.getElementById('jn-self-pick');
  const jnSelfOut = document.getElementById('jn-self-out');
  const jnSelfRes = document.getElementById('jn-self-res');
  const jnSelfNote = document.getElementById('jn-self-note');
  const empById = id => joinEmployees.find(e => e.emp_id === id) || null;

  const SELF = {
    mgr: {
      sql: 'SELECT e.emp_name AS employee, m.emp_name AS manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.emp_id\nORDER BY e.emp_id;',
      cols: ['employee', 'manager'],
      run: () => joinEmployees.filter(e => e.manager_id != null && empById(e.manager_id))
        .map(e => ({ employee: e.emp_name, manager: empById(e.manager_id).emp_name })),
      note: 'Kriti is excluded — her <code>manager_id</code> is NULL, so the default (INNER) JOIN finds no manager row.'
    },
    topboss: {
      sql: "SELECT e.emp_name AS employee, IFNULL(m.emp_name, 'No Manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id\nORDER BY e.emp_id;",
      cols: ['employee', 'manager'],
      run: () => joinEmployees.map(e => ({
        employee: e.emp_name,
        manager: (e.manager_id != null && empById(e.manager_id)) ? empById(e.manager_id).emp_name : 'No Manager'
      })),
      note: 'Switching to <code>LEFT JOIN</code> keeps Kriti — <code>IFNULL</code> labels her NULL manager as "No Manager". Now all 6 staff appear.'
    },
    reports: {
      sql: 'SELECT m.emp_name AS manager, COUNT(*) AS direct_reports\nFROM employees e\nJOIN employees m ON e.manager_id = m.emp_id\nGROUP BY m.emp_name\nORDER BY m.emp_name;',
      cols: ['manager', 'direct_reports'],
      run: () => {
        const counts = {};
        joinEmployees.forEach(e => {
          if (e.manager_id != null && empById(e.manager_id)) {
            const mgr = empById(e.manager_id).emp_name;
            counts[mgr] = (counts[mgr] || 0) + 1;
          }
        });
        return Object.keys(counts).sort().map(m => ({ manager: m, direct_reports: counts[m] }));
      },
      note: 'Kriti → 2 (Siddhant, Anamika) · Siddhant → 2 (Utkarsh, Ronit) · Anamika → 1 (Shivi).'
    },
    peers: {
      sql: 'SELECT e1.emp_name AS teammate_A, e2.emp_name AS teammate_B, e1.manager_id\nFROM employees e1\nJOIN employees e2\n  ON e1.manager_id = e2.manager_id\n  AND e1.emp_id < e2.emp_id;',
      cols: ['teammate_A', 'teammate_B', 'manager_id'],
      run: () => {
        const rows = [];
        joinEmployees.forEach(a => joinEmployees.forEach(b => {
          if (a.manager_id != null && a.manager_id === b.manager_id && a.emp_id < b.emp_id) {
            rows.push({ teammate_A: a.emp_name, teammate_B: b.emp_name, manager_id: a.manager_id });
          }
        }));
        return rows;
      },
      note: 'Match on the same <code>manager_id</code>; <code>e1.emp_id &lt; e2.emp_id</code> stops self-pairs and mirror duplicates.'
    },
    grand: {
      sql: 'SELECT e.emp_name AS staff, m.emp_name AS manager, gm.emp_name AS grand_manager\nFROM employees e\nJOIN employees m ON e.manager_id = m.emp_id\nJOIN employees gm ON m.manager_id = gm.emp_id;',
      cols: ['staff', 'manager', 'grand_manager'],
      run: () => joinEmployees.map(e => {
        const m = e.manager_id != null && empById(e.manager_id);
        if (!m) return null;
        const gm = m.manager_id != null && empById(m.manager_id);
        if (!gm) return null;
        return { staff: e.emp_name, manager: m.emp_name, grand_manager: gm.emp_name };
      }).filter(Boolean),
      note: 'Joining the table a third time climbs two levels — only staff with both a manager and a grand-manager survive.'
    },
    ic: {
      sql: 'SELECT e.emp_name\nFROM employees e\nLEFT JOIN employees m ON e.emp_id = m.manager_id\nWHERE m.emp_id IS NULL;',
      cols: ['emp_name'],
      run: () => joinEmployees.filter(e => !joinEmployees.some(x => x.manager_id === e.emp_id))
        .map(e => ({ emp_name: e.emp_name })),
      note: 'Flip the join condition: anyone never referenced as a <code>manager_id</code> manages no one → an individual contributor.'
    }
  };

  function runSelf() {
    const s = SELF[jnSelfPick.value];
    jnSelfOut.textContent = s.sql;
    jnSelfRes.innerHTML = uTable(s.run(), s.cols);
    jnSelfNote.innerHTML = s.note;
  }
  jnSelfPick.addEventListener('change', runSelf);
  runSelf();
}

// --- FULL OUTER JOIN & COALESCE ---
const jnStuSrc = document.getElementById('jn-stu-src');
if (jnStuSrc) {
  jnStuSrc.innerHTML = uTable(joinStudents, ['student_id', 'name']);
  document.getElementById('jn-pay-src').innerHTML = uTable(joinPayments, ['student_id', 'amount']);
  const jnFullSeg = document.getElementById('jn-full-mode');
  const jnFullOut = document.getElementById('jn-full-out');
  const jnFullRes = document.getElementById('jn-full-res');
  const jnFullNote = document.getElementById('jn-full-note');
  let fullMode = 'raw';
  // build the FULL OUTER result, keeping both ids around
  function fullRows() {
    const out = [];
    joinStudents.forEach(s => {
      const p = s.student_id != null ? joinPayments.find(p => p.student_id === s.student_id) : null;
      out.push({ s_id: s.student_id, p_id: p ? p.student_id : null, name: s.name, amount: p ? p.amount : null });
    });
    joinPayments.forEach(p => {
      if (!joinStudents.some(s => s.student_id === p.student_id)) {
        out.push({ s_id: null, p_id: p.student_id, name: null, amount: p.amount });
      }
    });
    return out;
  }
  function runFull() {
    const rows = fullRows();
    if (fullMode === 'raw') {
      jnFullOut.textContent = 'SELECT s.student_id, s.name, p.amount\nFROM students s\nLEFT JOIN payments p ON s.student_id = p.student_id\nUNION\nSELECT p.student_id, s.name, p.amount\nFROM students s\nRIGHT JOIN payments p ON s.student_id = p.student_id\nWHERE s.student_id IS NULL;';
      jnFullRes.innerHTML = uTable(rows.map(r => ({ student_id: r.s_id, name: r.name, amount: r.amount })), ['student_id', 'name', 'amount']);
      jnFullNote.innerHTML = `Problem spotted: the orphan payment of 800 shows <code>student_id = NULL</code> even though payments knows it's student 4.`;
    } else {
      jnFullOut.textContent = 'SELECT COALESCE(s.student_id, p.student_id) AS final_id, s.name, p.amount\nFROM students s\nLEFT JOIN payments p ON s.student_id = p.student_id\nUNION\nSELECT COALESCE(s.student_id, p.student_id) AS final_id, s.name, p.amount\nFROM students s\nRIGHT JOIN payments p ON s.student_id = p.student_id\nWHERE s.student_id IS NULL;';
      jnFullRes.innerHTML = uTable(rows.map(r => ({ final_id: r.s_id != null ? r.s_id : r.p_id, name: r.name, amount: r.amount })), ['final_id', 'name', 'amount']);
      jnFullNote.innerHTML = `<span class="ok">COALESCE</span> fills the orphan's id with 4 (from payments). Raj stays NULL — both sides are NULL, so there's nothing to fall back to.`;
    }
  }
  jnFullSeg.addEventListener('click', e => {
    const b = e.target.closest('.seg-btn');
    if (!b) return;
    fullMode = b.dataset.mode;
    [...jnFullSeg.children].forEach(c => c.classList.toggle('active', c === b));
    runFull();
  });
  runFull();
}

// --- cross join combination generator ---
const jnCrossPick = document.getElementById('jn-cross-pick');
if (jnCrossPick) {
  const jnCrossOut = document.getElementById('jn-cross-out');
  const jnCrossRes = document.getElementById('jn-cross-res');
  const jnCrossNote = document.getElementById('jn-cross-note');
  function runCross() {
    const d = joinCrossDemos[jnCrossPick.value];
    jnCrossOut.textContent = `SELECT ${d.sel}\nFROM ${d.from}\nCROSS JOIN ${d.join};`;
    const rows = [];
    d.left.forEach(l => d.right.forEach(r => rows.push({ [d.lcol]: l, [d.rcol]: r })));
    jnCrossRes.innerHTML = uTable(rows, [d.lcol, d.rcol]);
    jnCrossNote.innerHTML = `${d.left.length} × ${d.right.length} = <strong>${rows.length}</strong> combinations — no <code>ON</code>, no key, every pairing kept.`;
  }
  jnCrossPick.addEventListener('change', runCross);
  runCross();
}

// --- natural join multi-column danger ---
const jnNatDangerRes = document.getElementById('jn-nat-danger-res');
if (jnNatDangerRes) {
  // match on BOTH customer_id AND city (the shared column names)
  const rows = [];
  joinCustomers.forEach(c => joinStoreLoc.forEach(sl => {
    if (c.customer_id === sl.customer_id && c.city === sl.city) {
      rows.push({ customer_id: c.customer_id, city: c.city, name: c.name, store_name: sl.store_name });
    }
  }));
  jnNatDangerRes.innerHTML = uTable(rows, ['customer_id', 'city', 'name', 'store_name']);
  document.getElementById('jn-nat-danger-note').innerHTML =
    `Rohan (102) vanished: his id matches, but his city is <code>Mumbai</code> in customers vs <code>Pune</code> in store_locations — the second shared column failed the match.`;
}

// --- implicit join result ---
const jnImplRes = document.getElementById('jn-impl-res');
if (jnImplRes) {
  const rows = joinOrders
    .map(o => jnCustById(o.customer_id) && {
      customer_id: jnCustById(o.customer_id).customer_id,
      name: jnCustById(o.customer_id).name,
      order_code: o.order_code, status: o.status
    })
    .filter(Boolean);
  jnImplRes.innerHTML = uTable(rows, ['customer_id', 'name', 'order_code', 'status']);
}

// --- natural join result ---
const jnNatRes = document.getElementById('jn-nat-res');
if (jnNatRes) {
  const rows = joinCustomers
    .map(c => {
      const l = joinLoyalty.find(x => x.customer_id === c.customer_id);
      return l ? { customer_id: c.customer_id, tier: l.tier } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.customer_id - b.customer_id);
  jnNatRes.innerHTML = uTable(rows, ['customer_id', 'tier']);
}

// --- capstone: which join? ---
buildClassify('jn-pick', 'jn-pick-score', [
  { label: 'Goal', prompt: 'List EVERY order, with customer name if we know it (keep unknown-customer orders)', options: [opt('RIGHT JOIN', true), opt('INNER JOIN'), opt('CROSS JOIN')], why: "RIGHT JOIN (orders on the right) keeps all orders, NULL name when no match." },
  { label: 'Goal', prompt: 'Find customers who have NEVER placed an order', options: [opt('LEFT JOIN + WHERE o.order_id IS NULL', true), opt('INNER JOIN'), opt('CROSS JOIN')], why: "LEFT JOIN keeps all customers; the unmatched ones have NULL order_id." },
  { label: 'Goal', prompt: 'Total revenue per customer — only real customer↔order pairs', options: [opt('INNER JOIN', true), opt('FULL OUTER JOIN'), opt('CROSS JOIN')], why: "INNER JOIN drops the NULLs that would corrupt the SUM." },
  { label: 'Goal', prompt: 'Generate every possible customer–coupon pairing for a test grid', options: [opt('CROSS JOIN', true), opt('LEFT JOIN'), opt('SELF JOIN')], why: "CROSS JOIN — you want all m × n combinations, no key needed." },
  { label: 'Goal', prompt: 'Show each employee next to their manager (same table)', options: [opt('SELF JOIN', true), opt('FULL OUTER JOIN'), opt('CROSS JOIN')], why: "SELF JOIN — join employees to itself with two aliases." }
]);

// --- capstone: predict row count ---
buildClassify('jn-predict', 'jn-predict-score', [
  { label: 'INNER JOIN', prompt: 'How many rows match on customer_id?', code: true, options: [optN(5, true), optN(8), optN(6), optN(3)], why: "Orders 1,2,4,5,6 have real customers → 5 matched rows (3, 7, 8 drop)." },
  { label: 'LEFT JOIN', prompt: 'customers LEFT JOIN orders — total rows?', code: true, options: [optN(10, true), optN(8), optN(5), optN(13)], why: "5 matched order rows + 5 order-less customers (103,104,107,108,109) = 10." },
  { label: 'RIGHT JOIN', prompt: 'customers RIGHT JOIN orders — total rows?', code: true, options: [optN(8, true), optN(5), optN(10), optN(64)], why: "All 8 orders survive; the 3 without a customer just show NULL." },
  { label: 'CROSS JOIN', prompt: '8 customers × 8 orders — total rows?', code: true, options: [optN(64, true), optN(16), optN(8), optN(40)], why: "Cartesian product: 8 × 8 = 64." },
  { label: 'Trap', prompt: 'LEFT JOIN then WHERE o.status = \'PAID\' — order-less customers?', options: [opt('Gone — became an INNER JOIN', true), opt('Kept with NULLs'), opt('Causes an error')], why: "NULL status ≠ 'PAID', so WHERE deletes them — the LEFT JOIN collapses to INNER." }
]);

// ============ MODULE 13: PERMISSIONS & ACCESS CONTROL ============

// --- GRANT privilege playground ---
const pmPrivRow = document.getElementById('pm-priv-row');
if (pmPrivRow) {
  const pmGrantOut = document.getElementById('pm-grant-out');
  const pmGrantOps = document.getElementById('pm-grant-ops');

  // operations raj might attempt; `need` is the privilege required.
  const pmOps = [
    { need: 'SELECT', sql: "SELECT * FROM tuf_sql.students;" },
    { need: 'INSERT', sql: "INSERT INTO tuf_sql.students (email, full_name, created_at)\n  VALUES ('new@tuf.org', 'new student', NOW());" },
    { need: 'UPDATE', sql: "UPDATE tuf_sql.students SET city = 'mumbai' WHERE student_id = 1;" },
    { need: 'DELETE', sql: "DELETE FROM tuf_sql.students WHERE student_id = 1;" },
    { need: 'DROP',   sql: "DROP TABLE tuf_sql.students;" },
    { need: 'REGRANT', sql: "GRANT SELECT ON tuf_sql.students TO 'neha'@'%';" }
  ];

  function pmGranted() {
    return [...pmPrivRow.querySelectorAll('input[data-priv]')]
      .filter(c => c.checked).map(c => c.dataset.priv);
  }

  function pmRunGrant() {
    const granted = pmGranted();
    const hasOpt = granted.includes('GRANT_OPTION');
    const privs = granted.filter(p => p !== 'GRANT_OPTION');

    // build the GRANT statement
    if (privs.length === 0) {
      pmGrantOut.textContent = "-- nothing granted yet --\n-- raj can connect but can't touch the table.";
    } else {
      pmGrantOut.textContent =
        `GRANT ${privs.join(', ')}\nON tuf_sql.students\nTO 'raj'@'%'${hasOpt ? '\nWITH GRANT OPTION' : ''};`;
    }

    // evaluate each operation
    let html = '';
    pmOps.forEach(op => {
      let allowed, why;
      if (op.need === 'DROP') {
        allowed = false;
        why = 'DROP was never granted — table-owner action, denied.';
      } else if (op.need === 'REGRANT') {
        const canRegrant = hasOpt && privs.includes('SELECT');
        allowed = canRegrant;
        why = hasOpt
          ? (privs.includes('SELECT') ? 'WITH GRANT OPTION lets raj re-grant a privilege he holds.' : "raj can delegate, but can't grant SELECT — he doesn't have it.")
          : 'No WITH GRANT OPTION — raj can use privileges but not pass them on.';
      } else {
        allowed = privs.includes(op.need);
        why = allowed ? `${op.need} is granted.` : `${op.need} not granted — permission denied.`;
      }
      html += `<div class="pm-op">
        <span class="pm-badge ${allowed ? 'ok' : 'no'}">${allowed ? 'ALLOWED' : 'DENIED'}</span>
        <div class="pm-op-body"><pre class="pm-op-sql">${op.sql}</pre><div class="pm-op-why">${why}</div></div>
      </div>`;
    });
    pmGrantOps.innerHTML = html;
  }

  pmPrivRow.querySelectorAll('input[data-priv]').forEach(c => c.addEventListener('change', pmRunGrant));
  pmRunGrant();
}

// --- GRANT ALL scope visualizer ---
const pmScopeSel = document.getElementById('pm-scope-sel');
if (pmScopeSel) {
  const pmScopeOut = document.getElementById('pm-scope-out');
  const pmScopeViz = document.getElementById('pm-scope-viz');
  const pmScopeNote = document.getElementById('pm-scope-note');

  const pmServer = [
    { db: 'tuf_sql',   tables: ['students', 'payments', 'orders'] },
    { db: 'analytics', tables: ['revenue', 'login_history'] }
  ];

  const pmScopes = {
    table:  { sql: "GRANT ALL\nON tuf_sql.students\nTO 'raj'@'%';", note: "Full control of <strong>one table</strong>. raj can SELECT/INSERT/UPDATE/DELETE (and TRUNCATE) in <code>students</code> — and nothing else. Use when a user owns a single table.", reach: (db, t) => db === 'tuf_sql' && t === 'students' },
    db:     { sql: "GRANT ALL\nON tuf_sql.*\nTO 'striver'@'%';", note: "Full control of the <strong>whole database</strong>. Every table in <code>tuf_sql</code> — including ones created later — is accessible. No reach outside it. Typical for a backend dev or DB owner.", reach: (db) => db === 'tuf_sql' },
    server: { sql: "GRANT ALL\nON *.*\nTO 'admin_user'@'%';", note: "<strong>Superuser / God Mode.</strong> Full control of the entire server — read, modify or DROP any database. Only ever for trusted admins.", reach: () => true }
  };

  function pmRunScope() {
    const s = pmScopes[pmScopeSel.value];
    pmScopeOut.textContent = s.sql;
    let html = '<div class="pm-server"><div class="pm-node-label">🖥️ MySQL server</div>';
    pmServer.forEach(d => {
      const dbReach = s.reach(d.db, null);
      const anyTable = d.tables.some(t => s.reach(d.db, t));
      html += `<div class="pm-db ${(dbReach || anyTable) ? 'on' : ''}"><div class="pm-node-label">🗄️ ${d.db}</div><div class="pm-tables">`;
      d.tables.forEach(t => {
        const on = s.reach(d.db, t);
        html += `<span class="pm-tbl ${on ? 'on' : ''}">📄 ${t}</span>`;
      });
      html += '</div></div>';
    });
    html += '</div>';
    pmScopeViz.innerHTML = html;
    pmScopeNote.innerHTML = s.note;
  }

  pmScopeSel.addEventListener('change', pmRunScope);
  pmRunScope();
}

// --- default role trap ---
const pmRoleGranted = document.getElementById('pm-role-granted');
if (pmRoleGranted) {
  const pmRoleDefault = document.getElementById('pm-role-default');
  const pmRoleOut = document.getElementById('pm-role-out');
  function pmRunRole() {
    let msg;
    if (!pmRoleGranted.checked) {
      msg = "❌ The role isn't even granted. <code>raj_ip</code> has no engineering privileges at all — queries on <code>students</code> are denied.";
    } else if (!pmRoleDefault.checked) {
      msg = "⚠️ <strong>The trap.</strong> Role granted but <em>not</em> the default. raj_ip logs in with <strong>zero active roles</strong> — queries still fail until he runs <code>SET ROLE 'engineering';</code> by hand each session.";
    } else {
      msg = "✅ Role granted <strong>and</strong> set as default. It activates automatically on login — raj_ip inherits SELECT/INSERT/UPDATE immediately, no manual step.";
    }
    pmRoleOut.innerHTML = msg;
  }
  pmRoleGranted.addEventListener('change', pmRunRole);
  pmRoleDefault.addEventListener('change', pmRunRole);
  pmRunRole();
}

// --- quiz: which command? ---
buildClassify('pm-cmd', 'pm-cmd-score', [
  { label: 'Task', prompt: "Let 'raj'@'%' read the students table", options: [opt('GRANT', true), opt('REVOKE'), opt('ALTER USER')], why: "Giving a privilege → GRANT SELECT ... TO raj." },
  { label: 'Task', prompt: "An employee left — block their login but keep the account", options: [opt('ALTER USER ... ACCOUNT LOCK', true), opt('REVOKE'), opt('GRANT')], why: "Freeze login without deleting setup → ALTER USER ... ACCOUNT LOCK." },
  { label: 'Task', prompt: "Take away raj's INSERT and UPDATE on students", options: [opt('REVOKE', true), opt('GRANT'), opt('ALTER USER')], why: "Removing privileges → REVOKE ... FROM raj." },
  { label: 'Task', prompt: "Rotate a leaked password to a new one", options: [opt('ALTER USER ... IDENTIFIED BY', true), opt('GRANT'), opt('REVOKE')], why: "Change the account's password → ALTER USER ... IDENTIFIED BY." },
  { label: 'Task', prompt: "Remove the 'engineering' role from raj_ip", options: [opt('REVOKE', true), opt('ALTER USER'), opt('GRANT')], why: "Roles are removed with REVOKE 'engineering' FROM raj_ip." }
]);

// --- quiz: will it succeed? (raj has SELECT, INSERT only) ---
buildClassify('pm-pf', 'pm-pf-score', [
  { label: 'raj runs', prompt: "SELECT * FROM tuf_sql.students;", code: true, options: [opt('SUCCESS', true), opt('DENIED')], why: "SELECT is granted." },
  { label: 'raj runs', prompt: "INSERT INTO tuf_sql.students ...", code: true, options: [opt('SUCCESS', true), opt('DENIED')], why: "INSERT is granted." },
  { label: 'raj runs', prompt: "UPDATE tuf_sql.students SET city='blr';", code: true, options: [opt('SUCCESS'), opt('DENIED', true)], why: "UPDATE was never granted → permission denied." },
  { label: 'raj runs', prompt: "DELETE FROM tuf_sql.students WHERE student_id=1;", code: true, options: [opt('SUCCESS'), opt('DENIED', true)], why: "DELETE not granted → denied." },
  { label: 'raj runs', prompt: "GRANT SELECT ON tuf_sql.students TO 'neha'@'%';", code: true, options: [opt('SUCCESS'), opt('DENIED', true)], why: "No WITH GRANT OPTION → raj can't re-grant anything." }
]);

// --- quiz: user or role? ---
buildClassify('pm-ur', 'pm-ur-score', [
  { label: 'Account', prompt: "engineering — no password, account locked", options: [opt('Role', true), opt('User')], why: "No authentication string + locked → a role (holds privileges, never logs in)." },
  { label: 'Account', prompt: "raj — has a password, logs in from '%'", options: [opt('User', true), opt('Role')], why: "Has a password and connects → a user." },
  { label: 'Account', prompt: "support — no password, holds privileges for the team", options: [opt('Role', true), opt('User')], why: "Password-less bundle of privileges → a role." },
  { label: 'Account', prompt: "root — has a password, full server access", options: [opt('User', true), opt('Role')], why: "The admin user — has a password, logs in." }
]);

// ============ MODULE 14: TRANSACTIONS & CONCURRENCY ============

// --- connection pool vs single ---
const txPoolMode = document.getElementById('tx-pool-mode');
if (txPoolMode) {
  const txPoolViz = document.getElementById('tx-pool-viz');
  const txPoolNote = document.getElementById('tx-pool-note');
  const txPoolSend = document.getElementById('tx-pool-send');
  let txMode = 'pool';

  function txPoolRender(sent) {
    const reqs = ['A', 'B', 'C'];
    let html = '';
    reqs.forEach((r, i) => {
      const conn = txMode === 'pool' ? i + 1 : 1;
      const lane = txMode === 'pool' ? 'parallel' : 'queued';
      const wait = txMode === 'pool' ? 0 : i;
      html += `<div class="tx-pool-row ${sent ? 'go' : ''}" style="--d:${wait * 0.5}s">
        <span class="tx-req">Request ${r}</span>
        <span class="tx-arrow">→</span>
        <span class="tx-conn">conn ${conn}</span>
        <span class="tx-lane ${lane}">${txMode === 'pool' ? 'runs now (parallel)' : (i === 0 ? 'runs now' : `waits for ${reqs[i - 1]}`)}</span>
      </div>`;
    });
    txPoolViz.innerHTML = html;
    if (sent) {
      txPoolNote.innerHTML = txMode === 'pool'
        ? "✅ <strong>Pool:</strong> each request gets its own free connection — all three run <em>in parallel</em>. The backend serves many users at once."
        : "⚠️ <strong>Single connection:</strong> only one query runs at a time. B waits for A, C waits for B — a queue that gets slow under traffic.";
    } else {
      txPoolNote.innerHTML = '';
    }
  }
  txPoolMode.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
    txPoolMode.querySelectorAll('.fbtn').forEach(x => x.classList.toggle('on', x === b));
    txMode = b.dataset.m; txPoolRender(false);
  }));
  txPoolSend.addEventListener('click', () => txPoolRender(true));
  txPoolRender(false);
}

// --- COMMIT / ROLLBACK simulator ---
const txSim = document.getElementById('tx-sim-controls');
if (txSim) {
  const txMine = document.getElementById('tx-sim-mine');
  const txOther = document.getElementById('tx-sim-other');
  const txLog = document.getElementById('tx-sim-log');
  const txNote = document.getElementById('tx-sim-note');
  const ORIG = { student_id: 1, full_name: 'raj', status: 'BANNED', city: 'blr' };
  let committed, working, inTxn, log;

  function txReset() {
    committed = { ...ORIG };
    working = { ...ORIG };
    inTxn = false;
    log = [];
    txDraw();
  }
  function txBtn(act) { return txSim.querySelector(`[data-act="${act}"]`); }
  function txDraw(note) {
    const cols = ['student_id', 'full_name', 'status', 'city'];
    txMine.innerHTML = uTable([inTxn ? working : committed], cols);
    txOther.innerHTML = uTable([committed], cols);
    txLog.innerHTML = log.length
      ? log.map(l => `<div class="tx-log-line">${l}</div>`).join('')
      : '<div class="tx-log-line muted">No statements yet. Press START TRANSACTION.</div>';
    txBtn('start').disabled = inTxn;
    ['status', 'city', 'commit', 'rollback'].forEach(a => txBtn(a).disabled = !inTxn);
    if (note) txNote.innerHTML = note;
  }

  txSim.addEventListener('click', e => {
    const b = e.target.closest('.fbtn'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'reset') { txReset(); txNote.innerHTML = ''; return; }
    if (act === 'start') { inTxn = true; working = { ...committed }; log = ['START TRANSACTION;']; txDraw("Transaction open. Changes now stay in your session only — the other panel still shows committed data."); return; }
    if (!inTxn) return;
    if (act === 'status') { working.status = 'ACTIVE'; log.push("UPDATE students SET status='ACTIVE' WHERE student_id=1;"); txDraw("Your session sees <code>ACTIVE</code> — but it's uncommitted, so the other session still sees <code>BANNED</code>."); return; }
    if (act === 'city') { working.city = 'Delhi'; log.push("UPDATE students SET city='Delhi' WHERE student_id=1;"); txDraw("Same story for <code>city</code>: visible to you, invisible to everyone else until commit."); return; }
    if (act === 'commit') { committed = { ...working }; inTxn = false; log.push('COMMIT;'); txDraw("✅ <strong>COMMIT</strong> — changes are now permanent and visible to <em>all</em> sessions. Locks released."); return; }
    if (act === 'rollback') { working = { ...committed }; inTxn = false; log.push('ROLLBACK;'); txDraw("↩️ <strong>ROLLBACK</strong> — every change since START TRANSACTION is discarded via the undo log. Back to the last committed state."); return; }
  });
  txReset();
}

// --- SAVEPOINT stepper ---
const txSpStep = document.getElementById('tx-sp-step');
if (txSpStep) {
  const txSpReset = document.getElementById('tx-sp-reset');
  const txSpCode = document.getElementById('tx-sp-code');
  const txSpAcc = document.getElementById('tx-sp-accounts');
  const txSpEnr = document.getElementById('tx-sp-enroll');
  const txSpNote = document.getElementById('tx-sp-note');

  // each step: code line, accounts state, enrollment present?, note
  const spSteps = [
    { line: 'START TRANSACTION;', acc: [{ id: 1, balance: 1000 }, { id: 2, balance: 500 }], enr: false, note: 'Transaction begins. Nothing committed yet.' },
    { line: "INSERT INTO enrollments (...) VALUES (4, 3, 'ACTIVE', ...);", acc: [{ id: 1, balance: 1000 }, { id: 2, balance: 500 }], enr: true, note: 'A new enrollment is inserted — temporary until commit.' },
    { line: 'SAVEPOINT sp_before_balance_transfer;', acc: [{ id: 1, balance: 1000 }, { id: 2, balance: 500 }], enr: true, note: '📌 Bookmark set. Everything up to here can be kept even if we undo later work.' },
    { line: 'UPDATE accounts SET balance = balance - 200 WHERE id = 1;', acc: [{ id: 1, balance: 800 }, { id: 2, balance: 500 }], enr: true, note: 'Account 1 debited ₹200 — still uncommitted.' },
    { line: 'UPDATE accounts SET balance = balance + 200 WHERE id = 2;', acc: [{ id: 1, balance: 800 }, { id: 2, balance: 700 }], enr: true, note: 'Account 2 credited ₹200. The transfer is staged.' },
    { line: 'ROLLBACK TO SAVEPOINT sp_before_balance_transfer;', acc: [{ id: 1, balance: 1000 }, { id: 2, balance: 500 }], enr: true, note: '↩️ Only the work <em>after</em> the savepoint is undone — balances revert, but the enrollment stays. Transaction is still open.' },
    { line: 'COMMIT;', acc: [{ id: 1, balance: 1000 }, { id: 2, balance: 500 }], enr: true, note: '✅ COMMIT saves what remains: the enrollment is stored, the balance transfer was discarded.' }
  ];
  let spIdx = -1;

  function spDraw() {
    const shown = spSteps.slice(0, spIdx + 1);
    txSpCode.innerHTML = spSteps.map((s, i) =>
      `<span class="tx-codeline ${i === spIdx ? 'cur' : (i < spIdx ? 'past' : 'future')}">${s.line}</span>`
    ).join('\n');
    const cur = spIdx < 0 ? null : spSteps[spIdx];
    if (!cur) {
      txSpAcc.innerHTML = uTable([{ id: 1, balance: 1000 }, { id: 2, balance: 500 }], ['id', 'balance']);
      txSpEnr.innerHTML = '<div class="muted" style="padding:10px 0;">none yet</div>';
      txSpNote.innerHTML = 'Press <strong>Next step</strong> to walk through the transaction.';
      return;
    }
    txSpAcc.innerHTML = uTable(cur.acc, ['id', 'balance']);
    txSpEnr.innerHTML = cur.enr
      ? uTable([{ student_id: 4, course_id: 3, status: 'ACTIVE' }], ['student_id', 'course_id', 'status'])
      : '<div class="muted" style="padding:10px 0;">none yet</div>';
    txSpNote.innerHTML = cur.note;
  }
  txSpStep.addEventListener('click', () => { if (spIdx < spSteps.length - 1) { spIdx++; spDraw(); } if (spIdx === spSteps.length - 1) txSpStep.disabled = true; });
  txSpReset.addEventListener('click', () => { spIdx = -1; txSpStep.disabled = false; spDraw(); });
  spDraw();
}

// --- deadlock stepper ---
const txDlStep = document.getElementById('tx-dl-step');
if (txDlStep) {
  const txDlReset = document.getElementById('tx-dl-reset');
  const txDlT1 = document.getElementById('tx-dl-t1');
  const txDlT2 = document.getElementById('tx-dl-t2');
  const txDlNote = document.getElementById('tx-dl-note');

  // step: [t1 state lines], [t2 state lines], note
  const dlSteps = [
    { t1: [['run', 'LOCK row A ✓']], t2: [], note: 'T1 locks <strong>row A</strong>.' },
    { t1: [['done', 'LOCK row A ✓']], t2: [['run', 'LOCK row B ✓']], note: 'T2 locks <strong>row B</strong>. So far so good — different rows.' },
    { t1: [['done', 'LOCK row A ✓'], ['fail', 'wants row B… ⏳ waiting']], t2: [['done', 'LOCK row B ✓']], note: 'T1 now wants <strong>row B</strong> — held by T2. T1 must <em>wait</em>.' },
    { t1: [['done', 'LOCK row A ✓'], ['fail', 'wants row B… ⏳ waiting']], t2: [['done', 'LOCK row B ✓'], ['fail', 'wants row A… ⏳ waiting']], note: '💥 <strong>Deadlock.</strong> T2 wants row A (held by T1). Each holds what the other needs — they would wait forever.' },
    { t1: [['done', 'LOCK row A ✓'], ['done', 'got row B ✓ → COMMIT']], t2: [['done', 'LOCK row B ✓'], ['fail', 'ROLLED BACK by MySQL']], note: '🔨 MySQL <strong>detects the deadlock</strong> and rolls back one victim (T2) so the other (T1) can finish. The app should retry T2.' }
  ];
  let dlIdx = -1;

  function dlRows(lines) {
    if (!lines.length) return '<div class="txn-row"><div class="txn-dot">·</div><div class="muted">idle</div></div>';
    return lines.map((l, i) => `<div class="txn-row"><div class="txn-dot ${l[0]}">${i + 1}</div><div>${l[1]}</div></div>`).join('');
  }
  function dlDraw() {
    const cur = dlIdx < 0 ? { t1: [], t2: [], note: 'Press <strong>Next step</strong> to watch two transactions deadlock.' } : dlSteps[dlIdx];
    txDlT1.innerHTML = dlRows(cur.t1);
    txDlT2.innerHTML = dlRows(cur.t2);
    txDlNote.innerHTML = cur.note;
  }
  txDlStep.addEventListener('click', () => { if (dlIdx < dlSteps.length - 1) { dlIdx++; dlDraw(); } if (dlIdx === dlSteps.length - 1) txDlStep.disabled = true; });
  txDlReset.addEventListener('click', () => { dlIdx = -1; txDlStep.disabled = false; dlDraw(); });
  dlDraw();
}

// --- quiz: which keyword? ---
buildClassify('tx-cmd', 'tx-cmd-score', [
  { label: 'Goal', prompt: 'Permanently save all changes in the current transaction', options: [opt('COMMIT', true), opt('ROLLBACK'), opt('SAVEPOINT')], why: 'COMMIT finalizes and makes changes visible to all.' },
  { label: 'Goal', prompt: 'Throw away everything since START TRANSACTION', options: [opt('ROLLBACK', true), opt('COMMIT'), opt('SAVEPOINT')], why: 'ROLLBACK reverts to the last committed state via the undo log.' },
  { label: 'Goal', prompt: 'Bookmark a point so you can undo only later work', options: [opt('SAVEPOINT', true), opt('COMMIT'), opt('ROLLBACK')], why: 'SAVEPOINT marks a checkpoint; ROLLBACK TO SAVEPOINT undoes only after it.' },
  { label: 'Goal', prompt: 'Undo just the balance transfer but keep the earlier insert', options: [opt('ROLLBACK TO SAVEPOINT', true), opt('ROLLBACK'), opt('COMMIT')], why: 'Plain ROLLBACK would discard the insert too — roll back to the savepoint instead.' },
  { label: 'Goal', prompt: 'Begin grouping statements into one atomic unit', options: [opt('START TRANSACTION', true), opt('COMMIT'), opt('SAVEPOINT')], why: 'START TRANSACTION opens the unit; until then MySQL auto-commits.' }
]);

// --- quiz: what survives? ---
buildClassify('tx-survive', 'tx-survive-score', [
  { label: 'Predict', prompt: 'UPDATE x; then ROLLBACK; — is the change saved?', code: true, options: [opt('No — discarded', true), opt('Yes — saved')], why: 'ROLLBACK throws away all uncommitted work.' },
  { label: 'Predict', prompt: 'UPDATE x; then COMMIT; — visible to other sessions?', code: true, options: [opt('Yes', true), opt('No')], why: 'COMMIT makes changes globally visible.' },
  { label: 'Predict', prompt: 'INSERT; SAVEPOINT s; UPDATE; ROLLBACK TO s; COMMIT; — INSERT kept?', code: true, options: [opt('Yes — INSERT survives', true), opt('No')], why: 'Rolling back to the savepoint only undoes the UPDATE after it; the INSERT before it stays and commits.' },
  { label: 'Predict', prompt: 'Inside an open txn, before COMMIT — what does another session see?', options: [opt('The old committed version', true), opt('Your new values')], why: 'MVCC serves others the older version (via undo log) until you commit.' },
  { label: 'Predict', prompt: 'A bare UPDATE with no START TRANSACTION — saved immediately?', code: true, options: [opt('Yes — auto-commit', true), opt('No')], why: 'Outside a transaction MySQL auto-commits each statement.' }
]);

// --- quiz: concept check ---
buildClassify('tx-concept', 'tx-concept-score', [
  { label: 'Which log?', prompt: 'Reverses a change on ROLLBACK and powers MVCC reads', options: [opt('Undo log', true), opt('Redo log')], why: 'Undo log keeps the old version — for rollback and consistent reads.' },
  { label: 'Which log?', prompt: 'Replays committed changes after a crash (durability)', options: [opt('Redo log', true), opt('Undo log')], why: 'Redo log re-applies changes if dirty pages weren\'t flushed before a crash.' },
  { label: 'Concept', prompt: "START on conn 78, COMMIT on conn 80 — does the commit work?", options: [opt('No — state is on conn 78', true), opt('Yes')], why: 'Transaction state lives on one connection; commit elsewhere does nothing for it.' },
  { label: 'Concept', prompt: 'Two txns lock each other\'s rows in opposite order, forever', options: [opt('Deadlock', true), opt('Timeout'), opt('Dirty read')], why: 'Mutual waiting = deadlock; MySQL rolls back one victim.' },
  { label: 'Concept', prompt: 'A modified page sitting in RAM, not yet flushed to disk', options: [opt('Dirty page', true), opt('Redo log'), opt('Read view')], why: 'Changed-in-buffer-pool-but-unflushed = a dirty page.' }
]);


// ============ MODULE 15: SUBQUERIES ============
const sqUsers = [
  { user_id: 1, name: 'Ayaan' }, { user_id: 2, name: 'Sneha' },
  { user_id: 3, name: 'Rohit' }, { user_id: 4, name: 'Kavya' },
  { user_id: 5, name: 'Zoya' },  { user_id: 6, name: 'Arjun' },
  { user_id: 7, name: '' },      { user_id: 8, name: null }
];
const sqProducts = [
  { product_id: 10, product: 'Tablet' },
  { product_id: 11, product: 'Headphones' },
  { product_id: 12, product: 'Keyboard' }   // never sold
];
// clean 4-order teaching set: status + placed_at_utc; Keyboard (12) never appears
const sqOrders = [
  { order_id: 101, user_id: 1, product_id: 10, amount: 1200.00, status: 'PAID',      placed_at_utc: '2026-01-09 10:00:00' },
  { order_id: 102, user_id: 1, product_id: 11, amount: 300.00,  status: 'CANCELLED', placed_at_utc: '2026-01-11 09:00:00' },
  { order_id: 104, user_id: 3, product_id: 10, amount: 1100.00, status: 'PAID',      placed_at_utc: '2026-01-10 12:00:00' },
  { order_id: 106, user_id: 4, product_id: 11, amount: 400.00,  status: 'PAID',      placed_at_utc: '2026-01-12 14:00:00' }
];
const sqEmployees = [
  { name: 'Asha',   department: 'Engineering', salary: 95000 },
  { name: 'Vikram', department: 'Engineering', salary: 80000 },
  { name: 'Neel',   department: 'Engineering', salary: 110000 },
  { name: 'Priya',  department: 'Sales',       salary: 60000 },
  { name: 'Rahul',  department: 'Sales',       salary: 75000 },
  { name: 'Diya',   department: 'HR',          salary: 55000 }
];
const sqUserById = id => sqUsers.find(u => u.user_id === id) || null;
const sq2 = v => (v === null || v === undefined) ? null : Number(v).toFixed(2);
const sqUserMax = uid => {
  const a = sqOrders.filter(o => o.user_id === uid && o.amount !== null).map(o => o.amount);
  return a.length ? Math.max(...a) : null;
};

// source tables
const sqUsersSrc = document.getElementById('sq-users-src');
if (sqUsersSrc) {
  sqUsersSrc.innerHTML = uTable(sqUsers, ['user_id', 'name']);
  document.getElementById('sq-prod-src').innerHTML = uTable(sqProducts, ['product_id', 'product']);
  document.getElementById('sq-ord-src').innerHTML = uTable(
    sqOrders.map(o => ({ ...o, amount: sq2(o.amount) })),
    ['order_id', 'user_id', 'product_id', 'amount', 'status', 'placed_at_utc']);
}

// generic segmented-control wiring
function sqSeg(segId, attr, onPick) {
  const seg = document.getElementById(segId);
  if (!seg) return;
  seg.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => {
    seg.querySelectorAll('.seg-btn').forEach(x => x.classList.toggle('active', x === b));
    onPick(b.dataset[attr]);
  }));
}

// --- scalar subquery in SELECT ---
const sqScalarMode = document.getElementById('sq-scalar-mode');
if (sqScalarMode) {
  const out = document.getElementById('sq-scalar-out');
  const res = document.getElementById('sq-scalar-res');
  const note = document.getElementById('sq-scalar-note');
  function runScalar() {
    const mode = sqScalarMode.value;
    let sub, col, note_;
    if (mode === 'name') {
      sub = '(SELECT u.name FROM users u WHERE u.user_id = o.user_id)';
      col = 'name';
      note_ = 'For each order, the subquery finds the one matching user and returns their name — a JOIN-free lookup.';
    } else if (mode === 'count') {
      sub = '(SELECT COUNT(*) FROM orders o2 WHERE o2.user_id = o.user_id)';
      col = 'user_orders';
      note_ = 'The subquery counts every order sharing this row\'s user_id, so a user\'s rows all show the same total.';
    } else {
      sub = '(SELECT MAX(o2.amount) FROM orders o2 WHERE o2.user_id = o.user_id)';
      col = 'user_max';
      note_ = 'MAX() runs per user_id, so each order shows that user\'s peak amount.';
    }
    out.textContent = `SELECT o.order_id,\n       ${sub} AS ${col}\nFROM orders o;`;
    const rows = sqOrders.map(o => {
      let val;
      if (mode === 'name') { const u = sqUserById(o.user_id); val = u ? u.name : null; }
      else if (mode === 'count') val = sqOrders.filter(x => x.user_id === o.user_id).length;
      else val = sq2(sqUserMax(o.user_id));
      return { order_id: o.order_id, [col]: val };
    });
    res.innerHTML = uTable(rows, ['order_id', col]);
    note.innerHTML = note_;
  }
  sqScalarMode.addEventListener('change', runScalar);
  runScalar();
}

// --- subquery with IN ---
const sqInScenario = document.getElementById('sq-in-scenario');
if (sqInScenario) {
  const out = document.getElementById('sq-in-out');
  const list = document.getElementById('sq-in-list');
  const res = document.getElementById('sq-in-res');
  function runIn() {
    const s = sqInScenario.value;
    if (s === 'any') {
      const ids = [...new Set(sqOrders.map(o => o.user_id))].sort((a, b) => a - b);
      out.textContent = `SELECT u.user_id\nFROM users u\nWHERE u.user_id IN (\n  SELECT DISTINCT o.user_id FROM orders o\n);`;
      list.innerHTML = `Inner list → <code>${ids.join(', ')}</code>`;
      res.innerHTML = uTable(sqUsers.filter(u => ids.includes(u.user_id)).map(u => ({ user_id: u.user_id })), ['user_id']);
    } else {
      const pname = s === 'tablet' ? 'Tablet' : 'Headphones';
      const pids = sqProducts.filter(p => p.product === pname).map(p => p.product_id);
      out.textContent = `SELECT o.user_id, o.product_id\nFROM orders o\nWHERE o.product_id IN (\n  SELECT p.product_id FROM products p\n  WHERE p.product = '${pname}'\n);`;
      list.innerHTML = `Inner list (${pname}) → <code>${pids.join(', ')}</code>`;
      res.innerHTML = uTable(
        sqOrders.filter(o => pids.includes(o.product_id)).map(o => ({ user_id: o.user_id, product_id: o.product_id })),
        ['user_id', 'product_id']);
    }
  }
  sqInScenario.addEventListener('change', runIn);
  runIn();
}

// --- EXISTS / NOT EXISTS ---
const sqExistsOut = document.getElementById('sq-exists-out');
if (sqExistsOut) {
  const res = document.getElementById('sq-exists-res');
  const note = document.getElementById('sq-exists-note');
  let exMode = 'exists', exThresh = 0;
  function runExists() {
    const t = exThresh;
    const cond = t > 0 ? `\n    AND o.amount >= ${t}` : '';
    const kw = exMode === 'exists' ? 'EXISTS' : 'NOT EXISTS';
    sqExistsOut.textContent = `SELECT u.user_id, u.name\nFROM users u\nWHERE ${kw} (\n  SELECT 1 FROM orders o\n  WHERE o.user_id = u.user_id${cond}\n);`;
    const has = u => sqOrders.some(o => o.user_id === u.user_id && (t === 0 || (o.amount !== null && o.amount >= t)));
    const rows = sqUsers.filter(u => exMode === 'exists' ? has(u) : !has(u));
    res.innerHTML = uTable(rows, ['user_id', 'name']);
    note.innerHTML = exMode === 'exists'
      ? (t > 0 ? `Kept: users with at least one order ≥ ${t}. NULL amounts never satisfy <code>&gt;= ${t}</code>.`
               : 'Kept: every user who has placed even one order.')
      : (t > 0 ? `Kept: users with <em>no</em> order ≥ ${t} (includes users who never ordered).`
               : 'Kept: users with no order at all — the safe anti-join, NULL names and all.');
  }
  sqSeg('sq-exists-mode', 'mode', m => { exMode = m; runExists(); });
  sqSeg('sq-exists-thresh', 'thresh', t => { exThresh = Number(t); runExists(); });
  runExists();
}

// --- EXISTS in the wild ---
const sqCasePick = document.getElementById('sq-case-pick');
if (sqCasePick) {
  const out = document.getElementById('sq-case-out');
  const res = document.getElementById('sq-case-res');
  const note = document.getElementById('sq-case-note');
  function runCase() {
    const c = sqCasePick.value;
    if (c === 'sold' || c === 'unsold') {
      const not = c === 'unsold';
      out.textContent = `SELECT p.product_id, p.product\nFROM products p\nWHERE ${not ? 'NOT EXISTS' : 'EXISTS'} (\n  SELECT 1 FROM orders o WHERE o.product_id = p.product_id\n);`;
      const rows = sqProducts.filter(p => {
        const sold = sqOrders.some(o => o.product_id === p.product_id);
        return not ? !sold : sold;
      });
      res.innerHTML = uTable(rows, ['product_id', 'product']);
      note.innerHTML = not
        ? 'Keyboard never appears in orders, so it\'s the only product NOT EXISTS keeps — perfect for spotting dead inventory.'
        : 'Tablet and Headphones each have at least one sale; Keyboard is filtered out.';
    } else if (c === 'cancelled') {
      out.textContent = `SELECT u.name\nFROM users u\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.user_id = u.user_id\n    AND o.status = 'CANCELLED'\n);`;
      const rows = sqUsers.filter(u => sqOrders.some(o => o.user_id === u.user_id && o.status === 'CANCELLED'));
      res.innerHTML = uTable(rows, ['name']);
      note.innerHTML = 'Order 102 (Ayaan) is CANCELLED, so only Ayaan matches.';
    } else {
      out.textContent = `SELECT u.user_id, u.name\nFROM users u\nWHERE NOT EXISTS (\n  SELECT 1 FROM products p\n  WHERE NOT EXISTS (\n    SELECT 1 FROM orders o\n    WHERE o.user_id = u.user_id\n      AND o.product_id = p.product_id\n  )\n);`;
      const rows = sqUsers.filter(u =>
        sqProducts.every(p => sqOrders.some(o => o.user_id === u.user_id && o.product_id === p.product_id)));
      res.innerHTML = uTable(rows, ['user_id', 'name']);
      note.innerHTML = 'Double negative: "there is no product this user has NOT bought." With Keyboard unsold by everyone, nobody qualifies for all three — so this returns 0 rows here.';
    }
  }
  sqCasePick.addEventListener('change', runCase);
  runCase();
}

// --- NOT IN trap (live toggle) ---
const sqTrapNull = document.getElementById('sq-trap-null');
if (sqTrapNull) {
  const notinEl = document.getElementById('sq-trap-notin');
  const neEl = document.getElementById('sq-trap-ne');
  const note = document.getElementById('sq-trap-note');
  function runTrap() {
    const orders = sqTrapNull.checked
      ? [...sqOrders, { order_id: 199, user_id: 4, product_id: null, amount: 0, status: 'REFUND', placed_at_utc: '2026-01-13 08:00:00' }]
      : sqOrders;
    const pids = orders.map(o => o.product_id);
    const hasNull = pids.includes(null);
    const notInRows = hasNull ? [] : sqProducts.filter(p => !pids.includes(p.product_id));
    const neRows = sqProducts.filter(p => !orders.some(o => o.product_id === p.product_id));
    notinEl.innerHTML = uTable(notInRows, ['product_id', 'product']);
    neEl.innerHTML = uTable(neRows, ['product_id', 'product']);
    note.innerHTML = hasNull
      ? 'A <code>NULL</code> is now in the inner list, so every <code>product_id NOT IN (…, NULL)</code> is <em>unknown</em> — never TRUE. <code>NOT IN</code> returns 0 rows; <code>NOT EXISTS</code> still finds Keyboard.'
      : 'No NULLs in the list, so both agree on Keyboard. Tick the box to break <code>NOT IN</code>.';
  }
  sqTrapNull.addEventListener('change', runTrap);
  runTrap();
}

// --- correlated subquery: max per user / which order ---
const sqCorrOut = document.getElementById('sq-corr-out');
if (sqCorrOut) {
  const res = document.getElementById('sq-corr-res');
  const note = document.getElementById('sq-corr-note');
  function runCorr(mode) {
    if (mode === 'peruser') {
      sqCorrOut.textContent = `SELECT u.user_id, u.name,\n       (SELECT MAX(o.amount) FROM orders o\n        WHERE o.user_id = u.user_id) AS max_amount\nFROM users u\nWHERE EXISTS (\n  SELECT 1 FROM orders o WHERE o.user_id = u.user_id\n)\nORDER BY max_amount DESC;`;
      const rows = sqUsers
        .filter(u => sqOrders.some(o => o.user_id === u.user_id))
        .map(u => ({ user_id: u.user_id, name: u.name, max_amount: sq2(sqUserMax(u.user_id)) }))
        .sort((a, b) => Number(b.max_amount) - Number(a.max_amount));
      res.innerHTML = uTable(rows, ['user_id', 'name', 'max_amount']);
      note.innerHTML = 'The subquery re-runs per user; <code>EXISTS</code> drops order-less users.';
    } else {
      sqCorrOut.textContent = `SELECT o.user_id, o.product_id, o.amount\nFROM orders o\nWHERE o.amount = (\n  SELECT MAX(o2.amount) FROM orders o2\n  WHERE o2.user_id = o.user_id\n);`;
      const rows = sqOrders
        .filter(o => o.amount !== null && o.amount === sqUserMax(o.user_id))
        .map(o => ({ user_id: o.user_id, product_id: o.product_id, amount: sq2(o.amount) }));
      res.innerHTML = uTable(rows, ['user_id', 'product_id', 'amount']);
      note.innerHTML = 'Keeps the actual order rows whose amount equals that user\'s max. Ties would all appear.';
    }
  }
  sqSeg('sq-corr-seg', 'mode', runCorr);
  runCorr('peruser');
}

// --- row-by-row cases ---
const sqRbrPick = document.getElementById('sq-rbr-pick');
if (sqRbrPick) {
  const out = document.getElementById('sq-rbr-out');
  const res = document.getElementById('sq-rbr-res');
  const note = document.getElementById('sq-rbr-note');
  function runRbr() {
    const c = sqRbrPick.value;
    if (c === 'lastorder') {
      out.textContent = `SELECT u.user_id, u.name,\n       (SELECT MAX(o.placed_at_utc) FROM orders o\n        WHERE o.user_id = u.user_id) AS last_order\nFROM users u\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id);`;
      const rows = sqUsers
        .filter(u => sqOrders.some(o => o.user_id === u.user_id))
        .map(u => {
          const ts = sqOrders.filter(o => o.user_id === u.user_id).map(o => o.placed_at_utc).sort();
          return { user_id: u.user_id, name: u.name, last_order: ts[ts.length - 1] };
        });
      res.innerHTML = uTable(rows, ['user_id', 'name', 'last_order']);
      note.innerHTML = 'MAX over a timestamp = the latest order — a "last seen" signal per user.';
    } else if (c === 'prevcount') {
      out.textContent = `SELECT o1.order_id, o1.user_id,\n       (SELECT COUNT(*) FROM orders o2\n        WHERE o2.user_id = o1.user_id\n          AND o2.placed_at_utc < o1.placed_at_utc) AS previous_orders\nFROM orders o1\nORDER BY o1.order_id;`;
      const rows = [...sqOrders]
        .sort((a, b) => a.order_id - b.order_id)
        .map(o1 => ({
          order_id: o1.order_id,
          user_id: o1.user_id,
          previous_orders: sqOrders.filter(o2 => o2.user_id === o1.user_id && o2.placed_at_utc < o1.placed_at_utc).length
        }));
      res.innerHTML = uTable(rows, ['order_id', 'user_id', 'previous_orders']);
      note.innerHTML = 'For each order, count the same user\'s earlier orders — order 102 has 1 (order 101 came first).';
    } else {
      out.textContent = `SELECT e1.name, e1.department, e1.salary\nFROM employees e1\nWHERE e1.salary > (\n  SELECT AVG(e2.salary) FROM employees e2\n  WHERE e2.department = e1.department\n);`;
      const rows = sqEmployees.filter(e1 => {
        const dept = sqEmployees.filter(e2 => e2.department === e1.department);
        const avg = dept.reduce((s, e) => s + e.salary, 0) / dept.length;
        return e1.salary > avg;
      }).map(e => ({ name: e.name, department: e.department, salary: e.salary }));
      res.innerHTML = uTable(rows, ['name', 'department', 'salary']);
      note.innerHTML = 'The AVG re-computes per department: Neel beats Engineering\'s 95,000 and Rahul beats Sales\' 67,500.';
    }
  }
  sqRbrPick.addEventListener('change', runRbr);
  runRbr();
}

// --- games ---
buildClassify('sq-tool', 'sq-tool-score', [
  { label: 'Goal', prompt: 'Keep orders whose product_id is one of a set returned by another query', options: [opt('IN', true), opt('EXISTS'), opt('NOT EXISTS')], why: 'You need to match against a list of values → IN.' },
  { label: 'Goal', prompt: 'Users who placed at least one order (just presence)', options: [opt('EXISTS', true), opt('IN'), opt('NOT IN')], why: 'Pure presence check that can stop at the first match → EXISTS.' },
  { label: 'Goal', prompt: 'Products never sold, and product_id may be NULL in orders', options: [opt('NOT EXISTS', true), opt('NOT IN'), opt('IN')], why: 'NOT EXISTS is NULL-safe; NOT IN can silently return nothing.' },
  { label: 'Goal', prompt: 'Show each order with its user\'s name inline in the SELECT list', options: [opt('Scalar subquery', true), opt('EXISTS'), opt('IN')], why: 'A subquery returning one value can sit in the SELECT list.' },
  { label: 'Goal', prompt: 'Each employee who earns above their own department\'s average', options: [opt('Correlated subquery', true), opt('Simple subquery'), opt('IN')], why: 'The average depends on the current row\'s department → it must correlate.' },
  { label: 'Pick', prompt: 'Inside EXISTS you should select…', options: [opt('SELECT 1', true), opt('SELECT *'), opt('SELECT every column')], why: 'EXISTS only checks for a row\'s presence; SELECT 1 avoids wasted work.' }
]);

buildClassify('sq-predict', 'sq-predict-score', [
  { label: 'Predict', prompt: 'WHERE user_id IN (SELECT DISTINCT user_id FROM orders) — how many users?', options: [opt('3', true), opt('6'), opt('8')], why: 'Only users 1, 3, 4 appear in orders.' },
  { label: 'Predict', prompt: 'EXISTS with amount >= 500 — which users?', options: [opt('1 and 3', true), opt('1, 3, 4'), opt('1 only')], why: 'Only Ayaan (1200) and Rohit (1100) have an order ≥ 500; Kavya\'s max is 400.' },
  { label: 'Predict', prompt: 'NOT EXISTS (any order) — how many users returned?', options: [opt('5', true), opt('3'), opt('8')], why: 'Users 2, 5, 6, 7, 8 never ordered → 5 rows.' },
  { label: 'Predict', prompt: 'Products WHERE NOT EXISTS a matching order — which?', options: [opt('Keyboard only', true), opt('Tablet & Keyboard'), opt('None')], why: 'Keyboard (12) never appears in orders.' },
  { label: 'Predict', prompt: 'product_id NOT IN (a list that contains a NULL) — rows?', options: [opt('Zero — NULL poisons the list', true), opt('All products'), opt('Just Keyboard')], why: 'A NULL in the list makes every NOT IN test unknown → no rows.' },
  { label: 'Predict', prompt: 'Counting an order\'s previous orders — order 102\'s value?', options: [opt('1', true), opt('0'), opt('2')], why: 'Order 101 (same user, earlier timestamp) precedes it → 1.' }
]);

// ============ MODULE 16: CTEs & TEMPORARY TABLES ============
const cteRatings = [
  { rating_id: 1,  restaurant: 'Cafe Aroma',  stars: 4 },
  { rating_id: 2,  restaurant: 'Cafe Aroma',  stars: 5 },
  { rating_id: 3,  restaurant: 'Pasta Hub',   stars: 3 },
  { rating_id: 4,  restaurant: 'Pasta Hub',   stars: 4 },
  { rating_id: 5,  restaurant: 'Spice Box',   stars: 5 },
  { rating_id: 6,  restaurant: 'Burger Barn', stars: 4 },
  { rating_id: 7,  restaurant: 'Burger Barn', stars: null },
  { rating_id: 8,  restaurant: 'Sushi Zen',   stars: 4 },
  { rating_id: 9,  restaurant: 'Sushi Zen',   stars: 4 },
  { rating_id: 10, restaurant: 'Taco Town',   stars: 2 },
  { rating_id: 11, restaurant: 'Taco Town',   stars: 3 },
  { rating_id: 12, restaurant: 'Noodle Nest', stars: 4 }
];
const cteSales = [
  { sale_id: 101, salesperson: 'Aditi', amount: 500 },
  { sale_id: 102, salesperson: 'Rahul', amount: 300 },
  { sale_id: 103, salesperson: 'Aditi', amount: 700 },
  { sale_id: 104, salesperson: 'Karan', amount: 250 },
  { sale_id: 105, salesperson: 'Neha',  amount: 900 },
  { sale_id: 106, salesperson: 'Rahul', amount: 150 },
  { sale_id: 107, salesperson: 'Karan', amount: 100 },
  { sale_id: 108, salesperson: 'Ishan', amount: 600 },
  { sale_id: 109, salesperson: 'Ishan', amount: 100 },
  { sale_id: 110, salesperson: 'Neha',  amount: 200 },
  { sale_id: 111, salesperson: 'Rahul', amount: 50 },
  { sale_id: 112, salesperson: 'Karan', amount: 20 }
];
const cteCats = [
  { cat_id: 1,  name: 'Electronics', parent_id: null },
  { cat_id: 2,  name: 'Mobiles',     parent_id: 1 },
  { cat_id: 3,  name: 'Accessories', parent_id: 2 },
  { cat_id: 4,  name: 'Cables',      parent_id: 3 },
  { cat_id: 5,  name: 'Chargers',    parent_id: 3 },
  { cat_id: 6,  name: 'Home',        parent_id: null },
  { cat_id: 7,  name: 'Kitchen',     parent_id: 6 },
  { cat_id: 8,  name: 'Appliances',  parent_id: 6 },
  { cat_id: 9,  name: 'Smartphones', parent_id: 2 },
  { cat_id: 10, name: 'Android',     parent_id: 9 },
  { cat_id: 11, name: 'iOS',         parent_id: 9 },
  { cat_id: 12, name: 'OrphanCat',   parent_id: 999 }
];
// per-restaurant AVG/MIN/COUNT over non-NULL stars (SQL aggregate semantics)
function cteAvgRatings() {
  const names = [...new Set(cteRatings.map(r => r.restaurant))];
  return names.map(n => {
    const s = cteRatings.filter(r => r.restaurant === n && r.stars !== null).map(r => r.stars);
    return {
      restaurant: n,
      avg_stars: s.length ? s.reduce((a, b) => a + b, 0) / s.length : null,
      min_rating: s.length ? Math.min(...s) : null,
      ratings_count: s.length
    };
  });
}
const cteFmtAvg = v => v === null ? null : (Math.round(v * 10000) / 10000).toFixed(v % 1 === 0 ? 1 : 4).replace(/0+$/, '').replace(/\.$/, '.0');

// source tables
const cteRatSrc = document.getElementById('cte-rat-src');
if (cteRatSrc) {
  cteRatSrc.innerHTML = uTable(cteRatings, ['rating_id', 'restaurant', 'stars']);
  document.getElementById('cte-sales-src').innerHTML = uTable(
    cteSales.map(s => ({ ...s, amount: s.amount.toFixed(2) })), ['sale_id', 'salesperson', 'amount']);
  document.getElementById('cte-cat-src').innerHTML = uTable(cteCats, ['cat_id', 'name', 'parent_id']);
}

// --- basic CTE playground ---
const cteBasicPick = document.getElementById('cte-basic-pick');
if (cteBasicPick) {
  const out = document.getElementById('cte-basic-out');
  const res = document.getElementById('cte-basic-res');
  const note = document.getElementById('cte-basic-note');
  function runBasic() {
    const mode = cteBasicPick.value;
    const all = cteAvgRatings();
    if (mode === 'avg') {
      out.textContent = `WITH avg_ratings AS (\n  SELECT restaurant, AVG(stars) AS avg_stars\n  FROM ratings\n  GROUP BY restaurant\n)\nSELECT restaurant, avg_stars\nFROM avg_ratings\nWHERE avg_stars > 4.0\nORDER BY restaurant ASC;`;
      const rows = all.filter(r => r.avg_stars > 4)
        .sort((a, b) => a.restaurant.localeCompare(b.restaurant))
        .map(r => ({ restaurant: r.restaurant, avg_stars: cteFmtAvg(r.avg_stars) }));
      res.innerHTML = uTable(rows, ['restaurant', 'avg_stars']);
      note.innerHTML = 'The CTE computes one row per restaurant; the outer query filters. AVG() ignores NULL — Burger Barn averages 4.0 on its single valid rating, so it just misses the &gt; 4.0 bar.';
    } else if (mode === 'avgmin') {
      out.textContent = `WITH avg_ratings AS (\n  SELECT restaurant,\n         AVG(stars) AS avg_stars,\n         MIN(stars) AS min_rating\n  FROM ratings\n  GROUP BY restaurant\n)\nSELECT restaurant, avg_stars, min_rating\nFROM avg_ratings\nWHERE avg_stars > 4.0\nORDER BY restaurant ASC;`;
      const rows = all.filter(r => r.avg_stars > 4)
        .sort((a, b) => a.restaurant.localeCompare(b.restaurant))
        .map(r => ({ restaurant: r.restaurant, avg_stars: cteFmtAvg(r.avg_stars), min_rating: r.min_rating }));
      res.innerHTML = uTable(rows, ['restaurant', 'avg_stars', 'min_rating']);
      note.innerHTML = 'One CTE can carry several aggregates at once — add MIN(stars) in the step, pick it up in the final query.';
    } else {
      out.textContent = `WITH avg_ratings AS (\n  SELECT restaurant,\n         AVG(stars)   AS avg_stars,\n         COUNT(stars) AS ratings_count\n  FROM ratings\n  GROUP BY restaurant\n)\nSELECT *\nFROM avg_ratings\nORDER BY restaurant ASC;`;
      const rows = [...all].sort((a, b) => a.restaurant.localeCompare(b.restaurant))
        .map(r => ({ restaurant: r.restaurant, avg_stars: cteFmtAvg(r.avg_stars), ratings_count: r.ratings_count }));
      res.innerHTML = uTable(rows, ['restaurant', 'avg_stars', 'ratings_count']);
      note.innerHTML = '<code>COUNT(stars)</code> counts only non-NULL values — that\'s why Burger Barn shows 1, not 2.';
    }
  }
  cteBasicPick.addEventListener('change', runBasic);
  runBasic();
}

// --- multi-step pipeline ---
const ctePipeOut = document.getElementById('cte-pipe-out');
if (ctePipeOut) {
  const res = document.getElementById('cte-pipe-res');
  const note = document.getElementById('cte-pipe-note');
  const totals = [...new Set(cteSales.map(s => s.salesperson))].map(p => ({
    salesperson: p,
    total_sales: cteSales.filter(s => s.salesperson === p).reduce((a, s) => a + s.amount, 0)
  }));
  const maxTotal = Math.max(...totals.map(t => t.total_sales));
  function runPipe(stage) {
    if (stage === 'totals') {
      ctePipeOut.textContent = `WITH totals AS (\n  SELECT salesperson, SUM(amount) AS total_sales\n  FROM sales_date\n  GROUP BY salesperson\n)\nSELECT * FROM totals;   -- peeking at step 1`;
      res.innerHTML = uTable(
        [...totals].sort((a, b) => a.salesperson.localeCompare(b.salesperson))
          .map(t => ({ salesperson: t.salesperson, total_sales: t.total_sales.toFixed(2) })),
        ['salesperson', 'total_sales']);
      note.innerHTML = 'Step 1: one row per salesperson with their SUM — the raw material for the next step.';
    } else if (stage === 'max') {
      ctePipeOut.textContent = `WITH totals AS ( … ),\nmax_sales AS (\n  SELECT MAX(total_sales) AS max_total_sales\n  FROM totals            -- ← uses the previous CTE\n)\nSELECT * FROM max_sales;  -- peeking at step 2`;
      res.innerHTML = uTable([{ max_total_sales: maxTotal.toFixed(2) }], ['max_total_sales']);
      note.innerHTML = 'Step 2 selects <em>from the first CTE</em>, not from the base table — that\'s the pipeline: each step builds on the last.';
    } else {
      ctePipeOut.textContent = `WITH totals AS (\n  SELECT salesperson, SUM(amount) AS total_sales\n  FROM sales_date\n  GROUP BY salesperson\n),\nmax_sales AS (\n  SELECT MAX(total_sales) AS max_total_sales\n  FROM totals\n)\nSELECT t.salesperson, t.total_sales\nFROM totals t\nJOIN max_sales m\n  ON t.total_sales = m.max_total_sales;`;
      res.innerHTML = uTable(
        totals.filter(t => t.total_sales === maxTotal)
          .map(t => ({ salesperson: t.salesperson, total_sales: t.total_sales.toFixed(2) })),
        ['salesperson', 'total_sales']);
      note.innerHTML = 'The join keeps only rows whose total equals the max — Aditi at 1200.00. If two people tied, both would appear.';
    }
  }
  sqSeg('cte-pipe-seg', 'stage', runPipe);
  runPipe('totals');
}

// --- subquery vs CTE shared result ---
const cteVsRes = document.getElementById('cte-vs-res');
if (cteVsRes) {
  const all = cteAvgRatings();
  const valid = cteRatings.filter(r => r.stars !== null).map(r => r.stars);
  const overall = valid.reduce((a, b) => a + b, 0) / valid.length;
  const rows = all.filter(r => r.avg_stars > overall)
    .sort((a, b) => b.avg_stars - a.avg_stars || a.restaurant.localeCompare(b.restaurant))
    .map(r => ({ restaurant: r.restaurant, avg_stars: cteFmtAvg(r.avg_stars) }));
  cteVsRes.innerHTML = uTable(rows, ['restaurant', 'avg_stars']);
  document.getElementById('cte-vs-note').innerHTML =
    `Overall average is <code>${overall.toFixed(4)}…</code> (AVG ignores the NULL), so every restaurant above that survives. Why <code>CROSS JOIN</code>? <code>baseline</code> is exactly one row, so crossing it just hands that one value to every restaurant row for comparison.`;
}

// --- recursive counter ---
const cteRecOut = document.getElementById('cte-rec-out');
if (cteRecOut) {
  const res = document.getElementById('cte-rec-res');
  const note = document.getElementById('cte-rec-note');
  function runRec(nStr) {
    const N = Number(nStr);
    cteRecOut.textContent = `WITH RECURSIVE demo AS (\n  SELECT 1 AS n        -- anchor: runs once\n  UNION ALL\n  SELECT n + 1         -- recursive: references demo\n  FROM demo\n  WHERE n < ${N}          -- stop condition\n)\nSELECT * FROM demo;`;
    const rows = [];
    for (let n = 1; n <= N; n++) rows.push({ n });
    res.innerHTML = uTable(rows, ['n']);
    note.innerHTML = `Anchor seeds n = 1; each pass adds n + 1 while n &lt; ${N}. When n reaches ${N}, the condition fails and recursion stops — ${N} rows total. Without that WHERE, it would loop forever.`;
  }
  sqSeg('cte-rec-seg', 'n', runRec);
  runRec('5');
}

// --- category tree playground ---
const cteTreePick = document.getElementById('cte-tree-pick');
if (cteTreePick) {
  const out = document.getElementById('cte-tree-out');
  const res = document.getElementById('cte-tree-res');
  const note = document.getElementById('cte-tree-note');
  // BFS downward from a root id, tagging levels (mirrors the recursive CTE)
  function walkDown(rootId) {
    const found = [];
    let frontier = cteCats.filter(c => c.cat_id === rootId).map(c => ({ ...c, level: 1 }));
    while (frontier.length) {
      found.push(...frontier);
      const ids = frontier.map(f => f.cat_id);
      frontier = cteCats.filter(c => ids.includes(c.parent_id))
        .map(c => ({ ...c, level: found.find(f => f.cat_id === c.parent_id).level + 1 }));
    }
    return found;
  }
  function walkUp(startId) {
    const found = [];
    let cur = cteCats.find(c => c.cat_id === startId), level = 1;
    while (cur) {
      found.push({ ...cur, level });
      cur = cteCats.find(c => c.cat_id === cur.parent_id);
      level++;
    }
    return found;
  }
  function runTree() {
    const m = cteTreePick.value;
    if (m === 'down') {
      out.textContent = `WITH RECURSIVE category_tree AS (\n  -- Anchor: start at Electronics\n  SELECT cat_id, name, parent_id, 1 AS level\n  FROM categories\n  WHERE cat_id = 1\n  UNION ALL\n  -- Recursive: children of the previous level\n  SELECT c.cat_id, c.name, c.parent_id, ct.level + 1\n  FROM categories c\n  JOIN category_tree ct\n    ON c.parent_id = ct.cat_id\n)\nSELECT * FROM category_tree\nORDER BY level ASC, cat_id ASC;`;
      const rows = walkDown(1).sort((a, b) => a.level - b.level || a.cat_id - b.cat_id);
      res.innerHTML = uTable(rows, ['cat_id', 'name', 'parent_id', 'level']);
      note.innerHTML = 'Level 1 = Electronics → level 2 finds Mobiles → level 3 its children → level 4 the leaves. Home\'s branch and OrphanCat never connect to Electronics, so they don\'t appear.';
    } else if (m === 'up') {
      out.textContent = `WITH RECURSIVE category_path AS (\n  -- Anchor: start at Android\n  SELECT cat_id, name, parent_id, 1 AS level\n  FROM categories\n  WHERE cat_id = 10\n  UNION ALL\n  -- Recursive: parent of the previous level\n  SELECT c.cat_id, c.name, c.parent_id, cp.level + 1\n  FROM categories c\n  JOIN category_path cp\n    ON c.cat_id = cp.parent_id   -- join reversed!\n)\nSELECT * FROM category_path\nORDER BY level DESC;`;
      const rows = walkUp(10).sort((a, b) => b.level - a.level);
      res.innerHTML = uTable(rows, ['cat_id', 'name', 'parent_id', 'level']);
      note.innerHTML = 'Same machine, join flipped: <code>c.cat_id = cp.parent_id</code> climbs Android → Smartphones → Mobiles → Electronics, stopping at the NULL parent.';
    } else if (m === 'count') {
      out.textContent = `WITH RECURSIVE descendants AS (\n  SELECT cat_id FROM categories WHERE cat_id = 2\n  UNION ALL\n  SELECT c.cat_id\n  FROM categories c\n  JOIN descendants d ON c.parent_id = d.cat_id\n)\nSELECT COUNT(*) - 1 AS total_subcategories\nFROM descendants;   -- minus Mobiles itself`;
      res.innerHTML = uTable([{ total_subcategories: walkDown(2).length - 1 }], ['total_subcategories']);
      note.innerHTML = 'Collect Mobiles plus everything beneath it, then subtract 1 to exclude Mobiles itself: Accessories, Smartphones, Cables, Chargers, Android, iOS → 6.';
    } else if (m === 'level3') {
      out.textContent = `WITH RECURSIVE category_levels AS (\n  SELECT cat_id, name, parent_id, 1 AS level\n  FROM categories WHERE cat_id = 1\n  UNION ALL\n  SELECT c.cat_id, c.name, c.parent_id, cl.level + 1\n  FROM categories c\n  JOIN category_levels cl ON c.parent_id = cl.cat_id\n)\nSELECT cat_id, name, level\nFROM category_levels\nWHERE level = 3;`;
      const rows = walkDown(1).filter(r => r.level === 3).map(r => ({ cat_id: r.cat_id, name: r.name, level: r.level }));
      res.innerHTML = uTable(rows, ['cat_id', 'name', 'level']);
      note.innerHTML = 'The CTE builds the whole tree with levels; the final WHERE keeps just one slice of it.';
    } else {
      out.textContent = `SELECT cat_id, name, parent_id\nFROM categories\nWHERE parent_id IS NOT NULL\n  AND parent_id NOT IN (\n    SELECT cat_id FROM categories\n  );`;
      const ids = cteCats.map(c => c.cat_id);
      const rows = cteCats.filter(c => c.parent_id !== null && !ids.includes(c.parent_id));
      res.innerHTML = uTable(rows, ['cat_id', 'name', 'parent_id']);
      note.innerHTML = 'OrphanCat points at parent 999, which doesn\'t exist — a disconnected branch no tree walk will ever reach. Worth hunting for before you trust any hierarchy.';
    }
  }
  cteTreePick.addEventListener('change', runTree);
  runTree();
}

// --- temp table result ---
const cteTempRes = document.getElementById('cte-temp-res');
if (cteTempRes) {
  const rows = cteAvgRatings()
    .sort((a, b) => a.restaurant.localeCompare(b.restaurant))
    .map(r => ({ restaurant: r.restaurant, avg_stars: cteFmtAvg(r.avg_stars), ratings_count: r.ratings_count }));
  cteTempRes.innerHTML = uTable(rows, ['restaurant', 'avg_stars', 'ratings_count']);
}

// --- games ---
buildClassify('cte-tool', 'cte-tool-score', [
  { label: 'Goal', prompt: 'Break a 3-step aggregation into readable named steps inside one query', options: [opt('CTE', true), opt('Temporary table'), opt('Correlated subquery')], why: 'Named sequential steps within a single statement → chained CTEs.' },
  { label: 'Goal', prompt: 'Reuse a computed summary across five separate queries in a session', options: [opt('Temporary table', true), opt('CTE'), opt('Recursive CTE')], why: 'A CTE dies with its query; a temp table lives for the whole session.' },
  { label: 'Goal', prompt: 'List every subcategory under "Electronics", any depth', options: [opt('Recursive CTE', true), opt('Plain CTE'), opt('Self-JOIN once')], why: 'Unknown depth needs recursion; one self-join only reaches one level.' },
  { label: 'Pick', prompt: 'The keyword that starts a CTE definition', code: true, options: [opt('WITH', true), opt('AS'), opt('WIDTH')], why: 'WITH cte_name AS (…) — and it\'s WITH, not "width".' },
  { label: 'Pick', prompt: 'The glue between anchor and recursive member', code: true, options: [opt('UNION ALL', true), opt('UNION'), opt('CROSS JOIN')], why: 'UNION ALL — plain UNION dedupes each iteration, which is slow and can break results.' },
  { label: 'Pick', prompt: 'Where should ORDER BY usually go?', options: [opt('The final query', true), opt('Inside each CTE'), opt('Both, to be safe')], why: 'Sorting inside a CTE is usually wasted work — the final query decides the order.' }
]);

buildClassify('cte-predict', 'cte-predict-score', [
  { label: 'Predict', prompt: 'avg_ratings WHERE avg_stars > 4.0 — which restaurants?', options: [opt('Cafe Aroma & Spice Box', true), opt('Spice Box only'), opt('Cafe Aroma, Spice Box & Burger Barn')], why: 'Cafe Aroma 4.5 and Spice Box 5.0. Burger Barn is exactly 4.0 — not greater.' },
  { label: 'Predict', prompt: 'Burger Barn has ratings 4 and NULL — its AVG(stars)?', options: [opt('4.0', true), opt('2.0'), opt('NULL')], why: 'AVG ignores NULL: 4 ÷ 1 = 4.0, not 4 ÷ 2.' },
  { label: 'Predict', prompt: 'WITH RECURSIVE … WHERE n < 5 counting from 1 — rows returned?', options: [opt('5', true), opt('4'), opt('Infinite')], why: 'n = 1..5: the row with n = 5 is produced, then the condition stops further recursion.' },
  { label: 'Predict', prompt: 'Category tree from Electronics — does OrphanCat appear?', options: [opt('No — its parent 999 doesn\'t exist', true), opt('Yes, at level 2'), opt('Yes, at the deepest level')], why: 'The walk only follows real parent→child links; OrphanCat is disconnected.' },
  { label: 'Predict', prompt: 'Semicolon placed right after the CTE\'s closing parenthesis — result?', options: [opt('Error / CTE is lost', true), opt('Works fine'), opt('CTE becomes permanent')], why: 'The semicolon ends the statement early — WITH and the final SELECT must be one statement.' },
  { label: 'Predict', prompt: 'Top salesperson pipeline — who wins and with what?', options: [opt('Aditi, 1200.00', true), opt('Neha, 1100.00'), opt('Rahul, 500.00')], why: '500 + 700 = 1200 for Aditi beats Neha\'s 1100.' }
]);

// ============ MODULE 17: DATES & TIMES ============
const dtEmployees = [
  { emp_id: 1,  name: 'Aditi', joining_date: '2028-03-15', department: 'Engineering' },
  { emp_id: 2,  name: 'Rohan', joining_date: '2028-11-04', department: 'Support' },
  { emp_id: 3,  name: 'Kiran', joining_date: '2029-03-22', department: 'Engineering' },
  { emp_id: 4,  name: 'Neha',  joining_date: '2028-02-29', department: 'HR' },
  { emp_id: 5,  name: 'Arjun', joining_date: null,         department: 'Engineering' },
  { emp_id: 6,  name: 'Farah', joining_date: '2028-01-01', department: 'Product' },
  { emp_id: 7,  name: 'Ishan', joining_date: '2028-12-31', department: 'Support' },
  { emp_id: 8,  name: 'Zoya',  joining_date: '2028-02-29', department: 'Engineering' },
  { emp_id: 9,  name: 'Kabir', joining_date: '2028-12-01', department: 'Finance' },
  { emp_id: 10, name: 'Tara',  joining_date: '2029-02-10', department: 'Support' }
];
const dtOrders = [
  { order_id: 501, customer: 'Asha',   order_date: '2029-01-05', amount: '349.00',  status: 'PLACED' },
  { order_id: 502, customer: 'Ravi',   order_date: '2029-01-18', amount: '1200.00', status: 'DELIVERED' },
  { order_id: 503, customer: 'Meera',  order_date: '2029-02-02', amount: '799.00',  status: 'DELIVERED' },
  { order_id: 504, customer: 'Asha',   order_date: '2028-12-30', amount: '499.00',  status: 'DELIVERED' },
  { order_id: 505, customer: 'Dev',    order_date: '2029-02-10', amount: '50.00',   status: 'CANCELLED' },
  { order_id: 506, customer: 'Isha',   order_date: '2028-02-29', amount: '999.00',  status: 'DELIVERED' },
  { order_id: 507, customer: 'Kabir',  order_date: '2029-03-01', amount: '199.00',  status: 'PLACED' },
  { order_id: 508, customer: 'Simran', order_date: '2029-03-15', amount: '299.00',  status: 'DELIVERED' },
  { order_id: 509, customer: 'Nikhil', order_date: '2028-11-11', amount: '899.00',  status: 'DELIVERED' },
  { order_id: 510, customer: 'Rohan',  order_date: '2029-04-23', amount: '149.00',  status: 'PLACED' },
  { order_id: 511, customer: 'Meera',  order_date: '2029-05-01', amount: '399.00',  status: 'CANCELLED' },
  { order_id: 512, customer: 'Asha',   order_date: '2029-02-28', amount: '129.00',  status: 'DELIVERED' }
];
const dtLogins = [
  { login_id: 1,  user: 'Ashwin', login_time: '2029-01-15 09:00:00', device: 'android', ip: '10.0.0.1' },
  { login_id: 2,  user: 'Ashwin', login_time: '2029-02-10 09:00:00', device: 'web',     ip: '10.0.0.2' },
  { login_id: 3,  user: 'Simran', login_time: '2029-01-20 20:15:00', device: 'ios',     ip: '10.0.0.3' },
  { login_id: 4,  user: 'Nikhil', login_time: '2029-02-10 00:00:00', device: 'web',     ip: '10.0.0.4' },
  { login_id: 5,  user: 'Nikhil', login_time: '2029-02-10 00:00:00', device: 'web',     ip: '10.0.0.5' },
  { login_id: 6,  user: 'Priya',  login_time: '2029-02-09 23:59:59', device: 'android', ip: '10.0.0.6' },
  { login_id: 7,  user: 'Priya',  login_time: '2029-02-10 23:59:59', device: 'android', ip: '10.0.0.7' },
  { login_id: 8,  user: 'Asha',   login_time: '2029-02-11 00:00:00', device: 'web',     ip: '10.0.0.8' },
  { login_id: 9,  user: 'Isha',   login_time: '2029-01-31 10:30:00', device: 'web',     ip: '10.0.0.9' },
  { login_id: 10, user: 'Isha',   login_time: '2029-02-01 10:30:00', device: 'web',     ip: '10.0.0.10' },
  { login_id: 11, user: 'Dev',    login_time: '2029-02-10 15:45:00', device: 'ios',     ip: '10.0.0.11' },
  { login_id: 12, user: 'Kabir',  login_time: '2029-02-05 08:00:00', device: 'web',     ip: '10.0.0.12' },
  { login_id: 13, user: 'Meera',  login_time: '2029-02-10 09:00:00', device: 'android', ip: '10.0.0.13' }
];
const dtDeliveries = [
  { order_id: 9001, order_placed_at: '2029-02-10 12:00:00', delivered_at: '2029-02-10 12:18:00' },
  { order_id: 9002, order_placed_at: '2029-02-10 12:05:00', delivered_at: '2029-02-10 12:42:00' },
  { order_id: 9003, order_placed_at: '2029-02-10 12:10:00', delivered_at: null },
  { order_id: 9004, order_placed_at: '2029-02-10 12:20:00', delivered_at: '2029-02-10 12:10:00' },
  { order_id: 9005, order_placed_at: '2029-02-10 13:00:00', delivered_at: '2029-02-10 13:31:00' },
  { order_id: 9006, order_placed_at: '2029-02-10 14:00:00', delivered_at: '2029-02-10 14:30:00' },
  { order_id: 9007, order_placed_at: '2029-02-09 23:55:00', delivered_at: '2029-02-10 00:25:00' },
  { order_id: 9008, order_placed_at: '2029-02-10 23:59:00', delivered_at: '2029-02-11 00:10:00' },
  { order_id: 9009, order_placed_at: '2029-02-11 12:00:00', delivered_at: '2029-02-11 12:20:00' },
  { order_id: 9010, order_placed_at: '2029-02-08 12:00:00', delivered_at: '2029-02-08 12:05:00' }
];
const dtTickets = [
  { ticket_id: 1001, customer: 'Isha',  opened_on: '2029-01-01', closed_on: '2029-01-05', status: 'CLOSED' },
  { ticket_id: 1002, customer: 'Dev',   opened_on: '2029-01-10', closed_on: null,         status: 'OPEN' },
  { ticket_id: 1003, customer: 'Asha',  opened_on: '2029-01-15', closed_on: '2029-01-16', status: 'CLOSED' },
  { ticket_id: 1007, customer: 'Kabir', opened_on: '2029-02-05', closed_on: null,         status: 'OPEN' }
];
// ISO strings compare chronologically as plain strings; parse only for arithmetic
const dtMs = s => new Date(s.replace(' ', 'T') + (s.length === 10 ? 'T00:00:00' : '')).getTime();
const dtYear = d => d === null ? null : d.slice(0, 4); // string, so uCell won't render "2,029"
const dtMonth = d => d === null ? null : Number(d.slice(5, 7));

// source tables
const dtEmpSrc = document.getElementById('dt-emp-src');
if (dtEmpSrc) {
  dtEmpSrc.innerHTML = uTable(dtEmployees, ['emp_id', 'name', 'joining_date', 'department']);
  document.getElementById('dt-ord-src').innerHTML = uTable(dtOrders, ['order_id', 'customer', 'order_date', 'amount', 'status']);
  document.getElementById('dt-log-src').innerHTML = uTable(dtLogins, ['login_id', 'user', 'login_time', 'device', 'ip']);
}

// --- extraction playground ---
const dtExOut = document.getElementById('dt-ex-out');
if (dtExOut) {
  const res = document.getElementById('dt-ex-res');
  const note = document.getElementById('dt-ex-note');
  function runEx(mode) {
    if (mode === 'date') {
      dtExOut.textContent = `SET @date_temp = DATE('2029-08-19');\n\nSELECT\n  YEAR(@date_temp)  AS year,\n  MONTH(@date_temp) AS month,\n  DAY(@date_temp)   AS day;`;
      res.innerHTML = uTable([{ year: '2029', month: 8, day: 19 }], ['year', 'month', 'day']);
      note.innerHTML = 'YEAR → four-digit year, MONTH → 1–12, DAY → 1–31. No time part needed.';
    } else if (mode === 'time') {
      dtExOut.textContent = `SET @datetime_temp = TIMESTAMP('2029-05-18 12:50:45');\n\nSELECT\n  HOUR(@datetime_temp)   AS hour,\n  MINUTE(@datetime_temp) AS minute,\n  SECOND(@datetime_temp) AS second;`;
      res.innerHTML = uTable([{ hour: 12, minute: 50, second: 45 }], ['hour', 'minute', 'second']);
      note.innerHTML = 'HOUR → 0–23, MINUTE and SECOND → 0–59. These need a DATETIME/TIMESTAMP — on a date-only value HOUR() is just 0.';
    } else {
      dtExOut.textContent = `SELECT\n  EXTRACT(YEAR  FROM @date_temp) AS year,\n  EXTRACT(MONTH FROM @date_temp) AS month,\n  EXTRACT(DAY   FROM @date_temp) AS day;`;
      res.innerHTML = uTable([{ year: '2029', month: 8, day: 19 }], ['year', 'month', 'day']);
      note.innerHTML = 'Same answers, standard-SQL spelling: say <em>what</em> to extract, then <code>FROM</code> <em>which value</em>. Portable across MySQL, PostgreSQL and friends.';
    }
  }
  sqSeg('dt-ex-seg', 'mode', runEx);
  runEx('date');
}

// --- employee scenarios ---
const dtEmpPick = document.getElementById('dt-emp-pick');
if (dtEmpPick) {
  const out = document.getElementById('dt-emp-out');
  const res = document.getElementById('dt-emp-res');
  const note = document.getElementById('dt-emp-note');
  function runEmp() {
    if (dtEmpPick.value === 'parts') {
      out.textContent = `SELECT emp_id, name,\n       YEAR(joining_date)  AS join_year,\n       MONTH(joining_date) AS join_month\nFROM employees;`;
      const rows = dtEmployees.map(e => ({
        emp_id: e.emp_id, name: e.name,
        join_year: dtYear(e.joining_date), join_month: dtMonth(e.joining_date)
      }));
      res.innerHTML = uTable(rows, ['emp_id', 'name', 'join_year', 'join_month']);
      note.innerHTML = 'Arjun\'s NULL date extracts to NULL, not 0 — <code>YEAR(NULL)</code> is NULL.';
    } else {
      out.textContent = `SELECT MONTH(joining_date) AS join_month,\n       YEAR(joining_date)  AS join_year,\n       COUNT(*)            AS hires\nFROM employees\nGROUP BY YEAR(joining_date), MONTH(joining_date)\nORDER BY join_month, join_year;`;
      const groups = {};
      dtEmployees.forEach(e => {
        const k = `${dtYear(e.joining_date)}|${dtMonth(e.joining_date)}`;
        groups[k] = (groups[k] || 0) + 1;
      });
      const rows = Object.entries(groups).map(([k, hires]) => {
        const [y, m] = k.split('|');
        return { join_month: y === 'null' ? null : Number(m), join_year: y === 'null' ? null : y, hires };
      }).sort((a, b) => {
        if (a.join_month === null) return -1;
        if (b.join_month === null) return 1;
        return a.join_month - b.join_month || a.join_year.localeCompare(b.join_year);
      });
      res.innerHTML = uTable(rows, ['join_month', 'join_year', 'hires']);
      note.innerHTML = 'Employees sharing a year+month collapse into one row. Arjun\'s NULL date forms its own (NULL, NULL) group — <code>COUNT(*)</code> still counts him.';
    }
  }
  dtEmpPick.addEventListener('change', runEmp);
  runEmp();
}

// --- date range playground ---
const dtRangePick = document.getElementById('dt-range-pick');
if (dtRangePick) {
  const out = document.getElementById('dt-range-out');
  const res = document.getElementById('dt-range-res');
  const note = document.getElementById('dt-range-note');
  function runRange() {
    let rows;
    if (dtRangePick.value === 'jan') {
      out.textContent = `SELECT order_id, customer, order_date\nFROM orders\nWHERE order_date BETWEEN '2029-01-01'\n                     AND '2029-01-31';\n\n-- identical:\n-- WHERE order_date >= '2029-01-01'\n--   AND order_date <= '2029-01-31'`;
      rows = dtOrders.filter(o => o.order_date >= '2029-01-01' && o.order_date <= '2029-01-31');
      note.innerHTML = 'Both boundary days are <em>included</em>. Safe here because <code>order_date</code> is a pure DATE — no hidden time to lose.';
    } else {
      out.textContent = `SELECT order_id, customer, order_date\nFROM orders\nWHERE order_date >= '2029-01-01'\n  AND order_date <  '2029-04-01';   -- half-open [Jan 1, Apr 1)`;
      rows = dtOrders.filter(o => o.order_date >= '2029-01-01' && o.order_date < '2029-04-01');
      note.innerHTML = 'One pattern covers the whole quarter — no need to remember that February has 28 days. Just point at the 1st of the next period.';
    }
    res.innerHTML = uTable(rows.map(o => ({ order_id: o.order_id, customer: o.customer, order_date: o.order_date })),
      ['order_id', 'customer', 'order_date']);
  }
  dtRangePick.addEventListener('change', runRange);
  runRange();
}

// --- BETWEEN + DATETIME trap ---
const dtTrapOut = document.getElementById('dt-trap-out');
if (dtTrapOut) {
  const res = document.getElementById('dt-trap-res');
  const note = document.getElementById('dt-trap-note');
  function runTrap(mode) {
    const jan = dtLogins.filter(l => l.login_time >= '2029-01-01' && l.login_time < '2029-02-01');
    let keep;
    if (mode === 'between') {
      dtTrapOut.textContent = `WHERE login_time BETWEEN '2029-01-01' AND '2029-01-31'\n\n-- silently becomes:\nWHERE login_time >= '2029-01-01 00:00:00'\n  AND login_time <= '2029-01-31 00:00:00'   -- ⚠ midnight!`;
      keep = jan.filter(l => l.login_time <= '2029-01-31 00:00:00');
      note.innerHTML = `<strong>${keep.length} of ${jan.length} January logins kept.</strong> Isha's <code>2029-01-31 10:30:00</code> is <em>gone</em> — everything after midnight on the 31st is excluded. This is the bug that makes daily report totals mysteriously not match.`;
    } else if (mode === 'endofday') {
      dtTrapOut.textContent = `WHERE login_time >= '2029-01-01 00:00:00'\n  AND login_time <= '2029-01-31 23:59:59'   -- ⚠ still risky`;
      keep = jan.filter(l => l.login_time <= '2029-01-31 23:59:59');
      note.innerHTML = `All ${jan.length} rows back — <em>on this data</em>. But a DATETIME(3) value like <code>23:59:59.500</code> would still slip through the crack. Works until it doesn't; not production-safe.`;
    } else {
      dtTrapOut.textContent = `WHERE login_time >= '2029-01-01 00:00:00'\n  AND login_time <  '2029-02-01 00:00:00'   -- ✅ [start, next_start)`;
      keep = jan;
      note.innerHTML = `All ${jan.length} January logins, guaranteed — any timestamp below Feb 1 midnight qualifies, fractional seconds included. Note Isha's <code>2029-02-01 10:30:00</code> correctly lands in February, not here.`;
    }
    res.innerHTML = uTable(keep.map(l => ({ login_id: l.login_id, user: l.user, login_time: l.login_time })),
      ['login_id', 'user', 'login_time']);
  }
  sqSeg('dt-trap-seg', 'mode', runTrap);
  runTrap('between');
}

// --- MIN / MAX playground ---
const dtMmPick = document.getElementById('dt-mm-pick');
if (dtMmPick) {
  const out = document.getElementById('dt-mm-out');
  const res = document.getElementById('dt-mm-res');
  const note = document.getElementById('dt-mm-note');
  const perUser = () => [...new Set(dtLogins.map(l => l.user))].map(u => {
    const ts = dtLogins.filter(l => l.user === u).map(l => l.login_time).sort();
    return { user: u, first_login: ts[0], latest_login: ts[ts.length - 1], total_logins: ts.length };
  });
  function runMm() {
    const m = dtMmPick.value;
    if (m === 'global') {
      out.textContent = `SELECT MIN(login_time) AS system_start,\n       MAX(login_time) AS system_last_activity\nFROM logins;`;
      const ts = dtLogins.map(l => l.login_time).sort();
      res.innerHTML = uTable([{ system_start: ts[0], system_last_activity: ts[ts.length - 1] }],
        ['system_start', 'system_last_activity']);
      note.innerHTML = 'No GROUP BY — one row for the whole table. MIN = the oldest point on the timeline, MAX = the newest.';
    } else if (m === 'peruser') {
      out.textContent = 'SELECT `user`,\n       MIN(login_time) AS first_login,\n       MAX(login_time) AS latest_login\nFROM logins\nGROUP BY `user`\nORDER BY `user`;';
      const rows = perUser().sort((a, b) => a.user.localeCompare(b.user))
        .map(({ user, first_login, latest_login }) => ({ user, first_login, latest_login }));
      res.innerHTML = uTable(rows, ['user', 'first_login', 'latest_login']);
      note.innerHTML = 'GROUP BY splits the timeline per person. One-login users (Asha, Dev…) show the same value twice — their first login <em>is</em> their latest.';
    } else if (m === 'engage') {
      out.textContent = 'SELECT `user`,\n       MAX(login_time) AS latest_activity,\n       COUNT(*) AS total_logins\nFROM logins\nGROUP BY `user`\nORDER BY total_logins DESC;';
      const rows = perUser().sort((a, b) => b.total_logins - a.total_logins)
        .map(({ user, latest_login, total_logins }) => ({ user, latest_activity: latest_login, total_logins }));
      res.innerHTML = uTable(rows, ['user', 'latest_activity', 'total_logins']);
      note.innerHTML = 'Frequency + recency in one report: are the heavy users also the recent ones?';
    } else if (m === 'android') {
      out.textContent = `SELECT MAX(login_time) AS latest_android_login\nFROM logins\nWHERE device = 'android';`;
      const ts = dtLogins.filter(l => l.device === 'android').map(l => l.login_time).sort();
      res.innerHTML = uTable([{ latest_android_login: ts[ts.length - 1] }], ['latest_android_login']);
      note.innerHTML = 'WHERE filters first, MAX runs on what\'s left — Priya\'s 23:59:59 login wins.';
    } else {
      out.textContent = `SELECT MIN(login_time) AS first_february_login\nFROM logins\nWHERE login_time >= '2029-02-01 00:00:00'\n  AND login_time <  '2029-03-01 00:00:00';`;
      const ts = dtLogins.filter(l => l.login_time >= '2029-02-01' && l.login_time < '2029-03-01')
        .map(l => l.login_time).sort();
      res.innerHTML = uTable([{ first_february_login: ts[0] }], ['first_february_login']);
      note.innerHTML = 'A half-open range narrows the timeline to February, then MIN finds its pioneer — Isha on Feb 1 at 10:30.';
    }
  }
  dtMmPick.addEventListener('change', runMm);
  runMm();
}

// --- DATEDIFF / TIMESTAMPDIFF ---
const dtDiffPick = document.getElementById('dt-diff-pick');
if (dtDiffPick) {
  const out = document.getElementById('dt-diff-out');
  const res = document.getElementById('dt-diff-res');
  const note = document.getElementById('dt-diff-note');
  function runDiff() {
    const m = dtDiffPick.value;
    if (m === 'days') {
      out.textContent = `SET @date_1 = '2029-01-10';\nSET @date_2 = '2029-07-19';\n\nSELECT DATEDIFF(@date_2, @date_1) AS days_diff;`;
      const days = Math.round((dtMs('2029-07-19') - dtMs('2029-01-10')) / 86400000);
      res.innerHTML = uTable([{ days_diff: days }], ['days_diff']);
      note.innerHTML = '<code>DATEDIFF(end, start)</code> — always whole days, and it only looks at the date portion. Even on timestamps, the times are ignored.';
    } else if (m === 'hours') {
      out.textContent = `SET @ts_1 = TIMESTAMP('2029-01-10 19:07:10');\nSET @ts_2 = TIMESTAMP('2029-01-11 12:07:10');\n\nSELECT TIMESTAMPDIFF(HOUR, @ts_1, @ts_2) AS hours_diff;`;
      const hours = Math.floor((dtMs('2029-01-11 12:07:10') - dtMs('2029-01-10 19:07:10')) / 3600000);
      res.innerHTML = uTable([{ hours_diff: hours }], ['hours_diff']);
      note.innerHTML = '<code>TIMESTAMPDIFF(unit, start, end)</code> — note the <em>reversed</em> argument order vs DATEDIFF! It counts complete units only: 1h 59m is still 1; 59m 59s is 0 hours. Need precision? Count minutes and divide by 60 yourself.';
    } else if (m === 'resolve') {
      out.textContent = `SELECT ticket_id, customer,\n       DATEDIFF(closed_on, opened_on) AS days_to_resolve\nFROM support_tickets\nWHERE status = 'CLOSED';`;
      const rows = dtTickets.filter(t => t.status === 'CLOSED').map(t => ({
        ticket_id: String(t.ticket_id), customer: t.customer,
        days_to_resolve: Math.round((dtMs(t.closed_on) - dtMs(t.opened_on)) / 86400000)
      }));
      res.innerHTML = uTable(rows, ['ticket_id', 'customer', 'days_to_resolve']);
      note.innerHTML = 'Calendar days from open to close — the classic SLA metric. If either date were NULL, the whole result would be NULL, which is why we filter to CLOSED first.';
    } else if (m === 'overdue') {
      out.textContent = `-- CURRENT_DATE = '2029-02-10'\nSELECT ticket_id, customer, opened_on\nFROM support_tickets\nWHERE status = 'OPEN'\n  AND opened_on < CURRENT_DATE;`;
      const rows = dtTickets.filter(t => t.status === 'OPEN' && t.opened_on < '2029-02-10')
        .map(t => ({ ticket_id: String(t.ticket_id), customer: t.customer, opened_on: t.opened_on }));
      res.innerHTML = uTable(rows, ['ticket_id', 'customer', 'opened_on']);
      note.innerHTML = 'Anything still OPEN from before today is backlog. Because it uses <code>CURRENT_DATE</code>, this query is <em>live</em> — run it tomorrow and today\'s new tickets join the list.';
    } else if (m === 'week') {
      out.textContent = `-- CURRENT_DATE = '2029-02-10'\nSELECT ticket_id, customer, opened_on\nFROM support_tickets\nWHERE opened_on >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY);`;
      const rows = dtTickets.filter(t => t.opened_on >= '2029-02-03')
        .map(t => ({ ticket_id: String(t.ticket_id), customer: t.customer, opened_on: t.opened_on }));
      res.innerHTML = uTable(rows, ['ticket_id', 'customer', 'opened_on']);
      note.innerHTML = '<code>DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)</code> builds a moving 7-day window — the marketing "new signups" pattern. Only Kabir\'s Feb 5 ticket falls inside [Feb 3, today].';
    } else {
      out.textContent = `-- CURRENT_DATE = '2029-02-10'\nSELECT login_id, \`user\`, login_time\nFROM logins\nWHERE login_time >= TIMESTAMP(CURRENT_DATE, '00:00:00')\n  AND login_time <  TIMESTAMP(DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), '00:00:00')\nORDER BY login_time, login_id;`;
      const rows = dtLogins.filter(l => l.login_time >= '2029-02-10 00:00:00' && l.login_time < '2029-02-11 00:00:00')
        .sort((a, b) => a.login_time.localeCompare(b.login_time) || a.login_id - b.login_id)
        .map(l => ({ login_id: l.login_id, user: l.user, login_time: l.login_time }));
      res.innerHTML = uTable(rows, ['login_id', 'user', 'login_time']);
      note.innerHTML = '"Today" is just a half-open interval built from <code>CURRENT_DATE</code>. Nikhil at exactly midnight is in; Asha at Feb 11 00:00:00 is the <em>next</em> day\'s first second — excluded.';
    }
  }
  dtDiffPick.addEventListener('change', runDiff);
  runDiff();
}

// --- delivery latency table ---
const dtDelRes = document.getElementById('dt-del-res');
if (dtDelRes) {
  const rows = dtDeliveries.map(d => {
    let minutes = null, status;
    if (d.delivered_at === null) status = 'Pending';
    else {
      const secs = Math.floor((dtMs(d.delivered_at) - dtMs(d.order_placed_at)) / 1000);
      minutes = Math.trunc(secs / 60);
      status = secs < 0 ? 'Bad Data' : (secs <= 60 * 30 ? 'On Time' : 'Slow');
    }
    return { order_id: String(d.order_id), order_placed_at: d.order_placed_at, delivered_at: d.delivered_at, delivery_minutes: minutes, delivery_status: status };
  });
  dtDelRes.innerHTML = uTable(rows, ['order_id', 'order_placed_at', 'delivered_at', 'delivery_minutes', 'delivery_status']);
}

// --- games ---
buildClassify('dt-tool', 'dt-tool-score', [
  { label: 'Goal', prompt: 'Get the month number out of a joining_date for a report column', options: [opt('MONTH()', true), opt('DATEDIFF()'), opt('BETWEEN')], why: 'Extraction in the SELECT list is exactly what MONTH()/YEAR()/DAY() are for.' },
  { label: 'Goal', prompt: 'Filter a DATETIME column to all of January — production-safe', options: [opt(">= '01-01' AND < '02-01'", true), opt("BETWEEN '01-01' AND '01-31'"), opt('YEAR() = … AND MONTH() = …')], why: 'The half-open interval catches every timestamp and keeps the index usable.' },
  { label: 'Goal', prompt: 'Each user\'s most recent activity', options: [opt('MAX(login_time) + GROUP BY', true), opt('MIN(login_time) + GROUP BY'), opt('COUNT(*)')], why: 'Newest = largest date value → MAX per group.' },
  { label: 'Goal', prompt: 'Whole days a support ticket has been open', options: [opt('DATEDIFF(CURRENT_DATE, opened_on)', true), opt('TIMESTAMPDIFF(SECOND, …)'), opt('MONTH(opened_on)')], why: 'DATEDIFF answers in days, ignoring times — perfect for age-in-days.' },
  { label: 'Goal', prompt: 'Delivery time in minutes between two timestamps', options: [opt('TIMESTAMPDIFF(MINUTE, placed, delivered)', true), opt('DATEDIFF(delivered, placed)'), opt('MINUTE(delivered)')], why: 'Unit-based difference over full timestamps → TIMESTAMPDIFF. DATEDIFF would say 0 for a same-day delivery.' },
  { label: 'Pick', prompt: 'WHERE YEAR(order_date) = 2029 is slow because…', options: [opt('the function hides the column from the index', true), opt('YEAR() is a slow function'), opt('2029 is a large number')], why: 'Wrapping the column makes the predicate non-SARGable — the engine must compute YEAR() for every row.' }
]);

buildClassify('dt-predict', 'dt-predict-score', [
  { label: 'Predict', prompt: 'YEAR(NULL) returns…', code: true, options: [opt('NULL', true), opt('0'), opt('An error')], why: 'Extraction on NULL yields NULL — Arjun shows NULL, NULL, not zeros.' },
  { label: 'Predict', prompt: "login_time BETWEEN '2029-01-01' AND '2029-01-31' — is Isha's Jan 31 10:30 login included?", options: [opt('No — the range ends at midnight on the 31st', true), opt('Yes — the 31st is inclusive'), opt('Error: types don\'t match')], why: "'2029-01-31' becomes '2029-01-31 00:00:00'; only the first second of the day is inside." },
  { label: 'Predict', prompt: 'MIN(login_time) per user for Asha, who logged in once — first vs latest?', options: [opt('Identical values', true), opt('Latest is NULL'), opt('First is NULL')], why: 'With one row in the group, MIN and MAX are the same timestamp.' },
  { label: 'Predict', prompt: "DATEDIFF('2029-07-19', '2029-01-10') = ?", code: true, options: [opt('190', true), opt('-190'), opt('6')], why: 'End minus start in whole days: 190. Swapped arguments would give -190.' },
  { label: 'Predict', prompt: 'TIMESTAMPDIFF(HOUR, 10:00:00, 11:59:00) same day = ?', code: true, options: [opt('1', true), opt('2'), opt('1.98')], why: 'Only complete hours count — 1h 59m is still just 1 whole hour.' },
  { label: 'Predict', prompt: 'Order 9007: placed 23:55, delivered 00:25 next day — delivery_minutes?', options: [opt('30 — On Time', true), opt('-1410 — Bad Data'), opt('NULL — Pending')], why: 'Timestamps carry the full date, so crossing midnight is just 30 ordinary minutes.' }
]);

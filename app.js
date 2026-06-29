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

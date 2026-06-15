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
  'rel-mn': `<strong>Many-to-Many (M : N)</strong> — both sides can link to many of the other. A student joins many batches; a batch has many students. SQL can't store this directly — you add a <em>junction table</em> (e.g. <code>enrollments</code>) holding one FK to each side.`
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

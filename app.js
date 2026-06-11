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

// scroll spy
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      tocLinks.forEach(l => l.classList.toggle('active', l.dataset.lesson === e.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
lessons.forEach(l => spy.observe(l));

// ============ REVEAL ON SCROLL ============
document.querySelectorAll('.lesson-head, .card, .lesson-foot').forEach(el => el.classList.add('reveal'));

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

// ============ QUIZ ============
const quiz = [
  { q: 'SQL stands for…', opts: ['Sequential Query Language', 'Structured Query Language', 'Simple Quoted Language', 'Server Query Logic'], a: 1 },
  { q: 'SQL is mainly a _______ language.', opts: ['Imperative — you say HOW', 'Declarative — you say WHAT', 'Object-oriented', 'Functional only'], a: 1 },
  { q: "Tracking real-time orders for millions of users. Which workload?", opts: ['OLAP', 'OLTP', 'Batch ETL', 'Spreadsheet'], a: 1 },
  { q: 'The "I" in ACID guarantees…', opts: ['Indexes are auto-created', "Concurrent transactions don't see each other's half-work", 'Inserts are faster than updates', 'IDs are always integers'], a: 1 },
  { q: 'A crash hits right after COMMIT. What happens to that data?', opts: ["It's lost", 'It survives — durability + the log recover it', "It's rolled back", 'It becomes read-only'], a: 1 }
];
const qEl = document.getElementById('quiz');
const scoreEl = document.getElementById('score');
let answered = 0, correct = 0;
quiz.forEach((item, i) => {
  const block = document.createElement('div');
  block.className = 'quiz-q';
  let html = `<div class="quiz-q-text">${i + 1}. ${item.q}</div>`;
  item.opts.forEach((opt, j) => {
    html += `<button class="qopt" data-q="${i}" data-o="${j}">${opt}</button>`;
  });
  block.innerHTML = html;
  qEl.appendChild(block);
});
qEl.addEventListener('click', e => {
  const b = e.target.closest('.qopt');
  if (!b || b.disabled) return;
  const qi = +b.dataset.q, oi = +b.dataset.o;
  const right = quiz[qi].a;
  const siblings = qEl.querySelectorAll(`.qopt[data-q="${qi}"]`);
  if ([...siblings].some(s => s.disabled)) return;
  siblings.forEach(s => s.disabled = true);
  siblings[right].classList.add('correct');
  if (oi !== right) b.classList.add('wrong');
  else correct++;
  answered++;
  if (answered === quiz.length) {
    const msg = correct === 5 ? `🎉 All 5 correct. You're ready for real queries.` :
                correct >= 3 ? `${correct} / 5 — Solid foundation.` :
                `${correct} / 5 — Re-skim lessons 2 and 6.`;
    scoreEl.textContent = msg;
    scoreEl.style.color = correct >= 3 ? 'var(--success)' : 'var(--warning)';
    if (correct === 5) {
      const r = scoreEl.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + 20);
    }
  } else {
    scoreEl.textContent = `${answered} / ${quiz.length} answered…`;
  }
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

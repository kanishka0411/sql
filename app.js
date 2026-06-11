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

// ============ LESSON 4: SQL playground ============
const students = [
  { id: 1, name: 'Aisha Khan', city: 'Mumbai', is_active: 1, fees_paid: 1 },
  { id: 2, name: 'Raj Patel', city: 'Pune', is_active: 0, fees_paid: 1 },
  { id: 3, name: 'Meera Joshi', city: 'Mumbai', is_active: 1, fees_paid: 0 },
  { id: 4, name: 'Vikram Rao', city: 'Delhi', is_active: 1, fees_paid: 1 },
  { id: 5, name: 'Sara Iyer', city: 'Mumbai', is_active: 0, fees_paid: 0 },
  { id: 6, name: 'Arjun Das', city: 'Pune', is_active: 1, fees_paid: 1 }
];
const queries = {
  all:           { sql: 'SELECT * FROM students;',                                              f: () => students },
  active:        { sql: 'SELECT * FROM students\nWHERE is_active = 1;',                        f: () => students.filter(s => s.is_active) },
  mumbai:        { sql: "SELECT * FROM students\nWHERE city = 'Mumbai';",                      f: () => students.filter(s => s.city === 'Mumbai') },
  paid:          { sql: 'SELECT * FROM students\nWHERE fees_paid = 1;',                        f: () => students.filter(s => s.fees_paid) },
  active_unpaid: { sql: 'SELECT * FROM students\nWHERE is_active = 1\n  AND fees_paid = 0;',   f: () => students.filter(s => s.is_active && !s.fees_paid) }
};
function renderRows(rows) {
  if (!rows.length) return '<div class="muted" style="padding:10px 0;">0 rows.</div>';
  let h = '<table class="rt"><thead><tr><th>id</th><th>name</th><th>city</th><th>is_active</th><th>fees_paid</th></tr></thead><tbody>';
  rows.forEach(r => {
    h += `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.city}</td><td>${r.is_active}</td><td>${r.fees_paid}</td></tr>`;
  });
  h += `</tbody></table><div class="rt-count">${rows.length} row${rows.length === 1 ? '' : 's'} returned.</div>`;
  return h;
}
function setFilter(key) {
  document.querySelectorAll('#fbar .fbtn').forEach(b => b.classList.toggle('on', b.dataset.f === key));
  document.getElementById('sqlq').textContent = queries[key].sql;
  document.getElementById('rtbl').innerHTML = renderRows(queries[key].f());
}
document.querySelectorAll('#fbar .fbtn').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));
setFilter('all');

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

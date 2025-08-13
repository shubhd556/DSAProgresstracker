
/* ====== CONFIG ====== */
const DATA_URL = './data/neetcode150.json'; // relative path
const POINTS_BY_DIFFICULTY = { Easy: 10, Medium: 20, Hard: 30 };
const STORAGE_KEYS = {
    done: 'nc150_done',
    points: 'nc150_points',
};

/* ====== STATE ====== */
let PROBLEMS = []; // flat array {id,title,link,topic,difficulty}
let TOPICS = [];   // list of topic names
let doneSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.done) || '[]'));
let gloryPoints = Number(localStorage.getItem(STORAGE_KEYS.points) || 0);

/* ====== UTIL ====== */
const $ = (sel, root = document) => root.querySelector(sel);
const $all = (sel, root = document) => [...root.querySelectorAll(sel)];
const by = (k, dir = 'asc') =>
    (a, b) => (a[k] < b[k] ? (dir === 'asc' ? -1 : 1) : a[k] > b[k] ? (dir === 'asc' ? 1 : -1) : 0);

function saveProgress() {
    localStorage.setItem(STORAGE_KEYS.done, JSON.stringify([...doneSet]));
    localStorage.setItem(STORAGE_KEYS.points, String(gloryPoints));
    const el = $('#gloryPoints');
    if (el) el.textContent = gloryPoints;
    renderStats();
}

// Robust confetti call (library already loaded via CDN in index.html)
// --- Confetti loader with CDN fallback ---
let confettiReadyPromise;

function ensureConfettiLoaded() {
    if (window.confetti) return Promise.resolve(window.confetti);
    if (confettiReadyPromise) return confettiReadyPromise;

    const cdns = [
        'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/canvas-confetti/1.9.3/confetti.browser.min.js'
    ];

    confettiReadyPromise = new Promise((resolve, reject) => {
        let i = 0;
        const tryNext = () => {
            if (i >= cdns.length) return reject(new Error('Confetti CDN failed to load'));
            const s = document.createElement('script');
            s.src = cdns[i++]; s.async = true; s.referrerPolicy = 'no-referrer';
            s.onload = () => resolve(window.confetti);
            s.onerror = () => { s.remove(); tryNext(); };
            document.head.appendChild(s);
        };
        tryNext();
    });

    return confettiReadyPromise;
}

async function fireConfetti() {
    // Respect users with reduced motion
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        console.info('Reduced-motion is enabled; confetti suppressed.');
        return;
    }
    try {
        await ensureConfettiLoaded();
        window.confetti({
            particleCount: 180,
            spread: 200,
            origin: { y: 0.8},
            // Library also supports this flag; combined with the media query above
            // ensures we "confetti responsibly".
            disableForReducedMotion: true
        });
    } catch (e) {
        console.warn('Confetti not available:', e);
    }
}


/* ====== LOAD DATA ====== */
async function loadData() {
    try {
        const res = await fetch(DATA_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        normalize(data);
    } catch (err) {
        console.warn('Failed to load dataset from', DATA_URL, err);
        // Fallback to minimal sample dataset so the app still works
        const sample = [
            {
                topic: "Arrays & Hashing", items: [
                    { id: "two-sum", title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy" },
                    { id: "group-anagrams", title: "Group Anagrams", link: "https://leetcode.com/problems/group-anagrams/", difficulty: "Medium" }
                ]
            },
            {
                topic: "Two Pointers", items: [
                    { id: "valid-palindrome", title: "Valid Palindrome", link: "https://leetcode.com/problems/valid-palindrome/", difficulty: "Easy" }
                ]
            }
        ];
        normalize(sample);
        // Show a gentle note in UI
        const note = document.createElement('div');
        note.style.cssText = 'margin:8px 0 16px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;padding:8px 12px;border-radius:8px';
        note.textContent = 'Data file not found; loaded sample data. On Netlify this will auto-fix.';
        const main = document.querySelector('main');
        main?.insertBefore(note, main.firstChild);
    }
}

function normalize(data) {
    PROBLEMS = data.flatMap(section =>
        section.items.map(item => ({
            id: item.id,
            title: item.title,
            link: item.link,
            difficulty: item.difficulty,
            topic: section.topic
        }))
    );
    TOPICS = data.map(s => s.topic);
}

/* ====== RENDER: TOPICS (accordions) ====== */
function renderTopics() {
    const container = $('#topicsContainer');
    if (!container) return;
    container.innerHTML = '';

    const grouped = groupBy(PROBLEMS, 'topic');
    Object.entries(grouped).forEach(([topic, items]) => {
        const doneCount = items.filter(p => doneSet.has(p.id)).length;
        const details = document.createElement('details');
        details.className = 'section';
        details.open = false;

        const summary = document.createElement('summary');

        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';

        const h3 = document.createElement('h3');
        h3.textContent = topic;

        const sub = document.createElement('span');
        sub.className = 'sub';
        sub.textContent = `${doneCount}/${items.length}`;

        left.appendChild(h3);
        left.appendChild(sub);

        const prog = document.createElement('div');
        prog.className = 'progress';
        const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;
        prog.innerHTML = `
      <div class="bar"><span style="width:${pct}%"></span></div>
      <div class="meta">${pct}%</div>
    `;

        summary.appendChild(left);
        summary.appendChild(prog);

        const list = document.createElement('div');
        items.forEach(p => list.appendChild(renderProblemRow(p)));

        details.appendChild(summary);
        details.appendChild(list);
        container.appendChild(details);
    });
}

function renderProblemRow(p) {
    const row = document.createElement('div');
    row.className = 'problem';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'checkbox';
    cb.checked = doneSet.has(p.id);
    cb.addEventListener('change', () => toggleDone(p, cb.checked));

    const title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>`;

    const diff = document.createElement('span');
    diff.className = 'badge ' + p.difficulty.toLowerCase();
    diff.textContent = p.difficulty;

    const topic = document.createElement('span');
    topic.className = 'badge';
    topic.textContent = p.topic;

    const pts = document.createElement('span');
    pts.className = 'badge';
    pts.textContent = `+${POINTS_BY_DIFFICULTY[p.difficulty]}`;

    row.append(cb, title, diff, topic, pts);
    return row;
}

/* ====== RENDER: ALL PROBLEMS TABLE ====== */
function renderAllProblems() {
    const selectTopic = $('#filterTopic');
    const tbody = $('#allProblemsTbody');
    if (!tbody) return;

    // populate topic filter once
    if (selectTopic && selectTopic.childElementCount === 1) {
        TOPICS.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t; opt.textContent = t;
            selectTopic.appendChild(opt);
        });
    }

    const search = $('#searchInput')?.value.trim().toLowerCase() || '';
    const tFilter = selectTopic?.value || '';
    const dFilter = $('#filterDifficulty')?.value || '';
    const sFilter = $('#filterStatus')?.value || '';
    const sort = $('#sortBy')?.value || 'title-asc';

    let rows = PROBLEMS.slice();

    if (search) rows = rows.filter(p => p.title.toLowerCase().includes(search));
    if (tFilter) rows = rows.filter(p => p.topic === tFilter);
    if (dFilter) rows = rows.filter(p => p.difficulty === dFilter);
    if (sFilter === 'done') rows = rows.filter(p => doneSet.has(p.id));
    if (sFilter === 'todo') rows = rows.filter(p => !doneSet.has(p.id));

    const [k, dir] = sort.split('-');
    if (k === 'difficulty') {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        rows.sort((a, b) => (order[a.difficulty] - order[b.difficulty]) * (dir === 'asc' ? 1 : -1) || a.title.localeCompare(b.title));
    } else if (k === 'topic') {
        rows.sort((a, b) => a.topic.localeCompare(b.topic) * (dir === 'asc' ? 1 : -1) || a.title.localeCompare(b.title));
    } else {
        rows.sort(by('title', dir));
    }

    tbody.innerHTML = '';
    rows.forEach(p => {
        const tr = document.createElement('tr');

        const tdStatus = document.createElement('td');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = doneSet.has(p.id);
        cb.addEventListener('change', () => toggleDone(p, cb.checked));
        tdStatus.appendChild(cb);

        const tdTitle = document.createElement('td');
        tdTitle.innerHTML = `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>`;

        const tdDiff = document.createElement('td');
        tdDiff.innerHTML = `<span class="badge ${p.difficulty.toLowerCase()}">${p.difficulty}</span>`;

        const tdTopic = document.createElement('td');
        tdTopic.textContent = p.topic;

        const tdPts = document.createElement('td');
        tdPts.textContent = `+${POINTS_BY_DIFFICULTY[p.difficulty]}`;

        tr.append(tdStatus, tdTitle, tdDiff, tdTopic, tdPts);
        tbody.appendChild(tr);
    });
}

/* ====== RENDER: STATS ====== */
function renderStats() {
    const done = PROBLEMS.filter(p => doneSet.has(p.id)).length;
    const bar = $('#overallProgressBar');
    const count = $('#overallCount');
    if (bar) bar.style.width = `${(done / (PROBLEMS.length || 1)) * 100}%`;
    if (count) count.textContent = `${done}/${PROBLEMS.length}`;

    const diffs = ['Easy', 'Medium', 'Hard'];
    const diffUl = $('#difficultyBreakdown');
    if (diffUl) diffUl.innerHTML = diffs.map(d => {
        const total = PROBLEMS.filter(p => p.difficulty === d).length;
        const dcount = PROBLEMS.filter(p => p.difficulty === d && doneSet.has(p.id)).length;
        return `<li><strong>${d}</strong>: ${dcount}/${total}</li>`;
    }).join('');

    const topicUl = $('#topicBreakdown');
    if (topicUl) topicUl.innerHTML = TOPICS.map(t => {
        const total = PROBLEMS.filter(p => p.topic === t).length;
        const dcount = PROBLEMS.filter(p => p.topic === t && doneSet.has(p.id)).length;
        return `<li><strong>${t}</strong>: ${dcount}/${total}</li>`;
    }).join('');
}

/* ====== ACTIONS ====== */
function toggleDone(p, checked) {
    const already = doneSet.has(p.id);
    if (checked && !already) {
        doneSet.add(p.id);
        gloryPoints += POINTS_BY_DIFFICULTY[p.difficulty] || 0;
        fireConfetti();
    } else if (!checked && already) {
        doneSet.delete(p.id);
        gloryPoints -= POINTS_BY_DIFFICULTY[p.difficulty] || 0;
    }
    saveProgress();
    renderTopics();
    renderAllProblems();
}

function exportProgress() {
    const blob = new Blob([JSON.stringify({
        done: [...doneSet],
        points: gloryPoints
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'neetcode150-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
}

function importProgress(json) {
    try {
        const data = JSON.parse(json);
        if (Array.isArray(data.done)) {
            doneSet = new Set(data.done);
        }
        if (typeof data.points === 'number') {
            gloryPoints = data.points;
        }
        saveProgress();
        renderTopics();
        renderAllProblems();
    } catch (e) {
        alert('Invalid JSON.');
    }
}

function bindUI() {
    // Tabs
    $all('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
            $all('.tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const target = btn.dataset.tab;
            $all('.tab-panel').forEach(p => p.hidden = true);
            if (target === 'topics') $('#tab-topics').hidden = false;
            if (target === 'all-problems') $('#tab-all-problems').hidden = false;
            if (target === 'stats') $('#tab-stats').hidden = false;
        });
    });
    
    // Filters
    ['searchInput', 'filterTopic', 'filterDifficulty', 'filterStatus', 'sortBy']
        .forEach(id => {
            const el = $('#' + id);
            if (el) el.addEventListener('input', renderAllProblems);
        });

    // Toolbar
    $('#btnReset')?.addEventListener('click', () => {
        if (confirm('Reset your progress and points?')) {
            doneSet.clear();
            gloryPoints = 0;
            saveProgress();
            renderTopics();
            renderAllProblems();
        }
    });

    $('#btnExport')?.addEventListener('click', exportProgress);
    $('#btnTestConfetti')?.addEventListener('click', () => fireConfetti());

    $('#btnImport')?.addEventListener('click', async () => {
        const filePicker = document.createElement('input');
        filePicker.type = 'file';
        filePicker.accept = 'application/json';
        filePicker.onchange = async () => {
            const f = filePicker.files[0];
            if (!f) return;
            const text = await f.text();
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed) && parsed[0]?.topic && parsed[0]?.items) {
                    await replaceDataset(parsed);
                } else {
                    importProgress(text);
                }
            } catch (e) { alert('Invalid JSON.'); }
        };
        filePicker.click();
    });
}

async function replaceDataset(newData) {
    normalize(newData);
    renderTopics();
    renderAllProblems();
    renderStats();
    alert('Dataset loaded from JSON.');
}

/* ====== HELPERS ====== */
function groupBy(arr, key) {
    return arr.reduce((m, it) => ((m[it[key]] ??= []).push(it), m), {});
}

/* ====== INIT ====== */
(function wireGlobalError() {
    window.addEventListener('error', e => {
        console.error('App error:', e?.error || e);
    });
})();

(async function init() {
    const gp = $('#gloryPoints');
    if (gp) gp.textContent = gloryPoints;
    bindUI();
    await loadData();
    renderTopics();
    renderAllProblems();
    renderStats();
})();

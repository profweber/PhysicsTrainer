"use strict";
/* ====================================================================== Grundlagen */
const VERSION = "1.0";
const CLAUDE_URL = "https://claude.ai/artifact/8RCA5axkuq7qL9z5iaBoFC";   // Claude-Version mit KI-Tutor (für die Version ohne Tutor)
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function announce(text) { const a = $("announce"); a.textContent = ""; setTimeout(() => { a.textContent = text; }, 30); }
function ticker(fn) { const t0 = Date.now(); fn(0); const id = setInterval(() => fn(Math.round((Date.now() - t0) / 1000)), 1000); return () => clearInterval(id); }
const fmtSecs = s => s < 60 ? s + " s" : Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") + " min";
const LEVELS = ["", "Einstieg", "Anwendung", "Transfer"];

// Zahl für Formeln: signifikante Stellen, Dezimalkomma als {,}, große/kleine Zahlen mit Zehnerpotenz
function numStr(x, sig = 3) {
  if (!isFinite(x)) return "–";
  if (x === 0) return "0";
  const r = Number(x.toPrecision(sig)), a = Math.abs(r);
  if (a >= 1e6 || a < 1e-3) {
    const e = Math.floor(Math.log10(a)); const m = Number((r / Math.pow(10, e)).toPrecision(sig));
    return { m: String(m), e };
  }
  return String(r);
}
function tx(x, sig = 3) {
  const s = numStr(x, sig);
  if (typeof s === "object") return `${s.m.replace(".", "{,}")} \\cdot 10^{${s.e}}`;
  return s.replace(".", "{,}");
}
function plain(x, sig = 3) {
  const s = numStr(x, sig);
  if (typeof s === "object") return `${s.m.replace(".", ",")}·10^${s.e}`;
  return s.replace(".", ",");
}

/* ---- Zufallszahlen mit Startwert: jede Aufgabe hat eigene, aber reproduzierbare Zahlen */
function rng(seed) {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return {
    next,
    step(a0, b0, st) { const n = Math.round((b0 - a0) / st); return Number((a0 + st * Math.floor(next() * (n + 1))).toFixed(6)); },
    pick(arr) { return arr[Math.floor(next() * arr.length)]; },
  };
}
const newSeed = () => Math.floor(Math.random() * 2 ** 31);

/* ====================================================================== Formeln und Markdown */
function texHtml(src, display) {
  if (window.katex) { try { return katex.renderToString(src, { displayMode: display, throwOnError: false, output: "html", strict: "ignore" }); } catch (e) {} }
  return `<code>${esc(src)}</code>`;
}
function mathOut(text, store) {
  const keep = html => { store.push(html); return "\u0000" + (store.length - 1) + "\u0000"; };
  return text.split(/(`[^`\n]*`)/).map((seg, i) => i % 2 ? seg : seg
    .replace(/\$\$([\s\S]+?)\$\$/g, (a, m) => keep(texHtml(m.trim(), true)))
    .replace(/(^|[^\\$\w])\$(?=\S)([^$\n]*?\S)\$(?![\w$])/g, (a, pre, m) => pre + keep(texHtml(m, false)))
  ).join("");
}
const mathIn = (html, store) => html.replace(/\u0000(\d+)\u0000/g, (a, n) => store[+n]);
const SEC = {};
SKRIPT.forEach(c => c.sections.forEach(s => { SEC[s.id] = { ...s, ch: c.ch }; }));
const refChip = id => SEC[id] ? `<a class="ref" href="#skript-${id}" data-sec="${id}"><b>${esc(id)}</b>${esc(SEC[id].title)}</a>` : esc(id);
function inlineMd(s) {
  const codes = [];
  return s
    .replace(/`([^`\n]+)`/g, (all, c) => { codes.push(c); return "\u0001" + (codes.length - 1) + "\u0001"; })
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[\[\s*(\d\.\d)\s*\]\]/g, (all, id) => SEC[id] ? refChip(id) : all)
    .replace(/\u0001(\d+)\u0001/g, (all, n) => `<code>${codes[+n]}</code>`);
}
function md(text) {
  const store = [];
  const lines = esc(mathOut(String(text), store)).split("\n");
  let html = "", list = null, para = [];
  const flush = () => { if (para.length) { html += `<p>${inlineMd(para.join("<br>"))}</p>`; para = []; } };
  const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const ul = /^\s*[-*]\s+(.*)$/.exec(line), ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ul || ol) {
      flush();
      const type = ul ? "ul" : "ol";
      if (list !== type) { closeList(); html += `<${type}>`; list = type; }
      html += `<li>${inlineMd((ul || ol)[1])}</li>`;
    } else if (line.trim() === "") { flush(); closeList(); }
    else if (/^#{1,4}\s/.test(line)) { flush(); closeList(); html += `<p><strong>${inlineMd(line.replace(/^#+\s/, ""))}</strong></p>`; }
    else { closeList(); para.push(line); }
  }
  flush(); closeList();
  return mathIn(html, store);
}
const mdInline = text => md(text).replace(/^<p>|<\/p>$/g, "");

/* ====================================================================== Zustand */
const store = {
  get(k, d) { try { const v = localStorage.getItem("pt." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("pt." + k, JSON.stringify(v)); } catch (e) {} },
};
const CH_ORDER = SKRIPT.map(c => c.ch);
const S = {
  progress: store.get("progress", {}),   // id -> {solved, attempts, hints, peeked, clean, seed, inputs}
  levels: store.get("levels", {}),
  mode: store.get("mode", "auto"),
  selected: new Set(store.get("selected", CH_ORDER)),
  expanded: new Set(store.get("expanded", [])),
  currentId: store.get("current", null),
  welcomed: store.get("welcomed", false),
  lastJudge: null,
};
const save = () => {
  store.set("progress", S.progress); store.set("levels", S.levels); store.set("mode", S.mode); store.set("selected", [...S.selected]);
  store.set("expanded", [...S.expanded]); store.set("current", S.currentId); store.set("welcomed", S.welcomed);
};
const byId = id => TASKS.find(e => e.id === id);
const current = () => byId(S.currentId);
const prog = id => (S.progress[id] ||= { solved: false, attempts: 0, hints: 0, peeked: false, clean: false, seed: newSeed(), inputs: {} });
const paramsOf = ex => ex.params(rng(prog(ex.id).seed));
const chapterTasks = ch => TASKS.filter(e => e.ch === ch);
const lvlState = ch => (S.levels[ch] ||= { level: 1, streak: 0, struggle: 0 });
const targetLevel = ch => S.mode === "auto" ? lvlState(ch).level : Number(S.mode);
const chTitle = ch => SKRIPT.find(c => c.ch === ch).title;

/* ====================================================================== Aufgabenwahl und Stufen (wie im CodingTrainer) */
function pickNext(excludeId) {
  const chs = CH_ORDER.filter(c => S.selected.has(c));
  if (!chs.length) return null;
  const score = c => { const ex = chapterTasks(c); return ex.filter(e => prog(e.id).solved).length / ex.length; };
  const order = chs.map(c => ({ c, s: score(c) + Math.random() * 0.25 })).sort((x, y) => x.s - y.s).map(x => x.c);
  const cand = [];
  order.forEach((c, rank) => chapterTasks(c).filter(e => !prog(e.id).solved && e.id !== excludeId)
    .forEach(e => cand.push({ e, d: Math.abs(e.lvl - targetLevel(c)), rank })));
  if (!cand.length) return null;
  const bestD = Math.min(...cand.map(x => x.d)), close = cand.filter(x => x.d === bestD);
  const bestRank = Math.min(...close.map(x => x.rank)), pool = close.filter(x => x.rank === bestRank).map(x => x.e);
  return pool[Math.floor(Math.random() * pool.length)];
}
let adaptMsg = "";
function adapt(ex, kind) {
  const st = lvlState(ex.ch);
  adaptMsg = "";
  if (kind === "clean") {
    st.streak += 1; st.struggle = 0;
    if (st.streak >= 2 && st.level < 3) { st.level += 1; st.streak = 0; adaptMsg = `Stark! In Kapitel ${ex.ch} geht es jetzt auf Stufe ${st.level} weiter.`; }
  } else if (kind === "solved") st.streak = 0;
  else if (kind === "struggle" || kind === "peek") {
    st.streak = 0; st.struggle += 1;
    if (st.struggle >= (kind === "peek" ? 1 : 2) && st.level > 1) { st.level -= 1; st.struggle = 0; adaptMsg = `In Kapitel ${ex.ch} geht es auf Stufe ${st.level} weiter – erst festigen, dann steigern.`; }
  }
  save(); renderLevel();
}

/* ====================================================================== Darstellung */
const pips = n => `<span class="pips" role="img" aria-label="Stufe ${n} von 3">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
function renderHeader() {
  $("tb-version").textContent = "v" + VERSION;
  $("subtitle").innerHTML = `Übungen zum Skript „<a href="#skript" data-sec="">${esc(SKRIPT_TITLE)}</a>“ · Hochschule Trier · v${VERSION}`;
  const done = TASKS.filter(e => prog(e.id).solved).length;
  $("solved-count").textContent = `${done} / ${TASKS.length}`;
}
function renderChapters() {
  $("chapters").innerHTML = SKRIPT.map(c => {
    const ex = chapterTasks(c.ch), solved = ex.filter(e => prog(e.id).solved).length, on = S.selected.has(c.ch), open = S.expanded.has(c.ch);
    const list = open ? `<ul class="ex-list" id="exl-${c.ch}">${ex.map(e => {
      const p = prog(e.id), st = p.solved ? "solved" : p.peeked ? "peek" : p.attempts ? "tried" : "";
      const stTxt = { solved: "gelöst", peek: "Lösung angesehen", tried: "versucht", "": "offen" }[st];
      return `<li><button type="button" class="${e.lvl === targetLevel(e.ch) ? "" : "off-level"}" data-ex="${e.id}" aria-current="${e.id === S.currentId}"><span class="ex-state ${st}" aria-hidden="true"></span><span>${esc(e.title)}<span class="sr">, Stufe ${e.lvl} von 3, ${stTxt}</span></span>${pips(e.lvl).replace('role="img"', 'aria-hidden="true"')}</button></li>`;
    }).join("")}</ul>` : "";
    return `<li class="chap ${on ? "" : "off"}"><div class="chap-row"><label><input type="checkbox" data-ch="${c.ch}" ${on ? "checked" : ""} aria-label="Kapitel ${c.ch} bei „Nächste Aufgabe“ berücksichtigen"></label><button type="button" class="chap-open" data-open="${c.ch}" aria-expanded="${open}"><span class="chap-num">${c.ch}</span><span class="chap-title">${esc(c.title)}</span><span class="chap-count">${solved}/${ex.length}</span><span class="caret" aria-hidden="true">▶</span></button><span class="chap-bar" aria-hidden="true"><i style="width:${100 * solved / ex.length}%"></i></span></div>${list}</li>`;
  }).join("");
  $("toggle-all").textContent = S.selected.size === CH_ORDER.length ? "keine wählen" : "alle wählen";
  $("legend").innerHTML = `<span><i class="ex-state"></i>offen</span><span><i class="ex-state tried"></i>versucht</span><span><i class="ex-state solved"></i>gelöst</span><span><i class="ex-state peek"></i>Lösung angesehen</span><span>☑ = Kapitel wird bei „Nächste Aufgabe“ berücksichtigt</span>`;
}
function renderLevel() {
  document.querySelectorAll("#mode-seg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode) === String(S.mode)));
  const ex = current(), ch = ex ? ex.ch : "1", l = lvlState(ch).level;
  $("level-note").innerHTML = S.mode === "auto"
    ? `Automatisch: Stufe <b>${l}</b> (${LEVELS[l]}) in Kapitel ${ch}. Zwei saubere Lösungen in Folge → eine Stufe höher.`
    : `Feste Stufe ${S.mode} (${LEVELS[S.mode]}) für alle gewählten Kapitel.`;
}
function renderTask() {
  const ex = current();
  if (!ex) {
    $("task-title").textContent = "Alles erledigt";
    $("task-tag").innerHTML = "";
    $("task-body").innerHTML = `<p class="empty">${S.selected.size ? "Sie haben alle Aufgaben der gewählten Kapitel gelöst. Wählen Sie weitere Kapitel aus." : "Wählen Sie in der Kapitelliste mindestens ein Kapitel aus."}</p>`;
    $("task-refs").innerHTML = ""; ["work-panel", "check-panel"].forEach(id => { $(id).hidden = true; }); $("result-panel").hidden = true;
    return;
  }
  ["work-panel", "check-panel"].forEach(id => { $(id).hidden = false; });
  const p = paramsOf(ex);
  $("task-title").textContent = ex.title;
  $("task-tag").innerHTML = `<span>Kapitel ${ex.ch} · ${esc(chTitle(ex.ch))}</span><span class="tag-lvl">${pips(ex.lvl)} ${LEVELS[ex.lvl]}</span>`;
  $("task-body").innerHTML = md(ex.text(p));
  $("task-refs").innerHTML = `<span class="eyebrow">Im Skript:</span> ${ex.refs.map(refChip).join(" ")}`;
  $("mbar-info").textContent = `Kap. ${ex.ch} · ${ex.title}`;
}
function placeholderFor(cp) { return cp.unit ? `z.B. 12,5 ${cp.unit}` : "Zahl, z.B. 1,25"; }
function renderChecks() {
  const ex = current(); if (!ex) return;
  const p = prog(ex.id);
  $("checks").innerHTML = ex.checks.map(cp => `<div class="cp" data-k="${cp.k}">
      <label class="cp-l" for="cp-${cp.k}"><span class="sym">${texHtml(cp.sym, false)}</span><span class="nm">${esc(cp.name)}</span></label>
      <input id="cp-${cp.k}" type="text" inputmode="text" autocomplete="off" spellcheck="false" value="${esc(p.inputs[cp.k] || "")}" placeholder="${esc(placeholderFor(cp))}" aria-describedby="cpm-${cp.k}">
      <span class="cp-msg" id="cpm-${cp.k}" aria-live="polite"></span></div>`).join("");
  setCheckStatus("");
  if (S.lastJudge && S.lastJudge.id === ex.id) showJudge(S.lastJudge.res, false);
}
$("checks").addEventListener("input", e => {
  const ex = current(), k = e.target.closest(".cp")?.dataset.k;
  if (!ex || !k) return;
  prog(ex.id).inputs[k] = e.target.value;
  e.target.className = ""; const m = $("cpm-" + k); m.textContent = ""; m.className = "cp-msg";
  clearTimeout(renderChecks._t); renderChecks._t = setTimeout(save, 300);
});
$("checks").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); checkNow(); } });
function setCheckStatus(text, kind) { const el = $("check-status"); el.textContent = text; el.className = "check-status" + (kind ? " " + kind : ""); el.hidden = !text; }

/* ---- Prüfen */
function msgFor(cp, j) {
  const firstUnit = Object.keys(UNITS[cp.q])[0];
  switch (j.st) {
    case "ok": return ["ok", "✓ stimmt"];
    case "empty": return ["warn", "noch leer"];
    case "number": return ["bad", "Zahl nicht erkannt – Beispiel: 12,5 m/s oder 3,2·10^-6 s"];
    case "nounit": return ["warn", `Bitte mit Einheit angeben, z.B. „… ${cp.unit || firstUnit}“`];
    case "nounitsi": return ["warn", `Die Zahl stimmt in ${firstUnit} – bitte die Einheit dazuschreiben`];
    case "wrongq": return ["bad", `„${j.r.unit}“ ist eine Einheit für ${QNAMES[j.r.other]}, gesucht ist ${QNAMES[cp.q] === "Verhältnis" ? "ein Verhältnis (Zahl oder %)" : "eine " + QNAMES[cp.q]}`];
    case "unknownunit": return ["bad", `Einheit „${j.r.unit}“ kenne ich nicht – möglich sind z.B. ${Object.keys(UNITS[cp.q]).filter(Boolean).slice(0, 4).join(", ")}`];
    case "sign": return ["bad", "Der Betrag stimmt, das Vorzeichen nicht"];
    case "power": return ["bad", "Um eine Zehnerpotenz daneben – Umrechnung oder Vorsatz (k, m, µ …) prüfen"];
    case "factor2": return ["bad", "Um den Faktor 2 daneben – fehlt irgendwo ein ½ oder eine 2?"];
    default: return ["bad", "stimmt noch nicht"];
  }
}
function showJudge(res, fresh) {
  const ex = current();
  ex.checks.forEach(cp => {
    const j = res[cp.k]; if (!j) return;
    const [cls, txt] = msgFor(cp, j);
    const inp = $("cp-" + cp.k), m = $("cpm-" + cp.k);
    if (!inp) return;
    inp.className = cls; m.className = "cp-msg " + cls; m.textContent = txt;
  });
  if (fresh) renderResult();
}
function checkNow() {
  const ex = current(); if (!ex) return;
  const pr = prog(ex.id), p = paramsOf(ex);
  const res = {};
  ex.checks.forEach(cp => { res[cp.k] = judge(cp, p, pr.inputs[cp.k] || ""); });
  const filled = ex.checks.filter(cp => res[cp.k].st !== "empty").length;
  if (!filled) { setCheckStatus("Tragen Sie zuerst mindestens ein Ergebnis ein.", "warn"); return; }
  pr.attempts += 1;
  const okN = ex.checks.filter(cp => res[cp.k].st === "ok").length, all = okN === ex.checks.length;
  S.lastJudge = { id: ex.id, res };
  if (all && !pr.solved) {
    pr.solved = true; pr.clean = pr.attempts <= 2 && pr.hints <= 1 && !pr.peeked;
    adapt(ex, pr.clean ? "clean" : "solved");
  } else if (!all && pr.attempts >= 4 && pr.attempts % 2 === 0) adapt(ex, "struggle");
  save();
  showJudge(res, true);
  const msg = all ? `✓ Alle ${okN} Ergebnisse stimmen` : `${okN} von ${ex.checks.length} Ergebnissen stimmen`;
  setCheckStatus(msg, all ? "ok" : "bad"); announce(msg);
  renderChapters(); renderHeader(); Tutor.renderChrome();
}
$("check-btn").onclick = checkNow;

function renderResult() {
  const ex = current(), panel = $("result-panel");
  if (!ex || !S.lastJudge || S.lastJudge.id !== ex.id) { panel.hidden = true; return; }
  const pr = prog(ex.id), p = paramsOf(ex), res = S.lastJudge.res;
  const all = ex.checks.every(cp => res[cp.k].st === "ok");
  const unlocked = pr.solved || pr.attempts >= 2 || pr.hints >= 3;
  let html = `<div class="verdict ${all ? "ok" : "bad"}"><strong>${all ? "Gelöst!" : "Noch nicht ganz"}</strong>${all ? " Alle Kontrollpunkte stimmen." : " Prüfen Sie die markierten Ergebnisse – oder lassen Sie den KI-Tutor Ihren Rechenweg ansehen."}</div>`;
  if (adaptMsg) html += `<div class="notes"><div class="note">${esc(adaptMsg)}</div></div>`;
  if (all) html += `<div style="padding:0 16px 16px"><button type="button" class="btn dark" id="res-next">Nächste Aufgabe →</button></div>`;
  if (unlocked) {
    const vals = ex.checks.map(cp => `- $${cp.sym} = ${tx(inUnit(cp.v(p), cp.q, cp.unit), 4)}${cp.unit ? "\\,\\mathrm{" + cp.unit.replace("°", "{}^\\circ ").replace("µ", "\\mu ").replace("%", "\\%") + "}" : ""}$`).join("\n");
    html += `<details class="solution" id="sol-details"><summary>Musterlösung anzeigen</summary>${pr.solved ? "" : `<p style="margin:0;padding:0 12px 8px;color:var(--muted);font-size:13px">Wer die Lösung ansieht, bekommt die nächste Aufgabe eine Stufe leichter.</p>`}<div class="sol-body" style="padding:0 14px 12px">${md(ex.solution(p))}<p><strong>Ergebnisse:</strong></p>${md(vals)}</div></details>`;
  } else html += `<p style="margin:0;padding:0 16px 14px;color:var(--muted);font-size:13px">Die Musterlösung erscheint nach zwei Prüfversuchen oder nach dem dritten Tipp des KI-Tutors.</p>`;
  panel.innerHTML = html; panel.hidden = false;
  const nb = $("res-next"); if (nb) nb.onclick = goNext;
  const sd = $("sol-details");
  if (sd) sd.addEventListener("toggle", () => { if (sd.open && !pr.solved && !pr.peeked) { pr.peeked = true; adapt(ex, "peek"); save(); renderChapters(); } });
}

function openTask(id, expand = true) {
  const ex = byId(id); if (!ex) return;
  S.currentId = id; S.lastJudge = null; adaptMsg = "";
  if (expand) S.expanded.add(ex.ch);
  save(); Tutor.reset(); Pad.load(id); Uploads.render();
  renderAll();
}
function goNext() {
  const n = pickNext(S.currentId);
  if (n) { openTask(n.id); window.scrollTo({ top: 0 }); $("task-panel").focus({ preventScroll: true }); }
  else { S.currentId = null; S.lastJudge = null; save(); renderAll(); }
}
$("next-btn").onclick = goNext; $("mbar-next").onclick = goNext;

let numbersConfirm = false;
$("new-numbers").onclick = () => {
  const ex = current(); if (!ex) return;
  if (!numbersConfirm) { numbersConfirm = true; $("new-numbers").textContent = "Wirklich? Ergebnisse und Schreibfeld werden geleert"; setTimeout(() => { numbersConfirm = false; $("new-numbers").textContent = "Neue Zahlen"; }, 4000); return; }
  numbersConfirm = false; $("new-numbers").textContent = "Neue Zahlen";
  const pr = prog(ex.id); pr.seed = newSeed(); pr.inputs = {};
  S.lastJudge = null; save(); Pad.clearAll(); Uploads.clear(); Tutor.reset(); renderAll();
  announce("Neue Zahlen erzeugt.");
};

$("chapters").addEventListener("change", e => {
  const ch = e.target.dataset.ch; if (!ch) return;
  e.target.checked ? S.selected.add(ch) : S.selected.delete(ch);
  save();
  if (!current() || !S.selected.has(current().ch)) { const n = pickNext(); n ? openTask(n.id, false) : renderAll(); } else renderChapters();
});
$("chapters").addEventListener("click", e => {
  const o = e.target.closest("[data-open]");
  if (o) { const ch = o.dataset.open; S.expanded.has(ch) ? S.expanded.delete(ch) : S.expanded.add(ch); save(); renderChapters(); const again = document.querySelector(`[data-open="${ch}"]`); if (again) again.focus(); return; }
  const b = e.target.closest("[data-ex]");
  if (b) { openTask(b.dataset.ex); if (document.body.classList.contains("nav-open")) closeNav(true); }
});
$("toggle-all").onclick = () => {
  if (S.selected.size === CH_ORDER.length) S.selected.clear(); else CH_ORDER.forEach(c => S.selected.add(c));
  save();
  if (!current() || !S.selected.has(current().ch)) { const n = pickNext(); n ? openTask(n.id, false) : renderAll(); } else renderChapters();
};
$("mode-seg").addEventListener("click", e => {
  const b = e.target.closest("[data-mode]"); if (!b) return;
  S.mode = b.dataset.mode === "auto" ? "auto" : Number(b.dataset.mode); save();
  const ex = current();
  if (!ex || ex.lvl !== targetLevel(ex.ch)) { const n = pickNext(); if (n && (!ex || n.id !== ex.id)) { openTask(n.id); return; } }
  renderLevel(); renderChapters();
});

/* ---- Handy: Aufgabenliste als Schublade */
const mqMobile = window.matchMedia("(max-width: 860px)");
function openNav() {
  if (!mqMobile.matches) return;
  document.body.classList.add("nav-open"); $("nav-toggle").setAttribute("aria-expanded", "true");
  ["task-panel", "work-panel", "check-panel", "result-panel", "tutor", "welcome"].forEach(id => { $(id).inert = true; });
  document.querySelector(".titleblock").inert = true; $("mbar").inert = true;
  setTimeout(() => $("nav-close").focus(), 60);
}
function closeNav(toTask) {
  if (!document.body.classList.contains("nav-open")) return;
  document.body.classList.remove("nav-open"); $("nav-toggle").setAttribute("aria-expanded", "false");
  ["task-panel", "work-panel", "check-panel", "result-panel", "tutor", "welcome"].forEach(id => { $(id).inert = false; });
  document.querySelector(".titleblock").inert = false; $("mbar").inert = false;
  if (toTask) { window.scrollTo({ top: 0 }); $("task-panel").focus({ preventScroll: true }); } else $("nav-toggle").focus();
}
$("nav-toggle").onclick = () => document.body.classList.contains("nav-open") ? closeNav() : openNav();
$("nav-close").onclick = () => closeNav();
$("nav-backdrop").onclick = () => closeNav();
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { e.preventDefault(); closeNav(); } });
mqMobile.addEventListener?.("change", () => { if (!mqMobile.matches) closeNav(); });

/* ====================================================================== Schreibfeld */
const PW = 1000, PH = 750;   // logische Seitengröße (4:3)
const Pad = {
  id: null, pages: [{ strokes: [] }], page: 0, color: "#17242c", eraser: false, undo: [], drawing: null, penSeen: false,
  cv: $("pad-canvas"),
  load(id) {
    this.id = id; this.undo = [];
    const d = store.get("draw." + id, null);
    this.pages = d && Array.isArray(d.pages) && d.pages.length ? d.pages : [{ strokes: [] }];
    this.page = Math.min(d?.page || 0, this.pages.length - 1);
    this.resize(); this.renderTools();
  },
  persist() { clearTimeout(this._t); this._t = setTimeout(() => store.set("draw." + this.id, { pages: this.pages, page: this.page }), 250); },
  clearAll() { this.pages = [{ strokes: [] }]; this.page = 0; this.undo = []; store.set("draw." + this.id, null); this.redraw(); this.renderTools(); },
  resize() {
    const r = this.cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (!r.width) return;
    this.cv.width = Math.round(r.width * dpr); this.cv.height = Math.round(r.width * 0.75 * dpr);
    this.redraw();
  },
  strokesOf() { return this.pages[this.page].strokes; },
  drawStroke(ctx, s, k) {
    const pts = s.p; if (!pts.length) return;
    ctx.strokeStyle = s.c; ctx.fillStyle = s.c; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0] * k, pts[0][1] * k, 1.6 * k * (s.w || 1), 0, Math.PI * 2); ctx.fill(); return; }
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      ctx.lineWidth = Math.max(0.8, (s.w || 1) * 2.6 * k * (0.55 + 0.9 * ((a[2] + b[2]) / 2)));
      ctx.beginPath(); ctx.moveTo(a[0] * k, a[1] * k); ctx.lineTo(b[0] * k, b[1] * k); ctx.stroke();
    }
  },
  redraw() {
    const ctx = this.cv.getContext("2d"), k = this.cv.width / PW;
    ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    for (const s of this.strokesOf()) this.drawStroke(ctx, s, k);
    $("pad-hint").hidden = this.pages.some(pg => pg.strokes.length) || Uploads.list().length > 0;
  },
  renderTools() {
    $("page-info").textContent = `Seite ${this.page + 1}/${this.pages.length}`;
    $("page-prev").disabled = this.page === 0; $("page-next").disabled = this.page >= this.pages.length - 1;
    $("undo").disabled = !this.undo.length;
    document.querySelectorAll("[data-pen]").forEach(b => b.setAttribute("aria-pressed", String(!this.eraser && b.dataset.pen === this.color)));
    $("eraser").setAttribute("aria-pressed", String(this.eraser));
    workCount();
  },
  pos(e) { const r = this.cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * PW * 10) / 10, Math.round((e.clientY - r.top) / r.height * PH * 10) / 10, e.pressure && e.pointerType === "pen" ? Math.round(e.pressure * 100) / 100 : 0.5]; },
  allowed(e) { if (e.pointerType === "pen") { this.penSeen = true; return true; } return e.pointerType === "mouse" || !this.penSeen; },
  snapshot() { this.undo.push(JSON.stringify(this.strokesOf())); if (this.undo.length > 40) this.undo.shift(); },
  eraseAt(pt) {
    const st = this.strokesOf(), keep = st.filter(s => !s.p.some(q => Math.hypot(q[0] - pt[0], q[1] - pt[1]) < 14));
    if (keep.length !== st.length) { this.pages[this.page].strokes = keep; this.redraw(); }
  },
  async pageBlob(i) {
    const c = document.createElement("canvas"); c.width = 1200; c.height = 900;
    const ctx = c.getContext("2d"); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height);
    for (const s of this.pages[i].strokes) this.drawStroke(ctx, { ...s, c: s.c }, c.width / PW);
    return new Promise(res => c.toBlob(res, "image/png"));
  },
  usedPages() { return this.pages.map((pg, i) => pg.strokes.length ? i : -1).filter(i => i >= 0); },
};
Pad.cv.addEventListener("pointerdown", e => {
  if (!Pad.allowed(e) || (e.button !== undefined && e.button > 0)) return;
  e.preventDefault(); try { Pad.cv.setPointerCapture(e.pointerId); } catch (err) {}
  Pad.snapshot();
  const pt = Pad.pos(e);
  if (Pad.eraser) { Pad.drawing = { erase: true }; Pad.eraseAt(pt); return; }
  Pad.drawing = { c: Pad.color, w: 1, p: [pt] };
  Pad.strokesOf().push(Pad.drawing); Pad.redraw();
});
Pad.cv.addEventListener("pointermove", e => {
  if (!Pad.drawing) return;
  e.preventDefault();
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  if (Pad.drawing.erase) { evs.forEach(ev => Pad.eraseAt(Pad.pos(ev))); return; }
  const ctx = Pad.cv.getContext("2d"), k = Pad.cv.width / PW;
  for (const ev of evs) {
    const pt = Pad.pos(ev), last = Pad.drawing.p[Pad.drawing.p.length - 1];
    if (Math.hypot(pt[0] - last[0], pt[1] - last[1]) < 0.8) continue;
    Pad.drawing.p.push(pt);
    Pad.drawStroke(ctx, { c: Pad.drawing.c, w: 1, p: [last, pt] }, k);
  }
});
const endStroke = () => { if (!Pad.drawing) return; Pad.drawing = null; Pad.persist(); Pad.redraw(); Pad.renderTools(); };
Pad.cv.addEventListener("pointerup", endStroke); Pad.cv.addEventListener("pointercancel", endStroke); Pad.cv.addEventListener("lostpointercapture", endStroke);
document.querySelectorAll("[data-pen]").forEach(b => b.onclick = () => { Pad.color = b.dataset.pen; Pad.eraser = false; Pad.renderTools(); });
$("eraser").onclick = () => { Pad.eraser = !Pad.eraser; Pad.renderTools(); };
$("undo").onclick = () => { const s = Pad.undo.pop(); if (s !== undefined) { Pad.pages[Pad.page].strokes = JSON.parse(s); Pad.persist(); Pad.redraw(); Pad.renderTools(); } };
$("page-prev").onclick = () => { if (Pad.page > 0) { Pad.page--; Pad.undo = []; Pad.persist(); Pad.redraw(); Pad.renderTools(); } };
$("page-next").onclick = () => { if (Pad.page < Pad.pages.length - 1) { Pad.page++; Pad.undo = []; Pad.persist(); Pad.redraw(); Pad.renderTools(); } };
$("page-add").onclick = () => { Pad.pages.push({ strokes: [] }); Pad.page = Pad.pages.length - 1; Pad.undo = []; Pad.persist(); Pad.redraw(); Pad.renderTools(); };
$("page-clear").onclick = () => { if (!Pad.strokesOf().length) return; Pad.snapshot(); Pad.pages[Pad.page].strokes = []; Pad.persist(); Pad.redraw(); Pad.renderTools(); };
new ResizeObserver(() => Pad.resize()).observe($("pad"));

/* ---- Fotos und hochgeladene Bilder (nur im Arbeitsspeicher, je Aufgabe) */
const Uploads = {
  byTask: {},
  list() { return this.byTask[S.currentId] || []; },
  add(files) {
    const arr = (this.byTask[S.currentId] ||= []);
    for (const f of files) if (f && /^image\//.test(f.type)) arr.push({ blob: f, url: URL.createObjectURL(f), name: f.name || "Foto" });
    this.render(); Pad.redraw();
  },
  remove(i) { const arr = this.list(); const [x] = arr.splice(i, 1); if (x) URL.revokeObjectURL(x.url); this.render(); Pad.redraw(); },
  clear() { this.list().forEach(x => URL.revokeObjectURL(x.url)); this.byTask[S.currentId] = []; this.render(); },
  render() {
    $("uploads").innerHTML = this.list().map((x, i) => `<div class="thumb"><img src="${x.url}" alt="Bild ${i + 1} Ihres Rechenwegs"><button type="button" data-rm="${i}" aria-label="Bild ${i + 1} entfernen">✕</button></div>`).join("");
    workCount();
  },
};
$("uploads").addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (b) Uploads.remove(+b.dataset.rm); });
["photo-in", "upload-in"].forEach(id => $(id).addEventListener("change", e => { Uploads.add([...e.target.files]); e.target.value = ""; }));
function workCount() {
  const n = Pad.usedPages().length + Uploads.list().length;
  $("work-count").textContent = n ? `${n} ${n === 1 ? "Seite" : "Seiten"} für den Tutor` : "";
  Tutor.renderChrome?.();
}
async function workImages(max) {
  const blobs = [];
  for (const i of Pad.usedPages()) blobs.push(await Pad.pageBlob(i));
  for (const x of Uploads.list()) blobs.push(x.blob);
  return { blobs: blobs.slice(-max), total: blobs.length };
}

/* ====================================================================== KI-Tutor */
const Tutor = {
  sample: undefined, maxImages: 0, turns: [], busy: false, ctl: null, off: "",
  async init() {
    try { this.sample = await window.claude?.use?.("sample"); } catch (e) { this.sample = null; }
    if (!this.sample) this.sample = null;
    if (this.sample) { try { const l = await this.sample.limits(); this.maxImages = l && l.images ? (l.images.maxCount || 1) : 0; } catch (e) { this.maxImages = 0; } }
    this.renderChrome(); this.renderChat();
  },
  available() { return !!this.sample && !this.off; },
  reset() { this.stop(); this.turns = []; this.renderChat(); this.renderChrome(); },
  stop() { if (this.ctl) { this.ctl.abort(); this.ctl = null; } },
  hintLevel() { const ex = current(); return ex ? prog(ex.id).hints : 0; },
  renderChrome() {
    const on = this.available() && !!current();
    const n = Pad.usedPages().length + Uploads.list().length;
    $("ai-review").disabled = !on || this.busy || !n || !this.maxImages;
    $("ai-review").title = !n ? "Erst im Schreibfeld rechnen oder ein Foto hinzufügen" : "";
    $("ai-hint").disabled = !on || this.busy;
    $("chat-form").querySelector("button").disabled = !on || this.busy;
    $("chat-input").disabled = !on;
    $("stop-btn").hidden = !this.busy;
    const h = this.hintLevel();
    $("hintmeter").innerHTML = [0, 1, 2].map(i => `<i class="${i < h ? "on" : ""}"></i>`).join("");
  },
  renderChat(stream) {
    const chat = $("chat");
    if (this.sample === undefined) { chat.innerHTML = ""; return; }
    if (!this.sample) {
      chat.innerHTML = typeof window.claude === "undefined"
        ? `<div class="ai-off">Den KI-Tutor gibt es in der <strong>Claude-Version</strong> des PhysicsTrainers: Dort liest er Ihren Rechenweg aus dem Schreibfeld oder vom Foto. Sie brauchen dafür ein (kostenloses) Claude-Konto. Alle Aufgaben, Kontrollpunkte und das Schreibfeld funktionieren auch hier.<p style="margin-top:10px"><a class="btn primary" style="text-decoration:none" href="${CLAUDE_URL}" target="_top">Zur Claude-Version</a></p></div>`
        : `<div class="ai-off">In dieser geteilten Ansicht lässt claude.ai den KI-Tutor nicht zu – er funktioniert nur in Ihrer eigenen Kopie („Kopieren“ in der Leiste ganz oben, links beim Titel). Alle Aufgaben, Kontrollpunkte und das Schreibfeld funktionieren auch hier.</div>`;
      return;
    }
    if (this.off) { chat.innerHTML = `<div class="ai-off">${esc(this.off)}</div>`; return; }
    let html = `<div class="msg ai"><div class="who">KI-Tutor</div><div class="md">${md("Ich kenne die Aufgabe mit Ihren Zahlen und Ihre eingetragenen Ergebnisse. Lassen Sie mich Ihren **Rechenweg prüfen** – aus dem Schreibfeld oder als Foto. Ich verrate keine fertige Lösung, sondern zeige Ihnen, wo es hakt, und verweise auf das Skript.")}</div></div>`;
    if (!this.turns.length) html += `<div class="msg sys">Bei Ihrer ersten Anfrage fragt Claude einmal, ob diese Seite Ihr Claude-Konto nutzen darf${this.maxImages ? " und Bilder senden darf" : ""} – bitte erlauben Sie das.</div>`;
    for (const t of this.turns) {
      if (t.role === "user") html += `<div class="msg user">${esc(t.shown)}${t.images ? ` <span class="eyebrow">· ${t.images} ${t.images === 1 ? "Bild" : "Bilder"}</span>` : ""}</div>`;
      else if (t.role === "assistant") html += `<div class="msg ai"><div class="who">KI-Tutor</div><div class="md">${md(t.content)}</div></div>`;
      else html += `<div class="msg sys">${esc(t.content)}</div>`;
    }
    if (stream !== undefined) html += `<div class="msg ai"><div class="who">KI-Tutor</div><div class="md">${stream ? md(stream) : `<span class="thinking"><span class="spin" aria-hidden="true"></span> Der Tutor sieht sich das an …<span id="think-secs"></span> <button type="button" class="btn ghost" data-stop style="padding:0 6px;font-size:12px">Abbrechen</button></span>`}</div></div>`;
    chat.innerHTML = html; chat.scrollTop = chat.scrollHeight;
  },
  context() {
    const ex = current(), p = paramsOf(ex), pr = prog(ex.id);
    const res = S.lastJudge && S.lastJudge.id === ex.id ? S.lastJudge.res : null;
    const cps = ex.checks.map(cp => {
      const inp = pr.inputs[cp.k] || "";
      const st = res && res[cp.k] ? res[cp.k].st : (inp ? "noch nicht geprüft" : "leer");
      return `- ${cp.name} (${cp.sym}): Eingabe „${inp || "–"}“ → ${st === "ok" ? "richtig" : st === "leer" || st === "noch nicht geprüft" ? st : "falsch (" + st + ")"}; Sollwert ${plain(inUnit(cp.v(p), cp.q, cp.unit), 4)} ${cp.unit}`;
    }).join("\n");
    const secs = Object.values(SEC).map(s => `[[${s.id}]] ${s.title}`).join("\n");
    return [
      "Du bist der KI-Tutor im PhysicsTrainer zur Vorlesung „Physik für Ingenieurinnen und Ingenieure“ (Hochschule Trier). Die Studierenden sind im 1./2. Semester.",
      "REGELN:",
      "1. Antworte auf Deutsch, freundlich, direkt und knapp (meist unter 150 Wörtern). Sieze die Studierenden.",
      "2. Verrate keine vollständige Lösung und rechne die Aufgabe nicht komplett vor. Nenne keine Sollwerte von Ergebnissen, die die Studierenden noch nicht richtig haben. Höchstens ein einzelner Rechenschritt als Beispiel.",
      "3. Liegen Bilder bei, zeigen sie den handschriftlichen Rechenweg. Gehe ihn Schritt für Schritt durch: Bestätige richtige Schritte kurz, benenne den ERSTEN fehlerhaften Schritt genau (Ansatz, Formel, Vorzeichen, Einheit, Umrechnung oder Rechenfehler) und sage, worauf die Person achten soll. Ist etwas unleserlich, sage das und rate nicht.",
      "4. Achte besonders auf SI-Umrechnungen, Vorzeichen, Grad/Bogenmaß sowie absolute Temperaturen und Drücke.",
      "5. Verweise auf passende Abschnitte im Skript mit der ID in doppelten eckigen Klammern, z.B. [[1.2]] – mindestens einmal pro Antwort, nur aus diesem Verzeichnis:\n" + secs,
      "6. Format: einfaches Markdown, kurze Listen, Formeln in LaTeX zwischen $…$. Keine Überschriften.",
      "",
      `AUFGABE (Kapitel ${ex.ch} ${chTitle(ex.ch)}, Stufe ${ex.lvl} ${LEVELS[ex.lvl]}): ${ex.title}`,
      ex.text(p),
      "",
      "KONTROLLPUNKTE (Eingaben der Person und automatische Prüfung; die Sollwerte sind nur für dich):",
      cps,
      "",
      "MUSTERLÖSUNG (nur als Referenz für dich – niemals zeigen oder vollständig wiedergeben):",
      ex.solution(p),
    ].join("\n");
  },
  async ask(kind, text) {
    if (!this.available() || this.busy) return;
    const ex = current(); if (!ex) return;
    const pr = prog(ex.id);
    this.busy = true; this.renderChrome();   // sofort sperren: das Erzeugen der Bilder dauert einen Moment
    let request, shown, wantImages = false;
    if (kind === "review") { request = "Bitte prüfe meinen Rechenweg in den Bildern."; shown = "Rechenweg prüfen"; wantImages = true; }
    else if (kind === "hint") {
      const lvl = Math.min(3, pr.hints + 1); pr.hints = lvl; save();
      request = ["", "Gib mir einen ersten Denkanstoß (Tipp 1 von 3): Welches physikalische Prinzip oder welcher Ansatz passt? Noch keine Formel mit Zahlen.",
        "Tipp 2 von 3: Nenne die entscheidende Gleichung und wie ich sie aufstelle, aber setze keine Zahlen ein.",
        "Tipp 3 von 3: Zeige mir den Lösungsweg als Gerüst mit Lücken (___) für Zahlenwerte und Ergebnisse. Geh dabei von meinem bisherigen Rechenweg aus, falls Bilder beiliegen."][lvl];
      shown = `Tipp ${lvl} von 3`; wantImages = true;
    } else { request = text; shown = text; }
    let images = [];
    if (wantImages && this.maxImages) { const w = await workImages(this.maxImages); images = w.blobs; if (w.total > images.length) this.turns.push({ role: "sys", content: `Es werden nur die letzten ${images.length} von ${w.total} Seiten mitgeschickt.` }); }
    if (kind === "review" && !images.length) { this.busy = false; this.renderChrome(); return; }
    this.turns.push({ role: "user", shown, content: request + (images.length ? `\n(${images.length} ${images.length === 1 ? "Bild" : "Bilder"} mit meinem Rechenweg anbei.)` : ""), images: images.length });
    await this.send(images);
    if (kind === "hint" && pr.hints >= 3 && S.lastJudge && S.lastJudge.id === ex.id) renderResult();
  },
  async send(images) {
    this.busy = true; this.ctl = new AbortController(); this.renderChrome(); this.renderChat("");
    const stopTick = ticker(s => { const el = document.getElementById("think-secs"); if (el && s >= 3) el.textContent = ` · ${fmtSecs(s)} – Antworten mit Bildern dauern oft 10 bis 60 Sekunden.`; });
    const msgs = [{ role: "user", content: this.context() }];
    this.turns.filter(t => t.role === "user" || t.role === "assistant").slice(-7).forEach(t => msgs.push({ role: t.role, content: t.content }));
    const opts = { signal: this.ctl.signal, cache: false, onText: ({ text }) => this.renderChat(text) };
    if (images.length) opts.images = images;
    try {
      const { text } = await this.sample(msgs, opts);
      this.turns.push({ role: "assistant", content: text });
    } catch (e) {
      const code = e && e.code;
      if (e && e.text) this.turns.push({ role: "assistant", content: e.text });
      if (code === "images_unavailable" || code === "image_rejected") this.turns.push({ role: "sys", content: "Die Bilder konnten nicht gesendet werden. Stellen Sie Ihre Frage gern ohne Bild oder versuchen Sie ein anderes Foto." });
      else if (code === "rate_limited") this.turns.push({ role: "sys", content: "Gerade zu viele Anfragen – oder Ihr Claude-Kontingent ist für den Moment aufgebraucht. Bitte später noch einmal versuchen." });
      else if (code === "not_granted") this.off = "Sie haben dem KI-Tutor nicht erlaubt, Ihr Claude-Konto zu nutzen. Das können Sie in den Berechtigungen dieses Artefakts ändern.";
      else if (code === "sampling_disabled") this.off = "Ihr Claude-Konto lässt KI-Anfragen aus Artefakten nicht zu. Mit einem privaten (kostenlosen) Claude-Konto funktioniert der Tutor.";
      else if (code === "refused") this.turns.push({ role: "sys", content: "Auf diese Anfrage gibt es keine Antwort. Bitte formulieren Sie sie anders." });
      else if (code !== "cancelled") this.turns.push({ role: "sys", content: "Die Antwort konnte nicht geladen werden. Bitte erneut versuchen." });
      const lastUser = this.turns.map(t => t.role).lastIndexOf("user");
      if (!(e && e.text) && lastUser >= 0) this.turns[lastUser] = { role: "sys", content: "↳ " + this.turns[lastUser].shown };
    } finally {
      stopTick(); this.busy = false; this.ctl = null; this.renderChat(); this.renderChrome();
      const last = [...this.turns].reverse().find(t => t.role === "assistant" || t.role === "sys");
      if (last) announce(last.role === "assistant" ? "Tutor: " + last.content.slice(0, 300) : last.content);
    }
  },
};
$("ai-review").onclick = () => Tutor.ask("review");
$("ai-hint").onclick = () => { Tutor.ask("hint"); };
$("stop-btn").onclick = () => Tutor.stop();
$("chat").addEventListener("click", e => { if (e.target.closest("[data-stop]")) Tutor.stop(); });
$("chat-form").addEventListener("submit", e => { e.preventDefault(); const v = $("chat-input").value.trim(); if (!v) return; $("chat-input").value = ""; Tutor.ask("chat", v); });
$("chat-input").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("chat-form").requestSubmit(); } });

/* ====================================================================== Skript, Info, Willkommen */
function renderSkript() {
  $("skript-h").textContent = "Skript: " + SKRIPT_TITLE;
  $("skript-nav").innerHTML = SKRIPT.map(c => `<b>${c.ch} ${esc(c.title)}</b>${c.sections.map(s => `<a href="#sec-${s.id}" data-goto="${s.id}">${s.id} ${esc(s.title)}</a>`).join("")}`).join("");
  $("skript-body").innerHTML = `<p class="chap-eyebrow">Hochschule Trier · Version 1.0</p><h2 style="margin-top:6px">${esc(SKRIPT_TITLE)}</h2>` + SKRIPT.map(c => `<p class="chap-eyebrow">Kapitel ${c.ch}</p><h2 id="chap-${c.ch}" style="margin-top:4px">${esc(c.title)}</h2>${c.sections.map(s => `<h3 id="sec-${s.id}">${s.id} ${esc(s.title)}</h3>${md(s.text)}`).join("")}`).join("");
  renderSkript.done = true;
}
function openSkript(id) {
  if (!renderSkript.done) renderSkript();
  const d = $("skript-dlg"); if (!d.open) d.showModal();
  const body = $("skript-body");
  if (id && SEC[id]) {
    const h = document.getElementById("sec-" + id);
    body.scrollTop = h.offsetTop - 8;
    h.classList.remove("flash"); void h.offsetWidth; h.classList.add("flash");
    document.querySelectorAll("#skript-nav a").forEach(a => a.classList.toggle("cur", a.dataset.goto === id));
  } else body.scrollTop = 0;
}
document.addEventListener("click", e => {
  const a = e.target.closest("[data-sec]");
  if (a) { e.preventDefault(); openSkript(a.dataset.sec); return; }
  const g = e.target.closest("[data-goto]");
  if (g) { e.preventDefault(); openSkript(g.dataset.goto); }
});
$("skript-close").onclick = () => $("skript-dlg").close();
$("info-btn").onclick = () => {
  $("info-body").innerHTML = md(String.raw`Der PhysicsTrainer enthält ${TASKS.length} Übungsaufgaben zu den ${SKRIPT.length} Kapiteln des Skripts „${SKRIPT_TITLE}“, je Kapitel in drei Schwierigkeitsstufen.

- **Eigene Zahlen:** Jede Aufgabe erzeugt für Sie eigene Werte. Mit „Neue Zahlen“ üben Sie dieselbe Aufgabe noch einmal.
- **Rechenweg:** Rechnen Sie im Schreibfeld (Tablet mit Stift, auch mit Finger oder Maus) oder auf Papier und fügen Sie ein Foto hinzu. Auf dem Tablet zeichnet nur der Stift, sobald er einmal benutzt wurde – die Hand darf aufliegen.
- **Kontrollpunkte:** Zwischen- und Endergebnisse tragen Sie mit Einheit ein. Der Trainer prüft sie mit 1 % Toleranz, rechnet Einheiten selbst um und erkennt typische Fehler (Vorzeichen, Zehnerpotenz, Faktor 2).
- **KI-Tutor:** prüft Ihren handschriftlichen Rechenweg, gibt drei gestufte Tipps und verweist auf das Skript, ohne die Lösung zu verraten. Er nutzt Ihr eigenes Claude-Konto; Bilder sieht er nur, wenn Sie „Rechenweg prüfen“ oder „Tipp“ wählen.
- **Stufen:** Zwei saubere Lösungen in Folge (höchstens zwei Prüfversuche, höchstens ein Tipp) heben die Stufe im Kapitel; wer die Musterlösung ansieht, bekommt leichtere Aufgaben.
- Ihr Fortschritt und das Schreibfeld werden nur in diesem Browser gespeichert.

PhysicsTrainer v${VERSION} · Vorführprototyp auf Basis des CodingTrainers · Skript und Aufgaben sind Beispielinhalte.`);
  $("info-dlg").showModal();
};
$("info-close").onclick = () => $("info-dlg").close();
function renderWelcome() {
  const w = $("welcome");
  if (S.welcomed) { w.hidden = true; return; }
  w.hidden = false;
  const steps = [
    "Lesen Sie die Aufgabe – die Zahlen sind nur für Sie erzeugt. Die Verweise unter „Im Skript“ führen zum passenden Abschnitt.",
    "Rechnen Sie im **Schreibfeld** (Tablet mit Stift) – oder auf Papier und fügen Sie ein **Foto** hinzu.",
    "Tragen Sie Zwischen- und Endergebnisse **mit Einheit** ein und klicken Sie auf **Prüfen**.",
    "Hängen Sie fest? Der **KI-Tutor** prüft Ihren Rechenweg und gibt Tipps, ohne die Lösung zu verraten.",
  ];
  w.innerHTML = `<h2>So funktioniert der PhysicsTrainer</h2><ol>${steps.map(s => `<li>${mdInline(s)}</li>`).join("")}</ol><p>Ihr Fortschritt und das Schreibfeld werden nur in diesem Browser gespeichert. Weitere Erklärungen unter „Info“ (oben rechts).</p><div class="row"><button type="button" class="btn dark" id="welcome-ok">Verstanden, los geht's</button></div>`;
  $("welcome-ok").onclick = () => { S.welcomed = true; save(); w.hidden = true; $("task-panel").focus({ preventScroll: true }); };
}

/* ====================================================================== Start */
function renderAll() {
  renderHeader(); renderChapters(); renderLevel(); renderTask(); renderChecks(); renderResult(); renderWelcome();
  Tutor.renderChrome(); Tutor.renderChat();
}
(function boot() {
  document.body.classList.add("view-practice");
  if (!current() || !S.selected.has(current().ch)) { const n = pickNext(); if (n) S.currentId = n.id; }
  if (S.currentId) S.expanded.add(current().ch);
  save();
  Pad.load(S.currentId); Uploads.render();
  renderAll();
  Tutor.init();
})();

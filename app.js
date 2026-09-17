/* Microsoft Fundamentals Practice — static app, no build step, no accounts.
   Three exams (AI-901, SC-900, AB-900) as tabs. Progress persists in
   localStorage under one key per exam. */

(function () {
  "use strict";

  /* ---------- exam catalogue ---------- */
  var EXAMS = {
    ai901: {
      code: "AI-901",
      eyebrow: "Azure AI Fundamentals",
      title: "AI-901 Practice",
      store: "ai901.progress.v1",
      bank: "__AI901_QUESTIONS__",
      lede: " original questions covering every area of the exam — Foundry hubs and " +
        "projects, endpoints and status codes, the Python SDK, the service-specific Foundry Tools, and " +
        "responsible AI. Pick your topics and go.",
      outline: "AI-901 skills outline",
      desc: {
        "Concepts & Responsible AI": "Gen-AI internals, workloads, the six principles",
        "Foundry & Endpoints": "Hubs, projects, deployments, 401/403/404, RBAC, agents",
        "Python SDK": "Client classes, methods, credentials, imports",
        "Foundry Tools (services)": "Speech / Language / Vision / Translator / Content Understanding",
        "Foundry Hub architecture": "Inheritance, shared quota, connections, RBAC hierarchy",
        "Code & endpoints (advanced)": "Credential semantics, status codes, statelessness, auth planes",
        "Concepts & Responsible AI (hard)": "Competing principles, fairness metrics, oversight"
      }
    },
    sc900: {
      code: "SC-900",
      eyebrow: "Security, Compliance & Identity Fundamentals",
      title: "SC-900 Practice",
      store: "sc900.progress.v1",
      bank: "__SC900_QUESTIONS__",
      lede: " original questions across all four exam domains — security and identity concepts, " +
        "Microsoft Entra, Microsoft security solutions (Azure, Defender XDR, Sentinel, Security Copilot) " +
        "and Microsoft Purview compliance solutions. Scenario-based, with the traps the real exam uses.",
      outline: "SC-900 skills outline (July 2026 update)",
      desc: {
        "Security & identity concepts": "Shared responsibility, defense in depth, Zero Trust, encryption, GRC, authN vs authZ",
        "Entra — identities & authentication": "Identity types, hybrid, external & agent identities, MFA, passwordless, password protection",
        "Entra — access, protection & governance": "Conditional Access, roles vs RBAC, PIM, ID Governance, ID Protection, Global Secure Access, Verified ID",
        "Azure security & Defender for Cloud": "NSG, Firewall, WAF, DDoS, Bastion, Key Vault, CSPM vs workload protection",
        "Sentinel & Security Copilot": "SIEM/SOAR, connectors, analytics rules, playbooks, hunting, unified SecOps, Copilot",
        "Microsoft Defender XDR": "Defender for Endpoint / Office 365 / Identity / Cloud Apps, MDVM, Defender TI, the Defender portal",
        "Purview — compliance, privacy & Priva": "Service Trust Portal, privacy principles, Priva, Purview portal, Compliance Manager",
        "Purview — information protection & lifecycle": "Classification, sensitivity labels, DLP, retention, records, unified data governance",
        "Purview — insider risk, eDiscovery & audit": "Insider Risk Management, Communication Compliance, eDiscovery, Audit Standard vs Premium"
      }
    },
    ab900: {
      code: "AB-900",
      eyebrow: "Microsoft 365 Copilot & Agent Administration Fundamentals",
      title: "AB-900 Practice",
      store: "ab900.progress.v1",
      bank: "__AB900_QUESTIONS__",
      lede: " original questions across all three exam domains — Microsoft 365 core objects and admin " +
        "centers, Entra ID security features, Microsoft Purview data protection and governance for Copilot, " +
        "SharePoint oversharing, Copilot licensing and billing, and agent administration.",
      outline: "AB-900 skills outline (July 2026 update)",
      desc: {
        "M365 core objects & admin centers": "Licenses, domains, Exchange mailboxes & groups, SharePoint sites & permissions, Teams",
        "Security principles & Defender XDR": "Zero Trust, authN vs authZ, authentication methods, threat protection, Defender portal",
        "Entra ID & core security features": "Conditional Access, SSO, users vs groups, sign-in troubleshooting, Identity Secure Score, PIM, app registrations",
        "Purview capabilities": "Information Protection, DLP, IRM, Communication Compliance, DSPM for AI, retention & classification",
        "Copilot data security & responsible AI": "How Copilot accesses data, Microsoft Graph, permissions, labels, audit, RAI principles",
        "Purview risk & discovery tools": "Compliance Manager, Data explorer, Activity explorer, DLP alerts, DSPM for AI, Content search",
        "SharePoint oversharing & SAM": "Data access governance reports, restricted access control vs restricted content discovery",
        "Copilot & agents — features & licensing": "Copilot vs agents, Copilot Chat, licences vs pay-as-you-go, Researcher, Analyst, agent types",
        "Copilot & agent admin tasks": "License assignment, billing policies, usage reports, prompts, agent access, approval, lifecycle"
      }
    },
    dp900: {
      code: "DP-900",
      eyebrow: "Azure Data Fundamentals",
      title: "DP-900 Practice",
      store: "dp900.progress.v1",
      bank: "__DP900_QUESTIONS__",
      lede: " original questions across all four exam domains — core data concepts, relational data " +
        "on Azure, non-relational data on Azure, and analytics workloads — covering everything from " +
        "normalization and T-SQL to Cosmos DB consistency levels, Data Lake Storage, Synapse and Power BI.",
      outline: "DP-900 skills outline",
      desc: {
        "Core data concepts": "Structured/semi-structured/unstructured, OLTP vs OLAP, batch vs streaming, file formats, data roles",
        "Relational data concepts": "Keys, normalization, indexes, views, stored procedures, ACID, T-SQL basics",
        "Relational Azure services": "Azure SQL Database, SQL Managed Instance, SQL on VMs, DTU vs vCore, elastic pools, Hyperscale",
        "Non-relational & NoSQL concepts": "Key-value, document, column-family, graph models; Cosmos DB consistency & RUs",
        "Azure Storage & Cosmos DB": "Blob tiers, redundancy (LRS/ZRS/GRS), Azure Files, Queues, Cosmos DB APIs & global distribution",
        "Data Lake & big data": "Data lake vs warehouse vs lakehouse, star/snowflake schema, ETL vs ELT, OneLake",
        "Analytics & ETL pipelines": "Azure Data Factory, Synapse SQL pools & Spark, Databricks, Stream Analytics, Event Hubs",
        "Data visualization — Power BI": "Desktop vs Service, reports vs dashboards, dataflows, DirectQuery, RLS, gateways"
      }
    }
  };
  var ORDER = ["ai901", "sc900", "ab900", "dp900"];

  var FMT = {
    multiple_choice: null,
    multi_select: "select all that apply",
    dropdown: "choose the option",
    yes_no: "true / false"
  };

  /* ---------- per-exam state ---------- */
  var exam = null;          // current exam config
  var examKey = "";
  var QS = [];              // questions of the current exam
  var prog = null;          // progress of the current exam
  var state = {
    screen: "setup",
    selected: {},           // topic -> bool
    order: [],              // indices into QS
    optOrder: {},           // qid -> array
    idx: 0,
    picked: [],
    revealed: false,
    session: {},            // qid -> bool (this run)
    mode: "all"             // "all" | "wrong" | "unseen"
  };

  /* ---------- storage ---------- */
  function emptyProg() { return { seen: {}, wrong: {}, runs: 0, best: null }; }
  function load(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return emptyProg();
      var o = JSON.parse(raw);
      o.seen = o.seen || {}; o.wrong = o.wrong || {};
      o.runs = o.runs || 0;
      return o;
    } catch (e) { return emptyProg(); }
  }
  function save(p) {
    try { localStorage.setItem(exam.store, JSON.stringify(p)); } catch (e) {}
  }
  function remember(k) {
    try { localStorage.setItem("fundamentals.exam", k); } catch (e) {}
  }

  /* ---------- helpers ---------- */
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt !== undefined && txt !== null) n.textContent = txt;
    return n;
  }
  function shuffle(n) {
    var a = [], i, j, t;
    for (i = 0; i < n; i++) a.push(i);
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function eq(a, b) {
    if (a.length !== b.length) return false;
    var x = a.slice().sort(), y = b.slice().sort(), i;
    for (i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
    return true;
  }
  function topics() {
    var seen = {}, out = [];
    QS.forEach(function (q) { if (!seen[q.topic]) { seen[q.topic] = 1; out.push(q.topic); } });
    return out;
  }
  function wrongCount() { return Object.keys(prog.wrong).length; }
  function seenCount() { return Object.keys(prog.seen).length; }
  function bankFor(k) { return window[EXAMS[k].bank] || []; }

  /* ---------- exam switching ---------- */
  function selectExam(k, push) {
    if (!EXAMS[k]) k = "ai901";
    examKey = k; exam = EXAMS[k];
    QS = bankFor(k);
    prog = load(exam.store);
    state.screen = "setup"; state.selected = {}; state.order = []; state.optOrder = {};
    state.idx = 0; state.picked = []; state.revealed = false; state.session = {}; state.mode = "all";
    topics().forEach(function (t) { state.selected[t] = true; });
    remember(k);
    if (push && window.location.hash !== "#" + k) {
      try { history.replaceState(null, "", "#" + k); } catch (e) { window.location.hash = k; }
    }
    document.title = exam.code + " Practice — " + exam.eyebrow;
  }
  function initialExam() {
    var h = (window.location.hash || "").replace("#", "").toLowerCase();
    if (EXAMS[h]) return h;
    try { var r = localStorage.getItem("fundamentals.exam"); if (EXAMS[r]) return r; } catch (e) {}
    return "ai901";
  }

  /* ---------- render root ---------- */
  var root = document.getElementById("app");
  function render() {
    root.innerHTML = "";
    var wrap = el("div", "wrap");
    wrap.appendChild(tabs());
    if (state.screen === "setup") wrap.appendChild(setupScreen());
    else if (state.screen === "quiz") wrap.appendChild(quizScreen());
    else wrap.appendChild(resultsScreen());
    root.appendChild(wrap);
    var f = el("div", "foot");
    f.innerHTML = "Progress is saved in this browser only — no account, no server, one save per exam. " +
      "Questions are original, written from the published " + exam.outline + "; " +
      "verify anything surprising against Microsoft Learn.";
    root.appendChild(f);
    window.scrollTo(0, 0);
  }

  function tabs() {
    var nav = el("nav", "tabs");
    nav.setAttribute("aria-label", "Exam");
    ORDER.forEach(function (k) {
      var e = EXAMS[k], n = bankFor(k).length;
      var b = el("button", "tab" + (k === examKey ? " on" : ""));
      b.setAttribute("aria-pressed", k === examKey ? "true" : "false");
      b.appendChild(el("span", "tab-code", e.code));
      b.appendChild(el("span", "tab-n", n + " Qs"));
      b.title = e.eyebrow;
      b.onclick = function () {
        if (k === examKey && state.screen === "setup") return;
        if (state.screen === "quiz" && !confirm("Leave this run and switch to " + e.code + "? Answered questions are already saved.")) return;
        selectExam(k, true); render();
      };
      nav.appendChild(b);
    });
    return nav;
  }

  /* ---------- setup ---------- */
  function setupScreen() {
    var c = el("div", "card");
    c.appendChild(el("div", "eyebrow", exam.eyebrow));
    c.appendChild(el("h1", null, exam.title));
    var p = el("p", "lede");
    p.textContent = QS.length + exam.lede;
    c.appendChild(p);

    // stats strip
    if (seenCount() > 0) {
      var s = el("div", "stat"); s.style.margin = "16px 0 0";
      var top = el("div", "top");
      top.appendChild(el("span", null, "Your progress so far"));
      top.appendChild(el("span", "mono", seenCount() + "/" + QS.length + " attempted"));
      s.appendChild(top);
      var bar = el("div", "bar"); var fill = el("i");
      fill.style.width = Math.round(seenCount() / QS.length * 100) + "%";
      bar.appendChild(fill); s.appendChild(bar);
      var sub = el("div", "small muted"); sub.style.marginTop = "8px";
      sub.textContent = wrongCount() + " still marked wrong · " + (prog.runs || 0) + " runs completed" +
        (prog.best !== null && prog.best !== undefined ? " · best score " + prog.best + "%" : "");
      s.appendChild(sub);
      c.appendChild(s);
    }

    // mode buttons
    var modeRow = el("div", "row"); modeRow.style.margin = "18px 0 4px";
    var m1 = el("button", "chip" + (state.mode === "all" ? " on" : ""), "All questions");
    m1.onclick = function () { state.mode = "all"; render(); };
    var m2 = el("button", "chip" + (state.mode === "wrong" ? " on" : ""),
      "Retry wrong (" + wrongCount() + ")");
    m2.onclick = function () { state.mode = "wrong"; render(); };
    m2.disabled = wrongCount() === 0;
    if (m2.disabled) m2.style.opacity = ".45";
    var m3 = el("button", "chip" + (state.mode === "unseen" ? " on" : ""),
      "Not yet attempted (" + (QS.length - seenCount()) + ")");
    m3.onclick = function () { state.mode = "unseen"; render(); };
    m3.disabled = QS.length - seenCount() === 0;
    if (m3.disabled) m3.style.opacity = ".45";
    modeRow.appendChild(m1); modeRow.appendChild(m2); modeRow.appendChild(m3);
    c.appendChild(modeRow);

    var hint = el("div", "small muted"); hint.style.margin = "8px 0 4px";
    hint.textContent = state.mode === "wrong"
      ? "Only questions you've previously answered incorrectly. Get one right and it leaves this list."
      : (state.mode === "unseen" ? "Only questions you haven't attempted yet."
        : "Every question in the selected topics.");
    c.appendChild(hint);

    // topics
    var g = el("div", "grid");
    topics().forEach(function (t) {
      var pool = poolFor([t]);
      var b = el("button", "topic" + (state.selected[t] ? " on" : ""));
      b.appendChild(el("span", "tick", state.selected[t] ? "✓" : ""));
      var mid = el("span"); mid.style.flex = "1";
      mid.appendChild(el("span", "name", t));
      mid.appendChild(el("span", "desc", exam.desc[t] || ""));
      b.appendChild(mid);
      b.appendChild(el("span", "count", String(pool.length)));
      if (pool.length === 0) { b.disabled = true; b.style.opacity = ".4"; }
      b.onclick = function () { state.selected[t] = !state.selected[t]; render(); };
      g.appendChild(b);
    });
    c.appendChild(g);

    var r2 = el("div", "row");
    var all = el("button", "chip", "Select all");
    all.onclick = function () { topics().forEach(function (t) { state.selected[t] = true; }); render(); };
    var none = el("button", "chip", "Clear");
    none.onclick = function () { state.selected = {}; render(); };
    r2.appendChild(all); r2.appendChild(none);
    c.appendChild(r2);

    c.appendChild(el("hr", "sep"));

    var chosen = poolFor(selectedTopics());
    var sp = el("div", "spread");
    sp.appendChild(el("span", "mono small muted",
      chosen.length + " question" + (chosen.length === 1 ? "" : "s") + " selected"));
    var go = el("button", "btn", "Start");
    go.disabled = chosen.length === 0;
    go.onclick = begin;
    sp.appendChild(go);
    c.appendChild(sp);

    // reset
    if (seenCount() > 0) {
      var rst = el("button", "chip small", "Reset saved " + exam.code + " progress");
      rst.style.marginTop = "14px"; rst.style.color = "var(--sub)";
      rst.onclick = function () {
        if (confirm("Erase your saved " + exam.code + " progress in this browser? This cannot be undone.")) {
          prog = emptyProg();
          save(prog); render();
        }
      };
      c.appendChild(rst);
    }
    return c;
  }

  function selectedTopics() {
    return topics().filter(function (t) { return state.selected[t]; });
  }
  function poolFor(ts) {
    return QS.map(function (q, i) { return i; }).filter(function (i) {
      var q = QS[i];
      if (ts.indexOf(q.topic) === -1) return false;
      if (state.mode === "wrong") return !!prog.wrong[q.id];
      if (state.mode === "unseen") return !prog.seen[q.id];
      return true;
    });
  }

  /* ---------- quiz ---------- */
  function begin() {
    var chosen = poolFor(selectedTopics());
    if (!chosen.length) return;
    var sh = shuffle(chosen.length);
    state.order = sh.map(function (k) { return chosen[k]; });
    state.optOrder = {};
    state.order.forEach(function (i) {
      var q = QS[i];
      // keep True/False in their natural order; shuffle everything else
      state.optOrder[q.id] = q.format === "yes_no"
        ? q.options.map(function (_, k) { return k; })
        : shuffle(q.options.length);
    });
    state.idx = 0; state.picked = []; state.revealed = false; state.session = {};
    state.screen = "quiz";
    render();
  }

  function curQ() { return QS[state.order[state.idx]]; }
  function dispOrder(q) { return state.optOrder[q.id] || q.options.map(function (_, i) { return i; }); }
  function dispAnswer(q) {
    var d = dispOrder(q), out = [], i;
    for (i = 0; i < d.length; i++) if (q.answer.indexOf(d[i]) !== -1) out.push(i);
    return out;
  }

  function quizScreen() {
    var q = curQ(), c = el("div", "card");
    var da = dispAnswer(q), multi = da.length > 1;

    var head = el("div", "spread"); head.style.marginBottom = "6px";
    head.appendChild(el("span", "mono small muted", exam.code + " · Q" + (state.idx + 1) + " / " + state.order.length));
    var sc = Object.keys(state.session).filter(function (k) { return state.session[k]; }).length;
    head.appendChild(el("span", "mono small muted", sc + " / " + Object.keys(state.session).length));
    c.appendChild(head);

    var bar = el("div", "bar"); var fi = el("i");
    fi.style.width = Math.round(state.idx / state.order.length * 100) + "%";
    bar.appendChild(fi); bar.style.marginBottom = "20px"; c.appendChild(bar);

    var pills = el("div", "pills");
    pills.appendChild(el("span", "pill topic-p", q.topic));
    if (q.tag) pills.appendChild(el("span", "pill tag-p", q.tag));
    if (FMT[q.format]) pills.appendChild(el("span", "pill fmt-p", FMT[q.format]));
    if (prog.wrong[q.id]) pills.appendChild(el("span", "pill fmt-p", "previously wrong"));
    c.appendChild(pills);

    c.appendChild(el("div", "qtext", q.q));

    var g = el("div", "grid"); g.style.margin = "0 0 4px";
    dispOrder(q).forEach(function (orig, disp) {
      var b = el("button", "opt");
      var picked = state.picked.indexOf(disp) !== -1;
      var right = da.indexOf(disp) !== -1;
      var mark = String.fromCharCode(65 + disp);
      if (state.revealed) {
        if (right) { b.className = "opt right"; mark = "✓"; }
        else if (picked) { b.className = "opt wrong"; mark = "✕"; }
        b.disabled = true;
      } else if (picked) b.className = "opt sel";
      b.appendChild(el("span", "ltr", mark));
      b.appendChild(el("span", null, q.options[orig]));
      b.onclick = function () {
        if (state.revealed) return;
        if (multi) {
          var k = state.picked.indexOf(disp);
          if (k === -1) state.picked.push(disp); else state.picked.splice(k, 1);
        } else state.picked = [disp];
        render();
      };
      g.appendChild(b);
    });
    c.appendChild(g);

    if (state.revealed) {
      var ok = state.session[q.id];
      var w = el("div", "why " + (ok ? "ok" : "no"));
      w.appendChild(el("b", null, ok ? "Correct" : "Not quite"));
      w.appendChild(el("span", null, q.why));
      c.appendChild(w);
    }

    var foot = el("div", "spread"); foot.style.marginTop = "20px";
    var quit = el("button", "chip small", "Save & exit");
    quit.onclick = function () { state.screen = "setup"; render(); };
    foot.appendChild(quit);

    if (!state.revealed) {
      var chk = el("button", "btn", "Check answer");
      chk.disabled = state.picked.length === 0;
      chk.onclick = function () {
        if (!state.picked.length) return;
        var correct = eq(state.picked, da);
        state.session[q.id] = correct;
        prog.seen[q.id] = true;
        if (correct) delete prog.wrong[q.id]; else prog.wrong[q.id] = true;
        save(prog);
        state.revealed = true;
        render();
      };
      foot.appendChild(chk);
    } else {
      var nx = el("button", "btn",
        state.idx + 1 >= state.order.length ? "See results" : "Next question");
      nx.onclick = function () {
        if (state.idx + 1 >= state.order.length) {
          prog.runs = (prog.runs || 0) + 1;
          var tot = Object.keys(state.session).length;
          var got = Object.keys(state.session).filter(function (k) { return state.session[k]; }).length;
          var pct = tot ? Math.round(got / tot * 100) : 0;
          if (prog.best === null || prog.best === undefined || pct > prog.best) prog.best = pct;
          save(prog);
          state.screen = "results";
        } else {
          state.idx++; state.picked = []; state.revealed = false;
        }
        render();
      };
      foot.appendChild(nx);
    }
    c.appendChild(foot);
    return c;
  }

  /* ---------- results ---------- */
  function resultsScreen() {
    var c = el("div", "card");
    var ids = Object.keys(state.session);
    var got = ids.filter(function (k) { return state.session[k]; }).length;
    var pct = ids.length ? Math.round(got / ids.length * 100) : 0;
    var pass = pct >= 80;

    c.appendChild(el("div", "eyebrow", exam.code + " · Results"));
    var big = el("h1", "big", pct + "%"); c.appendChild(big);
    var sub = el("p", "lede");
    sub.style.color = pass ? "var(--good)" : "var(--gold)";
    sub.style.fontWeight = "600";
    sub.textContent = got + " / " + ids.length + " correct" +
      (pass ? " · above the 80% readiness bar" : " · aim for 80%+ before booking");
    c.appendChild(sub);

    // per-topic
    var byTopic = {};
    state.order.forEach(function (i) {
      var q = QS[i];
      if (!(q.id in state.session)) return;
      byTopic[q.topic] = byTopic[q.topic] || { c: 0, t: 0 };
      byTopic[q.topic].t++;
      if (state.session[q.id]) byTopic[q.topic].c++;
    });
    var g = el("div", "grid");
    Object.keys(byTopic).sort(function (a, b) {
      return (byTopic[a].c / byTopic[a].t) - (byTopic[b].c / byTopic[b].t);
    }).forEach(function (t) {
      var v = byTopic[t], p = Math.round(v.c / v.t * 100);
      var s = el("div", "stat");
      var top = el("div", "top");
      top.appendChild(el("span", null, t));
      var sp = el("span", "mono", v.c + "/" + v.t);
      sp.style.color = p >= 80 ? "var(--good)" : (p >= 50 ? "var(--gold)" : "var(--bad)");
      top.appendChild(sp); s.appendChild(top);
      var bar = el("div", "bar" + (p >= 80 ? " good" : "")); var fi = el("i");
      fi.style.width = p + "%"; bar.appendChild(fi); s.appendChild(bar);
      g.appendChild(s);
    });
    c.appendChild(g);

    var note = el("p", "lede");
    note.textContent = "Weakest topic first — that's where to spend your next session. " +
      (wrongCount() > 0
        ? wrongCount() + " question" + (wrongCount() === 1 ? " is" : "s are") +
          " now in your retry list."
        : "Nothing left in your retry list — nice.");
    c.appendChild(note);

    var row = el("div", "row"); row.style.marginTop = "18px";
    if (wrongCount() > 0) {
      var rw = el("button", "btn", "Retry the ones I got wrong");
      rw.onclick = function () {
        state.mode = "wrong";
        topics().forEach(function (t) { state.selected[t] = true; });
        begin();
      };
      row.appendChild(rw);
    }
    var again = el("button", "btn ghost", "Back to topics");
    again.onclick = function () { state.screen = "setup"; render(); };
    row.appendChild(again);
    c.appendChild(row);
    return c;
  }

  /* ---------- boot ---------- */
  var anyBank = ORDER.some(function (k) { return bankFor(k).length > 0; });
  if (!anyBank) {
    root.innerHTML = '<div class="boot">No questions found.</div>';
  } else {
    selectExam(initialExam(), false);
    window.addEventListener("hashchange", function () {
      var h = (window.location.hash || "").replace("#", "").toLowerCase();
      if (EXAMS[h] && h !== examKey) { selectExam(h, false); render(); }
    });
    render();
  }
})();

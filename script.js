/* =========================================================
   SKYCARE NAVIGATOR | SCRIPT
   ---------------------------------------------------------
   Plain JavaScript, no libraries, no build step.
   Demo data lives in data/demo-data.js (window.SKYCARE_DATA).

    1. Helpers
    2. Smart Context Engine (shared state)
    3. Navigation, scroll progress, reveal
    4. Problem section (fragmented → connected)
    5. Trip import + itinerary + hero card
    6. Dashboard + demo clock + profile
    7. Terminal map renderer (shared by many sections)
    8. AR navigation + gate change + camera
    9. Connection Rush Mode
   10. Sky assistant (local simulated AI)
   11. Smart detours
   12. I Have a Problem
   13. Medical assistance
   14. Accessibility
   15. Family Guardian
   16. Travel Group + Meet Me
   17. Language assistance
   18. Offline packs + service worker
   19. Connectivity + meals
   20. Human assistance
   21. Main map filters
   22. Presentation Mode
   23. Start-up
   ========================================================= */

(function () {
  "use strict";

  var D = window.SKYCARE_DATA;
  if (!D) { console.error("SkyCare: data/demo-data.js did not load."); return; }

  /* =======================================================
     1. HELPERS
     ======================================================= */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" : "") + m + " " + ap;
  }
  function aN(n) { return (n === 8 || n === 11 || n === 18 || (n >= 80 && n < 90)) ? "an " : "a "; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function dur(min) {
    if (min < 60) return plural(min, "minute");
    var h = Math.floor(min / 60), m = min % 60;
    return h + " h" + (m ? " " + m + " min" : "");
  }
  function icon(name) { return '<svg class="icon"><use href="#i-' + name + '"></use></svg>'; }
  function place(id) { return D.map.places.filter(function (p) { return p.id === id; })[0]; }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (document.body.classList.contains("present-mode")) { Present.goToSection(id); return; }
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  var toastsEl = $("#toasts");
  function toast(text, kind) {
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.innerHTML = icon(kind === "warn" ? "alert" : kind === "ok" ? "check" : "info") + "<span>" + text + "</span>";
    toastsEl.appendChild(t);
    while (toastsEl.children.length > 3) toastsEl.removeChild(toastsEl.firstChild);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 320); }, 3800);
  }

  /* =======================================================
     2. SMART CONTEXT ENGINE
     One shared state object. Every feature reads context()
     so SkyCare behaves differently based on the clock, gate,
     needs, and connectivity. Change state with setState().
     ======================================================= */
  var F2 = D.trip.flights[1];
  var state = {
    tripLoaded: false,
    scenario: "landed",
    now: D.scenarios[0].min,
    gate: "B18",
    gateChanged: false,
    accessible: false,
    assistance: false,
    meal: "halal",
    group: "solo",
    detour: null,           // an accepted Smart Detour stop, e.g. "seafood"
    simOffline: false,
    realOnline: navigator.onLine !== false,
    swReady: false,
    medical: false
  };
  var listeners = [];
  function onState(fn) { listeners.push(fn); }
  function setState(patch) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    var ctx = context();
    listeners.forEach(function (fn) { try { fn(ctx); } catch (e) { console.error(e); } });
  }

  function baseWalk(gate, accessible) {
    if (gate === "F7") return accessible ? D.routes.F7_accessible.min : D.routes.F7_fast.min;
    return accessible ? D.routes.B18_accessible.min : D.routes.B18.min;
  }

  function context() {
    var closesIn = F2.boardingClosesMin - state.now;
    var walk = baseWalk(state.gate, state.accessible);
    var det = state.detour ? D.detours[state.detour] : null;
    if (det) walk += Math.ceil(det.adds);
    var slack = closesIn - walk;
    var mode;
    if (closesIn <= 0) mode = "closed";
    else if (slack < 0) mode = "risk";
    else if (closesIn <= 20 || slack < 10) mode = "rush";
    else if (slack < 45) mode = "focused";
    else mode = "relaxed";
    return {
      now: state.now, nowLabel: fmt(state.now),
      gate: state.gate, pier: state.gate === "F7" ? "Pier F" : "Pier B",
      closesIn: closesIn, walk: walk, slack: slack, mode: mode,
      accessible: state.accessible, assistance: state.assistance,
      offline: state.simOffline || !state.realOnline,
      meal: state.meal, group: state.group, detour: state.detour,
      gateChanged: state.gateChanged, medical: state.medical
    };
  }
  var MODE_LABEL = { relaxed: "Relaxed", focused: "On track", rush: "Connection Rush", risk: "Connection at risk", closed: "Boarding closed" };

  /* =======================================================
     3. NAVIGATION, SCROLL PROGRESS, REVEAL
     ======================================================= */
  var navToggle = $("#navToggle"), navMenu = $("#navMenu"), moreBtn = $("#moreBtn"), moreMenu = $("#moreMenu");
  navToggle.addEventListener("click", function () {
    var open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  moreBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = moreMenu.classList.toggle("open");
    moreBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-more")) { moreMenu.classList.remove("open"); moreBtn.setAttribute("aria-expanded", "false"); }
    if (e.target.closest(".nav-links a")) { navMenu.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); }
  });

  var progress = $("#scrollProgress");
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  }, { passive: true });

  var navLinks = $$(".nav-links a[data-nav]");
  var navGroups = { home: ["home", "problem", "how"], dashboard: ["trip", "dashboard"], navigate: ["navigate", "rush", "detours", "map", "access"], ask: ["ask"], help: ["help", "medical", "human", "family", "group", "meet"], profile: ["profile", "language", "offline", "connect", "meals"] };
  function sectionToNav(id) { for (var k in navGroups) if (navGroups[k].indexOf(id) > -1) return k; return null; }

  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el) { revealObs.observe(el); });

    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var key = sectionToNav(en.target.id);
        navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-nav") === key); });
        if (en.target.id === "ask") Sky.greet();
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section").forEach(function (s) { secObs.observe(s); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // Subtle hero parallax
  var heroRoutes = $(".hero-routes");
  if (!reduceMotion && heroRoutes) {
    $("#home").addEventListener("mousemove", function (e) {
      var x = (e.clientX / innerWidth - 0.5) * 14, y = (e.clientY / innerHeight - 0.5) * 10;
      heroRoutes.style.transform = "translate(" + (-x) + "px," + (-y) + "px)";
    });
  }

  /* =======================================================
     4. PROBLEM: FRAGMENTED → CONNECTED
     ======================================================= */
  var Frag = (function () {
    var stage = $("#fragStage"), chips = $$("#fragChips li"), lines = $("#fragLines"), btn = $("#fragBtn"), cap = $("#fragCaption");
    // Scattered positions (percent) + rotation: a messy desk of apps and signs
    var scattered = [[12, 16, -4], [34, 10, 3], [62, 14, -2], [86, 20, 4], [8, 48, 2], [27, 72, -3], [88, 52, -5], [70, 84, 3], [45, 84, -2], [16, 84, 5], [70, 34, 6], [80, 66, -3]];
    function positions() {
      var connected = stage.getAttribute("data-state") === "connected";
      var narrow = stage.clientWidth < 640;
      chips.forEach(function (li, i) {
        var x, y, r = 0;
        if (connected) {
          var a = (i / chips.length) * Math.PI * 2 - Math.PI / 2;
          x = 50 + Math.cos(a) * (narrow ? 34 : 38);
          y = 50 + Math.sin(a) * (narrow ? 40 : 38);
        } else { x = scattered[i][0]; y = scattered[i][1]; r = scattered[i][2]; }
        li.style.setProperty("--x", x + "%"); li.style.setProperty("--y", y + "%"); li.style.setProperty("--r", r + "deg");
      });
    }
    function drawLines() {
      var w = stage.clientWidth, h = stage.clientHeight, connected = stage.getAttribute("data-state") === "connected";
      lines.setAttribute("viewBox", "0 0 " + w + " " + h);
      var pts = chips.map(function (li) { return [parseFloat(li.style.getPropertyValue("--x")) / 100 * w, parseFloat(li.style.getPropertyValue("--y")) / 100 * h]; });
      var html = "";
      if (connected) {
        pts.forEach(function (p, i) { html += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + w / 2 + '" y2="' + h / 2 + '" style="animation-delay:' + (i * 40) + 'ms"/>'; });
      } else {
        [[0, 5], [1, 10], [3, 6], [4, 9], [7, 11], [2, 10], [8, 5]].forEach(function (pair) {
          var a = pts[pair[0]], b = pts[pair[1]];
          var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; // broken halfway: disconnected systems
          html += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + (a[0] + (mx - a[0]) * 0.7) + '" y2="' + (a[1] + (my - a[1]) * 0.7) + '"/>';
        });
      }
      lines.innerHTML = html;
    }
    function set(connected) {
      stage.setAttribute("data-state", connected ? "connected" : "scattered");
      positions();
      lines.innerHTML = "";
      setTimeout(drawLines, connected ? 850 : 50);
      btn.innerHTML = connected ? "Show today's experience" : icon("sparkle") + "Connect them with SkyCare";
      cap.textContent = connected ? "SkyCare: one assistant that already knows the trip." : "Today: twelve disconnected sources, one stressed passenger.";
    }
    btn.addEventListener("click", function () { set(stage.getAttribute("data-state") !== "connected"); });
    window.addEventListener("resize", function () { positions(); drawLines(); });
    positions(); setTimeout(drawLines, 60);
    return { set: set };
  })();

  /* =======================================================
     5. TRIP IMPORT + ITINERARY + HERO CARD
     ======================================================= */
  var Trip = (function () {
    var scanBox = $("#scanBox"), steps = $$("#scanSteps li"), itin = $("#itinerary"), body = $("#itinBody"), resForm = $("#resForm");
    var busy = false;

    function render() {
      var t = D.trip, f1 = t.flights[0], f2 = t.flights[1];
      $("#itinPassenger").textContent = t.passenger;
      $("#itinCarrier").textContent = t.carrier;
      $("#itinRef").textContent = t.bookingRef;
      function leg(f) {
        return '<div class="leg">' +
          '<div class="leg-code">' + f.from + '<small>' + t.cities[f.from] + '</small></div>' +
          '<div class="leg-mid"><span class="mono">' + f.number + '</span><div class="leg-bar"></div>' + f.duration + '</div>' +
          '<div class="leg-code" style="text-align:right">' + f.to + '<small>' + t.cities[f.to] + '</small></div>' +
          '<div class="leg-meta"><span>Departs <b>' + f.depart + '</b> ' + f.departDate + '</span><span>Arrives <b>' + f.arrive + '</b> ' + f.arriveDate + '</span>' +
          '<span>' + f.departTerminal + ' · Gate <b class="js-gate-' + f.id + '">' + (f.id === "f2" ? state.gate : f.departGate) + '</b></span><span>Seat <b>' + f.seat + '</b></span>' +
          (f.boardingCloses ? '<span>Boarding <b>' + f.boardingStarts + '</b> · closes <b>' + f.boardingCloses + '</b></span>' : '') + '</div></div>';
      }
      body.innerHTML = leg(f1) +
        '<div class="conn-strip">' + icon("clock") + 'Connection in ' + t.connection.name + ' · ' + t.connection.scheduled + ' scheduled · arrive Gate ' + f1.arriveGate + '</div>' +
        leg(f2) +
        '<div class="itin-facts">' +
          '<div><span>Baggage</span><strong>' + t.baggage.pieces + ' bag · ' + t.baggage.tag + '</strong></div>' +
          '<div><span>Checked to</span><strong>' + t.baggage.checkedTo + ' · ' + t.baggage.status + '</strong></div>' +
          '<div><span>Needs</span><strong class="js-needs">' + (state.accessible ? "Wheelchair assistance" : t.needs) + '</strong></div>' +
          '<div><span>Languages</span><strong>' + t.preferences.languages.join(", ") + '</strong></div>' +
          '<div><span>Meal</span><strong class="js-meal">' + mealName(state.meal) + '</strong></div>' +
          '<div><span>Alerts</span><strong>' + t.preferences.alerts + '</strong></div>' +
        '</div>';
      body.classList.remove("itin-anim"); void body.offsetWidth; body.classList.add("itin-anim");
      $$(".leg, .conn-strip, .itin-facts div", body).forEach(function (el, i) { el.style.animationDelay = (i * 70) + "ms"; });
    }

    function heroLoaded() {
      var card = $(".hero-card");
      card.classList.add("loaded");
      $("#heroStatus").textContent = "SkyCare is ready";
      $("#heroFeed").innerHTML =
        '<li class="ok">' + icon("check") + 'Trip imported · DA 1784 + DA 762</li>' +
        '<li class="ok">' + icon("check") + 'Airport packs ready · FLL · IST · DXB</li>' +
        '<li class="ok">' + icon("check") + 'Connection in Istanbul · 2h 00m</li>' +
        '<li class="ok">' + icon("check") + 'Bag DA 482915 checked through to DXB</li>';
    }

    function load(method) {
      if (busy) return;
      busy = true;
      resForm.hidden = true;
      var labels = {
        pass: ["Scanning boarding pass…", "Reading itinerary…", "Finding airport maps…", "Checking connection…", "Loading traveler preferences…"],
        res: ["Looking up booking reference…", "Reading itinerary…", "Finding airport maps…", "Checking connection…", "Loading traveler preferences…"],
        demo: ["Loading demo boarding pass…", "Reading itinerary…", "Finding airport maps…", "Checking connection…", "Loading traveler preferences…"]
      }[method || "demo"];
      steps.forEach(function (li, i) { li.textContent = labels[i]; li.className = ""; });
      scanBox.classList.add("active");
      itin.setAttribute("data-loaded", "false");
      var i = 0, stepMs = reduceMotion ? 60 : 480;
      (function next() {
        if (i > 0) steps[i - 1].className = "done";
        if (i < steps.length) { steps[i].className = "run"; i++; setTimeout(next, stepMs); return; }
        setTimeout(function () {
          scanBox.classList.remove("active");
          render();
          itin.setAttribute("data-loaded", "true");
          heroLoaded();
          busy = false;
          setState({ tripLoaded: true });
          toast("<b>SkyCare is ready.</b> FLL → IST → DXB loaded.", "ok");
        }, stepMs);
      })();
    }

    document.addEventListener("click", function (e) {
      var b = e.target.closest('[data-action="load-demo"]');
      if (!b) return;
      if (b.closest("#home") && !document.body.classList.contains("present-mode")) scrollToId("trip");
      if (b.closest("#home") && document.body.classList.contains("present-mode")) Present.goToSection("trip");
      setTimeout(function () { load("demo"); }, b.closest("#home") ? 450 : 0);
    });
    $("#passFile").addEventListener("change", function () {
      // The file is intentionally never read or uploaded. The demo trip loads instead.
      if (this.files && this.files.length) load("pass");
      this.value = "";
    });
    $("#importResBtn").addEventListener("click", function () { resForm.hidden = !resForm.hidden; if (!resForm.hidden) $("#resCode").focus(); });
    resForm.addEventListener("submit", function (e) { e.preventDefault(); load("res"); });

    onState(function (ctx) {
      $$(".js-gate-f2").forEach(function (el) { el.textContent = ctx.gate; });
      $$(".js-needs").forEach(function (el) { el.textContent = ctx.accessible ? "Wheelchair assistance" : D.trip.needs; });
      $$(".js-meal").forEach(function (el) { el.textContent = mealName(ctx.meal); });
    });
    return { load: load };
  })();

  function mealName(v) { return v === "halal" ? "Halal" : v === "vegetarian" ? "Vegetarian" : "No preference"; }

  /* =======================================================
     6. DASHBOARD + DEMO CLOCK + PROFILE
     ======================================================= */
  var Dash = (function () {
    var chipsEl = $("#clockChips");
    chipsEl.innerHTML = D.scenarios.map(function (s) {
      return '<button type="button" class="chip" data-scenario="' + s.id + '"><span class="mono">' + s.label + '</span>' + s.title + '</button>';
    }).join("");
    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-scenario]"); if (b) setScenario(b.getAttribute("data-scenario"));
    });

    onState(function (ctx) {
      $$(".chip", chipsEl).forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-scenario") === state.scenario); });
      var modeEl = $("#dashMode");
      modeEl.textContent = MODE_LABEL[ctx.mode] + " mode";
      modeEl.className = "dash-mode " + (ctx.mode === "relaxed" ? "" : ctx.mode === "focused" ? "focused" : ctx.mode === "rush" ? "rush" : "risk");
      $("#dashAction").textContent = ctx.mode === "risk" ? "Contact airline · Transfer Desk" : ctx.mode === "closed" ? "See rebooking options" : (ctx.detour ? "Stop at " + D.detours[ctx.detour].name + ", then Gate " + ctx.gate : "Proceed to Gate " + ctx.gate);
      $("#dashWalk").textContent = ctx.walk;
      $("#dashCloses").textContent = Math.max(ctx.closesIn, 0);
      $("#dashSlack").textContent = ctx.slack;
      var st = $("#dashStatus");
      st.textContent = ctx.mode === "risk" ? "Connection at risk" : ctx.mode === "rush" ? "Tight · keep moving" : "Connection safe";
      st.className = ctx.mode === "risk" ? "bad" : ctx.mode === "rush" ? "warn" : "ok";
      $("#dashBag").textContent = D.trip.baggage.status + " · to " + D.trip.baggage.checkedTo;
      var assist = [];
      if (ctx.medical) assist.push("Medical help requested (demo)");
      if (ctx.assistance) assist.push("Wheelchair assistance · shared");
      else if (ctx.accessible) assist.push("Step-free route on");
      $("#dashAssist").textContent = assist.length ? assist.join(" · ") : "None requested";
      $("#dashConn").textContent = ctx.offline ? "Offline · using downloaded airport pack" : "Online · offline airport pack downloaded";

      var why;
      if (ctx.mode === "relaxed") why = "<b>Why:</b> " + ctx.closesIn + " min until boarding closes and " + aN(ctx.walk) + ctx.walk + "-minute walk leaves " + ctx.slack + " min to spare, so Sky can suggest restaurants, lounges, and shopping.";
      else if (ctx.mode === "focused") why = "<b>Why:</b> " + ctx.slack + " min to spare. Sky still allows quick stops on the route but no sit-down meals.";
      else if (ctx.mode === "rush") why = "<b>Why:</b> boarding closes in " + ctx.closesIn + " min and the fastest walk is " + ctx.walk + " min. Rush Mode hides shopping, lounges, and restaurants.";
      else if (ctx.mode === "risk") why = "<b>Why:</b> the " + ctx.walk + "-minute walk is longer than the " + Math.max(ctx.closesIn, 0) + " min left. SkyCare says so honestly and routes you to the airline.";
      else why = "<b>Why:</b> boarding has closed. SkyCare routes you to the airline transfer desk.";
      if (ctx.offline) why += " <b>Offline:</b> using the last downloaded gate data.";
      $("#dashWhy").innerHTML = why;
    });

    // Profile controls
    $("#prefAccess").addEventListener("change", function () { setAccessible(this.checked); });
    $("#prefMeal").addEventListener("change", function () { setState({ meal: this.value }); toast("Meal preference saved: <b>" + mealName(this.value) + "</b>. Sky and the meal section now use it.", "ok"); });
    $("#prefGroup").addEventListener("change", function () { setState({ group: this.value }); toast(this.value === "family" ? "Family group on. Family Guardian and Travel Group are active." : "Traveling solo.", "ok"); });
    onState(function (ctx) {
      $("#prefAccess").checked = ctx.accessible;
      $("#prefMeal").value = ctx.meal;
      $("#prefGroup").value = ctx.group;
    });
  })();

  function setScenario(id) {
    var s = D.scenarios.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    var patch = { scenario: id, now: s.min };
    if (id !== "landed") { patch.gate = "F7"; patch.gateChanged = true; }
    if (id === "late" || id === "risk") patch.detour = null;
    setState(patch);
  }

  /* =======================================================
     7. TERMINAL MAP RENDERER
     renderMap(svg, options) draws the fictional IST demo map
     and overlays routes, people, and highlights.
     ======================================================= */
  var CAT_COLOR = { gate: "#f2c94c", food: "#ff9f5a", restroom: "#8fb8ff", medical: "#ff6b6b", help: "#2dd4e0", access: "#3ef08a", meet: "#c792ff", other: "#9aa9bd" };
  var SPINE_Y = 300;
  function routeFor(gate, accessible, detour) {
    if (detour === "seafood" && !accessible && gate === "F7") return D.routes.F7_seafood.pts;
    var base = gate === "F7" ? (accessible ? D.routes.F7_accessible.pts : D.routes.F7_fast.pts) : D.routes.B18.pts;
    if (!detour) return base;
    return pathVia(D.map.you, place(gate === "F7" ? "gateF7" : "gateB18"), place(D.detours[detour].place));
  }
  function pathTo(from, to) {
    var pts = [[from.x, from.y]];
    if (from.y !== SPINE_Y) pts.push([from.x, SPINE_Y]);
    if (to.x !== from.x) pts.push([to.x, SPINE_Y]);
    if (to.y !== SPINE_Y) pts.push([to.x, to.y]);
    return pts;
  }
  function pathVia(from, to, via) {
    var a = pathTo(from, via), b = pathTo(via, to);
    return a.concat(b.slice(1));
  }
  function ptsToD(pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + p[1]; }).join(" "); }

  function renderMap(svg, o) {
    o = o || {};
    var m = D.map, h = [];
    h.push('<rect class="tm-bg" x="0" y="0" width="1000" height="560" rx="18"/>');
    for (var gx = 50; gx < 1000; gx += 50) h.push('<line class="tm-gridline" x1="' + gx + '" y1="0" x2="' + gx + '" y2="560"/>');
    for (var gy = 50; gy < 560; gy += 50) h.push('<line class="tm-gridline" x1="0" y1="' + gy + '" x2="1000" y2="' + gy + '"/>');
    h.push('<rect class="tm-spine" x="' + m.spine.x + '" y="' + m.spine.y + '" width="' + m.spine.w + '" height="' + m.spine.h + '" rx="28"/>');
    m.zones.forEach(function (z) {
      h.push('<rect class="tm-zone ' + z.kind + '" x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h + '" rx="' + (z.kind === "plaza" ? 40 : 14) + '"/>');
      var lx = z.kind === "pier" ? z.x + z.w / 2 : z.x + 14, ly = z.kind === "pier" ? (z.y < 200 ? z.y - 8 : z.y + z.h + 18) : z.y + 22;
      h.push('<text class="tm-zone-label" x="' + lx + '" y="' + ly + '" text-anchor="' + (z.kind === "pier" ? "middle" : "start") + '">' + z.label + '</text>');
    });
    h.push('<text class="tm-zone-label" x="' + (m.spine.x + m.spine.w - 12) + '" y="' + (m.spine.y - 8) + '" text-anchor="end">Main concourse</text>');
    // stairs marker
    var s = m.stairs;
    h.push('<path class="tm-stairs" d="M' + (s.x - 12) + ' ' + (s.y + 12) + ' h6 v-6 h6 v-6 h6 v-6 h6"/><text class="tm-stairs-label" x="' + s.x + '" y="' + (s.y - 16) + '" text-anchor="middle">STAIRS</text>');
    if (o.title !== false) h.push('<text class="tm-title" x="500" y="546" text-anchor="middle">' + m.title + ' · FICTIONAL</text>');

    if (o.altRoute) h.push('<path class="tm-route alt" d="' + ptsToD(o.altRoute) + '"/>');
    (o.people || []).forEach(function (p) {
      if (p.path) h.push('<path class="tm-route person" d="' + ptsToD(p.path) + '"/>');
    });
    if (o.route) {
      h.push('<path class="tm-route' + (o.draw ? " draw" : "") + '" d="' + ptsToD(o.route) + '"/>');
      h.push('<path class="tm-route-flow" d="' + ptsToD(o.route) + '"/>');
    }

    var hl = o.highlight, hlIds = o.highlightIds || [];
    m.places.forEach(function (p) {
      var isHl = hlIds.indexOf(p.id) > -1 || (hl && (hl === "all" || p.cat === hl || (hl === "access" && p.access)));
      var dim = (hl || hlIds.length) && !isHl && !(o.keep && o.keep.indexOf(p.id) > -1);
      var color = CAT_COLOR[p.cat] || "#9aa9bd";
      var showLabel = isHl || o.labels === "all" || (o.keep && o.keep.indexOf(p.id) > -1);
      var above = p.y > 300 ? 22 : -14;
      h.push('<g class="tm-poi' + (isHl ? " hl" : "") + (dim ? " dim" : "") + '"><circle class="halo" cx="' + p.x + '" cy="' + p.y + '" r="8" stroke="' + color + '"/>' +
        '<circle class="dot" cx="' + p.x + '" cy="' + p.y + '" r="6" fill="' + color + '"/>' +
        (showLabel ? '<text x="' + p.x + '" y="' + (p.y + above) + '" text-anchor="middle">' + p.label + '</text>' : "") + '</g>');
    });

    (o.people || []).forEach(function (p) {
      h.push('<g class="tm-person' + (p.off ? " off" : "") + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="9"/><text x="' + (p.x + 14) + '" y="' + (p.y + 5) + '">' + esc(p.label) + '</text></g>');
    });
    if (o.target) {
      var t = o.target;
      h.push('<g class="tm-target"><circle class="ring" cx="' + t.x + '" cy="' + t.y + '" r="12"/><circle cx="' + t.x + '" cy="' + t.y + '" r="10"/><text x="' + t.x + '" y="' + (t.y - 18) + '" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" paint-order="stroke" stroke="#06101d" stroke-width="4">' + esc(t.label) + '</text></g>');
    }
    if (o.you !== false) {
      var y = m.you;
      h.push('<g class="tm-you"><circle class="ring" cx="' + y.x + '" cy="' + y.y + '" r="12"/><circle class="core" cx="' + y.x + '" cy="' + y.y + '" r="8"/><text x="' + (y.x + 16) + '" y="' + (y.y + 5) + '">You</text></g>');
    }
    svg.innerHTML = h.join("");
  }

  /* =======================================================
     8. AR NAVIGATION + GATE CHANGE + CAMERA
     ======================================================= */
  var AR = (function () {
    var screen = $("#arScreen"), log = $("#arLog"), video = $("#arVideo"), camBtn = $("#cameraBtn");
    var instr = {
      B18: [["↑", 0, "CONTINUE STRAIGHT", "then turn right in 120 ft"], ["→", 0, "TURN RIGHT", "toward Pier B · Gate B18"], ["↑", 0, "CONTINUE STRAIGHT", "Gate B18 ahead on the left"]],
      F7: [["↑", 0, "CONTINUE STRAIGHT", "moving walkway ahead · 400 ft"], ["↑", 0, "STAY ON THE WALKWAY", "Pier F in about 5 min"], ["↑", 0, "CONTINUE STRAIGHT", "toward Gates F1–F12"]],
      ACC: [["↑", 0, "CONTINUE STRAIGHT", "Elevator E2 in 40 ft, on the left"], ["←", 0, "TURN LEFT", "Elevator E2 · step-free route"], ["↑", 0, "CONTINUE STRAIGHT", "accessible restroom on the right"]]
    };
    var step = 0, timer = null, busy = false, stream = null, visible = false;

    function routeKey(ctx) { return ctx.accessible ? "ACC" : ctx.gate; }
    function addLog(html, cls) {
      var li = document.createElement("li");
      if (cls) li.className = cls;
      li.innerHTML = html;
      log.appendChild(li);
      log.scrollTop = log.scrollHeight;
    }
    function showInstr() {
      var ctx = context(), key = routeKey(ctx), list = instr[key], it = list[step % list.length];
      $("#arArrow").textContent = it[0];
      $("#arInstrText").textContent = (ctx.mode === "rush" || ctx.mode === "risk") && it[2] === "CONTINUE STRAIGHT" ? "KEEP MOVING" : it[2];
      $("#arInstrSub").textContent = it[3];
    }
    function hud(ctx) {
      if (busy) return;
      screen.setAttribute("data-route", routeKey(ctx));
      $("#arGate").textContent = ctx.gate;
      $("#arMin").textContent = ctx.walk;
      var note = $("#arNote");
      if (ctx.mode === "risk") { note.textContent = "Connection at risk · contact airline"; note.className = "ar-dest-note warn"; }
      else if (ctx.mode === "rush") { note.textContent = "Boarding closes in " + ctx.closesIn + " min · you can make it"; note.className = "ar-dest-note warn"; }
      else { note.textContent = "Boarding closes " + F2.boardingCloses + " · " + ctx.slack + " min to spare"; note.className = "ar-dest-note ok"; }
      screen.classList.toggle("rush", ctx.mode === "rush" || ctx.mode === "risk");
      showInstr();
    }
    onState(hud);

    function tick() { step++; showInstr(); }
    function run() { if (!timer && visible) timer = setInterval(tick, 3200); screen.classList.remove("paused"); }
    function stop() { clearInterval(timer); timer = null; screen.classList.add("paused"); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? run() : stop(); }, { threshold: 0.2 }).observe(screen);
    } else { visible = true; run(); }

    function gateChange() {
      if (busy) return;
      var ctx = context();
      if (ctx.offline) {
        addLog("Offline: live gate updates are paused. Showing last downloaded gate <strong>" + ctx.gate + "</strong>.", "warn");
        toast("Offline: SkyCare can't receive live gate changes. It keeps the last downloaded gate and resumes updates when connectivity returns.", "warn");
        return;
      }
      if (state.gate === "F7") { toast("The gate already changed to F7. Press Reset to replay the demo.", "warn"); return; }
      busy = true;
      screen.classList.add("alerting");
      addLog("WARNING: gate changed <strong>B18 → F7</strong> (demo airline update).", "warn");
      setTimeout(function () {
        screen.setAttribute("data-route", "NONE");
        screen.classList.add("erasing");
        addLog("Removing old route to B18…");
      }, 1300);
      setTimeout(function () { screen.classList.add("recalc"); addLog("Recalculating walking time…"); }, 2300);
      setTimeout(function () {
        screen.classList.remove("erasing", "recalc", "alerting");
        busy = false;
        setState({ gate: "F7", gateChanged: true, detour: null });
        var c = context();
        addLog("New route calculated: <strong>Gate F7</strong>, " + c.walk + " min walk.", "ok");
        var verdict = c.slack >= 0 ? "Enough time: " + c.slack + " min to spare." : "Not enough time: contact the airline.";
        addLog(verdict, c.slack >= 0 ? "ok" : "warn");
        toast("<b>New route calculated.</b> Gate F7 · " + c.walk + " min walk. " + verdict, c.slack >= 0 ? "ok" : "warn");
      }, 3700);
    }

    function reset() {
      stopCamera();
      busy = false;
      screen.classList.remove("erasing", "recalc", "alerting");
      log.innerHTML = "";
      setState({ gate: "B18", gateChanged: false, scenario: "landed", now: D.scenarios[0].min, detour: null, medical: false });
      addLog("Route to <strong>Gate B18</strong> loaded. " + context().walk + " min walk.");
    }

    function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast("Camera isn't available in this browser. The simulated terminal view stays on.", "warn");
        addLog("Camera unavailable. Staying in simulated view.", "warn");
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }).then(function (s) {
        stream = s;
        video.srcObject = s;
        video.play().catch(function () {});
        screen.classList.add("camera");
        camBtn.innerHTML = icon("x") + "Stop Camera";
        addLog("Camera demo on. The route is an overlay only; no indoor positioning.", "ok");
      }).catch(function () {
        toast("Camera permission was not granted. The simulated terminal view keeps working.", "warn");
        addLog("Camera permission unavailable. Staying in simulated view.", "warn");
      });
    }
    function stopCamera() {
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
      video.srcObject = null;
      screen.classList.remove("camera");
      camBtn.innerHTML = icon("camera") + "Use Camera Demo";
    }

    $("#gateChangeBtn").addEventListener("click", gateChange);
    $("#arResetBtn").addEventListener("click", reset);
    camBtn.addEventListener("click", function () { stream ? stopCamera() : startCamera(); });
    $("#arAccessBtn").addEventListener("click", function () { setAccessible(!state.accessible); });
    onState(function (ctx) { $("#arAccessBtn").setAttribute("aria-pressed", String(ctx.accessible)); });
    return { log: addLog };
  })();

  /* =======================================================
     9. CONNECTION RUSH MODE
     ======================================================= */
  (function () {
    var screen = $("#rushScreen"), cd = $("#rsCountdown"), secs = 0, timer = null;
    function render(ctx) {
      var mode = ctx.mode === "risk" || ctx.mode === "closed" ? "risk" : ctx.mode === "rush" ? "rush" : "normal";
      screen.setAttribute("data-mode", mode);
      $("#rsClock").textContent = ctx.nowLabel;
      $("#rsNow").textContent = ctx.nowLabel;
      $("#rsGate").textContent = ctx.gate;
      $("#rsNormGate").textContent = ctx.gate;
      $(".rs-closes").textContent = "Boarding closes " + F2.boardingCloses + " · " + Math.max(ctx.closesIn, 0) + " min";
      $(".rs-gate").textContent = "GATE " + ctx.gate;
      $(".rs-walk strong").textContent = ctx.walk;
      $("#rsMsg").textContent = mode === "risk" ? "Connection at risk. Contact airline." : "Keep moving. You can still reach the gate.";
      $("#rsAlt").hidden = mode !== "risk";
      $$(".rush-buttons .btn").forEach(function (b) { b.classList.remove("active"); });
      clearInterval(timer);
      secs = Math.max(ctx.closesIn, 0) * 60;
      showCd();
      if (mode !== "normal" && !reduceMotion) timer = setInterval(function () { if (secs > 0) { secs--; showCd(); } }, 1000);
    }
    function showCd() { var m = Math.floor(secs / 60), s = secs % 60; cd.textContent = m + ":" + (s < 10 ? "0" : "") + s; }
    onState(render);
    $("#rushBtn").addEventListener("click", function () { setScenario("late"); toast("Late arrival: 7:04 PM. SkyCare switched to <b>Connection Rush Mode</b>.", "warn"); });
    $("#rushRiskBtn").addEventListener("click", function () { setScenario("risk"); toast("7:14 PM: the walk is longer than the time left. SkyCare says so honestly.", "warn"); });
    $("#rushResetBtn").addEventListener("click", function () { setScenario("landed"); });
    $("#rsAltBtn").addEventListener("click", function () { $("#rsAlt").hidden = !$("#rsAlt").hidden; });
  })();

  /* =======================================================
     10. SKY ASSISTANT (LOCAL SIMULATED AI)
     ---------------------------------------------------------
     SECURITY: never put an AI API key in this file. GitHub
     Pages is public. To connect a real model later, set
     SKY_CONFIG.endpoint to YOUR OWN protected backend URL.
     The backend holds the key and calls the AI service.
     The request body sends { message, context } only.
     ======================================================= */
  var SKY_CONFIG = { endpoint: null /* e.g. "https://your-backend.example.com/sky" */ };

  var Sky = (function () {
    var logEl = $("#skyLog"), form = $("#skyForm"), input = $("#skyText"), greeted = false;

    function ctxLine(ctx) {
      return "Context used: " + ctx.nowLabel + " · Gate " + ctx.gate + " · " + Math.max(ctx.closesIn, 0) + " min to close · " + MODE_LABEL[ctx.mode] + (ctx.accessible ? " · step-free" : "") + (ctx.offline ? " · offline pack" : "");
    }

    /* ---- Detour logic shared with the Smart Detours section ---- */
    function evalDetour(kind, ctx) {
      var d = D.detours[kind], gateTxt = "Gate " + ctx.gate;
      var remaining = ctx.closesIn - ctx.walk - d.adds - d.dwell;
      var r = { kind: kind, name: d.name, facts: ["+" + d.adds + " min walk", "~" + d.dwell + " min there", Math.max(ctx.closesIn, 0) + " min until boarding closes"] };
      if (kind === "restroom") {
        r.verdict = "ok";
        r.text = (ctx.accessible ? "An accessible restroom" : "A restroom") + " is 30 seconds ahead, directly on your route" + (ctx.accessible ? " next to Elevator E2" : " on the left") + ". It adds less than a minute." + (ctx.mode === "rush" || ctx.mode === "risk" ? " Keep it quick; your connection is tight." : "");
        return r;
      }
      if (kind === "charge" && ctx.mode !== "rush" && ctx.mode !== "risk" && ctx.mode !== "closed") {
        r.verdict = "ok";
        r.text = "A <b>charging station</b> is directly on your route near Pier F, so it adds no walking time. With " + ctx.slack + " minutes to spare, you can charge for a while and still reach " + gateTxt + " comfortably.";
        return r;
      }
      if (kind === "charge" && (ctx.mode === "rush" || ctx.mode === "risk")) {
        r.verdict = "no";
        r.text = "Don't stop to charge now. There's a charging station near Pier F on your route; your phone has the offline pack if the battery runs low.";
        return r;
      }
      if (ctx.mode === "risk" || ctx.mode === "closed") {
        r.verdict = "no";
        r.text = "Your connection is already at risk, so I won't add any stops. Keep going to " + gateTxt + " or contact the airline.";
        return r;
      }
      if (ctx.mode === "rush" || remaining < 5) {
        r.verdict = "no";
        r.text = "Your connection is too tight for this stop. I recommend continuing to " + gateTxt + "." + (kind === "pharmacy" ? " If you need medication urgently, tell me “I don't feel well.”" : "");
        return r;
      }
      var base = "<b>" + d.name + "</b> is " + (d.off ? plural(d.off, "minute") + " off" : "right on") + " your current route. Visiting it adds approximately " + plural(Math.ceil(d.adds), "minute") + " to your walk.";
      if (remaining >= 15) { r.verdict = "ok"; r.text = base + " You'd still reach " + gateTxt + " with about " + remaining + " minutes to spare."; }
      else { r.verdict = "quick"; r.text = base + " It fits only as a quick stop; take it to go. You'd reach " + gateTxt + " with about " + remaining + " minutes to spare."; }
      return r;
    }

    function foodPref(ctx) { return ctx.meal === "halal" ? "halal" : ctx.meal === "vegetarian" ? "vegetarian" : "seafood"; }

    /* ---- Intents: keyword patterns → contextual responses ----
       Each respond() returns { text, actions, tone }.
       Order matters: safety first. */
    var intents = [
      { id: "unwell", re: /(don'?t|do not|not) feel (well|good)|feel sick|i'?m sick|dizzy|chest|faint|can'?t breathe|medical|doctor|hurt|injur|emergency|ambulance/i,
        respond: function (ctx) {
          setState({ medical: true });
          return { tone: "urgent", text: "I'm sorry you're not feeling well. <b>If this is an emergency, tell the nearest airport or airline staff member right now</b> or call 112 (Türkiye). I've set other suggestions aside.<br>Medical Center: 5 min · Nearest AED: 1 min.",
            actions: [{ label: "Request medical assistance", act: "med:urgent", primary: true }, { label: "Nearest medical location", act: "med:medical" }, { label: "Emergency numbers", act: "med:emergency" }] };
        } },
      { id: "family", re: /(child|kid|son|daughter|family member|mom|dad|mother|father|brother|sister|sibling).*(missing|lost|can'?t find)|(missing|lost).*(child|kid|son|daughter|family)/i,
        respond: function () {
          return { tone: "urgent", text: "<b>Tell the nearest airport staff member or security officer immediately.</b> Airport staff can act faster than any app. The Airport Security Office is 2 min away. If your Travel Group is sharing location, I can show where they last shared from.",
            actions: [{ label: "Open missing-family help", act: "problem:family", primary: true }, { label: "Find my group", act: "goto:group" }] };
        } },
      { id: "bag", re: /bag|luggage|suitcase|baggage/i,
        respond: function () {
          var b = D.trip.baggage;
          return { text: "Your bag <b>" + b.tag + "</b> is checked through to Dubai, so you won't collect it in Istanbul. Last scan: " + b.statusDetail + ". If it doesn't arrive at DXB, I'll take you to Baggage Services with your tag and boarding pass ready.",
            actions: [{ label: "Show missing-bag help", act: "problem:bag", primary: true }] };
        } },
      { id: "missed", re: /miss(ed)? (my )?(connection|flight)|rebook/i,
        respond: function (ctx) {
          return { tone: "caution", text: ctx.mode === "risk" || ctx.mode === "closed" ? "Your connection is at risk. The Demo Air Transfer Desk is 2 min away and handles rebooking. I'll tell you exactly what to ask for." : "You haven't missed it. Boarding closes in " + ctx.closesIn + " min and your walk is " + ctx.walk + " min. If anything changes, I'll route you to the Transfer Desk.",
            actions: [{ label: "Missed-connection help", act: "problem:missed", primary: true }, { label: "Talk to the airline", act: "human:airline" }] };
        } },
      { id: "wheel", re: /wheelchair|accessib|disab|elevator|lift|can'?t walk|mobility|stairs/i,
        respond: function (ctx) {
          return { text: ctx.accessible ? "Your step-free route is already on: " + ctx.walk + " min to Gate " + ctx.gate + " via Elevator E2. Your wheelchair request is shared with each stage so you don't have to repeat it." : "I can switch you to a step-free route via Elevator E2 (" + baseWalk(ctx.gate, true) + " min to Gate " + ctx.gate + ") and share a wheelchair request with Demo Air so the gate and arrival teams already know.",
            actions: ctx.accessible ? [{ label: "View route", act: "navigate", primary: true }] : [{ label: "Turn on accessible route", act: "access:on", primary: true }, { label: "Accessibility services", act: "human:access" }] };
        } },
      { id: "restroom", re: /bathroom|restroom|toilet|washroom|\bwc\b|loo/i,
        respond: function (ctx) { var r = evalDetour("restroom", ctx); return { text: r.text, actions: [{ label: "Show on route", act: "detour:restroom", primary: true }] }; } },
      { id: "seafood", re: /seafood|fish|sushi/i, respond: function (ctx) { return detourReply("seafood", ctx); } },
      { id: "halal", re: /halal/i, respond: function (ctx) { return detourReply("halal", ctx); } },
      { id: "veg", re: /vegetarian|vegan|plant/i, respond: function (ctx) { return detourReply("vegetarian", ctx); } },
      { id: "coffee", re: /coffee|latte|espresso|tea\b|caf[eé]/i, respond: function (ctx) { return detourReply("coffee", ctx); } },
      { id: "flightfood", re: /(food|meal|eat|menu|dinner).*(flight|plane|board|onboard)|(flight|plane|onboard).*(food|meal|menu)/i,
        respond: function (ctx) {
          return { text: "DA 762 to Dubai has a dinner service (demo). Your saved preference is <b>" + mealName(ctx.meal) + "</b>. Preorders close before departure; each airline sets its own cutoff, and some don't support preorder through SkyCare.",
            actions: [{ label: "Meal options", act: "goto:meals", primary: true }] };
        } },
      { id: "hungry", re: /hungry|food|eat|restaurant|lunch|dinner|snack|starving/i,
        respond: function (ctx) {
          if (ctx.mode === "rush" || ctx.mode === "risk") return detourReply(foodPref(ctx), ctx);
          var pref = foodPref(ctx), r = detourReply(pref, ctx);
          r.text = (pref !== "seafood" ? "Based on your saved " + mealName(ctx.meal).toLowerCase() + " preference: " : "") + r.text;
          r.actions.push({ label: "Other options", act: "goto:detours" });
          return r;
        } },
      { id: "pharmacy", re: /pharmacy|medicine|medication|painkiller|aspirin/i, respond: function (ctx) { return detourReply("pharmacy", ctx); } },
      { id: "charge", re: /charg|battery|power|outlet|plug/i, respond: function (ctx) { return detourReply("charge", ctx); } },
      { id: "quiet", re: /quiet|pray|prayer|rest|calm|relax|sleep|nap/i, respond: function (ctx) { return detourReply("quiet", ctx); } },
      { id: "lounge", re: /lounge/i, respond: function (ctx) { return detourReply("lounge", ctx); } },
      { id: "connection", re: /make (my|the) connection|make it|connection|enough time|will i make/i,
        respond: function (ctx) {
          if (ctx.mode === "risk" || ctx.mode === "closed") return { tone: "urgent", text: "Honestly, it's at risk: the walk is " + ctx.walk + " min and boarding closes in " + Math.max(ctx.closesIn, 0) + " min. Contact the airline now; the Transfer Desk is 2 min away.", actions: [{ label: "Contact airline", act: "human:airline", primary: true }, { label: "Keep going anyway", act: "navigate" }] };
          if (ctx.mode === "rush") return { tone: "caution", text: "Yes, if you keep moving. Fastest route to Gate " + ctx.gate + ": " + ctx.walk + " min. Boarding closes in " + ctx.closesIn + " min. I've hidden everything else.", actions: [{ label: "Navigate now", act: "navigate", primary: true }] };
          return { text: "Yes. Your connection is safe: " + ctx.slack + " min to spare after " + aN(ctx.walk) + ctx.walk + "-minute walk to Gate " + ctx.gate + ".", actions: [{ label: "Navigate", act: "navigate", primary: true }] };
        } },
      { id: "gate", re: /gate|where.*(go|flight)|which way|directions/i,
        respond: function (ctx) {
          return { text: "Your flight <b>DA 762 to Dubai</b> leaves from <b>Gate " + ctx.gate + "</b>, " + ctx.pier + (ctx.gateChanged ? " (changed from B18)" : "") + ". It's " + aN(ctx.walk) + ctx.walk + "-minute walk" + (ctx.accessible ? " on a step-free route" : "") + ". Boarding closes at " + F2.boardingCloses + ".",
            actions: [{ label: "Navigate", act: "navigate", primary: true }, { label: "Show map", act: "goto:map" }] };
        } },
      { id: "boarding", re: /boarding|how long|what time|when.*(board|leave|depart)|departure/i,
        respond: function (ctx) {
          var started = ctx.now >= 19 * 60;
          return { text: "Boarding for DA 762 " + (started ? "started" : "starts") + " at " + F2.boardingStarts + " and closes at " + F2.boardingCloses + ". It's " + ctx.nowLabel + ", so you have <b>" + dur(Math.max(ctx.closesIn, 0)) + "</b> until the doors close, and your walk is " + ctx.walk + " min.",
            actions: [{ label: "Navigate", act: "navigate", primary: true }] };
        } },
      { id: "sim", re: /\bsim\b|esim|data|wi-?fi|internet|roaming|phone plan/i,
        respond: function (ctx) {
          if (ctx.mode === "rush" || ctx.mode === "risk") return { tone: "caution", text: "Not now; your connection is tight. Your offline DXB pack will work when you land, and I'll show connectivity options in Dubai.", actions: [{ label: "Dubai connectivity", act: "goto:connect" }] };
          return { text: "The SIM & eSIM Desk is on the main concourse, about 3 min away. Since you're continuing to Dubai, a UAE option may make more sense; check that your phone is unlocked first.", actions: [{ label: "Dubai connectivity options", act: "goto:connect", primary: true }] };
        } },
      { id: "meet", re: /meet|friend|pick (me|up)|find (him|her|them)/i,
        respond: function () {
          return { text: "Use a Meet Me code. You both opt in, and I'll pick a spot you can <b>both</b> legally reach. Transfer passengers can't always cross security zones, so I won't just point you at each other.",
            actions: [{ label: "Open Meet Me", act: "goto:meet", primary: true }] };
        } },
      { id: "lostitem", re: /lost (my|a|an)|left (my|it)|forgot/i,
        respond: function () { return { text: "Lost & Found is in the Arrivals Hall. If you left it on the aircraft, the airline handles it first. I'll prepare a description checklist.", actions: [{ label: "Lost-item help", act: "problem:lostitem", primary: true }] }; } },
      { id: "lost", re: /i'?m lost|where am i|confused|don'?t know where/i,
        respond: function (ctx) { return { text: "You're at Arrival Gate A4, Pier A. No problem: follow the green line to Gate " + ctx.gate + " (" + ctx.walk + " min). Information Desk C is on the way if you'd like a person.", actions: [{ label: "Navigate", act: "navigate", primary: true }, { label: "Show map", act: "goto:map" }] }; } },
      { id: "language", re: /translat|language|speak|turkish|arabic|spanish|french/i,
        respond: function () { return { text: "Your phrase book works offline. I can show phrases in Turkish, Arabic, Spanish, or French and read them aloud.", actions: [{ label: "Open phrase book", act: "goto:language", primary: true }] }; } },
      { id: "human", re: /human|person|agent|someone|staff|representative|talk to/i,
        respond: function () { return { text: "Of course. Tell me what it's about and I'll send you to the right desk, already prepared. AI handles information; people handle judgment and care.", actions: [{ label: "Talk to a person", act: "goto:human", primary: true }] }; } },
      { id: "hello", re: /^(hi|hello|hey|salam|merhaba|good (morning|evening|afternoon))\b/i,
        respond: function (ctx) { return { text: "Hi! I'm following DA 762 to Dubai from Gate " + ctx.gate + ". Ask me about your gate, food, time, or anything that goes wrong." }; } },
      { id: "thanks", re: /thank|thanks|shukran|teşekkür/i, respond: function () { return { text: "You're welcome. I'm here the whole way to Dubai." }; } }
    ];

    function detourReply(kind, ctx) {
      var r = evalDetour(kind, ctx);
      var acts = r.verdict === "no" ? [{ label: "Keep current route", act: "keep", primary: true }] : [{ label: "Add stop", act: "detour:" + kind, primary: true }, { label: "Keep current route", act: "keep" }];
      return { text: r.text, actions: acts, tone: r.verdict === "no" ? "caution" : "" };
    }

    function localReply(text) {
      var ctx = context();
      for (var i = 0; i < intents.length; i++) {
        if (intents[i].re.test(text)) { var r = intents[i].respond(ctx); r.ctx = ctxLine(context()); return r; }
      }
      return { text: "I'm a demo assistant, so I understand questions about this trip: your gate, time, food, restrooms, bags, accessibility, connectivity, or getting help. Try one of the suggestions below.", actions: [{ label: "Talk to a person", act: "goto:human" }], ctx: ctxLine(ctx) };
    }

    /* Public entry point. A production app would route to a secure backend. */
    function ask(text) {
      if (SKY_CONFIG.endpoint) {
        return fetch(SKY_CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, context: context() }) })
          .then(function (r) { return r.json(); })
          .catch(function () { return localReply(text); });
      }
      return new Promise(function (res) { setTimeout(function () { res(localReply(text)); }, reduceMotion ? 50 : 550 + Math.random() * 350); });
    }

    function addMsg(who, html, extra) {
      var m = document.createElement("div");
      m.className = "msg msg-" + who + (extra && extra.tone ? " " + extra.tone : "");
      m.innerHTML = html;
      if (extra && extra.ctx) m.innerHTML += '<span class="msg-ctx">' + esc(extra.ctx) + "</span>";
      if (extra && extra.actions && extra.actions.length) {
        var row = document.createElement("div");
        row.className = "msg-actions";
        extra.actions.forEach(function (a) {
          var b = document.createElement("button");
          b.type = "button"; b.textContent = a.label; b.setAttribute("data-act", a.act);
          if (a.primary) b.className = "primary";
          row.appendChild(b);
        });
        m.appendChild(row);
      }
      logEl.appendChild(m);
      logEl.scrollTop = logEl.scrollHeight;
      return m;
    }

    function send(text) {
      text = (text || "").trim();
      if (!text) return;
      addMsg("user", esc(text));
      var typing = document.createElement("div");
      typing.className = "msg msg-sky typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      logEl.appendChild(typing);
      logEl.scrollTop = logEl.scrollHeight;
      ask(text).then(function (r) {
        typing.remove();
        addMsg("sky", r.text, r);
      });
    }

    function greet() {
      if (greeted) return;
      greeted = true;
      var ctx = context();
      addMsg("sky", "Hi, I'm <b>Sky</b>. I'm following your trip: <b>DA 762 to Dubai</b>, Gate " + ctx.gate + ", boarding closes " + F2.boardingCloses + ". What do you need?", { ctx: ctxLine(ctx) });
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); send(input.value); input.value = ""; });
    $("#skySuggest").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) send(b.textContent); });
    logEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (b) { runAction(b.getAttribute("data-act")); b.parentNode.querySelectorAll("button").forEach(function (x) { x.disabled = true; }); }
    });

    // Context panel ("What Sky knows right now")
    var prev = {};
    onState(function (ctx) {
      var rows = [
        ["Time (IST)", ctx.nowLabel], ["Next flight", "DA 762 → DXB"], ["Gate", ctx.gate + (ctx.gateChanged ? " (changed)" : "")],
        ["Walk", ctx.walk + " min"], ["Boarding closes", F2.boardingCloses + " (" + Math.max(ctx.closesIn, 0) + " min)"],
        ["Mode", MODE_LABEL[ctx.mode]], ["Accessibility", ctx.accessible ? "Step-free route" : "None"],
        ["Meal preference", mealName(ctx.meal)], ["Traveling", ctx.group === "family" ? "Family group" : "Solo"],
        ["Connectivity", ctx.offline ? "Offline · airport pack" : "Online"]
      ];
      $("#ctxList").innerHTML = rows.map(function (r) {
        var changed = prev[r[0]] !== undefined && prev[r[0]] !== r[1];
        return '<li' + (changed ? ' class="flash"' : "") + '><span>' + r[0] + '</span><strong>' + esc(r[1]) + '</strong></li>';
      }).join("");
      rows.forEach(function (r) { prev[r[0]] = r[1]; });
    });

    return { greet: greet, send: send, evalDetour: evalDetour };
  })();

  /* Shared action dispatcher (used by Sky and other buttons) */
  function runAction(act) {
    var parts = act.split(":"), kind = parts[0], arg = parts[1];
    if (kind === "navigate") { scrollToId("navigate"); }
    else if (kind === "goto") { scrollToId(arg); }
    else if (kind === "detour") { Detours.apply(arg); }
    else if (kind === "keep") { toast("Keeping your current route to Gate " + state.gate + ".", "ok"); }
    else if (kind === "problem") { Help.open(arg); scrollToId("help"); }
    else if (kind === "med") { scrollToId("medical"); Medical.show(arg); }
    else if (kind === "human") { scrollToId("human"); Human.select(arg); }
    else if (kind === "access") { setAccessible(true); scrollToId("access"); }
  }

  /* =======================================================
     11. SMART DETOURS
     ======================================================= */
  var Detours = (function () {
    var ans = $("#detourAnswer"), svg = $("#detourMap"), current = null;
    var labels = { seafood: "I'm hungry. I want seafood.", restroom: "I need a restroom.", coffee: "Find coffee.", pharmacy: "I need a pharmacy.", charge: "Where can I charge my phone?", halal: "Find halal food.", vegetarian: "Find vegetarian food.", quiet: "Find a quiet area." };

    function ask(kind) {
      current = kind;
      $$("#detourChips button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-detour") === kind); });
      var ctx = context(), r = Sky.evalDetour(kind, ctx);
      ans.className = "detour-answer glass " + (r.verdict === "no" ? "caution" : "good");
      ans.innerHTML = '<p class="q">“' + labels[kind] + '”</p><p class="a">' + r.text + '</p>' +
        '<div class="facts"><span>' + ctx.nowLabel + '</span><span>' + MODE_LABEL[ctx.mode] + ' mode</span>' + r.facts.map(function (f) { return "<span>" + f + "</span>"; }).join("") + '</div>' +
        '<div class="btns">' + (r.verdict === "no" ? '<button class="btn btn-primary" type="button" data-keep>Keep Current Route</button>' : '<button class="btn btn-primary" type="button" data-add="' + kind + '">Add Stop</button><button class="btn btn-ghost" type="button" data-keep>Keep Current Route</button>') + '</div>';
      draw(kind, r.verdict !== "no");
    }

    function draw(preview, allowed) {
      var ctx = context(), p = preview ? place(D.detours[preview].place) : null;
      var active = routeFor(ctx.gate, ctx.accessible, ctx.detour);
      renderMap(svg, {
        route: active, draw: false,
        altRoute: p && allowed && preview !== ctx.detour ? routeFor(ctx.gate, ctx.accessible, preview) : null,
        highlightIds: p ? [p.id] : [], keep: [ctx.gate === "F7" ? "gateF7" : "gateB18"]
      });
      $("#detourGate").textContent = "Gate " + ctx.gate + (ctx.detour ? " via " + D.detours[ctx.detour].name : "");
      $("#detourEta").textContent = ctx.walk + " min";
    }

    function apply(kind) {
      var ctx = context(), r = Sky.evalDetour(kind, ctx);
      if (r.verdict === "no") { toast("Your connection is too tight for this stop. Continuing to Gate " + ctx.gate + ".", "warn"); return; }
      setState({ detour: kind === "restroom" || kind === "charge" ? state.detour : kind });
      toast("Stop added: <b>" + D.detours[kind].name + "</b>. New walk time " + context().walk + " min.", "ok");
      draw(null, false);
      AR.log("Stop added: <strong>" + D.detours[kind].name + "</strong>.", "ok");
    }

    $("#detourChips").addEventListener("click", function (e) { var b = e.target.closest("[data-detour]"); if (b) ask(b.getAttribute("data-detour")); });
    ans.addEventListener("click", function (e) {
      var add = e.target.closest("[data-add]");
      if (add) { apply(add.getAttribute("data-add")); ask(add.getAttribute("data-add")); return; }
      if (e.target.closest("[data-keep]")) { if (state.detour) setState({ detour: null }); toast("Keeping the direct route to Gate " + state.gate + ".", "ok"); draw(null, false); }
    });
    onState(function () { current ? ask(current) : draw(null, false); });
    return { apply: apply };
  })();

  /* =======================================================
     12. I HAVE A PROBLEM
     ======================================================= */
  var Help = (function () {
    var detail = $("#helpDetail"), svg = $("#helpMap"), currentId = null;
    var T = D.trip;
    var problems = {
      bag: { title: "My bag is missing", place: "baggage", min: 4,
        knows: [["Bag tag", T.baggage.tag], ["Flight", "DA 762 → DXB"], ["Status", "No arrival scan detected (demo)"]],
        steps: ["<b>Understood:</b> your checked bag didn't arrive on DA 762.", "<b>Where to go:</b> Baggage Services, Arrivals Hall. <b>4 minutes away.</b>", "<b>Location:</b> highlighted on the map.", "<b>Navigate:</b> tap Navigate There for a step-by-step route.", "<b>Have ready:</b> boarding pass, baggage tag, and identification.", "<b>Ask for:</b> a delayed baggage report and a file reference number."],
        say: "My checked bag did not arrive. Could you help me file a delayed baggage report?", phrase: "bag",
        note: "Demo scenario after landing at DXB; the map preview uses the IST demo layout." },
      missed: { title: "I missed my connection", place: "transfer", min: 2,
        knows: [["Missed flight", "DA 762 → DXB"], ["Booking", T.bookingRef], ["Bag", "Checked to DXB"]],
        steps: ["<b>Understood:</b> you can't board DA 762.", "<b>Where to go:</b> Demo Air Transfer Desk. <b>2 minutes away.</b>", "<b>Location:</b> highlighted on the map.", "<b>Navigate:</b> follow the route.", "<b>Have ready:</b> booking reference " + T.bookingRef + " and passport.", "<b>Ask for:</b> the next available flight, confirmation your bag follows you, and meal or hotel help if the wait is long."],
        say: "I missed my connecting flight to Dubai. Can you rebook me on the next available flight?", phrase: "missed" },
      airline: { title: "I need airline help", place: "transfer", min: 2,
        knows: [["Airline", "Demo Air"], ["Booking", T.bookingRef], ["Next flight", "DA 762 · Gate " + state.gate]],
        steps: ["<b>Understood:</b> you need the airline, not the airport.", "<b>Where to go:</b> Demo Air Transfer Desk. <b>2 minutes away.</b>", "<b>Location:</b> highlighted on the map.", "<b>Navigate:</b> follow the route.", "<b>Have ready:</b> booking reference and boarding pass.", "<b>Ask for:</b> what you need in one sentence; SkyCare can show your trip on screen."],
        say: "Hello, I'm connecting to Dubai on DA 762. Could you help me with my booking?", phrase: null },
      access: { title: "I need accessibility help", place: "assist", min: 1,
        knows: [["Need", "Wheelchair assistance"], ["Flight", "DA 762"], ["Route", "Step-free via Elevator E2"]],
        steps: ["<b>Understood:</b> you need mobility help.", "<b>Where to go:</b> Accessibility Assistance point. <b>1 minute away.</b>", "<b>Location:</b> highlighted on the map.", "<b>Navigate:</b> the step-free route turns on automatically.", "<b>Have ready:</b> flight number and the type of help you need.", "<b>Ask for:</b> an escort to Gate " + state.gate + ". Your request is already shared with each stage."],
        say: "I need wheelchair assistance to my connecting gate.", phrase: "wheelchair", onOpen: function () { setAccessible(true, true); } },
      unwell: { title: "I don't feel well", place: "medical", min: 5, urgent: true,
        knows: [["Nearest medical", "Medical Center · 5 min"], ["Nearest AED", "1 min"], ["Emergency number", "112 (Türkiye)"]],
        steps: ["<b>If this is an emergency, tell the nearest airport or airline staff member now</b> or call 112.", "<b>Where to go:</b> Medical Center. <b>5 minutes away.</b>", "<b>Location:</b> highlighted on the map.", "<b>Request help:</b> use Medical Assistance to ask staff to come to you (simulated here).", "<b>Have ready:</b> symptoms, medications, allergies.", "<b>Say:</b> the phrase below; SkyCare can show it in Turkish."],
        say: "I need medical assistance.", phrase: "medical", navLabel: "Open Medical Assistance" },
      lostitem: { title: "I lost something", place: "lostfound", min: 6,
        knows: [["Last flight", "DA 1784 · Seat 23C"], ["Lost & Found", "Arrivals Hall"], ["Airline", "Demo Air"]],
        steps: ["<b>Understood:</b> you lost an item.", "<b>If left on the aircraft:</b> tell Demo Air first; the crew may still be on board.", "<b>Otherwise:</b> Lost & Found, Arrivals Hall. <b>6 minutes away.</b>", "<b>Navigate:</b> follow the route.", "<b>Have ready:</b> a description, where you last had it, and your seat number (23C).", "<b>Ask for:</b> a report number so you can follow up from Dubai."],
        say: "I lost an item. Can I file a lost property report?", phrase: null },
      lost: { title: "I'm lost", place: "infoC", min: 5,
        knows: [["You are here", "Arrival Gate A4, Pier A"], ["Your gate", state.gate], ["Nearest help", "Information Desk C"]],
        steps: ["<b>Don't worry.</b> SkyCare knows where you're going.", "<b>Fastest fix:</b> follow the green line to your gate.", "<b>Prefer a person?</b> Information Desk C is 5 minutes away, on your route.", "<b>Location:</b> highlighted on the map.", "<b>Have ready:</b> your boarding pass.", "<b>Ask for:</b> directions to your gate."],
        say: "Where is Gate F7?", phrase: "gate" },
      family: { title: "My family member is missing", place: "security", min: 2, urgent: true,
        knows: [["First action", "Tell airport staff now"], ["Security Office", "2 min"], ["Travel Group", "Opt-in sharing"]],
        steps: ["<b>Tell the nearest airport staff member or security officer immediately.</b> They can act faster than any app.", "<b>Where to go:</b> Airport Security Office. <b>2 minutes away.</b>", "<b>Location:</b> highlighted on the map.", "<b>If your Travel Group was sharing:</b> SkyCare shows where each member last chose to share from.", "<b>Have ready:</b> name, age, clothing, a recent photo, and where you last saw them.", "<b>Ask for:</b> an airport-wide alert and a meeting point."],
        say: "My family member is missing. Please help me find them.", phrase: null, navLabel: "Navigate There" }
    };

    function sayLang() { var s = $("#langTo"); return s && s.value !== "en" ? s.value : "tr"; }

    function open(id) {
      var p = problems[id];
      if (!p) return;
      currentId = id;
      if (id === "airline") p.knows[2][1] = "DA 762 · Gate " + state.gate;
      if (id === "lost") p.knows[1][1] = state.gate;
      $$("#helpGrid button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-problem") === id); });
      detail.hidden = false;
      $("#hdTitle").textContent = p.title;
      $("#hdKnows").innerHTML = p.knows.map(function (k) { return "<div><span>" + k[0] + "</span><strong>" + esc(k[1]) + "</strong></div>"; }).join("");
      $("#hdSteps").innerHTML = p.steps.map(function (s, i) { return '<li style="animation-delay:' + i * 70 + 'ms"><span>' + s + "</span></li>"; }).join("");
      $("#hdNavigate").innerHTML = icon("nav") + (p.navLabel || "Navigate There");
      $("#hdSayBox").hidden = true;
      var pl = place(p.place);
      $("#hdWhere").textContent = pl.label + " · " + p.min + " min away" + (p.note ? " · " + p.note : "");
      renderMap(svg, { highlightIds: [p.place], title: false });
      if (p.onOpen) p.onOpen();
    }

    $("#helpGrid").addEventListener("click", function (e) { var b = e.target.closest("[data-problem]"); if (b) open(b.getAttribute("data-problem")); });
    $("#hdNavigate").addEventListener("click", function () {
      var p = problems[currentId];
      if (currentId === "unwell") { scrollToId("medical"); Medical.show("urgent-offer"); return; }
      var pl = place(p.place);
      renderMap(svg, { highlightIds: [p.place], route: pathTo(D.map.you, pl), draw: true, title: false });
      toast("Route started: <b>" + pl.label + "</b> · " + p.min + " min. (Simulated navigation)", "ok");
    });
    $("#hdSay").addEventListener("click", function () {
      var p = problems[currentId], box = $("#hdSayBox"), lang = sayLang(), L = D.languages[lang];
      var ph = p.phrase ? D.phrases.filter(function (x) { return x.id === p.phrase; })[0] : null;
      box.innerHTML = '<p class="kicker">Suggested phrase</p><p class="say-en">“' + esc(p.say) + '”</p>' +
        (ph ? '<p class="say-tr" dir="' + L.dir + '" lang="' + lang + '">' + L.name + ": " + esc(ph[lang]) + "</p>" : '<p class="say-tr">Tip: open Language Assistance to show a phrase in another language.</p>');
      box.hidden = false;
    });
    return { open: open };
  })();

  /* =======================================================
     13. MEDICAL ASSISTANCE (SIMULATION ONLY)
     ======================================================= */
  var Medical = (function () {
    var content = $("#medContent"), running = false;
    function mark(which) { $$(".med-btn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-med") === which || (which === "urgent" && b.id === "medUrgentBtn")); }); }

    function show(which) {
      if (which === "urgent-offer") which = "urgent";
      mark(which);
      if (which === "urgent") return urgent();
      if (which === "emergency") {
        content.innerHTML = '<div class="med-info"><h4>Emergency numbers (stored offline)</h4><div class="med-numbers"><div><span>Türkiye · all emergencies</span><strong>112</strong></div><div><span>UAE · ambulance</span><strong>998</strong></div><div><span>UAE · police</span><strong>999</strong></div></div><ul><li>Fastest help inside an airport: any airport or airline employee.</li><li>SkyCare shows these numbers; it does not place calls in this prototype.</li></ul></div>';
        return;
      }
      var id = which === "aed" ? "aed1" : "medical";
      content.innerHTML = '<div class="med-info"><h4>' + (which === "aed" ? "Nearest AED · 1 min" : "Medical Center · 5 min") + '</h4><svg class="terminal-map" viewBox="0 0 1000 560" id="medMap" role="img" aria-label="Route to ' + (which === "aed" ? "AED" : "medical center") + '"></svg><ul><li>' + (which === "aed" ? "Automated external defibrillator on the main concourse, next to Pier A." : "Staffed medical center in the Transfer Plaza.") + '</li></ul></div>';
      renderMap($("#medMap"), { highlightIds: [id], route: pathTo(D.map.you, place(id)), draw: true, title: false });
    }

    function urgent() {
      if (running) return;
      running = true;
      setState({ medical: true });
      var steps = ["Sharing your current airport location with authorized airport assistance…", "Sending flight details and the notes you chose to share…", "Waiting for confirmation…"];
      content.innerHTML = '<ul class="med-progress">' + steps.map(function (s) { return '<li><span class="mark"></span>' + s + "</li>"; }).join("") + "</ul>";
      var lis = $$(".med-progress li", content), i = 0;
      (function next() {
        if (i > 0) { lis[i - 1].className = "done"; lis[i - 1].querySelector(".mark").textContent = "✓"; }
        if (i < lis.length) { lis[i].className = "run"; i++; setTimeout(next, reduceMotion ? 50 : 1100); return; }
        var box = document.createElement("div");
        box.className = "med-received";
        box.innerHTML = "<strong>Assistance request received.</strong><p class=\"muted\">Prototype simulation: no one was contacted. Stay where you are and tell any airport employee you need medical help. In production, the airport's medical team would confirm here.</p>";
        content.appendChild(box);
        running = false;
      })();
    }

    $("#medUrgentBtn").addEventListener("click", function () { show("urgent"); });
    $$(".med-btn[data-med]").forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-med")); }); });
    return { show: show };
  })();

  /* =======================================================
     14. ACCESSIBILITY
     ======================================================= */
  function setAccessible(on, silent) {
    setState({ accessible: on, assistance: on, detour: on ? null : state.detour });
    if (!silent) toast(on ? "<b>Accessible route on.</b> Stairs avoided; elevators, accessible restrooms, and assistance points prioritized. Request shared with every stage." : "Accessible route off.", on ? "ok" : "");
  }
  (function () {
    var btn = $("#accessBtn");
    btn.addEventListener("click", function () { setAccessible(!state.accessible); });
    onState(function (ctx) {
      btn.setAttribute("aria-pressed", String(ctx.accessible));
      $("span", btn).textContent = ctx.accessible ? "Accessible Route On" : "Turn On Accessible Route";
      $("#accTimeline").setAttribute("data-on", String(ctx.accessible));
      $(".tl-off").textContent = ctx.accessible ? "Wheelchair assistance shared once. Departure, check-in, and gate already confirmed (demo)." : "Turn on Accessible Route to share the need with every stage.";
      $("#accStd").textContent = baseWalk(ctx.gate, false) + " min";
      $("#accAcc").textContent = baseWalk(ctx.gate, true) + " min";
      var gateId = ctx.gate === "F7" ? "gateF7" : "gateB18";
      renderMap($("#accessMap"), {
        route: ctx.accessible ? routeFor(ctx.gate, true) : routeFor(ctx.gate, false),
        altRoute: ctx.accessible ? routeFor(ctx.gate, false) : null,
        highlight: ctx.accessible ? "access" : null, keep: [gateId], title: false
      });
    });
  })();

  /* =======================================================
     15. FAMILY GUARDIAN
     ======================================================= */
  (function () {
    var map = $("#seatmap"), alertBox = $("#fgAlert");
    var fam = { adult: "14A", kids: ["22F", "31B"] }, fixed = ["14B", "14C"];
    var taken = ["13C", "14D", "15A", "16E", "18B", "19F", "20A", "21D", "22C", "23A", "24E", "25B", "26F", "27C", "28A", "29D", "30E", "31A", "31C", "32F", "17C", "15F"];
    function build(resolved) {
      var html = '<div class="sm-head"><strong>DA 762 · Demo seat map</strong><span>Rows 13–32</span></div><div class="sm-grid">';
      for (var r = 13; r <= 32; r++) {
        html += '<div class="sm-row"><span class="rn">' + r + "</span>";
        "ABC_DEF".split("").forEach(function (c) {
          if (c === "_") { html += "<span></span>"; return; }
          var id = r + c, cls = "seat";
          if (id === fam.adult) cls += " adult";
          else if (!resolved && fam.kids.indexOf(id) > -1) cls += " child";
          else if (resolved && fixed.indexOf(id) > -1) cls += " child ok";
          else if (taken.indexOf(id) > -1) cls += " taken";
          html += '<span class="' + cls + '" title="' + id + '">' + (cls.indexOf("adult") > -1 || cls.indexOf("child") > -1 ? id : "") + "</span>";
        });
        html += "</div>";
      }
      html += '</div><div class="sm-legend"><span><i style="background:var(--cyan)"></i>Adult</span><span><i style="background:' + (resolved ? "var(--green)" : "var(--amber)") + '"></i>Child</span><span><i style="background:rgba(148,197,255,.14)"></i>Taken</span></div>';
      map.innerHTML = html;
    }
    build(false);
    $("#fgReview").addEventListener("click", function () {
      map.animate && map.animate([{ boxShadow: "0 0 0 0 rgba(245,181,68,.7)" }, { boxShadow: "0 0 0 14px rgba(245,181,68,0)" }], { duration: 900 });
      toast("Adult in <b>14A</b>. Children in <b>22F</b> and <b>31B</b>, eight and seventeen rows away.", "warn");
    });
    $("#fgResolve").addEventListener("click", function () {
      var ok = alertBox.getAttribute("data-state") !== "ok";
      alertBox.setAttribute("data-state", ok ? "ok" : "issue");
      build(ok);
      this.textContent = ok ? "Reset Demo" : "Demo: Airline Resolves";
      if (ok) toast("<b>Family seating resolved.</b> 14A · 14B · 14C (airline action, demo).", "ok");
    });
  })();

  /* =======================================================
     16. TRAVEL GROUP + MEET ME
     ======================================================= */
  (function () {
    var members = [
      { name: "Jamal", init: "J", at: "Gate F7", place: "gateF7", share: true },
      { name: "Parent 1", init: "P1", at: "Restroom", place: "wc3", share: true },
      { name: "Parent 2", init: "P2", at: "Not sharing", place: null, share: false },
      { name: "Sibling", init: "S", at: "Food Court", place: "halal", share: true }
    ];
    var list = $("#members"), svg = $("#groupMap"), result = $("#groupResult"), found = false;
    function renderList() {
      list.innerHTML = members.map(function (m, i) {
        return '<li><span class="m-av">' + m.init + '</span><div><strong>' + m.name + '</strong><span class="m-loc' + (m.share ? " on" : "") + '">' + (m.share ? "Sharing · " + (m.place ? m.at : "location") : "Not sharing location") + '</span></div>' +
          '<label class="switch"><input type="checkbox" data-m="' + i + '"' + (m.share ? " checked" : "") + (m.place ? "" : " disabled") + '><span></span><span class="visually-hidden">Share ' + m.name + '</span></label></li>';
      }).join("");
    }
    function renderGroupMap() {
      var meet = place("infoC");
      var people = members.filter(function (m) { return m.share && m.place; }).map(function (m) {
        var p = place(m.place);
        return { x: p.x, y: p.y, label: m.name, path: found ? pathTo(p, meet) : null };
      });
      renderMap(svg, { people: people, target: found ? { x: meet.x, y: meet.y, label: "Meet: Info Desk C" } : null, you: false, title: false });
    }
    list.addEventListener("change", function (e) {
      var i = e.target.getAttribute("data-m");
      if (i === null) return;
      members[i].share = e.target.checked;
      renderList(); renderGroupMap();
    });
    $("#findGroupBtn").addEventListener("click", function () {
      var sharing = members.filter(function (m) { return m.share && m.place; });
      if (!sharing.length) { result.innerHTML = "No one is sharing location right now. Ask your group to opt in, or meet at a desk you agree on."; found = false; renderGroupMap(); return; }
      found = true;
      result.innerHTML = sharing.map(function (m) { return m.name + " → " + m.at; }).join(" · ") + '<br>Recommended meeting point: <b>INFORMATION DESK C</b> · reachable by everyone in the airside transfer area.';
      renderGroupMap();
      toast("Meeting point: <b>Information Desk C</b>. Each member gets their own route.", "ok");
    });
    $("#endGroupBtn").addEventListener("click", function () {
      members.forEach(function (m) { m.share = false; });
      found = false; renderList(); renderGroupMap();
      result.innerHTML = "Location sharing ended for everyone. Shared locations for this trip are deleted (demo).";
    });
    renderList(); renderGroupMap();

    // Meet Me
    var meetSvg = $("#meetMap"), meetRes = $("#meetResult");
    var friend = { x: 300, y: 150 }, meetPt = place("meetC");
    function renderMeet(active) {
      renderMap(meetSvg, {
        people: active ? [{ x: friend.x, y: friend.y, label: "Friend (from LHR)", path: pathTo(friend, meetPt) }] : [],
        route: active ? pathTo(D.map.you, meetPt) : null,
        target: active ? { x: meetPt.x, y: meetPt.y, label: "Meeting Point C" } : null, title: false
      });
    }
    $("#meetForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var code = $("#meetCode").value.trim().toUpperCase();
      if (!/^SK-\d{4}$/.test(code)) { toast("Meet codes look like <b>SK-4821</b>.", "warn"); return; }
      meetRes.hidden = false;
      renderMeet(true);
      toast("Connected with code <b>" + code + "</b>. Both travelers opted in; sharing is temporary.", "ok");
    });
    $("#meetNav").addEventListener("click", function () { toast("Route to <b>Meeting Point C</b> started · 4 min. (Simulated)", "ok"); });
    $("#meetEnd").addEventListener("click", function () { meetRes.hidden = true; renderMeet(false); toast("Location sharing ended. The meet code is no longer valid.", "ok"); });
    renderMeet(false);
  })();

  /* =======================================================
     17. LANGUAGE ASSISTANCE
     ======================================================= */
  (function () {
    var from = $("#langFrom"), to = $("#langTo"), list = $("#phraseList"), current = D.phrases[0].id;
    var opts = Object.keys(D.languages).map(function (k) { return '<option value="' + k + '">' + D.languages[k].name + "</option>"; }).join("");
    from.innerHTML = opts; to.innerHTML = opts;
    from.value = "en"; to.value = "tr";
    function renderList() {
      var L = D.languages[from.value];
      list.innerHTML = D.phrases.map(function (p) { return '<button type="button" data-phrase="' + p.id + '" dir="' + L.dir + '" class="' + (p.id === current ? "active" : "") + '">' + esc(p[from.value]) + "</button>"; }).join("");
    }
    function renderCard() {
      var p = D.phrases.filter(function (x) { return x.id === current; })[0], L = D.languages[to.value], S = D.languages[from.value];
      var src = $("#phraseSrc"), out = $("#phraseOut");
      src.textContent = p[from.value]; src.setAttribute("dir", S.dir);
      out.textContent = p[to.value]; out.setAttribute("dir", L.dir); out.setAttribute("lang", to.value);
      $("#speakNote").textContent = "";
    }
    from.addEventListener("change", function () { renderList(); renderCard(); });
    to.addEventListener("change", renderCard);
    list.addEventListener("click", function (e) { var b = e.target.closest("[data-phrase]"); if (!b) return; current = b.getAttribute("data-phrase"); renderList(); renderCard(); });
    $("#speakBtn").addEventListener("click", function () {
      var note = $("#speakNote");
      if (!("speechSynthesis" in window)) { note.textContent = "Speech isn't supported in this browser. Show the text instead."; return; }
      var L = D.languages[to.value], text = $("#phraseOut").textContent;
      var u = new SpeechSynthesisUtterance(text);
      u.lang = L.speech; u.rate = 0.9;
      var voices = speechSynthesis.getVoices(), base = L.speech.split("-")[0];
      var v = voices.filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(base) === 0; })[0];
      if (v) u.voice = v;
      else if (voices.length) note.textContent = "No " + L.name.split(" ")[0] + " voice on this device; the browser will try its default.";
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    });
    renderList(); renderCard();
  })();

  /* =======================================================
     18. OFFLINE PACKS + SERVICE WORKER
     ======================================================= */
  (function () {
    var packsEl = $("#packs"), ready = {};
    packsEl.innerHTML = D.packs.map(function (p) {
      return '<div class="pack glass" data-pack="' + p.code + '"><div class="pack-code">' + p.code + '</div><small>' + p.name + ' · ' + p.size + ' (demo)</small><small>Phrases: ' + p.lang + '</small>' +
        '<div class="pack-bar"><span></span></div><span class="pack-state">Not downloaded</span><button class="btn btn-ghost" type="button">' + icon("download") + 'Download pack</button></div>';
    }).join("");
    $("#packContents").innerHTML = D.packContents.map(function (c) { return "<span>" + c + "</span>"; }).join("");

    function download(card, instant) {
      var code = card.getAttribute("data-pack"), bar = $(".pack-bar span", card), st = $(".pack-state", card), btn = $("button", card);
      if (ready[code]) return;
      btn.disabled = true;
      var pct = instant ? 100 : 0;
      (function step() {
        pct = Math.min(100, pct + 9 + Math.random() * 14);
        bar.style.width = pct + "%";
        st.textContent = pct < 100 ? "Downloading… " + Math.round(pct) + "%" : "Ready offline";
        if (pct < 100) { setTimeout(step, 120); return; }
        ready[code] = true;
        card.classList.add("ready");
        btn.innerHTML = icon("check") + "Downloaded";
        cacheSite();
      })();
    }
    packsEl.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) download(b.closest(".pack")); });

    function cacheSite() {
      // Ask the service worker (live site only) to refresh its offline copy.
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: "CACHE_PACKS" });
    }

    function renderStatus(ctx) {
      var offline = ctx.offline;
      document.documentElement.classList.toggle("is-offline", offline);
      $("#netText").innerHTML = offline ? "OFFLINE<span class=\"net-sub\"> · PACKS ACTIVE</span>" : (state.swReady ? "ONLINE<span class=\"net-sub\"> · OFFLINE READY</span>" : "ONLINE");
      $("#osText").textContent = offline ? (state.simOffline && state.realOnline ? "OFFLINE (SIMULATED)" : "OFFLINE") : (state.swReady ? "ONLINE · OFFLINE READY" : "ONLINE");
      var swLine = state.swReady ? "Website saved on this device for offline use" : (location.protocol === "file:" ? "Offline caching turns on at the live GitHub Pages site (not from a folder)" : "Preparing offline copy of this website…");
      var items = [
        [!offline, offline ? "Live gate and boarding updates paused · resume when connected" : "Live gate and boarding updates on"],
        [true, "Demo itinerary saved (FLL → IST → DXB)"],
        [true, "IST terminal map, services, and routes saved"],
        [true, "Essential phrases in 5 languages saved"],
        [state.swReady, swLine]
      ];
      $("#osList").innerHTML = items.map(function (it) { return '<li class="' + (it[0] ? "" : "off") + '">' + icon(it[0] ? "check" : "cloud-off") + it[1] + "</li>"; }).join("");
      $("#simOffline").checked = state.simOffline;
    }
    onState(renderStatus);
    $("#simOffline").addEventListener("change", function () {
      setState({ simOffline: this.checked });
      toast(this.checked ? "Offline (simulated). SkyCare now uses the downloaded airport packs. Live gate changes are paused." : "Back online. Live updates resumed.", this.checked ? "warn" : "ok");
    });
    window.addEventListener("online", function () { setState({ realOnline: true }); });
    window.addEventListener("offline", function () { setState({ realOnline: false }); });

    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register("./service-worker.js").then(function () {
        return navigator.serviceWorker.ready;
      }).then(function () {
        setState({ swReady: true });
        D.packs.forEach(function (p) { if (localStorageGet("skycare-pack-" + p.code)) download($('[data-pack="' + p.code + '"]'), true); });
      }).catch(function (err) { console.warn("SkyCare: service worker not registered.", err); });
    }
    // Remember downloaded packs for this visitor (optional convenience)
    packsEl.addEventListener("click", function (e) { var c = e.target.closest(".pack"); if (c) localStorageSet("skycare-pack-" + c.getAttribute("data-pack"), "1"); });
  })();
  function localStorageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function localStorageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }

  /* =======================================================
     19. CONNECTIVITY + MEALS
     ======================================================= */
  (function () {
    var grid = $("#connGrid"), icons = { "Roaming": "globe", "Local SIM": "sim", "eSIM": "sim", "Airport Wi-Fi": "wifi", "Emergency calling": "alert" };
    function show(filter) {
      var items = D.connectivity.options.filter(function (o) { return filter === "all" || o.title === filter; });
      grid.className = "conn-grid" + (items.length === 1 ? " single" : "");
      grid.innerHTML = items.map(function (o, i) { return '<article class="conn-card glass" style="animation-delay:' + i * 60 + 'ms"><h3>' + icon(icons[o.title] || "info") + o.title + "</h3><p>" + o.body + "</p></article>"; }).join("");
    }
    $$(".conn-buttons [data-conn]").forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-conn")); }); });
    show("all");

    var M = D.meals, optsEl = $("#mealOptions"), chosen = "halal";
    $("#mealCutoff").textContent = M.cutoff;
    function renderMeals() {
      optsEl.innerHTML = M.options.map(function (o) { return '<button type="button" class="meal-opt" role="radio" aria-checked="' + (o.id === chosen) + '" data-meal="' + o.id + '"><strong>' + o.name + '</strong><small>' + o.note + "</small></button>"; }).join("");
    }
    optsEl.addEventListener("click", function (e) { var b = e.target.closest("[data-meal]"); if (b) { chosen = b.getAttribute("data-meal"); renderMeals(); $("#mealMsg").textContent = ""; } });
    $("#mealSupported").addEventListener("change", function () {
      $("#mealBtn").textContent = this.checked ? "Preorder Meal" : "Save Preference";
      $("#mealMsg").textContent = this.checked ? "" : "This airline does not currently support meal preorder through SkyCare. You can still see the expected meal service and dietary options.";
      $("#mealMsg").className = "meal-msg" + (this.checked ? "" : " warn");
    });
    $("#mealBtn").addEventListener("click", function () {
      var o = M.options.filter(function (x) { return x.id === chosen; })[0], msg = $("#mealMsg");
      if ($("#mealSupported").checked) { msg.textContent = "✓ " + o.name + " meal preorder sent to Demo Air (simulated). The airline confirms availability."; msg.className = "meal-msg ok"; }
      else { msg.textContent = "Preference saved in SkyCare. This airline does not currently support meal preorder through SkyCare, so request it with the airline directly."; msg.className = "meal-msg warn"; }
    });
    $("#menuBtn").addEventListener("click", function () { toast("Onboard menu (demo): " + M.options.slice(0, 4).map(function (o) { return o.name; }).join(" · ") + ". Special requests by arrangement.", ""); });
    onState(function (ctx) { if (ctx.meal !== "none" && chosen !== ctx.meal && (ctx.meal === "halal" || ctx.meal === "vegetarian")) { chosen = ctx.meal; renderMeals(); } });
    renderMeals();
  })();

  /* =======================================================
     20. HUMAN ASSISTANCE
     ======================================================= */
  var Human = (function () {
    var grid = $("#humanGrid"), res = $("#humanResult"), icons = { airline: "headset", info: "info", baggage: "bag", access: "wheel", medical: "heart", skycare: "sparkle" };
    grid.innerHTML = D.humans.map(function (h) {
      return '<button type="button" class="human-card' + (h.id === "medical" ? " hc-med" : "") + '" data-human-card="' + h.id + '">' + icon(icons[h.id]) + "<strong>" + h.name + "</strong><span>" + h.helps + "</span></button>";
    }).join("");
    function select(id) {
      var h = D.humans.filter(function (x) { return x.id === id; })[0];
      if (!h) return;
      $$(".human-card", grid).forEach(function (c) { c.classList.toggle("active", c.getAttribute("data-human-card") === id); });
      var p = place(h.place);
      res.hidden = false;
      res.innerHTML = '<div><p class="kicker">SkyCare routes you to</p><h3>' + h.name + '</h3><p class="muted">' + p.label + '</p><ul><li><b>Helps with:</b> ' + h.helps + '</li><li><b>Have ready:</b> ' + h.ready + '</li><li><b>SkyCare shares:</b> your trip details, so you don\'t repeat your story</li></ul>' +
        '<button class="btn btn-primary" type="button" id="humanNav">' + icon("nav") + 'Navigate There</button></div><svg class="terminal-map" id="humanMap" viewBox="0 0 1000 560" role="img" aria-label="Route to ' + esc(h.name) + '"></svg>';
      renderMap($("#humanMap"), { highlightIds: [h.place], route: pathTo(D.map.you, p), draw: true, title: false });
      $("#humanNav").addEventListener("click", function () { toast("Route started: <b>" + p.label + "</b>. (Simulated navigation)", "ok"); });
    }
    grid.addEventListener("click", function (e) { var b = e.target.closest("[data-human-card]"); if (b) select(b.getAttribute("data-human-card")); });
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-human]");
      if (!a) return;
      e.preventDefault();
      scrollToId("human");
      select(a.getAttribute("data-human"));
    });
    return { select: select };
  })();

  /* =======================================================
     21. MAIN MAP FILTERS
     ======================================================= */
  (function () {
    var svg = $("#mainMap"), cat = "gate";
    function draw() {
      var ctx = context(), o = { highlight: cat === "all" ? "all" : cat, labels: cat === "all" ? "all" : null };
      if (cat === "gate") { o.highlight = null; o.highlightIds = [ctx.gate === "F7" ? "gateF7" : "gateB18"]; o.route = routeFor(ctx.gate, ctx.accessible, ctx.detour); o.keep = ["gateA4", "gateB18", "gateF7"]; }
      if (cat === "access") { o.route = routeFor(ctx.gate, true); }
      if (cat === "meet") { o.route = pathTo(D.map.you, place("meetC")); }
      renderMap(svg, o);
    }
    $("#mapFilters").addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]");
      if (!b) return;
      cat = b.getAttribute("data-cat");
      $$("#mapFilters button").forEach(function (x) { x.classList.toggle("active", x === b); });
      draw();
    });
    onState(draw);
  })();

  /* =======================================================
     22. PRESENTATION MODE
     12 scenes. Some scenes have 2–3 steps (sub-sections).
     → / PageDown = next · ← / PageUp = previous
     F = full screen · Esc = exit · P = toggle
     Tip: open index.html?present to start in this mode.
     ======================================================= */
  var Present = (function () {
    var scenes = [
      { title: "The Problem", ids: ["problem"] },
      { title: "Meet SkyCare Navigator", ids: ["home"] },
      { title: "Load the Journey", ids: ["trip", "dashboard"] },
      { title: "AR Navigation", ids: ["navigate"] },
      { title: "Connection Rush Mode", ids: ["rush"] },
      { title: "Ask Sky", ids: ["ask", "detours"] },
      { title: "I Have a Problem", ids: ["help", "medical"] },
      { title: "Family + Accessibility", ids: ["family", "access", "group"] },
      { title: "Offline + Language", ids: ["offline", "language"] },
      { title: "Human + AI", ids: ["human"] },
      { title: "How It Could Work", ids: ["tech", "privacy"] },
      { title: "Why SkyCare", ids: ["why", "research", "closing"] }
    ];
    var steps = [];
    scenes.forEach(function (s, si) { s.ids.forEach(function (id, sub) { steps.push({ scene: si, sub: sub, id: id }); }); });
    var idx = 0, bar = $("#presentBar"), hint = $("#presentHint"), hintTimer;

    function active() { return document.body.classList.contains("present-mode"); }
    function show(i) {
      idx = Math.max(0, Math.min(steps.length - 1, i));
      var st = steps[idx], sc = scenes[st.scene];
      $$("main > section").forEach(function (s) { s.classList.toggle("present-active", s.id === st.id); });
      var sec = document.getElementById(st.id);
      sec.scrollTop = 0;
      window.scrollTo(0, 0);
      $$(".reveal", sec).forEach(function (el) { el.classList.add("in"); });
      $("#pbCount").textContent = (st.scene + 1) + " / " + scenes.length;
      $("#pbTitle").textContent = sc.title;
      $("#pbSubs").innerHTML = sc.ids.length > 1 ? sc.ids.map(function (_, j) { return '<i class="' + (j === st.sub ? "on" : "") + '"></i>'; }).join("") : "";
      if (st.id === "ask") Sky.greet();
      if (st.id === "research") $("#research .refs").open = false;
      if (st.id === "problem") setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 30);
    }
    function enter(startId) {
      document.body.classList.add("present-mode");
      document.documentElement.classList.add("present-html");
      bar.hidden = false;
      var start = 0;
      if (startId) steps.forEach(function (s, i) { if (s.id === startId && !start) start = i; });
      show(start);
      hint.classList.add("show");
      clearTimeout(hintTimer);
      hintTimer = setTimeout(function () { hint.classList.remove("show"); }, 3500);
    }
    function exit() {
      var id = steps[idx].id;
      document.body.classList.remove("present-mode");
      document.documentElement.classList.remove("present-html");
      bar.hidden = true;
      $$("main > section").forEach(function (s) { s.classList.remove("present-active"); });
      if (isFull()) toggleFull();
      $("#research .refs").open = true;
      setTimeout(function () { document.getElementById(id).scrollIntoView({ block: "start" }); }, 30);
    }
    function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
    function toggleFull() {
      var el = document.documentElement;
      try {
        if (!isFull()) { (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
        else { (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
      } catch (e) { toast("Full screen isn't available here. Use your browser's full-screen key (F11).", "warn"); }
    }
    function goToSection(id) {
      for (var i = 0; i < steps.length; i++) if (steps[i].id === id) { show(i); return; }
      // Section not in the presentation sequence: exit and scroll there
      exit();
      setTimeout(function () { document.getElementById(id).scrollIntoView({ behavior: "smooth" }); }, 60);
    }

    $("#presentBtn").addEventListener("click", function () {
      var visibleId = null;
      $$("main > section").forEach(function (s) { var r = s.getBoundingClientRect(); if (!visibleId && r.bottom > innerHeight * 0.4) visibleId = s.id; });
      enter(visibleId && visibleId !== "home" && steps.some(function (s) { return s.id === visibleId; }) ? visibleId : null);
    });
    $("#pbNext").addEventListener("click", function () { show(idx + 1); });
    $("#pbPrev").addEventListener("click", function () { show(idx - 1); });
    $("#pbFull").addEventListener("click", toggleFull);
    $("#pbExit").addEventListener("click", exit);

    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if (active()) {
        if (k === "ArrowRight" || k === "PageDown") { e.preventDefault(); show(idx + 1); }
        else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); show(idx - 1); }
        else if (k === "Home") { e.preventDefault(); show(0); }
        else if (k === "End") { e.preventDefault(); show(steps.length - 1); }
        else if (k === "f" || k === "F") { toggleFull(); }
        else if (k === "Escape") { if (isFull()) toggleFull(); else exit(); }
        else if (k === "p" || k === "P") { exit(); }
      } else if (k === "p" || k === "P") { $("#presentBtn").click(); }
    });

    if (/[?&]present\b/.test(location.search)) setTimeout(function () { enter(); }, 50);
    return { goToSection: goToSection, active: active };
  })();

  /* =======================================================
     23. START-UP
     ======================================================= */
  setState({});
  if (location.hash === "#ask") Sky.greet();
})();

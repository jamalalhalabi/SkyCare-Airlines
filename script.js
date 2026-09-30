/* =========================================================
   SKYCARE AIRLINES SCRIPT
   Plain JavaScript, no libraries. Each feature is in its own
   clearly labeled block so it is easy to find and edit.
   ========================================================= */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scrollBehavior = reduceMotion ? "auto" : "smooth";

  /* -------------------------------------------------------
     1. SECTIONS LIST
     Every <section> inside <main> counts as one "slide".
     ------------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));
  var currentIndex = 0;
  var isNavigating = false; // true while we are smooth scrolling to a section
  var navTimer = null;

  /* -------------------------------------------------------
     2. MOBILE MENU
     ------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  navToggle.addEventListener("click", function () {
    var open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close the mobile menu after a link is chosen
  navMenu.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* -------------------------------------------------------
     3. SECTION DOTS (progress indicator on the right)
     ------------------------------------------------------- */
  var dotNav = document.getElementById("dotNav");
  sections.forEach(function (section) {
    var link = document.createElement("a");
    link.href = "#" + section.id;
    link.innerHTML = "<span>" + section.getAttribute("data-title") + "</span>";
    link.setAttribute("aria-label", "Go to " + section.getAttribute("data-title"));
    dotNav.appendChild(link);
  });
  var dots = Array.prototype.slice.call(dotNav.querySelectorAll("a"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));

  /* -------------------------------------------------------
     4. TRACK WHICH SECTION IS ON SCREEN
     ------------------------------------------------------- */
  var progressBar = document.getElementById("scrollProgress");
  var toTop = document.getElementById("toTop");

  function findCurrentSection() {
    var line = window.innerHeight * 0.4; // a line 40% down the screen
    var index = 0;
    sections.forEach(function (section, i) {
      if (section.getBoundingClientRect().top <= line) { index = i; }
    });
    // At the very bottom of the page, always pick the last section
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      index = sections.length - 1;
    }
    return index;
  }

  function setActive(index) {
    currentIndex = index;
    var id = sections[index].id;

    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
      if (i === index) { dot.setAttribute("aria-current", "true"); }
      else { dot.removeAttribute("aria-current"); }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });

    updateCounter();
  }

  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = percent + "%";

    toTop.classList.toggle("show", window.scrollY > window.innerHeight * 0.8);

    if (!isNavigating) { setActive(findCurrentSection()); }
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener("resize", onScroll);

  /* -------------------------------------------------------
     5. MOVE BETWEEN SECTIONS
     ------------------------------------------------------- */
  function goTo(index) {
    if (index < 0 || index >= sections.length) { return; }
    isNavigating = true;
    setActive(index);
    sections[index].scrollIntoView({ behavior: scrollBehavior, block: "start" });

    clearTimeout(navTimer);
    navTimer = setTimeout(function () { isNavigating = false; }, 900);
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  /* -------------------------------------------------------
     6. SCROLL REVEAL ANIMATIONS
     ------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* -------------------------------------------------------
     7. REUSABLE TABS (used by the journey and the scenarios)
     Arrow keys move between tabs. At the first or last tab,
     the arrow key moves to the previous or next section instead.
     ------------------------------------------------------- */
  function setupTabs(tablist, onSelect) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    function select(i, giveFocus) {
      tabs.forEach(function (tab, j) {
        var selected = i === j;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
      });
      if (giveFocus) { tabs[i].focus(); }
      onSelect(i, tabs[i]);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (e) {
        var target = null;
        if (e.key === "ArrowRight" && i < tabs.length - 1) { target = i + 1; }
        if (e.key === "ArrowLeft" && i > 0) { target = i - 1; }
        if (e.key === "Home") { target = 0; }
        if (e.key === "End") { target = tabs.length - 1; }
        if (target !== null) {
          e.preventDefault();
          e.stopPropagation(); // do not also change the slide
          select(target, true);
        }
      });
    });

    return select;
  }

  /* -------------------------------------------------------
     8. PASSENGER JOURNEY CONTENT
     Edit the text below to change what each stage shows.
     ------------------------------------------------------- */
  var journeyStages = [
    {
      title: "Book",
      intro: "Clear choices from the very first click.",
      items: ["Clear pricing", "No confusing charges", "Saved passenger preferences", "Accessibility requests", "Multilingual assistance", "Simple itinerary management"]
    },
    {
      title: "Check-In",
      intro: "Everything you need, right on your phone.",
      items: ["Mobile check-in", "Digital boarding pass", "Baggage status", "Seat changes", "Travel alerts", "Quick access to customer support"]
    },
    {
      title: "Airport",
      intro: "Self-service when it helps. People when you need them.",
      items: ["Self-service when convenient", "Real employee assistance when needed", "Real-time gate updates", "Connection monitoring", "Baggage tracking", "Accessible support"]
    },
    {
      title: "Board",
      intro: "An organized, calm start to every flight.",
      items: ["Clear boarding groups", "Gate notifications", "Family and accessibility assistance", "Proactive communication", "Less confusion at the gate"]
    },
    {
      title: "Fly",
      intro: "Professional service with a personal touch.",
      items: ["Professional cabin service", "Friendly communication", "Comfortable environment", "Connected inflight tools", "Special-needs support"]
    },
    {
      title: "Arrive",
      intro: "The trip is not over until the passenger is cared for.",
      items: ["Live baggage status", "Connection assistance", "Baggage problem reporting", "Post-flight feedback", "Service recovery if needed"]
    }
  ];

  var journeyPanel = document.getElementById("journeyPanel");
  var journeyFill = document.getElementById("journeyFill");
  var journeyStopButtons = Array.prototype.slice.call(document.querySelectorAll(".journey-stop"));

  function showStage(i, tab) {
    var stage = journeyStages[i];
    document.getElementById("journeyStep").textContent = "Stage " + (i + 1) + " of " + journeyStages.length;
    document.getElementById("journeyTitle").textContent = stage.title;
    document.getElementById("journeyIntro").textContent = stage.intro;
    document.getElementById("journeyList").innerHTML = stage.items.map(function (item) {
      return "<li>" + item + "</li>";
    }).join("");
    journeyPanel.setAttribute("aria-labelledby", tab.id);

    // Fill the line up to the chosen stage and mark earlier stages as done
    journeyFill.style.width = (i / (journeyStages.length - 1)) * 100 + "%";
    journeyStopButtons.forEach(function (btn, j) { btn.classList.toggle("done", j < i); });

    // Replay the fade animation
    journeyPanel.classList.remove("swap");
    void journeyPanel.offsetWidth;
    journeyPanel.classList.add("swap");
  }

  setupTabs(document.querySelector('[data-tabs="journey"]'), showStage);

  /* -------------------------------------------------------
     9. SERVICE RECOVERY SCENARIOS
     Edit the alert text or steps for each scenario here.
     ------------------------------------------------------- */
  var scenarios = {
    delay: {
      alert: "Your flight has been delayed by 3 hours.",
      steps: [
        ["Right away", "Delay notification sent immediately"],
        ["Same message", "Reason for the delay explained in plain language"],
        ["Automatic", "Connection risk automatically checked"],
        ["Within minutes", "Alternative flights identified"],
        ["In the app", "Rebooking options presented"],
        ["When applicable", "Meal assistance offered"],
        ["When applicable", "Hotel or overnight support explained"],
        ["Anytime", "Live customer service representative available"],
        ["After the trip", "Follow-up message sent"]
      ]
    },
    cancel: {
      alert: "Your flight has been canceled.",
      steps: [
        ["Right away", "Cancellation alert sent before you leave for the airport"],
        ["Same message", "Reason explained in plain language"],
        ["Automatic", "Seats on the next available flights held for you"],
        ["Your choice", "Rebook, change your date, or request a refund"],
        ["When applicable", "Hotel, meal, and transportation support explained"],
        ["Anytime", "Priority access to a live agent for complex trips"],
        ["After the trip", "Follow-up with your new itinerary and a personal apology"]
      ]
    },
    missed: {
      alert: "Your inbound flight landed late, and your connection has already departed.",
      steps: [
        ["In the air", "Connection risk flagged before you land"],
        ["Before landing", "New connecting flight booked automatically"],
        ["At the gate", "New gate and boarding time sent to your phone"],
        ["Automatic", "Checked bags rerouted to your new flight"],
        ["On arrival", "A SkyCare team member meets passengers who need help"],
        ["When applicable", "Meal or overnight support offered"],
        ["After the trip", "Follow-up once you reach your final destination"]
      ]
    },
    delayedBag: {
      alert: "Your checked bag did not arrive on your flight.",
      steps: [
        ["Before baggage claim", "Bag scan data shows the problem before you reach the carousel"],
        ["Right away", "Message explains where your bag is and when it will arrive"],
        ["In the app", "Report started with your trip details already filled in"],
        ["Same day", "Delivery to your home or hotel arranged"],
        ["When applicable", "Support for essential items explained"],
        ["Live", "Tracking continues until the bag is delivered"],
        ["After delivery", "Follow-up to confirm everything arrived"]
      ]
    },
    damagedBag: {
      alert: "Your bag arrived with a broken handle.",
      steps: [
        ["In the app", "Report the damage with a photo"],
        ["Automatic", "Claim opened with your trip details attached"],
        ["Quickly", "A trained agent reviews the claim and explains your options"],
        ["When applicable", "Repair, replacement, or compensation offered"],
        ["Throughout", "One case number and one point of contact"],
        ["At resolution", "Follow-up message when the claim is closed"]
      ]
    }
  };

  var currentScenario = "delay";
  var respondBtn = document.getElementById("respondBtn");
  var respondLabel = document.getElementById("respondLabel");
  var stepsList = document.getElementById("responseSteps");
  var scenarioText = document.getElementById("scenarioText");
  var stepTimers = [];

  function clearSteps() {
    stepTimers.forEach(clearTimeout);
    stepTimers = [];
    stepsList.innerHTML = "";
    respondLabel.textContent = "See How SkyCare Responds";
  }

  function playResponse() {
    clearSteps();
    var steps = scenarios[currentScenario].steps;

    steps.forEach(function (step, i) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="step-time">' + step[0] + "</span>" + step[1];
      if (i === steps.length - 1) { li.classList.add("step-final"); }
      stepsList.appendChild(li);

      var delay = reduceMotion ? 0 : 150 + i * 380;
      stepTimers.push(setTimeout(function () { li.classList.add("show"); }, delay));
    });

    respondLabel.textContent = "Replay Response";
  }

  respondBtn.addEventListener("click", playResponse);

  setupTabs(document.querySelector('[data-tabs="scenario"]'), function (i, tab) {
    currentScenario = tab.getAttribute("data-scenario");
    scenarioText.textContent = scenarios[currentScenario].alert;
    clearSteps();
  });

  /* -------------------------------------------------------
     10. PHONE MOCKUP BUTTONS
     ------------------------------------------------------- */
  var toast = document.getElementById("appToast");
  var toastTimer = null;
  document.querySelectorAll(".app-buttons button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast.textContent = btn.getAttribute("data-toast");
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2800);
    });
  });

  /* -------------------------------------------------------
     10b. DEPARTURE BOARD FLIP EFFECT
     When the "Why Fly SkyCare?" board scrolls into view, the
     SkyCare column flips letter by letter like an airport display.
     ------------------------------------------------------- */
  var flapCells = Array.prototype.slice.call(document.querySelectorAll(".flap"));
  var flapChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var boardRunning = false;

  function flipCell(cell, delay) {
    var finalText = cell.getAttribute("data-final") || cell.textContent;
    cell.setAttribute("data-final", finalText);
    setTimeout(function () {
      var frame = 0, frames = 14;
      var timer = setInterval(function () {
        frame++;
        var settled = Math.floor((frame / frames) * finalText.length);
        var out = "";
        for (var k = 0; k < finalText.length; k++) {
          var ch = finalText[k];
          out += (k < settled || ch === " ") ? ch : flapChars[Math.floor(Math.random() * flapChars.length)];
        }
        cell.textContent = out;
        if (frame >= frames) { clearInterval(timer); cell.textContent = finalText; }
      }, 45);
    }, delay);
  }

  function runBoard() {
    if (boardRunning || reduceMotion) { return; }
    boardRunning = true;
    flapCells.forEach(function (cell, i) { flipCell(cell, i * 140); });
    setTimeout(function () { boardRunning = false; }, flapCells.length * 140 + 900);
  }

  var board = document.getElementById("compareBoard");
  if (board && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runBoard(); }
    }, { threshold: 0.4 }).observe(board);
  }

  /* -------------------------------------------------------
     11. PRESENTATION MODE
     ------------------------------------------------------- */
  var presentBtn = document.getElementById("presentBtn");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var fullBtn = document.getElementById("fullBtn");
  var exitBtn = document.getElementById("exitBtn");
  var counter = document.getElementById("slideCounter");
  var slideTitle = document.getElementById("slideTitle");
  var hint = document.getElementById("presentHint");
  var hintTimer = null;

  function inPresentMode() { return document.body.classList.contains("present-mode"); }

  function updateCounter() {
    counter.textContent = (currentIndex + 1) + " / " + sections.length;
    slideTitle.textContent = sections[currentIndex].getAttribute("data-title");
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === sections.length - 1;
  }

  function enterPresentMode() {
    var start = findCurrentSection();
    document.body.classList.add("present-mode");
    document.documentElement.classList.add("present-html");
    navMenu.classList.remove("open");
    goTo(start);
    nextBtn.focus();

    hint.classList.add("show");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () { hint.classList.remove("show"); }, 4000);
  }

  function exitPresentMode() {
    document.body.classList.remove("present-mode");
    document.documentElement.classList.remove("present-html");
    hint.classList.remove("show");
    if (isFullscreen()) { exitFullscreen(); }
    goTo(currentIndex);
  }

  presentBtn.addEventListener("click", enterPresentMode);
  exitBtn.addEventListener("click", exitPresentMode);
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  /* Full screen (works in Chrome, Edge, Firefox, and Safari) */
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function exitFullscreen() {
    if (document.exitFullscreen) { document.exitFullscreen(); }
    else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
  }
  function toggleFullscreen() {
    var root = document.documentElement;
    if (isFullscreen()) { exitFullscreen(); return; }
    if (root.requestFullscreen) { root.requestFullscreen().catch(function () {}); }
    else if (root.webkitRequestFullscreen) { root.webkitRequestFullscreen(); }
  }
  fullBtn.addEventListener("click", toggleFullscreen);

  /* -------------------------------------------------------
     12. KEYBOARD SHORTCUTS
     Right / Left arrows: next / previous section (any mode)
     Page Down / Page Up: next / previous (Presentation Mode)
     P: toggle Presentation Mode, F: full screen, Esc: exit
     ------------------------------------------------------- */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) { return; }
    if (e.altKey || e.ctrlKey || e.metaKey) { return; }

    var key = e.key;
    var present = inPresentMode();

    if (key === "ArrowRight" || (present && key === "PageDown")) { e.preventDefault(); next(); }
    else if (key === "ArrowLeft" || (present && key === "PageUp")) { e.preventDefault(); prev(); }
    else if (key === "p" || key === "P") { present ? exitPresentMode() : enterPresentMode(); }
    else if ((key === "f" || key === "F") && present) { toggleFullscreen(); }
    else if (key === "Escape" && present && !isFullscreen()) { exitPresentMode(); }
  });

  /* -------------------------------------------------------
     13. START
     ------------------------------------------------------- */
  onScroll();
})();

// Theme toggle, mobile menu, scroll progress, reveal-on-scroll, active nav link, back-to-top.
(function () {
  "use strict";
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme: light, dark, or follow the system until the visitor chooses. */
  var themeBtn = $("theme"), KEY = "portfolio-theme";
  function systemDark() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function current() { return root.getAttribute("data-theme") || (systemDark() ? "dark" : "light"); }
  function paintTheme() { if (themeBtn) themeBtn.textContent = current() === "dark" ? "Light mode" : "Dark mode"; }
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) { /* storage blocked: follow the system setting */ }
  paintTheme();
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
    paintTheme();
  });

  /* Mobile menu. */
  var menuBtn = $("menu-btn"), nav = $("nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.textContent = open ? "Close" : "Menu";
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });

  /* Scroll progress bar and back-to-top button. */
  var bar = $("progress"), top = $("to-top"), ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.transform = "scaleX(" + p + ")";
    top.hidden = window.scrollY < 700;
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
  onScroll();

  /* Reveal sections as they scroll into view. Content is visible without JavaScript. */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { reveals.forEach(function (el) { el.classList.add("in"); }); }, 4000);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Highlight the nav link for the section on screen. */
  var links = {};
  Array.prototype.forEach.call(nav.querySelectorAll('a[href^="#"]'), function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !links[en.target.id]) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
        links[en.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(links).forEach(function (id) { var s = $(id); if (s) spy.observe(s); });
  }

  /* Download resume: opens the print dialog; the visitor picks "Save as PDF". */
  var pageTitle = document.title;
  Array.prototype.forEach.call(document.querySelectorAll("[data-download]"), function (b) {
    b.addEventListener("click", function () {
      setMenu(false);
      document.title = "Gulshan Kundnani - Resume";
      window.print();
    });
  });
  window.addEventListener("afterprint", function () { document.title = pageTitle; });

  var y = $("year");
  if (y) y.textContent = new Date().getFullYear();
})();

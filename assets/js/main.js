/* LEROVAM — minimal progressive-enhancement script.
   No libraries. Everything below is optional enhancement:
   the page works fully without JavaScript. */
(function () {
  "use strict";

  var doc = document;
  doc.documentElement.classList.add("js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header state ---------- */
  var header = doc.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = doc.querySelector(".menu-toggle");
  var menu = doc.getElementById("mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });

    // Close the menu when a link inside it is activated.
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      }
    });

    // Close on Escape.
    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // No observer (or reduced motion): show everything immediately.
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Active section in nav ---------- */
  var navLinks = doc.querySelectorAll(".nav-desktop .nav-link, .mobile-menu .nav-link");
  var sections = ["work", "services", "about", "contact"]
    .map(function (id) { return doc.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && navLinks.length && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            var href = link.getAttribute("href");
            link.classList.toggle("is-active", href === "#" + id);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Footer year ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Enquiry form (front-end only, honest behaviour) ----------
     There is no backend on this site, so the form composes an email in the
     visitor's own email app addressed to the studio. Nothing is stored,
     nothing is sent silently, and the page states this next to the form. */
  var form = doc.getElementById("enquiry-form");
  if (form) {
    var status = doc.getElementById("form-status");
    var STUDIO_EMAIL = "lerovam.agency@gmail.com";

    function setInvalid(field, invalid) {
      field.classList.toggle("invalid", invalid);
      var input = field.querySelector("input, select, textarea");
      if (input) input.setAttribute("aria-invalid", invalid ? "true" : "false");
    }

    ["enquiry-name", "enquiry-email", "enquiry-message"].forEach(function (id) {
      var input = doc.getElementById(id);
      if (!input) return;
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) setInvalid(field, false);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = doc.getElementById("enquiry-name");
      var business = doc.getElementById("enquiry-business");
      var email = doc.getElementById("enquiry-email");
      var need = doc.getElementById("enquiry-need");
      var budget = doc.getElementById("enquiry-budget");
      var message = doc.getElementById("enquiry-message");

      var valid = true;
      var firstInvalid = null;

      function check(input, ok) {
        var field = input.closest(".field");
        if (!field) return;
        setInvalid(field, !ok);
        if (!ok) {
          valid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      }

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      check(name, name.value.trim().length >= 2);
      check(email, emailOk);
      check(message, message.value.trim().length >= 10);

      if (!valid) {
        if (status) {
          status.textContent = "Please complete the highlighted fields so we can reply.";
          status.className = "form-status is-error";
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var subject = "Project enquiry — " + name.value.trim();
      if (business && business.value.trim()) subject += " (" + business.value.trim() + ")";

      var lines = [
        "Name: " + name.value.trim(),
        "Business: " + (business && business.value.trim() ? business.value.trim() : "—"),
        "Email: " + email.value.trim(),
        "Need: " + (need ? need.value : "—"),
        "Budget: " + (budget && budget.value ? budget.value : "—"),
        "",
        "Message:",
        message.value.trim()
      ];

      var mailto =
        "mailto:" + STUDIO_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      if (status) {
        status.textContent = "Opening your email app to send the enquiry…";
        status.className = "form-status is-info";
      }

      // Hand off to the visitor's email client. This navigation is the
      // actual, stated behaviour of the form — nothing else happens.
      window.location.href = mailto;
    });
  }
})();

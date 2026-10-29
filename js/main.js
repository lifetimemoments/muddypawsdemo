/* Muddy Paws Mobile Dog Grooming - interactions */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- preloader ---------- */
  const preloader = document.getElementById("preloader");
  const killPreloader = () => preloader && preloader.classList.add("is-done");
  window.addEventListener("load", () => setTimeout(killPreloader, 500));
  setTimeout(killPreloader, 2600); // safety net

  /* ---------- nav ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  const navProgress = document.getElementById("navProgress");

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", scrollY > 30);
    const max = document.documentElement.scrollHeight - innerHeight;
    navProgress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  };
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------- custom cursor ---------- */
  const cursor = document.querySelector(".cursor");
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  const cursorLabel = document.getElementById("cursorLabel");
  if (isFinePointer && !prefersReduced && cursor) {
    let dx = 0, dy = 0, rx = 0, ry = 0;
    addEventListener("mousemove", (e) => {
      dx = e.clientX; dy = e.clientY;
      cursorDot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
    });
    const followRing = () => {
      rx += (dx - rx) * 0.16;
      ry += (dy - ry) * 0.16;
      cursorRing.style.left = rx + "px";
      cursorRing.style.top = ry + "px";
      requestAnimationFrame(followRing);
    };
    followRing();
    addEventListener("mousedown", () => cursor.classList.add("is-down"));
    addEventListener("mouseup", () => cursor.classList.remove("is-down"));

    document.querySelectorAll("a, button, summary, .chip, .menu__item, .guest, .ba__frame").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const label = el.closest("[data-cursor]")?.dataset.cursor;
        if (label) {
          cursorLabel.textContent = label;
          cursorRing.classList.add("is-label");
        } else {
          cursorRing.classList.add("is-hover");
        }
      });
      el.addEventListener("mouseleave", () => {
        cursorRing.classList.remove("is-hover", "is-label");
        cursorLabel.textContent = "";
      });
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------- booking badge ---------- */
  // No published hours — nudge visitors to ring between 8am and 8pm.
  const updateOpenBadges = () => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const callable = mins >= 480 && mins < 1200; // 8:00 - 20:00
    document.querySelectorAll(".open-badge").forEach((badge) => {
      const b = badge.querySelector("b");
      badge.classList.toggle("is-open", callable);
      badge.classList.toggle("is-closed", !callable);
      b.textContent = callable ? "Now taking bookings" : "Leave a message anytime";
    });
  };
  updateOpenBadges();
  setInterval(updateOpenBadges, 60000);

  /* ---------- reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- parallax ---------- */
  if (!prefersReduced) {
    const layers = [...document.querySelectorAll("[data-parallax]")];
    const parallax = () => {
      const vh = innerHeight;
      layers.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - vh / 2;
        el.style.translate = `0 ${(-center * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
      });
    };
    parallax();
    addEventListener("scroll", () => requestAnimationFrame(parallax), { passive: true });
  }

  /* ---------- magnetic buttons ---------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${mx * 0.22}px, ${my * 0.28}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- guest card tilt ---------- */
  if (isFinePointer && !prefersReduced) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        counterObserver.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix || "";
        const dur = 1400;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  /* ---------- menu hover preview ---------- */
  const preview = document.getElementById("menuPreview");
  const previewImg = preview.querySelector("img");
  if (isFinePointer && !prefersReduced) {
    let px = 0, py = 0, tx = 0, ty = 0, rafId = null;
    const followPreview = () => {
      px += (tx - px) * 0.14;
      py += (ty - py) * 0.14;
      const w = preview.offsetWidth, h = preview.offsetHeight;
      const left = Math.min(Math.max(px + 26, 12), innerWidth - w - 12);
      const top = Math.min(Math.max(py - h / 2, 12), innerHeight - h - 12);
      preview.style.translate = `${left}px ${top}px`;
      rafId = requestAnimationFrame(followPreview);
    };
    document.querySelectorAll(".menu__item[data-img]").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        const src = item.dataset.img;
        if (previewImg.getAttribute("src") !== src) previewImg.src = src;
        preview.classList.add("is-visible");
        if (!rafId) rafId = requestAnimationFrame(followPreview);
      });
      item.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
      item.addEventListener("mouseleave", () => preview.classList.remove("is-visible"));
    });
    document.querySelector(".menu").addEventListener("mouseleave", () => {
      preview.classList.remove("is-visible");
    });
  }

  /* ---------- before / after compare slider ---------- */
  const ba = document.getElementById("baCompare");
  if (ba) {
    const setPos = (pct) => {
      const clamped = Math.min(Math.max(pct, 4), 96);
      ba.style.setProperty("--pos", clamped + "%");
      ba.setAttribute("aria-valuenow", Math.round(clamped));
    };
    const posFromEvent = (e) => {
      const r = ba.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    };
    let dragging = false;
    ba.addEventListener("pointerdown", (e) => {
      dragging = true;
      ba.setPointerCapture(e.pointerId);
      posFromEvent(e);
    });
    ba.addEventListener("pointermove", (e) => {
      if (dragging) posFromEvent(e);
    });
    ["pointerup", "pointercancel"].forEach((ev) =>
      ba.addEventListener(ev, () => (dragging = false))
    );
    ba.addEventListener("keydown", (e) => {
      const cur = parseFloat(getComputedStyle(ba).getPropertyValue("--pos"));
      const r = ba.getBoundingClientRect();
      const pct = (cur / r.width) * 100;
      if (e.key === "ArrowLeft") { setPos(pct - 4); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPos(pct + 4); e.preventDefault(); }
      if (e.key === "Home") { setPos(4); e.preventDefault(); }
      if (e.key === "End") { setPos(96); e.preventDefault(); }
    });
    // a gentle auto-wiggle when it scrolls into view
    if (!prefersReduced) {
      const wiggle = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            wiggle.unobserve(ba);
            const seq = [50, 68, 34, 54, 50];
            seq.forEach((p, i) => setTimeout(() => !dragging && setPos(p), i * 260));
          });
        },
        { threshold: 0.5 }
      );
      wiggle.observe(ba);
    }
  }

  /* ---------- sticky mobile book ---------- */
  const stickyBook = document.getElementById("stickyBook");
  const toggleSticky = () => {
    const past = scrollY > innerHeight * 0.85;
    const footerTop = document.querySelector(".footer").getBoundingClientRect().top;
    stickyBook.classList.toggle("is-shown", past && footerTop > innerHeight * 0.6);
  };
  toggleSticky();
  addEventListener("scroll", toggleSticky, { passive: true });

  /* ---------- nav spy ---------- */
  const spyLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
  const spyMap = new Map(spyLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const link = spyMap.get(e.target.id);
        if (link && e.isIntersecting) {
          spyLinks.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => spyObserver.observe(s));

  /* ---------- service filters ---------- */
  const chips = document.querySelectorAll(".chip");
  const items = document.querySelectorAll(".menu__item");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      items.forEach((item) => {
        const show = f === "all" || item.dataset.cat === f;
        item.classList.toggle("is-hidden", !show);
        if (show) {
          item.style.opacity = 0;
          requestAnimationFrame(() => {
            item.style.transition = "opacity .45s ease";
            item.style.opacity = 1;
          });
        }
      });
    });
  });

  /* ---------- enquiry form → mailto ---------- */
  const form = document.getElementById("enquiryForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const name = (d.get("name") || "").toString().trim();
    const dog = (d.get("dog") || "").toString().trim();
    const contact = (d.get("contact") || "").toString().trim();
    const message = (d.get("message") || "").toString().trim();

    const subject = `Grooming enquiry from ${name}${dog ? ` & ${dog}` : ""}`;
    const body = [
      `Hi Michelle,`,
      ``,
      message || "I'd like to ask about a groom.",
      ``,
      `Name: ${name}`,
      dog ? `Dog: ${dog}` : null,
      `Best contact: ${contact}`,
      ``,
      `Sent via the Muddy Paws website`,
    ]
      .filter(Boolean)
      .join("\n");

    location.href = `mailto:michelle@muddypaws-mobiledoggrooming.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();

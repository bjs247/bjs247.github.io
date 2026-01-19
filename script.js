/*
  Small UX helpers for the template:
  - product quantity stepper
  - fake cart count
  - footer year
  - prevent newsletter form submit (placeholder)
*/

(function () {
  // Enable .js styles (used by fade-in / reveal CSS)
  document.documentElement.classList.add("js");
  const cartCountEl = document.getElementById("cartCount");
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Persist a mock cart count so refreshes keep it (optional)
  const CART_KEY = "studiolabut_cartCount";
  let cartCount = parseInt(localStorage.getItem(CART_KEY) || "0", 10);
  if (Number.isNaN(cartCount)) cartCount = 0;
  if (cartCountEl) cartCountEl.textContent = String(cartCount);

  function updateCart(delta) {
    cartCount = Math.max(0, cartCount + delta);
    localStorage.setItem(CART_KEY, String(cartCount));
    if (cartCountEl) cartCountEl.textContent = String(cartCount);
  }

  // Quantity steppers
  document.querySelectorAll(".js-product").forEach((card) => {
    const minus = card.querySelector(".js-minus");
    const plus = card.querySelector(".js-plus");
    const qtyInput = card.querySelector(".js-qty");
    const addBtn = card.querySelector(".js-add");

    if (!qtyInput) return;

    const getQty = () => {
      const n = parseInt(qtyInput.value || "1", 10);
      return Number.isNaN(n) ? 1 : Math.max(1, Math.min(99, n));
    };

    const setQty = (n) => {
      qtyInput.value = String(Math.max(1, Math.min(99, n)));
    };

    minus?.addEventListener("click", () => setQty(getQty() - 1));
    plus?.addEventListener("click", () => setQty(getQty() + 1));

    addBtn?.addEventListener("click", () => {
      const q = getQty();
      updateCart(q);
      setQty(1);
      addBtn.classList.add("added");
      addBtn.textContent = "Added";
      window.setTimeout(() => {
        addBtn.classList.remove("added");
        addBtn.textContent = "Add to cart";
      }, 1000);
    });
  });

  // Cart button -> Stripe Payment Link checkout
    const CHECKOUT_URL = "https://buy.stripe.com/PASTE_YOUR_LINK_HERE";

    document.getElementById("cartBtn")?.addEventListener("click", () => {
      window.location.href = CHECKOUT_URL;
    });

  document.getElementById("newsletterForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const msg = document.getElementById("newsletterMsg");
    const btn = form.querySelector('button[type="submit"]');
    if (!msg || !btn) return;

    // Paste your Apps Script Web App URL here:
    const ENDPOINT = "https://script.google.com/macros/s/AKfycbxTkP-Y5nU8lkgLNNygmocb8IWySQWnSKERIHy0tTsru4WeCATTYkxnRbJFZYeoSy1-/exec";

    msg.textContent = "Submitting…";
    btn.disabled = true;

    try {
      // Apps Script Web Apps don’t reliably allow CORS responses.
      // So we use no-cors and show success optimistically if the request sends.
      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: new FormData(form),
      });

      msg.textContent = "Thanks! Check your email for your code.";
      form.reset();
    } catch (err) {
      msg.textContent = "Network error. Please try again.";
    } finally {
      btn.disabled = false;
    }
  });


    // Scroll reveal: fade elements in as they enter the viewport
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealEls.length) {
    if (reducedMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target); // animate once
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
      );

      revealEls.forEach((el) => io.observe(el));
    }
  }
    // HERO CAROUSEL (clickable + autoplay + pause)
  const carousel = document.querySelector(".js-hero-carousel");
  if (carousel) {
    const track = carousel.querySelector(".hero-carousel__track");
    const slides = Array.from(carousel.querySelectorAll(".hero-carousel__slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-carousel__dot"));

    const prevBtn = carousel.querySelector('[data-action="prev"]');
    const nextBtn = carousel.querySelector('[data-action="next"]');
    const toggleBtn = carousel.querySelector('[data-action="toggle"]');

    const interval = parseInt(carousel.dataset.interval || "5500", 10);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!track || slides.length === 0) return;

    let index = 0;
    let paused = false;
    let timer = null;

    const clampIndex = (i) => (i + slides.length) % slides.length;

    const render = () => {
      track.style.transform = `translateX(${-index * 100}%)`;

      slides.forEach((s, i) => {
        s.setAttribute("aria-hidden", i === index ? "false" : "true");
      });

      dots.forEach((d, i) => {
        const active = i === index;
        d.classList.toggle("is-active", active);
        if (active) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      if (reduceMotion || paused || slides.length <= 1) return;
      stop();
      timer = window.setInterval(() => {
        goTo(index + 1, false); // auto-advance (don’t restart timer)
      }, interval);
    };

    const setPaused = (p) => {
      paused = p;

      if (toggleBtn) {
        toggleBtn.classList.toggle("is-paused", paused);
        toggleBtn.setAttribute("aria-pressed", paused ? "true" : "false");
        toggleBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
      }

      if (paused) stop();
      else start();
    };

    const goTo = (i, userAction = true) => {
      index = clampIndex(i);
      render();

      // If the user clicked prev/next/dot, restart the autoplay timer
      if (userAction) start();
    };

    prevBtn?.addEventListener("click", () => goTo(index - 1, true));
    nextBtn?.addEventListener("click", () => goTo(index + 1, true));
    toggleBtn?.addEventListener("click", () => setPaused(!paused));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const i = parseInt(dot.dataset.slide || "0", 10);
        goTo(i, true);
      });
    });

    // Keyboard: left/right to change slides, space to pause/play
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1, true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1, true);
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setPaused(!paused);
      }
    });

    // If the tab goes inactive, stop; resume when visible (unless user paused)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (!paused) start();
    });

    render();
    start();
  }

  // Close nav dropdown when clicking outside / pressing Esc
  (() => {
    const dropdowns = document.querySelectorAll(".nav-dropdown");
    if (!dropdowns.length) return;

    document.addEventListener("click", (e) => {
      dropdowns.forEach((dd) => {
        if (!dd.contains(e.target)) dd.removeAttribute("open");
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dropdowns.forEach((dd) => dd.removeAttribute("open"));
    });

    dropdowns.forEach((dd) => {
      dd.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => dd.removeAttribute("open"));
      });
    });
  })();

})();

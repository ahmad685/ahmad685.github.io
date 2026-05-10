(function () {
  "use strict";

  const body = document.body;
  const header = document.querySelector("#header");
  const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");
  const navMenu = document.querySelector("#navmenu");
  const scrollTop = document.querySelector(".scroll-top");
  const navMenuLinks = document.querySelectorAll(".navmenu a");
  const processGrid = document.querySelector("[data-process-grid]");
  const projectFilterGroups = document.querySelectorAll("[data-project-filters]");

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  function toggleScrolled() {
    if (!header) {
      return;
    }

    if (
      !header.classList.contains("scroll-up-sticky") &&
      !header.classList.contains("sticky-top") &&
      !header.classList.contains("fixed-top")
    ) {
      return;
    }

    if (window.scrollY > 40) {
      body.classList.add("scrolled");
    } else {
      body.classList.remove("scrolled");
    }
  }

  function syncMobileNavToggleState(isOpen) {
    if (!mobileNavToggleBtn) {
      return;
    }

    mobileNavToggleBtn.classList.toggle("bi-list", !isOpen);
    mobileNavToggleBtn.classList.toggle("bi-x", isOpen);
    mobileNavToggleBtn.setAttribute("aria-expanded", String(isOpen));
    mobileNavToggleBtn.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  }

  function mobileNavToggle() {
    if (!mobileNavToggleBtn || !navMenu) {
      return;
    }

    const isOpen = body.classList.toggle("mobile-nav-active");
    syncMobileNavToggleState(isOpen);
  }

  function closeMobileNav() {
    if (!body.classList.contains("mobile-nav-active")) {
      return;
    }

    body.classList.remove("mobile-nav-active");
    syncMobileNavToggleState(false);
  }

  function toggleScrollTop() {
    if (!scrollTop) {
      return;
    }

    if (window.scrollY > 220) {
      scrollTop.classList.add("active");
    } else {
      scrollTop.classList.remove("active");
    }
  }

  function navmenuScrollspy() {
    navMenuLinks.forEach((link) => {
      if (!link.hash || !link.hash.startsWith("#")) {
        return;
      }

      const section = document.querySelector(link.hash);
      if (!section) {
        return;
      }

      const position = window.scrollY + 200;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navMenuLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
      }
    });
  }

  function aosInit() {
    if (typeof AOS === "undefined") {
      return;
    }

    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
    });
  }

  function initProcessSequence() {
    if (!processGrid) {
      return;
    }

    const steps = processGrid.querySelectorAll("[data-process-step]");
    if (!steps.length) {
      return;
    }

    const setActiveStep = (activeStep) => {
      steps.forEach((step) => step.classList.remove("process-active"));
      activeStep.classList.add("process-active");
    };

    steps.forEach((step) => {
      step.addEventListener("mouseenter", () => setActiveStep(step));
      step.addEventListener("focusin", () => setActiveStep(step));
      step.addEventListener("click", () => setActiveStep(step));
    });

    const processObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          steps.forEach((step, index) => {
            window.setTimeout(() => {
              step.classList.add("is-visible");
            }, index * 170);
          });

          processObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.22,
      }
    );

    processObserver.observe(processGrid);
  }

  function initTestimonialsSlider() {
    const slider = document.querySelector(".testimonials-swiper");
    if (!slider || typeof Swiper === "undefined") {
      return;
    }

    new Swiper(slider, {
      speed: 700,
      loop: true,
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 1,
      spaceBetween: 18,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        nextEl: ".testimonial-next",
        prevEl: ".testimonial-prev",
      },
      pagination: {
        el: ".testimonial-pagination",
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 1.18,
          spaceBetween: 20,
        },
        1200: {
          slidesPerView: 1.32,
          spaceBetween: 24,
        },
      },
    });
  }

  function initProjectFilters() {
    if (!projectFilterGroups.length) {
      return;
    }

    projectFilterGroups.forEach((group) => {
      const targetSelector = group.getAttribute("data-filter-target");
      const grid = targetSelector ? document.querySelector(targetSelector) : null;
      const buttons = group.querySelectorAll("[data-filter]");

      if (!grid || !buttons.length) {
        return;
      }

      const cards = grid.querySelectorAll("[data-project-card]");

      if (!cards.length) {
        return;
      }

      const validFilters = new Set(
        Array.from(buttons, (button) => button.dataset.filter || "all")
      );

      const applyFilter = (filter, options = {}) => {
        const normalizedFilter = validFilters.has(filter) ? filter : "all";
        const shouldUpdateHash = options.updateHash !== false;

        buttons.forEach((button) => {
          const isActive = button.dataset.filter === normalizedFilter;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-pressed", String(isActive));
        });

        cards.forEach((card) => {
          const categories = (card.dataset.category || "")
            .split(/\s+/)
            .filter(Boolean);
          const matches =
            normalizedFilter === "all" || categories.includes(normalizedFilter);

          card.hidden = !matches;
        });

        if (!shouldUpdateHash) {
          return;
        }

        const nextUrl =
          normalizedFilter === "all"
            ? `${window.location.pathname}${window.location.search}`
            : `${window.location.pathname}${window.location.search}#${normalizedFilter}`;

        window.history.replaceState(null, "", nextUrl);
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          applyFilter(button.dataset.filter || "all");
        });
      });

      const hashFilter = window.location.hash.replace("#", "");
      applyFilter(hashFilter, { updateHash: false });
    });
  }

  function restoreInitialScrollPosition() {
    const hash = window.location.hash;

    if (!hash || hash === "#" || hash === "#hero") {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
      return;
    }

    const section = document.querySelector(hash);
    if (!section) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
      return;
    }

    const scrollMarginTop = parseInt(getComputedStyle(section).scrollMarginTop, 10);

    window.scrollTo({
      top: Math.max(section.offsetTop - (Number.isNaN(scrollMarginTop) ? 0 : scrollMarginTop), 0),
      behavior: "auto",
    });
  }

  if (mobileNavToggleBtn) {
    syncMobileNavToggleState(body.classList.contains("mobile-nav-active"));
    mobileNavToggleBtn.addEventListener("click", mobileNavToggle);
  }

  navMenuLinks.forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  if (scrollTop) {
    scrollTop.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  window.addEventListener("load", () => {
    restoreInitialScrollPosition();
    toggleScrolled();
    toggleScrollTop();
    navmenuScrollspy();
    aosInit();
    initProcessSequence();
    initTestimonialsSlider();
    initProjectFilters();
  });

  document.addEventListener("scroll", () => {
    toggleScrolled();
    toggleScrollTop();
    navmenuScrollspy();
  });
})();

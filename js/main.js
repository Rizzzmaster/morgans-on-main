/* ============================================================
   MORGAN'S ON MAIN
   FAST CINEMATIC ENGINE
   Performance-first version
   ============================================================ */

(() => {
  "use strict";

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */

  const $ = (s, scope = document) =>
    scope.querySelector(s);

  const $$ = (s, scope = document) =>
    Array.from(scope.querySelectorAll(s));

  const clamp = (n, min = 0, max = 1) =>
    Math.min(Math.max(n, min), max);

  const lerp = (a, b, n) =>
    a + (b - a) * n;

  const mobile = window.matchMedia(
    "(max-width: 900px)"
  ).matches;

  const touch = window.matchMedia(
    "(pointer: coarse)"
  ).matches;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */

  const state = {
    scrollY: window.scrollY,
    lastScrollY: window.scrollY,

    mouseX: 0,
    mouseY: 0,

    smoothMouseX: 0,
    smoothMouseY: 0,

    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,

    raf: null,
    cursorRaf: null,

    visible: true,

    menuIndex: 0,
    cocktailIndex: 0,

    menuLocked: false,
    cocktailLocked: false,

    galleryDragging: false,
    galleryStartX: 0,
    galleryStartScroll: 0
  };


  /* ----------------------------------------------------------
     VIEWPORT
  ---------------------------------------------------------- */

  function setViewport() {
    document.documentElement.style.setProperty(
      "--viewport-width",
      `${window.innerWidth}px`
    );

    document.documentElement.style.setProperty(
      "--viewport-height",
      `${window.innerHeight}px`
    );
  }

  setViewport();


  /* ==========================================================
     FAST RENDER SYSTEM
     ========================================================== */

  function requestRender() {
    if (state.raf || !state.visible) return;

    state.raf = requestAnimationFrame(() => {
      state.raf = null;

      updateScrollState();
      updateHeader();
      updateHero();
      updateTable();
      updateDinner();
      updateEvents();
      updateVisit();
      updateGallery();
    });
  }


  /* ==========================================================
     SCROLL
     ========================================================== */

  function updateScrollState() {
    const current = window.scrollY;

    const direction =
      current > state.lastScrollY
        ? "down"
        : current < state.lastScrollY
          ? "up"
          : null;

    state.scrollY = current;

    if (direction) {
      document.documentElement.style.setProperty(
        "--scroll-direction",
        direction
      );
    }

    state.lastScrollY = current;

    const max =
      document.documentElement.scrollHeight -
      window.innerHeight;

    document.documentElement.style.setProperty(
      "--scroll-progress",
      max > 0
        ? clamp(current / max)
        : 0
    );
  }

  window.addEventListener(
    "scroll",
    requestRender,
    { passive: true }
  );


  /* ==========================================================
     HEADER
     ========================================================== */

  function updateHeader() {
    const header = $("[data-header]");

    if (!header) return;

    header.classList.toggle(
      "is-scrolled",
      state.scrollY > 40
    );

    /*
      Keep mobile header visible.
    */

    if (mobile) {
      header.classList.remove(
        "is-hidden"
      );
      return;
    }

    header.classList.toggle(
      "is-hidden",
      state.scrollY > 160 &&
      state.lastScrollY > state.scrollY
    );
  }


  /* ==========================================================
     LOADER
     ========================================================== */

  function initLoader() {
    const curtain =
      $(".experience-curtain");

    if (!curtain) return;

    document.body.classList.add(
      "experience-loading"
    );

    requestAnimationFrame(() => {
      curtain.classList.add(
        "is-ready"
      );
    });

    /*
      Fast cinematic intro.
      Only ONE timeout.
    */

    setTimeout(() => {
      curtain.classList.add(
        "is-exiting"
      );

      curtain.style.pointerEvents =
        "none";

      document.body.classList.remove(
        "experience-loading"
      );

      document.body.classList.add(
        "experience-ready"
      );

      setTimeout(() => {
        curtain.classList.add(
          "is-hidden"
        );

        curtain.style.display =
          "none";
      }, reducedMotion ? 50 : 650);

    }, reducedMotion ? 50 : 500);
  }


  /* ==========================================================
     HERO
  ========================================================== */

  function updateHero() {
    const hero =
      $('[data-scene="hero"]');

    if (!hero) return;

    const rect =
      hero.getBoundingClientRect();

    /*
      Stop doing calculations when
      hero is far away.
    */

    if (
      rect.bottom < -100 ||
      rect.top >
        window.innerHeight + 100
    ) {
      return;
    }

    const progress =
      clamp(
        -rect.top /
        Math.max(rect.height, 1)
      );

    hero.style.setProperty(
      "--hero-progress",
      progress
    );

    const content =
      $(".hero-content", hero);

    const food =
      $(".hero-food-scene", hero);

    const atmosphere =
      $(".hero-atmosphere", hero);

    /*
      Mobile gets much lighter effects.
    */

    if (!mobile && !reducedMotion) {

      if (content) {
        content.style.transform =
          `translate3d(
            0,
            ${progress * -30}px,
            0
          )`;

        content.style.opacity =
          clamp(
            1 - progress * 1.1
          );
      }

      if (food) {
        food.style.transform =
          `translate3d(
            var(--mouse-x, 0px),
            calc(
              ${progress * -45}px +
              var(--mouse-y, 0px)
            ),
            0
          ) scale(
            ${1 + progress * 0.05}
          )`;
      }

      if (atmosphere) {
        atmosphere.style.transform =
          `translate3d(
            0,
            ${progress * -20}px,
            0
          )`;
      }
    }
  }


  /* ==========================================================
     POINTER PARALLAX
  ========================================================== */

  function initPointer() {
    /*
      Disable expensive pointer effects
      on phones/tablets.
    */

    if (touch || mobile) return;

    window.addEventListener(
      "pointermove",
      event => {

        state.mouseX =
          event.clientX /
          window.innerWidth -
          0.5;

        state.mouseY =
          event.clientY /
          window.innerHeight -
          0.5;

        requestCursorRender();
      },
      { passive: true }
    );
  }


  /* ==========================================================
     CURSOR
  ========================================================== */

  function initCursor() {
    if (touch || mobile) return;

    const cursor =
      $(".cursor-system");

    if (!cursor) return;

    document.body.classList.add(
      "custom-cursor-enabled"
    );

    document.addEventListener(
      "pointerover",
      event => {
        if (
          event.target.closest(
            "a, button, .dish-slide, .cocktail-card"
          )
        ) {
          cursor.classList.add(
            "is-hovering"
          );
        }
      }
    );

    document.addEventListener(
      "pointerout",
      event => {
        if (
          event.target.closest(
            "a, button, .dish-slide, .cocktail-card"
          )
        ) {
          cursor.classList.remove(
            "is-hovering"
          );
        }
      }
    );
  }


  function requestCursorRender() {
    if (state.cursorRaf) return;

    state.cursorRaf =
      requestAnimationFrame(() => {

        state.cursorRaf = null;

        state.smoothMouseX =
          lerp(
            state.smoothMouseX,
            state.mouseX,
            0.15
          );

        state.smoothMouseY =
          lerp(
            state.smoothMouseY,
            state.mouseY,
            0.15
          );

        const cursor =
          $(".cursor-system");

        if (cursor) {

          const x =
            state.smoothMouseX *
            window.innerWidth +
            window.innerWidth / 2;

          const y =
            state.smoothMouseY *
            window.innerHeight +
            window.innerHeight / 2;

          cursor.style.transform =
            `translate3d(
              ${x}px,
              ${y}px,
              0
            )`;
        }

        const light =
          $("[data-cursor-light]");

        if (light) {
          light.style.transform =
            `translate3d(
              ${state.smoothMouseX * 30}px,
              ${state.smoothMouseY * 30}px,
              0
            )`;
        }

        const food =
          $(".hero-food-scene");

        if (food) {
          food.style.setProperty(
            "--mouse-x",
            `${state.smoothMouseX * 15}px`
          );

          food.style.setProperty(
            "--mouse-y",
            `${state.smoothMouseY * 12}px`
          );
        }
      });
  }


  /* ==========================================================
     DEPTH LAYERS
  ========================================================== */

  function initDepth() {
    if (touch || mobile) return;

    const layers =
      $$("[data-depth]");

    if (!layers.length) return;

    window.addEventListener(
      "pointermove",
      () => {

        layers.forEach(layer => {

          const depth =
            parseFloat(
              layer.dataset.depth || 1
            );

          layer.style.setProperty(
            "--pointer-depth-x",
            `${state.smoothMouseX * depth * 5}px`
          );

          layer.style.setProperty(
            "--pointer-depth-y",
            `${state.smoothMouseY * depth * 5}px`
          );

        });

      },
      { passive: true }
    );
  }


  /* ==========================================================
     REVEALS
  ========================================================== */

  function initReveal() {
    const elements =
      $$("[data-reveal]");

    if (!elements.length) return;

    if (reducedMotion) {
      elements.forEach(
        element =>
          element.classList.add(
            "is-visible"
          )
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );

          });

        },
        {
          threshold: 0.08,
          rootMargin:
            "0px 0px -5% 0px"
        }
      );

    elements.forEach(
      element =>
        observer.observe(element)
    );
  }


  /* ==========================================================
     SCENES
  ========================================================== */

  function initScenes() {
    const scenes =
      $$("[data-scene]");

    if (!scenes.length) return;

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            entry.target.classList.toggle(
              "is-active",
              entry.isIntersecting
            );

          });

        },
        {
          threshold: 0.1
        }
      );

    scenes.forEach(
      scene =>
        observer.observe(scene)
    );
  }


  /* ==========================================================
     TABLE
  ========================================================== */

  function initTable() {
    const table =
      $('[data-scene="table"]');

    if (!table) return;

    const items =
      $$(".table-story-item", table);

    items.forEach(
      (item, index) => {

        item.addEventListener(
          "click",
          () => {

            items.forEach(
              (el, i) =>
                el.classList.toggle(
                  "is-active",
                  i === index
                )
            );

          }
        );

      }
    );
  }


  function updateTable() {
    const table =
      $('[data-scene="table"]');

    if (!table) return;

    const rect =
      table.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top >
        window.innerHeight
    ) {
      return;
    }

    const image =
      $("[data-pinned-image]", table);

    if (!image) return;

    const progress =
      clamp(
        (
          window.innerHeight -
          rect.top
        ) /
        (
          window.innerHeight +
          rect.height
        )
      );

    image.style.setProperty(
      "--table-progress",
      progress
    );
  }


  /* ==========================================================
     MENU
  ========================================================== */

  function initMenu() {
    const showcase =
      $("[data-dish-showcase]");

    if (!showcase) return;

    const dishes =
      $$(".dish-slide", showcase);

    if (!dishes.length) return;

    const prev =
      $("[data-dish-prev]");

    const next =
      $("[data-dish-next]");

    if (prev) {
      prev.addEventListener(
        "click",
        () => changeDish(-1)
      );
    }

    if (next) {
      next.addEventListener(
        "click",
        () => changeDish(1)
      );
    }

    dishes.forEach(
      (dish, index) => {

        dish.addEventListener(
          "click",
          () =>
            activateDish(
              index,
              dishes
            )
        );

        dish.addEventListener(
          "keydown",
          event => {

            if (
              event.key === "ArrowRight"
            ) {
              changeDish(1);
            }

            if (
              event.key === "ArrowLeft"
            ) {
              changeDish(-1);
            }

          }
        );

      }
    );


    /* Touch */

    let startX = 0;

    showcase.addEventListener(
      "touchstart",
      event => {
        startX =
          event.changedTouches[0]
            .clientX;
      },
      { passive: true }
    );

    showcase.addEventListener(
      "touchend",
      event => {

        const endX =
          event.changedTouches[0]
            .clientX;

        const distance =
          endX - startX;

        if (
          Math.abs(distance) > 50
        ) {
          changeDish(
            distance < 0 ? 1 : -1
          );
        }

      },
      { passive: true }
    );


    activateDish(
      0,
      dishes,
      false
    );
  }


  function changeDish(direction) {
    const dishes =
      $$(".dish-slide");

    if (!dishes.length) return;

    if (state.menuLocked) return;

    state.menuIndex =
      (
        state.menuIndex +
        direction +
        dishes.length
      ) % dishes.length;

    activateDish(
      state.menuIndex,
      dishes
    );

    state.menuLocked = true;

    setTimeout(
      () => {
        state.menuLocked = false;
      },
      350
    );
  }


  function activateDish(
    index,
    dishes
  ) {

    state.menuIndex = index;

    dishes.forEach(
      (dish, i) => {

        dish.classList.toggle(
          "is-active",
          i === index
        );

        dish.classList.toggle(
          "is-before",
          i < index
        );

        dish.classList.toggle(
          "is-after",
          i > index
        );

        let offset =
          i - index;

        if (
          offset >
          dishes.length / 2
        ) {
          offset -=
            dishes.length;
        }

        dish.style.setProperty(
          "--dish-offset",
          offset
        );
      }
    );

    const progress =
      $("[data-dish-progress]");

    if (progress) {
      progress.style.width =
        `${((index + 1) / dishes.length) * 100}%`;
    }
  }


  /* ==========================================================
     COCKTAILS
  ========================================================== */

  function initCocktails() {
    const cabinet =
      $("[data-cocktail-cabinet]");

    if (!cabinet) return;

    const cards =
      $$(".cocktail-card", cabinet);

    if (!cards.length) return;

    cards.forEach(
      (card, index) => {

        card.addEventListener(
          "click",
          () =>
            activateCocktail(
              index,
              cards
            )
        );

        card.addEventListener(
          "keydown",
          event => {

            if (
              event.key === "ArrowRight"
            ) {
              changeCocktail(1);
            }

            if (
              event.key === "ArrowLeft"
            ) {
              changeCocktail(-1);
            }

          }
        );

      }
    );

    activateCocktail(
      0,
      cards
    );
  }


  function changeCocktail(direction) {
    const cards =
      $$(".cocktail-card");

    if (!cards.length) return;

    if (state.cocktailLocked) return;

    state.cocktailIndex =
      (
        state.cocktailIndex +
        direction +
        cards.length
      ) % cards.length;

    activateCocktail(
      state.cocktailIndex,
      cards
    );

    state.cocktailLocked = true;

    setTimeout(
      () => {
        state.cocktailLocked = false;
      },
      350
    );
  }


  function activateCocktail(
    index,
    cards
  ) {

    state.cocktailIndex = index;

    cards.forEach(
      (card, i) => {

        card.classList.toggle(
          "is-active",
          i === index
        );

        card.classList.toggle(
          "is-before",
          i < index
        );

        card.classList.toggle(
          "is-after",
          i > index
        );

        card.style.setProperty(
          "--cocktail-offset",
          i - index
        );

      }
    );
  }


  /* ==========================================================
     GALLERY
  ========================================================== */

  function initGallery() {
    const gallery =
      $("[data-horizontal-gallery]");

    if (!gallery) return;

    gallery.addEventListener(
      "pointerdown",
      event => {

        if (
          event.pointerType ===
          "mouse" &&
          event.button !== 0
        ) {
          return;
        }

        state.galleryDragging = true;

        state.galleryStartX =
          event.clientX;

        state.galleryStartScroll =
          gallery.scrollLeft;

        gallery.classList.add(
          "is-dragging"
        );

        try {
          gallery.setPointerCapture(
            event.pointerId
          );
        } catch (_) {}

      }
    );

    gallery.addEventListener(
      "pointermove",
      event => {

        if (
          !state.galleryDragging
        ) {
          return;
        }

        gallery.scrollLeft =
          state.galleryStartScroll -
          (
            event.clientX -
            state.galleryStartX
          );

      }
    );

    const stop =
      () => {

        state.galleryDragging =
          false;

        gallery.classList.remove(
          "is-dragging"
        );

      };

    gallery.addEventListener(
      "pointerup",
      stop
    );

    gallery.addEventListener(
      "pointercancel",
      stop
    );
  }


  function updateGallery() {
    const gallery =
      $("[data-horizontal-gallery]");

    if (!gallery) return;

    const rect =
      gallery.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top >
        window.innerHeight
    ) {
      return;
    }

    const progress =
      clamp(
        (
          window.innerHeight -
          rect.top
        ) /
        (
          window.innerHeight +
          rect.height
        )
      );

    gallery.style.setProperty(
      "--gallery-progress",
      progress
    );
  }


  /* ==========================================================
     DINNER
  ========================================================== */

  function updateDinner() {
    if (mobile) return;

    const section =
      $('[data-scene="dinner"]');

    if (!section) return;

    const rect =
      section.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top >
        window.innerHeight
    ) {
      return;
    }

    const progress =
      clamp(
        (
          window.innerHeight -
          rect.top
        ) /
        (
          window.innerHeight +
          rect.height
        )
      );

    const image =
      $(".dinner-image", section);

    if (image) {
      image.style.transform =
        `translate3d(
          0,
          ${(0.5 - progress) * 35}px,
          0
        ) scale(1.04)`;
    }
  }


  /* ==========================================================
     EVENTS
  ========================================================== */

  function updateEvents() {
    if (mobile) return;

    const section =
      $('[data-scene="events"]');

    if (!section) return;

    const image =
      $(".events-image", section);

    if (!image) return;

    const rect =
      section.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top >
        window.innerHeight
    ) {
      return;
    }

    const progress =
      clamp(
        (
          window.innerHeight -
          rect.top
        ) /
        (
          window.innerHeight +
          rect.height
        )
      );

    image.style.transform =
      `translate3d(
        0,
        ${(progress - 0.5) * -30}px,
        0
      )`;
  }


  /* ==========================================================
     VISIT
  ========================================================== */

  function updateVisit() {
    if (mobile) return;

    const section =
      $('[data-scene="visit"]');

    if (!section) return;

    const background =
      $(".visit-background", section);

    if (!background) return;

    const rect =
      section.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top >
        window.innerHeight
    ) {
      return;
    }

    const progress =
      clamp(
        (
          window.innerHeight -
          rect.top
        ) /
        (
          window.innerHeight +
          rect.height
        )
      );

    background.style.transform =
      `translate3d(
        0,
        ${(progress - 0.5) * -25}px,
        0
      )`;
  }


  /* ==========================================================
     MAGNETIC BUTTONS
  ========================================================== */

  function initMagnetic() {
    if (touch || mobile) return;

    $$("[data-magnetic]").forEach(
      button => {

        button.addEventListener(
          "pointermove",
          event => {

            const rect =
              button.getBoundingClientRect();

            const x =
              event.clientX -
              rect.left -
              rect.width / 2;

            const y =
              event.clientY -
              rect.top -
              rect.height / 2;

            button.style.transform =
              `translate3d(
                ${x * 0.10}px,
                ${y * 0.10}px,
                0
              )`;
          }
        );

        button.addEventListener(
          "pointerleave",
          () => {
            button.style.transform = "";
          }
        );

      }
    );
  }


  /* ==========================================================
     MOBILE MENU
  ========================================================== */

  function initMobileNavigation() {
    const toggle =
      $("[data-menu-toggle]");

    const menu =
      $("[data-mobile-menu]");

    if (!toggle || !menu) return;

    toggle.addEventListener(
      "click",
      () => {

        const open =
          document.body.classList.toggle(
            "mobile-menu-open"
          );

        toggle.setAttribute(
          "aria-expanded",
          String(open)
        );

      }
    );

    $$("a", menu).forEach(
      link => {
        link.addEventListener(
          "click",
          closeMobileMenu
        );
      }
    );

    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Escape"
        ) {
          closeMobileMenu();
        }
      }
    );
  }


  function closeMobileMenu() {
    const toggle =
      $("[data-menu-toggle]");

    document.body.classList.remove(
      "mobile-menu-open"
    );

    if (toggle) {
      toggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  }


  /* ==========================================================
     SMOOTH LINKS
  ========================================================== */

  function initSmoothLinks() {
    $$(
      'a[href^="#"]'
    ).forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            const href =
              link.getAttribute(
                "href"
              );

            if (
              !href ||
              href === "#"
            ) {
              return;
            }

            const target =
              document.querySelector(
                href
              );

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
              behavior:
                reducedMotion
                  ? "auto"
                  : "smooth"
            });

          }
        );

      }
    );
  }


  /* ==========================================================
     IMAGE LOADING
  ========================================================== */

  function initImages() {
    const images =
      $$("img");

    images.forEach(
      image => {

        /*
          Browser-native decoding.
        */

        image.decoding =
          "async";

        /*
          Mark loaded images.
        */

        if (image.complete) {
          image.classList.add(
            "is-loaded"
          );
        } else {
          image.addEventListener(
            "load",
            () => {
              image.classList.add(
                "is-loaded"
              );
            },
            { once: true }
          );
        }

        /*
          If an image fails, expose
          the problem in console.
        */

        image.addEventListener(
          "error",
          () => {
            console.warn(
              "Morgan's image failed:",
              image.src
            );

            image.classList.add(
              "is-image-error"
            );
          },
          { once: true }
        );
      }
    );
  }


  /* ==========================================================
     VISIBILITY
  ========================================================== */

  function initVisibility() {
    document.addEventListener(
      "visibilitychange",
      () => {

        state.visible =
          !document.hidden;

        if (state.visible) {
          requestRender();
        }

      }
    );
  }


  /* ==========================================================
     RESIZE
  ========================================================== */

  function initResize() {
    let timer = null;

    window.addEventListener(
      "resize",
      () => {

        clearTimeout(timer);

        timer =
          setTimeout(
            () => {
              setViewport();
              requestRender();
            },
            150
          );

      },
      { passive: true }
    );
  }


  /* ==========================================================
     START
  ========================================================== */

  function init() {

    document.body.classList.add(
      "js-enabled"
    );

    /*
      Loader
    */

    initLoader();

    /*
      Navigation
    */

    initHeader();
    initMobileNavigation();
    initSmoothLinks();

    /*
      Scene system
    */

    initScenes();
    initReveal();

    /*
      Hero
    */

    initPointer();
    initDepth();

    /*
      Story
    */

    initTable();

    /*
      Menu
    */

    initMenu();

    /*
      Bar
    */

    initCocktails();

    /*
      Gallery
    */

    initGallery();

    /*
      Buttons
    */

    initMagnetic();

    /*
      Cursor
    */

    initCursor();

    /*
      Images
    */

    initImages();

    /*
      Browser
    */

    initVisibility();
    initResize();

    /*
      Initial render only.
    */

    requestRender();

    console.log(
      "%c MORGAN'S ON MAIN — FAST MODE ",
      "background:#111;color:#f5eee5;padding:8px 14px;font-weight:bold;"
    );
  }


  /* ==========================================================
     BOOT
  ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

})();

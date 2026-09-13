/* ============================================================
   MORGAN'S ON MAIN
   CINEMATIC EXPERIENCE ENGINE
   Exact engine for current index.html
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     DOM HELPERS
  ============================================================ */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  const clamp = (value, min = 0, max = 1) =>
    Math.min(Math.max(value, min), max);

  const lerp = (a, b, amount) =>
    a + (b - a) * amount;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const coarsePointer = window.matchMedia(
    "(pointer: coarse)"
  ).matches;


  /* ============================================================
     STATE
  ============================================================ */

  const state = {
    scrollY: window.scrollY,
    lastScrollY: window.scrollY,

    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,

    mouseX: 0,
    mouseY: 0,
    smoothMouseX: 0,
    smoothMouseY: 0,

    direction: "down",

    raf: null,
    resizeTimer: null,

    menuIndex: 0,
    cocktailIndex: 0,

    menuBusy: false,

    loaderFinished: false,

    cursorX: 0,
    cursorY: 0,

    galleryDragging: false,
    galleryStartX: 0,
    galleryStartScroll: 0,

    pageVisible: true
  };


  /* ============================================================
     ROOT VARIABLES
  ============================================================ */

  const root = document.documentElement;

  function setVar(name, value) {
    root.style.setProperty(name, value);
  }

  function updateViewportVariables() {
    state.viewportWidth = window.innerWidth;
    state.viewportHeight = window.innerHeight;

    setVar(
      "--viewport-width",
      `${state.viewportWidth}px`
    );

    setVar(
      "--viewport-height",
      `${state.viewportHeight}px`
    );
  }

  updateViewportVariables();


  /* ============================================================
     RAF ENGINE
  ============================================================ */

  function requestFrame() {
    if (state.raf || !state.pageVisible) return;

    state.raf = requestAnimationFrame(frame);
  }

  function frame() {
    state.raf = null;

    if (!state.pageVisible) return;

    state.scrollY = window.scrollY;

    updateGlobalProgress();
    updateHeader();
    updateHero();
    updateDepth();
    updateTable();
    updateDinner();
    updateEvents();
    updateVisit();
    updateGallery();
    updateCursor();
  }


  /* ============================================================
     GLOBAL SCROLL
  ============================================================ */

  function updateGlobalProgress() {
    const documentHeight =
      document.documentElement.scrollHeight -
      state.viewportHeight;

    const progress =
      documentHeight > 0
        ? clamp(state.scrollY / documentHeight)
        : 0;

    setVar(
      "--scroll-progress",
      progress.toFixed(4)
    );

    setVar(
      "--scroll-y",
      `${state.scrollY}px`
    );
  }


  /* ============================================================
     HEADER
  ============================================================ */

  function initHeader() {
    const header = $(".site-header");

    if (!header) return;

    window.addEventListener(
      "scroll",
      () => {
        const current = window.scrollY;

        if (current > state.lastScrollY) {
          state.direction = "down";
        } else if (current < state.lastScrollY) {
          state.direction = "up";
        }

        state.lastScrollY = current;

        requestFrame();
      },
      { passive: true }
    );
  }

  function updateHeader() {
    const header = $(".site-header");

    if (!header) return;

    header.classList.toggle(
      "is-scrolled",
      state.scrollY > 40
    );

    header.classList.toggle(
      "is-hidden",
      state.scrollY > 180 &&
      state.direction === "down"
    );

    header.classList.toggle(
      "is-visible",
      state.direction === "up" ||
      state.scrollY < 180
    );
  }


  /* ============================================================
     EXPERIENCE CURTAIN
  ============================================================ */

  function initCurtain() {
    const curtain = $(".experience-curtain");

    if (!curtain) return;

    document.body.classList.add(
      "experience-loading"
    );

    /*
      Allow the browser to paint the curtain first.
    */

    requestAnimationFrame(() => {
      curtain.classList.add("is-ready");
    });

    /*
      Current HTML has no enter button.
      Therefore this becomes an automatic cinematic intro.
    */

    const finish = () => {
      if (state.loaderFinished) return;

      state.loaderFinished = true;

      curtain.classList.add("is-exiting");

      document.body.classList.remove(
        "experience-loading"
      );

      document.body.classList.add(
        "experience-ready"
      );

      window.setTimeout(() => {
        curtain.classList.add(
          "is-hidden"
        );
      }, reducedMotion ? 100 : 1200);
    };

    window.setTimeout(
      finish,
      reducedMotion ? 100 : 1800
    );

    /*
      Absolute fallback.
    */

    window.setTimeout(
      finish,
      5000
    );
  }


  /* ============================================================
     HERO
  ============================================================ */

  function updateHero() {
    const hero = $(
      '[data-scene="hero"]'
    );

    if (!hero) return;

    const rect =
      hero.getBoundingClientRect();

    const progress = clamp(
      -rect.top /
      Math.max(rect.height, 1)
    );

    setVar(
      "--hero-progress",
      progress.toFixed(4)
    );

    /*
      Hero backdrop.
    */

    const backdrop =
      $(".hero-backdrop", hero);

    if (backdrop) {
      const y =
        progress * -70;

      const scale =
        1 + progress * 0.08;

      backdrop.style.transform =
        `translate3d(0, ${y}px, 0) scale(${scale})`;
    }

    /*
      Atmosphere.
    */

    const atmosphere =
      $(".hero-atmosphere", hero);

    if (atmosphere) {
      atmosphere.style.transform =
        `translate3d(0, ${progress * -35}px, 0)`;
    }

    /*
      Hero content.
    */

    const content =
      $(".hero-content", hero);

    if (content) {
      content.style.transform =
        `translate3d(0, ${progress * -45}px, 0)`;

      content.style.opacity =
        String(
          clamp(1 - progress * 1.15)
        );
    }

    /*
      Food scene.
    */

    const food =
      $(".hero-food-scene", hero);

    if (food) {
      const y =
        progress * -90;

      const scale =
        1 + progress * 0.13;

      food.style.transform =
        `translate3d(0, ${y}px, 0) scale(${scale})`;

      food.style.opacity =
        String(
          clamp(1 - progress * 1.2)
        );
    }

    /*
      Bottom interface fades.
    */

    const bottom =
      $(".hero-bottom", hero);

    if (bottom) {
      bottom.style.opacity =
        String(
          clamp(1 - progress * 2)
        );
    }
  }


  /* ============================================================
     POINTER PARALLAX
  ============================================================ */

  function initPointer() {
    if (coarsePointer) return;

    window.addEventListener(
      "pointermove",
      event => {
        state.mouseX =
          event.clientX /
          state.viewportWidth -
          0.5;

        state.mouseY =
          event.clientY /
          state.viewportHeight -
          0.5;

        requestFrame();
      },
      { passive: true }
    );
  }


  function updatePointerSmoothing() {
    state.smoothMouseX = lerp(
      state.smoothMouseX,
      state.mouseX,
      reducedMotion ? 1 : 0.08
    );

    state.smoothMouseY = lerp(
      state.smoothMouseY,
      state.mouseY,
      reducedMotion ? 1 : 0.08
    );
  }


  function updateDepth() {
    if (coarsePointer) return;

    updatePointerSmoothing();

    const hero =
      $('[data-scene="hero"]');

    if (!hero) return;

    const content =
      $(".hero-content", hero);

    const food =
      $(".hero-food-scene", hero);

    const light =
      $(".hero-light", hero);

    if (content) {
      content.style.transform =
        `translate3d(
          ${state.smoothMouseX * -12}px,
          ${state.smoothMouseY * -8}px,
          0
        )`;
    }

    if (food) {
      food.style.setProperty(
        "--mouse-x",
        `${state.smoothMouseX * 22}px`
      );

      food.style.setProperty(
        "--mouse-y",
        `${state.smoothMouseY * 18}px`
      );
    }

    if (light) {
      light.style.transform =
        `translate3d(
          ${state.smoothMouseX * 40}px,
          ${state.smoothMouseY * 40}px,
          0
        )`;
    }

    /*
      Generic data-depth layers.
    */

    $$("[data-depth]").forEach(
      element => {
        const depth =
          parseFloat(
            element.dataset.depth || "1"
          );

        const x =
          state.smoothMouseX *
          depth *
          5;

        const y =
          state.smoothMouseY *
          depth *
          5;

        element.style.setProperty(
          "--pointer-depth-x",
          `${x}px`
        );

        element.style.setProperty(
          "--pointer-depth-y",
          `${y}px`
        );
      }
    );
  }


  /* ============================================================
     REVEAL SYSTEM
  ============================================================ */

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
            if (!entry.isIntersecting) {
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
          threshold: 0.12,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );

    elements.forEach(
      element =>
        observer.observe(element)
    );
  }


  /* ============================================================
     SCENE ACTIVATION
  ============================================================ */

  function initScenes() {
    const scenes =
      $$(".scene");

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
          threshold: 0.15
        }
      );

    scenes.forEach(scene =>
      observer.observe(scene)
    );
  }


  /* ============================================================
     TABLE STORY
  ============================================================ */

  function initTableStory() {
    const table =
      $('[data-scene="table"]');

    if (!table) return;

    const items =
      $$(".table-story-item", table);

    if (!items.length) return;

    /*
      Clicking a story item activates it.
    */

    items.forEach(
      (item, index) => {
        item.addEventListener(
          "click",
          () =>
            activateStory(
              index,
              items
            )
        );
      }
    );

    /*
      Automatic activation based on
      scroll position.
    */

    window.addEventListener(
      "scroll",
      () => {
        const rect =
          table.getBoundingClientRect();

        const progress = clamp(
          (state.viewportHeight -
            rect.top) /
          (
            state.viewportHeight +
            rect.height
          )
        );

        const index = Math.min(
          items.length - 1,
          Math.floor(
            progress *
            items.length
          )
        );

        activateStory(
          index,
          items,
          false
        );
      },
      { passive: true }
    );
  }


  function activateStory(
    index,
    items,
    animate = true
  ) {
    items.forEach(
      (item, itemIndex) => {
        item.classList.toggle(
          "is-active",
          itemIndex === index
        );
      }
    );

    if (animate) {
      const active =
        items[index];

      active.scrollIntoView({
        behavior:
          reducedMotion
            ? "auto"
            : "smooth",
        block: "center"
      });
    }
  }


  function updateTable() {
    const table =
      $('[data-scene="table"]');

    if (!table) return;

    const rect =
      table.getBoundingClientRect();

    if (
      rect.bottom < -200 ||
      rect.top >
      state.viewportHeight + 200
    ) {
      return;
    }

    const image =
      $(".table-image-wrap", table);

    if (!image) return;

    const progress = clamp(
      (
        state.viewportHeight -
        rect.top
      ) /
      (
        state.viewportHeight +
        rect.height
      )
    );

    image.style.setProperty(
      "--table-progress",
      progress.toFixed(4)
    );
  }


  /* ============================================================
     MENU ENGINE
  ============================================================ */

  function initMenu() {
    const showcase =
      $("[data-dish-showcase]");

    if (!showcase) return;

    const dishes =
      $$(".dish-slide", showcase);

    if (!dishes.length) return;

    /*
      Previous / next controls.
    */

    const previous =
      $("[data-dish-prev]");

    const next =
      $("[data-dish-next]");

    if (previous) {
      previous.addEventListener(
        "click",
        () =>
          changeDish(-1)
      );
    }

    if (next) {
      next.addEventListener(
        "click",
        () =>
          changeDish(1)
      );
    }

    /*
      Clicking a dish activates it.
    */

    dishes.forEach(
      (dish, index) => {
        dish.setAttribute(
          "tabindex",
          "0"
        );

        dish.addEventListener(
          "click",
          () => {
            activateDish(
              index,
              dishes
            );
          }
        );

        dish.addEventListener(
          "keydown",
          event => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              activateDish(
                index,
                dishes
              );
            }

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

    /*
      Touch / swipe.
    */

    let startX = 0;
    let startY = 0;

    showcase.addEventListener(
      "touchstart",
      event => {
        const touch =
          event.changedTouches[0];

        startX = touch.clientX;
        startY = touch.clientY;
      },
      { passive: true }
    );

    showcase.addEventListener(
      "touchend",
      event => {
        const touch =
          event.changedTouches[0];

        const deltaX =
          touch.clientX - startX;

        const deltaY =
          touch.clientY - startY;

        if (
          Math.abs(deltaX) >
            50 &&
          Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {
          if (deltaX < 0) {
            changeDish(1);
          } else {
            changeDish(-1);
          }
        }
      },
      { passive: true }
    );

    /*
      Wheel navigation when menu is
      prominently visible.
    */

    let wheelLocked = false;

    showcase.addEventListener(
      "wheel",
      event => {
        if (
          wheelLocked ||
          Math.abs(event.deltaY) <
          Math.abs(event.deltaX)
        ) {
          return;
        }

        const rect =
          showcase.getBoundingClientRect();

        const visible =
          rect.top <
            state.viewportHeight * 0.75 &&
          rect.bottom >
            state.viewportHeight * 0.25;

        if (!visible) return;

        wheelLocked = true;

        changeDish(
          event.deltaY > 0
            ? 1
            : -1
        );

        window.setTimeout(
          () => {
            wheelLocked = false;
          },
          650
        );
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

    const nextIndex =
      (
        state.menuIndex +
        direction +
        dishes.length
      ) % dishes.length;

    activateDish(
      nextIndex,
      dishes
    );
  }


  function activateDish(
    index,
    dishes,
    animate = true
  ) {
    if (
      state.menuBusy &&
      animate
    ) {
      return;
    }

    state.menuIndex = index;

    if (animate) {
      state.menuBusy = true;

      window.setTimeout(
        () => {
          state.menuBusy = false;
        },
        reducedMotion ? 100 : 600
      );
    }

    dishes.forEach(
      (dish, dishIndex) => {
        dish.classList.remove(
          "is-active",
          "is-before",
          "is-after"
        );

        if (dishIndex === index) {
          dish.classList.add(
            "is-active"
          );
        } else if (
          dishIndex < index
        ) {
          dish.classList.add(
            "is-before"
          );
        } else {
          dish.classList.add(
            "is-after"
          );
        }
      }
    );

    updateDishProgress(
      index,
      dishes.length
    );
  }


  function updateDishProgress(
    index,
    total
  ) {
    const progress =
      $("[data-dish-progress]");

    if (!progress) return;

    const amount =
      total <= 1
        ? 1
        : (index + 1) / total;

    progress.style.transform =
      `scaleX(${amount})`;
  }


  /* ============================================================
     BAR / COCKTAIL CABINET
  ============================================================ */

  function initCocktails() {
    const cabinet =
      $("[data-cocktail-cabinet]");

    if (!cabinet) return;

    const cards =
      $$(".cocktail-card", cabinet);

    if (!cards.length) return;

    cards.forEach(
      (card, index) => {
        card.setAttribute(
          "tabindex",
          "0"
        );

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
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              activateCocktail(
                index,
                cards
              );
            }
          }
        );
      }
    );

    let wheelLocked = false;

    cabinet.addEventListener(
      "wheel",
      event => {
        if (wheelLocked) return;

        const rect =
          cabinet.getBoundingClientRect();

        const visible =
          rect.top <
            state.viewportHeight * 0.8 &&
          rect.bottom >
            state.viewportHeight * 0.2;

        if (!visible) return;

        wheelLocked = true;

        const direction =
          event.deltaY > 0
            ? 1
            : -1;

        activateCocktail(
          (
            state.cocktailIndex +
            direction +
            cards.length
          ) % cards.length,
          cards
        );

        window.setTimeout(
          () => {
            wheelLocked = false;
          },
          650
        );
      },
      { passive: true }
    );

    activateCocktail(
      0,
      cards,
      false
    );
  }


  function activateCocktail(
    index,
    cards,
    animate = true
  ) {
    state.cocktailIndex = index;

    cards.forEach(
      (card, cardIndex) => {
        card.classList.remove(
          "is-active",
          "is-before",
          "is-after"
        );

        if (cardIndex === index) {
          card.classList.add(
            "is-active"
          );
        } else if (
          cardIndex < index
        ) {
          card.classList.add(
            "is-before"
          );
        } else {
          card.classList.add(
            "is-after"
          );
        }
      }
    );
  }


  /* ============================================================
     GALLERY
  ============================================================ */

  function initGallery() {
    const gallery =
      $("[data-horizontal-gallery]");

    if (!gallery) return;

    /*
      Pointer drag.
    */

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

        const distance =
          event.clientX -
          state.galleryStartX;

        gallery.scrollLeft =
          state.galleryStartScroll -
          distance;
      }
    );

    const stopDrag = () => {
      state.galleryDragging = false;

      gallery.classList.remove(
        "is-dragging"
      );
    };

    gallery.addEventListener(
      "pointerup",
      stopDrag
    );

    gallery.addEventListener(
      "pointercancel",
      stopDrag
    );

    gallery.addEventListener(
      "pointerleave",
      event => {
        if (
          event.pointerType ===
          "mouse"
        ) {
          stopDrag();
        }
      }
    );
  }


  function updateGallery() {
    const gallery =
      $("[data-horizontal-gallery]");

    if (!gallery) return;

    const frames =
      $$(".gallery-frame", gallery);

    if (!frames.length) return;

    const rect =
      gallery.getBoundingClientRect();

    if (
      rect.bottom < -100 ||
      rect.top >
      state.viewportHeight + 100
    ) {
      return;
    }

    const progress = clamp(
      (
        state.viewportHeight -
        rect.top
      ) /
      (
        state.viewportHeight +
        rect.height
      )
    );

    frames.forEach(
      (frame, index) => {
        const depth =
          parseFloat(
            frame.dataset.galleryDepth ||
            index + 1
          );

        const movement =
          (
            progress -
            0.5
          ) *
          depth *
          12;

        frame.style.setProperty(
          "--gallery-depth-y",
          `${movement}px`
        );
      }
    );
  }


  /* ============================================================
     DINNER
  ============================================================ */

  function updateDinner() {
    const dinner =
      $('[data-scene="dinner"]');

    if (!dinner) return;

    const rect =
      dinner.getBoundingClientRect();

    const progress = clamp(
      (
        state.viewportHeight -
        rect.top
      ) /
      (
        state.viewportHeight +
        rect.height
      )
    );

    const image =
      $(".dinner-image", dinner);

    const content =
      $(".dinner-content", dinner);

    if (image) {
      const scale =
        lerp(
          1.16,
          1,
          progress
        );

      const y =
        lerp(
          80,
          0,
          progress
        );

      image.style.transform =
        `translate3d(0, ${y}px, 0) scale(${scale})`;
    }

    if (content) {
      const y =
        lerp(
          70,
          0,
          progress
        );

      content.style.transform =
        `translate3d(0, ${y}px, 0)`;

      content.style.opacity =
        String(
          clamp(
            progress * 1.7
          )
        );
    }
  }


  /* ============================================================
     EVENTS
  ============================================================ */

  function updateEvents() {
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
      state.viewportHeight
    ) {
      return;
    }

    const progress = clamp(
      (
        state.viewportHeight -
        rect.top
      ) /
      (
        state.viewportHeight +
        rect.height
      )
    );

    image.style.transform =
      `translate3d(0, ${
        (progress - 0.5) * -60
      }px, 0) scale(1.08)`;
  }


  /* ============================================================
     VISIT
  ============================================================ */

  function updateVisit() {
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
      state.viewportHeight
    ) {
      return;
    }

    const progress = clamp(
      (
        state.viewportHeight -
        rect.top
      ) /
      (
        state.viewportHeight +
        rect.height
      )
    );

    background.style.transform =
      `translate3d(0, ${
        (progress - 0.5) * -50
      }px, 0) scale(1.06)`;
  }


  /* ============================================================
     MAGNETIC BUTTONS
  ============================================================ */

  function initMagneticButtons() {
    if (coarsePointer) return;

    const buttons =
      $$("[data-magnetic]");

    buttons.forEach(button => {
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

          const strength =
            0.16;

          button.style.transform =
            `translate3d(
              ${x * strength}px,
              ${y * strength}px,
              0
            )`;
        }
      );

      button.addEventListener(
        "pointerleave",
        () => {
          button.style.transform =
            "";
        }
      );
    });
  }


  /* ============================================================
     CUSTOM CURSOR
  ============================================================ */

  function initCursor() {
    if (coarsePointer) return;

    const cursor =
      $(".cursor-system");

    if (!cursor) return;

    document.body.classList.add(
      "custom-cursor-enabled"
    );

    document.addEventListener(
      "pointerover",
      event => {
        const interactive =
          event.target.closest(
            "a, button, .dish-slide, .cocktail-card"
          );

        if (interactive) {
          cursor.classList.add(
            "is-hovering"
          );
        }
      }
    );

    document.addEventListener(
      "pointerout",
      event => {
        const interactive =
          event.target.closest(
            "a, button, .dish-slide, .cocktail-card"
          );

        if (interactive) {
          cursor.classList.remove(
            "is-hovering"
          );
        }
      }
    );
  }


  function updateCursor() {
    if (coarsePointer) return;

    const cursor =
      $(".cursor-system");

    if (!cursor) return;

    state.cursorX = lerp(
      state.cursorX,
      state.mouseX *
        state.viewportWidth +
        state.viewportWidth / 2,
      0.18
    );

    state.cursorY = lerp(
      state.cursorY,
      state.mouseY *
        state.viewportHeight +
        state.viewportHeight / 2,
      0.18
    );

    cursor.style.transform =
      `translate3d(
        ${state.cursorX}px,
        ${state.cursorY}px,
        0
      )`;
  }


  /* ============================================================
     MOBILE NAVIGATION
  ============================================================ */

  function initMobileNavigation() {
    const toggle =
      $("[data-menu-toggle]");

    const menu =
      $("[data-mobile-menu]");

    if (!toggle || !menu) return;

    toggle.addEventListener(
      "click",
      () => {
        const isOpen =
          document.body.classList.toggle(
            "mobile-menu-open"
          );

        toggle.setAttribute(
          "aria-expanded",
          isOpen
            ? "true"
            : "false"
        );

        toggle.setAttribute(
          "aria-label",
          isOpen
            ? "Close navigation"
            : "Open navigation"
        );
      }
    );

    $$(
      "a",
      menu
    ).forEach(link => {
      link.addEventListener(
        "click",
        () => {
          document.body.classList.remove(
            "mobile-menu-open"
          );

          toggle.setAttribute(
            "aria-expanded",
            "false"
          );

          toggle.setAttribute(
            "aria-label",
            "Open navigation"
          );
        }
      );
    });
  }


  /* ============================================================
     SMOOTH INTERNAL LINKS
  ============================================================ */

  function initSmoothLinks() {
    $$(
      'a[href^="#"]'
    ).forEach(link => {
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
                : "smooth",
            block: "start"
          });
        }
      );
    });
  }


  /* ============================================================
     IMAGE LOAD STATES
  ============================================================ */

  function initImages() {
    const images =
      $$("img");

    images.forEach(
      image => {
        image.setAttribute(
          "decoding",
          "async"
        );

        if (
          image.complete
        ) {
          image.classList.add(
            "is-loaded"
          );
          return;
        }

        image.addEventListener(
          "load",
          () => {
            image.classList.add(
              "is-loaded"
            );
          },
          { once: true }
        );

        image.addEventListener(
          "error",
          () => {
            image.classList.add(
              "is-error"
            );
          },
          { once: true }
        );
      }
    );
  }


  /* ============================================================
     RESIZE
  ============================================================ */

  function initResize() {
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(
          state.resizeTimer
        );

        state.resizeTimer =
          setTimeout(() => {
            updateViewportVariables();
            requestFrame();
          }, 120);
      },
      { passive: true }
    );
  }


  /* ============================================================
     PAGE VISIBILITY
  ============================================================ */

  function initVisibility() {
    document.addEventListener(
      "visibilitychange",
      () => {
        state.pageVisible =
          !document.hidden;

        if (state.pageVisible) {
          requestFrame();
        }
      }
    );
  }


  /* ============================================================
     ESCAPE
  ============================================================ */

  function initEscape() {
    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key !== "Escape"
        ) {
          return;
        }

        document.body.classList.remove(
          "mobile-menu-open"
        );

        const toggle =
          $("[data-menu-toggle]");

        if (toggle) {
          toggle.setAttribute(
            "aria-expanded",
            "false"
          );
        }
      }
    );
  }


  /* ============================================================
     KEYBOARD MENU
  ============================================================ */

  function initGlobalMenuKeyboard() {
    document.addEventListener(
      "keydown",
      event => {
        const menu =
          $('[data-scene="menu"]');

        if (!menu) return;

        const rect =
          menu.getBoundingClientRect();

        const visible =
          rect.top <
            state.viewportHeight &&
          rect.bottom > 0;

        if (!visible) return;

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


  /* ============================================================
     INITIALIZATION
  ============================================================ */

  function init() {

    /*
      Base state
    */

    document.body.classList.add(
      "js-enabled"
    );

    /*
      Experience
    */

    initCurtain();

    /*
      Navigation
    */

    initHeader();
    initMobileNavigation();
    initSmoothLinks();
    initEscape();

    /*
      Scenes
    */

    initScenes();
    initReveal();

    /*
      Hero
    */

    initPointer();

    /*
      Story
    */

    initTableStory();

    /*
      Menu
    */

    initMenu();
    initGlobalMenuKeyboard();

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

    initMagneticButtons();

    /*
      Cursor
    */

    initCursor();

    /*
      Images
    */

    initImages();

    /*
      Browser state
    */

    initResize();
    initVisibility();

    /*
      First render
    */

    requestFrame();

    /*
      Recalculate after fonts/images
      have settled.
    */

    window.setTimeout(
      requestFrame,
      300
    );

    window.setTimeout(
      requestFrame,
      1000
    );

    console.log(
      "%c MORGAN'S ON MAIN ",
      "background:#111;color:#f2eadf;padding:8px 12px;font-weight:700;"
    );

    console.log(
      "%c Cinematic Experience Engine — ONLINE ",
      "color:#888;"
    );
  }


  /* ============================================================
     START
  ============================================================ */

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

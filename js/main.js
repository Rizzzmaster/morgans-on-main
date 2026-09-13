/* ============================================================
   MORGAN'S ON MAIN
   CINEMATIC EXPERIENCE ENGINE
   Version 2.0
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     HELPERS
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

  const touchDevice = window.matchMedia(
    "(pointer: coarse)"
  ).matches;


  /* ============================================================
     STATE
  ============================================================ */

  const state = {
    scrollY: window.scrollY,
    previousScrollY: window.scrollY,

    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,

    mouseX: 0,
    mouseY: 0,

    smoothMouseX: 0,
    smoothMouseY: 0,

    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,

    direction: "down",

    menuIndex: 0,
    cocktailIndex: 0,

    menuLocked: false,
    cocktailLocked: false,

    galleryDragging: false,
    galleryStartX: 0,
    galleryStartScroll: 0,

    visible: true,

    raf: null,

    resizeTimer: null
  };


  /* ============================================================
     ROOT VARIABLES
  ============================================================ */

  function updateViewport() {
    state.viewportWidth = window.innerWidth;
    state.viewportHeight = window.innerHeight;

    document.documentElement.style.setProperty(
      "--viewport-width",
      `${state.viewportWidth}px`
    );

    document.documentElement.style.setProperty(
      "--viewport-height",
      `${state.viewportHeight}px`
    );
  }

  updateViewport();


  /* ============================================================
     RAF
  ============================================================ */

  function requestFrame() {
    if (state.raf || !state.visible) return;

    state.raf = requestAnimationFrame(render);
  }

  function render() {
    state.raf = null;

    if (!state.visible) return;

    state.scrollY = window.scrollY;

    updateScrollDirection();
    updateGlobalScroll();
    updateHeader();
    updateHero();
    updatePointerDepth();
    updateTable();
    updateDinner();
    updateEvents();
    updateVisit();
    updateGallery();
    updateCursor();

    if (!reducedMotion) {
      requestFrame();
    }
  }


  /* ============================================================
     SCROLL DIRECTION
  ============================================================ */

  function updateScrollDirection() {
    if (state.scrollY > state.previousScrollY) {
      state.direction = "down";
    } else if (
      state.scrollY < state.previousScrollY
    ) {
      state.direction = "up";
    }

    state.previousScrollY = state.scrollY;
  }


  /* ============================================================
     GLOBAL SCROLL
  ============================================================ */

  function updateGlobalScroll() {
    const maxScroll =
      document.documentElement.scrollHeight -
      state.viewportHeight;

    const progress =
      maxScroll > 0
        ? clamp(state.scrollY / maxScroll)
        : 0;

    document.documentElement.style.setProperty(
      "--scroll-progress",
      progress
    );

    document.documentElement.style.setProperty(
      "--scroll-position",
      `${state.scrollY}px`
    );
  }


  /* ============================================================
     EXPERIENCE CURTAIN
     ONLY ONE TIMEOUT
  ============================================================ */

  function initCurtain() {
    const curtain = $(".experience-curtain");

    if (!curtain) return;

    document.body.classList.add(
      "experience-loading"
    );

    requestAnimationFrame(() => {
      curtain.classList.add("is-ready");
    });

    const finish = () => {
      curtain.classList.add("is-exiting");

      curtain.style.pointerEvents = "none";

      document.body.classList.remove(
        "experience-loading"
      );

      document.body.classList.add(
        "experience-ready"
      );

      /*
        Give the CSS exit animation time to finish.
        There is only ONE timeout for the entire loader.
      */

      setTimeout(() => {
        curtain.classList.add("is-hidden");
        curtain.style.display = "none";
      }, reducedMotion ? 100 : 900);
    };

    /*
      One single loader delay.
    */

    setTimeout(
      finish,
      reducedMotion ? 100 : 900
    );
  }


  /* ============================================================
     HEADER
  ============================================================ */

  function initHeader() {
    const header = $("[data-header]");

    if (!header) return;

    window.addEventListener(
      "scroll",
      requestFrame,
      { passive: true }
    );
  }

  function updateHeader() {
    const header = $("[data-header]");

    if (!header) return;

    header.classList.toggle(
      "is-scrolled",
      state.scrollY > 50
    );

    /*
      Don't hide the header aggressively on mobile.
    */

    if (state.viewportWidth <= 900) {
      header.classList.remove(
        "is-hidden"
      );

      return;
    }

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
     MOBILE MENU
  ============================================================ */

  function initMobileMenu() {
    const toggle =
      $("[data-menu-toggle]");

    const menu =
      $("[data-mobile-menu]");

    if (!toggle || !menu) return;

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

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

        toggle.setAttribute(
          "aria-label",
          open
            ? "Close navigation"
            : "Open navigation"
        );
      }
    );

    $$("a", menu).forEach(link => {
      link.addEventListener(
        "click",
        () => closeMobileMenu()
      );
    });
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

      toggle.setAttribute(
        "aria-label",
        "Open navigation"
      );
    }
  }


  /* ============================================================
     HERO
  ============================================================ */

  function updateHero() {
    const hero =
      $('[data-scene="hero"]');

    if (!hero) return;

    const rect =
      hero.getBoundingClientRect();

    const progress =
      clamp(
        -rect.top /
        Math.max(rect.height, 1)
      );

    hero.style.setProperty(
      "--hero-progress",
      progress
    );

    /*
      Backdrop
    */

    const backdrop =
      $(".hero-backdrop", hero);

    if (backdrop) {
      const y =
        progress * -55;

      const scale =
        1 + progress * 0.06;

      backdrop.style.transform =
        `translate3d(0, ${y}px, 0) scale(${scale})`;
    }

    /*
      Atmosphere
    */

    const atmosphere =
      $(".hero-atmosphere", hero);

    if (atmosphere) {
      atmosphere.style.transform =
        `translate3d(
          0,
          ${progress * -30}px,
          0
        )`;
    }

    /*
      Content
    */

    const content =
      $(".hero-content", hero);

    if (content) {
      const y =
        progress * -35;

      const opacity =
        clamp(
          1 - progress * 1.15
        );

      content.style.transform =
        `translate3d(0, ${y}px, 0)`;

      content.style.opacity =
        opacity;
    }

    /*
      Food
    */

    const food =
      $(".hero-food-scene", hero);

    if (food) {
      const y =
        progress * -65;

      const scale =
        1 + progress * 0.08;

      food.style.transform =
        `translate3d(
          var(--mouse-x, 0px),
          calc(${y}px + var(--mouse-y, 0px)),
          0
        ) scale(${scale})`;

      food.style.opacity =
        clamp(
          1 - progress * 1.25
        );
    }

    /*
      Bottom text
    */

    const bottom =
      $(".hero-bottom", hero);

    if (bottom) {
      bottom.style.opacity =
        clamp(
          1 - progress * 2
        );
    }
  }


  /* ============================================================
     POINTER
  ============================================================ */

  function initPointer() {
    if (touchDevice) return;

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


  function updatePointerDepth() {
    if (touchDevice) return;

    state.smoothMouseX =
      lerp(
        state.smoothMouseX,
        state.mouseX,
        0.08
      );

    state.smoothMouseY =
      lerp(
        state.smoothMouseY,
        state.mouseY,
        0.08
      );

    /*
      Hero light
    */

    const light =
      $("[data-cursor-light]");

    if (light) {
      light.style.transform =
        `translate3d(
          ${state.smoothMouseX * 45}px,
          ${state.smoothMouseY * 45}px,
          0
        )`;
    }

    /*
      Generic depth layers
    */

    $$("[data-depth]").forEach(
      element => {
        const depth =
          parseFloat(
            element.dataset.depth || 1
          );

        element.style.setProperty(
          "--pointer-depth-x",
          `${state.smoothMouseX * depth * 7}px`
        );

        element.style.setProperty(
          "--pointer-depth-y",
          `${state.smoothMouseY * depth * 7}px`
        );
      }
    );

    /*
      Hero food custom movement
    */

    const food =
      $(".hero-food-scene");

    if (food) {
      food.style.setProperty(
        "--mouse-x",
        `${state.smoothMouseX * 20}px`
      );

      food.style.setProperty(
        "--mouse-y",
        `${state.smoothMouseY * 16}px`
      );
    }
  }


  /* ============================================================
     SCENE OBSERVER
  ============================================================ */

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
          threshold: 0.12
        }
      );

    scenes.forEach(scene =>
      observer.observe(scene)
    );
  }


  /* ============================================================
     REVEALS
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
            "0px 0px -7% 0px"
        }
      );

    elements.forEach(
      element =>
        observer.observe(element)
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

    items.forEach(
      (item, index) => {
        item.addEventListener(
          "click",
          () => {
            activateStory(
              index,
              items
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

    const items =
      $$(".table-story-item", table);

    if (!items.length) return;

    const rect =
      table.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top >
      state.viewportHeight
    ) {
      return;
    }

    const progress =
      clamp(
        (
          state.viewportHeight -
          rect.top
        ) /
        (
          state.viewportHeight +
          rect.height
        )
      );

    const index =
      Math.min(
        items.length - 1,
        Math.floor(
          progress * items.length
        )
      );

    activateStory(
      index,
      items,
      false
    );

    const image =
      $("[data-pinned-image]", table);

    if (image) {
      image.style.setProperty(
        "--table-progress",
        progress
      );
    }
  }


  function activateStory(
    index,
    items,
    scrollIntoView = false
  ) {
    items.forEach(
      (item, itemIndex) => {
        item.classList.toggle(
          "is-active",
          itemIndex === index
        );
      }
    );

    if (
      scrollIntoView &&
      !reducedMotion
    ) {
      items[index].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }


  /* ============================================================
     DISH MENU
  ============================================================ */

  function initMenu() {
    const showcase =
      $("[data-dish-showcase]");

    if (!showcase) return;

    const dishes =
      $$(".dish-slide", showcase);

    if (!dishes.length) return;

    const previous =
      $("[data-dish-prev]");

    const next =
      $("[data-dish-next]");

    if (previous) {
      previous.addEventListener(
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

    /*
      Clickable slides
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
              event.key ===
                "ArrowRight"
            ) {
              event.preventDefault();
              changeDish(1);
            }

            if (
              event.key ===
                "ArrowLeft"
            ) {
              event.preventDefault();
              changeDish(-1);
            }

            if (
              event.key === "Enter"
            ) {
              activateDish(
                index,
                dishes
              );
            }
          }
        );
      }
    );

    /*
      Touch swipe
    */

    let touchStartX = 0;
    let touchStartY = 0;

    showcase.addEventListener(
      "touchstart",
      event => {
        const touch =
          event.changedTouches[0];

        touchStartX =
          touch.clientX;

        touchStartY =
          touch.clientY;
      },
      { passive: true }
    );

    showcase.addEventListener(
      "touchend",
      event => {
        const touch =
          event.changedTouches[0];

        const deltaX =
          touch.clientX -
          touchStartX;

        const deltaY =
          touch.clientY -
          touchStartY;

        if (
          Math.abs(deltaX) > 50 &&
          Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {
          changeDish(
            deltaX < 0 ? 1 : -1
          );
        }
      },
      { passive: true }
    );

    /*
      Wheel
    */

    let wheelCooldown = false;

    showcase.addEventListener(
      "wheel",
      event => {
        if (wheelCooldown) return;

        const rect =
          showcase.getBoundingClientRect();

        const visible =
          rect.top <
            state.viewportHeight * 0.8 &&
          rect.bottom >
            state.viewportHeight * 0.2;

        if (!visible) return;

        if (
          Math.abs(event.deltaY) <
          Math.abs(event.deltaX)
        ) {
          return;
        }

        wheelCooldown = true;

        changeDish(
          event.deltaY > 0
            ? 1
            : -1
        );

        setTimeout(
          () => {
            wheelCooldown = false;
          },
          500
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
      $$(
        ".dish-slide"
      );

    if (!dishes.length) return;

    if (state.menuLocked) return;

    const nextIndex =
      (
        state.menuIndex +
        direction +
        dishes.length
      ) %
      dishes.length;

    activateDish(
      nextIndex,
      dishes
    );

    state.menuLocked = true;

    setTimeout(
      () => {
        state.menuLocked = false;
      },
      450
    );
  }


  function activateDish(
    index,
    dishes,
    animate = true
  ) {
    state.menuIndex = index;

    dishes.forEach(
      (dish, dishIndex) => {
        dish.classList.remove(
          "is-active",
          "is-before",
          "is-after"
        );

        if (
          dishIndex === index
        ) {
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

        /*
          Useful CSS variables for
          cinematic positioning.
        */

        let offset =
          dishIndex - index;

        if (
          offset >
          dishes.length / 2
        ) {
          offset -=
            dishes.length;
        }

        if (
          offset <
          -dishes.length / 2
        ) {
          offset +=
            dishes.length;
        }

        const abs =
          Math.min(
            Math.abs(offset),
            3
          );

        dish.style.setProperty(
          "--dish-offset",
          offset
        );

        dish.style.setProperty(
          "--dish-distance",
          abs
        );

        dish.style.setProperty(
          "--dish-index",
          dishIndex
        );
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

    const percentage =
      ((index + 1) / total) * 100;

    progress.style.width =
      `${percentage}%`;

    progress.style.transform =
      `scaleX(1)`;
  }


  /* ============================================================
     COCKTAIL CABINET
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
              event.key === "Enter"
            ) {
              activateCocktail(
                index,
                cards
              );
            }

            if (
              event.key ===
              "ArrowRight"
            ) {
              changeCocktail(1);
            }

            if (
              event.key ===
              "ArrowLeft"
            ) {
              changeCocktail(-1);
            }
          }
        );
      }
    );

    activateCocktail(
      0,
      cards,
      false
    );
  }


  function changeCocktail(direction) {
    const cards =
      $$(".cocktail-card");

    if (!cards.length) return;

    if (state.cocktailLocked) return;

    const nextIndex =
      (
        state.cocktailIndex +
        direction +
        cards.length
      ) %
      cards.length;

    activateCocktail(
      nextIndex,
      cards
    );

    state.cocktailLocked = true;

    setTimeout(
      () => {
        state.cocktailLocked = false;
      },
      500
    );
  }


  function activateCocktail(
    index,
    cards
  ) {
    state.cocktailIndex = index;

    cards.forEach(
      (card, cardIndex) => {
        card.classList.remove(
          "is-active",
          "is-before",
          "is-after"
        );

        if (
          cardIndex === index
        ) {
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

        let offset =
          cardIndex - index;

        card.style.setProperty(
          "--cocktail-offset",
          offset
        );
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
      Mouse / pointer drag
    */

    gallery.addEventListener(
      "pointerdown",
      event => {
        if (
          event.pointerType === "mouse" &&
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

    const stopGalleryDrag = () => {
      state.galleryDragging = false;

      gallery.classList.remove(
        "is-dragging"
      );
    };

    gallery.addEventListener(
      "pointerup",
      stopGalleryDrag
    );

    gallery.addEventListener(
      "pointercancel",
      stopGalleryDrag
    );

    gallery.addEventListener(
      "pointerleave",
      () => {
        if (!touchDevice) {
          stopGalleryDrag();
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

    const progress =
      clamp(
        (
          state.viewportHeight -
          rect.top
        ) /
        (
          state.viewportHeight +
          rect.height
        )
      );

    gallery.style.setProperty(
      "--gallery-progress",
      progress
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
            progress - 0.5
          ) *
          depth *
          20;

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

    if (
      rect.bottom < 0 ||
      rect.top >
        state.viewportHeight
    ) {
      return;
    }

    const progress =
      clamp(
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
        1.12 -
        progress * 0.12;

      const y =
        45 -
        progress * 45;

      image.style.transform =
        `translate3d(
          0,
          ${y}px,
          0
        ) scale(${scale})`;
    }

    if (content) {
      const y =
        50 -
        progress * 50;

      content.style.transform =
        `translate3d(
          0,
          ${y}px,
          0
        )`;

      content.style.opacity =
        clamp(
          progress * 1.7
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

    const rect =
      section.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top >
        state.viewportHeight
    ) {
      return;
    }

    const progress =
      clamp(
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
      $(".events-image", section);

    if (image) {
      image.style.transform =
        `translate3d(
          0,
          ${(progress - 0.5) * -50}px,
          0
        ) scale(1.05)`;
    }
  }


  /* ============================================================
     VISIT
  ============================================================ */

  function updateVisit() {
    const section =
      $('[data-scene="visit"]');

    if (!section) return;

    const rect =
      section.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top >
        state.viewportHeight
    ) {
      return;
    }

    const progress =
      clamp(
        (
          state.viewportHeight -
          rect.top
        ) /
        (
          state.viewportHeight +
          rect.height
        )
      );

    const background =
      $(".visit-background", section);

    if (background) {
      background.style.transform =
        `translate3d(
          0,
          ${(progress - 0.5) * -40}px,
          0
        ) scale(1.05)`;
    }
  }


  /* ============================================================
     MAGNETIC BUTTONS
  ============================================================ */

  function initMagneticButtons() {
    if (touchDevice) return;

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

          button.style.transform =
            `translate3d(
              ${x * 0.14}px,
              ${y * 0.14}px,
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
    if (touchDevice) return;

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
    if (touchDevice) return;

    const cursor =
      $(".cursor-system");

    if (!cursor) return;

    const targetX =
      state.mouseX *
      state.viewportWidth +
      state.viewportWidth / 2;

    const targetY =
      state.mouseY *
      state.viewportHeight +
      state.viewportHeight / 2;

    state.cursorX =
      lerp(
        state.cursorX,
        targetX,
        0.16
      );

    state.cursorY =
      lerp(
        state.cursorY,
        targetY,
        0.16
      );

    cursor.style.transform =
      `translate3d(
        ${state.cursorX}px,
        ${state.cursorY}px,
        0
      )`;
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
     KEYBOARD
  ============================================================ */

  function initKeyboard() {
    document.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Escape"
        ) {
          closeMobileMenu();
        }

        /*
          Menu keyboard navigation
        */

        if (
          event.key !== "ArrowLeft" &&
          event.key !== "ArrowRight"
        ) {
          return;
        }

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
          event.key === "ArrowLeft"
        ) {
          changeDish(-1);
        }

        if (
          event.key === "ArrowRight"
        ) {
          changeDish(1);
        }
      }
    );
  }


  /* ============================================================
     IMAGES
  ============================================================ */

  function initImages() {
    const images =
      $$("img");

    images.forEach(image => {
      image.setAttribute(
        "decoding",
        "async"
      );

      if (image.complete) {
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
    });
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
          setTimeout(
            () => {
              updateViewport();
              requestFrame();
            },
            100
          );
      },
      { passive: true }
    );
  }


  /* ============================================================
     VISIBILITY
  ============================================================ */

  function initVisibility() {
    document.addEventListener(
      "visibilitychange",
      () => {
        state.visible =
          !document.hidden;

        if (state.visible) {
          requestFrame();
        }
      }
    );
  }


  /* ============================================================
     INITIALIZE
  ============================================================ */

  function init() {
    document.body.classList.add(
      "js-enabled"
    );

    /*
      Loader
    */

    initCurtain();

    /*
      Navigation
    */

    initHeader();
    initMobileMenu();
    initSmoothLinks();
    initKeyboard();

    /*
      Scene system
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
      Food / menu
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
      Interaction
    */

    initMagneticButtons();
    initCursor();

    /*
      Images / browser
    */

    initImages();
    initResize();
    initVisibility();

    /*
      First render
    */

    requestFrame();

    /*
      Re-render once after initial
      browser layout settles.
    */

    requestAnimationFrame(() => {
      requestFrame();
    });

    console.log(
      "%c MORGAN'S ON MAIN ",
      "background:#111;color:#f5eee5;padding:8px 14px;font-weight:bold;"
    );

    console.log(
      "%c CINEMATIC EXPERIENCE ENGINE ",
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

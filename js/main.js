/* ============================================================
   MORGAN'S ON MAIN
   CINEMATIC EXPERIENCE ENGINE
   ------------------------------------------------------------
   Vanilla JS / No Dependencies
   Built for:
   - Cinematic loading
   - Scene activation
   - Scroll choreography
   - Depth / parallax
   - Interactive menu
   - Cocktail switching
   - Gallery reel
   - Magnetic buttons
   - Custom cursor
   - Navigation states
   - Accessibility
   - Reduced motion
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     CORE
     ============================================================ */

  const root = document.documentElement;
  const body = document.body;

  const SELECTORS = {
    loader: "[data-loader]",
    loaderEnter: "[data-enter]",
    scene: "[data-scene]",
    reveal: "[data-reveal]",
    depth: "[data-depth]",
    menuItem: "[data-menu-item]",
    menuTrack: "[data-menu-track]",
    menuCurrent: "[data-menu-current]",
    menuTitle: "[data-menu-title]",
    menuCopy: "[data-menu-copy]",
    menuPrice: "[data-menu-price]",
    menuIngredients: "[data-menu-ingredients]",
    cocktail: "[data-cocktail]",
    cocktailTarget: "[data-cocktail-target]",
    galleryTrack: "[data-gallery-track]",
    magnetic: "[data-magnetic]",
    cursor: "[data-cursor]",
    cursorText: "[data-cursor-text]",
    nav: "[data-nav]",
    progress: "[data-progress]"
  };

  const qs = (selector, scope = document) =>
    scope.querySelector(selector);

  const qsa = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

  const clamp = (value, min = 0, max = 1) =>
    Math.min(Math.max(value, min), max);

  const lerp = (a, b, t) =>
    a + (b - a) * t;

  const mapRange = (value, inMin, inMax, outMin, outMax) => {
    if (inMax === inMin) return outMin;

    const progress = clamp(
      (value - inMin) / (inMax - inMin)
    );

    return lerp(outMin, outMax, progress);
  };

  const isTouch =
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ============================================================
     APPLICATION STATE
     ============================================================ */

  const state = {
    scrollY: window.scrollY,
    targetScrollY: window.scrollY,

    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,

    mouseX: 0,
    mouseY: 0,

    smoothMouseX: 0,
    smoothMouseY: 0,

    pointerInside: false,

    ticking: false,
    raf: null,

    loaderComplete: false,
    pageReady: false,

    activeScene: null,

    menuIndex: 0,
    cocktailIndex: 0,

    lastScrollY: window.scrollY,
    scrollDirection: "down",

    documentHidden: false
  };


  /* ============================================================
     CSS VARIABLE HELPER
     ============================================================ */

  function setVariable(name, value) {
    root.style.setProperty(name, value);
  }


  /* ============================================================
     INITIAL CSS VARIABLES
     ============================================================ */

  setVariable("--scroll-y", "0px");
  setVariable("--scroll-progress", "0");
  setVariable("--mouse-x", "0");
  setVariable("--mouse-y", "0");
  setVariable("--cursor-x", "0px");
  setVariable("--cursor-y", "0px");


  /* ============================================================
     LOADER
     ============================================================ */

  function initLoader() {
    const loader = qs(SELECTORS.loader);

    if (!loader) {
      state.loaderComplete = true;
      state.pageReady = true;
      body.classList.add("is-ready");
      return;
    }

    const enter = qs(SELECTORS.loaderEnter, loader);

    body.classList.add("is-loading");

    const finish = () => {
      if (state.loaderComplete) return;

      state.loaderComplete = true;

      loader.classList.add("is-exiting");

      window.setTimeout(() => {
        loader.classList.add("is-hidden");
        body.classList.remove("is-loading");
        body.classList.add("is-ready");

        state.pageReady = true;

        window.dispatchEvent(
          new CustomEvent("morgan:ready")
        );
      }, reducedMotion ? 50 : 900);
    };

    if (enter) {
      enter.addEventListener("click", finish);
      enter.addEventListener("keydown", event => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          finish();
        }
      });
    }

    /*
      If there is no ENTER button, automatically continue.
    */

    if (!enter) {
      window.setTimeout(
        finish,
        reducedMotion ? 100 : 1800
      );
    }

    /*
      Safety fallback.
      The user should never get trapped behind the loader.
    */

    window.setTimeout(
      finish,
      reducedMotion ? 1200 : 6500
    );
  }


  /* ============================================================
     PAGE VISIBILITY
     ============================================================ */

  function initVisibility() {
    document.addEventListener(
      "visibilitychange",
      () => {
        state.documentHidden = document.hidden;

        if (document.hidden) {
          cancelAnimationFrame(state.raf);
          state.raf = null;
        } else {
          requestFrame();
        }
      }
    );
  }


  /* ============================================================
     SCROLL STATE
     ============================================================ */

  function handleScroll() {
    state.targetScrollY = window.scrollY;

    if (state.targetScrollY > state.lastScrollY) {
      state.scrollDirection = "down";
    } else if (state.targetScrollY < state.lastScrollY) {
      state.scrollDirection = "up";
    }

    state.lastScrollY = state.targetScrollY;

    requestFrame();
  }


  function requestFrame() {
    if (state.raf || state.documentHidden) return;

    state.raf = requestAnimationFrame(animationFrame);
  }


  /* ============================================================
     MAIN ANIMATION LOOP
     ============================================================ */

  function animationFrame() {
    state.raf = null;

    if (state.documentHidden) return;

    state.scrollY = state.targetScrollY;

    updateGlobalScroll();
    updateNavigation();
    updateHero();
    updateDepthLayers();
    updateTableScene();
    updateDinnerScene();
    updateGallery();
    updateCursor();

    if (!isTouch) {
      updateMagneticElements();
    }
  }


  /* ============================================================
     GLOBAL SCROLL
     ============================================================ */

  function updateGlobalScroll() {
    const documentHeight =
      document.documentElement.scrollHeight -
      state.viewportHeight;

    const progress =
      documentHeight > 0
        ? clamp(state.scrollY / documentHeight)
        : 0;

    setVariable(
      "--scroll-y",
      `${state.scrollY}px`
    );

    setVariable(
      "--scroll-progress",
      progress.toFixed(4)
    );

    const progressBar = qs(SELECTORS.progress);

    if (progressBar) {
      progressBar.style.transform =
        `scaleX(${progress})`;
    }
  }


  /* ============================================================
     NAVIGATION
     ============================================================ */

  function updateNavigation() {
    const nav = qs(SELECTORS.nav);

    if (!nav) return;

    const compact =
      state.scrollY > state.viewportHeight * 0.35;

    nav.classList.toggle(
      "is-compact",
      compact
    );

    nav.classList.toggle(
      "is-scrolling-down",
      state.scrollDirection === "down" &&
      state.scrollY > 150
    );

    nav.classList.toggle(
      "is-scrolling-up",
      state.scrollDirection === "up"
    );

    if (state.scrollY < 80) {
      nav.classList.remove("is-scrolling-down");
      nav.classList.remove("is-scrolling-up");
    }
  }


  /* ============================================================
     HERO CHOREOGRAPHY
     ============================================================ */

  function updateHero() {
    const hero =
      document.querySelector(
        '[data-scene="hero"]'
      );

    if (!hero) return;

    const rect =
      hero.getBoundingClientRect();

    const progress = clamp(
      -rect.top / Math.max(rect.height, 1)
    );

    hero.style.setProperty(
      "--scene-progress",
      progress.toFixed(4)
    );

    /*
      Background / visual layers.
    */

    const layers =
      qsa("[data-hero-layer]", hero);

    layers.forEach(layer => {
      const speed =
        parseFloat(
          layer.dataset.heroLayer || "0.1"
        );

      const y =
        progress *
        speed *
        -100;

      layer.style.setProperty(
        "--hero-y",
        `${y}px`
      );
    });

    /*
      Hero typography slowly exits.
    */

    const title =
      qs("[data-hero-title]", hero);

    if (title) {
      const translate =
        progress * -70;

      const scale =
        1 - progress * 0.08;

      title.style.setProperty(
        "--hero-title-y",
        `${translate}px`
      );

      title.style.setProperty(
        "--hero-title-scale",
        scale.toFixed(3)
      );
    }

    /*
      Hero visual expands slightly before leaving.
    */

    const visual =
      qs("[data-hero-visual]", hero);

    if (visual) {
      const scale =
        1 + progress * 0.08;

      visual.style.setProperty(
        "--hero-scale",
        scale.toFixed(3)
      );

      visual.style.setProperty(
        "--hero-opacity",
        clamp(1 - progress * 1.15).toFixed(3)
      );
    }
  }


  /* ============================================================
     GLOBAL DEPTH SYSTEM
     ============================================================ */

  function updateDepthLayers() {
    const layers =
      qsa(SELECTORS.depth);

    if (!layers.length) return;

    layers.forEach(layer => {
      const rect =
        layer.getBoundingClientRect();

      if (
        rect.bottom < -100 ||
        rect.top > state.viewportHeight + 100
      ) {
        return;
      }

      const speed =
        parseFloat(
          layer.dataset.depth || "0.1"
        );

      const center =
        rect.top +
        rect.height / 2;

      const distance =
        center -
        state.viewportHeight / 2;

      const movement =
        distance * speed * -0.1;

      layer.style.setProperty(
        "--depth-y",
        `${movement.toFixed(2)}px`
      );
    });
  }


  /* ============================================================
     SCENE OBSERVER
     ============================================================ */

  function initSceneObserver() {
    const scenes =
      qsa(SELECTORS.scene);

    if (!scenes.length) return;

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            entry.target.classList.toggle(
              "is-active",
              entry.isIntersecting
            );

            if (entry.isIntersecting) {
              state.activeScene =
                entry.target.dataset.scene || null;

              entry.target.dispatchEvent(
                new CustomEvent(
                  "morgan:scene-enter",
                  {
                    bubbles: true,
                    detail: {
                      scene:
                        entry.target.dataset.scene
                    }
                  }
                )
              );
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "-10% 0px -10% 0px"
        }
      );

    scenes.forEach(scene =>
      observer.observe(scene)
    );
  }


  /* ============================================================
     REVEAL OBSERVER
     ============================================================ */

  function initRevealObserver() {
    const elements =
      qsa(SELECTORS.reveal);

    if (!elements.length) return;

    if (reducedMotion) {
      elements.forEach(element =>
        element.classList.add("is-visible")
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (
              entry.isIntersecting
            ) {
              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );

    elements.forEach(element =>
      observer.observe(element)
    );
  }


  /* ============================================================
     TABLE / STORY SCENE
     ============================================================ */

  function updateTableScene() {
    const table =
      document.querySelector(
        '[data-scene="table"]'
      );

    if (!table) return;

    const rect =
      table.getBoundingClientRect();

    const progress =
      clamp(
        mapRange(
          state.viewportHeight * 0.9 - rect.top,
          0,
          Math.max(rect.height, 1),
          0,
          1
        )
      );

    table.style.setProperty(
      "--table-progress",
      progress.toFixed(4)
    );

    const stages =
      qsa("[data-table-stage]", table);

    if (!stages.length) return;

    const stageIndex =
      Math.min(
        stages.length - 1,
        Math.floor(
          progress * stages.length
        )
      );

    stages.forEach(
      (stage, index) => {
        stage.classList.toggle(
          "is-active",
          index === stageIndex
        );
      }
    );

    const images =
      qsa("[data-table-image]", table);

    images.forEach(
      (image, index) => {
        const offset =
          (index - stageIndex) * 14;

        const opacity =
          index === stageIndex
            ? 1
            : 0.25;

        image.style.setProperty(
          "--table-image-y",
          `${offset}px`
        );

        image.style.setProperty(
          "--table-image-opacity",
          opacity
        );
      }
    );
  }


  /* ============================================================
     DINNER SCENE
     ============================================================ */

  function updateDinnerScene() {
    const dinner =
      document.querySelector(
        '[data-scene="dinner"]'
      );

    if (!dinner) return;

    const rect =
      dinner.getBoundingClientRect();

    const progress =
      clamp(
        mapRange(
          state.viewportHeight -
          rect.top,
          0,
          Math.max(rect.height, 1),
          0,
          1
        )
      );

    dinner.style.setProperty(
      "--dinner-progress",
      progress.toFixed(4)
    );

    const image =
      qs("[data-dinner-image]", dinner);

    if (image) {
      const scale =
        lerp(1.18, 1, progress);

      const y =
        lerp(80, 0, progress);

      image.style.setProperty(
        "--dinner-scale",
        scale.toFixed(3)
      );

      image.style.setProperty(
        "--dinner-y",
        `${y}px`
      );
    }

    const title =
      qs("[data-dinner-title]", dinner);

    if (title) {
      const y =
        lerp(70, 0, progress);

      const opacity =
        clamp(progress * 1.8);

      title.style.setProperty(
        "--dinner-title-y",
        `${y}px`
      );

      title.style.setProperty(
        "--dinner-title-opacity",
        opacity.toFixed(3)
      );
    }
  }


  /* ============================================================
     MENU ENGINE
     ============================================================ */

  function initMenu() {
    const items =
      qsa(SELECTORS.menuItem);

    if (!items.length) return;

    items.forEach(
      (item, index) => {
        item.setAttribute(
          "tabindex",
          "0"
        );

        item.addEventListener(
          "click",
          () => activateMenuItem(index)
        );

        item.addEventListener(
          "keydown",
          event => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              activateMenuItem(index);
            }

            if (
              event.key === "ArrowRight" ||
              event.key === "ArrowDown"
            ) {
              event.preventDefault();

              activateMenuItem(
                (index + 1) %
                items.length
              );
            }

            if (
              event.key === "ArrowLeft" ||
              event.key === "ArrowUp"
            ) {
              event.preventDefault();

              activateMenuItem(
                (index - 1 + items.length) %
                items.length
              );
            }
          }
        );
      }
    );

    activateMenuItem(0);
  }


  function activateMenuItem(index) {
    const items =
      qsa(SELECTORS.menuItem);

    if (!items.length) return;

    index =
      (index + items.length) %
      items.length;

    state.menuIndex = index;

    const item = items[index];

    items.forEach(
      (element, itemIndex) => {
        element.classList.toggle(
          "is-active",
          itemIndex === index
        );

        element.setAttribute(
          "aria-selected",
          itemIndex === index
            ? "true"
            : "false"
        );
      }
    );

    const title =
      item.dataset.title ||
      item.getAttribute("data-menu-title");

    const copy =
      item.dataset.copy ||
      item.getAttribute("data-menu-copy");

    const price =
      item.dataset.price ||
      item.getAttribute("data-menu-price");

    const ingredients =
      item.dataset.ingredients ||
      item.getAttribute("data-menu-ingredients");

    const scope =
      item.closest(
        '[data-scene="menu"]'
      ) || document;

    const titleTarget =
      qs(SELECTORS.menuTitle, scope);

    const copyTarget =
      qs(SELECTORS.menuCopy, scope);

    const priceTarget =
      qs(SELECTORS.menuPrice, scope);

    const ingredientsTarget =
      qs(
        SELECTORS.menuIngredients,
        scope
      );

    if (titleTarget && title) {
      titleTarget.textContent = title;
    }

    if (copyTarget && copy) {
      copyTarget.textContent = copy;
    }

    if (priceTarget && price) {
      priceTarget.textContent = price;
    }

    if (
      ingredientsTarget &&
      ingredients
    ) {
      ingredientsTarget.textContent =
        ingredients;
    }

    const current =
      qs(SELECTORS.menuCurrent, scope);

    if (current) {
      current.textContent =
        String(index + 1).padStart(2, "0");
    }

    const event =
      new CustomEvent(
        "morgan:menu-change",
        {
          detail: {
            index,
            item
          }
        }
      );

    document.dispatchEvent(event);
  }


  /* ============================================================
     MENU TRACK / WHEEL CONTROL
     ============================================================ */

  function initMenuTrack() {
    const track =
      qs(SELECTORS.menuTrack);

    if (!track) return;

    let wheelLock = false;

    track.addEventListener(
      "wheel",
      event => {
        if (
          Math.abs(event.deltaY) <
          Math.abs(event.deltaX)
        ) {
          return;
        }

        if (wheelLock) return;

        wheelLock = true;

        const items =
          qsa(SELECTORS.menuItem);

        const current =
          state.menuIndex;

        const direction =
          event.deltaY > 0 ? 1 : -1;

        activateMenuItem(
          (current + direction + items.length) %
          items.length
        );

        window.setTimeout(
          () => {
            wheelLock = false;
          },
          500
        );
      },
      {
        passive: true
      }
    );
  }


  /* ============================================================
     COCKTAIL / BAR ENGINE
     ============================================================ */

  function initCocktails() {
    const cocktails =
      qsa(SELECTORS.cocktail);

    if (!cocktails.length) return;

    cocktails.forEach(
      (cocktail, index) => {
        cocktail.setAttribute(
          "tabindex",
          "0"
        );

        cocktail.addEventListener(
          "click",
          () => activateCocktail(index)
        );

        cocktail.addEventListener(
          "keydown",
          event => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              activateCocktail(index);
            }
          }
        );
      }
    );

    activateCocktail(0);
  }


  function activateCocktail(index) {
    const cocktails =
      qsa(SELECTORS.cocktail);

    if (!cocktails.length) return;

    index =
      (index + cocktails.length) %
      cocktails.length;

    state.cocktailIndex = index;

    cocktails.forEach(
      (cocktail, cocktailIndex) => {
        cocktail.classList.toggle(
          "is-active",
          cocktailIndex === index
        );
      }
    );

    const active =
      cocktails[index];

    const scene =
      active.closest(
        '[data-scene="bar"]'
      ) || document;

    const title =
      active.dataset.title || "";

    const copy =
      active.dataset.copy || "";

    const image =
      active.dataset.image || "";

    const target =
      qs(
        SELECTORS.cocktailTarget,
        scene
      );

    if (target) {
      const targetTitle =
        target.querySelector(
          "[data-cocktail-title]"
        );

      const targetCopy =
        target.querySelector(
          "[data-cocktail-copy]"
        );

      const targetImage =
        target.querySelector(
          "[data-cocktail-image]"
        );

      if (targetTitle && title) {
        targetTitle.textContent = title;
      }

      if (targetCopy && copy) {
        targetCopy.textContent = copy;
      }

      if (
        targetImage &&
        image
      ) {
        targetImage.src = image;
      }
    }
  }


  /* ============================================================
     GALLERY ENGINE
     ============================================================ */

  function initGallery() {
    const track =
      qs(SELECTORS.galleryTrack);

    if (!track) return;

    const gallery =
      track.closest(
        '[data-scene="gallery"]'
      ) || track.parentElement;

    if (!gallery) return;

    /*
      Mouse drag support.
    */

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    track.addEventListener(
      "pointerdown",
      event => {
        dragging = true;

        startX = event.clientX;
        startScroll =
          gallery.scrollLeft;

        track.setPointerCapture(
          event.pointerId
        );

        track.classList.add(
          "is-dragging"
        );
      }
    );

    track.addEventListener(
      "pointermove",
      event => {
        if (!dragging) return;

        const delta =
          event.clientX - startX;

        gallery.scrollLeft =
          startScroll - delta;
      }
    );

    track.addEventListener(
      "pointerup",
      () => {
        dragging = false;

        track.classList.remove(
          "is-dragging"
        );
      }
    );

    track.addEventListener(
      "pointercancel",
      () => {
        dragging = false;

        track.classList.remove(
          "is-dragging"
        );
      }
    );
  }


  function updateGallery() {
    const track =
      qs(SELECTORS.galleryTrack);

    if (!track) return;

    const scene =
      track.closest(
        '[data-scene="gallery"]'
      );

    if (!scene) return;

    const rect =
      scene.getBoundingClientRect();

    if (
      rect.bottom < -200 ||
      rect.top >
      state.viewportHeight + 200
    ) {
      return;
    }

    const maxTravel =
      Math.max(
        0,
        track.scrollWidth -
        state.viewportWidth
      );

    if (!maxTravel) return;

    const progress =
      clamp(
        mapRange(
          state.viewportHeight -
          rect.top,
          0,
          Math.max(rect.height, 1),
          0,
          1
        )
      );

    const x =
      maxTravel * progress;

    track.style.setProperty(
      "--gallery-x",
      `${x * -1}px`
    );
  }


  /* ============================================================
     MOUSE PARALLAX
     ============================================================ */

  function initPointer() {
    if (isTouch) return;

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

        state.pointerInside = true;

        requestFrame();
      },
      {
        passive: true
      }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        state.pointerInside = false;
      }
    );
  }


  function updatePointerSmoothing() {
    state.smoothMouseX =
      lerp(
        state.smoothMouseX,
        state.mouseX,
        reducedMotion ? 1 : 0.08
      );

    state.smoothMouseY =
      lerp(
        state.smoothMouseY,
        state.mouseY,
        reducedMotion ? 1 : 0.08
      );
  }


  /* ============================================================
     DEPTH POINTER EFFECT
     ============================================================ */

  function updateHeroPointerLayers() {
    if (isTouch) return;

    updatePointerSmoothing();

    const layers =
      qsa("[data-pointer-depth]");

    layers.forEach(layer => {
      const strength =
        parseFloat(
          layer.dataset.pointerDepth ||
          "10"
        );

      const x =
        state.smoothMouseX *
        strength;

      const y =
        state.smoothMouseY *
        strength;

      layer.style.setProperty(
        "--pointer-x",
        `${x.toFixed(2)}px`
      );

      layer.style.setProperty(
        "--pointer-y",
        `${y.toFixed(2)}px`
      );
    });
  }


  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */

  let cursorElement = null;
  let cursorTextElement = null;

  function initCursor() {
    if (isTouch) return;

    cursorElement =
      qs(SELECTORS.cursor);

    cursorTextElement =
      qs(SELECTORS.cursorText);

    if (!cursorElement) return;

    document.addEventListener(
      "pointerover",
      event => {
        const interactive =
          event.target.closest(
            "[data-cursor-label]"
          );

        if (!interactive) return;

        const label =
          interactive.dataset.cursorLabel;

        cursorElement.classList.add(
          "is-label"
        );

        if (cursorTextElement) {
          cursorTextElement.textContent =
            label || "VIEW";
        }
      }
    );

    document.addEventListener(
      "pointerout",
      event => {
        const interactive =
          event.target.closest(
            "[data-cursor-label]"
          );

        if (!interactive) return;

        cursorElement.classList.remove(
          "is-label"
        );
      }
    );

    document.body.classList.add(
      "has-custom-cursor"
    );
  }


  function updateCursor() {
    if (
      isTouch ||
      !cursorElement
    ) {
      return;
    }

    const x =
      state.mouseX *
      state.viewportWidth +
      state.viewportWidth / 2;

    const y =
      state.mouseY *
      state.viewportHeight +
      state.viewportHeight / 2;

    /*
      Use transform directly here.
      Cursor is one of the few elements
      where direct transform is appropriate.
    */

    cursorElement.style.transform =
      `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`;

    updateHeroPointerLayers();
  }


  /* ============================================================
     MAGNETIC BUTTONS
     ============================================================ */

  function initMagneticElements() {
    if (isTouch) return;

    qsa(SELECTORS.magnetic)
      .forEach(element => {
        element.addEventListener(
          "pointermove",
          event => {
            const rect =
              element.getBoundingClientRect();

            const x =
              event.clientX -
              rect.left -
              rect.width / 2;

            const y =
              event.clientY -
              rect.top -
              rect.height / 2;

            const strength =
              parseFloat(
                element.dataset.magnetic ||
                "0.18"
              );

            element.style.setProperty(
              "--magnetic-x",
              `${x * strength}px`
            );

            element.style.setProperty(
              "--magnetic-y",
              `${y * strength}px`
            );
          }
        );

        element.addEventListener(
          "pointerleave",
          () => {
            element.style.setProperty(
              "--magnetic-x",
              "0px"
            );

            element.style.setProperty(
              "--magnetic-y",
              "0px"
            );
          }
        );
      });
  }


  function updateMagneticElements() {
    /*
      Intentionally lightweight.

      Actual pointer calculations happen
      only while hovering each element.
    */
  }


  /* ============================================================
     ANCHOR NAVIGATION
     ============================================================ */

  function initAnchors() {
    document.addEventListener(
      "click",
      event => {
        const link =
          event.target.closest(
            'a[href^="#"]'
          );

        if (!link) return;

        const href =
          link.getAttribute("href");

        if (
          !href ||
          href === "#"
        ) {
          return;
        }

        const target =
          document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        const nav =
          qs(SELECTORS.nav);

        const navHeight =
          nav
            ? nav.getBoundingClientRect().height
            : 0;

        const targetY =
          window.scrollY +
          target.getBoundingClientRect().top -
          navHeight;

        window.scrollTo({
          top: Math.max(targetY, 0),
          behavior:
            reducedMotion
              ? "auto"
              : "smooth"
        });

        history.replaceState(
          null,
          "",
          href
        );
      }
    );
  }


  /* ============================================================
     IMAGE LAZY LOADING
     ============================================================ */

  function initImageLoading() {
    const images =
      qsa("img");

    if (!images.length) return;

    images.forEach(image => {
      if (
        !image.hasAttribute(
          "loading"
        )
      ) {
        image.setAttribute(
          "loading",
          "lazy"
        );
      }

      if (
        !image.hasAttribute(
          "decoding"
        )
      ) {
        image.setAttribute(
          "decoding",
          "async"
        );
      }
    });

    /*
      Hero images should not wait for lazy loading.
    */

    const heroImages =
      qsa(
        '[data-scene="hero"] img'
      );

    heroImages.forEach(image => {
      image.setAttribute(
        "loading",
        "eager"
      );

      image.setAttribute(
        "fetchpriority",
        "high"
      );
    });
  }


  /* ============================================================
     IMAGE LOAD STATE
     ============================================================ */

  function initImageStates() {
    const images =
      qsa("img");

    images.forEach(image => {
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
        {
          once: true
        }
      );

      image.addEventListener(
        "error",
        () => {
          image.classList.add(
            "is-error"
          );
        },
        {
          once: true
        }
      );
    });
  }


  /* ============================================================
     BUTTON MICRO INTERACTIONS
     ============================================================ */

  function initButtonInteractions() {
    const buttons =
      qsa(
        "a, button"
      );

    buttons.forEach(button => {
      if (
        button.dataset.microReady
      ) {
        return;
      }

      button.dataset.microReady =
        "true";

      button.addEventListener(
        "pointerdown",
        () => {
          button.classList.add(
            "is-pressed"
          );
        }
      );

      button.addEventListener(
        "pointerup",
        () => {
          button.classList.remove(
            "is-pressed"
          );
        }
      );

      button.addEventListener(
        "pointerleave",
        () => {
          button.classList.remove(
            "is-pressed"
          );
        }
      );
    });
  }


  /* ============================================================
     NUMBER / COUNTER ANIMATION
     ============================================================ */

  function initCounters() {
    const counters =
      qsa("[data-counter]");

    if (!counters.length) return;

    if (reducedMotion) {
      counters.forEach(counter => {
        counter.textContent =
          counter.dataset.counter;
      });

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

            animateCounter(
              entry.target
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.5
        }
      );

    counters.forEach(counter =>
      observer.observe(counter)
    );
  }


  function animateCounter(element) {
    const target =
      parseFloat(
        element.dataset.counter ||
        "0"
      );

    const decimals =
      parseInt(
        element.dataset.decimals ||
        "0",
        10
      );

    const duration = 1400;

    const start =
      performance.now();

    const tick = now => {
      const progress =
        clamp(
          (now - start) /
          duration
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      const value =
        target * eased;

      element.textContent =
        value.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }


  /* ============================================================
     ACTIVE NAV LINK
     ============================================================ */

  function initActiveNavigation() {
    const links =
      qsa(
        '[data-nav-link]'
      );

    if (!links.length) return;

    const targets = [];

    links.forEach(link => {
      const href =
        link.getAttribute("href");

      if (!href || href[0] !== "#") {
        return;
      }

      const target =
        document.querySelector(href);

      if (!target) return;

      targets.push({
        link,
        target
      });
    });

    if (!targets.length) return;

    const observer =
      new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            targets.forEach(item => {
              item.link.classList.toggle(
                "is-active",
                item.target ===
                entry.target
              );
            });
          });
        },
        {
          threshold: 0.25,
          rootMargin:
            "-25% 0px -55% 0px"
        }
      );

    targets.forEach(item =>
      observer.observe(item.target)
    );
  }


  /* ============================================================
     RESPONSIVE STATE
     ============================================================ */

  function updateViewport() {
    state.viewportWidth =
      window.innerWidth;

    state.viewportHeight =
      window.innerHeight;

    root.style.setProperty(
      "--viewport-height",
      `${state.viewportHeight}px`
    );

    root.style.setProperty(
      "--viewport-width",
      `${state.viewportWidth}px`
    );

    requestFrame();
  }


  /* ============================================================
     RESIZE
     ============================================================ */

  let resizeTimer = null;

  function initResize() {
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            updateViewport,
            120
          );
      },
      {
        passive: true
      }
    );

    updateViewport();
  }


  /* ============================================================
     KEYBOARD ESCAPE
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
          "menu-open"
        );

        document.body.classList.remove(
          "nav-open"
        );
      }
    );
  }


  /* ============================================================
     MOBILE MENU
     ============================================================ */

  function initMobileMenu() {
    const toggle =
      qs("[data-menu-toggle]");

    const menu =
      qs("[data-mobile-menu]");

    if (!toggle || !menu) return;

    toggle.addEventListener(
      "click",
      () => {
        const open =
          body.classList.toggle(
            "menu-open"
          );

        toggle.setAttribute(
          "aria-expanded",
          open ? "true" : "false"
        );

        menu.setAttribute(
          "aria-hidden",
          open ? "false" : "true"
        );
      }
    );

    qsa(
      "a",
      menu
    ).forEach(link => {
      link.addEventListener(
        "click",
        () => {
          body.classList.remove(
            "menu-open"
          );

          toggle.setAttribute(
            "aria-expanded",
            "false"
          );
        }
      );
    });
  }


  /* ============================================================
     SECTION PROGRESS
     ============================================================ */

  function initSceneProgressAttributes() {
    const scenes =
      qsa(SELECTORS.scene);

    if (!scenes.length) return;

    scenes.forEach(scene => {
      scene.style.setProperty(
        "--scene-progress",
        "0"
      );
    });
  }


  function updateSceneProgress() {
    const scenes =
      qsa(SELECTORS.scene);

    scenes.forEach(scene => {
      const rect =
        scene.getBoundingClientRect();

      if (
        rect.bottom < 0 ||
        rect.top >
        state.viewportHeight
      ) {
        return;
      }

      const progress =
        clamp(
          mapRange(
            state.viewportHeight -
            rect.top,
            0,
            state.viewportHeight +
            rect.height,
            0,
            1
          )
        );

      scene.style.setProperty(
        "--scene-progress",
        progress.toFixed(4)
      );
    });
  }


  /* ============================================================
     MAIN SCROLL EXTENSION
     ============================================================ */

  const originalAnimationFrame =
    animationFrame;

  /*
    Override the frame function with the
    complete scene progress pass.
  */

  function enhancedAnimationFrame() {
    state.raf = null;

    if (state.documentHidden) return;

    state.scrollY =
      state.targetScrollY;

    updateGlobalScroll();
    updateNavigation();
    updateSceneProgress();

    updateHero();
    updateDepthLayers();
    updateTableScene();
    updateDinnerScene();
    updateGallery();

    updateCursor();

    if (!isTouch) {
      updateMagneticElements();
    }
  }

  /*
    Re-point RAF requests to the
    enhanced animation function.
  */

  function requestEnhancedFrame() {
    if (
      state.raf ||
      state.documentHidden
    ) {
      return;
    }

    state.raf =
      requestAnimationFrame(
        enhancedAnimationFrame
      );
  }


  /* ============================================================
     REPLACE REQUEST FRAME REFERENCES
     ============================================================ */

  /*
    Scroll event uses this optimized scheduler.
  */

  window.addEventListener(
    "scroll",
    () => {
      state.targetScrollY =
        window.scrollY;

      if (
        state.targetScrollY >
        state.lastScrollY
      ) {
        state.scrollDirection =
          "down";
      } else if (
        state.targetScrollY <
        state.lastScrollY
      ) {
        state.scrollDirection =
          "up";
      }

      state.lastScrollY =
        state.targetScrollY;

      requestEnhancedFrame();
    },
    {
      passive: true
    }
  );


  /* ============================================================
     INITIALIZE EVERYTHING
     ============================================================ */

  function init() {
    initLoader();

    initVisibility();

    initSceneObserver();

    initRevealObserver();

    initMenu();

    initMenuTrack();

    initCocktails();

    initGallery();

    initPointer();

    initCursor();

    initMagneticElements();

    initAnchors();

    initImageLoading();

    initImageStates();

    initButtonInteractions();

    initCounters();

    initActiveNavigation();

    initResize();

    initEscape();

    initMobileMenu();

    initSceneProgressAttributes();

    /*
      Initial render.
    */

    requestEnhancedFrame();

    /*
      Small delayed refresh after fonts/images
      have had a chance to settle.
    */

    window.setTimeout(
      requestEnhancedFrame,
      300
    );

    window.setTimeout(
      requestEnhancedFrame,
      1000
    );

    console.log(
      "%c Morgan's On Main ",
      "background:#111;color:#f5eee4;padding:8px 12px;font-weight:bold;"
    );

    console.log(
      "%c Cinematic Experience Engine loaded ",
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
      {
        once: true
      }
    );
  } else {
    init();
  }

})();

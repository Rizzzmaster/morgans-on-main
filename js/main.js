(() => {
  "use strict";

  /* ============================================================
     MORGAN'S ON MAIN
     DIGITAL DINNER EXPERIENCE
     Interaction Engine v2
  ============================================================ */

  const root = document.documentElement;
  const body = document.body;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const isTouch = window.matchMedia(
    "(pointer: coarse)"
  );

  let reducedMotion = prefersReducedMotion.matches;

  prefersReducedMotion.addEventListener?.("change", (event) => {
    reducedMotion = event.matches;
  });


  /* ============================================================
     HELPERS
  ============================================================ */

  const clamp = (value, min = 0, max = 1) =>
    Math.min(Math.max(value, min), max);

  const lerp = (start, end, amount) =>
    start + (end - start) * amount;

  const easeOut = (value) =>
    1 - Math.pow(1 - clamp(value), 3);

  const easeInOut = (value) => {
    const x = clamp(value);
    return x < 0.5
      ? 4 * x * x * x
      : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  const mapRange = (
    value,
    inMin,
    inMax,
    outMin,
    outMax
  ) => {
    const progress = clamp(
      (value - inMin) / (inMax - inMin)
    );

    return lerp(outMin, outMax, progress);
  };

  const qs = (selector, parent = document) =>
    parent.querySelector(selector);

  const qsa = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const rafThrottle = (callback) => {
    let ticking = false;

    return (...args) => {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(() => {
        callback(...args);
        ticking = false;
      });
    };
  };


  /* ============================================================
     EXPERIENCE BOOT
  ============================================================ */

  let experienceReady = false;

  const bootExperience = () => {
    if (experienceReady) return;

    experienceReady = true;

    root.classList.add("experience-ready");

    window.setTimeout(() => {
      root.classList.add("experience-entered");
      body.classList.add("experience-entered");
    }, reducedMotion ? 100 : 900);
  };


  /* ============================================================
     LOADING CURTAIN
  ============================================================ */

  const curtain = qs(".experience-curtain");

  if (curtain) {
    body.classList.add("experience-loading");

    const curtainStart = performance.now();

    const finishCurtain = () => {
      const elapsed = performance.now() - curtainStart;
      const minimumDuration = reducedMotion ? 150 : 1100;

      const remaining = Math.max(
        0,
        minimumDuration - elapsed
      );

      window.setTimeout(() => {
        curtain.classList.add("is-complete");

        body.classList.remove("experience-loading");

        bootExperience();

        window.setTimeout(() => {
          curtain.remove();
        }, reducedMotion ? 300 : 1400);

      }, remaining);
    };

    if (document.readyState === "complete") {
      finishCurtain();
    } else {
      window.addEventListener(
        "load",
        finishCurtain,
        { once: true }
      );
    }

  } else {
    bootExperience();
  }


  /* ============================================================
     HEADER
  ============================================================ */

  const header = qs("[data-header]");
  const mobileMenu = qs("[data-mobile-menu]");
  const menuToggle = qs("[data-menu-toggle]");

  let lastScrollY = window.scrollY;
  let headerTicking = false;

  const updateHeader = () => {
    if (!header) return;

    const scrollY = window.scrollY;

    header.classList.toggle(
      "is-scrolled",
      scrollY > 60
    );

    header.classList.toggle(
      "is-deep-scrolled",
      scrollY > window.innerHeight * 0.7
    );

    if (
      scrollY > lastScrollY &&
      scrollY > 140
    ) {
      header.classList.add("is-hidden");
    }

    if (
      scrollY < lastScrollY ||
      scrollY < 80
    ) {
      header.classList.remove("is-hidden");
    }

    lastScrollY = scrollY;
  };

  const requestHeaderUpdate = () => {
    if (headerTicking) return;

    headerTicking = true;

    requestAnimationFrame(() => {
      updateHeader();
      headerTicking = false;
    });
  };

  window.addEventListener(
    "scroll",
    requestHeaderUpdate,
    { passive: true }
  );

  updateHeader();


  /* ============================================================
     MOBILE MENU
  ============================================================ */

  const closeMobileMenu = () => {
    if (!header) return;

    header.classList.remove("menu-open");

    menuToggle?.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle?.setAttribute(
      "aria-label",
      "Open navigation"
    );

    body.classList.remove("navigation-open");
  };


  const openMobileMenu = () => {
    if (!header) return;

    header.classList.add("menu-open");

    menuToggle?.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle?.setAttribute(
      "aria-label",
      "Close navigation"
    );

    body.classList.add("navigation-open");
  };


  menuToggle?.addEventListener("click", () => {
    const open = header?.classList.contains(
      "menu-open"
    );

    if (open) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });


  qsa(".mobile-nav a, .mobile-menu-bottom a").forEach(
    (link) => {
      link.addEventListener(
        "click",
        closeMobileMenu
      );
    }
  );


  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });


  /* ============================================================
     SMOOTH ANCHOR NAVIGATION
  ============================================================ */

  qsa('a[href^="#"]').forEach((link) => {

    link.addEventListener("click", (event) => {

      const targetID =
        link.getAttribute("href");

      if (
        !targetID ||
        targetID === "#"
      ) {
        return;
      }

      const target =
        qs(targetID);

      if (!target) return;

      event.preventDefault();

      closeMobileMenu();

      const headerOffset =
        header?.offsetHeight || 0;

      const targetTop =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      if (reducedMotion) {
        window.scrollTo(
          0,
          targetTop
        );
      } else {
        window.scrollTo({
          top: targetTop,
          behavior: "smooth"
        });
      }

    });

  });


  /* ============================================================
     INTERSECTION REVEALS
  ============================================================ */

  const revealElements =
    qsa("[data-reveal], .reveal");

  if (
    !reducedMotion &&
    "IntersectionObserver" in window
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }

            const element =
              entry.target;

            element.classList.add(
              "is-visible"
            );

            element.classList.add(
              "in"
            );

            observer.unobserve(element);

          });

        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -8% 0px"
        }
      );


    revealElements.forEach(
      (element) => {
        revealObserver.observe(element);
      }
    );

  } else {

    revealElements.forEach(
      (element) => {
        element.classList.add(
          "is-visible"
        );

        element.classList.add("in");
      }
    );

  }


  /* ============================================================
     HERO POINTER SYSTEM
  ============================================================ */

  const hero =
    qs("[data-scene='hero']");

  const heroLayers =
    qsa("[data-depth]", hero || document);

  const heroLight =
    qs("[data-cursor-light]");

  let pointerTargetX = 0;
  let pointerTargetY = 0;

  let pointerCurrentX = 0;
  let pointerCurrentY = 0;

  let pointerActive = false;

  if (
    hero &&
    canHover.matches &&
    !reducedMotion
  ) {

    hero.addEventListener(
      "pointerenter",
      () => {
        pointerActive = true;
        hero.classList.add(
          "pointer-active"
        );
      }
    );


    hero.addEventListener(
      "pointerleave",
      () => {
        pointerActive = false;

        pointerTargetX = 0;
        pointerTargetY = 0;

        hero.classList.remove(
          "pointer-active"
        );
      }
    );


    hero.addEventListener(
      "pointermove",
      (event) => {

        const rect =
          hero.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) /
          rect.width;

        const y =
          (event.clientY - rect.top) /
          rect.height;

        pointerTargetX =
          (x - 0.5) * 2;

        pointerTargetY =
          (y - 0.5) * 2;

        if (heroLight) {

          heroLight.style.setProperty(
            "--pointer-x",
            `${event.clientX}px`
          );

          heroLight.style.setProperty(
            "--pointer-y",
            `${event.clientY}px`
          );

        }

      },
      { passive: true }
    );

  }


  /* ============================================================
     GLOBAL POINTER LOOP
  ============================================================ */

  let pointerRAF = null;

  const updatePointerScene = () => {

    pointerCurrentX =
      lerp(
        pointerCurrentX,
        pointerTargetX,
        0.065
      );

    pointerCurrentY =
      lerp(
        pointerCurrentY,
        pointerTargetY,
        0.065
      );


    if (
      hero &&
      canHover.matches &&
      !reducedMotion
    ) {

      hero.style.setProperty(
        "--pointer-x",
        pointerCurrentX
      );

      hero.style.setProperty(
        "--pointer-y",
        pointerCurrentY
      );


      heroLayers.forEach((layer) => {

        const depth =
          parseFloat(
            layer.dataset.depth || "1"
          );

        const moveX =
          pointerCurrentX *
          depth *
          9;

        const moveY =
          pointerCurrentY *
          depth *
          6;

        layer.style.setProperty(
          "--depth-x",
          `${moveX}px`
        );

        layer.style.setProperty(
          "--depth-y",
          `${moveY}px`
        );

      });

    }

    pointerRAF =
      requestAnimationFrame(
        updatePointerScene
      );

  };


  if (
    canHover.matches &&
    !reducedMotion
  ) {
    pointerRAF =
      requestAnimationFrame(
        updatePointerScene
      );
  }


  /* ============================================================
     CUSTOM CURSOR
  ============================================================ */

  const cursorDot =
    qs(".cursor-dot");

  const cursorRing =
    qs(".cursor-ring");

  const cursorGlow =
    qs(".cursor-glow");

  if (
    canHover.matches &&
    !reducedMotion &&
    cursorDot &&
    cursorRing
  ) {

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let dotX = mouseX;
    let dotY = mouseY;

    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener(
      "pointermove",
      (event) => {

        mouseX = event.clientX;
        mouseY = event.clientY;

        cursorDot.style.left =
          `${mouseX}px`;

        cursorDot.style.top =
          `${mouseY}px`;

        if (cursorGlow) {

          cursorGlow.style.left =
            `${mouseX}px`;

          cursorGlow.style.top =
            `${mouseY}px`;

        }

      },
      { passive: true }
    );


    const cursorLoop = () => {

      dotX =
        lerp(dotX, mouseX, 0.30);

      dotY =
        lerp(dotY, mouseY, 0.30);

      ringX =
        lerp(ringX, mouseX, 0.13);

      ringY =
        lerp(ringY, mouseY, 0.13);


      cursorDot.style.transform =
        `translate3d(-50%,-50%,0)`;


      cursorRing.style.left =
        `${ringX}px`;

      cursorRing.style.top =
        `${ringY}px`;


      requestAnimationFrame(
        cursorLoop
      );

    };


    cursorLoop();


    const interactiveElements =
      qsa(
        "a, button, [data-magnetic], [data-menu-item], .cocktail-card"
      );


    interactiveElements.forEach(
      (element) => {

        element.addEventListener(
          "mouseenter",
          () => {

            body.classList.add(
              "cursor-hover"
            );

            cursorRing.classList.add(
              "is-hovering"
            );

          }
        );


        element.addEventListener(
          "mouseleave",
          () => {

            body.classList.remove(
              "cursor-hover"
            );

            cursorRing.classList.remove(
              "is-hovering"
            );

          }
        );

      }
    );

  }


  /* ============================================================
     MAGNETIC INTERACTIONS
  ============================================================ */

  const magneticElements =
    qsa("[data-magnetic]");

  if (
    canHover.matches &&
    !reducedMotion
  ) {

    magneticElements.forEach(
      (element) => {

        element.addEventListener(
          "pointermove",
          (event) => {

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
              element.classList.contains(
                "large-line-button"
              )
                ? 0.08
                : 0.14;

            element.style.setProperty(
              "--mag-x",
              `${x * strength}px`
            );

            element.style.setProperty(
              "--mag-y",
              `${y * strength}px`
            );

          },
          { passive: true }
        );


        element.addEventListener(
          "pointerleave",
          () => {

            element.style.setProperty(
              "--mag-x",
              "0px"
            );

            element.style.setProperty(
              "--mag-y",
              "0px"
            );

          }
        );

      }
    );

  }


  /* ============================================================
     SCROLL ENGINE
  ============================================================ */

  const scenes =
    qsa("[data-scene]");

  let scrollY =
    window.scrollY;

  let currentScroll =
    scrollY;

  let scrollVelocity = 0;

  let previousScroll =
    scrollY;


  const updateScrollState =
    rafThrottle(() => {

      scrollY =
        window.scrollY;

    });


  window.addEventListener(
    "scroll",
    updateScrollState,
    { passive: true }
  );


  /* ============================================================
     SCENE PROGRESS
  ============================================================ */

  const updateScenes = () => {

    currentScroll =
      lerp(
        currentScroll,
        scrollY,
        reducedMotion ? 1 : 0.10
      );


    scrollVelocity =
      lerp(
        scrollVelocity,
        currentScroll - previousScroll,
        0.08
      );


    previousScroll =
      currentScroll;


    scenes.forEach(
      (scene) => {

        const rect =
          scene.getBoundingClientRect();

        const height =
          Math.max(
            scene.offsetHeight,
            window.innerHeight
          );

        const viewport =
          window.innerHeight;

        const center =
          viewport / 2;

        const sceneCenter =
          rect.top + height / 2;

        const distance =
          sceneCenter - center;

        const progress =
          clamp(
            0.5 -
            distance /
            (viewport + height)
          );


        scene.style.setProperty(
          "--scene-progress",
          progress.toFixed(4)
        );


        scene.style.setProperty(
          "--scene-distance",
          `${distance}px`
        );


        scene.style.setProperty(
          "--scroll-velocity",
          scrollVelocity.toFixed(4)
        );


        if (
          rect.top < viewport &&
          rect.bottom > 0
        ) {

          scene.classList.add(
            "scene-active"
          );

        } else {

          scene.classList.remove(
            "scene-active"
          );

        }

      }
    );


    updateHeroScroll();
    updateTableStory();
    updateFoodScene();
    updateDinnerScene();
    updateGallery();
    updateVisit();

    requestAnimationFrame(
      updateScenes
    );

  };


  /* ============================================================
     HERO SCROLL TRANSFORMATION
  ============================================================ */

  const updateHeroScroll = () => {

    if (!hero) return;

    const rect =
      hero.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const progress =
      clamp(
        -rect.top /
        Math.max(
          1,
          rect.height - viewport
        )
      );


    hero.style.setProperty(
      "--hero-progress",
      progress.toFixed(4)
    );


    if (reducedMotion) return;


    const content =
      qs(".hero-content", hero);

    const food =
      qs(".hero-food-scene", hero);

    const backdrop =
      qs(".hero-backdrop", hero);

    const grid =
      qs(".hero-grid", hero);


    if (content) {

      const y =
        mapRange(
          progress,
          0,
          1,
          0,
          -120
        );

      const opacity =
        mapRange(
          progress,
          0,
          0.72,
          1,
          0
        );

      content.style.transform =
        `translate3d(0,${y}px,0)`;

      content.style.opacity =
        opacity;

    }


    if (food) {

      const y =
        mapRange(
          progress,
          0,
          1,
          0,
          -170
        );

      const scale =
        mapRange(
          progress,
          0,
          1,
          1,
          1.10
        );

      food.style.transform =
        `translate3d(
          var(--depth-x,0px),
          calc(${y}px + var(--depth-y,0px)),
          0
        ) scale(${scale})`;

    }


    if (backdrop) {

      const y =
        mapRange(
          progress,
          0,
          1,
          0,
          -55
        );

      backdrop.style.transform =
        `translate3d(0,${y}px,0) scale(1.04)`;

    }


    if (grid) {

      grid.style.opacity =
        mapRange(
          progress,
          0,
          0.8,
          1,
          0
        );

    }

  };


  /* ============================================================
     TABLE STORY
  ============================================================ */

  const tableScene =
    qs("[data-scene='table']");

  const tableStage =
    qs("[data-scroll-story]");

  const tableStories =
    qsa(
      ".table-story-item",
      tableScene || document
    );

  const tableImage =
    qs(
      "[data-pinned-image]",
      tableScene || document
    );


  const updateTableStory = () => {

    if (
      !tableScene ||
      !tableStories.length
    ) {
      return;
    }


    const rect =
      tableScene.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const total =
      rect.height + viewport;

    const progress =
      clamp(
        (viewport - rect.top) /
        total
      );


    tableScene.style.setProperty(
      "--table-progress",
      progress.toFixed(4)
    );


    if (tableImage && !reducedMotion) {

      const y =
        mapRange(
          progress,
          0.05,
          0.95,
          0,
          -70
        );

      tableImage.style.transform =
        `translate3d(0,${y}px,0)`;

    }


    const storyIndex =
      clamp(
        Math.floor(
          progress *
          tableStories.length *
          1.18
        ),
        0,
        tableStories.length - 1
      );


    tableStories.forEach(
      (story, index) => {

        const active =
          index === storyIndex;

        story.classList.toggle(
          "is-active",
          active
        );

        if (
          active &&
          !reducedMotion
        ) {

          const offset =
            index * -10;

          story.style.transform =
            `translate3d(0,${offset}px,0)`;

        }

      }
    );

  };


  /* ============================================================
     FOOD SCENE
  ============================================================ */

  const foodScene =
    qs("[data-scene='food']");

  const updateFoodScene = () => {

    if (!foodScene) return;

    const rect =
      foodScene.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const progress =
      clamp(
        (viewport - rect.top) /
        (viewport + rect.height)
      );


    foodScene.style.setProperty(
      "--food-progress",
      progress.toFixed(4)
    );


    if (reducedMotion) return;


    const image =
      qs(
        ".food-background",
        foodScene
      );

    const content =
      qs(
        ".food-content",
        foodScene
      );


    if (image) {

      const y =
        mapRange(
          progress,
          0,
          1,
          35,
          -35
        );

      const scale =
        mapRange(
          progress,
          0,
          1,
          1.08,
          1.01
        );

      image.style.transform =
        `translate3d(0,${y}px,0) scale(${scale})`;

    }


    if (content) {

      const y =
        mapRange(
          progress,
          0.15,
          0.8,
          55,
          -45
        );

      content.style.transform =
        `translate3d(0,${y}px,0)`;

    }

  };


  /* ============================================================
     DISH SHOWCASE
  ============================================================ */

  const dishSlides =
    qsa(".dish-slide");

  const dishNext =
    qs("[data-dish-next]");

  const dishPrev =
    qs("[data-dish-prev]");

  const dishProgress =
    qs("[data-dish-progress]");

  let activeDish =
    Math.max(
      0,
      dishSlides.findIndex(
        (slide) =>
          slide.classList.contains(
            "is-active"
          )
      )
    );


  const renderDish = (
    nextIndex,
    direction = 1
  ) => {

    if (!dishSlides.length) return;

    const normalized =
      (
        nextIndex +
        dishSlides.length
      ) %
      dishSlides.length;


    dishSlides.forEach(
      (slide, index) => {

        slide.classList.remove(
          "is-active",
          "is-before",
          "is-after"
        );


        if (index === normalized) {

          slide.classList.add(
            "is-active"
          );

        } else if (
          index ===
          (
            normalized - 1 +
            dishSlides.length
          ) %
          dishSlides.length
        ) {

          slide.classList.add(
            "is-before"
          );

        } else {

          slide.classList.add(
            "is-after"
          );

        }

      }
    );


    activeDish =
      normalized;


    const percentage =
      (
        (normalized + 1) /
        dishSlides.length
      ) *
      100;


    if (dishProgress) {

      dishProgress.style.width =
        `${percentage}%`;

    }


    const showcase =
      qs("[data-dish-showcase]");

    if (showcase) {

      showcase.dataset.direction =
        direction > 0
          ? "next"
          : "previous";

    }

  };


  dishNext?.addEventListener(
    "click",
    () => {
      renderDish(
        activeDish + 1,
        1
      );
    }
  );


  dishPrev?.addEventListener(
    "click",
    () => {
      renderDish(
        activeDish - 1,
        -1
      );
    }
  );


  let dishWheelLock = false;

  const menuScene =
    qs("[data-scene='menu']");


  menuScene?.addEventListener(
    "wheel",
    (event) => {

      if (
        Math.abs(event.deltaY) <
        12
      ) {
        return;
      }

      if (dishWheelLock) {
        return;
      }

      const rect =
        menuScene.getBoundingClientRect();

      const visible =
        rect.top <
        window.innerHeight * 0.65 &&
        rect.bottom >
        window.innerHeight * 0.35;

      if (!visible) return;

      dishWheelLock = true;

      if (event.deltaY > 0) {
        renderDish(
          activeDish + 1,
          1
        );
      } else {
        renderDish(
          activeDish - 1,
          -1
        );
      }

      window.setTimeout(
        () => {
          dishWheelLock = false;
        },
        650
      );

    },
    { passive: true }
  );


  /* ============================================================
     DISH KEYBOARD CONTROL
  ============================================================ */

  document.addEventListener(
    "keydown",
    (event) => {

      const menuVisible =
        menuScene &&
        menuScene.classList.contains(
          "scene-active"
        );

      if (!menuVisible) return;

      if (event.key === "ArrowRight") {

        renderDish(
          activeDish + 1,
          1
        );

      }

      if (event.key === "ArrowLeft") {

        renderDish(
          activeDish - 1,
          -1
        );

      }

    }
  );


  renderDish(
    activeDish,
    1
  );


  /* ============================================================
     DISH IMAGE POINTER DEPTH
  ============================================================ */

  qsa(".dish-image").forEach(
    (imageWrap) => {

      if (
        !canHover.matches ||
        reducedMotion
      ) {
        return;
      }


      imageWrap.addEventListener(
        "pointermove",
        (event) => {

          const rect =
            imageWrap.getBoundingClientRect();

          const x =
            (
              event.clientX -
              rect.left
            ) /
            rect.width -
            0.5;

          const y =
            (
              event.clientY -
              rect.top
            ) /
            rect.height -
            0.5;


          imageWrap.style.setProperty(
            "--dish-x",
            `${x * 14}px`
          );

          imageWrap.style.setProperty(
            "--dish-y",
            `${y * 10}px`
          );

        },
        { passive: true }
      );


      imageWrap.addEventListener(
        "pointerleave",
        () => {

          imageWrap.style.setProperty(
            "--dish-x",
            "0px"
          );

          imageWrap.style.setProperty(
            "--dish-y",
            "0px"
          );

        }
      );

    }
  );


  /* ============================================================
     DINNER SCENE
  ============================================================ */

  const dinnerScene =
    qs("[data-scene='dinner']");


  const updateDinnerScene = () => {

    if (!dinnerScene) return;

    const rect =
      dinnerScene.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const progress =
      clamp(
        (viewport - rect.top) /
        (viewport + rect.height)
      );


    dinnerScene.style.setProperty(
      "--dinner-progress",
      progress.toFixed(4)
    );


    if (reducedMotion) return;


    const image =
      qs(
        ".dinner-image",
        dinnerScene
      );

    const content =
      qs(
        ".dinner-content",
        dinnerScene
      );


    if (image) {

      const scale =
        mapRange(
          progress,
          0,
          1,
          1.14,
          1.02
        );

      const y =
        mapRange(
          progress,
          0,
          1,
          50,
          -40
        );

      image.style.transform =
        `translate3d(0,${y}px,0) scale(${scale})`;

    }


    if (content) {

      const y =
        mapRange(
          progress,
          0.12,
          0.8,
          80,
          -30
        );

      const opacity =
        mapRange(
          progress,
          0.15,
          0.52,
          0,
          1
        );


      content.style.transform =
        `translate3d(0,${y}px,0)`;

      content.style.opacity =
        opacity;

    }

  };


  /* ============================================================
     COCKTAIL CABINET
  ============================================================ */

  const cocktailCards =
    qsa(".cocktail-card");

  cocktailCards.forEach(
    (card, index) => {

      card.addEventListener(
        "mouseenter",
        () => {

          cocktailCards.forEach(
            (other) => {
              other.classList.remove(
                "is-active"
              );
            }
          );

          card.classList.add(
            "is-active"
          );

          const barScene =
            qs(
              "[data-scene='bar']"
            );

          barScene?.style.setProperty(
            "--cocktail-index",
            index
          );

        }
      );


      card.addEventListener(
        "click",
        () => {

          cocktailCards.forEach(
            (other) => {
              other.classList.remove(
                "is-active"
              );
            }
          );

          card.classList.add(
            "is-active"
          );

        }
      );

    }
  );


  /* ============================================================
     BAR SCENE MOTION
  ============================================================ */

  const barScene =
    qs("[data-scene='bar']");


  const updateBarScene = () => {

    if (!barScene) return;

    const rect =
      barScene.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const progress =
      clamp(
        (viewport - rect.top) /
        (viewport + rect.height)
      );


    barScene.style.setProperty(
      "--bar-progress",
      progress.toFixed(4)
    );


    if (reducedMotion) return;


    const cards =
      qsa(
        ".cocktail-card",
        barScene
      );


    cards.forEach(
      (card, index) => {

        const direction =
          index % 2 === 0
            ? 1
            : -1;

        const offset =
          mapRange(
            progress,
            0,
            1,
            40 * direction,
            -30 * direction
          );

        card.style.setProperty(
          "--cocktail-y",
          `${offset}px`
        );

      }
    );

  };


  /* ============================================================
     EDITORIAL GALLERY
  ============================================================ */

  const galleryScene =
    qs("[data-scene='room']");

  const gallery =
    qs(
      "[data-horizontal-gallery]",
      galleryScene || document
    );


  const galleryFrames =
    qsa(
      ".gallery-frame",
      gallery || document
    );


  const updateGallery = () => {

    if (
      !galleryScene ||
      !gallery
    ) {
      return;
    }


    const rect =
      galleryScene.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const progress =
      clamp(
        (viewport - rect.top) /
        (viewport + rect.height)
      );


    galleryScene.style.setProperty(
      "--gallery-progress",
      progress.toFixed(4)
    );


    if (
      reducedMotion ||
      window.innerWidth < 800
    ) {
      return;
    }


    const horizontalTravel =
      mapRange(
        progress,
        0.05,
        0.95,
        0,
        gallery.scrollWidth -
        window.innerWidth
      );


    gallery.style.transform =
      `translate3d(${-horizontalTravel}px,0,0)`;


    galleryFrames.forEach(
      (frame, index) => {

        const depth =
          parseFloat(
            frame.dataset.galleryDepth ||
            "1"
          );

        const parallax =
          (
            progress -
            0.5
          ) *
          depth *
          80;


        frame.style.setProperty(
          "--gallery-parallax",
          `${parallax}px`
        );

      }
    );

  };


  /* ============================================================
     VISIT SCENE
  ============================================================ */

  const visitScene =
    qs("[data-scene='visit']");


  const updateVisit = () => {

    if (!visitScene) return;

    const rect =
      visitScene.getBoundingClientRect();

    const viewport =
      window.innerHeight;

    const progress =
      clamp(
        (viewport - rect.top) /
        (viewport + rect.height)
      );


    visitScene.style.setProperty(
      "--visit-progress",
      progress.toFixed(4)
    );


    if (reducedMotion) return;


    const background =
      qs(
        ".visit-background",
        visitScene
      );


    if (background) {

      const y =
        mapRange(
          progress,
          0,
          1,
          40,
          -40
        );

      background.style.transform =
        `translate3d(0,${y}px,0) scale(1.08)`;

    }

  };


  /* ============================================================
     SCENE ACTIVE COLOR / NAV STATE
  ============================================================ */

  const updateActiveScene =
    rafThrottle(() => {

      let bestScene = null;
      let bestDistance = Infinity;

      scenes.forEach(
        (scene) => {

          const rect =
            scene.getBoundingClientRect();

          const center =
            rect.top +
            rect.height / 2;

          const distance =
            Math.abs(
              center -
              window.innerHeight / 2
            );


          if (
            distance <
            bestDistance
          ) {

            bestDistance =
              distance;

            bestScene =
              scene;

          }

        }
      );


      scenes.forEach(
        (scene) => {

          scene.classList.toggle(
            "is-current",
            scene === bestScene
          );

        }
      );


      const currentIndex =
        bestScene?.dataset.sceneIndex;

      root.style.setProperty(
        "--current-scene",
        currentIndex || "1"
      );

    });


  window.addEventListener(
    "scroll",
    updateActiveScene,
    { passive: true }
  );


  /* ============================================================
     SECTION NAV HIGHLIGHT
  ============================================================ */

  const navLinks =
    qsa("[data-nav-link]");


  const sectionMap = [
    {
      path: "story.html",
      scene: "table"
    },
    {
      path: "menu.html",
      scene: "menu"
    },
    {
      path: "bar.html",
      scene: "bar"
    },
    {
      path: "gallery.html",
      scene: "room"
    },
    {
      path: "events.html",
      scene: "events"
    },
    {
      path: "contact.html",
      scene: "visit"
    }
  ];


  const updateNavContext =
    rafThrottle(() => {

      const active =
        scenes.find(
          (scene) =>
            scene.classList.contains(
              "is-current"
            )
        );


      if (!active) return;


      const activeScene =
        active.dataset.scene;


      navLinks.forEach(
        (link) => {

          const href =
            link.getAttribute("href");

          const matched =
            sectionMap.find(
              (item) =>
                item.path === href &&
                item.scene === activeScene
            );


          link.classList.toggle(
            "is-context-active",
            Boolean(matched)
          );

        }
      );

    });


  window.addEventListener(
    "scroll",
    updateNavContext,
    { passive: true }
  );


  /* ============================================================
     IMAGE LOAD REVEAL
  ============================================================ */

  qsa("img").forEach(
    (image) => {

      if (image.complete) {

        image.classList.add(
          "image-loaded"
        );

        return;
      }


      image.addEventListener(
        "load",
        () => {

          image.classList.add(
            "image-loaded"
          );

        },
        { once: true }
      );


      image.addEventListener(
        "error",
        () => {

          image.classList.add(
            "image-error"
          );

        },
        { once: true }
      );

    }
  );


  /* ============================================================
     IMAGE HOVER DEPTH
  ============================================================ */

  if (
    canHover.matches &&
    !reducedMotion
  ) {

    qsa(
      ".gallery-frame, .cocktail-card, .hero-food-frame"
    ).forEach(
      (element) => {

        element.addEventListener(
          "pointermove",
          (event) => {

            const rect =
              element.getBoundingClientRect();

            const x =
              (
                event.clientX -
                rect.left
              ) /
              rect.width -
              0.5;

            const y =
              (
                event.clientY -
                rect.top
              ) /
              rect.height -
              0.5;


            element.style.setProperty(
              "--hover-x",
              `${x * 10}px`
            );

            element.style.setProperty(
              "--hover-y",
              `${y * 8}px`
            );

          },
          { passive: true }
        );


        element.addEventListener(
          "pointerleave",
          () => {

            element.style.setProperty(
              "--hover-x",
              "0px"
            );

            element.style.setProperty(
              "--hover-y",
              "0px"
            );

          }
        );

      }
    );

  }


  /* ============================================================
     TOUCH SWIPE FOR DISHES
  ============================================================ */

  if (isTouch.matches) {

    const showcase =
      qs("[data-dish-showcase]");

    let touchStartX = 0;
    let touchStartY = 0;


    showcase?.addEventListener(
      "touchstart",
      (event) => {

        const touch =
          event.touches[0];

        touchStartX =
          touch.clientX;

        touchStartY =
          touch.clientY;

      },
      { passive: true }
    );


    showcase?.addEventListener(
      "touchend",
      (event) => {

        const touch =
          event.changedTouches[0];

        const deltaX =
          touch.clientX -
          touchStartX;

        const deltaY =
          touch.clientY -
          touchStartY;


        if (
          Math.abs(deltaX) <
          45
        ) {
          return;
        }


        if (
          Math.abs(deltaX) <
          Math.abs(deltaY)
        ) {
          return;
        }


        if (deltaX < 0) {

          renderDish(
            activeDish + 1,
            1
          );

        } else {

          renderDish(
            activeDish - 1,
            -1
          );

        }

      },
      { passive: true }
    );

  }


  /* ============================================================
     SCROLL VELOCITY CLASSES
  ============================================================ */

  let velocityClassTimer = null;


  const updateVelocityClass =
    rafThrottle(() => {

      const speed =
        Math.abs(scrollVelocity);


      body.classList.toggle(
        "scrolling-fast",
        speed > 8
      );


      body.classList.toggle(
        "scrolling-medium",
        speed > 2 &&
        speed <= 8
      );


      if (velocityClassTimer) {
        clearTimeout(
          velocityClassTimer
        );
      }


      velocityClassTimer =
        setTimeout(
          () => {

            body.classList.remove(
              "scrolling-fast",
              "scrolling-medium"
            );

          },
          160
        );

    });


  window.addEventListener(
    "scroll",
    updateVelocityClass,
    { passive: true }
  );


  /* ============================================================
     PAGE VISIBILITY
  ============================================================ */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden &&
        pointerRAF
      ) {
        cancelAnimationFrame(
          pointerRAF
        );

        pointerRAF = null;

      } else if (
        !document.hidden &&
        canHover.matches &&
        !reducedMotion &&
        !pointerRAF
      ) {

        pointerRAF =
          requestAnimationFrame(
            updatePointerScene
          );

      }

    }
  );


  /* ============================================================
     RESIZE
  ============================================================ */

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );

      resizeTimer =
        setTimeout(
          () => {

            closeMobileMenu();

            renderDish(
              activeDish,
              1
            );

            updateHeader();

            updateActiveScene();

          },
          180
        );

    },
    { passive: true }
  );


  /* ============================================================
     INITIALIZE SCROLL ENGINE
  ============================================================ */

  updateActiveScene();

  requestAnimationFrame(
    updateScenes
  );


  /* ============================================================
     FINAL READY STATE
  ============================================================ */

  window.setTimeout(
    () => {

      root.classList.add(
        "motion-engine-ready"
      );

      body.classList.add(
        "motion-engine-ready"
      );

    },
    reducedMotion ? 100 : 700
  );


  /* ============================================================
     CLEANUP
  ============================================================ */

  window.addEventListener(
    "beforeunload",
    () => {

      if (pointerRAF) {
        cancelAnimationFrame(
          pointerRAF
        );
      }

    }
  );

})();

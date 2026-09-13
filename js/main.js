/* =========================================================
   MORGAN'S ON MAIN
   PREMIUM INTERACTION ENGINE
   ========================================================= */

(() => {

  "use strict";


  /* =======================================================
     HEADER
  ======================================================= */

  const header = document.querySelector(".site-header");

  const updateHeader = () => {

    if (!header) return;

    header.classList.toggle(
      "scrolled",
      window.scrollY > 50
    );

  };

  window.addEventListener(
    "scroll",
    updateHeader,
    { passive:true }
  );

  updateHeader();


  /* =======================================================
     MOBILE MENU
  ======================================================= */

  const menuToggle =
    document.querySelector(".menu-toggle");

  const siteHeader =
    document.querySelector(".site-header");

  menuToggle?.addEventListener("click", () => {

    siteHeader?.classList.toggle("open");

  });


  document
    .querySelectorAll(".navlinks a")
    .forEach(link => {

      link.addEventListener("click", () => {

        siteHeader?.classList.remove("open");

      });

    });


  /* =======================================================
     SCROLL REVEAL
     ======================================================= */

  const revealObserver =
    new IntersectionObserver(

      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add("in");

          revealObserver.unobserve(
            entry.target
          );

        });

      },

      {
        threshold:.12,
        rootMargin:"0px 0px -60px 0px"
      }

    );


  document
    .querySelectorAll(".reveal")
    .forEach(element => {

      revealObserver.observe(element);

    });


  /* =======================================================
     HERO POINTER DEPTH
     ======================================================= */

  const hero =
    document.querySelector(".hero");

  const heroContent =
    document.querySelector(".hero-content");

  const heroFood =
    document.querySelector(".hero-food-layer");


  let pointerX = 0;
  let pointerY = 0;

  let currentX = 0;
  let currentY = 0;


  if (
    hero &&
    heroFood &&
    window.matchMedia("(hover:hover)").matches
  ) {

    hero.addEventListener(
      "pointermove",
      event => {

        const rect =
          hero.getBoundingClientRect();

        pointerX =
          ((event.clientX - rect.left) /
            rect.width - .5) * 2;

        pointerY =
          ((event.clientY - rect.top) /
            rect.height - .5) * 2;

      }
    );


    hero.addEventListener(
      "pointerleave",
      () => {

        pointerX = 0;
        pointerY = 0;

      }
    );


    const animateHero =
      () => {

        currentX +=
          (pointerX - currentX) * .055;

        currentY +=
          (pointerY - currentY) * .055;


        /*
          CSS variables instead of directly
          fighting the floating animation.
        */

        hero.style.setProperty(
          "--hero-x",
          `${currentX * 22}px`
        );

        hero.style.setProperty(
          "--hero-y",
          `${currentY * 14}px`
        );

        hero.style.setProperty(
          "--hero-rotate",
          `${currentX * 5}deg`
        );


        if (heroContent) {

          heroContent.style.setProperty(
            "--content-x",
            `${currentX * 7}px`
          );

          heroContent.style.setProperty(
            "--content-y",
            `${currentY * 5}px`
          );

        }


        requestAnimationFrame(
          animateHero
        );

      };


    animateHero();

  }


  /* =======================================================
     3D MENU CARDS
     ======================================================= */

  const cards =
    document.querySelectorAll(
      ".menu-card"
    );


  cards.forEach(card => {

    card.addEventListener(
      "pointermove",
      event => {

        if (
          !window.matchMedia(
            "(hover:hover)"
          ).matches
        ) return;


        const rect =
          card.getBoundingClientRect();


        const x =
          (event.clientX - rect.left) /
          rect.width;


        const y =
          (event.clientY - rect.top) /
          rect.height;


        const rotateY =
          (x - .5) * 8;


        const rotateX =
          (y - .5) * -6;


        card.style.setProperty(
          "--card-rx",
          `${rotateX}deg`
        );

        card.style.setProperty(
          "--card-ry",
          `${rotateY}deg`
        );

        card.classList.add(
          "is-hovering"
        );

      }
    );


    card.addEventListener(
      "pointerleave",
      () => {

        card.style.setProperty(
          "--card-rx",
          "0deg"
        );

        card.style.setProperty(
          "--card-ry",
          "0deg"
        );

        card.classList.remove(
          "is-hovering"
        );

      }
    );

  });


  /* =======================================================
     GALLERY DEPTH
     ======================================================= */

  const galleryImages =
    document.querySelectorAll(
      ".gallery-grid img"
    );


  galleryImages.forEach(image => {

    image.addEventListener(
      "pointermove",
      event => {

        if (
          !window.matchMedia(
            "(hover:hover)"
          ).matches
        ) return;


        const rect =
          image.getBoundingClientRect();


        const x =
          (event.clientX - rect.left) /
          rect.width - .5;


        const y =
          (event.clientY - rect.top) /
          rect.height - .5;


        image.style.setProperty(
          "--gallery-rx",
          `${y * -4}deg`
        );

        image.style.setProperty(
          "--gallery-ry",
          `${x * 5}deg`
        );

        image.style.setProperty(
          "--gallery-z",
          "18px"
        );

      }
    );


    image.addEventListener(
      "pointerleave",
      () => {

        image.style.setProperty(
          "--gallery-rx",
          "0deg"
        );

        image.style.setProperty(
          "--gallery-ry",
          "0deg"
        );

        image.style.setProperty(
          "--gallery-z",
          "0px"
        );

      }
    );

  });


  /* =======================================================
     IMAGE DEPTH
     ======================================================= */

  const depthImages =
    document.querySelectorAll(
      ".split-img, .bar-image, .event-img"
    );


  depthImages.forEach(image => {

    image.addEventListener(
      "pointermove",
      event => {

        if (
          !window.matchMedia(
            "(hover:hover)"
          ).matches
        ) return;


        const rect =
          image.getBoundingClientRect();


        const x =
          (event.clientX - rect.left) /
          rect.width - .5;


        const y =
          (event.clientY - rect.top) /
          rect.height - .5;


        image.style.backgroundPosition =
          `${50 + x * 6}% ${50 + y * 6}%`;

      }
    );


    image.addEventListener(
      "pointerleave",
      () => {

        image.style.backgroundPosition =
          "center";

      }
    );

  });


  /* =======================================================
     MAGNETIC BUTTONS
     ======================================================= */

  const magnetic =
    document.querySelectorAll(
      ".btn, .nav-cta, .gold-link"
    );


  magnetic.forEach(element => {

    element.addEventListener(
      "pointermove",
      event => {

        if (
          !window.matchMedia(
            "(hover:hover)"
          ).matches
        ) return;


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


        element.style.setProperty(
          "--mag-x",
          `${x * .10}px`
        );

        element.style.setProperty(
          "--mag-y",
          `${y * .10}px`
        );

      }
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

  });


  /* =======================================================
     PARALLAX SECTIONS
     ======================================================= */

  const parallaxSections =
    document.querySelectorAll(
      ".visual-band"
    );


  const parallaxUpdate =
    () => {

      const viewport =
        window.innerHeight;


      parallaxSections.forEach(section => {

        const rect =
          section.getBoundingClientRect();


        if (
          rect.bottom < 0 ||
          rect.top > viewport
        ) return;


        const progress =
          (viewport - rect.top) /
          (viewport + rect.height);


        const offset =
          (progress - .5) * 35;


        section.style.backgroundPosition =
          `center ${50 + offset}%`;

      });

    };


  window.addEventListener(
    "scroll",
    parallaxUpdate,
    { passive:true }
  );


  /* =======================================================
     SMOOTH ANCHOR NAVIGATION
     ======================================================= */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const target =
            link.getAttribute("href");


          if (
            !target ||
            target === "#"
          ) return;


          const element =
            document.querySelector(target);


          if (!element) return;


          event.preventDefault();


          element.scrollIntoView({
            behavior:"smooth",
            block:"start"
          });

        }
      );

    });


  /* =======================================================
     CARD STAGGER
     ======================================================= */

  document
    .querySelectorAll(
      ".menu-card, .drink, .event-list div"
    )
    .forEach((element, index) => {

      element.style.setProperty(
        "--delay",
        `${Math.min(index * 70,420)}ms`
      );

    });


  /* =======================================================
     CURSOR LIGHT — DESKTOP
     ======================================================= */

  if (
    window.matchMedia("(hover:hover)").matches
  ) {

    const cursorLight =
      document.createElement("div");


    cursorLight.className =
      "cursor-light";


    document.body.appendChild(
      cursorLight
    );


    let cursorX = 0;
    let cursorY = 0;

    let lightX = 0;
    let lightY = 0;


    window.addEventListener(
      "pointermove",
      event => {

        cursorX =
          event.clientX;

        cursorY =
          event.clientY;

      },
      { passive:true }
    );


    const animateCursor =
      () => {

        lightX +=
          (cursorX - lightX) * .10;

        lightY +=
          (cursorY - lightY) * .10;


        cursorLight.style.transform =
          `translate3d(
            ${lightX}px,
            ${lightY}px,
            0
          )`;


        requestAnimationFrame(
          animateCursor
        );

      };


    animateCursor();

  }


  /* =======================================================
     PAGE READY
     ======================================================= */

  document.documentElement.classList.add(
    "experience-ready"
  );

})();

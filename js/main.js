document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.querySelector(".preloader");
  const heroVideo = document.querySelector(".hero-video");
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");

  /* =========================
     PRELOADER
  ========================= */

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add("loaded");

        setTimeout(() => {
          preloader.remove();
        }, 900);
      }
    }, 500);
  });


  /* =========================
     HERO VIDEO
  ========================= */

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.playsInline = true;

    const playVideo = () => {
      const promise = heroVideo.play();

      if (promise !== undefined) {
        promise.catch(() => {
          // Browser may block autoplay.
        });
      }
    };

    if (heroVideo.readyState >= 2) {
      playVideo();
    } else {
      heroVideo.addEventListener("loadeddata", playVideo, {
        once: true
      });
    }
  }


  /* =========================
     HEADER SCROLL
  ========================= */

  const updateHeader = () => {
    if (!header) return;

    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });


  /* =========================
     HERO SCROLL DEPTH
  ========================= */

  let ticking = false;

  const updateHero = () => {
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const progress = Math.min(
      Math.max(-rect.top / viewportHeight, 0),
      1
    );

    /*
      As the user scrolls through the hero:
      - video slowly scales
      - video moves vertically
      - content fades
      - content moves upward
    */

    if (heroVideo) {
      const scale = 1 + progress * 0.12;
      const translateY = progress * -35;

      heroVideo.style.transform =
        `scale(${scale}) translateY(${translateY}px)`;
    }

    if (heroContent) {
      const opacity = Math.max(1 - progress * 1.5, 0);
      const translateY = progress * -70;

      heroContent.style.opacity = opacity;
      heroContent.style.transform =
        `translateY(${translateY}px)`;
    }

    ticking = false;
  };

  const requestHeroUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHero);
      ticking = true;
    }
  };

  window.addEventListener("scroll", requestHeroUpdate, {
    passive: true
  });

  updateHero();


  /* =========================
     SMOOTH ANCHOR NAVIGATION
  ========================= */

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", event => {
      const targetId = anchor.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });


  /* =========================
     MOUSE DEPTH EFFECT
  ========================= */

  if (hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("mousemove", event => {
      const x = (event.clientX / window.innerWidth - 0.5);
      const y = (event.clientY / window.innerHeight - 0.5);

      if (heroVideo) {
        heroVideo.style.setProperty(
          "--mouse-x",
          `${x * 10}px`
        );

        heroVideo.style.setProperty(
          "--mouse-y",
          `${y * 10}px`
        );
      }
    });

    hero.addEventListener("mouseleave", () => {
      if (heroVideo) {
        heroVideo.style.setProperty("--mouse-x", "0px");
        heroVideo.style.setProperty("--mouse-y", "0px");
      }
    });
  }


  /* =========================
     REVEAL SECTIONS
  ========================= */

  const revealElements = document.querySelectorAll(
    ".reveal, .menu-card, .review-card, .visit-content"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    revealElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach(element => {
      element.classList.add("is-visible");
    });
  }


  /* =========================
     POWER BUTTON MICRO EFFECT
  ========================= */

  const powerButton = document.querySelector(".power-button");

  if (powerButton) {
    powerButton.addEventListener("mousemove", event => {
      const rect = powerButton.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      powerButton.style.setProperty("--button-x", `${x}px`);
      powerButton.style.setProperty("--button-y", `${y}px`);
    });

    powerButton.addEventListener("mouseleave", () => {
      powerButton.style.removeProperty("--button-x");
      powerButton.style.removeProperty("--button-y");
    });
  }


  /* =========================
     REDUCED MOTION
  ========================= */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (reducedMotion.matches) {
    if (heroVideo) {
      heroVideo.style.transform = "none";
    }

    if (heroContent) {
      heroContent.style.opacity = "1";
      heroContent.style.transform = "none";
    }
  }
});

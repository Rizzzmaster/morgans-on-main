/* =========================================
   MORGAN'S ON MAIN — 3D FOOD EXPERIENCE
   ========================================= */

const header = document.querySelector('.site-header');

/* Header */
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
});


/* Mobile Menu */
const toggle = document.querySelector('.menu-toggle');

toggle?.addEventListener('click', () => {
  document.querySelector('.site-header')?.classList.toggle('open');
});


/* =========================================
   SCROLL REVEAL
   ========================================= */

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  },
  {
    threshold: 0.12
  }
);

document.querySelectorAll('.reveal').forEach(element => {
  observer.observe(element);
});


/* =========================================
   SMOOTH ANCHOR LINKS
   ========================================= */

document.querySelectorAll('a[href^="#"]').forEach(link => {

  link.addEventListener('click', event => {

    const id = link.getAttribute('href');

    if (id && id.length > 1) {
      event.preventDefault();

      document.querySelector(id)?.scrollIntoView({
        behavior: 'smooth'
      });
    }

    document
      .querySelector('.site-header')
      ?.classList.remove('open');

  });

});


/* =========================================
   3D FOOD CARD TILT
   ========================================= */

const cards = document.querySelectorAll(
  '.menu-card, .drink, .gallery-grid img'
);

cards.forEach(card => {

  card.addEventListener('mousemove', event => {

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform =
      `perspective(900px)
       rotateX(${rotateX}deg)
       rotateY(${rotateY}deg)
       translateY(-6px)`;

  });

  card.addEventListener('mouseleave', () => {

    card.style.transform =
      'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';

  });

});


/* =========================================
   HERO DEPTH PARALLAX
   ========================================= */

/* =========================================
   3D HERO FOOD MOVEMENT
========================================= */

const hero = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');
const heroFood = document.querySelector('.hero-food-layer');

if (hero) {

  hero.addEventListener('mousemove', event => {

    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;

    /* Text moves gently */
    if (heroContent) {
      heroContent.style.transform =
        `translate3d(${x * 8}px, ${y * 8}px, 0)`;
    }

    /* Food moves much more — creating depth */
    if (heroFood) {
      heroFood.style.transform =
        `translate3d(${x * 28}px, calc(-50% + ${y * 20}px), 35px)
         rotateY(${-12 + x * 8}deg)
         rotateX(${5 - y * 6}deg)`;
    }

  });

  hero.addEventListener('mouseleave', () => {

    if (heroContent) {
      heroContent.style.transform =
        'translate3d(0,0,0)';
    }

    if (heroFood) {
      heroFood.style.transform =
        'translateY(-50%) rotateY(-12deg) rotateX(5deg)';
    }

  });

}
if (hero && heroContent) {

  hero.addEventListener('mousemove', event => {

    const x =
      (event.clientX / window.innerWidth - 0.5) * 2;

    const y =
      (event.clientY / window.innerHeight - 0.5) * 2;

    heroContent.style.transform =
      `translate3d(${x * 10}px, ${y * 10}px, 0)`;

  });

  hero.addEventListener('mouseleave', () => {

    heroContent.style.transform =
      'translate3d(0,0,0)';

  });

}


/* =========================================
   MAGNETIC BUTTONS
   ========================================= */

const magneticButtons = document.querySelectorAll(
  '.btn, .nav-cta, .gold-link'
);

magneticButtons.forEach(button => {

  button.addEventListener('mousemove', event => {

    const rect = button.getBoundingClientRect();

    const x =
      event.clientX - rect.left - rect.width / 2;

    const y =
      event.clientY - rect.top - rect.height / 2;

    button.style.transform =
      `translate(${x * 0.12}px, ${y * 0.12}px)`;

  });

  button.addEventListener('mouseleave', () => {

    button.style.transform = '';

  });

});


/* =========================================
   IMAGE DEPTH EFFECT
   ========================================= */

document.querySelectorAll(
  '.split-img, .visual-band, .bar-image, .event-img'
).forEach(image => {

  image.addEventListener('mousemove', event => {

    const rect = image.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width - 0.5;

    const y =
      (event.clientY - rect.top) / rect.height - 0.5;

    image.style.backgroundPosition =
      `${50 + x * 8}% ${50 + y * 8}%`;

  });

  image.addEventListener('mouseleave', () => {

    image.style.backgroundPosition = 'center';

  });

});


/* =========================================
   MOBILE SAFETY
   ========================================= */

if (window.matchMedia('(hover: none)').matches) {

  document.querySelectorAll(
    '.menu-card, .drink, .gallery-grid img'
  ).forEach(element => {

    element.style.transform = '';

  });

}

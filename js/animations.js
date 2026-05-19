document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCountingAnimations();
  initParticles();
  initTestimonialsCarousel();
});

function initScrollAnimations() {
  const targets = document.querySelectorAll('.anim-init');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

function initCountingAnimations() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCount(el) {
  const raw = el.getAttribute('data-count');
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1800;
  const isFloat = raw.includes('.');

  const numStr = raw.replace(/[^0-9.]/g, '');
  const target = parseFloat(numStr);

  const start = performance.now();

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOut(progress);
    const current = target * eased;

    let display;
    if (isFloat) {
      display = current.toFixed(1);
    } else {
      display = Math.round(current).toLocaleString('de-DE');
    }

    el.textContent = prefix + display + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = prefix + (isFloat ? target.toFixed(1) : target.toLocaleString('de-DE')) + suffix;
    }
  }

  requestAnimationFrame(tick);
}

function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const colors = ['#A8D8EA', '#7B5EA7', '#C8F560', '#ffffff'];
  const count = window.innerWidth < 768 ? 15 : 30;

  for (let i = 0; i < count; i++) {
    createParticle(container, colors);
  }
}

function createParticle(container, colors) {
  const p = document.createElement('div');
  p.className = 'particle';

  const size = Math.random() * 4 + 1;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const delay = Math.random() * 15;
  const duration = Math.random() * 15 + 10;
  const dx = (Math.random() - 0.5) * 200;

  p.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    left: ${left}%;
    bottom: -10px;
    opacity: ${Math.random() * 0.6 + 0.2};
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    --dx: ${dx}px;
    box-shadow: 0 0 ${size * 2}px ${color};
  `;

  container.appendChild(p);
}

function initTestimonialsCarousel() {
  const carousel = document.querySelector('.testimonials-carousel');
  const dots = document.querySelectorAll('.testimonials-nav__dot');
  if (!carousel || !dots.length) return;

  const cards = carousel.querySelectorAll('.testimonial-card');
  let active = 0;

  function setDot(index) {
    dots.forEach((d, i) => {
      d.classList.toggle('testimonials-nav__dot--active', i === index);
    });
    active = index;
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const card = cards[i];
      if (card) {
        carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
        setDot(i);
      }
    });
  });

  carousel.addEventListener('scroll', () => {
    const scrollLeft = carousel.scrollLeft;
    cards.forEach((card, i) => {
      const cardLeft = card.offsetLeft - carousel.offsetLeft;
      if (Math.abs(scrollLeft - cardLeft) < card.offsetWidth / 2) {
        setDot(i);
      }
    });
  }, { passive: true });

  setDot(0);
}

function initBlogFilter() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.blog-card[data-category]');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('filter-tab--active'));
      tab.classList.add('filter-tab--active');

      const filter = tab.getAttribute('data-filter');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = show ? '1' : '0';
        card.style.transform = show ? 'scale(1)' : 'scale(0.95)';
        card.style.pointerEvents = show ? '' : 'none';
      });
    });
  });
}

window.initBlogFilter = initBlogFilter;

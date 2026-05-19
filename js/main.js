document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initSmoothScroll();
  initDropdowns();
  setActiveNavLink();
});

function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const overlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');

  if (!hamburger || !overlay) return;

  const openMenu = () => {
    hamburger.classList.add('header__hamburger--open');
    overlay.classList.add('header__mobile-overlay--open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    hamburger.classList.remove('header__hamburger--open');
    overlay.classList.remove('header__mobile-overlay--open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = overlay.classList.contains('header__mobile-overlay--open');
    isOpen ? closeMenu() : openMenu();
  });

  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  overlay.querySelectorAll('.header__mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

function initDropdowns() {
  const items = document.querySelectorAll('.header__nav-item');

  items.forEach(item => {
    const toggle = item.querySelector('.header__dropdown-toggle');
    const dropdown = item.querySelector('.header__dropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = item.classList.contains('header__nav-item--open');
      items.forEach(i => i.classList.remove('header__nav-item--open'));
      if (!isOpen) item.classList.add('header__nav-item--open');
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', () => {
    items.forEach(i => i.classList.remove('header__nav-item--open'));
  });
}

function setActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.header__nav-link, .header__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (
      (path === '/' && href === '/') ||
      (path !== '/' && href !== '/' && path.startsWith(href))
    ) {
      link.classList.add('header__nav-link--active');
    }
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initMultiStepForm() {
  const form = document.getElementById('multiStepForm');
  if (!form) return;

  let currentStep = 0;
  const steps = form.querySelectorAll('.form-step');
  const stepperCircles = document.querySelectorAll('.stepper__circle');
  const stepperLines = document.querySelectorAll('.stepper__line');
  const progressBar = document.getElementById('formProgress');

  function showStep(index) {
    steps.forEach((s, i) => {
      s.classList.toggle('form-step--active', i === index);
    });
    stepperCircles.forEach((c, i) => {
      c.parentElement.classList.toggle('stepper__step--active', i === index);
      c.parentElement.classList.toggle('stepper__step--done', i < index);
    });
    if (progressBar) {
      progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;
    }
    currentStep = index;
  }

  form.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        showStep(currentStep + 1);
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
      }
    });
  });

  form.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      showStep(currentStep - 1);
    });
  });

  const budgetBtns = form.querySelectorAll('.budget-btn');
  budgetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      budgetBtns.forEach(b => b.classList.remove('budget-btn--active'));
      btn.classList.add('budget-btn--active');
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    submitForm();
  });

  function validateStep(index) {
    const step = steps[index];
    let valid = true;
    step.querySelectorAll('[required]').forEach(input => {
      const group = input.closest('.form-group');
      if (!input.value.trim()) {
        group && group.classList.add('form-group--error');
        valid = false;
      } else {
        group && group.classList.remove('form-group--error');
      }
    });
    const privacyCb = step.querySelector('input[type="checkbox"][required]');
    if (privacyCb && !privacyCb.checked) {
      privacyCb.closest('.form-group') && privacyCb.closest('.form-group').classList.add('form-group--error');
      valid = false;
    }
    return valid;
  }

  function submitForm() {
    const formWrapper = document.getElementById('formWrapper');
    const successEl = document.getElementById('formSuccess');
    if (formWrapper) formWrapper.style.display = 'none';
    if (successEl) successEl.style.display = 'block';
  }

  showStep(0);
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach(input => {
      const group = input.closest('.form-group');
      if (!input.value.trim()) {
        group && group.classList.add('form-group--error');
        valid = false;
      } else {
        group && group.classList.remove('form-group--error');
      }
    });

    const privacyCb = form.querySelector('input[type="checkbox"][required]');
    if (privacyCb && !privacyCb.checked) {
      valid = false;
    }

    if (valid) {
      const successMsg = document.getElementById('contactSuccess');
      if (successMsg) {
        form.style.display = 'none';
        successMsg.style.display = 'block';
      }
    }
  });
}

window.initMultiStepForm = initMultiStepForm;
window.initContactForm = initContactForm;

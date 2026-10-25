'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let savedMotion = null;
  try { savedMotion = localStorage.getItem('nmnh-motion'); } catch {}
  let motionEnabled = savedMotion ? savedMotion === 'on' : !reducedPreference.matches;
  const body = document.body;
  const motionButton = $('.motion-toggle');
  const header = $('.site-header');
  const hero = $('.hero');
  const heroImage = $('.hero-image');
  const cinema = $('.cinema');
  const cinemaCopy = $('.cinema-copy');
  const strips = $$('.cinema-strip');
  const percent = $('.cinema-percent');
  const progressBar = $('.scroll-progress');
  const intro = $('.intro-loader');
  const menuToggle = $('.menu-toggle');
  const menu = $('.mobile-menu');
  const dialog = $('.contact-dialog');
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  let rafQueued = false;
  let cinemaTop = 0, cinemaTravel = 1, wordTop = 0, wordHeight = 1;
  let lastFocused = null;

  // Read once on resize; scroll frames only update compositor-friendly properties.
  const sentence = $('.reveal-words');
  const words = sentence ? sentence.textContent.trim().split(/\s+/) : [];
  if (sentence) sentence.textContent = '';
  sentence?.setAttribute('aria-label', words.join(' '));
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    span.setAttribute('aria-hidden', 'true');
    sentence.append(span);
    if (i < words.length - 1) sentence.append(' ');
  });
  const wordSpans = sentence ? $$('.word', sentence) : [];

  function measure() {
    const y = window.scrollY;
    if (cinema) {
      cinemaTop = cinema.getBoundingClientRect().top + y;
      const stage = $('.cinema-sticky');
      cinemaTravel = Math.max(1, cinema.offsetHeight - stage.offsetHeight);
      const rect = $('.cinema-strips').getBoundingClientRect();
      const imageWidth = Math.max(rect.width, stage.offsetHeight * (1672 / 941));
      const imageHeight = imageWidth / (1672 / 941);
      strips.forEach((strip, i) => {
        strip.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;
        strip.style.backgroundPosition = `${-(imageWidth - rect.width) / 2 - i * rect.width / 8}px ${-(imageHeight - stage.offsetHeight) / 2}px`;
      });
    }
    if (sentence) { wordTop = sentence.getBoundingClientRect().top + y; wordHeight = sentence.offsetHeight; }
    requestRender();
  }

  function updateMotion() {
    body.classList.toggle('motion-off', !motionEnabled);
    document.documentElement.classList.toggle('motion-off', !motionEnabled);
    if (motionButton) motionButton.textContent = `MOTION: ${motionEnabled ? 'ON' : 'OFF'}`;
    motionButton?.setAttribute('aria-pressed', String(!motionEnabled));
    if (!motionEnabled) {
      cinema?.classList.remove('is-complete');
      if (percent) percent.textContent = '—';
      if (heroImage) heroImage.style.transform = '';
      strips.forEach(strip => strip.style.transform = '');
      if (cinemaCopy) { cinemaCopy.style.transform = ''; cinemaCopy.style.opacity = ''; }
      strips.forEach(strip => strip.style.opacity = '');
      wordSpans.forEach(word => word.classList.add('lit'));
    }
    window.dispatchEvent(new CustomEvent('nmnh:motion', { detail: { enabled: motionEnabled } }));
    measure();
  }

  function render() {
    rafQueued = false;
    const y = window.scrollY;
    const height = window.innerHeight;
    const total = document.documentElement.scrollHeight - height;
    progressBar.style.transform = `scaleX(${total > 0 ? y / total : 0})`;
    header.classList.toggle('scrolled', y > 95);
    if (!motionEnabled) return;
    if (hero && heroImage && y < hero.offsetHeight + height / 3) {
      heroImage.style.transform = `translate3d(0,${y * .22}px,0) scale(${1 + Math.min(y, 1000) * .000065})`;
    }
    const wordProgress = clamp((y + height * .85 - wordTop) / (wordHeight + height * .35));
    const lit = Math.ceil(wordProgress * wordSpans.length);
    wordSpans.forEach((word, i) => word.classList.toggle('lit', i < lit));
    if (!cinema) return;
    const p = clamp((y - cinemaTop) / cinemaTravel);
    percent.textContent = `${String(Math.floor(p * 100 + 0.00001)).padStart(3, '0')}%`;
    cinema.classList.toggle('is-complete', p >= 1);
    if (y + height > cinemaTop && y <= cinemaTop + cinema.offsetHeight + height) {
      strips.forEach((strip, i) => {
        const stagger = i % 2 ? .08 : 0;
        const amount = clamp((p - .06 - stagger) / .78);
        const eased = amount * amount * (3 - 2 * amount);
        const direction = i % 2 ? 1 : -1;
        const angle = direction * eased * (i % 3 === 0 ? 30 : 14);
        const distance = direction * eased * ($('.cinema-sticky').offsetHeight * 1.65 + Math.abs(i - 3.5) * 48);
        strip.style.opacity = String(1 - clamp((p - .91) / .075));
        strip.style.transform = `translate3d(${(i - 3.5) * eased * 15}px,${distance}px,${-eased * 90}px) rotateX(${angle}deg) rotateZ(${direction * eased * 4}deg)`;
      });
      const textScale = .92 + Math.min(p, .85) * .15;
      cinemaCopy.style.transform = `translate3d(0,${-45 - p * 7}%,0) scale(${textScale})`;
      cinemaCopy.style.opacity = String(1 - clamp((p - .82) / .25) * .5);
    }
  }

  function requestRender() {
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(render);
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  document.fonts?.ready.then(measure);
  motionButton?.addEventListener('click', () => {
    motionEnabled = !motionEnabled;
    try { localStorage.setItem('nmnh-motion', motionEnabled ? 'on' : 'off'); } catch {}
    updateMotion();
  });
  reducedPreference.addEventListener('change', event => {
    motionEnabled = !event.matches;
    updateMotion();
  });

  // A short opening beat; the page remains clickable and never waits on assets.
  const start = performance.now();
  function loadFrame(now) {
    const p = clamp((now - start) / (motionEnabled ? 650 : 0.1));
    $('.loader-number').textContent = String(Math.floor(p * 100)).padStart(3, '0');
    $('.loader-line').style.width = `${p * 100}%`;
    if (p < 1) requestAnimationFrame(loadFrame);
    else {
      intro.classList.add('finished');
      body.classList.add('loaded');
      setTimeout(() => intro.remove(), motionEnabled ? 900 : 20);
    }
  }
  if (intro) requestAnimationFrame(loadFrame);
  else body.classList.add('loaded');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }), { threshold: .14 });
    $$('.reveal').forEach(el => observer.observe(el));
  } else $$('.reveal').forEach(el => el.classList.add('in-view'));

  const serviceItems = $$('.service-item');
  const visual = $('.service-visual');
  serviceItems.forEach(item => {
    $('h3 button', item).addEventListener('click', () => {
      serviceItems.forEach(other => {
        const active = other === item;
        other.classList.toggle('active', active);
        $('h3 button', other).setAttribute('aria-expanded', String(active));
        $('.service-detail', other).hidden = !active;
      });
      if (!visual) return;
      visual.dataset.active = item.dataset.service;
      $('.visual-code').textContent = `[ ${String(Number(item.dataset.service) + 1).padStart(2, '0')} / 05 ]`;
      measure();
    });
  });

  function closeMenu() {
    menu.hidden = true;
    $('#main').inert = false;
    $('.site-footer').inert = false;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Menü öffnen');
    if (!dialog.open) body.classList.remove('dialog-open');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    menu.hidden = !open;
    body.classList.toggle('dialog-open', open);
    $('#main').inert = open;
    $('.site-footer').inert = open;
    if (open) $('a', menu).focus();
  });
  $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); menuToggle.focus(); }
    if (event.key === 'Tab' && !menu.hidden) {
      const items = [menuToggle, ...$$('a, button', menu)];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(max-width: 760px)').addEventListener('change', event => {
    if (!event.matches && !menu.hidden) closeMenu();
  });

  $$('.contact-trigger').forEach(button => button.addEventListener('click', () => {
    lastFocused = menu.contains(button) ? menuToggle : button;
    closeMenu();
    dialog.showModal();
    body.classList.add('dialog-open');
  }));
  $('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    body.classList.remove('dialog-open');
    lastFocused?.focus({ preventScroll: true });
  });
  $('#project-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Projektanfrage: ${data.get('service')}`;
    const content = `Hallo No Money No Honey,\n\nmein Name ist ${data.get('name')}.\n\nIch interessiere mich für: ${data.get('service')}\n\n${data.get('message')}\n\nMeine E-Mail: ${data.get('email')}\n\nViele Grüße\n${data.get('name')}`;
    $('.email-fallback').hidden = false;
    window.location.href = `mailto:kontakt@nomoneynohoney.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
  });

  // Use a light cursor accent only on the cinematic artwork and fine pointers.
  const cursor = $('.cursor-label');
  if (cinema && cursor && window.matchMedia('(pointer: fine)').matches) {
    cinema.addEventListener('pointermove', event => {
      if (!motionEnabled) return;
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.style.opacity = '1';
    });
    cinema.addEventListener('pointerleave', () => cursor.style.opacity = '0');
  }
  $('#year').textContent = String(new Date().getFullYear());
  updateMotion();
})();

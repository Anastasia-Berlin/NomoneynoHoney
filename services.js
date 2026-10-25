'use strict';
(() => {
  const page = document.querySelector('.service-page');
  if (!page) return;
  const scene = page.querySelector('[data-sv-scene]');
  if (!scene) return;
  const chapters = [...scene.querySelectorAll('[data-sv-step]')];
  const labels = [...scene.querySelectorAll('[data-sv-label]')];
  const counter = scene.querySelector('[data-sv-counter]');
  const visual = scene.querySelector('.sv-story-visual');
  let chapterPositions = [];
  let sceneStart = 0;
  let sceneEnd = 1;
  let queued = false;
  let previousStage = -1;
  const clamp = value => Math.min(1, Math.max(0, value));

  function render() {
    queued = false;
    scene.classList.toggle('sv-static', document.documentElement.classList.contains('motion-off') || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const anchor = window.scrollY + window.innerHeight * .54;
    let stage = 0;
    chapterPositions.forEach((position, index) => {
      if (anchor >= position) stage = index;
    });
    if (stage !== previousStage) {
      scene.dataset.stage = String(stage);
      if (counter) counter.textContent = String(stage + 1).padStart(2, '0');
      labels.forEach((label, index) => label.classList.toggle('is-active', index === stage));
      chapters.forEach((chapter, index) => chapter.classList.toggle('sv-active', index === stage));
      previousStage = stage;
    }
    if (visual) visual.style.setProperty('--sv-progress', String(clamp((anchor - sceneStart) / (sceneEnd - sceneStart))));
  }

  function requestRender() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }

  function measure() {
    const y = window.scrollY;
    chapterPositions = chapters.map(chapter => chapter.getBoundingClientRect().top + y);
    sceneStart = chapterPositions[0] || 0;
    const last = chapters[chapters.length - 1];
    sceneEnd = Math.max(sceneStart + 1, last ? last.getBoundingClientRect().bottom + y : sceneStart + 1);
    requestRender();
  }

  // Pause decorative loops outside the viewport; reading and scroll never wait.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('sv-is-visible', entry.isIntersecting));
    }, { rootMargin: '100px 0px', threshold: 0 });
    page.querySelectorAll('.sv-art, .sv-cta').forEach(element => observer.observe(element));
  } else {
    page.querySelectorAll('.sv-art, .sv-cta').forEach(element => element.classList.add('sv-is-visible'));
  }

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  window.addEventListener('nmnh:motion', requestRender);
  document.fonts?.ready.then(measure);
  // Native FAQ opening changes the document's length; keep progress synchronized.
  page.querySelectorAll('details').forEach(details => details.addEventListener('toggle', measure));
  measure();
})();

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const heroVideo = document.querySelector('.hero__video-bg');
  const journey = document.querySelector('.process-steps');
  const rabbits = [...document.querySelectorAll('.service-card__rabbit')];
  let frame = 0;

  function render() {
    frame = 0;
    if (reduceMotion.matches) return;
    const height = window.innerHeight || 1;
    if (journey) {
      const bounds = journey.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (height * .88 - bounds.top) / (height * .48)));
      journey.style.setProperty('--journey-progress', progress.toFixed(3));
    }
    rabbits.forEach((rabbit, index) => {
      const bounds = rabbit.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > height) return;
      const position = Math.max(-1, Math.min(1, (bounds.top + bounds.height / 2 - height / 2) / (height / 2)));
      const travel = window.innerWidth < 768 ? 4 : 8;
      rabbit.style.setProperty('--bunny-drift', `${(-position * travel).toFixed(1)}px`);
      rabbit.style.setProperty('--bunny-tilt', `${(position * (index % 2 ? 2 : -2)).toFixed(1)}deg`);
    });
  }
  function requestRender() {
    if (!frame && !reduceMotion.matches) frame = requestAnimationFrame(render);
  }
  function applyPreference() {
    if (reduceMotion.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (heroVideo) heroVideo.pause();
      rabbits.forEach(rabbit => {
        rabbit.style.removeProperty('--bunny-drift');
        rabbit.style.removeProperty('--bunny-tilt');
      });
      document.querySelectorAll('.anim-init').forEach(el => el.classList.add('anim-visible'));
    } else {
      if (heroVideo && heroVideo.paused) heroVideo.play().catch(() => {});
      requestRender();
    }
  }
  root.classList.add('motion-ready');
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  reduceMotion.addEventListener('change', applyPreference);
  applyPreference();
})();

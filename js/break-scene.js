(() => {
  const section = document.querySelector('.break-scene');
  if (!section) return;
  const stage = section.querySelector('.break-scene__stage');
  const slices = [...section.querySelectorAll('.break-scene__slice')];
  const copy = section.querySelector('.break-scene__copy');
  const percent = section.querySelector('.break-scene__percent');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      document.body.classList.toggle('break-scene-active', entries[0].isIntersecting);
    }, { threshold: .1 }).observe(stage);
  }
  const clamp = n => Math.max(0, Math.min(1, n));
  let frame = 0;
  function measure() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const imageWidth = Math.max(rect.width, rect.height * (1672 / 941));
    const imageHeight = imageWidth / (1672 / 941);
    slices.forEach((slice, i) => {
      slice.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;
      slice.style.backgroundPosition = `${-(imageWidth - rect.width) / 2 - i * rect.width / slices.length}px ${-(imageHeight - rect.height) / 2}px`;
    });
  }
  function render() {
    frame = 0;
    if (media.matches) return;
    const top = section.getBoundingClientRect().top;
    const travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
    const p = clamp(-top / travel);
    percent.textContent = `${String(Math.floor(p * 100)).padStart(3, '0')}%`;
    if (top > innerHeight || top + section.offsetHeight < 0) return;
    slices.forEach((slice, i) => {
      const amount = clamp((p - .06 - (i % 2 ? .08 : 0)) / .78);
      const eased = amount * amount * (3 - 2 * amount);
      const direction = i % 2 ? 1 : -1;
      const distance = direction * eased * (stage.offsetHeight * 1.65 + Math.abs(i - 3.5) * 48);
      slice.style.opacity = String(1 - clamp((p - .91) / .075));
      slice.style.transform = `translate3d(${(i - 3.5) * eased * 15}px,${distance}px,0) rotate(${direction * eased * 4}deg)`;
    });
    copy.style.transform = `translateY(-50%) scale(${.94 + Math.min(p,.85) * .12})`;
  }
  function schedule() { if (!frame && !media.matches) frame = requestAnimationFrame(render); }
  function preference() {
    section.classList.toggle('is-motion', !media.matches);
    if (media.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      slices.forEach(slice => { slice.style.transform = ''; slice.style.opacity = ''; });
      copy.style.transform = '';
      percent.textContent = '—';
    } else { measure(); schedule(); }
  }
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', () => { measure(); schedule(); }, {passive: true});
  media.addEventListener('change', preference);
  preference();
})();

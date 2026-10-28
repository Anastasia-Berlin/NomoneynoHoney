(() => {
  const deck = document.querySelector('.pain-deck');
  if (!deck) return;
  const cards = [...deck.querySelectorAll('[data-pain-card]')];
  const controls = deck.querySelector('.pain-deck__controls');
  const count = deck.querySelector('.pain-deck__count');
  const hint = deck.querySelector('.pain-deck__hint');
  let active = 0;
  let touchStart = null;
  function show(index) {
    active = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      const position = (i - active + cards.length) % cards.length;
      card.dataset.position = position;
      card.setAttribute('aria-hidden', position === 0 ? 'false' : 'true');
    });
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }
  deck.querySelector('[data-pain-prev]').addEventListener('click', () => show(active - 1));
  deck.querySelector('[data-pain-next]').addEventListener('click', () => show(active + 1));
  deck.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(active - 1); }
  });
  const stage = deck.querySelector('.pain-deck__stage');
  stage.addEventListener('click', e => {
    const card = e.target.closest('[data-pain-card]');
    if (card && cards.includes(card)) show(cards.indexOf(card));
  });
  stage.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, {passive:true});
  stage.addEventListener('touchend', e => {
    if (touchStart === null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    touchStart = null;
    if (Math.abs(dx) > 45) show(active + (dx < 0 ? 1 : -1));
  }, {passive:true});
  show(0);
  deck.classList.add('is-enhanced');
  controls.hidden = false;
  hint.hidden = false;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { deck.classList.add('is-in-view'); observer.disconnect(); }
    }, { threshold: .15 });
    observer.observe(deck);
  } else deck.classList.add('is-in-view');
})();

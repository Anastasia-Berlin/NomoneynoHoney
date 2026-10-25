'use strict';
(() => {
  const main = document.querySelector('.editorial-page');
  if (!main) return;
  const $$ = selector => [...main.querySelectorAll(selector)];
  const $ = selector => main.querySelector(selector);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionAllowed = () => !reduced.matches && !document.documentElement.classList.contains('motion-off');

  if ('IntersectionObserver' in window) {
    if (motionAllowed()) main.classList.add('ed-motion');
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('ed-visible');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    $$('.ed-reveal').forEach(el => reveal.observe(el));
  }

  // Filters are buttons with a stable live result count; every card exists in HTML.
  const filters = $$('[data-ed-filter]');
  const cards = $$('[data-ed-category]');
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.edFilter;
    filters.forEach(other => {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    cards.forEach(card => {
      const visible = category === 'all' || card.dataset.edCategory === category;
      card.hidden = !visible;
      if (visible) {
        count++;
        card.classList.add('ed-visible');
      }
    });
    const counter = $('[data-ed-count]');
    if (counter) counter.textContent = `${String(count).padStart(2, '0')} ${count === 1 ? 'GEDANKE' : 'GEDANKEN'}`;
  }));

  // The article navigation follows the current chapter without altering scrolling.
  const chapters = $$('.ed-article-section');
  const tocLinks = $$('.ed-toc nav a');
  if (chapters.length && tocLinks.length && 'IntersectionObserver' in window) {
    const toc = new IntersectionObserver(entries => {
      const firstVisible = entries.find(entry => entry.isIntersecting);
      if (!firstVisible) return;
      const id = `#${firstVisible.target.id}`;
      tocLinks.forEach(link => {
        const active = link.getAttribute('href') === id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    chapters.forEach(chapter => toc.observe(chapter));
  }

  const form = $('#ed-brief-form');
  if (!form) return;
  const serviceInputs = [...form.querySelectorAll('input[name="services"]')];
  const budgetInput = form.elements.namedItem('budget');
  const serviceSummary = $('[data-ed-service-summary]');
  const budgetSummary = $('[data-ed-budget-summary]');
  const progress = $('.ed-brief-line>span');
  function updateSummary() {
    const services = serviceInputs.filter(input => input.checked).map(input => input.value);
    if (serviceSummary) serviceSummary.textContent = services.length ? services.join(' + ') : 'Noch offen. Gute Fragen sind ein guter Anfang.';
    if (budgetSummary) budgetSummary.textContent = budgetInput.value;
    const hasGoal = form.elements.namedItem('objective').value.trim().length > 0;
    const hasContact = form.elements.namedItem('name').value.trim().length > 0 && form.elements.namedItem('email').value.trim().length > 0;
    const completeness = 20 + (services.length ? 25 : 0) + (hasGoal ? 25 : 0) + (hasContact ? 30 : 0);
    if (progress) progress.style.width = `${completeness}%`;
  }
  form.addEventListener('input', updateSummary);
  form.addEventListener('change', updateSummary);
  updateSummary();

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const services = fields.getAll('services');
    const subject = `Projektanfrage — ${fields.get('name')}`;
    const message = [
      'Hallo No Money No Honey,', '',
      'ich möchte mit euch über folgendes Vorhaben sprechen:', '',
      String(fields.get('objective') || '').trim(), '',
      `Mein Name: ${fields.get('name')}`,
      `E-Mail: ${fields.get('email')}`,
      `Telefon: ${fields.get('phone') || 'Nicht angegeben'}`,
      `Website: ${fields.get('website') || 'Nicht angegeben'}`,
      `Interesse: ${services.length ? services.join(', ') : 'Gemeinsam herausfinden'}`,
      `Monatlicher Marketingrahmen: ${fields.get('budget') || 'Noch offen'}`,
      '', 'Ich freue mich auf ein erstes Gespräch.'
    ].join('\n');
    const mailto = `mailto:kontakt@nomoneynohoney.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    const result = $('.ed-mail-result');
    const text = $('[data-ed-mail-text]');
    const reopen = $('.ed-mail-open');
    text.value = `Betreff: ${subject}\n\n${message}`;
    reopen.href = mailto;
    result.hidden = false;
    window.location.href = mailto;
  });

  $('[data-ed-copy]')?.addEventListener('click', async () => {
    const text = $('[data-ed-mail-text]');
    const status = $('[data-ed-copy-status]');
    try {
      await navigator.clipboard.writeText(text.value);
      status.textContent = 'TEXT KOPIERT. DU KANNST IHN IN DEINE E-MAIL EINFÜGEN.';
    } catch {
      text.focus();
      text.select();
      status.textContent = 'TEXT MARKIERT. BITTE MIT DER KOPIERFUNKTION DEINES GERÄTS KOPIEREN.';
    }
  });
})();

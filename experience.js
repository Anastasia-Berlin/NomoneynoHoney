'use strict';
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = n => Math.min(1, Math.max(0, n));
  const reduced = () => document.documentElement.classList.contains('motion-off') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lab = $('.honey-lab');
  const cta = $('.honey-cta');
  const process = $('.process-constellation');
  const nodes = $$('.process-node');
  let measurePending = false, framePending = false;
  let labTop = 0, ctaTop = 0;
  const processSection = $('.process-scroll');
  const processPin = $('.process-pin');
  const connector = $('.connector-energy');
  const spark = $('.process-spark');
  let processTop = 0, processTravel = 1, pathLength = 0, previousPhase = -1;
  let processEnhanced = false;
  const phaseLabels = ['THE FIRST HELLO', 'THE GAME PLAN', 'LET’S BUILD', 'ALWAYS EVOLVING'];
  const mobileCopy = [
    'Dein Business, deine Ziele, deine Baustellen. Wir lernen uns kennen.',
    'Aus deinen Zielen wird eine konkrete Strategie. Mit passenden Maßnahmen.',
    'Strategie wird Realität. Mit kurzen Wegen und dir als Teil des Teams.',
    'Messen, lernen, optimieren. Wir entwickeln weiter, was wirkt.'
  ];
  function configureProcess() {
    if (!processSection) return;
    processEnhanced = !reduced() && innerHeight >= 620;
    processSection.classList.toggle('process-is-enhanced', processEnhanced);
  }

  function measure() {
    measurePending = false;
    configureProcess();
    const y = scrollY;
    if (lab) labTop = lab.getBoundingClientRect().top + y;
    if (cta) ctaTop = cta.getBoundingClientRect().top + y;
    if (processSection) {
      processTop = processSection.getBoundingClientRect().top + y;
      processTravel = Math.max(1, processSection.offsetHeight - processPin.offsetHeight);
    }
    if (process) {
      const width = process.clientWidth, height = process.clientHeight;
      const points = nodes.map(node => {
        const bubble = $('.process-bubble', node);
        return [node.offsetLeft + bubble.offsetLeft + bubble.offsetWidth / 2, node.offsetTop + bubble.offsetTop + bubble.offsetHeight / 2];
      });
      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        if (innerWidth <= 760 && processEnhanced) {
          if (i === 2) {
            const heading = $('h3', nodes[1]);
            const headingBottom = nodes[1].offsetTop + heading.offsetTop + heading.offsetHeight;
            const nextTop = nodes[2].offsetTop + $('.process-bubble', nodes[2]).offsetTop;
            const bridgeY = (headingBottom + nextTop) / 2;
            const right = width - 2, left = 2;
            d += ` C ${right} ${a[1]} ${right} ${bridgeY} ${right - 10} ${bridgeY} L ${left + 10} ${bridgeY} Q ${left} ${bridgeY} ${left} ${bridgeY + 10} L ${left} ${b[1] - 10} Q ${left} ${b[1]} ${left + 10} ${b[1]} L ${b[0]} ${b[1]}`;
          }
          else { const midX = (a[0] + b[0]) / 2; d += ` C ${midX} ${a[1]} ${midX} ${b[1]} ${b[0]} ${b[1]}`; }
        } else {
          const mid = (a[0] + b[0]) / 2;
          d += ` C ${mid} ${a[1]} ${mid} ${b[1]} ${b[0]} ${b[1]}`;
        }
      }
      const svg = $('.process-connectors');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.style.height = `${height}px`;
      $$('path', svg).forEach(path => path.setAttribute('d', d));
      pathLength = connector.getTotalLength();
    }
    renderScroll();
  }
  function renderScroll() {
    framePending = false;
    renderProcess();
    if (lab) lab.style.setProperty('--fusion', reduced() ? '1' : String(clamp((scrollY + innerHeight * .8 - labTop) / Math.max(1, lab.offsetHeight))));
    if (cta) cta.style.setProperty('--cta-progress', reduced() ? '1' : String(clamp((scrollY + innerHeight * .8 - ctaTop) / Math.max(1, cta.offsetHeight * .7))));
  }
  function queueScroll() { if (!framePending) { framePending = true; requestAnimationFrame(renderScroll); } }
  function queueMeasure() { if (!measurePending) { measurePending = true; requestAnimationFrame(measure); } }
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueMeasure, { passive: true });
  window.addEventListener('load', queueMeasure, { once: true });
  document.fonts?.ready.then(queueMeasure);

  function renderProcess() {
    if (!process) return;
    const p = processEnhanced ? clamp((scrollY - processTop) / processTravel) : 1;
    const connection = clamp((p - .06) / .75);
    const phase = p >= .73 ? 3 : p >= .495 ? 2 : p >= .26 ? 1 : 0;
    process.style.setProperty('--process-progress', String(connection));
    processSection.style.setProperty('--journey-progress', String(p));
    nodes.forEach((node, i) => {
      let local = i === 0 ? 1 : clamp((p - i * .235 + .045) / .15);
      local = local * local * (3 - 2 * local);
      node.classList.toggle('is-live', local > .98);
      node.style.setProperty('--node-reveal', String(local));
      node.style.setProperty('--node-lift', `${(1 - local) * 65}px`);
      node.style.setProperty('--node-turn', `${(1 - local) * (i % 2 ? -28 : 28)}deg`);
      node.style.setProperty('--bubble-scale', String(.42 + local * .58));
      node.style.setProperty('--orbit-angle', `${(1 - local) * 150 + p * 28}deg`);
      node.style.setProperty('--node-glow', String(i === phase ? 1 : .3));
    });
    if (phase !== previousPhase) {
      previousPhase = phase;
      const label = `${String(phase + 1).padStart(2, '0')} / ${phaseLabels[phase]}`;
      $('.process-phase').textContent = label;
      $('.process-active-copy>span').textContent = label;
      $('.process-active-copy>p').textContent = mobileCopy[phase];
      processSection.dataset.phase = String(phase);
    }
    $('.process-progress-number').textContent = String(Math.floor(p * 100 + .000001)).padStart(3, '0');
    if (spark && pathLength) {
      const point = connector.getPointAtLength(pathLength * connection);
      spark.setAttribute('cx', point.x); spark.setAttribute('cy', point.y);
      spark.style.opacity = processEnhanced && p > .04 && p < .96 ? '1' : '0';
    }
    process.style.setProperty('--focus-x', `${[12.5, 37.5, 62.5, 87.5][phase]}%`);
  }
  window.addEventListener('nmnh:motion', queueMeasure);

  // The paid-media visual is a real projected particle sculpture, rendered locally.
  const canvas = $('.engine-canvas');
  if (canvas) {
    const context = canvas.getContext('2d', { alpha: true });
    const engine = $('.engine-v2');
    let width = 1, height = 1, animation = 0, visible = false, lastFrame = 0;
    const particles = [];
    for (let u = 0; u < 68; u++) {
      for (let v = 0; v < 14; v++) {
        const a = u / 68 * Math.PI * 2, b = v / 14 * Math.PI * 2;
        particles.push({ a, b, x: (1 + .22 * Math.cos(b)) * Math.cos(a), y: .22 * Math.sin(b), z: (1 + .22 * Math.cos(b)) * Math.sin(a) });
      }
    }
    function sizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.7);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw(performance.now(), true);
    }
    function draw(now, forced = false) {
      if (!forced && (!visible || document.hidden || reduced())) { animation = 0; return; }
      if (!forced && now - lastFrame < 32) { animation = requestAnimationFrame(draw); return; }
      lastFrame = now;
      context.clearRect(0, 0, width, height);
      const time = reduced() ? .8 : now * .00017;
      const radius = Math.min(width * .30, height * .25), cx = width * .51, cy = height * .55;
      const glow = context.createRadialGradient(cx, cy, radius * .3, cx, cy, radius * 1.7);
      glow.addColorStop(0, '#ff8a2010'); glow.addColorStop(.5, '#d2761e12'); glow.addColorStop(1, '#ff8a2000');
      context.fillStyle = glow; context.fillRect(0, 0, width, height);
      const sin = Math.sin(time), cos = Math.cos(time), tilt = -.6;
      const points = particles.map(p => {
        const x = p.x * cos - p.z * sin, z = p.x * sin + p.z * cos;
        const y = p.y * Math.cos(tilt) - z * Math.sin(tilt);
        const depth = p.y * Math.sin(tilt) + z * Math.cos(tilt);
        const perspective = 3.6 / (3.6 + depth);
        return { x: cx + x * radius * perspective, y: cy + y * radius * perspective, d: depth, alpha: .25 + (1.4 - depth) * .22, r: .5 + perspective * .65 };
      }).sort((a, b) => b.d - a.d);
      points.forEach(p => {
        context.beginPath(); context.fillStyle = p.d < -.25 ? `rgba(255,189,104,${p.alpha})` : `rgba(194,177,139,${p.alpha * .6})`;
        context.arc(p.x, p.y, p.r, 0, Math.PI * 2); context.fill();
      });
      context.save(); context.translate(cx, cy); context.rotate(-.25);
      context.strokeStyle = '#f0ba6550'; context.lineWidth = .65;
      context.beginPath(); context.ellipse(0, 0, radius * 1.5, radius * .42, 0, 0, Math.PI * 2); context.stroke();
      for (let i = 0; i < 4; i++) {
        const a = time * 2 + i * Math.PI / 2, x = Math.cos(a) * radius * 1.5, y = Math.sin(a) * radius * .42;
        context.fillStyle = '#ffbd70'; context.shadowBlur = 12; context.shadowColor = '#ff9b39';
        context.beginPath(); context.arc(x, y, 2, 0, Math.PI * 2); context.fill();
      }
      context.restore();
      if (!forced) animation = requestAnimationFrame(draw);
    }
    function start() { if (!animation && visible && !document.hidden && !reduced()) animation = requestAnimationFrame(draw); else if (reduced()) draw(performance.now(), true); }
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; if (visible) start();
      else { cancelAnimationFrame(animation); animation = 0; }
    }, { rootMargin: '80px' }).observe(engine);
    else { visible = true; start(); }
    new ResizeObserver(sizeCanvas).observe(engine);
    window.addEventListener('nmnh:motion', () => { cancelAnimationFrame(animation); animation = 0; start(); });
    document.addEventListener('visibilitychange', start);
    sizeCanvas();
  }

  // Keep the shared expertise disclosure easy to dismiss and keyboard friendly.
  const expertise = $('.expertise-menu');
  document.addEventListener('click', event => { if (expertise?.open && !expertise.contains(event.target)) expertise.open = false; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && expertise?.open) { expertise.open = false; $('summary', expertise).focus(); } });
  measure();
})();

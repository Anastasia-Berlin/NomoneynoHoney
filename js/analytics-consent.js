(() => {
  'use strict';
  const id = 'G-BS3HHFXKDV';
  const key = 'nmnh_analytics_consent_v1';
  let loaded = false;
  let choice = null;
  try { choice = localStorage.getItem(key); } catch (_) {}
  function startAnalytics() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', id, { page_location: location.origin + location.pathname, page_referrer: '', allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
  }
  function clearAnalyticsCookies() {
    document.cookie.split(';').forEach(entry => {
      const name = entry.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) return;
      ['', '; domain=' + location.hostname, '; domain=.nomoneynohoney.io'].forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax';
      });
    });
  }
  function save(value) {
    const wasLoaded = loaded;
    choice = value;
    try { localStorage.setItem(key, value); } catch (_) {}
    banner.hidden = true;
    if (value === 'yes') startAnalytics();
    else {
      if (window.gtag && wasLoaded) window.gtag('consent', 'update', { analytics_storage: 'denied' });
      clearAnalyticsCookies();
      if (wasLoaded) location.reload();
    }
  }
  if (choice === 'yes') startAnalytics();
  // Only measure known navigation targets; never send form content, link text or query strings.
  const trackedPaths = {
    '/angebot.html': 'angebot', '/kontakt.html': 'kontakt',
    '/services/performance-marketing.html': 'performance_marketing',
    '/services/content-creation.html': 'content_creation',
    '/services/webentwicklung.html': 'web_app_entwicklung',
    '/services/automation-agenten.html': 'automation',
    '/services/seo-geo.html': 'seo_geo', '/karriere.html': 'karriere', '/blog.html': 'blog'
  };
  document.addEventListener('click', event => {
    if (choice !== 'yes' || !loaded || typeof window.gtag !== 'function') return;
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link || link.closest('.nmnh-consent')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !trackedPaths[url.pathname]) return;
    window.gtag('event', 'navigation_click', { destination: trackedPaths[url.pathname] });
  });
  function init() {
    const css = document.createElement('style');
    css.textContent = '.nmnh-consent[hidden]{display:none!important}.nmnh-consent{position:fixed;z-index:2147483000;inset:auto 16px 16px;max-width:620px;margin:auto;background:#171218;color:#fff;border:1px solid #eaa1c3;border-radius:16px;padding:20px;box-shadow:0 12px 50px #0008;font:15px/1.5 system-ui,sans-serif}.nmnh-consent strong{font-size:19px}.nmnh-consent p{margin:9px 0 14px}.nmnh-consent a{color:#ffd0e5;text-decoration:underline}.nmnh-consent-actions{display:flex;gap:10px;flex-wrap:wrap}.nmnh-consent button,.nmnh-consent-open{cursor:pointer;font:inherit;border-radius:8px;padding:10px 16px;border:1px solid #f3b3d1;background:transparent;color:#fff}.nmnh-consent .accept,.nmnh-consent .reject{background:#f3b3d1;color:#171218;min-width:150px;font-weight:600}.nmnh-consent-open{position:fixed;z-index:2147482999;bottom:8px;left:8px;background:#171218;color:#fff;font-size:12px;padding:5px 9px}';
    document.head.appendChild(css);
    const banner = document.createElement('section');
    banner.className = 'nmnh-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Datenschutzeinstellungen');
    banner.innerHTML = '<strong>Hilf uns, besser zu werden.</strong><p>Mit Google Analytics verstehen wir, welche Inhalte und Angebote für dich interessant sind. Dafür erfassen wir mit deiner Zustimmung Seitenaufrufe und ausgewählte Klicks. Dabei können Daten an Google und in die USA übertragen werden. Du kannst deine Wahl jederzeit ändern. Mehr in unserer <a href="/datenschutz.html#analyse">Datenschutzerklärung</a>.</p><div class="nmnh-consent-actions"><button type="button" class="reject">Analyse ablehnen</button><button type="button" class="accept">Analyse erlauben</button></div>';
    banner.hidden = choice === 'yes' || choice === 'no';
    document.body.appendChild(banner);
    const open = document.createElement('button');
    open.type = 'button'; open.className = 'nmnh-consent-open'; open.textContent = 'Datenschutzeinstellungen';
    document.body.appendChild(open);
    open.addEventListener('click', () => { banner.hidden = false; banner.querySelector('.reject').focus(); });
    banner.querySelector('.reject').addEventListener('click', () => save('no'));
    banner.querySelector('.accept').addEventListener('click', () => save('yes'));
  }
  // Assigned during initialization so consent controls can close the current panel.
  let banner;
  function mount() {
    init();
    banner = document.querySelector('.nmnh-consent');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();

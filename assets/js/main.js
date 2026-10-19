/* Raghav E — Portfolio interactions */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const root = document.documentElement;

  /* ---------- Toast + copy ---------- */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
    }
    toast(`Copied ${text}`);
  }
  $$('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(b.dataset.copy)));

  /* ---------- Year & clock ---------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  const clockEl = $('[data-clock]');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const tick = () => clockEl && (clockEl.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);

  /* ---------- Theme ---------- */
  const currentTheme = () =>
    root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
  }));

  /* ---------- Scroll progress + top bar border ---------- */
  const topbar = $('.topbar');
  const progress = $('.progress');
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? scrollY / max : 0);
    topbar.classList.toggle('scrolled', scrollY > 8);
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Scroll spy (top nav + mobile dock) ---------- */
  const navLinks = $$('.nav a');
  const dockLinks = $$('.dock a');
  const dockMap = { experience: 'about', resume: 'certificates' }; // dock has fewer slots
  function setActive(id) {
    navLinks.forEach((a) => a.setAttribute('aria-current', a.hash === '#' + id));
    const dockId = dockMap[id] || id;
    dockLinks.forEach((a) => a.setAttribute('aria-current', a.dataset.dock === dockId));
  }
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
    { rootMargin: '-45% 0px -50% 0px' }
  );
  $$('[data-section]').forEach((s) => spy.observe(s));
  spy.observe($('#top'));

  /* ---------- Reveal on scroll ---------- */
  const reveal = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );
  $$('.reveal').forEach((el, idx) => {
    el.style.transitionDelay = `${Math.min(idx % 4, 3) * 70}ms`;
    reveal.observe(el);
  });

  /* ---------- Lightbox (certificates + résumé) ---------- */
  const lb = $('#lightbox');
  const lbImg = $('[data-lb-img]', lb);
  const certs = $$('[data-cert]').map((b) => ({ src: b.dataset.src, title: b.dataset.title, meta: b.dataset.meta }));
  let lbIndex = 0;
  let lbMode = 'cert';

  function showCert(i) {
    lbIndex = (i + certs.length) % certs.length;
    const c = certs[lbIndex];
    lbImg.src = c.src;
    lbImg.alt = c.title;
    $('[data-lb-title]', lb).textContent = c.title;
    $('[data-lb-meta]', lb).textContent = c.meta;
    $('[data-lb-count]', lb).textContent = `${lbIndex + 1} / ${certs.length} · use ← → or swipe`;
  }

  function openCert(i) {
    lbMode = 'cert';
    lb.classList.remove('is-doc');
    showCert(i);
    lb.showModal();
  }

  function openResume() {
    lbMode = 'doc';
    lb.classList.add('is-doc');
    lbImg.src = 'assets/img/resume.webp';
    lbImg.alt = "Raghav E's résumé";
    $('[data-lb-title]', lb).textContent = 'Résumé — Raghav E';
    $('[data-lb-meta]', lb).textContent = 'Scroll to read';
    lb.showModal();
    $('.lb-stage', lb).scrollTop = 0;
  }

  $$('[data-cert]').forEach((b, i) => b.addEventListener('click', () => openCert(i)));
  $$('[data-resume]').forEach((b) => b.addEventListener('click', openResume));
  $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
  $('[data-lb-prev]', lb).addEventListener('click', () => showCert(lbIndex - 1));
  $('[data-lb-next]', lb).addEventListener('click', () => showCert(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); }); // backdrop click
  lb.addEventListener('keydown', (e) => {
    if (lbMode !== 'cert') return;
    if (e.key === 'ArrowLeft') showCert(lbIndex - 1);
    if (e.key === 'ArrowRight') showCert(lbIndex + 1);
  });

  let touchX = null;
  lb.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null || lbMode !== 'cert') return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showCert(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });
})();

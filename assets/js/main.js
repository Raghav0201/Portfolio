/* ==========================================================================
   Raghav E — Portfolio interactions

   1. Helpers          4. Dropdown menu       7. Own-projects viewer
   2. Copy + toast     5. Header shadow       8. Image viewer
   3. Hero tagline     6. Scroll spy/reveal
   ========================================================================== */
(() => {
  /* ---------- 1. Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 2. Copy email + toast ---------- */
  const toastEl = $('[data-toast]');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
  };
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast('Email copied');
    } catch {
      toast(btn.dataset.copy);
    }
  }));

  /* ---------- 3. Hero tagline: highlighter sweeps across a rotating word ---------- */
  const markEl = $('[data-mark]');
  const wordEl = $('[data-rotate]');
  if (markEl && wordEl) {
    if (reduceMotion) {
      markEl.classList.add('on');
    } else {
      const words = ['Developing', 'Integrations', 'Testing', 'ERPNext Solutions', 'Project Planning'];
      let i = 0;
      setTimeout(() => markEl.classList.add('on'), 500);
      setInterval(() => {
        markEl.classList.remove('on');              // marker pulls away to the right
        markEl.classList.add('off');
        setTimeout(() => {
          i = (i + 1) % words.length;
          wordEl.textContent = words[i];
          markEl.classList.remove('off');
          requestAnimationFrame(() => markEl.classList.add('on')); // …and sweeps in again
        }, 550);
      }, 3200);
    }
  }

  /* ---------- 4. Dropdown menu (profile links, plus sections on phones) ---------- */
  const quick = $('#quick');
  const quickBtn = $('[data-quick-toggle]');
  const setQuick = (open) => {
    quick.hidden = !open;
    quickBtn.setAttribute('aria-expanded', open);
  };
  quickBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setQuick(quick.hidden);
  });
  $$('a', quick).forEach((a) => a.addEventListener('click', () => setQuick(false)));
  document.addEventListener('click', (e) => {
    if (!quick.hidden && !quick.contains(e.target)) setQuick(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !quick.hidden) {
      setQuick(false);
      quickBtn.focus();
    }
  });

  /* ---------- 5. Header shadow once the page scrolls ---------- */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 6. Scroll spy for the nav + reveal on scroll ---------- */
  const navLinks = $$('.nav a');
  const navAlias = { modules: 'about', skills: 'about' };   // sections without their own nav link
  const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const id = navAlias[e.target.id] || e.target.id;
    navLinks.forEach((a) => a.setAttribute('aria-current', a.hash === '#' + id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('section[data-section]').forEach((s) => spy.observe(s));

  const reveal = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    reveal.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('.reveal').forEach((el, idx) => {
    el.style.transitionDelay = `${(idx % 3) * 80}ms`;
    reveal.observe(el);
  });

  /* ---------- 7. Own-projects viewer (accessible tabs) ---------- */
  const pviewer = $('[data-pviewer]');
  if (pviewer) {
    const tabs = $$('[role="tab"]', pviewer);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        const panel = $('#' + t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        panel.hidden = !on;
        if (on) {                                    // restart the fade-in
          panel.classList.remove('pv-in');
          void panel.offsetWidth;
          panel.classList.add('pv-in');
        }
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    const keyStep = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        let next;
        if (e.key in keyStep) next = tabs[(i + keyStep[e.key] + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });
    });
  }

  /* ---------- 8. Image viewer: certificates + résumé ---------- */
  const lb = $('#lightbox');
  const lbImg = $('[data-lb-img]', lb);
  const lbTitle = $('[data-lb-title]', lb);
  const lbMeta = $('[data-lb-meta]', lb);
  const certs = $$('[data-cert]').map((b) => b.dataset);
  let lbIndex = 0;
  let lbMode = 'cert';

  const showCert = (i) => {
    lbIndex = (i + certs.length) % certs.length;
    const c = certs[lbIndex];
    lbImg.src = c.src;
    lbImg.alt = c.title;
    lbTitle.textContent = c.title;
    lbMeta.textContent = `${c.meta} · ${lbIndex + 1} of ${certs.length}`;
  };

  $$('[data-cert]').forEach((btn, i) => btn.addEventListener('click', () => {
    lbMode = 'cert';
    lb.classList.remove('is-doc');
    showCert(i);
    lb.showModal();
  }));
  $$('[data-resume]').forEach((btn) => btn.addEventListener('click', () => {
    lbMode = 'doc';
    lb.classList.add('is-doc');
    lbImg.src = 'assets/img/resume.webp';
    lbImg.alt = "Raghav E's résumé";
    lbTitle.textContent = 'Raghav-E-Resume.pdf';
    lbMeta.textContent = 'Scroll to read';
    lb.showModal();
    $('.lb-stage', lb).scrollTop = 0;
  }));

  $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
  $('[data-lb-prev]', lb).addEventListener('click', () => showCert(lbIndex - 1));
  $('[data-lb-next]', lb).addEventListener('click', () => showCert(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); }); // backdrop
  lb.addEventListener('keydown', (e) => {
    if (lbMode !== 'cert') return;
    if (e.key === 'ArrowLeft') showCert(lbIndex - 1);
    if (e.key === 'ArrowRight') showCert(lbIndex + 1);
  });

  let touchX = null;                                 // swipe between certificates
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null || lbMode !== 'cert') return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showCert(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });
})();

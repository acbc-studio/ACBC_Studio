/* =============================================================
   ACBC Studio — offering pages
   Example tabs: click or arrow keys switch figures; "Next example"
   moves along; links to #example-… open that figure.
   ============================================================= */
(function () {
  'use strict';

  const tabs = Array.from(document.querySelectorAll('.op-tab'));
  if (!tabs.length) return;

  function select(tab, focus) {
    tabs.forEach(function (t) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }

  function tabFor(key) {
    return document.getElementById('tab-' + key);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab, false); });
    tab.addEventListener('keydown', function (e) {
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  // "Next example" buttons under each figure
  document.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = tabFor(btn.getAttribute('data-next'));
      if (tab) select(tab, true);
    });
  });

  // links elsewhere on the page (or in the address bar) to #example-…
  function openFromHash() {
    const m = location.hash.match(/^#example-([\w-]+)$/);
    const tab = m && tabFor(m[1]);
    if (!tab) return;
    select(tab, false);
    document.getElementById('examples').scrollIntoView({ block: 'start' });
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
  // a second click on the same link doesn't change the hash, so handle clicks too
  document.querySelectorAll('a[href^="#example-"]').forEach(function (a) {
    a.addEventListener('click', function () {
      const tab = tabFor(a.getAttribute('href').replace('#example-', ''));
      if (tab) select(tab, false);
    });
  });
})();

/* =============================================================
   Waitlist form (Netlify Forms). Submits in place and shows the
   confirmation; if Netlify isn't accepting it, offers email instead.
   ============================================================= */
(function () {
  'use strict';

  const form = document.querySelector('[data-waitlist]');
  if (!form) return;
  const status = form.querySelector('.op-form__status');
  const button = form.querySelector('button[type="submit"]');

  function show(message, isError) {
    status.hidden = false;
    status.classList.toggle('is-error', !!isError);
    status.innerHTML = message;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      form.querySelectorAll('.op-form__row, .op-form__field, .op-form__optional, .op-form__actions')
        .forEach(function (el) { el.hidden = true; });
      show('You’re on the list. I’ll let you know when founding-team applications open in summer 2027.');
      status.focus();
    }).catch(function () {
      button.disabled = false;
      show('Something went wrong, and your details weren’t sent. Please try again, or write to ' +
        '<a href="mailto:hello@acbc-studio.com?subject=Add%20me%20to%20the%20(Un)Learning%20Series%20list">hello@acbc-studio.com</a> ' +
        'and I’ll add you myself.', true);
    });
  });
})();

/* =============================================================
   What you keep: the hub on a laptop. The rows are tabs that
   switch the screen; arrows and dots cycle 1 → 2 → 3 → 1.
   ============================================================= */
(function () {
  'use strict';

  const tabs = Array.from(document.querySelectorAll('.op-hub__tab'));
  if (!tabs.length) return;
  const VIEWS = [
    { title: 'The dashboard', src: 'assets/images/wayfinding/hub/screen-1-dashboard.png',
      alt: 'Example hub dashboard: “What are you facing this week?”, with moments grouped under Listen and Translate, and the latest note from the guide.' },
    { title: 'The log', src: 'assets/images/wayfinding/hub/screen-2-field-notes.png',
      alt: 'Example Field Notes log: two quarters with one dot per note, then April’s entries: a working session, a piece of guidance and a decision.' },
    { title: 'An activity', src: 'assets/images/wayfinding/hub/screen-3-activity.png',
      alt: 'Example activity, “Who’s Missing, and Why”: a map of who the decision affects most, where each relationship stands, how the team will show up first, outreach and engagement.' }
  ];
  const img = document.querySelector('[data-hub-img]');
  const screen = document.getElementById('hub-screen');
  const count = document.querySelector('[data-hub-count]');
  const dots = Array.from(document.querySelectorAll('.op-hub__dots span'));
  let current = 0;
  let preloaded = false;

  // preload the other two screens once the section is near, so switching is instant
  function preload() {
    if (preloaded) return;
    preloaded = true;
    VIEWS.forEach(function (v) { const i = new Image(); i.src = v.src; });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { preload(); io.disconnect(); }
    }, { rootMargin: '600px' });
    io.observe(screen);
  } else { preload(); }

  function show(i, focus) {
    preload();
    current = (i + VIEWS.length) % VIEWS.length;
    tabs.forEach(function (t, k) {
      const on = k === current;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === current); });
    img.src = VIEWS[current].src;
    img.alt = VIEWS[current].alt;
    screen.setAttribute('aria-labelledby', tabs[current].id);
    count.textContent = (current + 1) + ' of 3 · ' + VIEWS[current].title;
    if (focus) tabs[current].focus();
  }

  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { show(k, false); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1, true); }
      if (e.key === 'Home') { e.preventDefault(); show(0, true); }
      if (e.key === 'End') { e.preventDefault(); show(VIEWS.length - 1, true); }
    });
  });
  document.querySelectorAll('[data-hub-step]').forEach(function (b) {
    b.addEventListener('click', function () { show(current + Number(b.getAttribute('data-hub-step')), false); });
  });
})();

/* =============================================================
   (Un)Learning module cards: each "What we'll (un)learn and
   (re)member" button opens its own card.
   ============================================================= */
(function () {
  'use strict';

  document.querySelectorAll('.op-module__toggle').forEach(function (btn) {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const text = btn.querySelector('.op-module__toggle-text');
    const closedLabel = text.textContent;
    btn.addEventListener('click', function () {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      text.textContent = open ? 'Show less' : closedLabel;
    });
  });
})();

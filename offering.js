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

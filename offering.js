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

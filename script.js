/* =============================================================
   ACBC Studio — interactions
   The mobile navigation menu, and the arrows and dots for the
   testimonials carousel, and the FAQ accordion.
   ============================================================= */
(function () {
  'use strict';

  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.getElementById('site-nav');

  if (toggle && nav) initNav();

  function initNav() {
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
      nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // close after choosing a link, or on Escape
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---- "Work with us" dropdown ----------------------------------
     The chevron opens and closes the offerings; Esc or a click
     outside closes them; arrow keys move between the items. */
  const chevron = document.querySelector('.site-nav__chevron');
  const menu    = document.getElementById('nav-ways');
  if (chevron && menu) initDropdown();

  function initDropdown() {
    const items = Array.from(menu.querySelectorAll('a'));

    function setOpen(open) {
      chevron.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    }

    chevron.addEventListener('click', function () {
      setOpen(chevron.getAttribute('aria-expanded') !== 'true');
    });
    chevron.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); items[0].focus(); }
    });
    menu.addEventListener('keydown', function (e) {
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)].focus(); }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (i <= 0) chevron.focus(); else items[i - 1].focus();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        chevron.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.site-nav__group')) setOpen(false);
    });
  }

  /* ---- testimonials carousel -------------------------------------
     The track is a scroll-snap strip (swipe and trackpad work natively);
     this wires the arrows and dots to it and keeps them in sync. */
  const track    = document.getElementById('testimonials-track');
  const controls = document.querySelector('.carousel__controls');
  if (track && controls) initCarousel();

  function initCarousel() {
    const slides = Array.from(track.children);
    const dots   = Array.from(controls.querySelectorAll('.carousel__dot'));
    const prev   = controls.querySelector('.carousel__btn--prev');
    const next   = controls.querySelector('.carousel__btn--next');
    let current  = 0;

    function goTo(i) {
      current = Math.max(0, Math.min(slides.length - 1, i));
      render();
      track.scrollTo({ left: slides[current].offsetLeft - slides[0].offsetLeft });
    }

    function render() {
      dots.forEach(function (dot, i) {
        if (i === current) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      // only the visible slide is reachable by keyboard and screen readers
      slides.forEach(function (slide, i) { slide.inert = i !== current; });
    }

    prev.addEventListener('click', function () { goTo(current - 1); });
    next.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    // after a swipe, sync the dots to wherever the strip came to rest
    let settle;
    track.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        const step = slides[1].offsetLeft - slides[0].offsetLeft;
        current = Math.round(track.scrollLeft / step);
        render();
      }, 120);
    });
    window.addEventListener('resize', function () { goTo(current); });

    controls.hidden = false;
    render();
  }
  /* ---- FAQ accordion ---------------------------------------------
     <details> handles opening and the keyboard. This opens the
     question a link points to (#faq-…), and every answer for print. */
  const faqItems = Array.from(document.querySelectorAll('.faq__item'));
  if (faqItems.length) initFaq();

  function initFaq() {
    function openFromHash() {
      if (!location.hash) return;
      let target;
      try { target = document.querySelector(location.hash); } catch (e) { return; }
      const item = target && target.closest('.faq__item');
      if (!item) return;
      item.open = true;
      item.scrollIntoView({ block: 'start' });
      item.querySelector('summary').focus({ preventScroll: true });
    }
    openFromHash();
    window.addEventListener('hashchange', openFromHash);

    let closedBeforePrint = [];
    window.addEventListener('beforeprint', function () {
      closedBeforePrint = faqItems.filter(function (d) { return !d.open; });
      closedBeforePrint.forEach(function (d) { d.open = true; });
    });
    window.addEventListener('afterprint', function () {
      closedBeforePrint.forEach(function (d) { d.open = false; });
      closedBeforePrint = [];
    });
  }
})();

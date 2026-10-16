/* =============================================================
   ACBC Studio — interactions
   Replaces jQuery + 4 Webflow runtime chunks (~300KB) with ~120 lines.
   ============================================================= */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     Slider
     Mirrors the original Webflow config:
       - slide animation, 500ms, easing "ease"
       - infinite looping (via edge clones)
       - swipe enabled
       - autoplay off
       - data-hide-arrows: hide the left arrow on the first slide
         and the right arrow on the last (Webflow's exact rule)
     ---------------------------------------------------------- */
  function initSlider(root) {
    const track  = root.querySelector('.slider__track');
    const dotsEl = root.querySelector('.slider__dots');
    const prev   = root.querySelector('.slider__arrow--left');
    const next   = root.querySelector('.slider__arrow--right');

    const slides = Array.from(track.children);
    const count  = slides.length;
    if (count < 2) return;

    const duration   = parseInt(root.dataset.duration, 10) || 500;
    const hideArrows = root.dataset.hideArrows === 'true';
    const spacing    = dotsEl && dotsEl.dataset.navSpacing;

    // edge clones give a seamless infinite loop in both directions
    const firstClone = slides[0].cloneNode(true);
    const lastClone  = slides[count - 1].cloneNode(true);
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    let index = 0;          // logical index, 0..count-1
    let animating = false;
    const dots = [];

    function offset(i) { return -(i + 1) * 100; }

    function place(i, animate) {
      track.style.transition = animate ? `transform ${duration}ms ease` : 'none';
      track.style.transform  = `translateX(${offset(i)}%)`;
    }

    function syncChrome() {
      if (dots.length) {
        dots.forEach((d, i) => {
          const on = i === index;
          d.classList.toggle('is-active', on);
          d.setAttribute('aria-pressed', String(on));
          d.tabIndex = on ? 0 : -1;
        });
      }
      if (hideArrows) {
        if (prev) prev.hidden = index === 0;
        if (next) next.hidden = index === count - 1;
      }
    }

    function go(target) {
      if (animating) return;
      const wrapped = (target + count) % count;

      // animate through the clone when wrapping, then snap back silently
      const visual = target < 0 ? -1 : (target >= count ? count : wrapped);
      animating = true;
      index = wrapped;
      syncChrome();
      place(visual, true);

      window.setTimeout(function () {
        if (visual !== wrapped) place(wrapped, false);
        animating = false;
      }, duration);
    }

    // dots
    if (dotsEl) {
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + count);
        dot.setAttribute('role', 'button');
        if (spacing) {
          dot.style.marginLeft = spacing + 'px';
          dot.style.marginRight = spacing + 'px';
        }
        dot.addEventListener('click', function () { go(i); });
        dotsEl.appendChild(dot);
        dots.push(dot);
      }
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });

    // keyboard
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });

    // touch swipe
    let startX = null, startY = null;
    root.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? index + 1 : index - 1);
      }
      startX = startY = null;
    }, { passive: true });

    place(0, false);
    syncChrome();
  }

  /* ----------------------------------------------------------
     Accordion
     The original animated to hard-coded pixel heights (308px,
     180px, ...), which clips when copy or viewport changes.
     This measures the content instead, then releases to `auto`
     so it stays correct at every width.
     ---------------------------------------------------------- */
  function initAccordion(item) {
    const header = item.querySelector('.accordion__header');
    const panel  = item.querySelector('.accordion__panel');
    if (!header || !panel) return;

    let open = false;

    header.addEventListener('click', function () {
      open = !open;
      header.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);

      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        panel.addEventListener('transitionend', function release(e) {
          if (e.propertyName !== 'height') return;
          panel.style.height = 'auto';
          panel.removeEventListener('transitionend', release);
        });
      } else {
        // fix the current height so the collapse has something to animate from
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { panel.style.height = '0px'; });
        });
      }
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('[data-slider]').forEach(initSlider);
    document.querySelectorAll('.accordion__item').forEach(initAccordion);
  });
})();

/* GymClankers — /story scroll effects */
(function () {
  'use strict';

  /* ── Scroll reveals via IntersectionObserver ── */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    /* Fallback: show everything */
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Parallax on background layers ── */
  var parallaxEls = document.querySelectorAll('.parallax-layer');
  var ticking = false;

  /* Disable parallax on mobile / reduced motion */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 768;

  if (!prefersReduced && !isMobile && parallaxEls.length) {
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  function onScroll() {
    var scrollY = window.pageYOffset;
    parallaxEls.forEach(function (el) {
      var rate = parseFloat(el.dataset.rate) || 0.3;
      var rect = el.getBoundingClientRect();
      var offset = rect.top + scrollY;
      var delta = (scrollY - offset) * rate;
      el.style.transform = 'translateY(' + delta + 'px)';
    });
    ticking = false;
  }

  /* ── Animated SVG visualizer bars ── */
  var vizBars = document.querySelectorAll('.sound-visualizer rect');
  if (vizBars.length) {
    var vizObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateViz();
          vizObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    var vizEl = document.querySelector('.sound-visualizer');
    if (vizEl) vizObs.observe(vizEl);
  }

  function animateViz() {
    vizBars.forEach(function (bar, i) {
      var baseHeight = 20 + Math.random() * 80;
      var delay = i * 50;
      bar.style.transition = 'height 0.4s ease ' + delay + 'ms, y 0.4s ease ' + delay + 'ms';
      bar.setAttribute('height', baseHeight);
      bar.setAttribute('y', 120 - baseHeight);
    });

    /* Continuous subtle animation */
    setInterval(function () {
      vizBars.forEach(function (bar) {
        var h = 15 + Math.random() * 90;
        bar.setAttribute('height', h);
        bar.setAttribute('y', 120 - h);
      });
    }, 600);
  }
})();

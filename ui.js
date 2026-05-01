// Botanica — micro-interactions & reveal logic
(() => {
  // RUN_DATE in nav and footer
  const dt = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('#rundate, #rundate-foot').forEach(el => {
    el.textContent = `rev · ${dt}`;
  });
  // Replace template literal in hero tag
  document.querySelectorAll('.hero-tag').forEach(el => {
    el.textContent = el.textContent.replace('{{RUN_DATE}}', dt);
  });

  // Reveal on scroll (IntersectionObserver)
  const reveal = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        reveal.unobserve(e.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.section, .hero').forEach(el => reveal.observe(el));

  // Smooth anchor focus shift
  document.querySelectorAll('.nav-links a, .hero-jump').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  // Confidence meter animates from 0 on enter
  const conf = document.querySelector('.conf-fill');
  if (conf) {
    const target = conf.style.width || '35%';
    conf.style.width = '0%';
    new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          requestAnimationFrame(() => { conf.style.width = target; });
          obs.disconnect();
        }
      }
    }, { threshold: 0.5 }).observe(conf);
  }

  // Mark current section in nav
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const navObs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    }
  }, { threshold: 0.4 });
  sections.forEach(s => navObs.observe(s));
})();

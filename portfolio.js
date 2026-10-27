const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('section-cover')) {
        entry.target.querySelectorAll('.reveal').forEach((child) => child.classList.add('visible'));
      }
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.05 });
  document.querySelectorAll('.reveal, .section-cover').forEach((element) => {
    if (!element.closest('.section-cover') || element.classList.contains('section-cover')) observer.observe(element);
  });
}
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-nav');
menuButton.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'Close' : 'Menu';
});
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  document.body.classList.remove('menu-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.textContent = 'Menu';
}));
const filterButtons = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('.work-card');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('active')); button.classList.add('active');
  const filter = button.dataset.filter;
  projects.forEach((project) => project.classList.toggle('is-hidden', filter !== 'all' && project.dataset.category !== filter));
}));
if (window.matchMedia('(pointer: fine)').matches && !reducedMotion) {
  const cursor = document.querySelector('.cursor-label');
  document.addEventListener('pointermove', (event) => { cursor.style.left = `${event.clientX}px`; cursor.style.top = `${event.clientY}px`; });
  document.querySelectorAll('.work-card[href], .marquee-card').forEach((card) => {
    const usesDarkCursor = card.matches('.card-compal, .card-twm, .card-sothebys')
      || Boolean(card.querySelector('.compal-work, .twm-work, .sothebys-work'));
    card.addEventListener('pointerenter', () => {
      cursor.classList.toggle('on-dark', usesDarkCursor);
      cursor.classList.add('show');
    });
    card.addEventListener('pointerleave', () => {
      cursor.classList.remove('show', 'on-dark');
    });
  });
}

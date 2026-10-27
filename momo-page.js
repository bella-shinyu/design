// Page chrome and chapter navigation for the momo case study.
// Click targets and scroll tracking share one offset derived from visible chrome.
(() => {
  const root = document.documentElement;
  const header = document.querySelector('.masthead');
  const sidebar = document.querySelector('.sidebar');
  const nav = document.querySelector('#chapter-nav');
  const nextProject = document.querySelector('.next-project');
  const links = [...(nav?.querySelectorAll('a[href^="#"]') || [])];
  const chapters = links.map(link => ({link, target: document.getElementById(link.hash.slice(1))})).filter(item => item.target);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width:760px)');
  let offset = 0;
  let queued = false;
  let current = null;
  let interacted = false;

  function measureChrome() {
    offset = Math.ceil((header?.getBoundingClientRect().height || 0) + (mobile.matches ? sidebar?.offsetHeight || 0 : 0) + 24);
    root.style.setProperty('--momo-anchor-offset', `${offset}px`);
  }
  function update() {
    queued = false;
    measureChrome();
    let active = chapters[0];
    for (const chapter of chapters) {
      if (chapter.target.getBoundingClientRect().top <= offset + 2) active = chapter;
    }
    if (active && active !== current) {
      current = active;
      for (const chapter of chapters) {
        if (chapter === active) chapter.link.setAttribute('aria-current', 'location');
        else chapter.link.removeAttribute('aria-current');
      }
      if (mobile.matches && nav) {
        const rect = active.link.getBoundingClientRect();
        const bounds = nav.getBoundingClientRect();
        if (rect.left < bounds.left + 16 || rect.right > bounds.right - 16) {
          nav.scrollLeft += rect.left - bounds.left - (bounds.width - rect.width) / 2;
        }
      }
    }
    if (sidebar && nextProject) {
      const navBoundary = nav?.getBoundingClientRect().bottom || offset;
      const hidden = nextProject.getBoundingClientRect().top <= navBoundary + 24;
      sidebar.classList.toggle('is-past-project', hidden);
      sidebar.inert = hidden;
      if (hidden) sidebar.setAttribute('aria-hidden', 'true');
      else sidebar.removeAttribute('aria-hidden');
    }
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }
  function goTo(target, smooth = false) {
    measureChrome();
    window.scrollTo({top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset), behavior: smooth && !reduced.matches ? 'smooth' : 'instant'});
    schedule();
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    interacted = true;
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    goTo(target, true);
  }));
  function restoreHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = id && document.getElementById(id);
    if (target && document.querySelector('main')?.contains(target)) goTo(target);
    else schedule();
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', restoreHash);
  window.addEventListener('popstate', restoreHash);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', () => {
    // Let the browser finish its native fragment jump before correcting it.
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      if (!interacted) restoreHash();
      else schedule();
    }));
  }, {once:true});
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => window.addEventListener(type, () => {interacted = true;}, {once:true, passive:true}));
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    [header, sidebar, document.querySelector('main')].filter(Boolean).forEach(el => observer.observe(el));
  }

  const menu = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#main-nav');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
    if (menu) menu.textContent = 'Menu';
  }
  menu?.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'Close' : 'Menu';
  });
  mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {if (event.key === 'Escape') closeMenu();});
  if (!reduced.matches && 'IntersectionObserver' in window) {
    root.classList.add('motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), {threshold:0, rootMargin:'0px 0px -15% 0px'});
    document.querySelectorAll('.reveal, .metric-pop').forEach(el => observer.observe(el));
  }
  // Autoplay, muted, loop and controls remain defined by each existing video.
  update();
})();

// Keep chapter navigation within the case-study reading experience.
(() => {
  const sidebar = document.querySelector('.sidebar');
  const header = document.querySelector('.masthead');
  const chapterNav = document.querySelector('#chapter-nav');
  const nextProject = document.querySelector('.next-project');
  if (!sidebar || !nextProject) return;

  let queued = false;
  const update = () => {
    const navBoundary = chapterNav?.getBoundingClientRect().bottom
      || header?.getBoundingClientRect().bottom
      || 0;
    const hidden = nextProject.getBoundingClientRect().top <= navBoundary + 24;
    sidebar.classList.toggle('is-past-project', hidden);
    sidebar.inert = hidden;
    if (hidden) sidebar.setAttribute('aria-hidden', 'true');
    else sidebar.removeAttribute('aria-hidden');
    queued = false;
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule);
  update();
})();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chapters = [...document.querySelectorAll('.chapter')];
const chapterLinks = [...document.querySelectorAll('#chapter-nav a')];
const motionGroups = [...document.querySelectorAll('[data-motion-group]')];
const observedVideos = [...document.querySelectorAll('[data-observed-video]')];

const updateChapter = () => {
  let active = chapters[0];
  chapters.forEach((chapter) => {
    if (chapter.getBoundingClientRect().top <= 185) active = chapter;
  });
  chapterLinks.forEach((link) => {
    if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};

let chapterUpdateQueued = false;
window.addEventListener('scroll', () => {
  if (chapterUpdateQueued) return;
  chapterUpdateQueued = true;
  window.requestAnimationFrame(() => {
    updateChapter();
    chapterUpdateQueued = false;
  });
}, { passive: true });
window.addEventListener('resize', updateChapter);
updateChapter();

const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
  });
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = 'Menu';
  }));
}

if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }), { threshold: 0, rootMargin: '0px 0px -25% 0px' });
  document.querySelectorAll('.reveal, .reveal-art, .metric-pop').forEach((element) => revealObserver.observe(element));
}

const setGroupPlayback = (group, shouldPlay) => {
  const videos = [...group.querySelectorAll('video')];
  videos.forEach((video) => shouldPlay ? video.play().catch(() => {}) : video.pause());
  group.dataset.playing = String(shouldPlay);
  const button = group.querySelector('[data-motion-toggle]');
  if (button) {
    button.textContent = shouldPlay ? 'Pause' : 'Play';
    button.setAttribute('aria-label', `${shouldPlay ? 'Pause' : 'Play'} animation`);
  }
};

motionGroups.forEach((group) => {
  setGroupPlayback(group, false);
  group.querySelector('[data-motion-toggle]')?.addEventListener('click', () => {
    setGroupPlayback(group, group.dataset.playing !== 'true');
  });
});
observedVideos.forEach((video) => video.pause());

if (!reduceMotion && 'IntersectionObserver' in window) {
  const groupObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    setGroupPlayback(entry.target, entry.isIntersecting && entry.intersectionRatio >= .55);
  }), { threshold: [0, .55] });
  motionGroups.forEach((group) => groupObserver.observe(group));

  const videoObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting && entry.intersectionRatio >= .7) video.play().catch(() => {});
    else video.pause();
  }), { threshold: [0, .7] });
  observedVideos.forEach((video) => videoObserver.observe(video));
}

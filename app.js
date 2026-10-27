const chapters = [...document.querySelectorAll('.chapter')];
const navLinks = [...document.querySelectorAll('#chapter-nav a')];
const motionSettings = {
  revealDelay: 150,
  revealDuration: 220,
  sliderDuration: 600,
  storyPause: 140,
  storyStepLock: 1000
};
document.documentElement.style.setProperty('--reveal-delay', `${motionSettings.revealDelay}ms`);
document.documentElement.style.setProperty('--reveal-duration', `${motionSettings.revealDuration}ms`);
document.documentElement.style.setProperty('--slider-duration', `${motionSettings.sliderDuration}ms`);
let scheduled = false;
function updateReading() {
  let active = chapters[0];
  for (const chapter of chapters) if (chapter.getBoundingClientRect().top <= 185) active = chapter;
  navLinks.forEach(link => {
    if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } }, { passive: true });
window.addEventListener('resize', updateReading);
updateReading();
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0, rootMargin: '0px 0px -50% 0px' });
  document.querySelectorAll('.reveal, .reveal-art, .metric-pop').forEach(el => observer.observe(el));
}
const showcaseSlides = [...document.querySelectorAll('[data-showcase-slide]')];
const showcaseButtons = [...document.querySelectorAll('[data-slide]')];
let activeSlide = 0;
let showcaseTimer;

function showSlide(index) {
  if (index === activeSlide) return;
  const previousSlide = showcaseSlides[activeSlide];
  previousSlide.classList.remove('active');
  previousSlide.classList.add('exiting');
  previousSlide.setAttribute('aria-hidden', 'true');
  const nextSlide = showcaseSlides[index];
  nextSlide.classList.remove('exiting');
  nextSlide.classList.add('active');
  nextSlide.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => previousSlide.classList.remove('exiting'), motionSettings.sliderDuration + 50);
  activeSlide = index;
  document.querySelector('#slide-label').textContent = `${String(index + 1).padStart(2, '0')} / ${String(showcaseSlides.length).padStart(2, '0')}`;
  showcaseButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === index;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function startShowcase() {
  window.clearInterval(showcaseTimer);
  showcaseTimer = window.setInterval(() => showSlide((activeSlide + 1) % showcaseSlides.length), 3500);
}

showcaseButtons.forEach(button => button.addEventListener('click', () => {
  showSlide(Number(button.dataset.slide));
  startShowcase();
}));
startShowcase();
const storyPanels = [...document.querySelectorAll('[data-story-panel]')];
const storyMedia = [...document.querySelectorAll('.story-media [data-story-media]')];
const storyTriggers = [...document.querySelectorAll('[data-story-trigger]')];
const storySteps = [...document.querySelectorAll('[data-story-step]')];
const storyScrollbar = document.querySelector('.story-scrollbar');
const storyScroll = document.querySelector('.story-scroll');
let activeStory = 0;
let storySwapTimer;
let storyWheelLocked = false;

function setActiveStory(index) {
  if (index === activeStory && !storySwapTimer) return;
  window.clearTimeout(storySwapTimer);
  const currentPanel = storyPanels[activeStory];
  currentPanel.classList.remove('is-active');
  currentPanel.classList.add('is-leaving');
  storySwapTimer = window.setTimeout(() => {
    storyPanels.forEach(panel => panel.classList.remove('is-active', 'is-leaving'));
    storyPanels[index].classList.add('is-active');
    storyMedia.forEach((media, mediaIndex) => {
      const active = mediaIndex === index;
      media.classList.toggle('is-active', active);
      if (active) {
        media.currentTime = 0;
        media.play().catch(() => {});
      } else media.pause();
    });
    activeStory = index;
    storySteps.forEach((step, stepIndex) => {
      const active = stepIndex === index;
      step.classList.toggle('active', active);
      if (active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    if (storyScrollbar) storyScrollbar.style.setProperty('--story-progress', `${index / Math.max(storyPanels.length - 1, 1) * 100}%`);
    storySwapTimer = null;
  }, motionSettings.revealDuration + motionSettings.storyPause);
}

if (storyTriggers.length && 'IntersectionObserver' in window) {
  const storyObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting && !storyWheelLocked) setActiveStory(Number(entry.target.dataset.storyTrigger));
  }), { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
  storyTriggers.forEach(trigger => storyObserver.observe(trigger));
}

storySteps.forEach(step => step.addEventListener('click', () => {
  const trigger = storyTriggers[Number(step.dataset.storyStep)];
  if (trigger) trigger.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
}));

window.addEventListener('wheel', event => {
  if (!storyScroll || storyWheelLocked || Math.abs(event.deltaY) < 4) return;
  const bounds = storyScroll.getBoundingClientRect();
  const storyIsActive = bounds.top <= 160 && bounds.bottom >= window.innerHeight * .6;
  if (!storyIsActive) return;
  const direction = event.deltaY > 0 ? 1 : -1;
  const nextStory = activeStory + direction;
  if (nextStory < 0 || nextStory >= storyPanels.length) return;
  event.preventDefault();
  storyWheelLocked = true;
  setActiveStory(nextStory);
  storyTriggers[nextStory].scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  window.setTimeout(() => { storyWheelLocked = false; }, motionSettings.storyStepLock);
}, { passive: false });
const journeyViews = {
  after: '<span class="journey-start">I want to…</span><div class="journey-path"><div><b>Go abroad</b><span>Roaming services</span></div><div><b>Connect at home</b><span>Home broadband</span></div><div><b>Enjoy entertainment</b><span>Streaming services</span></div></div><span class="journey-end">A relevant service. Just two clicks away. ↗</span>',
  before: '<span class="journey-start">Product catalog</span><div class="journey-path"><div><b>Mobile services</b><span>Plans → Add-ons → Roaming</span></div><div><b>Fixed-line services</b><span>Broadband → Plans → Details</span></div><div><b>Digital services</b><span>Entertainment → OTT → Details</span></div></div><span class="journey-end">Business categories. More layers to navigate.</span>'
};
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  const canvas = button.closest('.experience-canvas');
  const journey = canvas?.querySelector('.journey-diagram');
  const controls = canvas?.querySelectorAll('[data-view]') || [];
  if (journey) journey.innerHTML = journeyViews[button.dataset.view];
  controls.forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
}));
const intents = {
  travel: ['為旅程準備好連線', '世界很大，隨時保持連結。', '探索適合目的地與天數的漫遊服務。', '↗'],
  home: ['讓家裡每個角落都連上線', '在家工作、追劇，都很順。', '探索適合家庭需求的寬頻與上網服務。', '⌂'],
  entertainment: ['把喜歡的精彩帶進生活', '你的片單，隨時準備好了。', '探索影音串流與數位娛樂服務。', '▷']
};
document.querySelectorAll('[data-intent]').forEach(button => button.addEventListener('click', () => {
  const [label, title, description, icon] = intents[button.dataset.intent];
  document.querySelector('.intent-result small').textContent = label;
  document.querySelector('#intent-title').textContent = title;
  document.querySelector('#intent-description').textContent = description;
  document.querySelector('#intent-icon').textContent = icon;
  document.querySelectorAll('[data-intent]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
}));
const portfolioMenuButton=document.querySelector('.menu-toggle');
const portfolioMenu=document.querySelector('#main-nav');
if(portfolioMenuButton&&portfolioMenu){portfolioMenuButton.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');portfolioMenuButton.setAttribute('aria-expanded',String(open));portfolioMenuButton.textContent=open?'Close':'Menu'});portfolioMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{document.body.classList.remove('menu-open');portfolioMenuButton.setAttribute('aria-expanded','false');portfolioMenuButton.textContent='Menu'}))}

const taskStory = document.querySelector('[data-task-story]');
if (taskStory) {
  const steps = [...taskStory.querySelectorAll('[data-task-step]')];
  const panels = [...taskStory.querySelectorAll('[data-task-panel]')];
  const progress = [...taskStory.querySelectorAll('.task-progress span')];

  const activateTask = index => {
    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;
      panel.classList.toggle('active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
    progress.forEach((marker, markerIndex) => marker.classList.toggle('active', markerIndex === index));
  };

  if ('IntersectionObserver' in window) {
    const taskObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) activateTask(Number(entry.target.dataset.taskStep));
      });
    }, { threshold: 0, rootMargin: '-32% 0px -55% 0px' });
    steps.forEach(step => taskObserver.observe(step));
  }
}


const strategyVideos = document.querySelectorAll('.esun-categories-video, .esun-selection-video, .esun-settings-video');

// This demonstration is explicitly set to autoplay silently when visible.
strategyVideos.forEach(categoriesVideo => {
  categoriesVideo.muted = true;
  let videoVisible = false;
  const syncCategoriesPlayback = () => {
    if (videoVisible && !document.hidden) {
      categoriesVideo.play().catch(() => {});
    } else {
      categoriesVideo.pause();
    }
  };
  if ('IntersectionObserver' in window) {
    const categoriesObserver = new IntersectionObserver(entries => {
      videoVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= .15;
      syncCategoriesPlayback();
    }, { threshold: [0, .15] });
    categoriesObserver.observe(categoriesVideo);
  } else {
    videoVisible = true;
    syncCategoriesPlayback();
  }
  document.addEventListener('visibilitychange', syncCategoriesPlayback);
});

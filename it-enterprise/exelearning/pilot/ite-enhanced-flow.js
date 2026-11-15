/* Topic flow: native Form remains the sole owner of the final LMS score. */
(() => {
  const video = document.querySelector('.iv-root');
  const hotspot = document.querySelector('.hotspot-root');
  const checkpoint = document.querySelector('.quiz-set-root');
  const practice = document.querySelector('.dnd-challenge');
  if (!video || !hotspot || !checkpoint || !practice) return;
  function reveal(root) {
    root.hidden = false;
    root.querySelector('h2')?.setAttribute('tabindex', '-1');
    root.querySelector('h2')?.focus({preventScroll:true});
    root.querySelector('.hotspot-scroll,.quiz-set-scroll')?.scrollTo(0,0);
  }
  document.addEventListener('lcm-lesson-finish', () => {
    document.querySelector('.sim-root').hidden = true;
    reveal(video);
  });
  document.addEventListener('lcm-sortparagraphs-finish', () => {
    practice.hidden = true;
    reveal(hotspot);
  });
  document.addEventListener('lcm-hotspot-complete', () => {
    hotspot.querySelector('[data-ite-next]').disabled = false;
  });
  hotspot.addEventListener('click', event => {
    if (event.target.closest('.hotspot-retry')) hotspot.querySelector('[data-ite-next]').disabled = true;
    if (event.target.closest('[data-ite-next]') && hotspot.dataset.complete === 'true') {
      hotspot.hidden = true;
      reveal(checkpoint);
    }
  });
  document.addEventListener('lcm-quiz-complete', () => {
    checkpoint.querySelector('[data-ite-next]').disabled = false;
  });
  checkpoint.addEventListener('click', event => {
    if (event.target.closest('.quiz-retry')) checkpoint.querySelector('[data-ite-next]').disabled = true;
    if (event.target.closest('[data-ite-next]') && checkpoint.dataset.complete === 'true') {
      checkpoint.hidden = true;
      reveal(practice);
    }
  });
  const media = video.querySelector('video.iv-video');
  new MutationObserver(() => {
    if (document.body.dataset.scenePhase !== '1') media?.pause();
  }).observe(document.body, {attributes:true, attributeFilter:['data-scene-phase']});
})();

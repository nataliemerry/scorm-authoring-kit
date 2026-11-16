/* Route through enabled ITE activities without marking skipped work complete. */
(() => {
 const api=window.iteSections;
 const steps=[['video','.iv-root','lcm-video-finish'],['situations','.sim-root','lcm-simulation-finish'],['wordSearch','.word-root','lcm-wordsearch-finish'],['dragWords','.dt-root','lcm-dragwords-finish'],['sortParagraphs','.sp-root','lcm-sortparagraphs-finish'],['hotspot','.hotspot-root',null],['concept','.quiz-set-root',null],['case','.dnd-challenge',null]];
 function move(after){
  steps.forEach(([,selector])=>{document.querySelector(selector).hidden=true;});
  const next=steps.slice(after+1).find(([id])=>api.enabled(id));
  if(!next){api.routeReady=true;document.dispatchEvent(new Event('ite-route-finish'));return;}
  const root=document.querySelector(next[1]);root.hidden=false;root.querySelector('.hotspot-scroll,.quiz-set-scroll')?.scrollTo(0,0);
  const heading=root.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
 }
 document.addEventListener('lcm-lesson-finish',()=>move(-1));
 steps.forEach(([,selector,event],index)=>{
  if(event)document.addEventListener(event,()=>move(index));
  const root=document.querySelector(selector);
  if(index===5||index===6){const button=root.querySelector('[data-ite-next]');button.textContent=api.nextLabel(steps[index][0]);document.addEventListener(index===5?'lcm-hotspot-complete':'lcm-quiz-complete',()=>{button.disabled=false;});root.addEventListener('click',event=>{if(event.target.closest('.hotspot-retry,.quiz-retry'))button.disabled=true;if(event.target.closest('[data-ite-next]')&&root.dataset.complete==='true')move(index);});}
 });
 document.addEventListener('lcm-practice-complete',()=>{api.routeReady=true;},true);
 const media=document.querySelector('video.iv-video');new MutationObserver(()=>{if(document.body.dataset.scenePhase!=='1')media?.pause();}).observe(document.body,{attributes:true,attributeFilter:['data-scene-phase']});
})();

/* QA only: serve the native eXeLearning IT Enterprise export on loopback, with a mock LMS. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../exelearning/pilot',process.argv.includes('--dev')?'dev-preview':'preview');
const out=path.resolve(__dirname,'../../exelearning/pilot/qa');fs.mkdirSync(out,{recursive:true});
const narrative=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../data/course_experiences.humanized.humanized.json'),'utf8'));
const server=require('./local-server.cjs')(root);
let browser;const report={checks:[],screenshots:[]};
function mock(){window.lms={values:{'cmi.core.lesson_status':'not attempted'},calls:[]};window.API={LMSInitialize:()=> 'true',LMSGetValue:k=>window.lms.values[k]||(k.endsWith('_count')?'0':''),LMSSetValue:(k,v)=>{window.lms.values[k]=v;window.lms.calls.push([k,v]);return 'true';},LMSCommit:()=> 'true',LMSFinish:()=> 'true',LMSGetLastError:()=> '0',LMSGetErrorString:()=>'',LMSGetDiagnostic:()=>''};}
async function shot(p,n){
 await p.evaluate(()=>document.fonts.ready);
 assert.equal(await p.locator('.scene-chrome-right > *').count(),1);assert.equal(await p.locator('.scene-chrome-right > .scene-fullscreen').count(),1);assert.equal(await p.locator('.scene-chrome .scene-clock').count(),0);
 const logo=p.locator('.scene-brand-logo');assert.equal(await logo.count(),1);assert(await logo.isVisible());
 assert(await logo.evaluate(e=>e.complete&&e.naturalWidth===958&&e.naturalHeight===980),'Official logo must load at original dimensions');
 const header=await p.locator('.scene-chrome').evaluate(e=>{const a=e.querySelector('.scene-identity').getBoundingClientRect(),b=e.querySelector('.scene-chrome-right').getBoundingClientRect();return {left:a.left,right:a.right,controls:b.left,width:innerWidth};});
 assert(header.left>=0&&header.right<=header.controls&&header.controls<header.width,'Logo/identity must not overlap header controls');
 const small=await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{
  if(e.closest('.sr-av,.sr-only,script,style,[hidden]'))return false;
  if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return false;
  const r=e.getBoundingClientRect(),s=getComputedStyle(e);
  return r.width>2&&r.height>2&&e.checkVisibility()&&s.visibility!=='hidden'&&parseFloat(s.fontSize)<14;
 }).map(e=>({text:e.textContent.trim().slice(0,70),size:getComputedStyle(e).fontSize,cls:e.className})).slice(0,20));
 assert.deepEqual(small,[],n+': text below 14px');
 await p.screenshot({path:path.join(out,n),animations:'disabled'});if(!report.screenshots.includes(n))report.screenshots.push(n);
}
async function videoActivity(p,cid,shots){
 assert(await p.locator('.iv-root').isVisible());assert.equal(await p.locator('.sim-root').isVisible(),false);
 const before=await p.evaluate(()=>window.lms?.values?.['cmi.core.score.raw']||null);
 await p.waitForFunction(()=>document.querySelector('.iv-video').duration>463&&document.querySelector('.iv-video').duration<465);
 const cfg=await p.locator('.iv-config').evaluate(e=>JSON.parse(e.textContent));
 assert(cfg.hasAudio);assert(cfg.interactions.every(item=>item.at<464));
 assert.equal(await p.locator('.scene-clock').isVisible(),false);
 assert.equal(await p.locator('.iv-marker').count(),cfg.interactions.length);
 await p.locator('.iv-play').click();await p.waitForFunction(()=>document.querySelector('.iv-video').currentTime>0.05);
 await p.locator('.iv-play').click();
 await p.locator('.iv-timeline').press('Home');await p.locator('.iv-timeline').press('ArrowRight');
 assert(await p.locator('.iv-video').evaluate(e=>e.currentTime>=4));
 assert(await p.locator('.iv-mute').isVisible());await p.locator('.iv-mute').click();assert(await p.locator('.iv-video').evaluate(e=>e.muted));await p.locator('.iv-mute').click();assert.equal(await p.locator('.iv-video').evaluate(e=>e.muted),false);
 if(await p.locator('.iv-volume').isVisible()){await p.locator('.iv-volume').press('Home');assert(await p.locator('.iv-video').evaluate(e=>e.muted));await p.locator('.iv-volume').press('End');}
 if(shots)await shot(p,'ITE-interactive-video.png');
 const originalViewport=p.viewportSize(),isMobile=originalViewport.width<640;
 if(shots&&!isMobile)await p.setViewportSize({width:1918,height:1080});
 await p.locator('.iv-player-fullscreen').click();
 await p.waitForFunction(()=>document.fullscreenElement?.classList.contains('iv-video-frame'));
 const fullscreen=await p.locator('.iv-video-frame').evaluate(frame=>{const v=frame.querySelector('video'),a=frame.getBoundingClientRect(),b=v.getBoundingClientRect(),c=frame.querySelector('.iv-player-controls').getBoundingClientRect();return {w:innerWidth,h:innerHeight,frame:[a.x,a.y,a.width,a.height],video:[b.x,b.y,b.width,b.height],controls:[c.x,c.y,c.right,c.bottom],fit:getComputedStyle(v).objectFit,max:getComputedStyle(v).maxHeight};});
 report.fullscreen=report.fullscreen||[];report.fullscreen.push(fullscreen);
 for(const box of [fullscreen.frame,fullscreen.video]){assert(Math.abs(box[0])<=1&&Math.abs(box[1])<=1);assert(Math.abs(box[2]-fullscreen.w)<=1&&Math.abs(box[3]-fullscreen.h)<=1);}
 assert.equal(fullscreen.fit,'contain');assert.equal(fullscreen.max,'none');assert(fullscreen.controls[0]>=-1&&fullscreen.controls[2]<=fullscreen.w+1&&fullscreen.controls[3]<=fullscreen.h+1);
 if(shots||isMobile){const name=isMobile?'ITE-video-fullscreen-mobile.png':'ITE-video-fullscreen.png';await p.screenshot({path:path.join(out,name),animations:'disabled'});if(!report.screenshots.includes(name))report.screenshots.push(name);}

 for(let i=0;i<cfg.interactions.length;i++){
  await p.locator('[data-iv-marker="'+i+'"]').click();assert(await p.locator('.iv-question').isVisible());
  await p.locator('input[name="iv-answer"]').nth(i===0?(cfg.interactions[i].correct+1)%3:cfg.interactions[i].correct).check();
  await p.locator('.iv-check').click();assert((await p.locator('.iv-feedback').innerText()).includes(i===0?'belum tepat':'tepat'));
  if(i===1)await shot(p,shots?'ITE-video-question.png':'ITE-video-question-mobile.png');
  await p.locator('.iv-resume').click();
  if(i===0){await p.locator('.iv-player-fullscreen').click();await p.waitForFunction(()=>!document.fullscreenElement);await p.setViewportSize(originalViewport);await p.waitForFunction(()=>document.querySelector('.iv-player-fullscreen')?.getAttribute('aria-label')==='Buka video layar penuh');}
 }
 await p.locator('.iv-finish').click();assert(await p.locator('.sim-root').isVisible());
 assert(await p.locator('.iv-video').evaluate(e=>e.paused));
 // Release the already-tested hidden decoder between screenshot-heavy test stages.
 await p.locator('.iv-video').evaluate(e=>{e.removeAttribute('src');e.querySelectorAll('source').forEach(s=>s.removeAttribute('src'));e.load();});
 assert.equal(await p.evaluate(()=>window.lms?.values?.['cmi.core.score.raw']||null),before);
}
async function newActivities(p,cid,shots){
 const before=await p.evaluate(()=>window.lms?.values?.['cmi.core.score.raw']||null);
 assert(await p.locator('.hotspot-root').isVisible());assert(await p.locator('[data-ite-next="checkpoint"]').isDisabled());
 const labels=['Pengenal lintas unit','Aturan akses','Riwayat perpindahan','Dekorasi meja'];
 assert.deepEqual(await p.locator('.hotspot-caption').allTextContents(),labels);
 for(let i=0;i<labels.length;i++){
  const marker=p.locator('.hotspot-marker').nth(i),caption=marker.locator('.hotspot-caption');
  assert((await p.locator('.hotspot-list button').nth(i).innerText()).includes(labels[i]));
  const bounds=await caption.evaluate(e=>{const b=e.getBoundingClientRect(),r=e.closest('button').getBoundingClientRect();return {inside:b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom,unclipped:e.scrollWidth<=e.clientWidth,font:parseFloat(getComputedStyle(e).fontSize)};});
  assert(bounds.inside&&bounds.unclipped&&bounds.font>=14,JSON.stringify(bounds));
 }
 await shot(p,shots?'ITE-hotspot-labels.png':'ITE-hotspot-labels-mobile.png');
 await p.locator('.hotspot-list [data-hotspot="decoration"]').press('Enter');assert.equal(await p.locator('.hotspot-root').getAttribute('data-complete'),'false');
 const region=p.locator('.hotspot-marker[data-hotspot="identifier"]');if(await p.evaluate(()=>matchMedia('(pointer:coarse)').matches))await region.tap();else await region.click();await p.locator('.hotspot-retry').click();
 assert((await p.locator('.hotspot-progress').innerText()).includes('0 dari 3'));
 for(const id of ['identifier','access','history'])await p.locator('.hotspot-list [data-hotspot="'+id+'"]').press('Enter');
 assert.equal(await p.locator('.hotspot-root').getAttribute('data-complete'),'true');
 await shot(p,shots?'ITE-hotspot.png':'ITE-hotspot-mobile.png');await p.locator('[data-ite-next="checkpoint"]').click();
 assert(await p.locator('.quiz-set-root').isVisible());assert(await p.locator('[data-ite-next="case"]').isDisabled());
 await p.locator('.quiz-next').click();await p.locator('.quiz-next').click();await p.locator('.quiz-next').click();
 assert((await p.locator('.quiz-alert').innerText()).includes('Jawab seluruh'));
 await p.locator('.quiz-prev').click();await p.locator('.quiz-prev').click();
 const cfg=await p.locator('.quiz-set-config').evaluate(e=>JSON.parse(e.textContent));
 for(let i=0;i<cfg.questions.length;i++){await p.locator('.quiz-card input').nth(i===0?(cfg.questions[i].correct+1)%3:cfg.questions[i].correct).check();await p.locator('.quiz-next').click();}
 assert.equal(await p.locator('.quiz-set-root').getAttribute('data-complete'),'true');
 assert.equal(await p.locator('.quiz-set-root').getAttribute('data-scorm-saved'),'false');
 await shot(p,shots?'ITE-question-set.png':'ITE-question-set-mobile.png');
 await p.locator('.quiz-retry').click();assert(await p.locator('[data-ite-next="case"]').isDisabled());
 for(let i=0;i<cfg.questions.length;i++){await p.locator('.quiz-card input').nth(cfg.questions[i].correct).check();await p.locator('.quiz-next').click();}
 assert.equal(await p.evaluate(()=>window.lms?.values?.['cmi.core.score.raw']||null),before);
 assert.equal(await p.locator('.quiz-set-root').getAttribute('data-score'),'100');
 await p.locator('[data-ite-next="case"]').click();
}

async function answer(p,cid,index,correct=true){const key=narrative[cid].quizzes[index].answer_key;const option=correct?'ABC'.indexOf(key):('ABC'.indexOf(key)+1)%3;await p.locator(`.FRMP-SlideshowSlide[data-slide="${index}"] input[type=radio]`).nth(option).check();}

async function place(p,id,zone,drag=false){
 const c=p.locator(`[data-drag="${id}"]`),t=p.locator(`[data-drop-target="${zone}"]`);
 if(drag){await c.scrollIntoViewIfNeeded();const a=await c.boundingBox(),b=await t.boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:24});await p.mouse.up();await p.waitForTimeout(450);}
 else{await c.focus();await c.press('Enter');await t.focus();await t.press('Enter');}
 assert.equal(await p.locator(`[data-drag="${id}"]`).evaluate(e=>e.closest('[data-drop]').dataset.drop),zone,id+' move');
}
async function check(p){await p.locator('[data-dnd-action=check]').click();}
async function complete(p,cid){
 const {steps}=await p.locator('.dnd-config').evaluate(e=>JSON.parse(e.textContent));
 for(const step of steps)assert(step.items.every(item=>item.image?.startsWith('cards/ITE-')));
 assert.equal(await p.locator('.dnd-card').count(),await p.locator('.dnd-card img').count());
 assert(await p.locator('.dnd-card img').evaluateAll(es=>es.every(e=>e.complete&&e.naturalWidth>0)));
 for(const [id,zone] of Object.entries(steps[0].solution)) await place(p,id,zone,id==='shared');
 await check(p);
 assert.equal(await p.locator('.dnd-status.is-error').count(),0);
 await check(p);
 await p.waitForFunction(()=>[...document.querySelectorAll('.dnd-card img')].every(e=>e.complete&&e.naturalWidth>0));assert.equal(await p.locator('.dnd-card').count(),await p.locator('.dnd-card img').count());
 await place(p,'rollout','first');
 await place(p,'test','second');
 await place(p,'review','third');
 await check(p);
 assert.equal(await p.locator('.dnd-status.is-error').count(),1);
 await place(p,'agree','first');
 await check(p);
 assert.equal(await p.locator('.dnd-challenge').getAttribute('data-complete'),'true');
 await shot(p,cid+'-challenge-complete.png');
}

async function sourceCheck(p){
 const cfg=await p.locator('.lesson-config').evaluate(e=>JSON.parse(e.textContent));const count=await p.locator('.lesson-count').innerText();const index=Number(count.match(/Materi (\d)/)[1])-1,l=cfg.lessons[index];
 assert.equal(await p.locator('.lesson-sources li').count(),l.references.length);assert.equal(await p.locator('.lesson-body').count(),l.paragraph_sources.length);
 for(let i=0;i<l.references.length;i++){const a=p.locator('.lesson-sources li').nth(i).locator('a');assert.equal(await a.getAttribute('href'),l.references[i].url);assert.equal(await a.getAttribute('target'),'_blank');assert((await a.getAttribute('rel')).includes('noopener'));assert((await p.locator('.lesson-sources li').nth(i).innerText()).includes(l.references[i].section));}
 assert.equal(await p.locator('.lesson-citation').count(),l.paragraph_sources.flat().length);assert((await p.locator('.lesson-source-note').innerText()).includes('14 November 2026'));
}
async function learn(p,cid,timed=false,shots=true){
 assert.equal(await p.locator('.sim-root').isVisible(),false);await p.locator('.lesson-open').click();
 for(let i=0;i<2;i++){await sourceCheck(p);await p.locator('[data-simple-example]').click();assert((await p.locator('#lesson-example').innerText()).includes('Contoh simulasi'));assert.equal(await p.locator('[data-simple-example]').getAttribute('aria-expanded'),'true');assert(await p.locator('#lesson-example').isVisible());if(shots)await shot(p,cid+'-simple-material-'+(i+1)+'.png');await p.locator('[data-lesson-action=next]').click();}
 await sourceCheck(p);await p.locator('.simple-check-button').click();assert((await p.locator('.simple-check-feedback').innerText()).includes('Pilih satu'));await p.locator('input[name=lesson-answer][value="0"]').check();await p.locator('.simple-check-button').click();assert(await p.locator('.scene-free').isDisabled());await p.locator('input[name=lesson-answer][value="2"]').check();await p.locator('.simple-check-button').click();assert(await p.locator('.scene-free').isEnabled());if(timed)await p.locator('#simple-timer').check();await p.locator('.scene-free').click();await videoActivity(p,cid,shots);assert.equal(await p.getAttribute('body','data-scene-phase'),'1');assert.equal(await p.locator('.lesson-root').getAttribute('data-complete'),'true');
}
async function sortParagraphs(p,cid,shots){
 assert(await p.locator('.sp-root').isVisible());assert.equal(await p.locator('.dnd-challenge').isVisible(),false);
 const cfg=await p.locator('.sp-config').evaluate(e=>JSON.parse(e.textContent)),list=()=>p.locator('.sp-card').evaluateAll(es=>es.map(e=>e.dataset.spId)),initialScore=await p.evaluate(()=>window.lms?.values['cmi.core.score.raw']||null);
 assert.deepEqual(await list(),cfg.initial_order);assert.equal(await p.locator('.sp-card').count(),4);
 await p.locator('[data-sp-action=check]').click();assert.equal(await p.locator('.sp-root').getAttribute('data-complete'),'false');
 const target=p.locator('[data-sp-id=p3]');await target.scrollIntoViewIfNeeded();await p.locator('.sp-scroll').evaluate(e=>{const r=e.getBoundingClientRect(),h=e.querySelector('[data-sp-handle=p1]').getBoundingClientRect();if(h.bottom>r.bottom-12)e.scrollTop+=h.bottom-r.bottom+12;});const a=await p.locator('[data-sp-handle=p1]').boundingBox(),b=await target.boundingBox();
 if(shots){await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+25,{steps:24});await p.mouse.up();}
 else{const cdp=await p.context().newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});for(let i=1;i<=20;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+a.width/2+(b.x+b.width/2-a.x-a.width/2)*i/20,y:a.y+a.height/2+(b.y+25-a.y-a.height/2)*i/20}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 await p.waitForTimeout(450);assert.equal((await list())[0],'p1','Pointer/touch reorder: '+await p.locator('.sp-feedback').innerText()+' '+JSON.stringify({a,b}));await p.locator('[data-sp-action=undo]').click();assert.deepEqual(await list(),cfg.initial_order);
 await p.locator('[data-sp-up=p1]').click();assert.equal((await list())[0],'p1');await p.locator('[data-sp-action=undo]').click();
 await p.locator('[data-sp-handle=p1]').focus();await p.locator('[data-sp-handle=p1]').press('Space');await p.locator('[data-sp-handle=p1]').press('ArrowUp');assert.equal((await list())[0],'p1');await p.locator('[data-sp-handle=p1]').press('Escape');assert.deepEqual(await list(),cfg.initial_order);
 await p.locator('[data-sp-handle=p1]').press('Enter');await p.locator('[data-sp-handle=p1]').press('ArrowUp');await p.locator('[data-sp-handle=p1]').press('Enter');assert.equal((await list())[0],'p1');
 for(let i=0;i<cfg.correct_order.length;i++){const id=cfg.correct_order[i];while((await list()).indexOf(id)>i)await p.locator(`[data-sp-up="${id}"]`).click();}
 await p.locator('[data-sp-action=check]').click();assert.equal(await p.locator('.sp-root').getAttribute('data-correct'),'4');assert.equal(await p.locator('.sp-root').getAttribute('data-connections'),'3');assert.equal(await p.locator('.sp-root').getAttribute('data-complete'),'true');await shot(p,cid+(shots?'-sort-paragraphs.png':'-sort-paragraphs-mobile.png'));
 await p.locator('[data-sp-action=retry]').click();assert.deepEqual(await list(),cfg.initial_order);assert.equal(await p.locator('.sp-root').getAttribute('data-complete'),'false');await p.locator('[data-sp-action=solution]').click();assert.deepEqual(await list(),cfg.correct_order);assert.equal(await p.locator('.sp-root').getAttribute('data-assisted'),'true');await p.locator('[data-sp-action=check]').click();assert.equal(await p.locator('.sp-root').getAttribute('data-complete'),'false');
 await p.locator('[data-sp-action=undo]').click();assert.deepEqual(await list(),cfg.initial_order);assert.equal(await p.locator('.sp-root').getAttribute('data-assisted'),'true');assert.equal(await p.evaluate(()=>window.lms?.values['cmi.core.score.raw']||null),initialScore);
 await p.locator('[data-sp-action=continue]').click();await newActivities(p,cid,shots);assert(await p.locator('.dnd-challenge').isVisible());
}
async function dragWords(p,cid,shots){
 assert(await p.locator('.dt-root').isVisible());assert.equal(await p.locator('.dnd-challenge').isVisible(),false);
 const cfg=await p.locator('.dt-config').evaluate(e=>JSON.parse(e.textContent)),initialScore=await p.evaluate(()=>window.lms?.values['cmi.core.score.raw']||null);
 assert.equal(await p.locator('.dt-sentences > li').count(),3);assert.equal(await p.locator('.dt-bank [data-dt-card]').count(),4);
 await p.locator('[data-dt-action=check]').click();assert.equal(await p.locator('.dt-root').getAttribute('data-correct'),'0');assert.equal(await p.locator('.dt-sentences [data-state=empty]').count(),3);
 async function put(id,gap,drag=false){
  const source=p.locator(`[data-dt-card="${id}"]`),target=p.locator(`[data-dt-target="${gap}"]`);await target.scrollIntoViewIfNeeded();
  if(drag){const a=await source.boundingBox(),b=await target.boundingBox();if(shots){await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:20});await p.mouse.up();}else{const cdp=await p.context().newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});for(let i=1;i<=20;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+a.width/2+(b.x-a.x)*i/20,y:a.y+a.height/2+(b.y-a.y)*i/20}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}await p.waitForTimeout(450);}
  else if(shots){await source.focus();await source.press('Enter');await target.focus();await target.press('Enter');}
  else{await source.tap();await target.tap();}
  assert.equal(await target.getAttribute('data-dt-card'),id);
 }
 const distractor=cfg.words.find(w=>!cfg.gaps.some(g=>g.answer===w.id)).id;
 await put(distractor,'g1',true);await p.locator('[data-dt-action=check]').click();assert.equal(await p.locator('.dt-sentences [data-state=wrong]').count(),1);
 await p.locator('[data-dt-action=undo]').click();assert.equal(await p.locator('[data-dt-target=g1]').getAttribute('data-dt-card'),null);
 await put(cfg.gaps[0].answer,'g1');await put(distractor,'g1');assert.equal(await p.locator(`.dt-bank [data-dt-card="${cfg.gaps[0].answer}"]`).count(),1);
 await p.locator('[data-dt-action=undo]').click();assert.equal(await p.locator('[data-dt-target=g1]').getAttribute('data-dt-card'),cfg.gaps[0].answer);
 await p.locator(`[data-dt-remove="${cfg.gaps[0].answer}"]`).click();await p.locator('[data-dt-action=undo]').click();
 for(const gap of cfg.gaps.slice(1))await put(gap.answer,gap.id);
 await p.locator('[data-dt-action=check]').click();assert.equal(await p.locator('.dt-root').getAttribute('data-correct'),'3');assert.equal(await p.locator('.dt-root').getAttribute('data-complete'),'true');await shot(p,cid+(shots?'-drag-words.png':'-drag-words-mobile.png'));
 await p.locator('[data-dt-action=retry]').click();assert.equal(await p.locator('.dt-bank [data-dt-card]').count(),4);assert.equal(await p.locator('.dt-root').getAttribute('data-complete'),'false');
 await p.locator('[data-dt-action=solution]').click();assert.equal(await p.locator('.dt-root').getAttribute('data-assisted'),'true');assert.equal(await p.locator('.dt-root').getAttribute('data-complete'),'false');await p.locator('[data-dt-action=check]').click();assert.equal(await p.locator('.dt-root').getAttribute('data-complete'),'false');assert.equal(await p.evaluate(()=>window.lms?.values['cmi.core.score.raw']||null),initialScore);
 await p.locator('[data-dt-action=continue]').click();await sortParagraphs(p,cid,shots);assert(await p.locator('.dnd-challenge').isVisible());
}
async function lab(p,cid,shots=true){
 assert.equal(await p.locator('.sim-metrics,.sim-console,.sim-tools,.sim-journal').count(),0);
 for(let i=0;i<2;i++){
  assert.equal(await p.locator('[data-simple-choice]').count(),2);assert(await p.locator('[data-simple-sim=next]').isDisabled());
  await p.locator('[data-simple-choice="0"]').click();const first=await p.locator('.simple-consequence').innerText();await p.locator('[data-simple-choice="1"]').click();assert.notEqual(await p.locator('.simple-consequence').innerText(),first);
  await p.locator('[data-simple-choice="'+i+'"]').click();assert.equal(await p.locator('.simple-consequence').getAttribute('data-good'),'true');
  if(shots)await shot(p,cid+'-simple-situation-'+(i+1)+'.png');
  if(i===1){await p.locator('[data-simple-sim=back]').click();assert.equal(await p.locator('.sim-root').getAttribute('data-case'),'0');assert.equal(await p.locator('[data-simple-choice][aria-pressed=true]').count(),1);await p.locator('[data-simple-sim=next]').click();}
  await p.locator('[data-simple-sim=next]').click();
 }
 assert(await p.locator('.word-root').isVisible());assert.equal(await p.locator('.dnd-challenge').isVisible(),false);
 const words=await p.locator('.word-config').evaluate(e=>JSON.parse(e.textContent));assert.equal(await p.locator('.word-cell').count(),100);
 for(const w of words.words)assert.equal(w.cells.map(([r,c])=>words.grid[r][c]).join(''),w.term);
 assert.deepEqual(await p.locator('.word-term').allTextContents(),Array(5).fill(''));
 for(const w of words.words){assert(!(await p.locator('.word-vocabulary').innerText()).toUpperCase().match(new RegExp('\\b'+w.term+'\\b')),'Answer leaked before finding: '+w.term);}
 const cell=([r,c])=>p.locator(`[data-word-cell="${r},${c}"]`);
 await cell([0,0]).focus();await cell([0,0]).press('ArrowRight');await cell([0,1]).press('Enter');await cell([0,1]).press('Escape');assert.equal(await p.locator('.word-cell.is-selecting').count(),0);
 await cell([0,0]).click();await cell([1,2]).click();assert.equal(await p.locator('.word-root').getAttribute('data-found'),'0');
 const first=cell(words.words[0].cells[0]),last=cell(words.words[0].cells.at(-1));
 assert.equal(await p.locator('[data-word-hint]:visible').count(),5);
 await last.click();await first.click();
 assert.equal(await p.locator('.word-root').getAttribute('data-found'),'0');
 await cell([0,0]).press('Enter');await cell([1,1]).press('Enter');
 assert.match(await p.locator('.word-feedback').innerText(),/ke kanan atau ke bawah/);
 for(const [index,word] of words.words.entries()){
  await p.locator('[data-word-hint="'+index+'"]').click();
  assert.equal(await p.locator('.word-cell.is-hint').count(),1);
  assert(await cell(word.cells[0]).evaluate(e=>e.classList.contains('is-hint')));
  assert.deepEqual(await p.locator('.word-term').allTextContents(),Array(5).fill(''));
 }
 await first.click();await last.click();
 assert.equal(await p.locator('.word-root').getAttribute('data-found'),'0');
 assert(await p.getByText('✓ Ditemukan dengan petunjuk',{exact:true}).isVisible());
 await p.locator('[data-word-action=retry]').click();
 assert.equal(await p.locator('.word-cell.is-hint').count(),0);
 for(let i=0;i<words.words.length;i++){
  const w=words.words[i],a=w.cells[0],b=w.cells.at(-1);
  if(i===0&&shots){await cell(a).scrollIntoViewIfNeeded();const aa=await cell(a).boundingBox(),bb=await cell(b).boundingBox();await p.mouse.move(aa.x+aa.width/2,aa.y+aa.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps:20});await p.mouse.up();}
  else if(i===0&&!shots){await cell(a).scrollIntoViewIfNeeded();const aa=await cell(a).boundingBox(),bb=await cell(b).boundingBox(),cdp=await p.context().newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:aa.x+aa.width/2,y:aa.y+aa.height/2}]});for(let j=1;j<=15;j++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:aa.x+aa.width/2+(bb.x-aa.x)*j/15,y:aa.y+aa.height/2+(bb.y-aa.y)*j/15}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else if(i===1&&!shots){await cell(a).tap();await cell(b).tap();}
  else if(i===2){await cell(a).focus();await cell(a).press('Enter');await cell(b).focus();await cell(b).press('Enter');}
  else{await cell(a).click();await cell(b).click();}
  assert.equal(await p.locator('.word-term').filter({hasText:w.term}).count(),1,'Found answer must be disclosed');
  assert.equal(await p.locator('.word-root').getAttribute('data-found'),String(i+1),w.term+': '+await p.locator('.word-feedback').innerText());
  if(i===0){await cell(a).click();await cell(b).click();assert.equal(await p.locator('.word-root').getAttribute('data-found'),'1');}
 }
 assert.equal(await p.locator('.word-root').getAttribute('data-complete'),'true');await shot(p,cid+(shots?'-word-search.png':'-word-search-mobile.png'));
 await p.locator('[data-word-action=retry]').click();assert.equal(await p.locator('.word-term').filter({hasText:/\S/}).count(),0);assert.equal(await p.locator('.word-root').getAttribute('data-found'),'0');
 await p.locator('[data-word-action=solution]').click();assert.equal(await p.locator('.word-root').getAttribute('data-complete'),'false');assert.equal(await p.locator('.word-root').getAttribute('data-found'),'0');assert.equal(await p.locator('.word-vocabulary .word-state').filter({hasText:'Ditampilkan dengan bantuan'}).count(),5);
 await p.locator('[data-word-action=continue]').click();await dragWords(p,cid,shots);assert(await p.locator('.dnd-challenge').isVisible());assert.equal(await p.locator('.sim-root').getAttribute('data-complete'),'true');
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu']});const context=await browser.newContext({viewport:{width:1600,height:1100},reducedMotion:'reduce'});await context.addInitScript(mock);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(!process.argv.includes('--mobile-only')){
 for(const score of [100,0,50]){
  const cid='ITE';
  await page.goto(base+'/'+cid+'/index.html');await page.locator('.scene-chrome').waitFor();await shot(page,'ITE-cover.png');await learn(page,cid);await lab(page,cid);await shot(page,cid+'-challenge-start.png');
  await page.locator('[data-scene-phase="2"]').click();assert.equal(await page.getAttribute('body','data-scene-phase'),'1');
  await check(page);assert.equal(await page.locator('.dnd-status.is-error').count(),1);
  const first='shared',zone='current';await place(page,first,zone,true);await page.locator('[data-dnd-action=undo]').click();assert.equal(await page.locator(`[data-drag="${first}"]`).evaluate(e=>e.closest('[data-drop]').dataset.drop),'bank');
  await complete(page,cid);await page.locator('.scene-next').click();await page.locator('.scene-next').click();assert.equal(await page.getAttribute('body','data-scene-phase'),'2');
  await answer(page,cid,0,score>0);
  if(score===100){await page.locator('.scene-next').click();assert.equal(await page.getAttribute('body','data-scene-phase'),'2');assert.equal(await page.evaluate(()=>window.lms.values['cmi.core.lesson_status']),'incomplete');assert.equal(await page.evaluate(()=>window.lms.calls.some(([k])=>k==='cmi.core.score.raw')),false);report.checks.push('One unanswered native quiz question blocks submission and keeps incomplete');}
  await page.locator('.FRMP-SlideshowNext').click();await answer(page,cid,1,score===100);await page.locator('.scene-next').click();
  if(score===0)report.checks.push('Both wrong native answers produce raw 0 and passed under passScore=0 in a fresh attempt');
  assert.equal(await page.evaluate(()=>window.lms.values['cmi.core.score.raw']),String(score));assert.equal(await page.evaluate(()=>window.lms.values['cmi.core.lesson_status']),'passed');
  assert.equal(await page.locator('.scene-announcement').count(),0);assert.equal(await page.locator('.scene-review-badge-ok').count(),score/50);assert.equal(await page.locator('.scene-review-key').count(),2);await shot(page,'ITE-review.png');await page.locator('.scene-next').click();await shot(page,'ITE-result-'+score+'.png');
  report.checks.push(cid+(' raw '+score)+': verified primary-source citations on all three theory pages, simulated examples labeled, study-first prerequisite, example reveal, standard radio check, two-choice consequence, back preserves selection, clue-only word search, answers hidden until found/revealed and hidden again on retry, mouse/keyboard, forward selection and per-item hints, help/retry do not inflate found count, optional continue, Drag the Words mouse/touch/keyboard, empty/wrong/correct checks, replacement/undo/remove/reset, assisted solution never counts as independent, no LMS score changes, Sort the Paragraphs mouse/touch/button/keyboard reordering, Escape/undo restoration, correct positions/transitions, assisted reveal/reset, optional continue, simulation gate, real pointer drag, keyboard placement, undo, prerequisite gate, wrong-plan feedback, all stages complete, native LMS score; review matches participant choice, key and correct status');
 }
 await page.setViewportSize({width:1536,height:674});await page.goto(base+'/ITE/index.html');await learn(page,'ITE',false,false);
 for(let i=0;i<2;i++){await page.locator('[data-simple-choice="0"]').click();await page.locator('[data-simple-sim=next]').click();}
 await page.locator('.word-board').scrollIntoViewIfNeeded();const vertical=(await page.locator('.word-config').evaluate(e=>JSON.parse(e.textContent))).words.find(w=>w.cells[0][1]===w.cells[1][1]);for(const [r,c] of [vertical.cells[0],vertical.cells.at(-1)])await page.locator("[data-word-cell=\""+r+","+c+"\"]").press("Enter");assert.equal(await page.locator('.word-root').getAttribute('data-found'),'1');
 assert(await page.evaluate(()=>document.querySelector('.word-board').clientHeight<=document.querySelector('.word-scroll').clientHeight));assert.equal(await page.locator('.page-content').evaluate(e=>e.scrollTop),0);await shot(page,'ITE-word-search-short.png');report.checks.push('Short desktop: board fits scroll area, vertical word reachable, keyboard focus does not scroll outer page');await page.setViewportSize({width:1600,height:1100});
 await page.goto(base+'/ITE/index.html');await page.clock.install();await learn(page,'ITE',true,false);await page.clock.runFor(120000);assert.equal(await page.getAttribute('body','data-scene-phase'),'1');assert.equal(await page.evaluate(()=>window.lms.values['cmi.core.lesson_status']),'incomplete');assert.equal(await page.locator('.scene-clock small').innerText(),'WAKTU SELESAI');report.checks.push('120-second challenge keeps unfinished work and never submits unanswered quiz');
 }
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const mobile=await mobileContext.newPage();mobile.on("pageerror",e=>errors.push(e.message));
 for(const cid of ['ITE']){await mobile.goto(base+'/'+cid+'/index.html');await learn(mobile,cid,false,false);await shot(mobile,cid+'-simple-mobile.png');await lab(mobile,cid,false);await shot(mobile,cid+'-challenge-mobile.png');assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const id='shared',zone='target';const source=mobile.locator(`[data-drag="${id}"]`),target=mobile.locator(`[data-mobile-target="${zone}"]`);await source.scrollIntoViewIfNeeded();const a=await source.boundingBox(),b=await target.boundingBox();const cdp=await mobileContext.newCDPSession(mobile);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});for(let i=1;i<=18;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+a.width/2+(b.x+b.width/2-a.x-a.width/2)*i/18,y:a.y+a.height/2+(b.y+b.height/2-a.y-a.height/2)*i/18}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(450);assert.equal(await mobile.locator(`[data-drag="${id}"]`).evaluate(e=>e.closest('[data-drop]').dataset.drop),zone);await mobile.locator('[data-dnd-action=undo]').click();await mobile.locator(`[data-drag="${id}"]`).tap();await target.tap();assert.equal(await mobile.locator(`[data-drag="${id}"]`).evaluate(e=>e.closest('[data-drop]').dataset.drop),zone);}
 report.checks.push('Hotspot object labels match alternative buttons, fit within regions without clipped text at desktop/390px; wrong/correct/retry and completion gates preserved');report.checks.push('390px real touch drag plus select-and-place; all photographed text >=14px');assert.deepEqual(errors,[]);report.checks.push('Original 7:44 user video playback with audio, five topic-aligned markers, real fullscreen enter/exit with viewport-sized video and contain scaling on desktop/mobile, keyboard seek, mute and volume; timer starts after video, hotspot wrong/correct/retry, three-question checkpoint blank/wrong/correct/retry, no final LMS score mutation, and all ten case cards have loaded topic-specific illustrations');report.checks.push('Official transparent BPS CorpU logo loads without header overlap on desktop/mobile; no JavaScript page errors');console.log(JSON.stringify(report,null,2));
})().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(async()=>{fs.writeFileSync(path.join(out,'simple-experience-report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();server.close();});

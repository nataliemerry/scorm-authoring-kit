/* QA only: serve the two actual eXe Online exports on loopback, with a mock LMS. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../exelearning/pilot',process.argv.includes('--dev')?'dev-preview':'preview');
const out=path.resolve(__dirname,'../../exelearning/pilot/qa');fs.mkdirSync(out,{recursive:true});
const narrative=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../data/course_experiences.humanized.humanized.json'),'utf8'));
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,b)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
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
 await p.screenshot({path:path.join(out,n),animations:'disabled'});report.screenshots.push(n);
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
 const solution=cid==='C01'?{server:'now',backup:'now',room:'later',workshop:'later'}:(cid==='S01'?{unik:'layak',mutakhir:'layak',lengkap:'layak',ganda:'cacat',tutup:'cacat'}:{domain:'strong',deadline:'strong',url:'strong',logo:'weak',greeting:'weak'});
 for(const [id,z] of Object.entries(solution))await place(p,id,z,id===Object.keys(solution)[0]);
 await check(p);assert.equal(await p.locator('.dnd-status.is-error').count(),0);await check(p);
 if(cid==='C01'){
  for(let i=0;i<10;i++)await place(p,'token'+i,i<7?'server':'backup',true);
  await shot(p,cid+'-allocation.png');await check(p);await check(p);
  await check(p);assert.equal(await p.locator('.dnd-status.is-error').count(),1);
  await place(p,'token7','server');await place(p,'token8','server');await place(p,'stage','decision');await check(p);
 }else if(cid==='S01'){
  await place(p,'kuota','first');await place(p,'alokasi','second');await place(p,'tarik','third');await check(p);assert.equal(await p.locator('.dnd-status.is-error').count(),1);
  await place(p,'populasi','first');await check(p);
 }else{
  await place(p,'try','first');await place(p,'verify','second');await place(p,'report','third');await check(p);assert.equal(await p.locator('.dnd-status.is-error').count(),1);
  await place(p,'stop','first');await check(p);
 }
 assert.equal(await p.locator('.dnd-challenge').getAttribute('data-complete'),'true');await shot(p,cid+'-challenge-complete.png');
}

async function sourceCheck(p){
 const cfg=await p.locator('.lesson-config').evaluate(e=>JSON.parse(e.textContent));const count=await p.locator('.lesson-count').innerText();const index=Number(count.match(/Materi (\d)/)[1])-1,l=cfg.lessons[index];
 assert.equal(await p.locator('.lesson-sources li').count(),l.references.length);assert.equal(await p.locator('.lesson-body').count(),l.paragraph_sources.length);
 for(let i=0;i<l.references.length;i++){const a=p.locator('.lesson-sources li').nth(i).locator('a');assert.equal(await a.getAttribute('href'),l.references[i].url);assert.equal(await a.getAttribute('target'),'_blank');assert((await a.getAttribute('rel')).includes('noopener'));assert((await p.locator('.lesson-sources li').nth(i).innerText()).includes(l.references[i].section));}
 assert.equal(await p.locator('.lesson-citation').count(),l.paragraph_sources.flat().length);assert((await p.locator('.lesson-source-note').innerText()).includes('November 2026'));
}
async function learn(p,cid,timed=false,shots=true){
 const cfg=await p.locator('.lesson-config').evaluate(e=>JSON.parse(e.textContent));
 assert.equal(await p.locator('.sim-root').isVisible(),false);await p.locator('.lesson-open').click();
 for(let i=0;i<2;i++){await sourceCheck(p);await p.locator('[data-simple-example]').click();assert((await p.locator('#lesson-example').innerText()).includes('Contoh simulasi'));assert.equal(await p.locator('[data-simple-example]').getAttribute('aria-expanded'),'true');assert(await p.locator('#lesson-example').isVisible());if(shots)await shot(p,cid+'-simple-material-'+(i+1)+'.png');await p.locator('[data-lesson-action=next]').click();}
 await sourceCheck(p);await p.locator('.simple-check-button').click();assert((await p.locator('.simple-check-feedback').innerText()).includes('Pilih satu'));const corrVal=String(cfg.lessons[2].correct),wrgVal=String((cfg.lessons[2].correct+1)%3);await p.locator('input[name=lesson-answer][value="'+wrgVal+'"]').check();await p.locator('.simple-check-button').click();assert(await p.locator('.scene-free').isDisabled());await p.locator('input[name=lesson-answer][value="'+corrVal+'"]').check();await p.locator('.simple-check-button').click();assert(await p.locator('.scene-free').isEnabled());if(timed)await p.locator('#simple-timer').check();await p.locator('.scene-free').click();assert.equal(await p.getAttribute('body','data-scene-phase'),'1');assert.equal(await p.locator('.lesson-root').getAttribute('data-complete'),'true');
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
 await p.locator('[data-sp-action=continue]').click();assert(await p.locator('.dnd-challenge').isVisible());
}
async function dragWords(p,cid,shots){
 assert(await p.locator('.dt-root').isVisible());assert.equal(await p.locator('.dnd-challenge').isVisible(),false);
 const cfg=await p.locator('.dt-config').evaluate(e=>JSON.parse(e.textContent)),initialScore=await p.evaluate(()=>window.lms?.values['cmi.core.score.raw']||null);
 assert.equal(await p.locator('.dt-sentences > li').count(),3);assert.equal(await p.locator('.dt-bank [data-dt-card]').count(),4);
 await p.locator('[data-dt-action=check]').click();assert.equal(await p.locator('.dt-root').getAttribute('data-correct'),'0');assert.equal(await p.locator('.dt-sentences [data-state=empty]').count(),3);
 async function put(id,gap,drag=false){
  const source=p.locator(`[data-dt-card="${id}"]`),target=p.locator(`[data-dt-target="${gap}"]`);await target.scrollIntoViewIfNeeded();
  if(drag){const a=await source.boundingBox(),b=await target.boundingBox();if(shots){await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:20});await p.mouse.up();}else{const cdp=await p.context().newCDPSession(p);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});for(let i=1;i<=20;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+a.width/2+(b.x+b.width/2-a.x-a.width/2)*i/20,y:a.y+a.height/2+(b.y+b.height/2-a.y-a.height/2)*i/20}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}await p.waitForTimeout(450);}
  else if(shots){await source.focus();await source.press('Enter');await target.focus();await target.press('Enter');}
  else{await source.click();await target.click();}
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
  const good=(await p.locator('.simple-consequence').getAttribute('data-good'))==='true'?'1':'0';await p.locator('[data-simple-choice="'+good+'"]').click();assert.equal(await p.locator('.simple-consequence').getAttribute('data-good'),'true');
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
 browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1600,height:1100},reducedMotion:'reduce'});await context.addInitScript(mock);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(!process.argv.includes('--mobile-only')){
 for(const {cid,zero} of [{cid:'C01',zero:false},{cid:'C12',zero:true},{cid:'C12',zero:false},{cid:'S01',zero:false}]){
  await page.goto(base+'/'+cid+'/index.html');await page.locator('.scene-chrome').waitFor();await learn(page,cid);await lab(page,cid);await shot(page,cid+'-challenge-start.png');
  await page.locator('[data-scene-phase="2"]').click();assert.equal(await page.getAttribute('body','data-scene-phase'),'1');
  await check(page);assert.equal(await page.locator('.dnd-status.is-error').count(),1);
  const first=cid==='C01'?'server':(cid==='S01'?'unik':'domain'),zone=cid==='C01'?'later':(cid==='S01'?'cacat':'weak');await place(page,first,zone,true);await page.locator('[data-dnd-action=undo]').click();assert.equal(await page.locator(`[data-drag="${first}"]`).evaluate(e=>e.closest('[data-drop]').dataset.drop),'bank');await page.locator('[data-dnd-action=solution]').click();assert(await page.locator('.dnd-status').innerText().then(t=>t.includes('Jawaban yang tepat ditampilkan')));await page.locator('[data-dnd-action=reset]').click();assert.equal(await page.locator(`[data-drag="${first}"]`).evaluate(e=>e.closest('[data-drop]').dataset.drop),'bank');
  await complete(page,cid);await page.locator('.scene-next').click();await page.locator('.scene-next').click();assert.equal(await page.getAttribute('body','data-scene-phase'),'2');
  await answer(page,cid,0,!zero);
  if(cid==='C01'){await page.locator('.scene-next').click();assert.equal(await page.getAttribute('body','data-scene-phase'),'2');assert.equal(await page.evaluate(()=>window.lms.values['cmi.core.lesson_status']),'incomplete');assert.equal(await page.evaluate(()=>window.lms.calls.some(([k])=>k==='cmi.core.score.raw')),false);report.checks.push('One unanswered native quiz question blocks submission and keeps incomplete');}
  await page.locator('.FRMP-SlideshowNext').click();await answer(page,cid,1,cid==='C01'||cid==='S01');await page.locator('.scene-next').click();
  assert.equal(await page.locator('.scene-review-badge-ok').count(),zero?0:(cid==='C01'||cid==='S01')?2:1);
  if(zero)report.checks.push('Both wrong native answers produce raw 0 and passed under passScore=0 in a fresh attempt');
  assert.equal(await page.evaluate(()=>window.lms.values['cmi.core.score.raw']),zero?'0':(cid==='C01'||cid==='S01')?'100':'50');assert.equal(await page.evaluate(()=>window.lms.values['cmi.core.lesson_status']),'passed');
  report.checks.push(cid+(zero?' (both wrong)':'')+': verified primary-source citations on all three theory pages, simulated examples labeled, study-first prerequisite, example reveal, standard radio check, two-choice consequence, back preserves selection, clue-only word search, answers hidden until found/revealed and hidden again on retry, mouse/keyboard, forward selection and per-item hints, help/retry do not inflate found count, optional continue, Drag the Words mouse/touch/keyboard, empty/wrong/correct checks, replacement/undo/remove/reset, assisted solution never counts as independent, no LMS score changes, Sort the Paragraphs mouse/touch/button/keyboard reordering, Escape/undo restoration, correct positions/transitions, assisted reveal/reset, optional continue, simulation gate, real pointer drag, keyboard placement, undo, prerequisite gate, wrong-plan feedback, all stages complete, native LMS score; review matches participant choice, key and correct status');
 }
 await page.setViewportSize({width:1536,height:674});await page.goto(base+'/C01/index.html');await learn(page,'C01',false,false);
 for(let i=0;i<2;i++){await page.locator('[data-simple-choice="0"]').click();await page.locator('[data-simple-sim=next]').click();}
 await page.locator('.word-board').scrollIntoViewIfNeeded();const vertical=(await page.locator('.word-config').evaluate(e=>JSON.parse(e.textContent))).words.find(w=>w.cells[0][1]===w.cells[1][1]);for(const pos of [vertical.cells[0],vertical.cells.at(-1)])await page.locator('[data-word-cell="'+pos.join(',')+'"]').press('Enter');assert.equal(await page.locator('.word-root').getAttribute('data-found'),'1');
 assert(await page.evaluate(()=>document.querySelector('.word-board').clientHeight<=document.querySelector('.word-scroll').clientHeight));assert.equal(await page.locator('.page-content').evaluate(e=>e.scrollTop),0);await shot(page,'C01-word-search-short.png');report.checks.push('Short desktop: board fits scroll area, vertical word reachable, keyboard focus does not scroll outer page');await page.setViewportSize({width:1600,height:1100});
 await page.goto(base+'/C01/index.html');await page.clock.install();await learn(page,'C01',true,false);await page.clock.runFor(120000);assert.equal(await page.getAttribute('body','data-scene-phase'),'1');assert.equal(await page.evaluate(()=>window.lms.values['cmi.core.lesson_status']),'incomplete');assert.equal(await page.locator('.scene-clock small').innerText(),'WAKTU SELESAI');report.checks.push('120-second challenge keeps unfinished work and never submits unanswered quiz');
 }
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const mobile=await mobileContext.newPage();
 for(const cid of ['C01','C12','S01']){await mobile.goto(base+'/'+cid+'/index.html');await learn(mobile,cid,false,false);await shot(mobile,cid+'-simple-mobile.png');await lab(mobile,cid,false);await shot(mobile,cid+'-challenge-mobile.png');assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const id=cid==='C01'?'server':(cid==='S01'?'unik':'domain'),zone=cid==='C01'?'now':(cid==='S01'?'layak':'strong');const source=mobile.locator(`[data-drag="${id}"]`),target=mobile.locator(`[data-mobile-target="${zone}"]`);await source.scrollIntoViewIfNeeded();const a=await source.boundingBox(),b=await target.boundingBox();const cdp=await mobileContext.newCDPSession(mobile);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2}]});for(let i=1;i<=18;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+a.width/2+(b.x+b.width/2-a.x-a.width/2)*i/18,y:a.y+a.height/2+(b.y+b.height/2-a.y-a.height/2)*i/18}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(450);assert.equal(await mobile.locator(`[data-drag="${id}"]`).evaluate(e=>e.closest('[data-drop]').dataset.drop),zone);await mobile.locator('[data-dnd-action=undo]').click();await mobile.locator(`[data-drag="${id}"]`).click();await target.click();assert.equal(await mobile.locator(`[data-drag="${id}"]`).evaluate(e=>e.closest('[data-drop]').dataset.drop),zone);}
 report.checks.push('390px real touch drag plus select-and-place; all photographed text >=14px');assert.deepEqual(errors,[]);report.checks.push('Official transparent BPS CorpU logo loads without header overlap on desktop/mobile; no JavaScript page errors');console.log(JSON.stringify(report,null,2));
})().catch(e=>{report.failure=e.stack;console.error(e);process.exitCode=1;}).finally(async()=>{fs.writeFileSync(path.join(out,'simple-experience-report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();server.close();});

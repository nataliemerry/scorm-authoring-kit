/* Scene navigation and visual practice. eXe Form and Classify own assessment logic. */
(()=>{'use strict';
 if(!document.body.classList.contains('exe-export'))return;
 const marker=document.querySelector('[data-lcm-phase]');if(!marker)return;
 const cid=marker.dataset.course,art=document.querySelector('[data-scene-image]');
 if(art)document.body.style.setProperty('--scene-art',`url("${art.src}")`);
 const title=document.querySelector('.package-title')?.textContent||cid;
 const evidence=JSON.parse(document.querySelector('.scene-evidence')?.textContent||'[]');
 const articles=[...document.querySelectorAll('article.box')];let previous=0;
 articles.forEach(a=>{const m=a.querySelector('[data-lcm-phase]');if(m)previous=Number(m.dataset.lcmPhase);a.dataset.scenePanel=previous;if(a.querySelector('.clasifica-IDevice'))a.classList.add('scene-native-arena');if(a.querySelector('.scene-quiz-note'))a.classList.add('scene-quiz-preamble');if(a.querySelector('.exe-form-container'))a.classList.add('scene-quiz-engine');});
 let phase=0,timed=false,start=0,interval=null,submitted=false,arena=false,toastTimer=null;
 const found=new Set(),ends=[15,45,85,104,120],names=['Materi','Situasi & latihan','Kuis','Pembahasan','Hasil'];
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const brandLogo=document.querySelector('[data-brand-logo]');
 const chrome=document.createElement('div');chrome.className='scene-chrome';chrome.innerHTML=`<div class="scene-identity">${brandLogo?`<img class="scene-brand-logo" src="${safe(brandLogo.src)}" alt="Logo BPS CorpU" width="50" height="52">`:""}<div class="scene-identity-copy"><div class="scene-brand">BPS CORPORATE UNIVERSITY</div><div class="scene-course-title">${safe(title)}</div></div></div><div class="scene-chrome-right"><button type="button" class="scene-fullscreen" aria-label="Buka layar penuh">⛶</button></div>`;document.body.append(chrome);
 const bottom=document.createElement('div');bottom.className='scene-bottom';bottom.innerHTML=`<nav class="scene-progress" aria-label="Progres pengalaman">${names.map((n,i)=>`<button type="button" data-scene-phase="${i}" aria-label="${n}">${i+1}</button>`).join('')}<span class="scene-progress-label"></span></nav><span class="scene-next-note"></span><div class="scene-clock" hidden><span></span><small>SISA WAKTU</small></div><button type="button" class="scene-next"></button>`;document.body.append(bottom);
 const back=document.createElement('button');back.className='scene-arena-back';back.type='button';back.textContent=cid==='C01'?'← Kembali ke alokasi':(cid==='S01'?'← Kembali ke perancangan':'← Kembali ke email');back.hidden=true;document.body.append(back);
 function say(message){document.querySelector('.scene-announcement')?.remove();const box=document.createElement('div');box.className='scene-announcement';box.setAttribute('role','status');box.textContent=message;document.body.append(box);clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.remove(),5000);}
 function resizeForm(){requestAnimationFrame(()=>{if(window.$form?.instances)Object.values(window.$form.instances).forEach(data=>window.$form.resizeSlideShow(data));window.dispatchEvent(new Event('resize'));});}
 function answersCount(){return new Set([...document.querySelectorAll('.exe-form-container input[type=radio]:checked')].map(r=>r.name)).size;}
 function check(){if(!practiceDone()||answersCount()<2){submitted=false;return false;}document.querySelector('[id^="form-button-check-"]')?.click();submitted=true;return true;}
 function result(){const node=document.querySelector('.scene-final-score');if(!node)return;if(answersCount()<2){node.textContent='Masih ada pertanyaan yang belum dijawab.';return;}const native=document.querySelector('#eXeScoreNodeScore')?.textContent?.trim()||document.querySelector('[id^="form-score-"]')?.textContent?.trim();node.textContent=native||'Dua pertanyaan sudah dijawab.';}
  function review(){
   const container=document.querySelector('.scene-review-points');if(!container)return;
   let qDataList=[];
   const formNode=document.querySelector('.idevice_node.form[data-idevice-json-data]');
   if(formNode){try{const d=JSON.parse(formNode.getAttribute('data-idevice-json-data'));if(d&&Array.isArray(d.questionsData))qDataList=d.questionsData;}catch(e){}}
   if(!qDataList.length&&window.$form?.instances){const inst=Object.values(window.$form.instances)[0];if(inst?.questionsData)qDataList=inst.questionsData;}
   const slideNodes=document.querySelectorAll('.exe-form-container .FRMP-SlideshowSlide');
   const slides=slideNodes.length?slideNodes:document.querySelectorAll('.exe-form-container .FormView_question');
   const articles=container.querySelectorAll('article');
   articles.forEach((art,idx)=>{
     const slide=slides[idx],qData=qDataList[idx];
     let selectedText='',isCorrect=false,correctText='',explanation='';
     if(qData){
       const correctOpt=qData.answers.find(a=>a[0]===true);
       if(correctOpt)correctText=correctOpt[1];
       explanation=qData.feedbackRight||qData.feedbackWrong||'';
     }
     if(slide){
       const checked=slide.querySelector('input[type="radio"]:checked');
       if(checked){
         const radios=Array.from(slide.querySelectorAll('input[type="radio"]'));
         const checkedIdx=radios.indexOf(checked);
         if(qData&&qData.answers&&checkedIdx>=0&&checkedIdx<qData.answers.length){
           isCorrect=qData.answers[checkedIdx][0]===true;
           selectedText=qData.answers[checkedIdx][1];
         }else{
           const label=slide.querySelector(`label[for="${checked.id}"]`)||checked.closest('label');
           selectedText=label?label.textContent.trim():checked.value;
           isCorrect=(selectedText===correctText);
         }
       }
     }
     if(!explanation){
       const existingP=art.querySelector('.scene-review-explanation p')||art.querySelector('div > p');
       if(existingP)explanation=existingP.textContent.trim();
     }
     const h3=art.querySelector('h3');
     const questionTitle=h3?h3.textContent.trim():(qData?.baseText?.replace(/<[^>]+>/g,'')||('Pertanyaan '+(idx+1)));
     const numSpan=art.querySelector('.scene-review-num')||art.querySelector('span');
     const numText=numSpan?numSpan.textContent.trim():String(idx+1);

     const statusBadge=isCorrect
       ?'<span class="scene-review-badge scene-review-badge-ok">✓ Jawaban Anda Benar (Tepat)</span>'
       :'<span class="scene-review-badge scene-review-badge-ko">✗ Jawaban Anda Salah (Perlu ditinjau)</span>';

     const userBlock=selectedText
       ?`<div class="scene-review-block scene-review-user ${isCorrect?'is-correct':'is-wrong'}">${statusBadge}<p class="scene-review-ans"><strong>Pilihan Anda:</strong> ${safe(selectedText)}</p></div>`
       :`<div class="scene-review-block scene-review-user is-empty"><span class="scene-review-badge scene-review-badge-empty">Belum dijawab</span></div>`;

     const keyBlock=`<div class="scene-review-block scene-review-key"><p class="scene-review-ans"><strong>Kunci Jawaban Benar:</strong> ${safe(correctText||selectedText)}</p></div>`;
     const expBlock=`<div class="scene-review-block scene-review-explanation"><p class="scene-review-ans"><strong>Pembahasan:</strong> ${safe(explanation)}</p></div>`;

     art.className='scene-review-card';
     art.innerHTML=`<span class="scene-review-num">${safe(numText)}</span><div class="scene-review-body"><h3>${safe(questionTitle)}</h3>${userBlock}${keyBlock}${expBlock}</div>`;
   });
 }
 function show(next,focus=true){if(next!==phase){clearTimeout(toastTimer);document.querySelector(".scene-announcement")?.remove();}phase=next;arena=false;document.body.dataset.scenePhase=phase;
   articles.forEach(a=>{a.hidden=Number(a.dataset.scenePanel)!==phase||a.classList.contains('scene-native-arena');});back.hidden=true;
   bottom.querySelectorAll('button[data-scene-phase]').forEach((b,i)=>{b.disabled=false;b.setAttribute('aria-current',i===phase?'step':'false');});
   bottom.querySelector('.scene-progress-label').textContent=names[phase];
   const nextBtn=bottom.querySelector('.scene-next');nextBtn.hidden=phase===0||phase===4||(phase===1&&document.querySelector('.dnd-challenge')?.dataset.complete!=='true');nextBtn.disabled=false;
   nextBtn.textContent=phase===1?'Lanjut ke kuis →':phase===2?'Lihat pembahasan →':'Lihat hasil →';
   bottom.querySelector('.scene-next-note').textContent=timed?'Selesaikan sesuai urutan.':'';
   resizeForm();result();if(phase===3)review();
   if(focus){const heading=articles.find(a=>Number(a.dataset.scenePanel)===phase)?.querySelector('h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 }
 function practiceDone(){return document.querySelector('.lesson-root')?.dataset.complete==='true'&&document.querySelector('.sim-root')?.dataset.complete==='true'&&document.querySelector('.dnd-challenge')?.dataset.complete==='true';}
 function canMove(target){if(target>0&&document.querySelector('.lesson-root')?.dataset.complete!=='true'){say('Pelajari materi awal dan jawab cek pemahamannya terlebih dahulu.');return false;}if(target>1&&!practiceDone()){say('Selesaikan seluruh tahap tantangan terlebih dahulu.');return false;}if(target>2&&(!check())){say('Jawab kedua pertanyaan terlebih dahulu.');return false;}return true;}
 function clock(){const box=bottom.querySelector('.scene-clock'),span=box.querySelector('span'),small=box.querySelector('small');box.hidden=!timed;if(!timed)return;const left=Math.max(0,120-Math.floor((Date.now()-start)/1000));span.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');small.textContent='SISA WAKTU';if(left===0){clearInterval(interval);timed=false;small.textContent='WAKTU SELESAI';say('Waktu 2 menit sudah habis. Latihan tetap bisa dilanjutkan.');show(phase,false);}}
 document.addEventListener('lcm-lesson-finish',e=>{document.querySelector('.scene-announcement')?.remove();timed=Boolean(e.detail?.timed);clearInterval(interval);start=Date.now();show(1);clock();if(timed)interval=setInterval(clock,250);});
 document.addEventListener('lcm-simulation-finish',()=>show(1,false));
 bottom.querySelector('.scene-next').onclick=()=>{const next=Math.min(4,phase+1);if(canMove(next))show(next);};
 bottom.querySelector('nav').onclick=e=>{const b=e.target.closest('[data-scene-phase]');if(!b)return;const next=Number(b.dataset.scenePhase);if(canMove(next))show(next);};
 document.addEventListener('lcm-practice-complete',()=>{say('Latihan selesai. Berikutnya ada dua pertanyaan untuk memeriksa pemahaman Anda.');show(1,false);});
 chrome.querySelector('.scene-fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>say('Gunakan tombol layar penuh pada browser Anda.'));};
 document.querySelector('[data-scene-action="restart"]')?.addEventListener('click',()=>window.location.reload());
 show(0,false);
})();

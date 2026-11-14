/* Native eXe theme extension. All practice and quiz logic belongs to eXe iDevices. */
(()=>{'use strict';
 if(!document.body.classList.contains('exe-export'))return;
 const marker=document.querySelector('[data-lcm-phase]');if(!marker)return;
 const titles=['Pahami','Selidiki','Putuskan','Refleksi','Selesai'],ends=[15,45,85,104,120];
 let phase=0,start=0,interval=null,timed=false,submitted=false;
 const articles=[...document.querySelectorAll('article.box')];let section=0;
 articles.forEach(a=>{const m=a.querySelector('[data-lcm-phase]');if(m)section=Number(m.dataset.lcmPhase);a.dataset.lcmPanel=section;});
 const nav=document.createElement('nav');nav.className='lcm-steps';nav.setAttribute('aria-label','Bagian misi');
 nav.innerHTML=titles.map((t,i)=>`<button type="button" data-phase="${i}"><span>${i+1}</span>${t}</button>`).join('');
 const header=document.querySelector('.main-header');header?.after(nav);
 const footer=document.createElement('div');footer.className='lcm-actions';footer.innerHTML='<p class="lcm-progress-note">Pelajari dengan ritme Anda sendiri.</p><button class="lcm-next" type="button">Lanjutkan →</button>';
 document.querySelector('.page-content')?.after(footer);
 function check(){
   const answered=new Set([...document.querySelectorAll('.exe-form-container input[type="radio"]:checked')].map(r=>r.name)).size;
   if(answered<2){submitted=false;return false;}
   document.querySelector('[id^="form-button-check-"]')?.click();submitted=true;return true;
 }
 function show(next){phase=next;document.body.dataset.lcmCurrent=phase;articles.forEach(a=>{a.hidden=Number(a.dataset.lcmPanel)!==phase;});nav.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-current',i===phase?'step':'false');b.disabled=timed;});
   if(phase===4&&document.querySelectorAll('.exe-form-container input[type="radio"]:checked').length<2){const h=document.querySelector('.lcm-ending h2');if(h)h.textContent='Masih ada keputusan yang terlewat.';}
   const n=footer.querySelector('.lcm-next');n.disabled=timed;n.hidden=phase===4;n.textContent=phase===2?'Periksa dan lihat refleksi →':'Lanjutkan →';
   footer.querySelector('p').textContent=timed?'Bagian akan berpindah otomatis.':'Pelajari dengan ritme Anda sendiri.';
   const title=articles.find(a=>Number(a.dataset.lcmPanel)===phase)?.querySelector('h1,h2');if(title){title.tabIndex=-1;title.focus({preventScroll:true});}
   window.dispatchEvent(new Event('resize'));
   requestAnimationFrame(()=>{if(window.$form?.instances)Object.values(window.$form.instances).forEach(data=>window.$form.resizeSlideShow(data));});
 }
 nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||timed)return;const target=Number(b.dataset.phase);if(phase===2&&target>2&&!submitted)check();show(target);});
 footer.querySelector('.lcm-next').onclick=()=>{if(timed)return;if(phase===2)check();show(Math.min(4,phase+1));};
 function stop(){timed=false;clearInterval(interval);document.querySelector('.lcm-timer')?.remove();show(phase);}
 function tick(){const elapsed=(Date.now()-start)/1000,remain=Math.max(0,120-Math.floor(elapsed));const time=document.querySelector('.lcm-timer time');if(time)time.textContent=String(Math.floor(remain/60)).padStart(2,'0')+':'+String(remain%60).padStart(2,'0');
   let target=ends.findIndex(t=>elapsed<t);if(target<0)target=4;
   if(phase===2&&elapsed>=65&&elapsed<85){const s=document.querySelector('.FRMP-SlideNumber');if(s&&s.textContent.trim().startsWith('1/'))document.querySelector('.FRMP-SlideshowNext')?.click();}
   if(target!==phase){if(target>=4&&!submitted)check();show(target);}
   if(elapsed>=120){clearInterval(interval);if(time)time.textContent='02:00 · Selesai';}
 }
 document.querySelector('.lcm-start')?.addEventListener('click',()=>{start=Date.now();timed=true;submitted=false;clearInterval(interval);document.querySelector('.lcm-timer')?.remove();const timer=document.createElement('div');timer.className='lcm-timer';timer.setAttribute('aria-label','Waktu misi');timer.innerHTML='<span>Misi 120 detik</span><time>02:00</time><button type="button">Mode mandiri</button>';timer.querySelector('button').onclick=stop;document.body.append(timer);show(0);interval=setInterval(tick,250);});
 show(0);
})();

/*!
 * eXeLearning v4+ Style Script File
 * -----------------------
 * Author: Ignacio Gros for eXeLearning
 * Project: exelearning.net
 *
 * This JavaScript file is part of a style for eXeLearning.
 * Licensed under Creative Commons Attribution-ShareAlike (CC BY-SA).
 *
 * Note: The style's config.xml contains additional information
 *       about materials (images) created by third parties
 *       and included in this style.
 */

var myTheme = {
    init: function () {
        // Common functions
        if (this.inIframe()) $('body').addClass('in-iframe');
        if (!$('body').hasClass('exe-web-site')) return;
        // Add menu and search bar togglers
        var togglers =
            '\
            <button type="button" id="siteNavToggler" class="toggler" aria-expanded="true" aria-controls="siteNav" title="' +
            $exe_i18n.menu +
            '">\
                <span class="sr-av">' +
            $exe_i18n.menu +
            '</span>\
            </button>\
        ';
        // The search box is optional: only add its toggler when it exists
        if ($('#exe-client-search').length) {
            togglers +=
                '\
                <button type="button" id="searchBarToggler" class="toggler" aria-expanded="false" aria-controls="exe-client-search" title="' +
                $exe_i18n.search +
                '">\
                    <span class="sr-av">' +
                $exe_i18n.search +
                '</span>\
                </button>\
            ';
        }
        $('#siteNav').before(togglers);
        // Check the current NAV status
        if (new URLSearchParams(window.location.search).get('nav') === 'false') {
            $('body').addClass('siteNav-off');
            myTheme.navExpanded(false);
            myTheme.params('add');
        }
        // Menu toggler
        $('#siteNavToggler').on('click', function () {
            if (myTheme.isLowRes()) {
                $('#exe-client-search').hide();
                $('#searchBarToggler').attr('aria-expanded', 'false');
                if ($('body').hasClass('siteNav-off')) {
                    $('body').removeClass('siteNav-off');
                } else {
                    if ($('#siteNav').isInViewport()) {
                        $('body').addClass('siteNav-off');
                        myTheme.params('add');
                    }
                }
                window.scroll(0, 0);
            } else {
                $('body').toggleClass('siteNav-off');
                myTheme.params(
                    $('body').hasClass('siteNav-off') ? 'add' : 'remove'
                );
            }
            myTheme.navExpanded(!$('body').hasClass('siteNav-off'));
        });
        // Search bar toggler
        $('#searchBarToggler').on('click', function () {
            var bar = $('#exe-client-search');
            if (bar.is(':visible')) {
                bar.hide();
            } else {
                if (myTheme.isLowRes()) {
                    $('body').addClass('siteNav-off');
                    myTheme.navExpanded(false);
                }
                bar.show();
                $('#exe-client-search-text').focus();
                window.scroll(0, 0);
            }
            $(this).attr('aria-expanded', bar.is(':visible'));
        });
        if (!this.inIframe()) {
            // Fixed navigation
            $('#siteNav').wrap('<div id="sidebar-nav"></div>');
            myTheme.checkNav();
            $(window).bind('resize', function () {
                myTheme.checkNav();
            });
        }
        // Search form
        this.searchForm();
    },
    inIframe: function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },
    searchForm: function () {
        $('#exe-client-search-text').attr('class', 'form-control');
    },
    isLowRes: function () {
        return $('#siteNav').css('float') == 'none';
    },
    checkNav: function () {
        var wrapper = $('#sidebar-nav');
        var navH = $('#siteNav > ul').height(); // Menu height
        navH = navH + 50;
        if (navH < $(window).height()) wrapper.addClass('fixed');
        else wrapper.removeClass('fixed');
    },
    navExpanded: function (visible) {
        $('#siteNavToggler').attr('aria-expanded', visible ? 'true' : 'false');
        $('#siteNav').prop('inert', !visible);
    },
    // Toggle nav=false keeping the rest of the URL using a common function.
    params: function (act) {
        var value = act == 'add' ? 'false' : null;
        $('.nav-buttons a').each(function () {
            this.setAttribute(
                'href',
                $exeExport.setUrlParam(this.getAttribute('href'), 'nav', value)
            );
        });
    },
};
$(function () {
    myTheme.init();
});
$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
};

window.addEventListener("DOMContentLoaded",function(){/* Scene navigation and visual practice. eXe Form and Classify own assessment logic. */
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
 const back=document.createElement('button');back.className='scene-arena-back';back.type='button';back.textContent=cid==='C01'?'← Kembali ke alokasi':'← Kembali ke email';back.hidden=true;document.body.append(back);
 function say(message){document.querySelector('.scene-announcement')?.remove();const box=document.createElement('div');box.className='scene-announcement';box.setAttribute('role','status');box.textContent=message;document.body.append(box);clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.remove(),5000);}
 function resizeForm(){requestAnimationFrame(()=>{if(window.$form?.instances)Object.values(window.$form.instances).forEach(data=>window.$form.resizeSlideShow(data));window.dispatchEvent(new Event('resize'));});}
 function answersCount(){return new Set([...document.querySelectorAll('.exe-form-container input[type=radio]:checked')].map(r=>r.name)).size;}
 function check(){if(!practiceDone()||answersCount()<2){submitted=false;return false;}document.querySelector('[id^="form-button-check-"]')?.click();submitted=true;return true;}
 function result(){const node=document.querySelector('.scene-final-score');if(!node)return;if(answersCount()<2){node.textContent='Masih ada pertanyaan yang belum dijawab.';return;}const native=document.querySelector('#eXeScoreNodeScore')?.textContent?.trim()||document.querySelector('[id^="form-score-"]')?.textContent?.trim();node.textContent=native||'Dua pertanyaan sudah dijawab.';}
 function show(next,focus=true){phase=next;arena=false;document.body.dataset.scenePhase=phase;
   articles.forEach(a=>{a.hidden=Number(a.dataset.scenePanel)!==phase||a.classList.contains('scene-native-arena');});back.hidden=true;
   bottom.querySelectorAll('button[data-scene-phase]').forEach((b,i)=>{b.disabled=false;b.setAttribute('aria-current',i===phase?'step':'false');});
   bottom.querySelector('.scene-progress-label').textContent=names[phase];
   const nextBtn=bottom.querySelector('.scene-next');nextBtn.hidden=phase===0||phase===4||(phase===1&&document.querySelector('.dnd-challenge')?.dataset.complete!=='true');nextBtn.disabled=false;
   nextBtn.textContent=phase===1?'Lanjut ke kuis →':phase===2?'Lihat pembahasan →':'Lihat hasil →';
   bottom.querySelector('.scene-next-note').textContent=timed?'Selesaikan sesuai urutan.':'';
   resizeForm();result();
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
/* Case practice inside an eXe Text iDevice. Native Form owns LMS grading. */
(()=>{'use strict';
 const root=document.querySelector('.dnd-challenge'),data=document.querySelector('.dnd-config');if(!root||!data||!document.body.classList.contains('exe-export'))return;
 const cfg=JSON.parse(data.textContent),view=root.querySelector('.dnd-workspace'),status=root.querySelector('.dnd-status');
 const art=Object.fromEntries([...document.querySelectorAll('[data-dnd-art]')].map(i=>[i.dataset.dndArt,i.src]));
 const mobileTargets=document.createElement('div');mobileTargets.className='dnd-mobile-targets';root.insertBefore(mobileTargets,status);
 root.style.setProperty('--challenge-art',`url("${art[cfg.course==='C01'?'scenes/C01-server.webp':'scenes/C12-mail.webp']}")`);
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let scrollFrame=null;
 let step=0,positions={},selected=null,validated=false,history=[],initial={},drag=null,ignoreClick=0;
 const tokens=Array.from({length:10},(_,i)=>({id:'token'+i,label:'10 unit',detail:'Token '+(i+1),type:'token'}));
 function current(){return cfg.steps[step];}
 function items(){return ['budget','revision'].includes(current().kind)?[...tokens,...(current().items||[]).map(i=>({...i,type:'choice'}))]:current().items;}
 function zones(){return ['budget','revision'].includes(current().kind)?[{id:'server',label:'Pemulihan server',hint:'Kebutuhan '+current().server+' unit',accept:'token',image:'scenes/C01-server.webp'},{id:'backup',label:'Cadangan data',hint:'Kebutuhan '+current().backup+' unit',accept:'token'},...(current().kind==='revision'?[{id:'decision',label:'Meja persetujuan',hint:'Seret satu keputusan ke sini',accept:'choice',single:true}]:[])]:current().zones.map(z=>({...z,single:current().kind==='sequence'}));}
 function say(text,bad=false){status.textContent=text;status.classList.toggle('is-error',bad);}
 function amount(zone){return tokens.filter(i=>positions[i.id]===zone).length*10;}
 function card(i){return `<button type="button" class="dnd-card ${i.type==='token'?'dnd-token':''}" data-drag="${safe(i.id)}" aria-pressed="${selected===i.id}" aria-label="${safe(i.label+(i.detail?' · '+i.detail:''))}">${i.image?`<img src="${safe(art[i.image])}" alt="" draggable="false">`:''}<span class="dnd-card-label">${safe(i.label)}</span>${i.type!=='token'&&i.detail?`<span class="dnd-card-detail">${safe(i.detail)}</span>`:''}<span class="dnd-grip" aria-hidden="true">⠿</span></button>`;}
 function cardsIn(zone){return items().filter(i=>(positions[i.id]||'bank')===zone).map(card).join('');}
 function render(){
  const s=current(),isBudget=['budget','revision'].includes(s.kind);root.dataset.step=String(step);root.dataset.kind=s.kind;
  view.innerHTML=`<header class="dnd-heading"><div class="dnd-stage-label">${cfg.course==='C01'?'MEJA ANGGARAN':'STATISTIK SEKTORAL'} · TAHAP ${step+1} DARI ${cfg.steps.length}</div><h2>${safe(s.title)}</h2><p>${safe(s.kind==='budget'?'Setiap token bernilai 10 unit. Bagikan ke perbaikan server dan cadangan data.':s.kind==='revision'?'Server kini perlu 90 unit, cadangan tahap awal 10 unit. Anggaran tetap 100.':s.kind==='sequence'?'Susun alur pengajuan rekomendasi kegiatan statistik.':cfg.course==='C01'?'Tentukan usulan yang perlu didanai sekarang dan yang masih bisa ditunda.':'Kelompokkan usulan yang merupakan statistik sektoral wajib rekomendasi.')}</p><ol class="dnd-steps" aria-label="Tahap tantangan">${cfg.steps.map((_,i)=>`<li ${i===step?'aria-current="step"':''}>${i<step?'✓':i+1}</li>`).join('')}</ol></header>
  <details class="dnd-guide"><summary>Petunjuk & rincian kasus</summary><p>${safe(s.intro)}</p><p class="dnd-help">Seret objek ke tempat tujuan. Bisa juga pilih objek, lalu ketuk nama tempat tujuan. Keyboard: Enter untuk memilih, Tab ke tujuan, lalu Enter.</p></details>
  <div class="dnd-board"><section class="dnd-bank dnd-zone" data-drop="bank"><button type="button" class="dnd-drop-title" data-drop-target="bank">${isBudget?'Sisa token & pilihan keputusan':'Berkas yang belum ditempatkan'} <span>${isBudget?100-amount('server')-amount('backup')+' unit tersisa':''}</span></button><div class="dnd-items">${cardsIn('bank')||'<span class="dnd-empty">Semua objek sudah ditempatkan.</span>'}</div></section>
  <div class="dnd-destinations">${zones().map(z=>`<section class="dnd-zone" data-drop="${z.id}" ${z.accept?`data-accept="${z.accept}"`:''}><button type="button" class="dnd-drop-title" data-drop-target="${z.id}">${z.image?`<img src="${safe(art[z.image])}" alt="" draggable="false">`:''}<span><strong>${safe(z.label)}</strong><small>${safe(z.hint)}</small></span>${isBudget&&z.accept==='token'?`<b class="dnd-amount">${amount(z.id)} <small>unit</small></b>`:''}</button><div class="dnd-items">${cardsIn(z.id)||'<span class="dnd-empty">Letakkan di sini</span>'}</div></section>`).join('')}</div></div>
  <footer class="dnd-controls"><button type="button" data-dnd-action="undo" ${!history.length?'disabled':''}>↶ Urungkan</button><button type="button" data-dnd-action="reset">Atur ulang tahap ini</button>${step?'<button type="button" data-dnd-action="back">← Tahap sebelumnya</button>':''}<button type="button" class="dnd-check" data-dnd-action="check">${validated?(step===cfg.steps.length-1?'Tantangan selesai ✓':'Lanjut ke tahap berikutnya →'):'Periksa rencana saya'}</button></footer>`;
  mobileTargets.innerHTML=zones().map(z=>`<button type="button" class="dnd-mobile-drop" data-mobile-target="${z.id}" data-drop="${z.id}">${safe(z.label)}${z.accept==='token'?' · '+amount(z.id)+' unit':''}</button>`).join('');
 }
 function invalidate(){validated=false;root.dataset.complete='false';root.classList.remove('dnd-completed');}
 function move(id,target){
  const item=items().find(i=>i.id===id),zone=zones().find(z=>z.id===target);if(!item||(!zone&&target!=='bank'))return;
  if(zone?.accept&&zone.accept!==item.type){say(zone.accept==='token'?'Tempat ini hanya menerima token anggaran.':'Tempat ini menerima kartu keputusan, bukan token.',true);return;}
  if((positions[id]||'bank')===target){selected=null;render();return;}
  history.push({...positions});if(zone?.single)items().filter(i=>positions[i.id]===target).forEach(i=>positions[i.id]='bank');positions[id]=target;selected=null;invalidate();render();say(item.label+' dipindahkan ke '+(zone?.label||'tempat asal')+'.');
 }
 function enter(next){step=next;selected=null;history=[];invalidate();if(current().kind==='budget')positions=Object.fromEntries(tokens.map(i=>[i.id,'bank']));else if(current().kind==='revision')positions={...positions,...Object.fromEntries(current().items.map(i=>[i.id,'bank']))};else positions=Object.fromEntries(current().items.map(i=>[i.id,'bank']));initial={...positions};render();say('Tahap '+(step+1)+' siap. Susun rencana Anda.');}
 function validate(){
  const s=current();let message='';
  if(s.kind==='sort'||s.kind==='sequence'){
   const missing=s.items.filter(i=>s.solution[i.id]!=='bank'&&(positions[i.id]||'bank')==='bank');
   if(missing.length)message='Masih ada '+missing.length+' berkas yang perlu ditempatkan.';
   else {const wrong=s.items.filter(i=>(positions[i.id]||'bank')!==s.solution[i.id]);if(wrong.length){
    if(cfg.course==='C01')message='Server yang berhenti menahan pengumpulan data, dan cadangan terakhir tidak bisa dipulihkan. Kedua kebutuhan ini lebih mendesak daripada penataan ruangan atau lokakarya tambahan.';
    else if(s.kind==='sort')message='Survei komoditas daerah, sarana sekolah, dan retribusi pasar merupakan statistik sektoral instansi. Sensus penduduk adalah statistik dasar BPS, dan riset komersial swasta adalah statistik khusus.';
    else message='Urutkan langkah secara terkoordinasi: mulai dengan koordinasi dan cek duplikasi, ajukan melalui ROMANTIK, lalu tindak lanjuti catatan telaah BPS hingga rekomendasi terbit.';
    wrong.forEach(i=>view.querySelector(`[data-drag="${i.id}"]`)?.classList.add('dnd-wrong'));
   }}
  }else{
   if(amount('server')<s.server)message='Server baru mendapat '+amount('server')+' unit. Kebutuhannya '+s.server+' unit; layanan belum bisa dipulihkan.';
   else if(amount('backup')<s.backup)message='Cadangan baru mendapat '+amount('backup')+' unit. Sisihkan '+s.backup+' unit agar perlindungan data dapat dimulai.';
   else if(s.kind==='revision'&&positions.stage!=='decision')message='Dana tambahan belum disetujui. Cadangan dapat dikerjakan bertahap, sedangkan pemulihan server tetap diperlukan agar pengumpulan data berjalan lagi.';
  }
  if(message){say(message+' Geser kartu atau tokennya, lalu periksa kembali.',true);return;}
  validated=true;render();
  if(step===cfg.steps.length-1){root.dataset.complete='true';root.classList.add('dnd-completed');say(cfg.course==='C01'?'Alokasi akhir: server 90 unit dan cadangan tahap awal 10 unit. Totalnya tetap 100 unit.':'Urutannya sudah sesuai: koordinasi dan cek duplikasi, pengajuan via ROMANTIK, dan tindak lanjut perbaikan hingga rekomendasi resmi terbit.');document.dispatchEvent(new CustomEvent('lcm-practice-complete'));}
  else say(s.kind==='budget'?'Server mendapat 70 unit dan cadangan 30 unit. Pada tahap berikutnya ada perubahan biaya yang perlu ditangani.':'Kartu sudah berada pada kategori yang sesuai. Lanjutkan ke tahap berikutnya.');
 }
 root.addEventListener('click',e=>{if(Date.now()<ignoreClick)return;const card=e.target.closest('[data-drag]'),target=e.target.closest('[data-drop-target],[data-mobile-target]'),action=e.target.closest('[data-dnd-action]');
  if(card){selected=selected===card.dataset.drag?null:card.dataset.drag;view.querySelectorAll('[data-drag]').forEach(c=>c.setAttribute('aria-pressed',c.dataset.drag===selected?'true':'false'));say(selected?'Objek dipilih. Pilih nama tempat tujuannya.':'Pilihan dibatalkan.');}
  else if(target){if(selected)move(selected,target.dataset.dropTarget||target.dataset.mobileTarget);else say('Pilih objek terlebih dahulu, atau seret langsung ke tempat ini.');}
  else if(action){switch(action.dataset.dndAction){case'undo':if(history.length){positions=history.pop();selected=null;invalidate();render();say('Pemindahan terakhir dibatalkan.');}break;case'reset':history.push({...positions});positions={...initial};selected=null;invalidate();render();say('Tahap ini diatur ulang.');break;case'back':enter(step-1);break;case'check':if(validated){if(step<cfg.steps.length-1)enter(step+1);}else validate();break;}}
 });
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;render();say('Pilihan dibatalkan.');}});
 root.addEventListener('pointerdown',e=>{const c=e.target.closest('[data-drag]');if(!c||e.button!==0)return;drag={id:c.dataset.drag,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,source:c,pointer:e.pointerId,ghost:null};c.setPointerCapture(e.pointerId);});
 root.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;drag.x=e.clientX;drag.y=e.clientY;if(!drag.ghost&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>7){drag.ghost=drag.source.cloneNode(true);drag.ghost.removeAttribute('data-drag');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.classList.add('dnd-ghost');const r=drag.source.getBoundingClientRect();drag.ghost.style.width=Math.min(r.width,280)+'px';document.body.append(drag.ghost);autoScroll();drag.source.classList.add('dnd-dragging');}
  if(drag.ghost){e.preventDefault();drag.ghost.style.left=Math.min(e.clientX+14,innerWidth-drag.ghost.offsetWidth-8)+'px';drag.ghost.style.top=e.clientY-20+'px';view.querySelectorAll('.dnd-hover').forEach(z=>z.classList.remove('dnd-hover'));document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]')?.classList.add('dnd-hover');const panel=root.closest('.box-content');const r=root.getBoundingClientRect();const scroller=root.querySelector('.dnd-workspace');if(e.clientY>innerHeight-180)scroller.scrollTop+=12;else if(e.clientY<150)scroller.scrollTop-=12;}
 });
 function autoScroll(){if(!drag?.ghost)return;const r=view.getBoundingClientRect();if(drag.y>r.bottom-45&&drag.y<r.bottom)view.scrollTop+=12;else if(drag.y<r.top+45&&drag.y>r.top)view.scrollTop-=12;scrollFrame=requestAnimationFrame(autoScroll);}
 function finish(e,cancel=false){if(!drag)return;const active=drag;drag=null;cancelAnimationFrame(scrollFrame);active.source.classList.remove('dnd-dragging');view.querySelectorAll('.dnd-hover').forEach(z=>z.classList.remove('dnd-hover'));if(active.source.hasPointerCapture(e.pointerId))active.source.releasePointerCapture(e.pointerId);if(active.ghost){active.ghost.remove();ignoreClick=Date.now()+400;if(!cancel){const zone=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]');if(zone&&root.contains(zone))move(active.id,zone.dataset.drop);else say('Belum ada tempat tujuan. Objek dikembalikan ke posisi semula.');}}}
 root.addEventListener('pointerup',e=>finish(e));root.addEventListener('pointercancel',e=>finish(e,true));
 enter(0);
})();
/* Simple lesson cards and choose-and-see situations in native eXe Text. */
(()=>{'use strict';
 if(!document.body.classList.contains('exe-export'))return;
 const lesson=document.querySelector('.lesson-root'),config=document.querySelector('.lesson-config'),sim=document.querySelector('.sim-root');if(!lesson||!config||!sim)return;
 const cfg=JSON.parse(config.textContent),cid=sim.dataset.course,content=lesson.querySelector('.lesson-content'),view=sim.querySelector('.sim-content');
 const art=Object.fromEntries([...document.querySelectorAll('[data-dnd-art]')].map(i=>[i.dataset.dndArt,i.src]));
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let page=0,situation=0;const seen=new Set(),examples=new Set(),answers=[null,null],studyAnswers=[null,null,null],checked=new Set();
 const cases=cid==='C01'?[
  {title:'Server berhenti saat laporan masih harus masuk.',body:'Perbaikan diperkirakan memerlukan tiga hari. Sementara itu, tim masih menerima data yang perlu segera ditangani.',image:'scenes/C01-server.webp',prompt:'Apa yang Anda lakukan sementara?',options:[
   {label:'Gunakan prosedur sementara yang disetujui, lalu periksa datanya',good:true,title:'Data prioritas masih dapat ditangani.',body:'Pekerjaan sementara menambah pencatatan bagi tim. Data tetap perlu diperiksa, lalu dicocokkan kembali setelah server pulih.'},
   {label:'Tunggu perbaikan selesai tanpa menyiapkan penanganan sementara',good:false,title:'Antrean menunggu server pulih.',body:'Selama perbaikan, data yang menunggu akan bertambah. Jika tersedia prosedur sementara yang disetujui, tim bisa menggunakannya dengan tetap memeriksa data.'}]},
  {title:'Serapan dan kemajuan pekerjaan tidak sejalan.',body:'Laporan menunjukkan serapan anggaran 90%, tetapi keluaran pekerjaan baru 55%.',image:'scenes/C01-server.webp',prompt:'Apa yang perlu dibahas lebih dahulu?',options:[
   {label:'Tambahkan belanja agar serapannya semakin tinggi',good:false,title:'Penyebab keterlambatan belum diketahui.',body:'Serapan yang lebih tinggi belum menjelaskan pekerjaan yang tertahan. Periksa hambatannya dahulu agar kebutuhan belanja berikutnya dapat dinilai.'},
   {label:'Telusuri pekerjaan yang tertahan dan rencana penyelesaiannya',good:true,title:'Ada dasar untuk menentukan tindak lanjut.',body:'Bagian pekerjaan yang tertahan menjadi jelas. Tim dapat membahas penyebabnya dan menentukan siapa yang perlu menindaklanjuti, sambil memeriksa penggunaan anggarannya.'}]}
 ]:[
  {title:'Survei Mendadak Menjelang Akhir Tahun Anggaran',body:'Pimpinan meminta tim Anda segera menyelenggarakan survei kepuasan layanan publik dalam waktu dua minggu agar serapan anggaran optimal. Namun, rancangan kuesioner belum dikonsultasikan dengan Walidata dan belum diajukan ke aplikasi ROMANTIK.',image:'scenes/C12-mail.webp',prompt:'Bagaimana langkah keputusan yang Anda ambil?',options:[
   {label:'Koordinasikan dengan Walidata dan ajukan permohonan ke ROMANTIK',good:true,title:'Rancangan ditelaah secara metodologis.',body:'Koordinasi memastikan kuesioner terstandar, tidak terjadi duplikasi kegiatan dengan instansi lain, serta terbit surat rekomendasi resmi BPS.'},
   {label:'Cetak kuesioner dan segera lakukan pencacahan di lapangan',good:false,title:'Pengumpulan data mengabaikan prosedur rekomendasi.',body:'Pelaksanaan tanpa rekomendasi berisiko menghasilkan data yang bias, duplikatif, dan tidak dapat diintegrasikan ke portal Satu Data Indonesia.'}]},
  {title:'Publikasi Data Indikator Tanpa Dokumen Metadata',body:'Data hasil kompilasi administrasi sektoral telah siap disajikan ke publik. Bagian hubungan masyarakat mengusulkan agar tabel angka langsung diunggah ke website tanpa perlu menyusun dokumen metadata indikator karena dianggap merepotkan.',image:'scenes/C12-lock.webp',prompt:'Bagaimana tindakan Anda dalam situasi ini?',options:[
   {label:'Susun metadata statistik sebelum data dipublikasikan',good:true,title:'Data terdokumentasi dan transparan bagi pengguna.',body:'Metadata memuat konsep, definisi, dan metodologi sehingga data dapat dipahami dan dipertanggungjawabkan lintas instansi pemerintah.'},
   {label:'Unggah tabel angka langsung tanpa dokumen metadata',good:false,title:'Angka rilis tanpa kejelasan konsep dan definisi.',body:'Pengguna data tidak mengetahui cakupan variabel dan batasannya, sehingga berpotensi menimbulkan salah interpretasi kebijakan.'}]}
 ];
 function imageFor(index){return cid==='C01'?(index===2?'scenes/C01-meeting.webp':'scenes/C01-server.webp'):(index===2?'scenes/C12-lock.webp':'scenes/C12-mail.webp');}
 function focusHeading(container){const h=container.querySelector('h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
 function theory(l){return l.body.split(/\n\n/).map((paragraph,i)=>`<p class="lesson-body">${safe(paragraph)} ${(l.paragraph_sources[i]||[]).map(n=>`<a class="lesson-citation" href="${safe(l.references[n-1].url)}" target="_blank" rel="noopener noreferrer" aria-label="Sumber ${n}: ${safe(l.references[n-1].publisher)}">[${n}]</a>`).join(' ')}</p>`).join('');}
 function sources(l){return `<aside class="lesson-sources" aria-label="Sumber materi"><h3>Sumber materi</h3><ol>${l.references.map(r=>`<li><a href="${safe(r.url)}" target="_blank" rel="noopener noreferrer">${safe(r.publisher)} · ${safe(r.title)} (${safe(r.year)})</a><p>${safe(r.section)}</p></li>`).join('')}</ol><p class="lesson-source-note">Diparafrasakan dalam bahasa Indonesia. Sumber diperiksa pada ${cid==='C01'?'13 November 2026':'14 November 2026'}.</p></aside>`;}
 function study(){const l=cfg.lessons[page];seen.add(page);const correct=checked.has(page)&&studyAnswers[page]===l.correct;
  const check=l.mode==='check'?`<form class="simple-check"><fieldset><legend>${safe(l.prompt)}</legend><p>Pilih satu jawaban, lalu tekan <strong>Periksa jawaban</strong>.</p>${l.options.map((o,i)=>`<label><input type="radio" name="lesson-answer" value="${i}" ${studyAnswers[page]===i?'checked':''}><span>${safe(o)}</span></label>`).join('')}</fieldset><button type="submit" class="simple-check-button">Periksa jawaban</button></form><div class="simple-check-feedback" role="status" ${!checked.has(page)?'hidden':''}>${checked.has(page)?safe(correct?l.feedback:'Jawaban ini belum sesuai dengan kasus. Coba pilihan lain.'):''}</div>`:'';
  content.innerHTML=`<div class="simple-lesson-layout"><div class="simple-lesson-art"><img src="${safe(art[imageFor(page)])}" alt=""></div><article class="simple-lesson-copy"><h2>${safe(l.title)}</h2>${theory(l)}${sources(l)}<button type="button" class="simple-example-button" aria-expanded="${examples.has(page)}" aria-controls="lesson-example" data-simple-example>${examples.has(page)?'Tutup contoh':'Lihat contoh'}</button><div id="lesson-example" class="simple-example" ${examples.has(page)?'':'hidden'}><strong>Contoh simulasi</strong><p>${safe(l.example)}</p><p class="lesson-example-note">${safe(l.example_note)}</p></div>${check}</article></div>`;
  lesson.querySelector('.lesson-count').textContent='Materi '+(page+1)+' dari '+cfg.lessons.length;lesson.querySelector('[data-lesson-action=prev]').disabled=page===0;lesson.querySelector('[data-lesson-action=next]').hidden=page===cfg.lessons.length-1;lesson.querySelector('.lesson-launch').hidden=page!==cfg.lessons.length-1;lesson.querySelector('.scene-free').disabled=page===cfg.lessons.length-1&&!correct;
  lesson.querySelector('.lesson-study-header span:last-child').textContent=page===cfg.lessons.length-1?'CEK PEMAHAMAN':'MATERI AWAL';content.scrollTop=0;
 }
 lesson.querySelector('.lesson-open').onclick=()=>{document.querySelector('.scene-announcement')?.remove();lesson.querySelector('.lesson-cover').hidden=true;lesson.querySelector('.lesson-study').hidden=false;study();focusHeading(content);};
 lesson.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.lessonAction){page=Math.max(0,Math.min(cfg.lessons.length-1,page+(b.dataset.lessonAction==='next'?1:-1)));study();focusHeading(content);}
  if(b.hasAttribute('data-simple-example')){const box=content.querySelector('#lesson-example');box.hidden=!box.hidden;b.setAttribute('aria-expanded',String(!box.hidden));b.textContent=box.hidden?'Lihat contoh':'Tutup contoh';if(box.hidden)examples.delete(page);else examples.add(page);}
  if(b.classList.contains('scene-free')){const l=cfg.lessons[page];if(seen.size!==cfg.lessons.length||!checked.has(page)||studyAnswers[page]!==l.correct)return;lesson.dataset.complete='true';document.dispatchEvent(new CustomEvent('lcm-lesson-finish',{detail:{timed:Boolean(lesson.querySelector('#simple-timer')?.checked)}}));}
 });
 lesson.addEventListener('change',e=>{if(!e.target.matches('input[name="lesson-answer"]'))return;studyAnswers[page]=Number(e.target.value);checked.delete(page);content.querySelector('.simple-check-feedback').hidden=true;lesson.querySelector('.scene-free').disabled=true;});
 lesson.addEventListener('submit',e=>{if(!e.target.matches('.simple-check'))return;e.preventDefault();const feedback=content.querySelector('.simple-check-feedback');feedback.hidden=false;if(studyAnswers[page]===null){feedback.textContent='Pilih satu jawaban terlebih dahulu.';return;}checked.add(page);const right=studyAnswers[page]===cfg.lessons[page].correct;feedback.textContent=right?cfg.lessons[page].feedback:'Jawaban ini belum sesuai. Baca lagi penjelasannya, lalu periksa pilihan lain.';feedback.dataset.correct=String(right);lesson.querySelector('.scene-free').disabled=!right;feedback.scrollIntoView({block:'nearest'});});
 function situationView(){const c=cases[situation],selected=answers[situation],result=selected===null?null:c.options[selected];sim.dataset.mode='simple';sim.dataset.case=String(situation);
  view.innerHTML=`<div class="simple-situation-count">Situasi ${situation+1} dari ${cases.length}</div><div class="simple-situation-layout"><div class="simple-situation-art"><img src="${safe(art[c.image])}" alt=""></div><article class="simple-situation-copy"><h2>${safe(c.title)}</h2><p class="simple-situation-body">${safe(c.body)}</p>${c.snippet?`<div class="simple-message-detail">${safe(c.snippet)}</div>`:''}<fieldset class="simple-actions"><legend>${safe(c.prompt)}</legend><p>Pilih tindakan yang akan Anda ambil.</p>${c.options.map((o,i)=>`<button type="button" data-simple-choice="${i}" aria-pressed="${selected===i}"><span class="simple-choice-mark" aria-hidden="true">${selected===i?'●':'○'}</span><span>${safe(o.label)}</span></button>`).join('')}</fieldset><div class="simple-consequence" role="status" ${result?'':'hidden'} data-good="${result?result.good:''}">${result?`<span>YANG TERJADI</span><h3>${safe(result.title)}</h3><p>${safe(result.body)}</p><span class="simple-retry-hint">Pilih tindakan satunya jika ingin membandingkan hasilnya.</span>`:''}</div></article></div>`;
  sim.querySelector('[data-simple-sim=back]').disabled=situation===0;const next=sim.querySelector('[data-simple-sim=next]');next.disabled=selected===null;next.textContent=situation===cases.length-1?'Temukan istilah →':'Situasi berikutnya →';
 }
 sim.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.simpleChoice!==undefined){answers[situation]=Number(b.dataset.simpleChoice);const scroll=sim.querySelector('.sim-scroll'),y=scroll.scrollTop;situationView();scroll.scrollTop=y;view.querySelector(`[data-simple-choice="${answers[situation]}"]`).focus({preventScroll:true});view.querySelector('.simple-consequence').scrollIntoView({block:'nearest'});}
  if(b.dataset.simpleSim==='back'){situation=Math.max(0,situation-1);situationView();sim.querySelector('.sim-scroll').scrollTop=0;focusHeading(view);}
  if(b.dataset.simpleSim==='next'){if(answers[situation]===null)return;if(situation<cases.length-1){situation++;situationView();sim.querySelector('.sim-scroll').scrollTop=0;focusHeading(view);}else if(answers.every(a=>a!==null)){sim.dataset.complete='true';sim.hidden=true;document.querySelector('.word-root').hidden=false;document.dispatchEvent(new CustomEvent('lcm-simulation-finish'));}}
 });
 situationView();
})();
/* Offline word-search reinforcement. No H5P runtime or scoring side effects. */
(()=>{'use strict';
 if(!document.body.classList.contains('exe-export'))return;
 const root=document.querySelector('.word-root'),node=document.querySelector('.word-config');if(!root||!node)return;
 const cfg=JSON.parse(node.textContent),found=new Set(),revealed=new Set(),hinted=new Set();let activeHint=null,origin=null,start=null,dragging=false,moved=false;
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 root.innerHTML=`<div class="word-scroll"><header class="word-heading"><span class="scene-eyebrow">FIND THE WORDS · LATIHAN ISTILAH</span><h2>Temukan istilah yang baru Anda pelajari.</h2><p>Baca petunjuk untuk menentukan istilahnya. Pilih huruf pertama lalu huruf terakhir, atau seret sepanjang kata. Baca dari kiri ke kanan atau dari atas ke bawah.</p><p class="word-optional">Latihan ini tidak menambah nilai. Anda boleh melanjutkan ke latihan berikutnya kapan saja.</p></header><div class="word-layout"><div><div class="word-board" role="group" aria-label="Kotak pencarian kata, ${cfg.grid.length} baris dan ${cfg.grid[0].length} kolom">${cfg.grid.map((row,r)=>row.split('').map((letter,c)=>`<button type="button" class="word-cell" data-word-cell="${r},${c}" aria-label="Baris ${r+1}, kolom ${c+1}: ${letter}" tabindex="${r===0&&c===0?'0':'-1'}">${letter}</button>`).join('')).join('')}</div><p class="word-keyboard">Keyboard: panah untuk berpindah, Enter untuk memilih awal dan akhir, Esc untuk membatalkan.</p></div><aside class="word-vocabulary"><h3>Petunjuk pencarian</h3><p class="word-progress" role="status"></p><ul>${cfg.words.map((w,i)=>`<li data-word-entry="${safe(w.term)}"><span class="word-clue-number">Petunjuk ${i+1} · ${w.term.length} huruf</span><span class="word-definition">${safe(w.clue)}</span><button class="word-hint" type="button" data-word-hint="${i}" aria-label="Petunjuk tambahan untuk soal ${i+1}" aria-pressed="false">Tunjukkan huruf awal</button><span class="word-term"></span><span class="word-state"></span></li>`).join('')}</ul><div class="word-tools"><button type="button" data-word-action="solution">Tampilkan jawaban</button><button type="button" data-word-action="retry">Ulangi</button></div></aside></div><p class="word-feedback" role="status">Baca petunjuknya, lalu cari istilah yang sesuai di papan.</p></div><footer class="word-controls"><button type="button" data-word-action="continue">Lanjut ke Drag the Words →</button></footer>`;
 const cells=[...root.querySelectorAll('.word-cell')],feedback=root.querySelector('.word-feedback');
 function point(cell){return cell.dataset.wordCell.split(',').map(Number);}
 function key(p){return p.join(',');}
 function path(a,b){const dr=b[0]-a[0],dc=b[1]-a[1];if(dr<0||dc<0||(dr&&dc))return [];const length=Math.max(Math.abs(dr),Math.abs(dc));return Array.from({length:length+1},(_,i)=>[a[0]+Math.sign(dr)*i,a[1]+Math.sign(dc)*i]);}
 function same(a,b){return a.length===b.length&&a.every((p,i)=>key(p)===key(b[i]));}
 function paint(selection=[]){
  const selected=new Set(selection.map(key)),known=new Set(),help=new Set();
  const hintKey=activeHint===null?null:key(cfg.words[activeHint].cells[0]);
  const independent=[...found].filter(term=>!hinted.has(term)).length;
  const assisted=found.size-independent+revealed.size;
  cfg.words.forEach(w=>{const dest=found.has(w.term)?known:revealed.has(w.term)?help:null;if(dest)w.cells.forEach(p=>dest.add(key(p)));});
  cells.forEach(c=>{const k=c.dataset.wordCell;c.classList.toggle('is-selecting',selected.has(k));c.classList.toggle('is-found',known.has(k));c.classList.toggle('is-revealed',help.has(k));c.classList.toggle('is-hint',k===hintKey);c.setAttribute('aria-pressed',String(selected.has(k)));});
  root.querySelector('.word-progress').textContent=independent+' dari '+cfg.words.length+' istilah ditemukan sendiri'+(assisted?' · '+assisted+' dengan bantuan':'')+'.';
  cfg.words.forEach((w,i)=>{
   const li=root.querySelector('[data-word-entry="'+w.term+'"]'),button=li.querySelector('.word-hint');
   const solved=found.has(w.term), shown=revealed.has(w.term);
   li.classList.toggle('is-found',solved);
   button.hidden=solved||shown;
   button.setAttribute('aria-pressed',String(activeHint===i));
   li.querySelector('.word-term').textContent=solved||shown?w.term:'';
   li.querySelector('.word-state').textContent=solved?(hinted.has(w.term)?'✓ Ditemukan dengan petunjuk':'✓ Ditemukan'):shown?'Ditampilkan dengan bantuan':'';
  });
  root.dataset.complete=String(independent===cfg.words.length);root.dataset.found=String(independent);
 }
 function select(cell){if(!cell)return;const p=point(cell);if(!start){start=p;paint([p]);feedback.textContent=`Huruf awal ${cell.textContent} dipilih. Sekarang pilih huruf terakhir.`;}else finish(p);}
 function finish(end){
  const selected=path(start,end),w=cfg.words.find(w=>same(w.cells,selected));start=null;
  if(!selected.length)feedback.textContent='Mulai dari huruf pertama, lalu pilih ke kanan atau ke bawah.';
  else if(!w)feedback.textContent='Rangkaian ini belum cocok dengan petunjuk. Coba awal dan akhir yang lain.';
  else if(found.has(w.term))feedback.textContent=`${w.term} sudah ditemukan. Coba istilah lainnya.`;
  else if(revealed.has(w.term))feedback.textContent=`${w.term} ditampilkan dengan bantuan. Tekan Ulangi jika ingin mencarinya sendiri.`;
  else{found.add(w.term);if(activeHint!==null&&cfg.words[activeHint]===w)activeHint=null;feedback.textContent=`${w.term} ditemukan. ${w.meaning}${found.size===cfg.words.length?' Semua istilah sudah ditemukan; lanjutkan ke latihan berikutnya.':''}`;}
  paint();
 }
 root.addEventListener('click',e=>{
  const cell=e.target.closest('.word-cell');if(cell){if(e.detail===0)select(cell);return;}
  const hint=e.target.closest('[data-word-hint]');
  if(hint){
   const index=Number(hint.dataset.wordHint),word=cfg.words[index];
   hinted.add(word.term);activeHint=index;start=null;paint();
   const first=cells.find(c=>c.dataset.wordCell===key(word.cells[0]));
   const [row,column]=word.cells[0];
   feedback.textContent='Soal '+(index+1)+': mulai dari huruf '+first.textContent+' di baris '+(row+1)+', kolom '+(column+1)+'.';
   cells.forEach(c=>c.tabIndex=-1);first.tabIndex=0;
   first.focus({preventScroll:true});
   first.scrollIntoView({block:'nearest',inline:'nearest'});
   return;
  }
  const action=e.target.closest('[data-word-action]')?.dataset.wordAction;
  if(action==='solution'){activeHint=null;cfg.words.forEach(w=>{if(!found.has(w.term))revealed.add(w.term);});start=null;paint();feedback.textContent='Kata yang belum ditemukan ditandai sebagai bantuan. Temuan dengan bantuan tidak dihitung sebagai temuan sendiri.';}
  if(action==='retry'){found.clear();revealed.clear();hinted.clear();activeHint=null;start=null;paint();feedback.textContent='Papan diulang. Cari kembali istilah berdasarkan petunjuk.';}
  if(action==='continue'){root.hidden=true;document.querySelector('.dt-root').hidden=false;document.dispatchEvent(new CustomEvent('lcm-wordsearch-finish'));}
 });
 root.addEventListener('pointerdown',e=>{const cell=e.target.closest('.word-cell');if(!cell||e.button!==0)return;dragging=true;moved=false;root.setPointerCapture(e.pointerId);origin=point(cell);paint([start||origin]);});
 root.addEventListener('pointermove',e=>{if(!dragging)return;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('.word-cell');if(!cell||!root.contains(cell))return;const p=point(cell);if(key(p)!==key(origin))moved=true;if(moved){start=origin;paint(path(start,p));}});
 root.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('.word-cell');if(moved){if(cell&&root.contains(cell))finish(point(cell));else{start=null;paint();}}else{if(cell&&root.contains(cell))select(cell);}if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId);});
 root.addEventListener('pointercancel',()=>{dragging=false;start=null;paint();feedback.textContent='Pilihan dibatalkan. Pilih huruf pertama untuk mencoba lagi.';});
 root.addEventListener('keydown',e=>{const cell=e.target.closest('.word-cell');if(!cell)return;const p=point(cell),delta={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(delta){e.preventDefault();const r=Math.max(0,Math.min(cfg.grid.length-1,p[0]+delta[0])),c=Math.max(0,Math.min(cfg.grid[0].length-1,p[1]+delta[1]));cells.forEach(x=>x.tabIndex=-1);const target=root.querySelector(`[data-word-cell="${r},${c}"]`);target.tabIndex=0;target.focus();}if(e.key==='Escape'){e.preventDefault();start=null;paint();feedback.textContent='Pilihan dibatalkan.';}});
 paint();
})();
/* Drag words into sentence gaps. Independent offline practice, not an H5P runtime. */
(()=>{'use strict';
 if(!document.body.classList.contains('exe-export'))return;
 const root=document.querySelector('.dt-root'),node=document.querySelector('.dt-config');if(!root||!node)return;
 const cfg=JSON.parse(node.textContent),safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let positions=Object.fromEntries(cfg.words.map(w=>[w.id,'bank'])),selected=null,checked=false,assisted=false,history=[],drag=null,ignoreUntil=0,frame=null;
 const label=id=>cfg.words.find(w=>w.id===id).label;
 function message(text){root.querySelector('.dt-feedback').textContent=text;}
 function render(){
  const scroll=root.querySelector('.dt-scroll')?.scrollTop||0;
  root.innerHTML=`<div class="dt-scroll"><header class="dt-heading"><span class="scene-eyebrow">DRAG THE WORDS · LENGKAPI KALIMAT</span><h2>Kata mana yang melengkapi kalimat ini?</h2><p>Seret kata ke bagian yang kosong. Anda juga bisa memilih kata, lalu memilih tempatnya. Ada satu kata yang tidak digunakan.</p><p class="dt-optional">Latihan ini tidak menambah nilai. Tekan Periksa jawaban setelah mengisi kalimat, atau lanjutkan ke latihan berikutnya.</p></header><section class="dt-bank" aria-label="Pilihan kata"><h3>Pilihan kata</h3><div class="dt-bank-cards">${cfg.words.filter(w=>positions[w.id]==='bank').map(w=>`<button type="button" class="dt-card" data-dt-card="${safe(w.id)}" aria-pressed="${selected===w.id}">${safe(w.label)}</button>`).join('')||'<span>Semua kata sedang ditempatkan.</span>'}</div><button type="button" class="dt-return" data-dt-target="bank">Kembalikan kata terpilih ke pilihan</button></section><ol class="dt-sentences">${cfg.gaps.map((g,i)=>{
   const id=cfg.words.find(w=>positions[w.id]===g.id)?.id,right=id===g.answer,state=checked?(id?(right?'correct':'wrong'):'empty'):'';
   return `<li data-dt-gap="${safe(g.id)}" data-state="${state}"><p>${safe(g.before)} <span class="dt-slot"><button type="button" class="dt-target ${id?'dt-filled':''}" data-dt-target="${safe(g.id)}" ${id?`data-dt-card="${safe(id)}" aria-pressed="${selected===id}"`:''} aria-label="Kalimat ${i+1}, ${id?safe(label(id)):'bagian kosong'}">${id?safe(label(id)):'Pilih kata'}</button>${id?`<button type="button" class="dt-remove" data-dt-remove="${safe(id)}" aria-label="Kembalikan kata pada kalimat ${i+1}">×</button>`:''}</span> ${safe(g.after)}</p><p class="dt-gap-feedback">${checked?(id?(right?safe(g.feedback):'Kata ini belum sesuai dengan kalimat. Coba pilihan lain.'):'Bagian ini belum diisi.'):assisted?'Jawaban ditampilkan dengan bantuan.':''}</p></li>`;
  }).join('')}</ol><div class="dt-tools"><button type="button" data-dt-action="undo" ${history.length?'':'disabled'}>Urungkan</button><button type="button" data-dt-action="retry">Ulangi</button><button type="button" data-dt-action="solution">Tampilkan jawaban</button></div><p class="dt-feedback" role="status">Pilih kata yang sesuai dengan makna kalimat.</p></div><footer class="dt-controls"><button type="button" data-dt-action="check">Periksa jawaban</button><button type="button" data-dt-action="continue">Urutkan paragraf →</button></footer>`;
  root.querySelector('.dt-scroll').scrollTop=scroll;
  const correct=cfg.gaps.filter(g=>positions[g.answer]===g.id).length;root.dataset.correct=String(checked?correct:0);root.dataset.complete=String(checked&&correct===cfg.gaps.length&&!assisted);root.dataset.assisted=String(assisted);
 }
 function choose(id){selected=selected===id?null:id;root.querySelectorAll('[data-dt-card]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.dtCard===selected)));message(selected?'Kata dipilih. Pilih bagian kalimat yang akan diisi.':'Pilihan dibatalkan.');}
 function move(id,target){
  if(positions[id]===target){selected=null;render();return;}
  history.push({...positions});const occupied=Object.keys(positions).find(k=>positions[k]===target&&target!=='bank');if(occupied)positions[occupied]='bank';positions[id]=target;selected=null;checked=false;render();message(target==='bank'?'Kata dikembalikan ke pilihan.':'Kata ditempatkan. Isi bagian lainnya, lalu periksa jawaban.');root.querySelector(`[data-dt-target="${target}"]`)?.focus({preventScroll:true});
 }
 root.addEventListener('click',e=>{
  if(e.detail>0&&Date.now()<ignoreUntil)return;
  const target=e.target.closest('[data-dt-target]'),card=e.target.closest('[data-dt-card]'),remove=e.target.closest('[data-dt-remove]'),action=e.target.closest('[data-dt-action]')?.dataset.dtAction;
  if(remove){move(remove.dataset.dtRemove,'bank');return;}
  if(target){if(selected)move(selected,target.dataset.dtTarget);else if(card)choose(card.dataset.dtCard);else message('Pilih kata terlebih dahulu, lalu pilih bagian yang kosong.');return;}
  if(card){choose(card.dataset.dtCard);return;}
  if(action==='undo'&&history.length){positions=history.pop();selected=null;checked=false;render();message('Pemindahan terakhir dibatalkan.');}
  if(action==='retry'){positions=Object.fromEntries(cfg.words.map(w=>[w.id,'bank']));history=[];selected=null;checked=false;assisted=false;render();message('Kalimat dikosongkan. Coba kembali dari pilihan kata.');}
  if(action==='solution'){history.push({...positions});positions=Object.fromEntries(cfg.words.map(w=>[w.id,'bank']));cfg.gaps.forEach(g=>positions[g.answer]=g.id);assisted=true;checked=false;selected=null;render();message('Jawaban ditampilkan dengan bantuan. Tekan Ulangi jika ingin mengerjakannya sendiri.');}
  if(action==='check'){checked=true;selected=null;render();const count=Number(root.dataset.correct);message(assisted?'Jawaban ini memakai bantuan. Tekan Ulangi untuk mencoba sendiri.':count===cfg.gaps.length?'Ketiga kalimat sudah tepat. Lanjutkan ke latihan berikutnya.':`${count} dari ${cfg.gaps.length} kalimat sudah tepat. Tinjau bagian yang belum sesuai.`);}
  if(action==='continue'){root.hidden=true;document.querySelector('.sp-root').hidden=false;document.dispatchEvent(new CustomEvent('lcm-dragwords-finish'));}
 });
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;render();message('Pilihan dibatalkan.');}});
 function tick(){if(!drag?.ghost){frame=null;return;}const scroll=root.querySelector('.dt-scroll'),r=scroll.getBoundingClientRect(),speed=drag.y<r.top+55?-9:drag.y>r.bottom-55?9:0;if(speed)scroll.scrollTop+=speed;frame=requestAnimationFrame(tick);}
 root.addEventListener('pointerdown',e=>{const card=e.target.closest('[data-dt-card]');if(!card||e.button!==0)return;drag={id:card.dataset.dtCard,source:card,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,ghost:null};card.setPointerCapture(e.pointerId);});
 root.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;drag.x=e.clientX;drag.y=e.clientY;if(!drag.ghost&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>7){drag.ghost=drag.source.cloneNode(true);drag.ghost.removeAttribute('data-dt-card');drag.ghost.classList.add('dt-ghost');drag.ghost.setAttribute('aria-hidden','true');document.body.append(drag.ghost);frame=requestAnimationFrame(tick);}if(drag.ghost){e.preventDefault();drag.ghost.style.left=(e.clientX+10)+'px';drag.ghost.style.top=(e.clientY+10)+'px';root.querySelectorAll('.dt-hover').forEach(c=>c.classList.remove('dt-hover'));document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-dt-target]')?.classList.add('dt-hover');}});
 function end(e,cancel){if(!drag)return;const d=drag;drag=null;if(frame)cancelAnimationFrame(frame);frame=null;if(d.source.hasPointerCapture(d.pointer))d.source.releasePointerCapture(d.pointer);root.querySelectorAll('.dt-hover').forEach(c=>c.classList.remove('dt-hover'));if(d.ghost){d.ghost.remove();ignoreUntil=Date.now()+400;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-dt-target]');if(!cancel&&target&&root.contains(target))move(d.id,target.dataset.dtTarget);else message('Kata belum ditempatkan. Seret ke bagian kosong, atau pilih kata lalu tempatnya.');}}
 root.addEventListener('pointerup',e=>end(e,false));root.addEventListener('pointercancel',e=>end(e,true));
 render();
})();
/* Reorder coherent paragraphs with pointer, movement buttons and keyboard. */
(()=>{'use strict';
 if(!document.body.classList.contains('exe-export'))return;
 const root=document.querySelector('.sp-root'),node=document.querySelector('.sp-config');if(!root||!node)return;
 const cfg=JSON.parse(node.textContent),safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let order=[...cfg.initial_order],history=[],checked=false,assisted=false,grabbed=null,original=null,originalHistory=0,drag=null,frame=null,ignoreUntil=0;
 const text=id=>cfg.paragraphs.find(p=>p.id===id).text;
 function say(value){root.querySelector('.sp-feedback').textContent=value;}
 function render(focus=null){
  const y=root.querySelector('.sp-scroll')?.scrollTop||0,correct=order.filter((id,i)=>id===cfg.correct_order[i]).length;
  root.innerHTML=`<div class="sp-scroll"><header class="sp-heading"><span class="scene-eyebrow">SORT THE PARAGRAPHS · SUSUN ALUR CERITA</span><h2>${safe(cfg.title)}</h2><p>Susun empat paragraf ini menjadi cerita yang runtut. Seret pegangannya, atau gunakan tombol Naik dan Turun.</p><p class="sp-optional">Contoh simulasi. Latihan ini tidak menambah nilai; Anda boleh melanjutkan ke praktik kasus kapan saja.</p></header><p class="sp-keyboard">Keyboard: pilih pegangan dengan Enter atau Spasi, gunakan panah atas/bawah, lalu Enter atau Spasi untuk meletakkan. Esc membatalkan.</p><ol class="sp-list" aria-label="Paragraf yang dapat diurutkan">${order.map((id,i)=>`<li class="sp-card" data-sp-id="${safe(id)}" data-state="${checked?(id===cfg.correct_order[i]?'correct':'wrong'):''}"><div class="sp-card-top"><span class="sp-position">Posisi ${i+1} dari ${order.length}</span><button type="button" class="sp-handle" data-sp-handle="${safe(id)}" aria-label="Geser paragraf di posisi ${i+1}" aria-pressed="${grabbed===id}">⠿ <span>Geser</span></button></div><p>${safe(text(id))}</p><div class="sp-movement"><button type="button" data-sp-up="${safe(id)}" aria-label="Naikkan paragraf di posisi ${i+1}" ${i===0?'disabled':''}>↑ Naik</button><button type="button" data-sp-down="${safe(id)}" aria-label="Turunkan paragraf di posisi ${i+1}" ${i===order.length-1?'disabled':''}>↓ Turun</button><span class="sp-state">${checked?(id===cfg.correct_order[i]?'✓ Posisi tepat':'Tinjau urutannya'):assisted?'Urutan ditampilkan dengan bantuan.':''}</span></div></li>`).join('')}</ol><div class="sp-tools"><button type="button" data-sp-action="undo" ${history.length?'':'disabled'}>Urungkan</button><button type="button" data-sp-action="retry">Ulangi</button><button type="button" data-sp-action="solution">Tampilkan urutan</button></div><p class="sp-feedback" role="status">Baca setiap paragraf dan perhatikan hubungannya dengan paragraf lain.</p></div><footer class="sp-controls"><button type="button" data-sp-action="check">Periksa urutan</button><button type="button" data-sp-action="continue">Praktik kasus →</button></footer>`;
  root.querySelector('.sp-scroll').scrollTop=y;root.dataset.correct=String(checked?correct:0);root.dataset.complete=String(checked&&correct===order.length&&!assisted);root.dataset.assisted=String(assisted);
  if(focus)root.querySelector(`[data-sp-handle="${focus}"]`)?.focus({preventScroll:true});
 }
 function place(id,index){const from=order.indexOf(id);if(index<0||index>=order.length||from===index)return;history.push([...order]);order.splice(from,1);order.splice(index,0,id);checked=false;render(id);say(`Paragraf dipindahkan ke posisi ${index+1} dari ${order.length}.`);}
 function grab(id){if(grabbed===id){grabbed=null;original=null;render(id);say('Paragraf diletakkan.');}else{grabbed=id;original=[...order];originalHistory=history.length;render(id);say('Paragraf dipilih. Gunakan panah atas atau bawah untuk memindahkan, lalu Enter atau Spasi untuk meletakkan.');}}
 root.addEventListener('click',e=>{
  if(e.detail>0&&Date.now()<ignoreUntil)return;
  const handle=e.target.closest('[data-sp-handle]'),up=e.target.closest('[data-sp-up]'),down=e.target.closest('[data-sp-down]'),action=e.target.closest('[data-sp-action]')?.dataset.spAction;
  if(handle){grab(handle.dataset.spHandle);return;}if(up){place(up.dataset.spUp,order.indexOf(up.dataset.spUp)-1);return;}if(down){place(down.dataset.spDown,order.indexOf(down.dataset.spDown)+1);return;}
  if(action==='undo'&&history.length){order=history.pop();checked=false;grabbed=null;render();say('Pemindahan terakhir dibatalkan.');}
  if(action==='retry'){order=[...cfg.initial_order];history=[];checked=false;assisted=false;grabbed=null;original=null;render();say('Urutan diulang. Susun kembali alur ceritanya.');}
  if(action==='solution'){history.push([...order]);order=[...cfg.correct_order];checked=false;assisted=true;grabbed=null;render();say('Urutan ditampilkan dengan bantuan. Tekan Ulangi jika ingin menyusunnya sendiri.');}
  if(action==='check'){checked=true;grabbed=null;render();const correct=Number(root.dataset.correct),connections=order.slice(0,-1).filter((id,i)=>cfg.correct_order.indexOf(order[i+1])===cfg.correct_order.indexOf(id)+1).length;root.dataset.connections=String(connections);say(assisted?'Urutan ini memakai bantuan. Tekan Ulangi untuk mencoba sendiri.':correct===order.length?`Urutan sudah runtut. ${cfg.explanation}`:`${correct} dari ${order.length} paragraf berada di posisi tepat. ${connections} dari ${order.length-1} sambungan sudah sesuai. Baca kembali kalimat pembuka dan hubungan antarapagraf.`);}
  if(action==='continue'){root.hidden=true;document.querySelector('.dnd-challenge').hidden=false;document.dispatchEvent(new CustomEvent('lcm-sortparagraphs-finish'));}
 });
 root.addEventListener('keydown',e=>{
  const handle=e.target.closest('[data-sp-handle]');if(!handle)return;const id=handle.dataset.spHandle;
  if(grabbed===id&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();place(id,order.indexOf(id)+(e.key==='ArrowUp'?-1:1));}
  if(e.key==='Escape'&&grabbed){e.preventDefault();const focus=grabbed;order=[...original];history=history.slice(0,originalHistory);checked=false;grabbed=null;original=null;render(focus);say('Pemindahan dibatalkan; urutan sebelum memilih paragraf dipulihkan.');}
 });
 function tick(){if(!drag?.ghost){frame=null;return;}const scroll=root.querySelector('.sp-scroll'),r=scroll.getBoundingClientRect();if(drag.y<r.top+55)scroll.scrollTop-=9;else if(drag.y>r.bottom-55)scroll.scrollTop+=9;frame=requestAnimationFrame(tick);}
 function hit(x,y){const card=document.elementFromPoint(x,y)?.closest('[data-sp-id]');return card&&root.contains(card)?card:null;}
 root.addEventListener('pointerdown',e=>{const handle=e.target.closest('[data-sp-handle]');if(!handle||e.button!==0)return;drag={id:handle.dataset.spHandle,source:handle,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,y:e.clientY,ghost:null};handle.setPointerCapture(e.pointerId);});
 root.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;drag.y=e.clientY;if(!drag.ghost&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>7){drag.ghost=drag.source.closest('.sp-card').cloneNode(true);drag.ghost.removeAttribute('data-sp-id');drag.ghost.classList.add('sp-ghost');drag.ghost.setAttribute('aria-hidden','true');drag.ghost.querySelectorAll('button').forEach(b=>b.tabIndex=-1);document.body.append(drag.ghost);frame=requestAnimationFrame(tick);}if(drag.ghost){e.preventDefault();drag.ghost.style.left=(e.clientX+10)+'px';drag.ghost.style.top=(e.clientY+10)+'px';root.querySelectorAll('.sp-drop-before,.sp-drop-after').forEach(c=>c.classList.remove('sp-drop-before','sp-drop-after'));const card=hit(e.clientX,e.clientY);if(card&&card.dataset.spId!==drag.id){const r=card.getBoundingClientRect();card.classList.add(e.clientY<r.y+r.height/2?'sp-drop-before':'sp-drop-after');}}});
 function end(e,cancel){if(!drag)return;const d=drag;drag=null;if(frame)cancelAnimationFrame(frame);frame=null;if(d.source.hasPointerCapture(d.pointer))d.source.releasePointerCapture(d.pointer);root.querySelectorAll('.sp-drop-before,.sp-drop-after').forEach(c=>c.classList.remove('sp-drop-before','sp-drop-after'));if(d.ghost){d.ghost.remove();ignoreUntil=Date.now()+400;const card=hit(e.clientX,e.clientY);if(!cancel&&card&&card.dataset.spId!==d.id){const r=card.getBoundingClientRect(),rest=order.filter(id=>id!==d.id),index=rest.indexOf(card.dataset.spId)+(e.clientY>=r.y+r.height/2?1:0);grabbed=null;place(d.id,index);}else say('Paragraf tetap di tempatnya. Seret ke atas atau bawah paragraf lain, atau gunakan tombol Naik/Turun.');}}
 root.addEventListener('pointerup',e=>end(e,false));root.addEventListener('pointercancel',e=>end(e,true));
 render();
})();
});

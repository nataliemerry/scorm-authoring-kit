/* Case practice inside an eXe Text iDevice. Native Form owns LMS grading. */
(()=>{'use strict';
 const root=document.querySelector('.dnd-challenge'),data=document.querySelector('.dnd-config');if(!root||!data||!document.body.classList.contains('exe-export'))return;
 const cfg=JSON.parse(data.textContent),view=root.querySelector('.dnd-workspace'),status=root.querySelector('.dnd-status');
 const art=Object.fromEntries([...document.querySelectorAll('[data-dnd-art]')].map(i=>[i.dataset.dndArt,i.src]));
 const mobileTargets=document.createElement('div');mobileTargets.className='dnd-mobile-targets';root.insertBefore(mobileTargets,status);
 root.style.setProperty('--challenge-art',`url("${art[cfg.course==='C01'?'scenes/C01-server.webp':(cfg.course==='S01'?'scenes/S01-survey.webp':'scenes/C12-mail.webp')]}")`);
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
  view.innerHTML=`<header class="dnd-heading"><div class="dnd-stage-label">${cfg.course==='C01'?'MEJA ANGGARAN':(cfg.course==='S01'?'PERANCANGAN SAMPLING':'INVESTIGASI EMAIL')} · TAHAP ${step+1} DARI ${cfg.steps.length}</div><h2>${safe(s.title)}</h2><p>${safe(s.kind==='budget'?'Setiap token bernilai 10 unit. Bagikan ke perbaikan server dan cadangan data.':s.kind==='revision'?'Server kini perlu 90 unit, cadangan tahap awal 10 unit. Anggaran tetap 100.':s.kind==='sequence'?(cfg.course==='S01'?'Susun tiga prosedur penarikan sampel yang benar. Sisakan dua langkah berisiko di bank.':'Susun tiga tindakan aman. Sisakan dua tindakan yang berisiko.'):cfg.course==='C01'?'Tentukan usulan yang perlu didanai sekarang dan yang masih bisa ditunda.':(cfg.course==='S01'?'Pisahkan kerangka sampel yang layak dari kondisi cacat kerangka yang berisiko bias.':'Pisahkan indikasi phishing dari tanda yang belum cukup sebagai bukti.'))}</p><ol class="dnd-steps" aria-label="Tahap tantangan">${cfg.steps.map((_,i)=>`<li ${i===step?'aria-current="step"':''}>${i<step?'✓':i+1}</li>`).join('')}</ol></header>
  <details class="dnd-guide"><summary>Petunjuk & rincian kasus</summary><p>${safe(s.intro)}</p><p class="dnd-help">Seret objek ke tempat tujuan. Bisa juga pilih objek, lalu ketuk nama tempat tujuan. Keyboard: Enter untuk memilih, Tab ke tujuan, lalu Enter.</p></details>
  <div class="dnd-board"><section class="dnd-bank dnd-zone" data-drop="bank"><button type="button" class="dnd-drop-title" data-drop-target="bank">${isBudget?'Sisa token & pilihan keputusan':'Berkas yang belum ditempatkan'} <span>${isBudget?100-amount('server')-amount('backup')+' unit tersisa':''}</span></button><div class="dnd-items">${cardsIn('bank')||'<span class="dnd-empty">Semua objek sudah ditempatkan.</span>'}</div></section>
  <div class="dnd-destinations">${zones().map(z=>`<section class="dnd-zone" data-drop="${z.id}" ${z.accept?`data-accept="${z.accept}"`:''}><button type="button" class="dnd-drop-title" data-drop-target="${z.id}">${z.image?`<img src="${safe(art[z.image])}" alt="" draggable="false">`:''}<span><strong>${safe(z.label)}</strong><small>${safe(z.hint)}</small></span>${isBudget&&z.accept==='token'?`<b class="dnd-amount">${amount(z.id)} <small>unit</small></b>`:''}</button><div class="dnd-items">${cardsIn(z.id)||'<span class="dnd-empty">Letakkan di sini</span>'}</div></section>`).join('')}</div></div>
  <footer class="dnd-controls"><button type="button" data-dnd-action="undo" ${!history.length?'disabled':''}>↶ Urungkan</button><button type="button" data-dnd-action="reset">Atur ulang tahap ini</button><button type="button" data-dnd-action="solution">Tampilkan jawaban</button>${step?'<button type="button" data-dnd-action="back">← Tahap sebelumnya</button>':''}<button type="button" class="dnd-check" data-dnd-action="check">${validated?(step===cfg.steps.length-1?'Tantangan selesai ✓':'Lanjut ke tahap berikutnya →'):'Periksa rencana saya'}</button></footer>`;
  mobileTargets.innerHTML=zones().map(z=>`<button type="button" class="dnd-mobile-drop" data-mobile-target="${z.id}" data-drop="${z.id}">${safe(z.label)}${z.accept==='token'?' · '+amount(z.id)+' unit':''}</button>`).join('');
 }
 function invalidate(){validated=false;root.dataset.complete='false';root.classList.remove('dnd-completed');}
 function move(id,target){
  const item=items().find(i=>i.id===id),zone=zones().find(z=>z.id===target);if(!item||(!zone&&target!=='bank'))return;
  if(zone?.accept&&zone.accept!==item.type){say(zone.accept==='token'?'Tempat ini hanya menerima token anggaran.':'Tempat ini menerima kartu keputusan, bukan token.',true);return;}
  if((positions[id]||'bank')===target){selected=null;render();return;}
  history.push({...positions});if(zone?.single)items().filter(i=>positions[i.id]===target).forEach(i=>positions[i.id]='bank');positions[id]=target;selected=null;invalidate();render();say(item.label+' dipindahkan ke '+(zone?.label||'tempat asal')+'.');
 }
 function applySolution(){
   const s=current();selected=null;invalidate();
   if(s.kind==='sort'||s.kind==='sequence'){
    positions={...Object.fromEntries(s.items.map(i=>[i.id,s.solution[i.id]||'bank']))};
   }else if(s.kind==='budget'){
    positions=Object.fromEntries(tokens.map((i,idx)=>[i.id,idx<7?'server':'backup']));
   }else if(s.kind==='revision'){
    positions={...Object.fromEntries(tokens.map((i,idx)=>[i.id,idx<9?'server':'backup'])),stage:'decision',extra:'bank',delay:'bank'};
   }
   render();
   say('Jawaban yang tepat ditampilkan. Tekan "Periksa rencana saya" untuk memverifikasi atau Anda dapat mengatur ulang untuk mencoba sendiri.');
  }
  function enter(next){step=next;selected=null;history=[];invalidate();if(current().kind==='budget')positions=Object.fromEntries(tokens.map(i=>[i.id,'bank']));else if(current().kind==='revision')positions={...positions,...Object.fromEntries(current().items.map(i=>[i.id,'bank']))};else positions=Object.fromEntries(current().items.map(i=>[i.id,'bank']));initial={...positions};render();say('Tahap '+(step+1)+' siap. Susun rencana Anda.');}
 function validate(){
  const s=current();let message='';
  if(s.kind==='sort'||s.kind==='sequence'){
   const missing=s.items.filter(i=>s.solution[i.id]!=='bank'&&(positions[i.id]||'bank')==='bank');
   if(missing.length)message='Masih ada '+missing.length+' berkas yang perlu ditempatkan.';
   else {const wrong=s.items.filter(i=>(positions[i.id]||'bank')!==s.solution[i.id]);if(wrong.length){
    if(cfg.course==='C01')message='Server yang berhenti menahan pengumpulan data, dan cadangan terakhir tidak bisa dipulihkan. Kedua kebutuhan ini lebih mendesak daripada penataan ruangan atau lokakarya tambahan.';
    else if(cfg.course==='S01'){
     if(s.kind==='sort')message='Kerangka sampel harus lengkap mencakup populasi, akurat tanpa duplikasi, dan mutakhir. Pencatatan ganda atau daftar usaha tutup merusak peluang seleksi.';
     else message='Tetapkan populasi dan kerangka sampel mutakhir terlebih dahulu, tentukan ukuran sampel dan alokasi domain, lalu tarik sampel probabilitas secara acak. Pemilihan sukarela atau penggantian sepihak menimbulkan bias non-sampling.';
    }
    else if(s.kind==='sort')message='Alamat pengirim, desakan login, dan tautan yang menutupi tujuan perlu diperiksa. Logo atau salam umum saja belum cukup untuk menyimpulkan adanya phishing.';
    else message='Jangan lanjutkan interaksi dengan pesan. Periksa lewat kontak yang dikenal, kemudian laporkan temuannya. Mencoba login atau meneruskan tautan dapat menambah risiko.';
    wrong.forEach(i=>view.querySelector(`[data-drag="${i.id}"]`)?.classList.add('dnd-wrong'));
   }}
  }else{
   if(amount('server')<s.server)message='Server baru mendapat '+amount('server')+' unit. Kebutuhannya '+s.server+' unit; layanan belum bisa dipulihkan.';
   else if(amount('backup')<s.backup)message='Cadangan baru mendapat '+amount('backup')+' unit. Sisihkan '+s.backup+' unit agar perlindungan data dapat dimulai.';
   else if(s.kind==='revision'&&positions.stage!=='decision')message='Dana tambahan belum disetujui. Cadangan dapat dikerjakan bertahap, sedangkan pemulihan server tetap diperlukan agar pengumpulan data berjalan lagi.';
  }
  if(message){say(message+' Geser kartu atau tokennya, lalu periksa kembali.',true);return;}
  validated=true;render();
  if(step===cfg.steps.length-1){root.dataset.complete='true';root.classList.add('dnd-completed');say(cfg.course==='C01'?'Alokasi akhir: server 90 unit dan cadangan tahap awal 10 unit. Totalnya tetap 100 unit.':(cfg.course==='S01'?'Perancangan sampling selesai: kerangka telah dievaluasi dan prosedur penarikan sampel tersusun secara sahih.':'Urutannya sudah sesuai: hentikan interaksi, periksa lewat kontak yang dikenal, kemudian laporkan.'));document.dispatchEvent(new CustomEvent('lcm-practice-complete'));}
  else say(s.kind==='budget'?'Server mendapat 70 unit dan cadangan 30 unit. Pada tahap berikutnya ada perubahan biaya yang perlu ditangani.':'Kartu sudah berada pada kategori yang sesuai. Lanjutkan ke tahap berikutnya.');
 }
 root.addEventListener('click',e=>{if(Date.now()<ignoreClick)return;const card=e.target.closest('[data-drag]'),target=e.target.closest('[data-drop-target],[data-mobile-target]'),action=e.target.closest('[data-dnd-action]');
  if(card){selected=selected===card.dataset.drag?null:card.dataset.drag;view.querySelectorAll('[data-drag]').forEach(c=>c.setAttribute('aria-pressed',c.dataset.drag===selected?'true':'false'));say(selected?'Objek dipilih. Pilih nama tempat tujuannya.':'Pilihan dibatalkan.');}
  else if(target){if(selected)move(selected,target.dataset.dropTarget||target.dataset.mobileTarget);else say('Pilih objek terlebih dahulu, atau seret langsung ke tempat ini.');}
  else if(action){switch(action.dataset.dndAction){case'undo':if(history.length){positions=history.pop();selected=null;invalidate();render();say('Pemindahan terakhir dibatalkan.');}break;case'reset':history.push({...positions});positions={...initial};selected=null;invalidate();render();say('Tahap ini diatur ulang.');break;case'solution':history.push({...positions});applySolution();break;case'back':enter(step-1);break;case'check':if(validated){if(step<cfg.steps.length-1)enter(step+1);}else validate();break;}}
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

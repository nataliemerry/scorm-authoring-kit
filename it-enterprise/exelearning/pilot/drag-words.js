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

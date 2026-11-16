/* Offline word-search reinforcement. No H5P runtime or scoring side effects. */
(()=>{'use strict';
 if(!document.body.classList.contains('exe-export'))return;
 const root=document.querySelector('.word-root'),node=document.querySelector('.word-config');if(!root||!node)return;
 const cfg=JSON.parse(node.textContent),found=new Set(),revealed=new Set(),hinted=new Set();let activeHint=null,origin=null,start=null,dragging=false,moved=false;
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 root.innerHTML=`<div class="word-scroll"><header class="word-heading"><span class="scene-eyebrow">FIND THE WORDS · LATIHAN ISTILAH</span><h2>Temukan istilah yang baru Anda pelajari.</h2><p>Baca petunjuk untuk menentukan istilahnya. Pilih huruf pertama lalu huruf terakhir, atau seret sepanjang kata. Baca dari kiri ke kanan atau dari atas ke bawah.</p><p class="word-optional">Latihan ini tidak menambah nilai. Anda boleh melanjutkan ke latihan berikutnya kapan saja.</p></header><div class="word-layout"><div><div class="word-board" role="group" aria-label="Kotak pencarian kata, ${cfg.grid.length} baris dan ${cfg.grid[0].length} kolom">${cfg.grid.map((row,r)=>row.split('').map((letter,c)=>`<button type="button" class="word-cell" data-word-cell="${r},${c}" aria-label="Baris ${r+1}, kolom ${c+1}: ${letter}" tabindex="${r===0&&c===0?'0':'-1'}">${letter}</button>`).join('')).join('')}</div><p class="word-keyboard">Keyboard: panah untuk berpindah, Enter untuk memilih awal dan akhir, Esc untuk membatalkan.</p></div><aside class="word-vocabulary"><h3>Petunjuk pencarian</h3><p class="word-progress" role="status"></p><ul>${cfg.words.map((w,i)=>`<li data-word-entry="${safe(w.term)}"><span class="word-clue-number">Petunjuk ${i+1} · ${w.term.length} huruf</span><span class="word-definition">${safe(w.clue)}</span><button class="word-hint" type="button" data-word-hint="${i}" aria-label="Petunjuk tambahan untuk soal ${i+1}" aria-pressed="false">Tunjukkan huruf awal</button><span class="word-term"></span><span class="word-state"></span></li>`).join('')}</ul><div class="word-tools"><button type="button" data-word-action="solution">Tampilkan jawaban</button><button type="button" data-word-action="retry">Ulangi</button></div></aside></div><p class="word-feedback" role="status">Baca petunjuknya, lalu cari istilah yang sesuai di papan.</p></div><footer class="word-controls"><button type="button" data-word-action="continue">${window.iteSections.nextLabel('wordSearch')}</button></footer>`;
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
  if(action==='continue'){root.hidden=true;document.dispatchEvent(new CustomEvent('lcm-wordsearch-finish'));}
 });
 root.addEventListener('pointerdown',e=>{const cell=e.target.closest('.word-cell');if(!cell||e.button!==0)return;dragging=true;moved=false;root.setPointerCapture(e.pointerId);origin=point(cell);paint([start||origin]);});
 root.addEventListener('pointermove',e=>{if(!dragging)return;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('.word-cell');if(!cell||!root.contains(cell))return;const p=point(cell);if(key(p)!==key(origin))moved=true;if(moved){start=origin;paint(path(start,p));}});
 root.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const cell=document.elementFromPoint(e.clientX,e.clientY)?.closest('.word-cell');if(moved){if(cell&&root.contains(cell))finish(point(cell));else{start=null;paint();}}else{if(cell&&root.contains(cell))select(cell);}if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId);});
 root.addEventListener('pointercancel',()=>{dragging=false;start=null;paint();feedback.textContent='Pilihan dibatalkan. Pilih huruf pertama untuk mencoba lagi.';});
 root.addEventListener('keydown',e=>{const cell=e.target.closest('.word-cell');if(!cell)return;const p=point(cell),delta={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(delta){e.preventDefault();const r=Math.max(0,Math.min(cfg.grid.length-1,p[0]+delta[0])),c=Math.max(0,Math.min(cfg.grid[0].length-1,p[1]+delta[1]));cells.forEach(x=>x.tabIndex=-1);const target=root.querySelector(`[data-word-cell="${r},${c}"]`);target.tabIndex=0;target.focus();}if(e.key==='Escape'){e.preventDefault();start=null;paint();feedback.textContent='Pilihan dibatalkan.';}});
 paint();
})();

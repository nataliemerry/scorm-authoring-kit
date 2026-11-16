/* IT Enterprise only: local presentation preferences, never assessment state. */
(() => {
 'use strict';
 const key='lcm:ITE:sections:v1';
 const sections=[
  ['theory','Materi awal','Tiga halaman teori, sumber, dan contoh.'],
  ['check','Cek pemahaman','Pertanyaan setelah materi awal.'],
  ['video','Video interaktif','Video 7:44 dan lima pertanyaan.'],
  ['situations','Situasi keputusan','Dua kasus dengan pilihan dan konsekuensi.'],
  ['wordSearch','Find the Words','Pencarian istilah berdasarkan petunjuk.'],
  ['dragWords','Drag the Words','Melengkapi kalimat dari bank kata.'],
  ['sortParagraphs','Sort the Paragraphs','Mengurutkan empat paragraf.'],
  ['hotspot','Image Hotspot','Memilih komponen penelusuran pada gambar.'],
  ['concept','Latihan konsep','Tiga pertanyaan latihan.'],
  ['case','Kasus drag-and-drop','Mengelompokkan kondisi dan menyusun rencana.'],
  ['review','Pembahasan akhir','Pilihan peserta, kunci, dan penjelasan.']
 ];
 let stored={};try{stored=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}
 const values=Object.fromEntries(sections.map(([id])=>[id,stored[id]!==false]));
 const chain=['video','situations','wordSearch','dragWords','sortParagraphs','hotspot','concept','case'];
 const labels={video:'Tonton video →',situations:'Lanjut ke situasi →',wordSearch:'Temukan istilah →',dragWords:'Lanjut ke Drag the Words →',sortParagraphs:'Urutkan paragraf →',hotspot:'Jelajahi komponen →',concept:'Lanjut ke latihan konsep →',case:'Praktik kasus →'};
 const api=window.iteSections={
  enabled:id=>values[id]!==false,routeReady:false,
  nextLabel(id){const next=chain.slice(id==='learning'?0:chain.indexOf(id)+1).find(api.enabled);return labels[next]||'Lanjut ke kuis →';},
  learningReady(){return (!api.enabled('theory')&&!api.enabled('check'))||document.querySelector('.lesson-root')?.dataset.complete==='true';}
 };
 const dialog=document.createElement('dialog');dialog.className='ite-settings-page';dialog.setAttribute('aria-labelledby','ite-settings-title');
 dialog.innerHTML=`<form class="ite-settings-form"><header><div><span class="scene-eyebrow">IT ENTERPRISE</span><h2 id="ite-settings-title">Pengaturan bagian kursus</h2></div><button type="button" class="ite-settings-close" aria-label="Tutup pengaturan">✕</button></header><div class="ite-settings-scroll"><p>Pilih bagian yang ingin ditampilkan. Bagian yang dinonaktifkan akan dilewati dalam alur belajar.</p><div class="ite-settings-list">${sections.map(([id,title,description])=>`<label class="ite-settings-row"><span><strong>${title}</strong><small>${description}</small></span><input type="checkbox" name="${id}" role="switch"><span class="ite-settings-state" aria-hidden="true"></span></label>`).join('')}</div><p class="ite-settings-fixed"><strong>Selalu aktif:</strong> sampul, kuis akhir (2 soal), dan hasil. Nilai LMS tetap berasal dari kuis akhir.</p><p class="ite-settings-note">Pilihan tersimpan di browser/perangkat ini. Menyimpan perubahan memulai ulang alur belajar dan mengosongkan jawaban pada tampilan saat ini. Nilai yang sudah dikirim ke LMS tidak dihapus.</p><p class="ite-settings-error" role="alert"></p></div><footer><button type="button" class="ite-settings-default">Tampilkan semua</button><div><button type="button" class="ite-settings-cancel">Batal</button><button type="submit" class="ite-settings-save">Simpan & mulai ulang</button></div></footer></form>`;
 document.body.append(dialog);
 function update(){dialog.querySelectorAll('input').forEach(input=>{input.closest('label').querySelector('.ite-settings-state').textContent=input.checked?'Tampil':'Sembunyi';});}
 let opener;
 api.open=()=>{opener=document.activeElement;sections.forEach(([id])=>{dialog.querySelector(`[name="${id}"]`).checked=api.enabled(id);});dialog.querySelector('.ite-settings-error').textContent='';update();document.querySelector('.iv-video')?.pause();document.dispatchEvent(new Event('ite-settings-open'));dialog.showModal();dialog.querySelector('.ite-settings-close').focus();};
 dialog.addEventListener('close',()=>{document.dispatchEvent(new Event('ite-settings-close'));opener?.focus({preventScroll:true});});
 dialog.addEventListener('change',update);
 dialog.querySelectorAll('.ite-settings-close,.ite-settings-cancel').forEach(button=>button.onclick=()=>dialog.close());
 dialog.querySelector('.ite-settings-default').onclick=()=>{dialog.querySelectorAll('input').forEach(input=>{input.checked=true;});update();};
 dialog.querySelector('form').onsubmit=event=>{event.preventDefault();const next=Object.fromEntries(sections.map(([id])=>[id,dialog.querySelector(`[name="${id}"]`).checked]));if(sections.every(([id])=>next[id]===values[id])){dialog.close();return;}try{localStorage.setItem(key,JSON.stringify(next));}catch(_){dialog.querySelector('.ite-settings-error').textContent='Pengaturan belum tersimpan. Izinkan penyimpanan browser, lalu coba lagi.';return;}window.location.reload();};
})();

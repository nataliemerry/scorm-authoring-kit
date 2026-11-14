# Dua pilot SCORM LCM — 14 November 2026

Cakupan: **C01 Smart Budgeting** dan **C12 Cybersecurity Challenge**. Tema aktif **LCM Scenes Sort Paragraphs Forward**. ZIP di `dist_scorm/` merupakan ekspor aktual melalui antarmuka resmi eXeLearning 4.0.6 yang dijalankan lokal; preview berasal dari ZIP yang sama. Folder proyek lain memuat draf lama.

## Coba dan unggah

Buka `preview/C01/index.html` atau `preview/C12/index.html`. Jika browser membatasi berkas lokal, dari akar proyek jalankan `python -m http.server 8874 --bind 127.0.0.1 --directory exelearning/pilot/preview`, lalu buka http://127.0.0.1:8874/C01/ atau C12. Preview tidak mengirim nilai ke GOJAGS.

Unggah ZIP SCORM 1.2 yang sesuai dari `dist_scorm/` ke LMS; jangan unggah dev-preview sebagai ekspor.

## Alur saat ini

Sampul → 3 materi dan cek pemahaman → 2 situasi → Find the words → Drag the Words → Sort the Paragraphs → kasus DnD → 2 soal native → pembahasan → hasil.

- Materi menjelaskan konsep, menampilkan sumber per paragraf dan daftar rujukan, lalu contoh simulasi melalui Lihat contoh.
- Dua situasi masing-masing mempunyai dua tindakan, akibat langsung dan pilihan yang tersimpan saat kembali.
- Find the words: lima istilah di grid 10×10. Sisi petunjuk awal hanya makna dan jumlah huruf; istilah muncul setelah ditemukan/dibuka dengan bantuan. Ulangi menyembunyikannya kembali.
- Drag the Words: tiga kalimat rumpang, empat pilihan termasuk satu pengecoh; periksa, kembalikan kata, urungkan, ulangi dan bantuan.
- Sort the Paragraphs: empat paragraf yang diacak; pegangan seret, tombol Naik/Turun, keyboard Enter/Spasi dan panah, Esc untuk membatalkan; periksa, urungkan, ulangi dan bantuan.
- Ketiga aktivitas tambahan opsional dan tidak menambah skor. Tombol lanjut Find the words membuka Drag the Words; lanjut dari sana membuka Sort the Paragraphs; lanjut berikutnya membuka kasus wajib.
- Kasus C01: klasifikasi usulan, token anggaran 70/30 dan revisi 90/10 plus keputusan cadangan bertahap. Kasus C12: klasifikasi bukti dan urutan tiga tindakan aman dengan dua pengecoh. Semua biaya/kasus adalah simulasi.

Materi dan cek pemahaman, pilihan pada kedua situasi, serta kasus yang benar-benar diperiksa harus tuntas sebelum kuis. Setiap interaksi seret memiliki alternatif ketuk/keyboard. Bantuan tidak dianggap sebagai penyelesaian mandiri; Ulangi memulai kembali aktivitas.

## Tampilan dan pencatatan

Logo BPS CorpU transparan asli berada di kiri atas bersama judul. Header sisi lain hanya fullscreen. Font Bricolage Grotesque dan Source Sans 3 dibundel dengan lisensi OFL. Isi/tombol ≥16px, keterangan ≥14px; teori 22/20px. Isi panjang digulir, bukan diperkecil.

Tiga gambar topik dan satu lencana per kursus dibundel offline; tujuh ilustrasi unik di kedua pilot dibuat melalui GPT Images. Logo adalah ekstraksi asli dari Peraturan BPS No. 4 Tahun 2026, Lampiran II, halaman PDF 14, bukan hasil generasi. Prompt topik ada di asset_prompts.json; prompt lencana di docs/asset_prompts.json dari akar proyek; provenance logo ada di assets/branding/bps-corpu-source.json.

Awalnya tanpa batas waktu. Opsi 120 detik dimulai sesudah teori, tampil di kontrol bawah dan tidak memaksa pindah tahap/mengirim jawaban kosong ketika habis. Hanya dua soal native memberi raw 0/50/100. Dengan passScore=0, kedua soal dijawab → passed, termasuk nilai nol; belum lengkap → incomplete. GOJAGS langsung, resume lintas sesi dan pemberian XP/Trophy belum diklaim terverifikasi.

## Sumber dan penyuntingan

Materi aktif: data/pilot_lessons.sourced.json; registry: data/pilot_references.json. Rujukan primer OECD, NIST dan Microsoft diparafrasakan dalam bahasa Indonesia; [pemetaan klaim dan bagian sumber](../../docs/pilot_sources_verified.md) mencatat pemeriksaan 13 November 2026. Tanggal itu adalah catatan historis, bukan verifikasi otomatis untuk topik baru. Rujukan daring opsional; runtime/aset tersedia offline.

Narasi, review dan kuis: data/course_experiences.humanized.humanized.json. Situasi berada di experience.humanized.js. Tambahan aktivitas memakai data/pilot_word_search.json, data/pilot_drag_words.json, data/pilot_sort_paragraphs.json. Sumber Python/JS/CSS aktif berakhiran .humanized untuk mempertahankan versi sebelumnya; load_humanized.py memilihnya. Jangan mengedit preview/generated ZIP sebagai sumber utama.

Pola H5P menjadi rujukan interaksi saja; runtime H5P dan contoh kota/buah/rutinitas pagi tidak dibundel. Catatan referensi ada di docs/{word_search,drag_words,sort_paragraphs}_reference.json.

## Build, ekspor dan QA

1. `python scripts/build_exelearning_pilots.py` menyiapkan dua `.elpx`.
2. `python scripts/prepare_pilot_dev_preview.py` menyiapkan dev-preview dan tema ZIP; memerlukan beautifulsoup4. Ini belum ekspor platform.
3. Di eXeLearning Online: Styles → Imported → unggah/pilih LCM_Scenes_Theme.zip; File → Open → pilih `.elpx`; periksa Preview.
4. File → Export as → SCORM 1.2. Salin hasil unduhan asli ke dist_scorm dan ekstrak ke preview. Gunakan nama tema unik saat isinya berubah agar editor tidak memakai cache lama.
5. `python scripts/validate_exelearning_pilots.py` memeriksa struktur, sumber daya, font, logo dan kecocokan preview/ekspor.
6. `npm ci --prefix scripts/qa`, lalu `node scripts/qa/simple-experience-check.cjs` menjalankan QA browser Chrome terisolasi dan LMS tiruan. `--dev` menguji area pengembangan; hasil akhir selalu diuji lagi tanpa flag itu.

Laporan/screenshot ada di qa/. Perubahan topik harus memperbarui solusi dan assertion baseline, bukan menghapusnya agar tes lulus. Panduan agent lengkap berada di paket scorm-exe-scenes yang menyertai starter.

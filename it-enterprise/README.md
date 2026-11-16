# IT Enterprise

Kursus mikro untuk Pranata Komputer kategori keahlian dan pengelola layanan digital instansi. Peserta menelusuri permintaan tabel yang tersendat saat serah terima, lalu merancang uji coba pelacakan lintas unit dan menentukan cara menilai hasilnya.

## Berkas

- [Paket SCORM 1.2](exelearning/pilot/dist_scorm/IT_Enterprise_SCORM12.zip) untuk diunggah sebagai satu ZIP ke LMS.
- [Proyek .elpx](exelearning/pilot/sources/ITE_IT_Enterprise.elpx) untuk dibuka dan disunting di eXeLearning. Jika muncul tawaran memasang tema, pilih **Yes**.
- [Tema terpisah](exelearning/pilot/LCM_IT_Enterprise_Theme.zip) untuk dipasang lewat **Styles → Imported** bila diperlukan.
- [Pratinjau](exelearning/pilot/preview/ITE/index.html) adalah hasil ekstraksi dari ZIP SCORM.
- [Brief kursus](course-brief.json), [pemetaan sumber](SUMBER.md), dan [log ilustrasi](asset-prompts.json). Master PNG serta WebP ada di folder assets.
- [Laporan alur dan penilaian](exelearning/pilot/qa/simple-experience-report.json) dan [integritas paket](exelearning/pilot/qa/ITE-structure-report.json).

## Alur

Sampul, tiga bagian teori dengan sumber dan contoh, cek pemahaman, video asli pengguna berdurasi 7 menit 44 detik dengan audio dan lima pertanyaan, dua situasi dengan konsekuensi, Find the Words dengan arah kiri ke kanan atau atas ke bawah dan petunjuk huruf awal per soal, Drag the Words, Sort the Paragraphs, image hotspot tiga komponen, question set tiga pertanyaan latihan, kasus drag-and-drop dua tahap, dua soal Form native, pembahasan, dan hasil. Ketiga latihan kata/paragraf opsional. Kasus harus selesai sebelum kuis. Timer dua menit bersifat opsional dan tidak mengirim kuis secara otomatis.

Empat ilustrasi awal dipertahankan. Sebelas aset tambahan dibuat melalui image_gen: sepuluh kartu kasus dan satu gambar hotspot. Seluruhnya dipaketkan secara lokal bersama master PNG dan WebP. Logo asli BPS CorpU serta font Bricolage Grotesque dan Source Sans 3 mengikuti kit.

## Ekspor dan pemeliharaan

Paket diekspor melalui **File → Export as → SCORM 1.2** di antarmuka resmi eXeLearning 4.0.6. Distribusi statis resmi dijalankan pada server lokal karena akses browser terhubung sedang nonaktif. Paket unduhan digunakan langsung sebagai keluaran.

Untuk mengedit melalui eXeLearning buka .elpx. Untuk mengubah template di tingkat sumber, sesuaikan data ITE dan skrip terkait, jalankan `python scripts/build_exelearning_pilots.py`, lalu ekspor ulang melalui eXeLearning. Brief merupakan catatan editorial. Builder membaca berkas di data/ dan modul authoring. Jalankan `python scripts/validate_it_enterprise.py` untuk memeriksa paket dan preview. QA browser memakai Playwright dan Chrome. Jalankan `npm ci --prefix scripts/qa` lalu `node scripts/qa/simple-experience-check.cjs`.

Pengujian nilai menggunakan LMS tiruan. Dua soal terjawab mencatat skor 0, 50, atau 100 dan status passed sesuai ambang nol pada kit. Satu soal kosong mempertahankan status incomplete. Integrasi langsung dengan GOJAGS belum diuji.

## Kesesuaian template terbaru

Diperiksa ulang pada 16 November 2026 terhadap **LCM-2026-11-15-unified**. CSS, logo, font lokal, tiga permainan, kompatibilitas Form dan review mengikuti baseline terbaru; materi, ilustrasi, kasus dan kunci tetap khusus IT Enterprise. Pengujian aktual desktop/mobile, mouse/sentuh/keyboard, timer, incomplete dan skor 0/50/100 lulus. Bukti: [template-alignment-report.json](exelearning/pilot/qa/template-alignment-report.json). Salinan pada folder kerja lama juga diselaraskan dengan proyek repo ini.

## Video dan kuis aktif — 16 November 2026

Video diganti dengan berkas pengguna **Juliandra Ariiq K - IT Enterprise (Compressed).mp4**, durasi 7 menit 44 detik. MP4 asli disalin tanpa pengodean ulang; audio dipertahankan. Poster diambil dari detik 110 video yang sama. Lima pertanyaan berada pada 2:40 (strategi), 3:42 (tata kelola), 4:40 (enterprise architecture), 5:45 (gap analysis), dan 7:05 (monitoring/pembiayaan). Ringkasan materi video merupakan parafrasa, bukan transkrip kata demi kata.

Tiga pertanyaan latihan konsep serta dua soal akhir diselaraskan dengan isi video. Soal akhir mencakup klasifikasi eliminated dan SLA. Video dan question set tetap formatif; hanya dua soal Form native yang menghasilkan nilai LMS 0/50/100. Timer dua menit opsional dimulai sesudah video agar tidak habis saat peserta menonton.

Konfigurasi: data/enhanced_interactions.json. Pemetaan jawaban dan sumber: video-quiz-source-map.json. Provenance dan SHA-256 video: media-provenance.json. Generator scripts/build_learning_video.py hanya untuk prototipe lama dan menolak mengganti video aktif pengguna. Berkas besar disimpan melalui Git LFS; jalankan git lfs pull setelah clone.

Fullscreen video mengikuti lebar dan tinggi layar dengan object-fit:contain; batas 1000px/54vh hanya untuk tampilan biasa. Panel pertanyaan dan kontrol ikut menyesuaikan. Pengujian menggunakan Fullscreen API sebenarnya pada desktop 1918×1080 dan viewport ponsel 390×844.

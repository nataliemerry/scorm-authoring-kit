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

Sampul, tiga bagian teori dengan sumber dan contoh, cek pemahaman, dua situasi dengan konsekuensi, Find the Words dengan arah kiri ke kanan atau atas ke bawah dan petunjuk huruf awal per soal, Drag the Words, Sort the Paragraphs, kasus drag-and-drop dua tahap, dua soal Form native, pembahasan, dan hasil. Ketiga latihan kata/paragraf opsional. Kasus harus selesai sebelum kuis. Timer dua menit bersifat opsional dan tidak mengirim kuis secara otomatis.

Keempat ilustrasi baru dibuat melalui ImageGen dan dipaketkan secara lokal. Logo asli BPS CorpU serta font Bricolage Grotesque dan Source Sans 3 mengikuti kit.

## Ekspor dan pemeliharaan

Paket diekspor melalui **File → Export as → SCORM 1.2** di antarmuka resmi eXeLearning 4.0.6. Distribusi statis resmi dijalankan pada server lokal karena akses browser terhubung sedang nonaktif. Paket unduhan digunakan langsung sebagai keluaran.

Untuk mengedit melalui eXeLearning buka .elpx. Untuk mengubah template di tingkat sumber, sesuaikan data ITE dan skrip terkait, jalankan `python scripts/build_exelearning_pilots.py`, lalu ekspor ulang melalui eXeLearning. Brief merupakan catatan editorial. Builder membaca berkas di data/ dan modul authoring. Jalankan `python scripts/validate_it_enterprise.py` untuk memeriksa paket dan preview. QA browser memakai Playwright dan Chrome. Jalankan `npm ci --prefix scripts/qa` lalu `node scripts/qa/simple-experience-check.cjs`.

Pengujian nilai menggunakan LMS tiruan. Dua soal terjawab mencatat skor 0, 50, atau 100 dan status passed sesuai ambang nol pada kit. Satu soal kosong mempertahankan status incomplete. Integrasi langsung dengan GOJAGS belum diuji.

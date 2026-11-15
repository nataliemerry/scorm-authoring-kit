# Hasil integrasi SCORM kit — 15 November 2026

Integrasi berangkat dari `3bb2d70fd2e48331b9de2b6a3d859809f5ad87a5`, delapan commit riwayat, starter lokal/terpasang, dan 179 berkas IT Enterprise. Inventaris awal tidak diubah; hasil keputusan ada pada `MERGE-FILE-RESULT.csv` dan `MERGE-FEATURE-RESULT.csv`.

## Rekonsiliasi berkas

Seluruh **2.004 entri** mempunyai keputusan dan identitas akhir: 1.604 tetap identik, 80 digabung, 209 dihasilkan ulang, satu dipindahkan tanpa mengubah byte, dan 110 hanya dipertahankan sebagai riwayat. Tidak ada entri tanpa keputusan. Identik pada berkas teks memperbolehkan normalisasi CRLF/LF Git; SHA-256 byte akhir dicatat terpisah.

110 berkas riwayat adalah dependensi Classify/jquery-ui dalam preview yang tidak lagi disertakan ekspor eXe resmi. Mengembalikannya ke preview akan membuat preview berbeda dari ZIP. Blob asli tetap tersedia pada commit dasar dan bundle cadangan. Paket Cybersecurity lama yang terselip pada direktori rilis Statistik Sektoral disimpan utuh di `kursus-statistik-sektoral/archive/pre-merge/`; paket Statistik Sektoral aktif tetap ada.

Pemeriksaan terhadap blob Git memastikan 868 entri media/font tetap identik. Video Pengelolaan Data berukuran 231.079.280 byte sesuai SHA-256 pointer LFS asli `0784bd305f3e9764c2caa79ed1a931bfe3784677042cfc97bb6fceb44a9c9a50`. Ilustrasi, master PNG, WebP, crest transparan, font dan lisensi sumber dipertahankan. Tidak ada klaim gambar baru dibuat dalam pekerjaan merge ini.

Cadangan sebelum perubahan berada di workspace induk `docs/audits/scorm-kit-2026-11-15/`: bundle seluruh ref Git, kit lokal, skill terpasang, ZIP distribusi lama dan skrip packager asli. Audit dan rencana sebelum eksekusi ikut disimpan pada `pre-merge-audit/` di repository ini. Bundle lokal bukan bagian distribusi skill.

## Koreksi yang digabung

1. Sumber baseline kini berada di `authoring/baseline`, IT Enterprise di `it-enterprise`. Builder rilis mengambil sumber repo, sehingga workspace lama tidak lagi menjadi input pengemasan tanpa sengaja.
2. Seed dibersihkan dari engine adegan yang sebelumnya ikut terpasang dua kali. Review jawaban dan CSS yang sebelumnya hanya tersimpan pada hasil tema dipindahkan ke sumber authoring. Build dua kali tidak melipat engine.
3. Review memilih node soal native tingkat atas; node nested sebelumnya membuat status soal kedua salah meskipun skor benar. QA kini memeriksa jumlah status benar sesuai skor, selain nilai LMS.
4. Kompatibilitas teks Form dipasang melalui `form-compat.js` pada tema karena ekspor UI dapat mengganti runtime bawaan seed. Data internal Form tetap disembunyikan. Pengumuman fase lama dibersihkan saat transisi.
5. Tombol solusi kasus dari repo dipertahankan dan diadaptasi ke tahap IT Enterprise. Bantuan permainan tetap dipisahkan dari jawaban mandiri; grading hanya mempunyai satu pemilik per profil.
6. Ekstensi video/hotspot/question set dilengkapi dokumentasi, contoh tervalidasi, mirror dan starter. Retry menghapus registry hasil lama; video berhenti saat diselesaikan. Contoh hotspot tidak lagi meminta jumlah jawaban benar yang mustahil dicapai.
7. Renderer khusus Pengelolaan Data dipertahankan. Metadata Text untuk blok kuis diperbaiki agar runtime eXe tidak membentuk selector `#` yang tidak valid.
8. Scope QA baseline kembali hanya C01/C12; S01, Statistik Sektoral dan IT Enterprise diuji pada proyek masing-masing. Laporan lama diarsipkan, laporan baru menyebut mode dan hash ZIP yang benar-benar diuji.
9. Skill canonical, mirror `.agents`, adapter Claude/Antigravity, instruksi proyek, kit lokal dan skill Codex terpasang diselaraskan. Starter versi `LCM-2026-11-15-unified` memuat 311 berkas; jumlahnya berasal dari manifest, bukan angka tetap dalam packager.
10. Git mempertahankan byte sumber baseline/IT Enterprise dan preview ekspor untuk mencegah perubahan line ending merusak pembandingan setelah checkout.

## Bukti pengujian

| Kelompok fitur | Bukti yang dijalankan |
|---|---|
| F01–F18: tampilan/alur/teori/aktivitas/kasus/Form/review/timer | `exelearning/pilot/qa/simple-experience-report.json` beserta screenshot pada empat proyek native; desktop/mobile, mouse/touch/keyboard, incomplete dan skor 0/50/100 |
| F07–F11: permainan dan petunjuk | QA alur di atas; `contract-report.json` memeriksa arah maju, jarak dan perpotongan C01/C12/ITE; validator bundle meliputi kontrak permainan |
| F19–F20: rebuild/scope | `rebuild-report.json`: bootstrap kosong, dua build, satu initializer dan engine sama dengan ekspor; QA baseline tidak membutuhkan S01 |
| F21–F23: ekstensi | `enhanced-report.json`: media MP4 asli, metadata/empat marker, keyboard seek/volume, hotspot salah/benar/retry, question set blank/0/50/100/reset dan LMS tidak aktif |
| F24: aset | `merge-result.json`, pemeriksaan blob Git/LFS serta laporan struktur masing-masing paket; provenance lama tetap bertanggal asli |
| F25/F27: kursus native | Delapan `.elpx` dibangun lalu diekspor melalui UI resmi eXeLearning 4.0.6; `export-provenance.json` dan laporan struktur/QA per proyek |
| F26: Pengelolaan Data | `pengelolaan-data-report.json`: teori, empat pertanyaan video, dua situasi, navigasi permainan opsional, hotspot dan kuis 0/50/100 pada desktop/mobile |
| F28–F29: skill/distribusi | quick_validate, verify_bundle, manifest 311 SHA-256, bootstrap, perbandingan setiap anggota ZIP distribusi dan byte mirror; `local-sync-report.json` |
| F30: riwayat | 2.004 keputusan dalam CSV, 30 keputusan fitur, cadangan lokal dan riwayat Git asli |

Semua delapan preview identik dengan file dalam ZIP hasil ekspor asli. Tema JS/CSS sumber cocok dengan ekspor; manifest SCORM 1.2 mempunyai satu SCO, font/OFL dan aset lokal tersedia. QA aktual hanya dianggap berlaku selama hash ZIP cocok dengan `tested_artifacts`. Laporan kontrak lama tetap tersedia sebagai riwayat; laporan itu tidak diberi tanggal ulang sebagai pengujian baru.

## Batas bukti dan pemeliharaan

LMS diuji melalui mock API SCORM, belum pada GOJAGS langsung. Pengelolaan Data diberikan sebagai ekspor datar tanpa `.elpx` khusus kursus; tidak diklaim diekspor ulang melalui UI. Referensi materi/provenance gambar dipertahankan dengan tanggal verifikasi sebelumnya, bukan diklaim diteliti ulang. Decoder teks diuji terhadap isi kursus yang tersedia, bukan seluruh kemungkinan input HTML. Pengujian otomatis mencakup perilaku yang disebutkan dalam laporan; pemeriksaan estetika manusia tetap mempunyai ruang penilaian.

Perubahan berikutnya dilakukan pada sumber proyek yang sesuai. Jalankan build, ekspor aktual, pemeriksaan struktur dan QA; kemudian perbarui starter, laporan rilis, mirror dan distribusi. `release_scorm_kit.py --starter` menolak baseline yang hash ekspornya tidak cocok dengan bukti QA. `sync_local_installations.py` menolak berkas target tambahan yang belum ditinjau. Hindari mengekstrak starter lama di atas sumber repo.

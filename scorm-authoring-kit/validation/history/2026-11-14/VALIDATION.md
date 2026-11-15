# Validasi kit SCORM LCM

Audit paket: **14 November 2026**. Tema baseline: **LCM Scenes Sort Paragraphs Forward**. Dua kursus: C01 Smart Budgeting dan C12 Cybersecurity Challenge. Laporan mesin akhir ada di `validation/kit-audit.json`.

## Hasil yang sudah dijalankan

| Pemeriksaan | Hasil dan bukti |
|---|---|
| Skill Creator | quick_validate lulus, dijalankan dengan Python UTF-8 |
| Integritas starter | Seluruh 351 berkas cocok dengan SHA-256 pada starter-manifest |
| Portabilitas | Bootstrap ke direktori kosong di luar workspace asli, lalu build kedua `.elpx` berhasil |
| Sumber dan ekspor | Dua `.elpx`, dua SCORM asli dan tema membawa ketiga aktivitas tambahan serta logo; JS tema cocok byte-per-byte |
| Paket SCORM | SCORM 1.2, satu SCO per kursus, file manifest lengkap, dua font dan OFL, empat WebP per kursus plus logo asli RGBA; preview cocok dengan ekspor |
| Brief contoh | Materi, kuis dan tiga data aktivitas cocok dengan data C12 di starter; validator lulus |
| Sumber materi | Registry dan pemetaan klaim dibundel; tanggal verifikasi historis 13 November 2026 dipertahankan |
| Batas pengiriman kuis | Satu soal belum dijawab menahan pengiriman dan status tetap incomplete; tidak ada skor baru |
| Nilai 100 | C01, dua jawaban benar, native Form mengirim raw 100 dan passed |
| Nilai 0 | C12, dua jawaban salah dalam percobaan baru, raw 0 dan passed sesuai passScore=0 |
| Nilai 50 | C12, satu benar/satu salah dalam percobaan baru, raw 50 dan passed |
| Timer | 120 detik tidak memaksa perpindahan tahap, menghapus pekerjaan atau mengirim kuis kosong |
| Input dan layout | Mouse, sentuh asli, ketuk/keyboard, state/undo/reset, bantuan dan gerbang kasus lulus; desktop 1600×1100, uji pendek 1536×674, ponsel 390×844 |

Laporan runtime utama: `validation/template-smoke-report.json`, berasal dari `node scripts/qa/simple-experience-check.cjs` terhadap **ekspor aktual**. Laporan struktur: `validation/template-structure-report.json`. Screenshot ada di starter pada `exelearning/pilot/qa/`.

## Cakupan ketiga aktivitas

- **Find the words:** lima target/grid diperiksa; jawaban tersembunyi saat mulai dan saat memakai petunjuk huruf awal; arah kanan/bawah, penolakan arah terbalik/diagonal, petunjuk huruf awal per soal, mouse dan sentuh, dua titik, keyboard panah/Enter/Esc, temuan duplikat, bantuan tanpa kredit mandiri, ulangi yang menyembunyikan jawaban dan lanjut opsional lulus. Papan muat di scroller pada layar pendek tanpa fokus menggeser halaman luar.
- **Drag the Words:** kosong/salah/benar, mouse/touch/keyboard, kata pengganti tidak menghilangkan token, pengembalian, urungkan, ulangi, bantuan yang tetap tercatat dan lanjut ke Sort the Paragraphs lulus. Tidak mengubah skor LMS.
- **Sort the Paragraphs:** mouse/touch, Naik/Turun, Space/Enter/panah, Esc memulihkan urutan sebelum pengambilan, urungkan, empat posisi/tiga sambungan benar, bantuan/ulangi dan lanjut ke kasus lulus. Tidak mengubah skor LMS.
- **Kasus asli:** klasifikasi, alokasi/revisi atau penyusunan tindakan, alternatif input, urungkan dan prasyarat kuis tetap lulus.

Laporan kontrak negatif pada folder validation mencatat penolakan sitasi tidak sah, target salah, duplikasi, urutan tak lengkap/tidak diacak dan skema aktivitas yang tidak valid. Validator brief juga menolak petunjuk yang menyebut target kata. Kebenaran fakta dan mutu narasi tetap membutuhkan pembacaan sumber serta tinjauan manusia/agent.

## Yang tidak diklaim

Pengujian ini tidak membuktikan kepatuhan aksesibilitas menyeluruh, semua browser/perangkat, seluruh kemungkinan interleaving input, atau seluruh skenario LMS. Belum ada uji langsung GOJAGS, konfirmasi XP/Trophy, suspend/resume lintas sesi, maupun uji pemanggilan tool browser/gambar dari setiap agent lain. Sumber tidak otomatis diverifikasi ulang pada tanggal audit kit.

Acceptance.md menetapkan pemeriksaan untuk kursus baru, termasuk viewport tambahan dan verifikasi sumber baru. Jangan menyamakan checklist yang diwajibkan dengan bukti yang sudah dijalankan. File H5P dicatat sebagai referensi pola interaksi; runtime, pustaka dan contoh aslinya tidak dibundel.

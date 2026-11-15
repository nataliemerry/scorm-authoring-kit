# Validasi kit SCORM LCM

Tanggal: **15 November 2026**. Versi: **LCM-2026-11-15-unified**. Sumber rilis: `authoring/baseline` pada repository; starter memuat C01 dan C12. Laporan mesin: `validation/kit-audit.json`.

| Pemeriksaan | Hasil / bukti |
|---|---|
| Starter | 311 berkas dengan SHA-256, bootstrap kosong dan dua build; satu initializer setiap engine |
| Ekspor aktual | 8 ZIP melalui UI resmi eXeLearning 4.0.6, bukan ZIP dev-preview |
| Sumber dan preview | Tema sumber cocok dengan ekspor; semua berkas preview identik dengan anggota ZIP; manifest 1 SCO SCORM 1.2 |
| Alur kursus | C01/C12 baseline, Statistik Sektoral, S01 dan IT Enterprise: desktop/mobile, input mouse/sentuh/keyboard, materi, situasi, tiga permainan, kasus, timer dan review |
| Penilaian | Native Form: incomplete, 0/50/100; pilihan peserta, kunci, status benar/salah dan pembahasan; dua soal tidak dihitung ganda |
| Ekstensi | Video asli beserta empat marker, seek/volume keyboard; hotspot salah/benar/retry; question set blank, 0/50/100, retry registry dan LMS tidak aktif |
| Pengelolaan Data | Player khusus dipertahankan; video/hotspot/kuis desktop-mobile dan pencatatan melalui mock API SCORM |
| Aset | Logo asli transparan, font lokal dan OFL, ilustrasi/master asli; video Git LFS tetap dipertahankan |
| Dokumen | Aturan profil, grading, adaptasi topik, generator aset, sumber dan adapter Codex/Claude/Antigravity diselaraskan |

Laporan 14 November disimpan di `validation/history/2026-11-14`; laporan kontrak lama di sana merupakan bukti historis. Kontrak terbaru dan pengujian penolakan input tidak valid ada pada `contract-report.json`. Ekspor terakhir dan hash paket tercatat pada `export-provenance.json` dan laporan struktur tiap proyek. Paket hanya dapat dirilis bila hash ekspor sama dengan yang diuji.

Batas bukti: pengujian LMS menggunakan mock API, belum pada GOJAGS langsung. Pengelolaan Data tersedia sebagai hasil ekspor datar; tidak ada `.elpx` khusus kursus yang diberikan, sehingga tidak diklaim dibangun ulang melalui UI. Referensi materi dan provenance gambar yang sudah ada dipertahankan dengan tanggal aslinya.

**Rencana merge menyeluruh kit SCORM — 15 November 2026**

Rencana ini disusun dari audit delapan commit sampai 3bb2d70fd2e48331b9de2b6a3d859809f5ad87a5. Pelaksanaan dirancang bertahap agar setiap perubahan dapat dilacak, diuji, dan dipulihkan secara terpisah.

Dokumen pendamping tersedia di folder yang sama.

- LAPORAN-AUDIT.md memuat temuan dan penyebab yang telah direproduksi.
- audit-evidence.json memuat hash, riwayat isi starter, dan hasil rebuild.
- MERGE-FILE-INVENTORY.csv mencatat 2.004 entri file beserta asal, identitas awal dan tindakan yang direncanakan.
- MERGE-FEATURE-LEDGER.csv mencatat 30 kelompok fitur yang wajib diperiksa.
- MERGE-INVENTORY-SUMMARY.json mencatat jumlah dan commit dasar.

Status awal seluruh item ledger adalah pending. Pencatatan inventory tidak dianggap sebagai bukti bahwa suatu item telah berhasil digabung.

**Tujuan hasil akhir**

Satu sumber authoring yang dapat membangun kursus secara konsisten, dengan seluruh fitur dari GitHub dan pekerjaan lokal yang masih relevan. Starter, tema, proyek editabel, ekspor, preview, skill agent dan ZIP distribusi harus berasal dari kandidat rilis yang sama.

Keberhasilan dinilai melalui penutupan setiap entri inventory dan fitur, hasil build dari folder kosong, serta pengujian terhadap ZIP ekspor. Jumlah file boleh berubah mengikuti integrasi aset tambahan. Angka 351 dipertahankan sebagai catatan baseline historis, bukan syarat jumlah file release berikutnya.

**Cakupan sumber**

| Sumber | Jumlah entri awal | Perlakuan |
| --- | --- | --- |
| Repo pada 3bb2d70 | 1.762 | Titik dasar history, tiga proyek kursus dan dua salinan skill |
| Paket IT Enterprise terbaru | 179 | Masukkan sebagai proyek kursus tersendiri dengan konten/aset dan hasil edit terbaru |
| Kit lokal lama | 32 | Pembanding sumber dan dokumentasi, kemudian salinan distribusi turunan |
| Skill Codex terpasang | 19 | Pembanding dan sasaran sinkronisasi setelah kandidat diterima |
| Sumber/packager workspace asal yang relevan | 12 | Port helper dan perubahan unik setelah perbandingan semantik |

Entri lintas salinan memang dapat berisi file yang sama. Keduanya tetap dicatat agar sumber dan sasaran penggabungannya dapat ditelusuri. Isi historis starter dan perubahan antarcommit juga diperiksa melalui audit-evidence.json.

**Aturan pelaksanaan**

- Pertahankan seluruh commit yang telah ada. Lakukan perbaikan pada branch dan worktree khusus, misalnya integration/scorm-kit-unified.
- Setiap keputusan file diberi status merged, preserved-identical, regenerated atau historical-only, beserta sumber, alasan, hash akhir, dan bukti pengujiannya. File yang benar-benar perlu dihapus diberi keputusan eksplisit beserta lokasi penggantinya.
- Periksa perubahan per fungsi dan per fitur. Perlakukan ZIP dan .elpx sebagai arsip yang perlu dibuka, dibandingkan, dan dibangun kembali.
- Konten, kunci jawaban, sumber teori, aset, dan kebijakan penilaian tiap kursus dipertahankan selama perubahan teknis bersama dipadukan.
- Jika pengujian menemukan konflik, kerjakan diagnosis pada kandidat tersebut sampai hasilnya jelas sebelum menerbitkan artefak turunan.
- Fetch ulang sebelum memulai. Jika remote telah maju, catat commit tambahan dan tambahkan semua perubahannya ke inventory sebelum merge berlanjut.

**Tahap 1 — bekukan titik awal dan siapkan pemulihan**

1. Periksa status working tree dan branch. Simpan setiap perubahan lokal yang sudah ada sebagai snapshot teridentifikasi sebelum operasi integrasi.
2. Catat HEAD, remote, hash semua starter, tema, ekspor, .elpx, file discovery dan ZIP distribusi.
3. Buat cadangan repo/history serta salinan input lokal, skill terpasang, dan kit distribusi. Catat keberadaan objek Git LFS dan hash video sebenarnya secara terpisah dari pointer LFS.
4. Buat branch/worktree integrasi dari commit dasar yang telah dikonfirmasi.
5. Tambahkan audit dan ledger ke kandidat agar alasan setiap penggabungan menyertai riwayatnya.

Hasil tahap ini adalah snapshot yang bisa dipulihkan dan baseline inventory terverifikasi. LFS dan file lokal yang belum pernah masuk Git harus bisa ditemukan kembali dari cadangan.

**Tahap 2 — tetapkan sumber utama dan peta turunan**

Rancangan lokasi yang diusulkan adalah sebagai berikut.

| Lokasi pada repo integrasi | Peran |
| --- | --- |
| authoring/baseline/ | Sumber C01/C12 yang diekstrak dari starter repo dan diselaraskan dengan perbaikan terbaru |
| scorm-authoring-kit/scorm-exe-scenes/ | Skill canonical, referensi, validator, contoh brief dan aset ekstensi |
| .agents/skills/scorm-exe-scenes/ | Mirror hasil sinkronisasi dari skill canonical |
| kursus-statistik-sektoral/ | Sumber/konten/output khusus Statistik Sektoral |
| perancangan-kegiatan-statistik/ | Sumber/konten/output khusus S01 |
| pengelolaan-data/ | Sumber/konten/media/output khusus Pengelolaan Data |
| it-enterprise/ | Proyek IT Enterprise dari workspace lokal |
| Jalur lokal lama dan skill global | Sasaran distribusi yang diperbarui setelah release lulus |

Lokasi authoring/baseline/ dan it-enterprise/ adalah pilihan implementasi yang diusulkan dalam rencana. Saat dijalankan, migrasi path harus diperiksa terhadap loader Python, asset paths, helper QA, dokumentasi, dan import eXe.

Catat relasi sumber → theme → .elpx → export → preview untuk setiap profil. Buat proses packaging memakai path repo yang eksplisit. Skrip dari workspace lama perlu dipindahkan/diperbaiki agar sumber rilis dapat dilacak dari checkout yang sama.

**Tahap 3 — pulihkan authoring dan bersihkan seed**

Kerjakan ini lebih dahulu karena duplikasi engine merusak hasil build dan pengujian berikutnya.

1. Ekstrak fungsi review dari tema d271f48 ke scene.humanized.js. Pindahkan seluruh CSS review yang bersesuaian ke sumber CSS.
2. Pertahankan applySolution dari 3687d2c pada challenge.humanized.js. Cocokkan penanganan sort, sequence, budget dan revision.
3. Inventarisasi patch native Form pada decoder HTML, penyembunyian data, CSS/runtime dan metadata.
4. Rekonstruksi seed native bersih dengan mempertahankan patch Form yang diperlukan. Pisahkan engine adegan, game, dan kode khusus topik dari seed.
5. Rakit keenam engine dari sumber satu kali melalui builder. Periksa penutup DOMContentLoaded, urutan dependency dan kesiapan native Form.
6. Pertahankan konfigurasi serta resource eXe yang dibutuhkan importer, manifest, font, logo dan gambar.
7. Bangun C01/C12 dari folder kosong. Periksa tepat satu header, footer, initializer per engine, serta instance runtime yang diharapkan.
8. Bangun sekali lagi dari sumber yang sama dan periksa bahwa kode/instance tidak bertambah. Timestamp atau ID native yang berubah dievaluasi terpisah dari struktur dan perilaku.

Hasil tahap ini wajib menghilangkan reproduksi dua header/footer dan mempertahankan decoder, data internal tersembunyi, tombol jawaban kasus dan review baru.

**Tahap 4 — rekonsiliasi seluruh fitur baseline**

Gunakan F01–F20 pada feature ledger sebagai daftar pemeriksaan per fitur.

- Cocokkan sampul, narasi, penghapusan catatan simulasi sampul, sumber dan teori terhadap instruksi pengguna.
- Pertahankan logo BPS CorpU asli, font lokal/OFL, ukuran teks, fokus keyboard, fullscreen, dan timer.
- Pertahankan tiga materi, cek pemahaman dan dua situasi dengan pilihan yang bertahan saat navigasi.
- Periksa data Find the Words dari kedua contoh dan ITE, termasuk arah kanan/bawah, satu kemunculan, hint awal, pembeda bantuan, jarak filler dan perpotongan interior.
- Pertahankan Drag the Words dan Sort the Paragraphs, termasuk touch/keyboard, Esc, undo, replacement, bantuan, retry dan lanjut opsional.
- Periksa seluruh jenis kasus dan kunci jawaban. Dokumentasikan perilaku bantuan pada kasus wajib sesuai baseline terbaru sebelum memakai statusnya pada gate kuis.
- Uji native Form pada skor 0, 50, 100, satu soal kosong, seluruh soal kosong, navigasi balik, ulangi dan timer habis.
- Cocokkan review dengan pilihan peserta, kunci, feedback, dan status yang sebenarnya. Periksa teks yang mengandung HTML dan karakter literal.
- Catat setiap penyesuaian yang diperlukan untuk mendukung konfigurasi topik lama.

Untuk kebijakan bantuan kasus, rencana mempertahankan perilaku yang diperkenalkan pada repo. Perubahan syarat kelulusan atau perlakuan nilai perlu dicatat sebagai keputusan produk tersendiri.

**Tahap 5 — integrasikan tambahan Pengelolaan Data**

Pertahankan video interaktif, hotspot dan question set sebagai profil ekstensi terdokumentasi.

1. Cocokkan aset enhanced-interactions terhadap implementasi yang dipakai kursus Pengelolaan Data, termasuk markup dan selector yang diperlukan.
2. Tambahkan panduan, skema konfigurasi, validasi data, contoh pemakaian, dependency dan cara memasukkannya ke tema/resources.
3. Pastikan ekstensi ikut ke skill mirror serta tersedia dari bootstrap, atau disediakan lewat langkah pemasangan yang jelas dan diuji.
4. Pertahankan profil baseline dengan Form native. Jelaskan penggunaan profil question set agar satu aktivitas tidak dinilai dua renderer sekaligus.
5. Uji registry/policy/client SCORM question set, jawaban kosong, retry, status, skor, dan kegagalan persist.
6. Uji video lokal, marker/waktu pertanyaan, seek, pause/resume, keyboard, fullscreen, serta syarat lanjut yang dipakai kursus.
7. Uji hotspot beserta fallback tombol dan validitas required terhadap jumlah area benar.
8. Cocokkan video aktual dengan pointer dan objek LFS, poster, sumber, izin/provenance yang sudah tersedia, serta subtitle/transkrip jika ada.

Hasil tahap ini membuat aset baru dapat ditemukan agent dan dipasang sesuai profil dengan kontrak yang eksplisit.

**Tahap 6 — padukan keempat proyek kursus**

Kerjakan per kursus agar kesalahan satu topik dapat dilacak.

| Kursus | Hal yang harus dipertahankan | Verifikasi khusus |
| --- | --- | --- |
| Statistik Sektoral | Materi/rujukan, istilah, kasus ROMANTIK dan kunci khusus topik | Tidak kembali menjadi konten Cybersecurity dari cabang C12 bawaan |
| S01 | Konten, data sampling/perancangan, aset, solusi dan kunci S01 | QA S01 berada pada proyek yang menyediakan S01 |
| Pengelolaan Data | Video asli, hotspot, renderer, soal dan alur khususnya | Media offline dan satu pemilik penilaian |
| IT Enterprise | Judul/deskripsi terakhir, empat ilustrasi GPT Images, sumber dan kasus layanan statistik | Semua latihan, hint dan tiga perpotongan. ARSITEKTUR/KEBIJAKAN tetap berjarak |

Gunakan 179 file paket authoring ITE sebagai batas awal materi yang telah dikurasi. Bandingkan kembali dengan folder kerja untuk menemukan perubahan lokal tambahan sebelum impor. Arsip/preview historis disimpan untuk pembanding visual dan pemulihan.

Perbaikan runtime bersama diterapkan pada sumber tiap proyek sesuai profil. Setelah itu, setiap output yang terdampak dibangun dan diekspor ulang. Catat versi eXe, cara ekspor, dan hash unduhan yang digunakan.

**Tahap 7 — perbaiki cakupan QA dan kaitkan bukti ke versi**

1. Baseline starter mandiri menjalankan C01/C12. Proyek S01 menyediakan kasus QA S01. Pengelolaan Data dan ITE menjalankan QA sesuai kontennya.
2. Tambahkan pemeriksaan untuk regresi yang sudah ditemukan, terutama seed berisi engine, initializer/DOM ganda, QA mengacu kursus yang hilang, source/output berbeda, dan file discovery hilang.
3. Periksa perubahan yang sudah memiliki pengujian dengan memperbarui assertion seperlunya.
4. Setiap laporan menyebut commit sumber atau identitas kandidat, hash artefak yang diuji, perintah, lingkungan/browser, hasil dan keterbatasan.
5. Pertahankan laporan lama sebagai bukti historis dengan identitas versinya. Jalankan ulang untuk memperoleh bukti kandidat.
6. Jika platform LMS langsung tidak tersedia, sebutkan hasil mock LMS dan cakupan yang masih perlu diuji pada LMS nyata.

Matriks release minimum mencakup desktop, layar desktop pendek, ponsel 390×844, mouse, sentuhan, keyboard, alur lengkap, semua bantuan/ulangi, native score/status, video/hotspot bila dipakai, serta tidak adanya error JavaScript.

**Tahap 8 — uji kandidat dari folder kosong dan ekspor asli**

Urutan verifikasi kandidat harus mencakup seluruh jalur berikut.

1. Validasi brief dan referensi skill.
2. Bootstrap ke folder kosong di luar checkout sumber.
3. Build .elpx dan tema dari authoring yang dibundel.
4. Periksa engine satu kali dan jalankan dev QA.
5. Import .elpx/tema ke eXeLearning, ekspor format yang ditentukan profil, lalu ambil ZIP yang benar.
6. Ekstrak preview dari ZIP itu dan cocokkan setiap file terhadap arsip.
7. Jalankan QA pada hasil ekspor, bukan hanya dev-preview.
8. Periksa manifest, SCO, resource lokal, logo, font, lisensi, media dan path.
9. Ulangi jalur kursus/profil yang terdampak setelah setiap perbaikan baru.

Kegagalan pada salah satu langkah mengembalikan kandidat ke sumber fitur terkait. Artefak hasil build yang belum lolos tetap berstatus kandidat.

**Tahap 9 — rakit release dan sinkronkan semua salinan**

1. Bangun starter.zip dari sumber authoring yang sudah lulus.
2. Buat starter-manifest.json dari isi sebenarnya. Perbarui versi release dan nama tema untuk menghindari cache tema lama.
3. Cocokkan konfigurasi materi/game dari source, .elpx, ekspor dan brief.
4. Perbarui SKILL.md, 11 panduan yang ada serta panduan tambahan, adapter lintas agent, contoh brief dan instruksi discovery.
5. Sinkronkan file-set dan isi byte ke .agents/skills/scorm-exe-scenes.
6. Jalankan bootstrap serta verifier dari kedua salinan skill.
7. Perbarui VALIDATION, audit, dan laporan dengan bukti kandidat yang benar.
8. Bangun ZIP distribusi dan checksum SHA-256. Periksa anggota ZIP dan setiap isinya terhadap sumber release.
9. Setelah kandidat diterima, sinkronkan kit lokal dan skill global dari release yang sama. Catat backup serta hash sebelum/sesudah.
10. Verifikasi lagi discovery/path pada Codex, Antigravity dan Claude Code sesuai kemampuan yang tersedia. Pisahkan verifikasi berkas/instruksi dari uji eksekusi agent yang benar-benar dijalankan.

**Tahap 10 — tutup ledger, review diff dan siapkan commit**

Setiap baris inventory harus memiliki keputusan akhir. Pada saat pelaksanaan, tambahkan kolom target_path, final_identity, decision_reason dan evidence. Feature ledger harus memuat hasil uji dan identitas artefaknya.

Lakukan review akhir terhadap semua file yang ditambah, berubah, dipindah dan dihapus, termasuk isi arsip. Bandingkan konten topik/soal/aset asli terhadap hasil merge. Entri yang identik dapat ditutup dengan hasil hash yang cocok.

Simpan commit per perubahan yang dapat ditinjau, misalnya pemulihan sumber/seed, pengujian, integrasi ekstensi, impor ITE, dan release/distribusi. Urutan persis mengikuti dependency pengujian. Siapkan ringkasan diff, hasil QA, serta batas uji platform untuk review.

Integrasi tidak dianggap selesai selama ada item pending yang belum dijelaskan. Push atau penggabungan ke main dilakukan sesuai permintaan pelaksanaan pengguna dan kondisi remote saat itu.

**Syarat penerimaan akhir**

- [ ] Seluruh entri inventory memiliki keputusan dan lokasi akhir atau alasan historis yang dapat diperiksa.
- [ ] Seluruh F01–F30 mempunyai bukti hasil atau hambatan spesifik yang dinyatakan.
- [ ] Rebuild dari bootstrap bersih menghasilkan satu header/footer dan satu initializer per engine.
- [ ] Review, decoder HTML, data internal tersembunyi dan tombol jawaban kasus bertahan setelah rebuild.
- [ ] Semua permainan dan gate sesuai profil lulus.
- [ ] Starter mandiri menguji kursus yang benar-benar disertakan.
- [ ] Video/hotspot/question set dapat ditemukan dan diuji sesuai profilnya.
- [ ] Konten dan aset keempat proyek kursus terlacak ke input awal.
- [ ] Preview cocok dengan ekspor, manifest lengkap dan media tersedia offline.
- [ ] Skill canonical, mirror, installed dan distribusi cocok dengan release yang sama.
- [ ] Laporan mengacu hash artefak terbaru dan hasilnya dapat direproduksi.
- [ ] Backup, riwayat keputusan dan prosedur pemulihan tersedia.

**Pemulihan jika ada kegagalan**

Kembalikan kandidat ke checkpoint sebelum tahap yang gagal melalui worktree/commit atau snapshot terkait. Pemulihan skill global/kit lokal memakai backup salinan yang dicatat. ZIP release dipulihkan bersama manifest dan laporan versinya agar bukti tidak terpisah dari paket. Perubahan sumber yang telah terbukti benar dipertahankan di branch integrasi dan diagnosis dicatat pada ledger.

**Hasil yang akan diserahkan setelah pelaksanaan**

Sumber authoring terpusat, skill canonical dan mirror, starter/manifest terbaru, tema dan sumber editabel, paket ekspor serta preview kursus yang terdampak, aset dan provenance, laporan QA, ZIP distribusi beserta checksum, serta ledger yang sudah ditutup dengan alasan dan bukti.

Rencana ini menyiapkan tahapan pelaksanaan. Pada saat penyusunan rencana, HEAD repo masih 3bb2d70 dan working tree tetap bersih.

# SCORM authoring kit

Repository sumber untuk template adegan eXeLearning BPS Corporate University, skill lintas agent, dan empat proyek kursus.

| Folder | Isi |
| --- | --- |
| authoring/baseline | Sumber baseline C01/C12 untuk membangun ulang starter |
| scorm-authoring-kit | Skill canonical, panduan, manifest dan starter portabel |
| .agents/skills/scorm-exe-scenes | Mirror canonical untuk discovery agent |
| kursus-statistik-sektoral | Kursus Penguatan Statistik Sektoral |
| perancangan-kegiatan-statistik | Kursus S01 dan baseline pendukungnya |
| pengelolaan-data | Paket Pengelolaan Data dengan video/hotspot/question set |
| it-enterprise | Proyek IT Enterprise beserta sumber, aset dan ekspor |
| docs/integration | Audit, keputusan merge, bukti ekspor dan QA |

Baca scorm-authoring-kit/README.md dan scorm-authoring-kit/scorm-exe-scenes/SKILL.md sebelum membuat kursus. Perubahan engine baseline dilakukan pada authoring/baseline, kemudian starter dan mirror dihasilkan dari sumber itu.

## Perintah pemeliharaan

Jalankan Python 3 dan Node/Chrome. Dependensi QA tersedia pada authoring/baseline/scripts/qa/package.json. Instal dengan npm ci --prefix authoring/baseline/scripts/qa. Untuk helper QA di root, sertakan folder node_modules tersebut pada NODE_PATH sesuai shell Anda.

Bangun sumber dengan menjalankan scripts/build_exelearning_pilots.py dari folder proyek. scripts/prepare_pilot_dev_preview.py menyiapkan dev-preview. Jalankan QA proyek dengan --dev, kemudian ekspor melalui eXeLearning dan jalankan QA tanpa --dev.

scripts/export_exelearning_ui.cjs mengoperasikan antarmuka aplikasi resmi eXeLearning yang tersedia pada EXELEARNING_URL. Nilai lokal bawaan adalah http://127.0.0.1:8876/. Aplikasi eXeLearning harus berjalan sebelum perintah ini dipakai. Skrip menerima path proyek relatif repo.

python scripts/verify_projects.py --extract memeriksa ekspor dan mengekstrak preview yang sama persis. python scripts/release_scorm_kit.py --starter memperbarui starter serta mirror. Setelah laporan rilis selesai, gunakan --distribution untuk menghasilkan ZIP distribusi dan SHA-256.

## Aturan integrasi

Pertahankan patch Form pada form-compat.js dan aturan penyembunyian data pada scene.css. Seed native menyimpan resource eXe dasar. Builder menambahkan engine adegan sekali. Review jawaban berada di sumber scene.humanized.js/CSS sehingga dapat dibangun ulang.

Baseline memakai dua soal Form native. Profil video/hotspot/question set dijelaskan di references/enhanced-interactions.md pada skill. Setiap kursus memilih satu renderer yang memiliki penilaian akhir.

Git LFS dipakai untuk MP4 serta arsip sumber, SCORM, dan paket authoring IT Enterprise yang besar. Jalankan git lfs pull setelah clone jika media masih berupa pointer. Paket Pengelolaan Data yang disediakan berbentuk folder ekspor dengan renderer khusus, dan dipertahankan sebagai input yang diuji. Sumber editabel khusus kursus itu belum disediakan.

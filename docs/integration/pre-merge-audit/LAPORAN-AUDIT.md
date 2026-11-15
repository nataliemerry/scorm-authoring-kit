**Audit perubahan kit SCORM — 15 November 2026**

Audit mencakup delapan commit pada checkout Git, dari b99d612 sampai 3bb2d70, dua salinan skill di dalam repo, kit lama di workspace, skill Codex pengguna, ZIP distribusi, dan isi starter.zip. Saya juga mengekstrak starter terbaru ke direktori sementara, menjalankan builder dan pembuat dev-preview, lalu membuka hasilnya melalui Chrome headless. Repo Git diperiksa bersih sebelum dan setelah audit.

**Kesimpulan**

Dugaan ketidaksinkronan terbukti. Riwayat delapan commit yang tersedia memperlihatkan pembaruan bertahap terhadap starter. Seluruh versi tetap berisi 351 berkas, tanpa penghapusan anggota ZIP dan tanpa berkas yang kembali persis ke hash versi lebih lama setelah sempat berubah.

Masalah yang teridentifikasi adalah penyebaran perubahan yang tidak lengkap antarlapisan, seed yang sudah berisi engine hasil rakitan, salinan lokal yang tertinggal, serta bukti QA yang masih berasal dari versi lama. Efeknya bisa terlihat seperti perubahan “ketimpa” saat membangun kursus baru atau berpindah agent.

Git mencatat snapshot dan diff. Git tidak menunjukkan siapa menyalin folder melalui Explorer atau apa maksud agent ketika mengganti ZIP. Karena itu, audit ini mengidentifikasi kejadian dan risiko berdasarkan isi yang dapat diperiksa.

**1. Kritis — build ulang starter terbaru menghasilkan engine ganda**

Commit d271f48 memasukkan engine adegan lengkap ke theme/style.js dalam exelearning/seed/components.elpx. Seed itu sebelumnya belum memiliki engine adegan. Pada HEAD, seed memuat satu initializer header, engine kasus, dan Find the Words.

Builder masih mengambil theme/style.js dari seed, lalu menambahkan scene.humanized.js, challenge.humanized.js, experience.humanized.js, word-search.js, drag-words.js, dan sort-paragraphs.js. Kode penggabungan terdapat pada scripts/build_exelearning_sources.py sekitar baris 175–176.

Saya menguji jalur pemakaian normal di folder sementara.

1. Bootstrap starter terbaru.
2. Jalankan python scripts/build_exelearning_pilots.py. Perintah berhasil membuat dua .elpx.
3. Jalankan python scripts/prepare_pilot_dev_preview.py. Perintah berhasil.
4. Buka C12 melalui server lokal dan hitung elemen DOM.
5. Jalankan skrip QA bawaan dengan --dev.

Hasil build C01 dan C12 masing-masing memiliki dua initializer adegan, dua initializer kasus, dan dua initializer Find the Words. Browser C12 menghasilkan dua .scene-chrome dan dua .scene-bottom. Skrip QA bawaan gagal dengan pesan strict mode violation karena locator .scene-chrome menemukan dua elemen.

Perbaikan review pada d271f48 perlu dipertahankan. Bagian yang perlu dipulihkan adalah pemisahan sumber engine dari seed native. Engine sebaiknya dipasang sekali oleh builder. Memasukkan ulang seluruh tema hasil rakitan ke seed sambil mempertahankan penggabungan lama menghasilkan duplikasi.

Bukti disimpan di evidence/build_exelearning_sources.py, evidence/exported-theme-style.js, evidence/rebuild-qa-failure.json, serta audit-evidence.json.

Batas hasil uji ini adalah dev-preview yang dibuat ulang dari starter terbaru. Paket SCORM historis yang saat ini tersimpan memiliki satu initializer, sehingga temuan ini membuktikan regresi pada proses rebuild.

**2. Tinggi — perubahan review kuis belum menjadi sumber authoring**

d271f48 menambahkan status jawaban peserta, pilihan peserta, kunci jawaban, dan pembahasan pada review. Fungsi review dan kelas CSS terkait ada di tema ZIP, .elpx yang dibundel, ekspor, preview, serta seed.

Namun exelearning/pilot/scene.humanized.js dalam starter masih sama dengan b99d612 dan belum memiliki fungsi review baru. exelearning/pilot/scene.css juga belum memiliki kelas .scene-review-badge, sementara tema hasil rakitan memilikinya.

Saat ini fitur bertahan karena engine lengkap ikut tersimpan dalam seed. Ini menciptakan ketergantungan yang tidak tercatat pada panduan implementasi. Jika seseorang mengganti seed dengan seed native bersih, lalu membangun dari sumber JS/CSS yang dianggap resmi oleh panduan, review baru akan hilang.

Yang perlu dipertahankan adalah logika dan gaya review dari d271f48. Logika itu perlu diturunkan ke sumber scene.humanized.js dan CSS authoring, kemudian dipakai untuk membangun tema dan ekspor. Mengganti seluruh seed atau sumber authoring dari salah satu versi saja berisiko menghilangkan bagian lain.

Bukti sumber lama ada di evidence/scene.humanized.js dan evidence/scene.css. Implementasi baru ada di evidence/exported-theme-style.js, fungsi review sekitar baris 168–222, serta evidence/exported-theme-style.css.

**3. Tinggi — kit lama, skill Codex, dan ZIP distribusi masih berada pada starter awal**

Lokasi-lokasi berikut sudah saya cocokkan.

| Lokasi | SHA-256 starter.zip | Kondisi |
| --- | --- | --- |
| scorm-authoring-kit-repo/scorm-authoring-kit/scorm-exe-scenes | b89012c7afb5b39fc52f909e68c836581f819837ebc809efbc98383988a9e6d9 | Versi repo setelah d271f48 |
| scorm-authoring-kit-repo/.agents/skills/scorm-exe-scenes | b89012c7afb5b39fc52f909e68c836581f819837ebc809efbc98383988a9e6d9 | Starter sama dengan kit repo |
| scorm-authoring-kit/scorm-exe-scenes | 118998a9f7e474e0aef58b3064a7e2690ce2f81bbca3c21a7c6982fc5b044dc2 | Identik dengan starter pada commit awal b99d612 |
| C:/Users/Pusdiklat/.codex/skills/scorm-exe-scenes | 118998a9f7e474e0aef58b3064a7e2690ce2f81bbca3c21a7c6982fc5b044dc2 | Starter lama |
| Starter di dalam SCORM_LCM_Template_Agent_Kit.zip di root workspace | 118998a9f7e474e0aef58b3064a7e2690ce2f81bbca3c21a7c6982fc5b044dc2 | Distribusi lama |

Dengan demikian, agent yang membaca kit dari checkout repo memperoleh versi berbeda dari agent yang memanggil skill Codex global atau menerima ZIP distribusi lama.

Saat menghubungkan GitHub, saya membuat checkout terpisah. Pull memperbarui checkout itu. Salinan kit di folder lama, skill Codex global, dan ZIP distribusi tidak ikut diperbarui otomatis. Ini menjelaskan perbedaan tanpa perlu mengasumsikan adanya revert Git.

Yang belum ada pada starter lama mencakup tombol jawaban kasus dari 3687d2c, perbaikan HTML dari dc1e234/0d43f62, penyembunyian data Form, serta review dari d271f48. Aturan arah, hint, dan perpotongan Find the Words sudah ada pada kedua generasi starter.

Skrip packaging lama di workspace mengambil sumber dari workspace utama. Jika dijalankan kembali sebelum sumber itu diselaraskan, ZIP yang dihasilkannya akan berasal dari sumber lama tersebut. Menyalin hasil itu ke repo berisiko menimpa perbaikan baru.

**4. Tinggi — QA starter membawa ketergantungan S01 yang tidak dibundel**

Pada 0d43f62, scripts/qa/simple-experience-check.cjs di starter mendapat cabang S01. Loop desktop memuat C01, C12, dan S01. Loop ponsel juga memuat S01.

Starter tetap berisi katalog C01/C12, builder hanya membangun C01/C12, dan tidak ada satu pun berkas dengan S01 pada path anggota ZIP. Preview S01 juga tidak tersedia. Karena itu, QA dari starter mandiri akan mencoba membuka kursus yang tidak dibundel.

Ini tampak seperti perubahan dari proyek perancangan-kegiatan-statistik yang ikut terbawa ketika memperbarui starter umum. Dukungan dan pengujian S01 perlu dipertahankan pada proyek kursus tersebut. Untuk baseline C01/C12, daftar kasus QA harus sesuai dengan kursus yang benar-benar tersedia, atau S01 dibundel secara lengkap jika cakupannya memang diubah.

Pada rebuild yang diuji, QA sudah gagal lebih awal akibat engine ganda. Ketergantungan S01 merupakan kegagalan terpisah yang tetap perlu dibereskan setelah duplikasi engine ditangani.

Bukti ada di evidence/simple-experience-check.cjs sekitar baris 163–183, evidence/data/courses_catalog.json yang disalin sebagai evidence/courses_catalog.json, dan audit-evidence.json bagian starter_checks.

**5. Sedang — tiga aset interaksi baru belum masuk ke jalur skill yang dibaca agent**

3bb2d70 menambahkan tiga berkas pada scorm-authoring-kit/scorm-exe-scenes/assets/enhanced-interactions.

- enhanced-interactions.js
- enhanced-interactions.css
- enhanced-interactions.example.json

Berkas ini menyediakan video interaktif, image hotspot, dan question set dengan integrasi registry/policy SCORM.

Ketiganya belum ada pada .agents/skills/scorm-exe-scenes, belum ada di starter.zip, dan belum dirujuk oleh SKILL.md, implementation-map, acceptance, atau content-schema. Semua berkas yang sama-sama ada pada dua salinan skill di repo memiliki isi yang cocok setelah normalisasi newline. Selisih file-set di repo adalah tiga aset baru tersebut.

Fitur baru masih ada pada Git dan perlu dipertahankan. Penyebaran dan dokumentasinya belum selesai. Agent yang mengikuti instruksi root untuk membaca .agents/skills tidak akan menemukan aset baru melalui jalur yang diarahkan itu.

Question set baru juga mendaftarkan aktivitas penilaian melalui window.exeScorm12, sedangkan kontrak baseline masih menetapkan dua soal Form native sebagai sumber nilai. Sebelum dipakai sebagai bagian template umum, profil baru ini memerlukan keputusan cakupan dan pengujian penilaiannya. Audit ini tidak menyatakan profil baru menggantikan baseline secara otomatis.

**6. Sedang — laporan QA dan audit belum mengikuti snapshot keluaran**

Laporan exelearning/pilot/qa/simple-experience-report.json di dalam starter mempunyai hash yang sama sejak b99d612 hingga HEAD. Laporan itu mendahului penambahan tombol jawaban kasus, perbaikan data Form, dan review kuis baru.

Ukuran ekspor yang dicatat structure-report.json juga berbeda dari paket saat ini.

| Kursus baseline | Ukuran pada laporan | Ukuran ZIP pada starter HEAD |
| --- | --- | --- |
| C01 | 1.526.801 byte | 1.516.739 byte |
| C12 | 1.313.026 byte | 1.302.947 byte |

VALIDATION.md dan kit-audit.json masih berupa catatan audit 14 November yang ditambahkan pada commit awal. Versi manifest juga tetap LCM-2026-11-14-word-crossings meskipun hash ZIP sudah berubah beberapa kali.

Pemeriksaan checksum masih berguna untuk membuktikan bahwa arsip cocok dengan manifest. Namun hasil itu tidak membuktikan bahwa fitur terbaru telah diuji, bahwa build dapat direproduksi, atau bahwa skill global cocok dengan salinan repo.

Kedua verify_bundle.py di repo lulus saat audit ini. Keduanya memeriksa artefak tersimpan dan membandingkan tema pada sumber .elpx dengan ekspor. Pemeriksaan itu belum menjalankan build dari sumber authoring dan belum mendeteksi engine ganda. Kebocoran ketergantungan S01 juga lolos.

Yang perlu dipertahankan adalah bukti QA historis dengan label versi yang sesuai. Bukti release terbaru perlu mencatat hasil uji terhadap output terbaru dan hasil rebuild, sehingga klaimnya tidak terbawa dari snapshot lama.

**7. Riwayat tombol jawaban kasus menunjukkan penyebaran terlambat**

3687d2c mengubah challenge.humanized.js dalam starter untuk menambahkan tombol Tampilkan jawaban dan fungsi applySolution. Pada commit itu, .elpx, tema ZIP, preview, dan ekspor baseline di dalam starter belum membawa tombol yang sama.

Pada dc1e234 dan 0d43f62, tombol masih belum ada pada engine ekspor baseline. Baru pada d271f48 tombol terlihat pada tema, sumber .elpx tersimpan, ekspor, dan seed.

Dengan demikian, antara 3687d2c dan sebelum d271f48, fitur ada pada sumber JS tetapi belum tampak pada baseline siap pakai. Ini menjelaskan mengapa membaca file sumber dan membuka contoh SCORM bisa memberi kesan yang berbeda.

Yang perlu dijaga adalah fungsi jawaban dari 3687d2c, bersamaan dengan engine dan paket hasil penggabungan yang konsisten. Tombol ini mengisi solusi lalu meminta pemeriksaan. Kode ini tidak mempunyai state assisted seperti ketiga latihan opsional. Apakah bantuan pada kasus wajib boleh memenuhi gate kuis perlu ditegaskan dalam kontrak. Perilaku itu sudah diperkenalkan bersama fitur dan audit ini tidak menganggapnya sebagai revert.

**8. Perbaikan HTML pernah hanya tersimpan pada output, kemudian dibawa ke seed**

dc1e234 menambahkan decoding &lt;, &gt;, dan &amp; pada getProcessTextSelectionQuestion di Form runtime, termasuk pada ekspor baseline dan preview. Pada commit tersebut, seed components.elpx masih belum memiliki patch decoder.

0d43f62 memasukkan patch itu ke seed. Ini perbaikan yang penting dipertahankan. Mengganti seed sekarang dengan versi sebelum 0d43f62 demi membersihkan engine ganda akan sekaligus berisiko menghilangkan perbaikan decoder dan penyembunyian data Form.

Pemulihan seed sebaiknya memisahkan perubahan native Form yang diperlukan dari engine kursus yang ditempel belakangan. Menyalin seluruh seed versi lama adalah pemulihan yang terlalu luas.

**Riwayat delapan commit**

| Commit | Perubahan yang relevan pada kit | Keadaan penyebaran |
| --- | --- | --- |
| b99d612 | Baseline awal, 351 file, word-search arah maju/hint/perpotongan | Menjadi sumber starter lokal/global yang masih dipakai |
| 3687d2c | Tombol jawaban kasus pada challenge.humanized.js | Artefak baseline belum mengikuti |
| dc1e234 | Decoder HTML Form pada ekspor/preview | Seed belum mengikuti pada commit ini |
| 4cc1e09 | Menambahkan kursus S01 | Starter kit tidak berubah |
| 8199d53 | Penyesuaian S01 | Starter kit tidak berubah |
| 0d43f62 | Menyembunyikan data Form, memperbarui runtime/seed | QA S01 ikut masuk ke starter dua kursus |
| d271f48 | Review jawaban/kunci/pembahasan | Engine lengkap ikut masuk seed. Sumber scene JS/CSS belum mengikuti |
| 3bb2d70 | Kursus Pengelolaan Data dan tiga aset interaksi | Aset tambahan hanya ada pada skill paket di repo |

**Perubahan yang harus dipertahankan saat menyatukan kembali kit**

| Bagian | Sumber yang menyimpan perubahan | Cara memadukannya |
| --- | --- | --- |
| Identitas, logo transparan, font lokal, teori bersumber, semua permainan dan gate native | Baseline b99d612 beserta sumber dan panduan | Jadikan fondasi tetap dan uji setelah setiap penggabungan |
| Find the Words arah kanan/bawah, hint, jarak, perpotongan interior | Panduan/validator/data yang tetap ada di HEAD | Pertahankan ketiga lapisan, lalu cocokkan konfigurasi dalam ekspor |
| Tombol Tampilkan jawaban kasus | 3687d2c, challenge.humanized.js | Pertahankan sumbernya, dokumentasikan bantuan, regenerasi tema/output |
| Decoder HTML Form | dc1e234 dan seed pada 0d43f62 | Pertahankan patch native saat membersihkan seed |
| Penyembunyian data Form | 0d43f62, CSS/runtime/seed | Pertahankan dan pastikan diterapkan lewat sumber yang jelas |
| Review pilihan peserta, status, kunci, pembahasan | d271f48, tema hasil rakitan | Pindahkan ke sumber scene JS/CSS, kemudian rakit engine sekali |
| Video, hotspot, question set | 3bb2d70, enhanced-interactions | Pertahankan aset, lengkapi profil/panduan/discovery dan QA |
| S01 dan Pengelolaan Data | Folder proyek kursus pada HEAD | Pertahankan di proyek masing-masing. Sesuaikan baseline dan QA berdasarkan cakupan yang dinyatakan |
| Hasil QA lama | Catatan pada kit | Pertahankan sebagai bukti historis, tambahkan hasil release baru |

**Urutan pemulihan yang disarankan**

1. Gunakan commit HEAD dan daftar hash audit sebagai titik acuan. Tentukan satu lokasi sumber utama di checkout repo.
2. Pindahkan implementasi review dan CSS barunya ke sumber authoring. Bersihkan engine kursus dari seed sambil mempertahankan patch Form.
3. Selaraskan isi QA starter dengan katalog dan output yang dibundel.
4. Tentukan profil untuk enhanced-interactions dan dokumentasikan integrasi penilaiannya.
5. Bangun dari direktori kosong, periksa satu header/footer, lalu ekspor dan jalankan QA pada paket terbaru.
6. Perbarui manifest, laporan audit, starter, dua salinan skill repo, skill terpasang, dan ZIP distribusi dari hasil yang sama.
7. Bandingkan isi antarsalinan dan jalankan pemeriksaan ulang sebelum commit/push.

**Hasil pemeriksaan yang tetap baik**

- Delapan commit masih dapat ditelusuri lengkap dan tidak ada revert persis ke konten lama pada anggota starter yang berubah.
- Arah kanan/bawah, hint dan aturan perpotongan Find the Words masih ada di HEAD.
- Logo, font, native Form, lima fase, dan ketiga aktivitas tambahan tetap dibundel.
- Dua starter ZIP di repo identik.
- Repo tetap bersih. Audit membuat berkas bukti di docs/audits/scorm-kit-2026-11-15 pada workspace luar checkout.

Audit ini merupakan analisis dan reproduksi masalah. Perubahan fungsional, sinkronisasi, commit, dan push belum dilakukan. Bukti mesin lengkap ada di audit-evidence.json. Rebuild dan pengujian browser dijalankan pada proyek sementara, sehingga artefak historis di repo tetap dapat diperiksa dalam kondisi semula.

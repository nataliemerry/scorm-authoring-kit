# SCORM LCM — template dan skill lintas agent

Versi acuan: **14 November 2026 · Sort the Paragraphs**. Template mandiri ini memakai dua pilot yang sudah disetujui: C01 Smart Budgeting dan C12 Cybersecurity Challenge. Tema aktif: **LCM Scenes Sort Paragraphs Forward**. Paket memuat implementasi, aset, sumber editabel, ekspor asli eXeLearning dan bukti pengujian.

## Alur yang harus dipertahankan

**Sampul → 3 materi bersumber → cek pemahaman → 2 situasi → Find the words → Drag the Words → Sort the Paragraphs → kasus drag-and-drop → 2 soal native → pembahasan → hasil.**

Tiga aktivitas tambahan selalu tersedia, tetapi boleh dilewati melalui tombol lanjut masing-masing. Peserta tetap harus menuntaskan materi, memilih tindakan pada dua situasi dan menyelesaikan kasus sebelum kuis. Nilai hanya berasal dari dua soal native: 0, 50, atau 100.

| Interaksi | Isi dan perilaku wajib |
|---|---|
| Materi | Teori dan konsep sebelum contoh; sumber primer per paragraf, daftar rujukan pada halaman yang sama; contoh jelas berlabel simulasi |
| Dua situasi | Dua pilihan tindakan, akibat langsung, pilihan tersimpan saat kembali |
| Find the words | Lima istilah, papan 10×10; kiri ke kanan atau atas ke bawah, dengan jarak antarkata kecuali pada perpotongan. Tiap soal memiliki petunjuk makna, jumlah huruf, dan tombol **Tunjukkan huruf awal**. Jawaban tampil setelah ditemukan atau diminta dan tersembunyi lagi saat **Ulangi** |
| Drag the Words | Tiga kalimat rumpang, empat pilihan termasuk satu pengecoh; seret/ketuk/keyboard, periksa, kembalikan kata, urungkan, ulangi dan bantuan |
| Sort the Paragraphs | Empat paragraf runtut yang awalnya diacak; pegangan seret, Naik/Turun, keyboard dan Esc untuk memulihkan; periksa, urungkan, ulangi dan bantuan |
| Kasus wajib C01 | Kelompokkan usulan → alokasikan token 70/30 → tangani perubahan menjadi 90/10 dan keputusan bertahap |
| Kasus wajib C12 | Kelompokkan bukti → susun tindakan aman dan sisakan pengecoh |

Pisahkan jalur kata dengan huruf pengisi. Buat setidaknya satu perpotongan tegak lurus pada satu huruf yang sama di bagian dalam kedua kata. Hindari jalur yang bersentuhan di ujung atau menempel sejajar. Petunjuk huruf awal hanya menyorot kotak pertama. Temuan berikutnya tercatat sebagai temuan dengan bantuan.

Semua aktivitas seret menyediakan alternatif yang dapat digunakan tanpa drag. Temuan atau jawaban yang dibuka lewat bantuan tidak dicatat sebagai penyelesaian mandiri. Bantuan pada Drag the Words/Sort the Paragraphs tetap ditandai sampai Ulangi.

## Desain dan narasi

Logo BPS CorpU asli transparan berada di kiri atas, di samping nama institusi/kursus. Sisi header lainnya hanya fullscreen. Tidak ada label permanen Mandiri/Tanpa batas waktu; timer opsional aktif berada di kontrol bawah. Font lokal: Bricolage Grotesque dan Source Sans 3. Isi/tombol minimal 16px, keterangan 14px; teori 22px desktop/20px ponsel. Gulir isi jika panjang, tanpa mengecilkan teks.

Gunakan bahasa Indonesia semi-formal, natural dan profesional. Aset topik mengikuti ilustrasi editorial 3D matte, petrol teal/sage/ivory dengan amber terbatas. Logo resmi tidak digenerasikan ulang. Sumber materi harus benar-benar dibaca dan dicocokkan dengan klaimnya; tanggal pemeriksaan contoh 13 November 2026 bukan tanggal otomatis untuk penelitian baru.

## Mulai dengan agent

1. Ekstrak ZIP ini; buka folder `scorm-authoring-kit` sebagai workspace atau berikan path sebenarnya kepada agent.
2. Minta agent membaca `scorm-exe-scenes/SKILL.md` dan referensi terkait.
3. Jalankan `python scorm-exe-scenes/scripts/bootstrap.py --output <folder-proyek-baru>`. Tujuan harus kosong/belum ada. Diperlukan Python 3.10+.
4. Untuk topik baru, isi brief dengan mengacu pada `assets/course-brief.example.json`, baca `references/content-schema.md`, lalu jalankan validator brief. Adaptasi data dan bagian kode khusus topik sesuai implementation map.
5. Build `.elpx`, uji development preview, impor tema/sumber di eXeLearning Online, ekspor SCORM 1.2, lalu uji ZIP aktual. Petunjuk rinci dan dependensi ada pada exe-workflow.

```text
Baca scorm-exe-scenes/SKILL.md beserta referensi yang relevan.
Buat SATU kursus bertopik [TOPIK] untuk [PESERTA], dengan tujuan [TUJUAN].
Simpan proyek baru di [FOLDER]. Pertahankan kode desain, font, logo,
komponen dan alur LCM. Gunakan profil kasus [budgeting/evidence-sequence].

Sertakan 3 materi teori bersumber primer terverifikasi dan sitasi per
paragraf, cek pemahaman, 2 situasi sederhana, Find the words berbasis
petunjuk (jawaban tidak ditulis di awal), Drag the Words, Sort the
Paragraphs, kasus drag-and-drop bertahap, 2 soal native, pembahasan dan hasil.
Tiga aktivitas tambahan opsional dan tidak menambah skor LMS.

Gunakan bahasa Indonesia semi-formal, natural dan profesional. Buat aset
bertopik relevan dengan tool image generation yang tersedia dan diizinkan;
catat prompt/provenance sebenarnya. Pertahankan logo asli. Jika tool
browser/gambar tidak tersedia, selesaikan persiapan dan sebutkan hambatannya.

Siapkan sumber .elpx, tema, aset/font lokal dan rujukan. Ekspor SCORM 1.2
melalui eXeLearning Online dan uji HASIL EKSPOR ASLI. Sertakan preview yang
cocok dengan ZIP, laporan QA dan screenshot. Jangan mengklaim ekspor,
verifikasi sumber atau integrasi LMS yang tidak benar-benar dilakukan.
```

## Codex, Claude Code, Antigravity dan agent lain

Di Codex, salin seluruh folder skill ke direktori skill pengguna, lalu panggil `$scorm-exe-scenes`. Versi di komputer pembuat juga disinkronkan ke `C:/Users/Pusdiklat/.codex/skills/scorm-exe-scenes/`; sesi baru mungkin diperlukan untuk memperbarui discovery.

Untuk Claude Code, Antigravity dan agent pembaca workspace lain, prompt/path di atas merupakan jalur portabel. `adapters/` menyediakan cuplikan instruksi untuk digabung ke instruksi proyek yang sudah ada, tanpa menimpanya. Mekanisme discovery dan tool berbeda menurut aplikasi/versi; paket ini tidak memasang tool/API key atau mengasumsikan setiap agent memiliki kemampuan Codex.

## Peta isi

Semua path berikut relatif terhadap `scorm-exe-scenes/`, kecuali adapter dan laporan tingkat paket.

| Berkas | Fungsi |
|---|---|
| `SKILL.md` | Instruksi utama dan pemilihan referensi |
| `references/course-contract.md` | Struktur konten, fase, kewajiban dan gate |
| `references/design-contract.md` | Tata letak, font, warna, logo dan responsivitas |
| `references/narrative-and-sources.md` | Gaya bahasa, verifikasi sumber, sitasi dan pemisahan simulasi |
| `references/asset-production.md` | Prompt, transparansi, produksi gambar, inspeksi dan provenance |
| `references/content-schema.md` | Seluruh field brief, lokasi data aktif dan aturan indeks |
| `references/implementation-map.md` | File aktif, percabangan C01/C12 dan adaptasi topik |
| `references/word-search.md` | Aturan Find the words dan petunjuk tanpa jawaban |
| `references/drag-words.md` | Kalimat rumpang dan pengelolaan kata/bantuan |
| `references/sort-paragraphs.md` | Urutan narasi, input alternatif, pembatalan dan bantuan |
| `references/exe-workflow.md` | Build sumber, development preview dan ekspor eXe aktual |
| `references/acceptance.md` | Pemeriksaan konten, UI, state, paket dan LMS |
| `assets/starter.zip` | Implementasi mandiri lengkap: data, kode, gambar, font/lisensi, seed, `.elpx`, tema, SCORM aktual, preview dan QA |
| `assets/starter-manifest.json` | SHA-256 setiap berkas starter dan archive |
| `assets/course-brief.example.json` | Contoh brief lengkap C12 dengan seluruh interaksi |
| `scripts/bootstrap.py` | Membuka starter ke tujuan kosong setelah pemeriksaan integritas |
| `scripts/validate_brief.py` | Memeriksa skema, sitasi, solusi, petunjuk dan aturan skor |
| `scripts/verify_bundle.py` | Memeriksa integritas, referensi dan kelengkapan fitur/ekspor |

Laporan saat ini: `VALIDATION.md`, `validation/template-smoke-report.json`, `validation/template-structure-report.json`, laporan pemeriksaan kontrak tiap interaksi, serta `validation/kit-audit.json`.

## Batas yang perlu diketahui

Template memiliki dua profil kasus konkret. Ia **bukan generator semua topik dari satu JSON**: situasi, heading dan beberapa umpan balik masih berada pada cabang Python/JS khusus C01/C12. Agent harus menyesuaikannya beserta QA. Bootstrap dan build tidak menjalankan ekspor platform secara otomatis.

Kode/font/aset yang disertakan menjaga identitas baseline. Gambar yang digenerasikan ulang dapat berbeda; prompt tidak menjamin piksel identik. Contoh H5P dipakai untuk pola interaksi, bukan disertakan sebagai runtime H5P. Native Form dan runtime SCORM tetap bawaan eXeLearning. Komponen pihak ketiga beserta lisensi font tetap mengikuti ketentuannya.

QA menggunakan browser terisolasi dan LMS tiruan. Peluncuran langsung di GOJAGS, XP/Trophy, resume lintas sesi, dan discovery otomatis di semua agent tidak diklaim sudah teruji. Daftar cakupan dan batas pengujian ada pada VALIDATION.md.

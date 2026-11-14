"""Multi-step drag-and-drop cases embedded in native eXe Text iDevices."""
import json

def challenge(cid):
    if cid=='C01':
        items=[
            dict(id='server',label='Pulihkan server',detail='70 unit · Pengumpulan data sedang terhenti.',image='scenes/C01-server.webp'),
            dict(id='room',label='Tata ruang rapat',detail='30 unit · Ruangan masih dapat digunakan.',image='scenes/C01-meeting.webp'),
            dict(id='backup',label='Siapkan cadangan data',detail='30 unit · Cadangan terakhir gagal dipulihkan.'),
            dict(id='workshop',label='Lokakarya tambahan',detail='20 unit · Dapat dijadwalkan bulan depan.')]
        config=dict(course=cid,steps=[
            dict(title='Pilih usulan yang perlu didanai sekarang.',intro='Dana tersedia 100 unit. Kelompokkan empat usulan berdasarkan kebutuhan yang perlu ditangani sekarang dan yang masih bisa ditunda.',kind='sort',items=items,zones=[dict(id='now',label='Danai sekarang',hint='Layanan dan data yang berisiko'),dict(id='later',label='Jadwalkan kemudian',hint='Masih dapat ditunda')],solution=dict(server='now',backup='now',room='later',workshop='later')),
            dict(title='Bagikan anggaran ke dua kebutuhan prioritas.',intro='Setiap token bernilai 10 unit. Alokasikan ke perbaikan server dan cadangan data. Jika pembagiannya belum pas, token masih bisa dipindahkan.',kind='budget',server=70,backup=30),
            dict(title='Biaya perbaikan server naik.',intro='Biaya server kini 90 unit, sedangkan anggaran tetap 100. Cadangan data bisa dimulai bertahap dengan 10 unit. Sesuaikan tokennya, kemudian pilih keputusan yang akan diajukan.',kind='revision',server=90,backup=10,items=[dict(id='stage',label='Cadangan dikerjakan bertahap',detail='10 unit sekarang, sisanya diusulkan pada tahap berikutnya.'),dict(id='extra',label='Tetapkan tambahan 20 unit',detail='Belum ada persetujuan tambahan anggaran.'),dict(id='delay',label='Tunda pemulihan server',detail='Pengumpulan data tetap terhenti.')])])
    else:
        config=dict(course=cid,steps=[
            dict(title='Pilah usulan kegiatan statistik di instansi.',intro='Ada lima usulan kegiatan pendataan. Kelompokkan mana yang tergolong statistik sektoral wajib rekomendasi dan mana yang bukan kewenangan sektoral instansi.',kind='sort',items=[
                dict(id='panen',label='Survei Panen Komoditas Pertanian Daerah',detail='Pendataan komoditas oleh dinas pertanian untuk evaluasi ketahanan pangan daerah.'),
                dict(id='sekolah',label='Pendataan Sarana Belajar Sekolah Daerah',detail='Pengumpulan data fasilitas pendidikan untuk perencanaan dinas pendidikan.'),
                dict(id='sensus',label='Sensus Penduduk Seluruh Indonesia',detail='Pencacahan seluruh populasi penduduk nasional yang merupakan kewenangan statistik dasar BPS.'),
                dict(id='pasar',label='Survei Pengguna Retribusi Pasar Daerah',detail='Pengumpulan data pelaku usaha pasar untuk kebutuhan kebijakan dinas perdagangan.'),
                dict(id='swasta',label='Riset Selera Konsumen Produk Swasta',detail='Survei pasar oleh korporasi bisnis untuk keperluan komersial internal perusahaan.')],zones=[dict(id='sektoral',label='Statistik Sektoral (Wajib Rekomendasi)',hint='Kegiatan instansi untuk tugas fungsinya'),dict(id='bukan_sektoral',label='Bukan Sektoral Instansi',hint='Kewenangan statistik dasar BPS atau khusus swasta')],solution=dict(panen='sektoral',sekolah='sektoral',pasar='sektoral',sensus='bukan_sektoral',swasta='bukan_sektoral')),
            dict(title='Susun alur pengajuan rekomendasi kegiatan statistik.',intro='Letakkan tiga langkah yang tepat dan terkoordinasi pada urutan 1–3. Dua tindakan yang berisiko tidak perlu dipindahkan.',kind='sequence',items=[
                dict(id='koordinasi',label='Koordinasi awal dan cek duplikasi',detail='Periksa metadata kegiatan pada Walidata dan BPS agar tidak terjadi tumpang tindih data.'),
                dict(id='romantik',label='Ajukan rancangan melalui ROMANTIK',detail='Unggah formulir permohonan rekomendasi dan dokumen pendukung ke aplikasi BPS.'),
                dict(id='tindaklanjut',label='Tindak lanjuti telaah dan terbitkan izin',detail='Sesuaikan metodologi jika ada catatan BPS hingga terbit surat rekomendasi resmi.'),
                dict(id='lapangan',label='Langsung cacah responden di lapangan',detail='Melaksanakan pengumpulan data tanpa telaah rekomendasi berisiko menyalahi aturan.'),
                dict(id='unggah',label='Unggah data mentah tanpa metadata',detail='Merilis angka tanpa definisi operasional melanggar prinsip Satu Data Indonesia.')],zones=[dict(id='first',label='1 · Persiapan & Koordinasi',hint='Langkah awal sebelum mengajukan permohonan'),dict(id='second',label='2 · Pengajuan Rekomendasi',hint='Penyampaian rancangan ke sarana resmi BPS'),dict(id='third',label='3 · Penyempurnaan Metodologi',hint='Tindak lanjut evaluasi sampai rekomendasi terbit')],solution={'koordinasi':'first','romantik':'second','tindaklanjut':'third','lapangan':'bank','unggah':'bank'})])
    data=json.dumps(config,ensure_ascii=False).replace('<','\\u003c').replace('content/resources/','{{context_path}}/')
    # Asset URLs are explicit HTML references so eXe registers and exports them.
    refs=''.join(f'<img class="dnd-image-ref" data-dnd-art="{name}" src="content/resources/{name}" alt="" hidden>' for name in (['scenes/C01-server.webp','scenes/C01-meeting.webp'] if cid=='C01' else ['scenes/C12-mail.webp','scenes/C12-lock.webp']))
    return f'<script type="application/json" class="dnd-config">{data}</script>{refs}<section class="dnd-challenge" aria-label="Tantangan kasus bertahap"><div class="dnd-workspace"></div><div class="dnd-status" role="status" aria-live="polite"></div></section>'

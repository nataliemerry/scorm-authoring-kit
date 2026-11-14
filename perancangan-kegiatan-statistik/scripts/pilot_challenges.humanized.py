"""Multi-step drag-and-drop cases embedded in native eXe Text iDevices."""
import json
from pathlib import Path

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
    elif cid=='S01':
        brief_data = json.load(open(Path(__file__).resolve().parents[1]/'course-brief.json', encoding='utf-8'))
        config = brief_data['practice']
        refs = '<img class="dnd-image-ref" data-dnd-art="scenes/S01-survey.webp" src="content/resources/scenes/S01-survey.webp" alt="" hidden><img class="dnd-image-ref" data-dnd-art="scenes/S01-sampling.webp" src="content/resources/scenes/S01-sampling.webp" alt="" hidden>'
        data = json.dumps(config, ensure_ascii=False).replace('<', '\\u003c').replace('content/resources/', '{{context_path}}/')
        return f'<script type="application/json" class="dnd-config">{data}</script>{refs}<section class="dnd-challenge" aria-label="Tantangan kasus bertahap"><div class="dnd-workspace"></div><div class="dnd-status" role="status" aria-live="polite"></div></section>'
    else:
        config=dict(course=cid,steps=[
            dict(title='Periksa bukti pada pesan ini.',intro='Ada lima potongan informasi dari pesan tadi. Tentukan mana yang menguatkan dugaan phishing dan mana yang belum cukup sebagai bukti.',kind='sort',items=[
                dict(id='domain',label='admin@bpss-portal-update.example',detail='Nama domain menyerupai BPS, tetapi bukan alamat layanan yang dikenal.'),
                dict(id='logo',label='Pesan memakai logo BPS',detail='Logo tampak rapi dan sesuai warna instansi.'),
                dict(id='deadline',label='Akun diblokir dalam 1 jam!',detail='Penerima diminta segera login agar akunnya tidak diblokir.'),
                dict(id='greeting',label='“Kepada pengguna layanan”',detail='Salam tidak menyebut nama penerima.'),
                dict(id='url',label='http://bit.ly/login-update-bps',detail='Alamat singkat ini tidak memperlihatkan tujuan login secara langsung.')],zones=[dict(id='strong',label='Indikasi phishing',hint='Alasan kuat untuk menghentikan tindakan'),dict(id='weak',label='Belum cukup bukti',hint='Tidak membuktikan pesan aman atau berbahaya')],solution=dict(domain='strong',deadline='strong',url='strong',logo='weak',greeting='weak')),
            dict(title='Susun urutan penanganan pesan.',intro='Letakkan tiga tindakan yang aman pada urutan 1–3. Dua tindakan yang berisiko tidak perlu dipindahkan.',kind='sequence',items=[
                dict(id='report',label='Laporkan melalui kanal TI resmi',detail='Sertakan bukti pesan sesuai prosedur instansi.'),
                dict(id='try',label='Coba login untuk memastikan',detail='Buka tautan dalam email dan masukkan akun.'),
                dict(id='stop',label='Hentikan interaksi dengan pesan',detail='Jangan buka tautan, balas, atau kirim data akun.'),
                dict(id='forward',label='Teruskan email ke grup kerja',detail='Minta rekan mencoba tautan yang sama.'),
                dict(id='verify',label='Verifikasi lewat kontak yang dikenal',detail='Gunakan alamat layanan atau kontak resmi di luar email ini.')],zones=[dict(id='first',label='1 · Hentikan risiko',hint='Apa tindakan pertama Anda?'),dict(id='second',label='2 · Pastikan melalui kanal lain',hint='Jangan memakai alamat dari email'),dict(id='third',label='3 · Tindak lanjuti temuan',hint='Bantu tim menangani pesan')],solution={'stop':'first','verify':'second','report':'third','try':'bank','forward':'bank'})])
    data=json.dumps(config,ensure_ascii=False).replace('<','\\u003c').replace('content/resources/','{{context_path}}/')
    # Asset URLs are explicit HTML references so eXe registers and exports them.
    refs=''.join(f'<img class="dnd-image-ref" data-dnd-art="{name}" src="content/resources/{name}" alt="" hidden>' for name in (['scenes/C01-server.webp','scenes/C01-meeting.webp'] if cid=='C01' else ['scenes/C12-mail.webp','scenes/C12-lock.webp']))
    return f'<script type="application/json" class="dnd-config">{data}</script>{refs}<section class="dnd-challenge" aria-label="Tantangan kasus bertahap"><div class="dnd-workspace"></div><div class="dnd-status" role="status" aria-live="polite"></div></section>'

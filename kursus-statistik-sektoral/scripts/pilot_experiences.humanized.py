"""Study-first lesson and non-drag simulation shells in native eXe Text."""
import json
from pathlib import Path
from html import escape

def lesson(cid,copy):
    data=json.loads((Path(__file__).resolve().parents[1]/'data/pilot_lessons.sourced.json').read_text(encoding='utf-8'))[cid]
    encoded=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
    return f'''<script class="lesson-config" type="application/json">{encoded}</script>
<section class="lesson-root" data-complete="false" aria-label="Materi awal">
 <div class="lesson-cover scene-intro"><div class="scene-copy"><span class="scene-eyebrow">MATERI DAN LATIHAN</span><h2>{'Anggaran dan hasil kerja' if cid=='C01' else 'Penguatan Statistik Sektoral'}</h2><p>{escape(data['objective'])}</p><p class="lesson-objective">Materi → Contoh situasi → Praktik</p><button type="button" class="lesson-open">Mulai belajar →</button></div></div>
 <div class="lesson-study" hidden><header class="lesson-study-header"><span class="lesson-count"></span><span>MATERI AWAL</span></header><div class="lesson-content"></div><footer class="lesson-controls"><button type="button" data-lesson-action="prev">← Sebelumnya</button><button type="button" data-lesson-action="next">Materi berikutnya →</button><div class="lesson-launch" hidden><label class="simple-timer"><input type="checkbox" id="simple-timer"> Gunakan timer 2 menit</label><button type="button" class="scene-free" disabled>Coba situasinya →</button></div></footer></div>
</section>'''

def simulation(cid):
    return f'''<section class="sim-root" data-course="{cid}" data-complete="false" aria-label="Simulasi keputusan"><div class="sim-scroll"><div class="sim-content"></div></div><footer class="sim-controls"><button type="button" data-simple-sim="back" disabled>← Sebelumnya</button><button type="button" class="sim-next" data-simple-sim="next" disabled>Lanjut →</button></footer></section>'''


def word_search(cid):
    data=json.loads((Path(__file__).resolve().parents[1]/'data/pilot_word_search.json').read_text(encoding='utf-8'))[cid]
    encoded=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
    return f'<script class="word-config" type="application/json">{encoded}</script><section class="word-root" data-complete="false" data-found="0" aria-label="Find the words" hidden></section>'


def drag_words(cid):
    data=json.loads((Path(__file__).resolve().parents[1]/'data/pilot_drag_words.json').read_text(encoding='utf-8'))[cid]
    encoded=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
    return f'<script class="dt-config" type="application/json">{encoded}</script><section class="dt-root" data-complete="false" data-correct="0" data-assisted="false" aria-label="Drag the Words" hidden></section>'


def sort_paragraphs(cid):
    data=json.loads((Path(__file__).resolve().parents[1]/'data/pilot_sort_paragraphs.json').read_text(encoding='utf-8'))[cid]
    encoded=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
    return f'<script class="sp-config" type="application/json">{encoded}</script><section class="sp-root" data-complete="false" data-correct="0" data-assisted="false" aria-label="Sort the Paragraphs" hidden></section>'

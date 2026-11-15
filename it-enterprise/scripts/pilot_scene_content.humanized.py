"""Editable scene content for the two eXe pilots; no SCORM packaging here."""
import html
import json

NS='{http://www.intef.es/xsd/ode}'
def esc(v):return html.escape(str(v),quote=True)
def replace_pilot_content(pages,course,copy,art):
    cid=course['id']
    def set_text(page,content):
        c=page.find('.//'+NS+'odeComponent')
        c.find(NS+'htmlView').text='<div class="exe-text-template">'+content+'</div>'
        data=json.loads(c.find(NS+'jsonProperties').text)
        data['textTextarea']=content
        c.find(NS+'jsonProperties').text=json.dumps(data,ensure_ascii=False)
    def marker(i):return f'<div class="lcm-stage" data-lcm-phase="{i}" data-course="{cid}"></div>'
    art_refs=''.join(f'<img data-card-label="{esc(card["label"])}" src="content/resources/{esc(card["image"])}" alt="" hidden>' for card in copy['cards'])
    cover=marker(0)+f'<img data-scene-image src="content/resources/{art}" alt="Ilustrasi situasi {esc(course["original_title"])}" hidden>'+art_refs
    from load_humanized import load
    from pilot_enhanced import activities
    experiences=load("pilot_experiences")
    lesson,simulation=experiences.lesson,experiences.simulation
    cover+='<img data-brand-logo src="content/resources/branding/bps-corpu-transparent.png" alt="" hidden>'
    cover+=lesson(cid,copy)
    set_text(pages[0],cover)
    challenge=load("pilot_challenges").challenge
    set_text(pages[1],marker(1)+activities()+simulation(cid)+experiences.word_search(cid)+experiences.drag_words(cid)+experiences.sort_paragraphs(cid)+challenge(cid).replace('class="dnd-challenge"','class="dnd-challenge" hidden'))
    set_text(pages[2],marker(2)+'<div class="scene-quiz-note"><span class="scene-eyebrow">CEK PEMAHAMAN</span><p>Jawab kedua pertanyaan berikut berdasarkan materi dan latihan tadi.</p></div>')
    review=marker(3)+f'<section class="scene-review"><span class="scene-eyebrow">PEMBAHASAN</span><h2>Meninjau keputusan dalam uji coba</h2><p class="scene-review-lead">{esc(copy["reflection"])}</p><div class="scene-review-points">'+''.join(f'<article><span>{i+1}</span><div><h3>{esc(q["question"])}</h3><p>{esc(q["feedback"])}</p></div></article>' for i,q in enumerate(copy['quizzes']))+'</div></section>'
    set_text(pages[3],review)
    ending=marker(4)+f'<section class="scene-ending"><img src="content/resources/mission-reward.webp" alt="Lencana penyelesaian latihan"><div><h2>Hasil latihan</h2><p class="scene-final-score" role="status"></p><p>{esc(copy["takeaway"])}</p><button type="button" class="scene-confirm" data-scene-action="restart">Ulangi latihan</button></div></section>'
    set_text(pages[4],ending)

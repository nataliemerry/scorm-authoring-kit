"""Prepare editable native eXeLearning sources from UI-created 4.0.6 component seeds.

These are .elpx sources, NOT hand-built SCORM exports. Open and export them in eXe Online.
"""
import copy
import html
import json
import re
import uuid
import datetime
import secrets
import string
from xml.dom import minidom
import zipfile
from pathlib import Path
from urllib.parse import unquote_to_bytes
import xml.etree.ElementTree as ET

BASE=Path(__file__).resolve().parent.parent
OUT=BASE/'exelearning'/'sources'
PILOT=False
NS='http://www.intef.es/xsd/ode'
ET.register_namespace('',NS)
def tag(n): return '{'+NS+'}'+n
def get(el,n): return el.find(tag(n))
def text(el,n): return get(el,n).text or ''
def put(el,n,v):
    found=get(el,n)
    if found is None: found=ET.SubElement(el,tag(n))
    found.text=str(v)
def prop(parent,group,entry,key,value):
    box=get(parent,group)
    if box is None: box=ET.SubElement(parent,tag(group))
    for p in box:
        if text(p,'key')==key: put(p,'value',value);return
    p=ET.SubElement(box,tag(entry));put(p,'key',key);put(p,'value',value)
def encrypt(obj):
    value=json.dumps(obj,ensure_ascii=True,separators=(',',':'))
    # Native eXe gamification payload uses legacy escape(XOR(text,146)).
    return ''.join('%%%02X'%(ord(ch)^146) for ch in value)
def decrypt(encoded): return json.loads(''.join(chr(b^146) for b in unquote_to_bytes(encoded)))
def uid(prefix=''): return datetime.datetime.now().strftime('%Y%m%d%H%M%S')+''.join(secrets.choice(string.ascii_uppercase+string.digits) for _ in range(6))
def e(v): return html.escape(str(v),quote=True)

def main(course_ids=None):
    OUT.mkdir(parents=True,exist_ok=True)
    z1=zipfile.ZipFile(BASE/'exelearning/seed/native-seed.elpx')
    z2=zipfile.ZipFile(BASE/'exelearning/seed/components.elpx')
    r1=ET.fromstring(z1.read('content.xml'));r2=ET.fromstring(z2.read('content.xml'))
    seed_blocks={}
    for r in [r1,r2]:
        for b in r.iter(tag('odePagStructure')):
            c=b.find('.//'+tag('odeComponent'));kind=text(c,'odeIdeviceTypeName')
            if kind!='dragdrop':seed_blocks[kind]=copy.deepcopy(b)
    classify_html=text(seed_blocks['classify'].find('.//'+tag('odeComponent')),'htmlView')
    encoded=re.search(r'clasifica-DataGame js-hidden">(.*?)</div>',classify_html).group(1)
    cls_seed=decrypt(encoded)
    form_seed=json.loads(text(seed_blocks['form'].find('.//'+tag('odeComponent')),'jsonProperties'))
    text_seed=json.loads(text(seed_blocks['text'].find('.//'+tag('odeComponent')),'jsonProperties'))
    translations={
      'msgYouScore':'Skor Anda','msgYouLastScore':'Nilai terakhir tersimpan','msgSubmit':'Periksa','msgPlayStart':'Mulai tantangan','msgPlayAgain':'Coba lagi','msgScore':'Skor','msgHits':'Tepat','msgErrors':'Perlu ditinjau','msgNumQuestions':'Jumlah kartu','msgNext':'Berikutnya','msgPrevious':'Sebelumnya','msgCheck':'Periksa jawaban','msgReset':'Ulangi','msgShowAnswers':'Lihat pembahasan','msgOk':'Tepat','msgKO':'Perlu ditinjau','msgTypeGame':'Tantangan','msgSaveScore':'Simpan nilai','msgSaveAuto':'Nilai dikirim otomatis ke LMS.','msgScoreScorm':'Preview: nilai belum dikirim ke LMS.','msgSingleSelectionHelp':'Pilih satu jawaban yang paling tepat.','msgFullScreen':'Layar penuh','msgExitFullScreen':'Keluar layar penuh','msgMinimize':'Perkecil','msgMaximize':'Perbesar','mgsGameStart':'Tantangan dimulai. Seret kartu ke kategori yang sesuai.','msgContinue':'Lanjutkan','msgTimeOver':'Waktu habis. Mari pelajari pembahasannya.','msgTestResultPass':'Misi selesai. Bawa pelajarannya ke pekerjaan.','msgTestResultNotPass':'Misi selesai. Tinjau lagi bukti dan pembahasannya.','msgTestPassed':'Keputusan Anda tepat.','msgTestFailed':'Pelajari kembali alasan di balik jawaban yang tepat.','msgAllCorrect':'Semua kartu sudah tepat.','msgRebootGame':'Ulangi tantangan ini?'}
    courses=json.loads((BASE/'data/courses_catalog.json').read_text(encoding='utf-8'))
    if course_ids: courses=[c for c in courses if c['id'] in course_ids]
    narrative=json.loads((BASE/'data/course_experiences.humanized.humanized.json').read_text(encoding='utf-8')) if PILOT else {}
    experiences=json.loads((BASE/'data/course_experiences.json').read_text(encoding='utf-8'))
    for course in courses:
        cid=course['id'];exp=experiences[cid];root=copy.deepcopy(r2)
        if PILOT:
            course['quizzes']=narrative[cid]['quizzes']
            exp['mission']=narrative[cid]['intro']
        get(root,'odeNavStructures').clear()
        # Inline the native HEAD extension so nested exported pages do not depend
        # on relative script/CSS paths. Native exercise/media assets stay bundled.
        head='<style>'+(BASE/'exelearning/lcm-exe.css').read_text(encoding='utf-8')+'</style><script>document.addEventListener("DOMContentLoaded",function(){'+(BASE/'exelearning/lcm-pacing.js').read_text(encoding='utf-8')+'});</script>'
        for key,value in {'pp_title':f"{cid} {course['original_title']}",'pp_lang':'id','pp_author':'BPS Corporate University','pp_license':'propietary license','pp_description':exp['mission'],'pp_theme':'base','pp_addPagination':'true','pp_addExeLink':'true','pp_passScore':'0','exportSource':'true','pp_extraHeadContent':head}.items():prop(root,'odeProperties','odeProperty',key,value)
        # Unique source IDs prevent eXe collaboration/import collisions.
        prop(root,'odeResources','odeResource','odeId',uid('LCM-'+cid+'-'))
        prop(root,'odeResources','odeResource','odeVersionId',uid())
        art='mission-security.webp' if cid in ['C08','C10','C11','C12'] else 'mission-workspace.webp'
        if PILOT:art=f'scenes/{cid}.webp'
        names=['Misi','Selidiki','Putuskan','Refleksi','Selesai']
        pages=[]
        def block(page,kind,title,payload,order):
            b=copy.deepcopy(seed_blocks[kind]);bid=uid('block-');iid=uid('idevice-');pid=text(page,'odePageId')
            oldid=text(b.find('.//'+tag('odeComponent')),'odeIdeviceId')
            put(b,'odePageId',pid);put(b,'odeBlockId',bid);put(b,'blockName',title);put(b,'odePagStructureOrder',order)
            prop(b,'odePagStructureProperties','odePagStructureProperty','allowToggle','false')
            c=b.find('.//'+tag('odeComponent'));put(c,'odePageId',pid);put(c,'odeBlockId',bid);put(c,'odeIdeviceId',iid)
            if kind=='text':
                d=copy.deepcopy(text_seed);d.update(ideviceId=iid,textTextarea=payload)
                put(c,'htmlView','<div class="exe-text-template">'+payload+'</div>');put(c,'jsonProperties',json.dumps(d,ensure_ascii=False))
            elif kind=='classify':
                d=copy.deepcopy(cls_seed);d.update(id=iid,author='BPS Corporate University',instructions='<p>Ketuk kartu untuk membukanya, lalu seret ke kategori yang sesuai. Gunakan layar penuh untuk fokus pada arena.</p>',groups=exp['targets']+['']*(9-len(exp['targets'])),numberGroups=len(exp['targets']),gameLevel=0,isScorm=0,evaluation=False,time=0,imgCard='',customMessages=True)
                d['msgs'].update(translations);d['wordsGame']=[]
                for label,group,detail in exp['items']:
                    d['wordsGame'].append(dict(type=1,x=0,y=0,author='',alt='',url='',audio='',eText=label,color='#163c3a',backcolor='#e7f1ed',group=group,msgHit=detail,msgError='Tinjau bukti: '+detail))
                h=classify_html.replace(oldid,iid)
                h=re.sub(r'(<div class="clasifica-DataGame js-hidden">).*?(</div>)',lambda m:m[1]+encrypt(d)+m[2],h,flags=re.S)
                h=h.replace('<p>Drag each card to its container.</p>',d['instructions'])
                put(c,'htmlView',h);put(c,'jsonProperties','')
            elif kind=='form':
                d=copy.deepcopy(form_seed);d.update(id=iid,ideviceId=iid,evaluationID=uid(),isScorm=1,repeatActivity=True,showSlider=True,textButtonScorm='Periksa jawaban',time='0',addBtnAnswers=True,eXeFormInstructions='<p>Dua keputusan. Pilih satu jawaban pada setiap soal, lalu tekan Periksa jawaban. Skor: 0, 50, atau 100.</p>',questionsData=[])
                d['msgs'].update(translations)
                for i,q in enumerate(course['quizzes']):
                    d['questionsData'].append(dict(id=uid(),activityType='selection',baseText='<p>'+e(q['question'])+'</p>',feedbackRight=q['feedback'],feedbackWrong=q['feedback'],suggestion='',wrongAnswersValue='',selectionType='single',answers=[[opt[0]==q['answer_key'],e(opt[3:])] for opt in q['options']],answer=str('ABC'.index(q['answer_key'])+1),capitalization=False,strict=False,order=i,customScore=1,time=0))
                h=text(c,'htmlView').replace(oldid,iid).replace('Complete the questions in the following quiz','Dua keputusan untuk Anda').replace('value="Check"','value="Periksa jawaban"').replace('value="Show answers"','value="Lihat pembahasan"')
                put(c,'htmlView',h);put(c,'jsonProperties',json.dumps(d,ensure_ascii=False))
            get(page,'odePagStructures').append(b)
        for i,name in enumerate(names):
            p=ET.SubElement(get(root,'odeNavStructures'),tag('odeNavStructure'));put(p,'odePageId',uid('page-'));put(p,'odeParentPageId','');put(p,'pageName',name);put(p,'odeNavStructureOrder',i)
            prop(p,'odeNavStructureProperties','odeNavStructureProperty','titlePage',name);ET.SubElement(p,tag('odePagStructures'));pages.append(p)
        marker=lambda n:f'<div class="lcm-stage" data-lcm-phase="{n}" data-course="{cid}"></div>'
        micro=course['micro_content']
        if len(micro.split())<25:micro+=' Gunakan bukti yang tersedia untuk menentukan tindakan yang paling sesuai dengan kebutuhan pekerjaan.'
        intro=marker(0)+f'<section class="lcm-scene"><img src="content/resources/{art}" alt="Ilustrasi misi {e(course["original_title"])}"><div class="lcm-scene-copy"><p class="lcm-kicker">{e(course["simpeg_domain"])}</p><h2>{e(exp["headline"])}</h2><p>{e(exp["mission"])}</p><button type="button" class="lcm-start">Mulai misi 120 detik</button><p class="lcm-small">Atau gunakan navigasi halaman untuk belajar tanpa batas waktu.</p></div></section><p class="lcm-principle">{e(micro)}</p><p class="lcm-small"><strong>Tujuan:</strong> {e(course["objective"])}</p>'
        block(pages[0],'text','Tantangan Anda',intro,0)
        clues=marker(1)+'<p class="lcm-lead">Buka buktinya sebelum masuk ke arena.</p>'+''.join(f'<details class="lcm-clue"><summary>{e(label)}</summary><p>{e(detail)}</p></details>' for label,_,detail in exp['items'])
        block(pages[1],'text','Berkas misi',clues,0)
        if not PILOT:block(pages[1],'classify','Arena keputusan',None,1)
        block(pages[2],'text','Dua keputusan',marker(2)+'<p class="lcm-lead">Terapkan yang baru Anda temukan. Pilih satu jawaban per soal.</p>',0)
        block(pages[2],'form','Uji pemahaman',None,1)
        reflection=marker(3)+'<p class="lcm-lead">'+e(exp['insight'])+'</p>'+''.join(f'<details class="lcm-clue" open><summary>{i+1}. {e(q["question"])}</summary><p><strong>{e(next(o for o in q["options"] if o[0]==q["answer_key"]))}</strong></p><p>{e(q["feedback"])}</p></details>' for i,q in enumerate(course['quizzes']))
        block(pages[3],'text','Bawa ke pekerjaan',reflection,0)
        ending=marker(4)+f'<div class="lcm-ending"><img src="content/resources/mission-reward.webp" alt="Lencana penyelesaian misi"><h2>Satu langkah lebih siap.</h2><p>{e(exp["insight"])}</p><p class="lcm-small">Nilai dan penyelesaian mengikuti pencatatan LMS. XP dan Trophy mengikuti aturan GOJAGS Classroom.</p></div>'
        block(pages[4],'text','Misi selesai',ending,0)
        if PILOT:
            from load_humanized import load
            replace_pilot_content=load("pilot_scene_content").replace_pilot_content
            replace_pilot_content(pages,course,narrative[cid],art)
        # One eXe page = one native SCO. The imported theme reveals its five
        # sections progressively while all exercises remain native iDevices.
        main_page=pages[0]; main_pid=text(main_page,'odePageId')
        blocks=[]
        for page in pages:
            blocks.extend(list(get(page,'odePagStructures')))
        get(main_page,'odePagStructures').clear()
        for order,b in enumerate(blocks):
            put(b,'odePageId',main_pid);put(b,'odePagStructureOrder',order)
            for component in b.findall('.//'+tag('odeComponent')):put(component,'odePageId',main_pid)
            get(main_page,'odePagStructures').append(b)
        for page in pages[1:]:get(root,'odeNavStructures').remove(page)
        prop(root,'odeProperties','odeProperty','pp_theme','lcm-interactive')
        prop(root,'userPreferences','userPreference','theme','lcm-interactive')
        if PILOT:
            prop(root,'odeProperties','odeProperty','pp_theme','lcm-scenes-it-enterprise-responsive-video-20261116')
            prop(root,'userPreferences','userPreference','theme','lcm-scenes-it-enterprise-responsive-video-20261116')
        prop(root,'odeProperties','odeProperty','pp_extraHeadContent','')
        prop(root,'odeProperties','odeProperty','pp_addPagination','false')
        # Context paths are required for the importer to register image references.
        for node in root.iter():
            if node.text and 'content/resources/' in node.text:
                node.text=node.text.replace('content/resources/','{{context_path}}/')
        doc=minidom.parseString(ET.tostring(root,encoding='utf-8',xml_declaration=True))
        for field in ['htmlView','jsonProperties']:
            for node in doc.getElementsByTagName(field):
                value=''.join(child.data for child in node.childNodes if child.nodeType in [child.TEXT_NODE,child.CDATA_SECTION_NODE])
                while node.firstChild:node.removeChild(node.firstChild)
                node.appendChild(doc.createCDATASection(value))
        xml=doc.toxml(encoding='utf-8')
        # Keep standard native runtime/theme assets from the platform downloads.
        files={}
        for z in [z1,z2]:
            for name in z.namelist():
                if name != 'content.xml' and not name.startswith('idevices/dragdrop/'):
                    files[name]=z.read(name)
        files['content.xml']=xml
        config=files['theme/config.xml'].decode('utf-8').replace('<name>base</name>','<name>lcm-interactive</name>').replace('<title>Default</title>','<title>LCM Interactive</title>')
        files['theme/config.xml']=config.encode('utf-8')
        files['theme/style.css']+=b'\n'+(BASE/'exelearning/lcm-exe.css').read_bytes()
        files['theme/style.js']+=b'\nwindow.addEventListener("DOMContentLoaded",function(){'+(BASE/'exelearning/lcm-pacing.js').read_bytes()+b'});\n'
        if PILOT:
            files['theme/config.xml']=config.replace('lcm-interactive','lcm-scenes-it-enterprise-responsive-video-20261116').replace('LCM Interactive','LCM Scenes IT Enterprise Responsive Video').encode('utf-8')
            for font in (BASE/'assets/fonts').glob('*'):
                if font.suffix=='.woff2' or font.name.endswith('-OFL.txt'):files['theme/fonts/'+font.name]=font.read_bytes()
            files['theme/style.css']=z2.read('theme/style.css')+b'\n'+(BASE/'exelearning/pilot/scene.css').read_bytes()+(BASE/'exelearning/pilot/challenge.css').read_bytes()+(BASE/'exelearning/pilot/experience.humanized.css').read_bytes()+(BASE/'exelearning/pilot/word-search.css').read_bytes()+(BASE/'exelearning/pilot/drag-words.css').read_bytes()+(BASE/'exelearning/pilot/sort-paragraphs.css').read_bytes()+(BASE/'exelearning/pilot/enhanced-interactions.css').read_bytes()+(BASE/'exelearning/pilot/ite-enhanced.css').read_bytes()
            files['theme/style.js']=z2.read('theme/style.js')+b'\n'+(BASE/'exelearning/pilot/form-compat.js').read_bytes()+b'\nwindow.addEventListener("DOMContentLoaded",function(){'+(BASE/'exelearning/pilot/scene.humanized.js').read_bytes()+(BASE/'exelearning/pilot/challenge.humanized.js').read_bytes()+(BASE/'exelearning/pilot/experience.humanized.js').read_bytes()+(BASE/'exelearning/pilot/word-search.js').read_bytes()+(BASE/'exelearning/pilot/drag-words.js').read_bytes()+(BASE/'exelearning/pilot/sort-paragraphs.js').read_bytes()+(BASE/'exelearning/pilot/ite-enhanced-flow.js').read_bytes()+b'});\n'+(BASE/'exelearning/pilot/enhanced-interactions.js').read_bytes()
        for file in [art,'mission-reward.webp']:files['content/resources/'+file]=(BASE/'assets'/file).read_bytes()
        if PILOT:
            files['content/resources/branding/bps-corpu-transparent.png']=(BASE/'assets/branding/bps-corpu-transparent.png').read_bytes()
            for card in narrative[cid]['cards']:files['content/resources/'+card['image']]=(BASE/'assets'/card['image']).read_bytes()
        if PILOT:
            media=json.loads((BASE/'data/enhanced_interactions.json').read_text(encoding='utf-8'))
            for name in media['resource_files']:
                files['content/resources/'+name]=(BASE/'assets'/name).read_bytes()
        files['content/resources/lcm-exe.css']=(BASE/'exelearning/lcm-exe.css').read_bytes()
        files['content/resources/lcm-pacing.js']=(BASE/'exelearning/lcm-pacing.js').read_bytes()
        filename=f"{cid}_{course['original_title'].replace(' ','_')}.elpx"
        with zipfile.ZipFile(OUT/filename,'w',zipfile.ZIP_DEFLATED) as z:
            for name,data in files.items():z.writestr(name,data)
        print(filename)

if __name__=='__main__':main()

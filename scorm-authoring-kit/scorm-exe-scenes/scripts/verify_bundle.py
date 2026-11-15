"""Check the portable skill payload and its documented entry points."""
from pathlib import Path
from io import BytesIO
from zipfile import ZipFile
import json
import re
import xml.etree.ElementTree as ET
from bootstrap import verify_payload
from validate_brief import validate, validate_word_search

skill = Path(__file__).resolve().parents[1]
archive, manifest = verify_payload(skill)
required = {
    'START-HERE.md', 'assets/branding/bps-corpu-transparent.png',
    'assets/branding/bps-corpu-source.json', 'scripts/build_exelearning_pilots.py',
    'scripts/build_exelearning_sources.py', 'scripts/load_humanized.py',
    'data/pilot_lessons.sourced.json', 'data/pilot_references.json',
    'data/pilot_sort_paragraphs.json','exelearning/pilot/sort-paragraphs.js','exelearning/pilot/sort-paragraphs.css',
    'data/pilot_drag_words.json','exelearning/pilot/drag-words.js','exelearning/pilot/drag-words.css',
    'data/pilot_word_search.json','exelearning/pilot/word-search.js','exelearning/pilot/word-search.css',
    'exelearning/seed/native-seed.elpx', 'exelearning/seed/components.elpx',
    'exelearning/pilot/LCM_Scenes_Theme.zip',
    'exelearning/pilot/dist_scorm/C01_Smart_Budgeting_SCORM12.zip',
    'exelearning/pilot/dist_scorm/C12_Cybersecurity_Challenge_SCORM12.zip',
    'scripts/qa/simple-experience-check.cjs', 'scripts/qa/package-lock.json',
}
assert required <= set(manifest['files']), required - set(manifest['files'])
for doc in [skill / 'SKILL.md', *sorted((skill / 'references').glob('*.md'))]:
    for target in re.findall(r'\]\(([^)]+)\)', doc.read_text(encoding='utf-8')):
        if not target.startswith(('https://', 'http://', '#')):
            assert (doc.parent / target).exists(), (doc.name, target)
assert not any('node_modules/' in n or n.startswith(('C:', 'D:')) for n in manifest['files'])
example = json.loads((skill / 'assets/course-brief.example.json').read_text(encoding='utf-8'))
validate(example)
with ZipFile(archive) as payload:
    for field, source in [('word_search','pilot_word_search'), ('drag_words','pilot_drag_words'), ('sort_paragraphs','pilot_sort_paragraphs')]:
        assert example[field] == json.loads(payload.read('data/'+source+'.json'))['C12'], field
    assert example['lessons'] == json.loads(payload.read('data/pilot_lessons.sourced.json'))['C12']['lessons']
    assert example['quizzes'] == json.loads(payload.read('data/course_experiences.humanized.humanized.json'))['C12']['quizzes']
    puzzles = json.loads(payload.read('data/pilot_word_search.json'))
    for puzzle in puzzles.values():
        validate_word_search(puzzle)
    for filename in ('enhanced-interactions.js', 'enhanced-interactions.css', 'enhanced-interactions.example.json'):
        assert payload.read('exelearning/pilot/'+filename) == (skill/'assets/enhanced-interactions'/filename).read_bytes()
    assert b",{cid:'S01',zero:false}" not in payload.read('scripts/qa/simple-experience-check.cjs')
    report = json.loads(payload.read('exelearning/pilot/qa/simple-experience-report.json'))
    assert not report.get('failure'), report.get('failure')
    checks = '\n'.join(report['checks'])
    for feature in ['clue-only word search', 'per-item hints', 'Drag the Words', 'Sort the Paragraphs', 'native LMS score', 'raw 0', 'One unanswered']:
        assert feature in checks, 'Missing executed QA coverage: '+feature
    for asset in ['scenes/C01','scenes/C01-server','scenes/C01-meeting','scenes/C12','scenes/C12-mail','scenes/C12-lock','mission-reward']:
        for suffix in ['png','webp']:
            assert 'assets/'+asset+'.'+suffix in manifest['files'], 'Missing master/derivative: '+asset
    logo = payload.read('assets/branding/bps-corpu-transparent.png')
    assert logo[:8] == b'\x89PNG\r\n\x1a\n' and logo[25] == 6, 'Logo must remain RGBA PNG'
    with ZipFile(BytesIO(payload.read('exelearning/pilot/LCM_Scenes_Theme.zip'))) as theme:
        theme_js = theme.read('style.js')
        for marker in [b'word-board', b'word-clue-number', b'data-word-hint', b'dt-sentences', b'sp-list', b'scene-brand-logo']:
            assert marker in theme_js, marker
        for cid in ['C01', 'C12']:
            source_path = next(n for n in payload.namelist() if n.startswith('exelearning/pilot/sources/'+cid) and n.endswith('.elpx'))
            export_path = next(n for n in payload.namelist() if n.startswith('exelearning/pilot/dist_scorm/'+cid) and n.endswith('.zip'))
            with ZipFile(BytesIO(payload.read(source_path))) as source, ZipFile(BytesIO(payload.read(export_path))) as exported:
                assert exported.testzip() is None
                for seed_name in ('native-seed.elpx', 'components.elpx'):
                    with ZipFile(BytesIO(payload.read('exelearning/seed/'+seed_name))) as seed:
                        assert b"const chrome=document.createElement('div')" not in seed.read('theme/style.js'), 'Scene engine embedded in native seed'
                assert theme_js.count(b"const chrome=document.createElement('div')") == 1
                assert b'function review()' in payload.read('exelearning/pilot/scene.humanized.js')
                assert b'.scene-review-badge' in payload.read('exelearning/pilot/scene.css')
                assert b'data-dnd-action="solution"' in payload.read('exelearning/pilot/challenge.humanized.js')

                for document in (source.read('content.xml'), exported.read('index.html')):
                    embedded = re.findall(rb'<script\b[^>]*class="word-config"[^>]*>(.*?)</script>', document, re.S)
                    assert embedded and all(json.loads(config) == puzzles[cid] for config in embedded), (cid, 'word-search config mismatch')
                for marker in [b'word-config', b'dt-config', b'sp-config', b'data-brand-logo']:
                    assert marker in source.read('content.xml') and marker in exported.read('index.html'), (cid, marker)
                assert b'LCM Scenes Unified' in source.read('theme/config.xml')
                assert b'LCM Scenes Unified' in exported.read('theme/config.xml')
                assert source.read('theme/style.js') == theme_js == exported.read('theme/style.js'), cid+' theme cache mismatch'
                assert exported.read('content/resources/branding/bps-corpu-transparent.png') == logo
                manifest_xml = ET.fromstring(exported.read('imsmanifest.xml'))
                scos = [e for e in manifest_xml.iter() if e.tag.endswith('resource') and any(k.endswith('scormtype') and v=='sco' for k,v in e.attrib.items())]
                assert len(scos)==1 and b'1.2' in exported.read('imsmanifest.xml')
                names = set(exported.namelist())
                assert all(e.attrib['href'] in names for e in manifest_xml.iter() if e.tag.endswith('file') and 'href' in e.attrib)
                for font in ['bricolage-grotesque', 'source-sans-3']:
                    assert exported.read('theme/fonts/'+font+'.woff2')[:4] == b'wOF2'
                    assert 'theme/fonts/'+font+'-OFL.txt' in names
                assert len([n for n in names if n.startswith('content/resources/') and n.endswith('.webp')])==4
                for name in names:
                    if not name.endswith('/'):
                        assert payload.read('exelearning/pilot/preview/'+cid+'/'+name)==exported.read(name), (cid,name)
print(f'Bundle OK: {len(manifest["files"])} checksummed files; all linked references and brief fields resolve; 2 sources, 2 native exports, 3 added activities, logo, fonts, manifest, theme and matching previews verified; executed QA includes raw 0 and incomplete-answer guard.')

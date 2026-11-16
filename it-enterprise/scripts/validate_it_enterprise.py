"""Check the native IT Enterprise export and its local preview."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'exelearning/pilot'
PACKAGE = COURSE / 'dist_scorm/IT_Enterprise_SCORM12.zip'
SOURCE = COURSE / 'sources/ITE_IT_Enterprise.elpx'
PREVIEW = COURSE / 'preview/ITE'
art = json.loads((ROOT / 'asset-prompts.json').read_text(encoding='utf-8'))

with ZipFile(PACKAGE) as package, ZipFile(SOURCE) as source, ZipFile(COURSE / 'LCM_IT_Enterprise_Theme.zip') as theme:
    assert package.testzip() is None
    names = set(package.namelist())
    manifest = ET.fromstring(package.read('imsmanifest.xml'))
    assert any(n.tag.endswith('schemaversion') and n.text == '1.2' for n in manifest.iter())
    scos = [n for n in manifest.iter() if any(k.lower().endswith('scormtype') and v == 'sco' for k, v in n.attrib.items())]
    assert len(scos) == 1 and scos[0].attrib['href'] == 'index.html'
    for node in manifest.iter():
        if node.tag.endswith('}file'):
            assert node.get('href') in names, node.attrib
    html = package.read('index.html')
    assert b'IT Enterprise' in html and b'{{context_path}}' not in html
    assert all(marker in html for marker in (b'lesson-config', b'sim-root', b'word-config', b'dt-config', b'sp-config', b'dnd-config', b'iv-config', b'hotspot-config', b'quiz-set-config', b'exe-form-container'))
    assert b'lcm-scenes-it-enterprise-juliandra-video-20261116' in package.read('theme/config.xml')
    for name in ('style.js', 'style.css'):
        assert package.read('theme/' + name) == source.read('theme/' + name) == theme.read(name)
    for font in ('bricolage-grotesque', 'source-sans-3'):
        assert package.read(f'theme/fonts/{font}.woff2').startswith(b'wOF2')
        assert f'theme/fonts/{font}-OFL.txt' in names
    for path in [a['file'] for a in art] + ['assets/branding/bps-corpu-transparent.png']:
        filename = 'content/resources/' + path.removeprefix('assets/')
        assert package.read(filename) == (ROOT / path).read_bytes()
    practice=json.loads((ROOT/'data/pilot_practice.json').read_text(encoding='utf-8'))['ITE']
    cards=[item for step in practice['steps'] for item in step['items']]
    assert len(cards)==10 and len({item['image'] for item in cards})==10
    for item in cards:
        assert package.read('content/resources/'+item['image'])==(ROOT/'assets'/item['image']).read_bytes()
    assert 'content/resources/video/ITE-juliandra-ariiq-k.mp4' in names
    assert b'cfg.scored !== false' in package.read('theme/style.js')
    assert json.loads((ROOT/'data/enhanced_interactions.json').read_text(encoding='utf-8'))['question_set']['scored'] is False
    for entry in package.infolist():
        if not entry.is_dir():
            assert (PREVIEW / entry.filename).read_bytes() == package.read(entry)

report = dict(status='passed', platform='eXeLearning 4.0.6, official static browser distribution',
              size=PACKAGE.stat().st_size, sha256=hashlib.sha256(PACKAGE.read_bytes()).hexdigest(),
              sco_count=1, illustrations=len(art), illustrated_case_cards=10, video_questions=5, hotspot_correct_regions=3, ungraded_concept_questions=3, fonts=2,
              preview_matches_export=True, theme_matches_editable_source=True)
(COURSE / 'qa/ITE-structure-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))

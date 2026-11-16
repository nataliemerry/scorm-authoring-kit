"""Validate the two actual, unmodified eXeLearning Online SCORM exports."""
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import json

BASE=Path(__file__).resolve().parents[1]
OUT=BASE/'exelearning/pilot'
reports=[]
lessons=json.loads((BASE/'data/pilot_lessons.sourced.json').read_text(encoding='utf-8'))
registry=json.loads((BASE/'data/pilot_references.json').read_text(encoding='utf-8'))
assert len(registry) in (5, 11)
from urllib.parse import urlparse
for course in lessons.values():
    for lesson in course['lessons']:
        assert len(lesson['body'].split('\n\n'))==len(lesson['paragraph_sources'])
        assert all(lesson['paragraph_sources'])
        for ref in lesson['references']:
            assert urlparse(ref['url']).hostname in {'www.oecd.org','www.nist.gov','learn.microsoft.com','peraturan.bpk.go.id','pusdiklat.bps.go.id'}
            assert ref['verified_on'] in ('2026-11-13', '2026-11-14')
            assert ref['section']

for cid in ('C01','C12'):
    package=next((OUT/'dist_scorm').glob(cid+'*.zip'))
    with ZipFile(package) as archive:
        assert archive.testzip() is None
        names=set(archive.namelist())
        manifest=ET.fromstring(archive.read('imsmanifest.xml'))
        resources=[e for e in manifest.iter() if e.tag.endswith('resource')]
        scos=[r for r in resources if any(k.endswith('scormtype') and v=='sco' for k,v in r.attrib.items())]
        assert len(scos)==1,(cid,'Expected one SCO')
        missing=[e.attrib['href'] for e in manifest.iter() if e.tag.endswith('file') and e.attrib.get('href') not in names]
        assert not missing,missing
        assert b'1.2' in archive.read('imsmanifest.xml')
        for font in ('bricolage-grotesque','source-sans-3'):
            assert archive.read('theme/fonts/'+font+'.woff2')[:4]==b'wOF2'
            assert 'theme/fonts/'+font+'-OFL.txt' in names
        assert b'LCM Scenes Unified' in archive.read('theme/config.xml')
        assert archive.read('content/resources/branding/bps-corpu-transparent.png')==(BASE/'assets/branding/bps-corpu-transparent.png').read_bytes()
        assert b'data-brand-logo' in archive.read('index.html')
        assert b'scene-brand-logo' in archive.read('theme/style.js')
        assert b'data-scene-image' in archive.read('index.html')
        assert b'sp-config' in archive.read('index.html')
        assert b'sp-list' in archive.read('theme/style.js')
        assert b'dt-config' in archive.read('index.html')
        assert b'dt-sentences' in archive.read('theme/style.js')
        assert b'word-config' in archive.read('index.html')
        assert b'word-board' in archive.read('theme/style.js')
        assert b'lesson-config' in archive.read('index.html')
        assert b'sim-root' in archive.read('index.html')
        assert b'lesson-sources' in archive.read('theme/style.js')
        assert b'paragraph_sources' in archive.read('index.html')
        assert b'lcm-lesson-finish' in archive.read('theme/style.js')
        assert b'{{context_path}}' not in archive.read('index.html')
        assert 'content.xml' in names
        raster=[n for n in names if n.startswith('content/resources/') and n.endswith('.webp')]
        expected_raster = 6 if cid == 'C12' else 4
        assert len(raster) == expected_raster, (cid, raster)
        if cid == 'C12':
            assert 'content/resources/video/C12-penguatan-statistik-sektoral.mp4' in names
            assert b'iv-config' in archive.read('index.html')
            assert b'hotspot-config' in archive.read('index.html')
            assert b'quiz-set-config' in archive.read('index.html')
            assert b'cfg.scored !== false' in archive.read('theme/style.js')
        # Extracted preview must be byte-for-byte the actual exported files.
        for name in names:
            if not name.endswith('/'):
                assert (OUT/'preview'/cid/name).read_bytes()==archive.read(name),name
        reports.append(dict(course=cid,bytes=package.stat().st_size,sco_count=1,manifest_files_valid=True,bundled_fonts=2,generated_images=expected_raster,official_logo=1,preview_matches_export=True))
(OUT/'qa/structure-report.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
print(json.dumps(reports,indent=2))

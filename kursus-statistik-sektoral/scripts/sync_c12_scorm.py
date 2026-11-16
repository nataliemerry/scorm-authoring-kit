import os
import shutil
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

BASE = Path('kursus-statistik-sektoral').resolve()
PILOT_DIR = BASE / 'exelearning/pilot'
PREVIEW_C12 = PILOT_DIR / 'preview/C12'
DEV_PREVIEW_C12 = PILOT_DIR / 'dev-preview/C12'
SOURCE_ELPX = PILOT_DIR / 'sources/C12_Penguatan_Statistik_Sektoral.elpx'
DIST_ZIP = PILOT_DIR / 'dist_scorm/C12_Penguatan_Statistik_Sektoral_SCORM12.zip'

# 1. Update resources
for target in [PREVIEW_C12, DEV_PREVIEW_C12]:
    (target / 'content/resources/video').mkdir(parents=True, exist_ok=True)
    (target / 'content/resources/scenes').mkdir(parents=True, exist_ok=True)
    
    shutil.copy2(BASE / 'assets/video/C12-penguatan-statistik-sektoral.mp4', target / 'content/resources/video/C12-penguatan-statistik-sektoral.mp4')
    shutil.copy2(BASE / 'assets/video/C12-video-poster.webp', target / 'content/resources/video/C12-video-poster.webp')
    shutil.copy2(BASE / 'assets/scenes/C12-hotspot.webp', target / 'content/resources/scenes/C12-hotspot.webp')

# 2. Extract theme files from ELPX
with ZipFile(SOURCE_ELPX) as elpx:
    for name in ['theme/style.css', 'theme/style.js', 'theme/config.xml']:
        data = elpx.read(name)
        (PREVIEW_C12 / name).write_bytes(data)
        (DEV_PREVIEW_C12 / name).write_bytes(data)
    
    xml = ET.fromstring(elpx.read('content.xml'))
    views = [n.text for n in xml.findall('.//{http://www.intef.es/xsd/ode}htmlView') if 'exe-text-template' in (n.text or '')]

# 3. Update index.html
for target in [PREVIEW_C12, DEV_PREVIEW_C12]:
    html = BeautifulSoup((target / 'index.html').read_text(encoding='utf-8'), 'html.parser')
    old = html.select('.exe-text-template')
    assert len(old) == len(views) == 5
    for node, view in zip(old, views):
        node.replace_with(BeautifulSoup(view.replace('{{context_path}}', 'content/resources'), 'html.parser'))
    (target / 'index.html').write_text(str(html), encoding='utf-8')

# 4. Update imsmanifest.xml
for target in [PREVIEW_C12 / 'imsmanifest.xml', DEV_PREVIEW_C12 / 'imsmanifest.xml']:
    content = target.read_text(encoding='utf-8')
    if 'C12-penguatan-statistik-sektoral.mp4' not in content:
        lines_to_add = (
            '      <file href="content/resources/scenes/C12-hotspot.webp"/>\n'
            '      <file href="content/resources/video/C12-penguatan-statistik-sektoral.mp4"/>\n'
            '      <file href="content/resources/video/C12-video-poster.webp"/>\n'
        )
        idx = content.rfind('</resource>')
        content = content[:idx] + lines_to_add + content[idx:]
        target.write_text(content, encoding='utf-8')
        print(f'Updated {target}')
    else:
        print(f'imsmanifest already up to date for {target}')

# 5. Pack dist_scorm ZIP from PREVIEW_C12
with ZipFile(DIST_ZIP, 'w', ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(PREVIEW_C12):
        for f in files:
            full_path = Path(root) / f
            rel_path = full_path.relative_to(PREVIEW_C12).as_posix()
            z.write(full_path, rel_path)

print(f'Successfully rebuilt {DIST_ZIP} ({DIST_ZIP.stat().st_size} bytes)')

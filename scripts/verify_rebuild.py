"""Rebuild the portable starter twice and compare its engines with the native exports."""
import hashlib
import json
import subprocess
import sys
import tempfile
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / 'scorm-authoring-kit/scorm-exe-scenes'
target = Path(tempfile.mkdtemp(prefix='scorm-unified-rebuild-')) / 'project'
subprocess.run([sys.executable, str(SKILL / 'scripts/bootstrap.py'), '--output', str(target)], check=True)
snapshots = []
for attempt in range(2):
    subprocess.run([sys.executable, 'scripts/build_exelearning_pilots.py'], cwd=target, check=True)
    engines = {}
    for source in sorted((target / 'exelearning/pilot/sources').glob('*.elpx')):
        cid = source.name.split('_')[0]
        with ZipFile(source) as package:
            js = package.read('theme/style.js')
            assert js.count(b"const chrome=document.createElement('div')") == 1
            assert js.count(b"const root=document.querySelector('.dnd-challenge')") == 1
            assert js.count(b"const root=document.querySelector('.word-root')") == 1
            assert b'lcmTextCompatibility' in js
            assert b'function review()' in js and b'data-dnd-action="solution"' in js
            with ZipFile(next((target / 'exelearning/pilot/dist_scorm').glob(cid + '*.zip'))) as exported:
                assert js == exported.read('theme/style.js')
                assert package.read('theme/style.css') == exported.read('theme/style.css')
            engines[cid] = hashlib.sha256(js).hexdigest()
    snapshots.append(engines)
assert snapshots[0] == snapshots[1]
report = dict(status='passed', builds=2, source_engines=snapshots[0],
              one_initializer_per_engine=True, engines_match_native_exports=True)
out = ROOT / 'docs/integration/rebuild-report.json'
out.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))

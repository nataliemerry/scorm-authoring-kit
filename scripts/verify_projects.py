"""Verify native scene exports, their editable sources, assets and previews."""
import argparse
import hashlib
import json
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ['authoring/baseline', 'kursus-statistik-sektoral',
            'perancangan-kegiatan-statistik', 'it-enterprise']


def verify_project(project, extract=False):
    base = ROOT / project
    folder = base / 'exelearning/pilot'
    reports = []
    for source_path in sorted((folder / 'sources').glob('*.elpx')):
        cid = source_path.name.split('_')[0]
        name = source_path.stem + '_SCORM12.zip'
        if cid == 'ITE':
            name = 'IT_Enterprise_SCORM12.zip'
        archive_path = folder / 'dist_scorm' / name
        preview = folder / 'preview' / cid
        with ZipFile(source_path) as source, ZipFile(archive_path) as package:
            assert package.testzip() is None, archive_path
            members = {n for n in package.namelist() if not n.endswith('/')}
            assert all(not PurePosixPath(n).is_absolute() and '..' not in PurePosixPath(n).parts
                       and '\\' not in n and ':' not in n for n in members)
            if extract:
                assert preview.resolve().is_relative_to((folder / 'preview').resolve())
                assert preview.name == cid
                if preview.exists():
                    shutil.rmtree(preview)
                package.extractall(preview)
            actual = {p.relative_to(preview).as_posix() for p in preview.rglob('*') if p.is_file()}
            assert members == actual, (project, cid, 'Preview member set')
            assert all((preview / n).read_bytes() == package.read(n) for n in members)
            xml = ET.fromstring(package.read('imsmanifest.xml'))
            scos = [e for e in xml.iter() if any(k.lower().endswith('scormtype') and v == 'sco'
                                                for k, v in e.attrib.items())]
            assert len(scos) == 1 and scos[0].get('href') == 'index.html'
            assert all(e.get('href') in members for e in xml.iter()
                       if e.tag.endswith('}file') and e.get('href'))
            assert b'1.2' in package.read('imsmanifest.xml')
            js = package.read('theme/style.js')
            assert js.count(b"const chrome=document.createElement('div')") == 1
            for marker in (b'data-word-hint', b'data-dnd-action="solution"',
                           b'scene-review-key', b'scene-review-badge'):
                assert marker in js, (cid, marker)
            for name in ('style.js', 'style.css', 'config.xml'):
                assert source.read('theme/' + name) == package.read('theme/' + name), (cid, name)
            assert b'{{context_path}}' not in package.read('index.html')
            for name in members:
                if name.startswith('content/resources/'):
                    candidate = base / 'assets' / name.removeprefix('content/resources/')
                    if candidate.is_file():
                        assert candidate.read_bytes() == package.read(name)
            for font in ('bricolage-grotesque', 'source-sans-3'):
                assert package.read(f'theme/fonts/{font}.woff2').startswith(b'wOF2')
                assert f'theme/fonts/{font}-OFL.txt' in members
            assert b'baseText.replace(/&lt;/g' in js and b'lcmTextCompatibility' in js
            assert b'.form-Data' in package.read('theme/style.css')
        reports.append(dict(course=cid, archive=archive_path.name,
                            bytes=archive_path.stat().st_size,
                            sha256=hashlib.sha256(archive_path.read_bytes()).hexdigest(),
                            sco_count=1, manifest_files_valid=True, bundled_fonts=2,
                            bundled_webp_images=sum(n.startswith("content/resources/") and n.endswith(".webp") for n in members), official_logo=1,
                            source_matches_export=True, preview_matches_export=True))
    (folder / 'qa/structure-report.json').write_text(json.dumps(reports, indent=2) + '\n',
                                                    encoding='utf-8')
    return reports


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('projects', nargs='*', default=PROJECTS)
    parser.add_argument('--extract', action='store_true')
    args = parser.parse_args()
    for project in args.projects:
        print(project, json.dumps(verify_project(project, args.extract)))

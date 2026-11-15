"""Build the portable starter and mirror from repository-owned authoring sources."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / 'authoring/baseline'
KIT = ROOT / 'scorm-authoring-kit'
SKILL = KIT / 'scorm-exe-scenes'
VERSION = 'LCM-2026-11-15-unified'
IGNORED = {'node_modules', '__pycache__', '.git', 'dev-preview'}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def eligible_files(root):
    return sorted(p for p in root.rglob('*') if p.is_file()
                  and not (set(p.relative_to(root).parts) & IGNORED)
                  and p.suffix != '.pyc')


def prepare_starter():
    report = json.loads((BASELINE / 'exelearning/pilot/qa/simple-experience-report.json')
                        .read_text(encoding='utf-8'))
    if report.get('failure'):
        raise ValueError('Baseline QA failed. Resolve it before preparing the starter.')
    if report.get('mode') != 'actual-eXeLearning-export':
        raise ValueError('Release requires QA against the actual native export.')
    current = {p.name: digest(p.read_bytes()) for p in (BASELINE/'exelearning/pilot/dist_scorm').glob('*.zip')}
    if report.get('tested_artifacts') != current:
        raise ValueError('Export bytes changed after QA. Run actual-export QA again.')
    files = {p.relative_to(BASELINE).as_posix(): p.read_bytes()
             for p in eligible_files(BASELINE)}
    example_path = SKILL / 'assets/course-brief.example.json'
    example = json.loads(example_path.read_text(encoding='utf-8'))
    for key, filename in [('word_search', 'pilot_word_search'),
                          ('drag_words', 'pilot_drag_words'),
                          ('sort_paragraphs', 'pilot_sort_paragraphs')]:
        example[key] = json.loads(files['data/' + filename + '.json'])['C12']
    example['lessons'] = json.loads(files['data/pilot_lessons.sourced.json'])['C12']['lessons']
    example['quizzes'] = json.loads(files['data/course_experiences.humanized.humanized.json'])['C12']['quizzes']
    example_path.write_text(json.dumps(example, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    archive = SKILL / 'assets/starter.zip'
    with ZipFile(archive, 'w', ZIP_DEFLATED) as z:
        for name, data in sorted(files.items()):
            z.writestr(name, data)
    manifest = dict(version=VERSION, archive_sha256=digest(archive.read_bytes()),
                    files={n: digest(data) for n, data in sorted(files.items())})
    (SKILL / 'assets/starter-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n',
                                                       encoding='utf-8')
    print(f'Starter prepared: {len(files)} checksummed files')


def mirror_skill():
    target = ROOT / '.agents/skills/scorm-exe-scenes'
    shutil.copytree(SKILL, target, dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    canonical = {p.relative_to(SKILL).as_posix(): p.read_bytes() for p in eligible_files(SKILL)}
    actual = {p.relative_to(target).as_posix(): p.read_bytes() for p in eligible_files(target)}
    assert canonical == actual, 'Skill mirror differs from canonical skill'
    print('Repository skill mirror verified')


def distribution():
    archive = ROOT / 'SCORM_LCM_Template_Agent_Kit.zip'
    members = {p.relative_to(KIT).as_posix(): p for p in eligible_files(KIT)}
    with ZipFile(archive, 'w', ZIP_DEFLATED) as z:
        for name, file in sorted(members.items()):
            z.write(file, 'scorm-authoring-kit/' + name)
    with ZipFile(archive) as z:
        assert z.testzip() is None
        assert set(z.namelist()) == {'scorm-authoring-kit/' + n for n in members}
        assert all(z.read('scorm-authoring-kit/' + n) == p.read_bytes()
                   for n, p in members.items())
    archive.with_suffix('.sha256').write_text(digest(archive.read_bytes()) + '  ' + archive.name + '\n',
                                              encoding='ascii')
    print('Distribution built and verified:', archive)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--starter', action='store_true')
    parser.add_argument('--distribution', action='store_true')
    args = parser.parse_args()
    if args.starter:
        prepare_starter()
    mirror_skill()
    if args.distribution:
        distribution()

"""Explicitly synchronize backed-up local installations from the canonical kit."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IGNORED = {'__pycache__', 'node_modules', '.git'}


def files(root):
    return {p.relative_to(root).as_posix(): p for p in root.rglob('*')
            if p.is_file() and not (set(p.relative_to(root).parts) & IGNORED)
            and p.suffix != '.pyc'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workspace', type=Path, required=True)
    parser.add_argument('--installed-skill', type=Path, required=True)
    args = parser.parse_args()
    pairs = [(ROOT/'scorm-authoring-kit', args.workspace/'scorm-authoring-kit'),
             (ROOT/'scorm-authoring-kit/scorm-exe-scenes', args.installed_skill)]
    report = []
    for source, target in pairs:
        source_files = files(source)
        extras = set(files(target)) - set(source_files) if target.exists() else set()
        if extras:
            raise ValueError(f'Review target-only files before syncing {target}: {sorted(extras)}')
        shutil.copytree(source, target, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns('__pycache__', '*.pyc', 'node_modules', '.git'))
        actual = files(target)
        assert set(source_files) == set(actual)
        assert all(p.read_bytes() == actual[name].read_bytes() for name, p in source_files.items())
        report.append(dict(target=str(target), files=len(actual), byte_match=True))
    for name in ['SCORM_LCM_Template_Agent_Kit.zip', 'SCORM_LCM_Template_Agent_Kit.sha256']:
        shutil.copy2(ROOT/name, args.workspace/name)
        assert (ROOT/name).read_bytes() == (args.workspace/name).read_bytes()
    out = ROOT/'docs/integration/local-sync-report.json'
    out.write_text(json.dumps(dict(status='passed', copies=report,
        distribution_sha256=hashlib.sha256((ROOT/'SCORM_LCM_Template_Agent_Kit.zip').read_bytes()).hexdigest()),
        indent=2) + '\n', encoding='utf-8')
    print(out.read_text(encoding='utf-8'))

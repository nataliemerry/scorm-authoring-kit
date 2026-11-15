"""Run course QA with a shared Playwright installation and bind evidence to exports."""
import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PROJECTS = ['authoring/baseline', 'kursus-statistik-sektoral',
                    'perancangan-kegiatan-statistik', 'it-enterprise']


def run(project, dev):
    base = ROOT / project
    env = os.environ.copy()
    modules = ROOT / 'authoring/baseline/scripts/qa/node_modules'
    env['NODE_PATH'] = str(modules) + (os.pathsep + env['NODE_PATH'] if env.get('NODE_PATH') else '')
    cmd = ['node', str(base / 'scripts/qa/simple-experience-check.cjs')]
    if dev:
        cmd.append('--dev')
    result = subprocess.run(cmd, env=env)
    if result.returncode:
        raise SystemExit(result.returncode)
    report_path = base / 'exelearning/pilot/qa/simple-experience-report.json'
    report = json.loads(report_path.read_text(encoding='utf-8'))
    assert not report.get('failure')
    report['mode'] = 'development-preview' if dev else 'actual-eXeLearning-export'
    report['tested_artifacts'] = {
        p.name: hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted((base / 'exelearning/pilot/dist_scorm').glob('*.zip'))
    } if not dev else {}
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('projects', nargs='*', default=DEFAULT_PROJECTS)
    parser.add_argument('--dev', action='store_true')
    args = parser.parse_args()
    for project in args.projects:
        run(project, args.dev)

"""Check retained word-search rules and invalid enhanced-profile configurations."""
import copy
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILL = ROOT / 'scorm-authoring-kit/scorm-exe-scenes'


def load(filename):
    spec = importlib.util.spec_from_file_location(filename, SKILL / 'scripts' / (filename + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


brief = load('validate_brief')
enhanced = load('validate_enhanced')
checks = []
for project in ['authoring/baseline', 'it-enterprise']:
    data = json.loads((ROOT / project / 'data/pilot_word_search.json').read_text(encoding='utf-8'))
    for cid, puzzle in data.items():
        brief.validate_word_search(puzzle)
        checks.append(cid + ': forward paths, hints data, spacing and interior crossings valid')
sample = json.loads((SKILL / 'assets/enhanced-interactions/enhanced-interactions.example.json').read_text(encoding='utf-8'))
enhanced.validate(sample)
cases = [
    ('unreachable hotspot required', lambda value: value['image_hotspot'].update(required=3)),
    ('hotspot outside image', lambda value: value['image_hotspot']['regions'][0].update(x=99)),
    ('invalid answer index', lambda value: value['question_set']['questions'][0].update(correct=9)),
    ('negative video time', lambda value: value['interactive_video']['interactions'][0].update(at=-1))
]
for label, change in cases:
    value = copy.deepcopy(sample)
    change(value)
    try:
        enhanced.validate(value)
    except ValueError:
        checks.append('Rejected ' + label)
    else:
        raise AssertionError(label)
out = ROOT / 'docs/integration/contract-report.json'
out.write_text(json.dumps(dict(status='passed', checks=checks), indent=2) + '\n', encoding='utf-8')
print(json.dumps(checks, indent=2))

"""Multi-step drag-and-drop cases embedded in native eXe Text iDevices."""
import json
from pathlib import Path

def challenge(cid):
    config=json.loads((Path(__file__).resolve().parents[1]/'data/pilot_practice.json').read_text(encoding='utf-8'))[cid]
    images=json.loads((Path(__file__).resolve().parents[1]/'data/course_experiences.humanized.humanized.json').read_text(encoding='utf-8'))[cid]['cards']
    data=json.dumps(config,ensure_ascii=False).replace('<','\\u003c').replace('content/resources/','{{context_path}}/')
    # Asset URLs are explicit HTML references so eXe registers and exports them.
    refs=''.join(f'<img class="dnd-image-ref" data-dnd-art="{name}" src="content/resources/{name}" alt="" hidden>' for name in [item['image'] for item in images])
    return f'<script type="application/json" class="dnd-config">{data}</script>{refs}<section class="dnd-challenge" aria-label="Tantangan kasus bertahap"><div class="dnd-workspace"></div><div class="dnd-status" role="status" aria-live="polite"></div></section>'

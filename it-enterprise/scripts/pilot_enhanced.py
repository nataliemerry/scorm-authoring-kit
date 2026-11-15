"""IT Enterprise adaptations of the Pengelolaan Data interaction families."""
import html
import json
from pathlib import Path


def activities():
    cfg = json.loads((Path(__file__).resolve().parents[1] / 'data/enhanced_interactions.json').read_text(encoding='utf-8'))
    def block(host, selector, app, key, extra=''):
        data = json.dumps(cfg[key], ensure_ascii=False).replace('<', '\\u003c')
        return f'<section class="{host}" hidden data-complete="false" {extra}><script type="application/json" class="{selector}">{data}</script><div class="{app}"></div></section>'
    refs = ('<video hidden preload="none" src="content/resources/video/ITE-service-plan.mp4"></video>'
            '<img hidden src="content/resources/scenes/ITE-hotspot.webp" alt="">')
    transcript = '<details class="ite-transcript"><summary>Baca isi video</summary><ol>' + ''.join(
        f'<li><strong>{html.escape(s["title"])}</strong><p>{html.escape(s["body"])}</p></li>' for s in cfg['video_scenes']) + '</ol></details>'
    video = block('iv-root', 'iv-config', 'iv-app', 'interactive_video')
    video = video.replace('</section>', transcript + '</section>')
    hotspot = block('hotspot-root', 'hotspot-config', 'hotspot-app', 'image_hotspot')
    hotspot = hotspot.replace('</section>', '<footer class="ite-activity-footer"><button type="button" data-ite-next="checkpoint" disabled>Lanjut ke latihan konsep →</button></footer></section>')
    quiz = block('quiz-set-root', 'quiz-set-config', 'quiz-set-app', 'question_set', 'data-renderer="lcm-question-set"')
    quiz = quiz.replace('</section>', '<footer class="ite-activity-footer"><button type="button" data-ite-next="case" disabled>Lanjut ke kasus →</button></footer></section>')
    return refs + video + hotspot + quiz

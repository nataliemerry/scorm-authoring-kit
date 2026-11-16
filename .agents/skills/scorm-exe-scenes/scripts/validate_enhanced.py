"""Validate the optional video, hotspot and question-set configurations."""
import argparse
import json
from pathlib import Path


def require(condition, message):
    if not condition:
        raise ValueError(message)


def questions(items, label):
    require(isinstance(items, list) and len(items) > 0, label + ' requires questions')
    for item in items:
        options = item.get('options', [])
        require(isinstance(item.get('question'), str) and item['question'].strip(), label + ' question is empty')
        require(len(options) >= 2 and all(isinstance(o, str) and o.strip() for o in options), label + ' options are invalid')
        require(type(item.get('correct')) is int and 0 <= item['correct'] < len(options), label + ' correct index is out of bounds')
        require(isinstance(item.get('feedback'), str) and item['feedback'].strip(), label + ' feedback is empty')


def validate(config):
    if 'interactive_video' in config:
        video = config['interactive_video']
        require(bool(video.get('source')), 'Video source is required')
        questions(video.get('interactions'), 'Video')
        for item in video['interactions']:
            at = item.get('at')
            require(at == 'middle' or (type(at) in (int, float) and at >= 0), 'Video timestamp is invalid')
    if 'image_hotspot' in config:
        hotspot = config['image_hotspot']
        regions = hotspot.get('regions', [])
        require(bool(hotspot.get('background')) and bool(hotspot.get('alt')), 'Hotspot image and alt are required')
        require(len(regions) > 0 and len({r['id'] for r in regions}) == len(regions), 'Hotspot IDs must be unique')
        correct = sum(r.get('correct') is True for r in regions)
        require(type(hotspot.get('required')) is int and 1 <= hotspot['required'] <= correct, 'Hotspot required exceeds available correct regions')
        for region in regions:
            require(isinstance(region.get('label'), str) and region['label'].strip(), 'Hotspot label is required')
            if 'displayLabel' in region:
                require(isinstance(region['displayLabel'], str) and region['displayLabel'].strip(), 'Hotspot displayLabel must be nonempty text')
            require(all(type(region.get(k)) in (int, float) for k in ('x', 'y', 'width', 'height')), 'Hotspot geometry must be numeric')
            require(0 <= region['x'] < 100 and 0 <= region['y'] < 100 and
                    0 < region['width'] <= 100-region['x'] and
                    0 < region['height'] <= 100-region['y'], 'Hotspot region is out of bounds')
    if 'question_set' in config:
        quiz = config['question_set']
        require(quiz.get('renderer') == 'lcm-question-set', 'Question set renderer is invalid')
        questions(quiz.get('questions'), 'Question set')
        ids = [q['id'] for q in quiz['questions']]
        require(len(set(ids)) == len(ids), 'Question IDs must be unique')
    require(any(k in config for k in ('interactive_video', 'image_hotspot', 'question_set')),
            'No enhanced interaction profile supplied')
    return dict(valid=True, profiles=sorted(config))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('config', type=Path)
    args = parser.parse_args()
    print(json.dumps(validate(json.loads(args.config.read_text(encoding='utf-8'))), indent=2))

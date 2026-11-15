"""Validate an editorial course brief. Does not verify sources or build a course."""
import argparse
from datetime import date
import json
from itertools import combinations
import re
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse


def require(condition, message):
    if not condition:
        raise ValueError(message)


def nonblank(obj, keys, label):
    for key in keys:
        require(isinstance(obj.get(key), str) and bool(obj[key].strip()), f'{label}: missing {key}')



def validate_word_search(puzzle):
    grid = puzzle['grid']
    words = puzzle['words']
    require(len(grid)==10 and all(len(row)==10 and row.isascii() and row.isalpha() and row.isupper() for row in grid), 'Word-search grid must be 10x10 uppercase A-Z')
    require(len(words)==5 and len({w['term'] for w in words})==5, 'Word search requires five distinct taught terms')
    for word in words:
        nonblank(word,['term','meaning','clue'],'word-search term');
        require(not any(re.search(r'\b'+re.escape(target['term'])+r'\b',word['clue'],re.I) for target in words),'Word-search clue must not disclose a target answer')
        term=word['term'];cells=word['cells']
        require(term.isascii() and term.isalpha() and term.isupper() and 2<=len(term)<=10,'Word-search term must contain 2-10 uppercase letters')
        require(len(cells)==len(term) and all(len(c)==2 and all(type(v) is int and 0<=v<10 for v in c) for c in cells),'Invalid word-search coordinates')
        delta=(cells[1][0]-cells[0][0],cells[1][1]-cells[0][1])
        require(delta in ((0,1),(1,0)),'Word-search direction must be rightward or downward')
        require(all(c==[cells[0][0]+delta[0]*i,cells[0][1]+delta[1]*i] for i,c in enumerate(cells)),'Word-search path must be straight')
        require(''.join(grid[r][c] for r,c in cells)==term,'Word-search letters do not match the term')
        occurrences=0
        for r in range(10):
            for c in range(10):
                for dr,dc in [(0,1),(1,0)]:
                    positions=[(r+dr*i,c+dc*i) for i in range(len(term))]
                    if all(0<=y<10 and 0<=x<10 for y,x in positions) and ''.join(grid[y][x] for y,x in positions)==term:occurrences+=1
        require(occurrences==1,'Each target must occur exactly once in the word-search grid')
    validate_word_paths(words)


def validate_word_paths(words):
    crossings = 0
    for first, second in combinations(words, 2):
        a = {tuple(cell) for cell in first['cells']}
        b_cells = {tuple(cell) for cell in second['cells']}
        shared = a & b_cells
        if shared:
            require(len(shared) == 1, 'Word-search words may share only one crossing cell')
            endpoints = {tuple(w['cells'][i]) for w in (first, second) for i in (0, -1)}
            require(not (shared & endpoints), 'Word-search crossings must be inside both words')
            first_is_horizontal = first['cells'][0][0] == first['cells'][-1][0]
            second_is_horizontal = second['cells'][0][0] == second['cells'][-1][0]
            require(first_is_horizontal != second_is_horizontal, 'Word-search crossings must be perpendicular')
            crossings += 1
        adjacent = any(abs(row-y) + abs(column-x) == 1
                       for row, column in a-shared for y, x in b_cells-shared)
        require(not adjacent, 'Separate word-search paths with at least one filler cell outside crossings')
    require(crossings >= 1, 'Include at least one interior word-search crossing')


def validate(b):
    nonblank(b, ['id', 'title', 'audience', 'objective', 'language', 'tone'], 'course')
    require(b.get('branding') == {'logo': 'assets/branding/bps-corpu-transparent.png', 'placement': 'top-left', 'preserve_original': True}, 'BPS baseline requires original transparent top-left logo; implement an explicitly requested identity change separately')
    require(b['interaction_profile'] in ['budgeting', 'evidence-sequence'], 'Unsupported profile; implement and test deviations explicitly')
    require(len(b['lessons']) == 3, 'This template requires three theory pages')
    for i, lesson in enumerate(b['lessons']):
        nonblank(lesson, ['title', 'body', 'example', 'example_note'], f'lesson {i+1}')
        refs, mapping = lesson['references'], lesson['paragraph_sources']
        require(len(refs) > 0, 'Every lesson needs primary-source references')
        require(len(lesson['body'].split('\n\n')) == len(mapping), 'Every theory paragraph needs a source mapping')
        for paragraph in mapping:
            require(isinstance(paragraph, list) and len(paragraph) > 0, 'An empty paragraph source mapping is invalid')
            require(all(type(n) is int and 1 <= n <= len(refs) for n in paragraph), 'Citation index out of bounds')
        for ref in refs:
            nonblank(ref, ['publisher', 'title', 'year', 'url', 'section', 'verified_on', 'verification'], 'reference')
            url = urlparse(ref['url'])
            require(url.scheme == 'https' and bool(url.hostname) and not url.username and not url.password, 'Source URL must be HTTPS without credentials')
            date.fromisoformat(ref['verified_on'])
    require(b['lessons'][2].get('mode') == 'check', 'Last theory page must include a formative check')
    check = b['lessons'][2]
    nonblank(check, ['prompt', 'feedback'], 'formative check')
    require(len(check['options']) == 3 and type(check['correct']) is int and 0 <= check['correct'] <= 2, 'Formative check needs three options and a zero-based correct index')
    require(len(b['situations']) == 2, 'Two simple situations required')
    for situation in b['situations']:
        nonblank(situation, ['title', 'body', 'prompt'], 'situation')
        require(len(situation['options']) == 2, 'Each situation needs exactly two actions')
        for option in situation['options']:
            nonblank(option, ['label', 'title', 'body'], 'situation option')
            require(type(option['good']) is bool, 'Action good flag must be boolean')
        require(sum(o['good'] for o in situation['options']) == 1, 'Declare one preferred action per baseline situation')
    require(len(b['practice']['steps']) in [2, 3], 'Practice needs two or three stages')
    expected = {'budgeting': ['sort', 'budget', 'revision'], 'evidence-sequence': ['sort', 'sequence']}
    require([s['kind'] for s in b['practice']['steps']] == expected[b['interaction_profile']], 'Practice stages do not match the selected baseline profile')
    for step in b['practice']['steps']:
        nonblank(step, ['title', 'intro', 'kind'], 'practice stage')
        require(step['kind'] in ['sort', 'sequence', 'budget', 'revision'], 'Unknown practice kind')
        if step['kind'] in ['sort', 'sequence']:
            ids = [o['id'] for o in step['items']]
            targets = [o['id'] for o in step['zones']]
            require(len(ids) == len(set(ids)) and len(targets) == len(set(targets)), 'Duplicate item/target ID')
            require('bank' not in targets, 'bank is reserved for unplaced cards')
            require(set(step['solution']) == set(ids), 'Every item including distractors needs a declared solution')
            require(set(step['solution'].values()) <= set(targets) | {'bank'}, 'Solution names an unknown target')
            if step['kind'] == 'sequence':
                values = [v for v in step['solution'].values() if v != 'bank']
                require(len(values) == len(set(values)) and set(values) == set(targets), 'Sequence needs exactly one correct item per target')
        else:
            require(all(type(step[k]) is int and step[k] >= 0 and step[k] % 10 == 0 for k in ['server', 'backup']), 'Allocation must use nonnegative 10-unit increments')
            require(step['server'] + step['backup'] == 100, 'Allocation must total 100 units')
    require(len(b['quizzes']) == 2, 'Exactly two graded questions required')
    for quiz in b['quizzes']:
        nonblank(quiz, ['question', 'answer_key', 'feedback'], 'quiz')
        require(len(quiz['options']) == 3 and quiz['answer_key'] in 'ABC' and len(quiz['answer_key']) == 1, 'Quiz requires three options and key A/B/C')
        require(all(o.startswith(letter+'. ') and len(o) > 3 for letter, o in zip('ABC', quiz['options'])), 'Quiz options must be labeled A., B., C.')
    roles = [a['role'] for a in b['assets']]
    require(all(roles.count(role) == 1 for role in ['scene', 'object-1', 'object-2', 'reward']),
            'Need exactly one scene, two primary objects and shared reward; additional assets may have unique roles')
    require(len(set(roles)) == len(roles), 'Asset roles must be unique')
    for asset in b['assets']:
        nonblank(asset, ['file', 'role', 'provenance'], 'asset')
        path = PurePosixPath(asset['file'])
        require(not path.is_absolute() and '..' not in path.parts and ':' not in asset['file'] and '\\' not in asset['file'], 'Asset paths must be portable project-relative paths')
    validate_word_search(b['word_search'])
    exercise=b['drag_words'];choices=exercise['words'];gaps=exercise['gaps']
    require(len(choices)==4 and len(gaps)==3,'Drag the Words requires four choices and three gaps')
    ids=[w['id'] for w in choices];gapids=[g['id'] for g in gaps]
    require(len(set(ids))==4 and len(set(gapids))==3 and 'bank' not in gapids,'Drag the Words IDs must be unique; bank is reserved')
    require(all(re.fullmatch(r'[a-z][a-z0-9_-]*',v) for v in ids+gapids),'Drag the Words IDs must be safe lowercase identifiers')
    require(len({g['answer'] for g in gaps})==3 and all(g['answer'] in ids for g in gaps),'Drag the Words solutions require three distinct known choices and one distractor')
    for choice in choices:nonblank(choice,['id','label'],'drag word')
    require(len({w['label'].casefold() for w in choices})==4,'Drag the Words labels must be distinct')
    for gap in gaps:
        nonblank(gap,['id','before','feedback'],'sentence gap');require(isinstance(gap['after'],str),'Sentence suffix must be a string')
    ordering=b['sort_paragraphs'];nonblank(ordering,['title','explanation'],'paragraph ordering')
    paragraphs=ordering['paragraphs'];ids=[p['id'] for p in paragraphs]
    require(len(paragraphs)==4 and len(set(ids))==4,'Sort the Paragraphs requires four unique paragraph IDs')
    require(all(re.fullmatch(r'[a-z][a-z0-9_-]*',v) for v in ids),'Sort the Paragraphs IDs must be safe lowercase identifiers')
    for paragraph in paragraphs:nonblank(paragraph,['id','text'],'paragraph')
    require(len({p['text'].strip().casefold() for p in paragraphs})==4,'Paragraph texts must be distinct')
    for key in ['initial_order','correct_order']:
        require(isinstance(ordering[key],list) and len(ordering[key])==4 and set(ordering[key])==set(ids),'Paragraph order must be a complete permutation')
    require(ordering['initial_order']!=ordering['correct_order'],'Paragraphs must start shuffled')
    require(b['scoring'] == {'questions': 2, 'raw_scores': [0, 50, 100], 'pass_score': 0, 'answered_status': 'passed', 'unanswered_status': 'incomplete'}, 'Baseline native scoring contract differs; document and implement a requested policy change explicitly')
    return {'valid': True, 'course': b['id'], 'lessons': 3, 'situations': 2, 'quiz_questions': 2, 'note': 'Editorial structure only; source truth, UI, assets and LMS require separate verification.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('brief', type=Path)
    args = parser.parse_args()
    try:
        result = validate(json.loads(args.brief.read_text(encoding='utf-8-sig')))
    except (ValueError, KeyError, TypeError) as error:
        parser.exit(1, f'Invalid brief: {error}\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))

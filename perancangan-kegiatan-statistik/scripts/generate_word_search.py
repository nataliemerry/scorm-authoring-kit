import sys
from pathlib import Path
import random
import string
import json

# Import validator from skill
sys.path.append(str(Path(r"D:\2026\Scorm LCM\.agents\skills\scorm-exe-scenes\scripts")))
from validate_brief import validate_word_search

words_def = [
    {
        'term': 'OUTPUT',
        'clue': 'Produk atau layanan nyata yang dihasilkan dari kegiatan statistik.',
        'meaning': 'Keluaran nyata berupa tabel angka, peta tematik, indikator, atau publikasi.'
    },
    {
        'term': 'SAMPEL',
        'clue': 'Sebagian unit yang ditarik dari populasi untuk mewakili karakteristik keseluruhan.',
        'meaning': 'Unsur-unsur terpilih tempat informasi survei dikumpulkan.'
    },
    {
        'term': 'STRATA',
        'clue': 'Subkelompok populasi yang dibentuk sehomogen mungkin di dalam kelompoknya.',
        'meaning': 'Lapisan populasi dalam teknik penarikan bertingkat (stratified sampling).'
    },
    {
        'term': 'KLASTER',
        'clue': 'Gugus unit observasi yang berdekatan secara geografis dan heterogen di dalamnya.',
        'meaning': 'Kelompok unit sampling wilayah seperti blok sensus atau desa.'
    },
    {
        'term': 'AKURASI',
        'clue': 'Kondisi kerangka data yang dicatat tepat satu kali tanpa duplikasi.',
        'meaning': 'Kriteria ideal kerangka sampel yang menjamin ketelitian dan kejelasan batas.'
    }
]

# We need:
# - 10x10 uppercase grid
# - 5 words
# - rightward (0,1) or downward (1,0)
# - at least 1 crossing perpendicular inside both words
# - all non-crossing cells between any two words must have Manhattan distance > 1 (separated by filler)
# - each term appears exactly once in the grid in rightward/downward directions.

def solve():
    terms = [w['term'] for w in words_def]
    # Let's find valid placements for each word
    # Try crossing OUTPUT (horiz) and SAMPEL (vert) at P:
    # OUTPUT: O U T P U T (len 6). P is at index 3.
    # SAMPEL: S A M P E L (len 6). P is at index 3.
    # If OUTPUT is horizontal at row r, col c:
    #   OUTPUT cells: [(r, c+i) for i in range(6)]
    #   Crossing at (r, c+3).
    # Then SAMPEL must be vertical:
    #   SAMPEL cells: [(r-3+j, c+3) for j in range(6)]
    #   So r must be between 3 and 7 (since r-3>=0 and r+2<10 => r in 3..7).
    #   c must be between 0 and 4 (since c+5<10).
    
    # Let's write a search algorithm to place all 5 words satisfying constraints!
    rng = random.Random(42)
    
    for attempt in range(100000):
        # Pick grid coordinates
        # Let's test a structured layout:
        # Word 1: OUTPUT (H, len 6)
        # Word 2: SAMPEL (V, len 6) crossing OUTPUT at P
        # Word 3: STRATA (H or V, len 6)
        # Word 4: KLASTER (H or V, len 7)
        # Word 5: AKURASI (H or V, len 7)
        
        # Let's pick r_p, c_p for the crossing of OUTPUT and SAMPEL:
        r_p = rng.randint(3, 7)
        c_p = rng.randint(3, 7)
        
        # OUTPUT: horizontal crossing at index 3 -> start at (r_p, c_p - 3)
        c_out = c_p - 3
        if c_out < 0 or c_out + 6 > 10:
            continue
        out_cells = [[r_p, c_out + i] for i in range(6)]
        
        # SAMPEL: vertical crossing at index 3 -> start at (r_p - 3, c_p)
        r_sam = r_p - 3
        if r_sam < 0 or r_sam + 6 > 10:
            continue
        sam_cells = [[r_sam + j, c_p] for j in range(6)]
        
        placed = [
            {'term': 'OUTPUT', 'cells': out_cells, 'clue': words_def[0]['clue'], 'meaning': words_def[0]['meaning']},
            {'term': 'SAMPEL', 'cells': sam_cells, 'clue': words_def[1]['clue'], 'meaning': words_def[1]['meaning']}
        ]
        
        success = True
        for w_idx in [2, 3, 4]:
            t = words_def[w_idx]['term']
            t_len = len(t)
            candidates = []
            for direction in ['H', 'V']:
                if direction == 'H':
                    for r in range(10):
                        for c in range(11 - t_len):
                            cells = [[r, c + i] for i in range(t_len)]
                            candidates.append(cells)
                else:
                    for r in range(11 - t_len):
                        for c in range(10):
                            cells = [[r + j, c] for j in range(t_len)]
                            candidates.append(cells)
            rng.shuffle(candidates)
            
            cand_found = None
            for cells in candidates:
                # Check collision with already placed words
                # Cannot cross with existing words (since we already have our crossing, or could cross if interior)
                # To be safe and clean, let's make words 3,4,5 non-overlapping and distance >= 2 from all other words!
                conflict = False
                c_set = {tuple(x) for x in cells}
                for pw in placed:
                    pw_set = {tuple(x) for x in pw['cells']}
                    shared = c_set & pw_set
                    if shared:
                        conflict = True
                        break
                    # Check adjacency (Manhattan distance == 1)
                    if any(abs(r1 - r2) + abs(c1 - c2) <= 1 for r1, c1 in c_set for r2, c2 in pw_set):
                        conflict = True
                        break
                if not conflict:
                    cand_found = cells
                    break
            
            if not cand_found:
                success = False
                break
            placed.append({'term': t, 'cells': cand_found, 'clue': words_def[w_idx]['clue'], 'meaning': words_def[w_idx]['meaning']})
        
        if not success:
            continue
        
        # Build grid
        grid = [['' for _ in range(10)] for _ in range(10)]
        for pw in placed:
            for letter, (r, c) in zip(pw['term'], pw['cells']):
                grid[r][c] = letter
        
        # Fill remaining with random letters, avoiding accidental words
        letters = 'BCDFGHJKLMNPQRSTVWXYZ'
        for r in range(10):
            for c in range(10):
                if not grid[r][c]:
                    grid[r][c] = rng.choice(letters)
        
        grid_rows = [''.join(row) for row in grid]
        puzzle = {
            'grid': grid_rows,
            'words': placed
        }
        
        try:
            validate_word_search(puzzle)
            print(f'Found valid puzzle on attempt {attempt}!')
            return puzzle
        except Exception as e:
            # print('Error:', e)
            continue
            
    raise RuntimeError('Could not find puzzle')

if __name__ == '__main__':
    puzzle = solve()
    print(json.dumps(puzzle, indent=2))
    with open(r'D:\2026\Scorm LCM\perancangan-kegiatan-statistik\data\generated_word_search.json', 'w') as f:
        json.dump(puzzle, f, indent=2)

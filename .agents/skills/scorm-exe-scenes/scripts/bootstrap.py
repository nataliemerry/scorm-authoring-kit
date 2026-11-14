"""Unpack the verified standalone template into an absent or empty directory."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
from zipfile import ZipFile


def verify_payload(skill):
    archive = skill / 'assets/starter.zip'
    manifest = json.loads((skill / 'assets/starter-manifest.json').read_text(encoding='utf-8'))
    if hashlib.sha256(archive.read_bytes()).hexdigest() != manifest['archive_sha256']:
        raise ValueError('Starter archive checksum mismatch')
    with ZipFile(archive) as z:
        names = z.namelist()
        if len(names) != len(set(names)) or set(names) != set(manifest['files']):
            raise ValueError('Archive members differ from manifest')
        for name in names:
            parts = PurePosixPath(name).parts
            if not parts or name.startswith('/') or '\\' in name or '..' in parts or ':' in name:
                raise ValueError('Unsafe archive path: ' + name)
            if hashlib.sha256(z.read(name)).hexdigest() != manifest['files'][name]:
                raise ValueError('Member checksum mismatch: ' + name)
    return archive, manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    skill = Path(__file__).resolve().parents[1]
    output = args.output.resolve()
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        parser.error('Output must be absent or empty; existing work will not be overwritten')
    archive, manifest = verify_payload(skill)
    with ZipFile(archive) as z:
        # Validate every resolved destination before writing anything.
        for name in z.namelist():
            destination = (output / name).resolve()
            if not destination.is_relative_to(output):
                raise ValueError('Archive destination escapes output')
        output.mkdir(parents=True, exist_ok=True)
        z.extractall(output)
    print(f'Unpacked {len(manifest["files"])} verified files into {output}')
    print('Start with START-HERE.md. Baseline sources build C01/C12; new-topic adaptation is explicit.')


if __name__ == '__main__':
    main()

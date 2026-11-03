#!/usr/bin/env python3
"""Allocate the user-supplied male/female portrait sets to missing profiles.

Run with the configured Python/Pillow runtime and --source /path/to/头像.
The name-to-file allocation is archived; rebuilding never reassigns an
existing manifest entry silently. Existing Figma portraits are preserved.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/source/physicians/曜影医疗专家信息汇总-精简发布版.docx'
MANIFEST = ROOT / 'docs/source/physicians/avatar-assignments.json'
RUNTIME = ROOT / 'src/data/physicianAvatars.json'
EXISTING = {'周莉莉', '柳光宇'}
# The first four were supplied explicitly by the user. Wang's source prose
# uses 她; do not infer gender from a doctor's name or specialty.
GENDER_OVERRIDES = {'柳光宇': '男', '徐化梅': '女', '苗华栋': '男', '陈骏良': '男', '王春燕': '女'}
sha = lambda data: hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    args = parser.parse_args()
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    with ZipFile(DOC) as archive:
        document = ET.fromstring(archive.read('word/document.xml'))
    paragraphs = [''.join(t.text or '' for t in p.findall('.//w:t', ns)) for p in document.findall('.//w:p', ns)]
    genders = {}
    for header in (p for p in paragraphs if p.startswith('▍第')):
        number, name = re.match(r'▍第\s*(\d+)\s*位｜(.+?)（', header).groups()
        match = re.search(r'（([男女])）', header)
        gender = GENDER_OVERRIDES.get(name, match.group(1) if match else None)
        if not gender:
            raise ValueError(f'{name}: source gender is missing')
        genders[f'yaoying-{int(number):03d}'] = (name, gender)
    data = json.loads((ROOT / 'src/data/yaoyingPhysicians.json').read_text())
    archived = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else None
    original_mapping = {entry['id']: entry for entry in archived['assignments']} if archived else {}
    by_gender = {gender: sorted((args.source / f'{gender}头像').glob('*.png'), key=lambda p: p.name) for gender in ('男', '女')}
    used = {gender: 0 for gender in by_gender}
    assignments, runtime = [], {}
    output = ROOT / 'public/images/physicians/assigned'
    output.mkdir(parents=True, exist_ok=True)
    for record in data['records']:
        name, gender = genders[record['id']]
        if record['name'] != name and not (name == 'LIM SIEW JUE' and record['name'] == 'LIM SIEW JUE（Jue Lim）'):
            raise ValueError(f'{record["id"]}: document/directory identity mismatch')
        if name in EXISTING:
            continue
        previous = original_mapping.get(record['id'])
        portrait = args.source / previous['sourceFile'] if previous else by_gender[gender][used[gender]]
        if previous and (previous['gender'] != gender or previous['name'] != record['name']):
            raise ValueError(f'{name}: review changed identity/gender before reallocating')
        used[gender] += 1
        original = portrait.read_bytes()
        if previous and sha(original) != previous['sourceSHA256']:
            raise ValueError(f'{portrait.name}: source changed; review before replacing assigned portrait')
        with Image.open(io.BytesIO(original)) as image:
            if image.width != image.height:
                raise ValueError(f'{portrait.name}: expected a single square portrait')
            image = ImageOps.exif_transpose(image).convert('RGB')
            image.thumbnail((320, 320), Image.Resampling.LANCZOS)
            encoded = io.BytesIO()
            image.save(encoded, format='WEBP', quality=80, method=6)
        content = encoded.getvalue()
        file = output / f'{record["id"]}-{sha(content)[:12]}.webp'
        file.write_bytes(content)
        avatar = '/' + str(file.relative_to(ROOT / 'public'))
        runtime[record['id']] = {'gender': gender, 'avatar': avatar}
        assignments.append({
            'id': record['id'], 'name': record['name'], 'department': record['departmentSource'], 'gender': gender,
            'genderSource': 'user-2026-11-03' if name in GENDER_OVERRIDES and name != '王春燕' else 'document-pronoun-她' if name == '王春燕' else 'document-header',
            'sourceFile': str(portrait.relative_to(args.source)), 'sourceSHA256': sha(original), 'sourceBytes': len(original),
            'avatar': avatar, 'sha256': sha(content), 'bytes': len(content), 'width': 320, 'height': 320,
        })
    if used != {gender: len(files) for gender, files in by_gender.items()}:
        raise ValueError(f'Expected one unique portrait per missing doctor, got {used}')
    payload = {'version': 1, 'assignedAt': '2026-11-03', 'kind': 'user-supplied-gender-based-allocation',
               'sourceDirectory': '头像', 'doctorDocument': str(DOC.relative_to(ROOT)), 'doctorDocumentSHA256': sha(DOC.read_bytes()),
               'preservedPortraits': ['周莉莉', '柳光宇', '谭兆林', '徐宇', '陈疾忤'], 'count': len(assignments), 'assignments': assignments}
    for file, obj in ((MANIFEST, payload), (RUNTIME, runtime)):
        file.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'assigned': len(assignments), 'byGender': used, 'sourceBytes': sum(e['sourceBytes'] for e in assignments), 'webpBytes': sum(e['bytes'] for e in assignments)}, ensure_ascii=False))

if __name__ == '__main__':
    main()

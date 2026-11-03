#!/usr/bin/env python3
"""Build the supplied, numbered dental cases and named portrait derivatives."""
import hashlib
import json
import re
import zipfile
from io import BytesIO
from pathlib import Path

from docx import Document
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/source/dental-physicians'
OUT = ROOT / 'public/images/dental-cases'
DATE = '2026-11-03'
NAMES = ['车英林', '万前程', '李腾', '黄建荣', '郑锐', '蒋刚']
SLUGS = ['che-yinglin', 'wan-qiancheng', 'li-teng', 'huang-jianrong', 'zheng-rui', 'jiang-gang']
# Compared to the named, embedded portraits in 医生介绍（全）.docx and the
# corresponding portraits of the new Figma recommendation cards.
PORTRAITS = ['', '-2', '-4', '-1', '-3', '-5']
NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
           '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十']


def sha(data):
    return hashlib.sha256(data).hexdigest()


def filename(info):
    return info.filename if info.flag_bits & 0x800 else info.filename.encode('cp437').decode('utf-8')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    source_doc = SOURCE / '诺德齿科种植牙案例合集 (1).docx'
    source_zip = SOURCE / 'original/案例图(1).zip'
    avatar_zip = SOURCE / '牙科医生.zip'
    lines = [p.text.strip() for p in Document(source_doc).paragraphs if p.text.strip()]
    cases = []
    with zipfile.ZipFile(source_zip) as archive:
        images = {Path(filename(i)).name: i for i in archive.infolist()
                  if i.filename.endswith('.png') and not i.filename.startswith('__MACOSX/')}
        assert len(images) == 20
        for index, number in enumerate(NUMBERS):
            label = f'案例{number} · '
            position = next(i for i, text in enumerate(lines) if text.startswith(label))
            title, description = lines[position].removeprefix(label), lines[position + 1]
            data = archive.read(images[f'案例{number}.png'])
            image = Image.open(BytesIO(data)).convert('RGB')
            full = image.copy()
            full.thumbnail((1440, 1440), Image.Resampling.LANCZOS)
            full_path = OUT / f'case-{index + 1:02d}.webp'
            full.save(full_path, 'WEBP', quality=83, method=6)
            thumbnail = image.copy()
            thumbnail.thumbnail((320, 320), Image.Resampling.LANCZOS)
            thumb_path = OUT / f'case-{index + 1:02d}-thumb.webp'
            thumbnail.save(thumb_path, 'WEBP', quality=82, method=6)
            doctor_id = 101 + index // 3 if index < 18 else 5
            cases.append({
                'id': f'nord-{index + 1:02d}', 'number': index + 1,
                'doctorId': doctor_id, 'title': title, 'description': description,
                'images': [{'src': '/' + str(full_path.relative_to(ROOT / 'public')),
                            'thumbnail': '/' + str(thumb_path.relative_to(ROOT / 'public')),
                            'alt': title + '治疗前后对比', 'width': full.width, 'height': full.height}],
                'sourceImage': f'案例{number}.png', 'sourceImageSHA256': sha(data),
                'webpBytes': full_path.stat().st_size, 'thumbnailBytes': thumb_path.stat().st_size,
            })
    avatars = []
    with zipfile.ZipFile(avatar_zip) as archive:
        for name, slug, suffix in zip(NAMES, SLUGS, PORTRAITS):
            item = next(i for i in archive.infolist() if not i.filename.startswith('__MACOSX/')
                        and Path(filename(i)).name == f'Image (Shanti Bansal picture){suffix}.png')
            data = archive.read(item)
            image = Image.open(BytesIO(data))
            assert image.size == (240, 240)
            target = ROOT / f'public/images/dental-physicians/{slug}.webp'
            image.save(target, 'WEBP', quality=86, method=6)
            avatars.append({'name': name, 'slug': slug, 'sourceFile': Path(filename(item)).name,
                            'sourceSHA256': sha(data), 'projectPath': str(target.relative_to(ROOT)),
                            'sha256': sha(target.read_bytes()), 'bytes': target.stat().st_size})
    sources = [{'path': str(p.relative_to(ROOT)), 'sha256': sha(p.read_bytes())}
               for p in [source_doc, source_zip, avatar_zip]]
    result = {'importedAt': DATE, 'sources': sources,
              'allocation': '用户授权：六位新医生依列表顺序各三个；19–20补入谭兆林，保留原有案例。',
              'records': cases, 'portraits': avatars}
    (ROOT / 'src/data/dentalCaseSupplements.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'cases': len(cases), 'portraits': len(avatars),
                      'fullImageBytes': sum(c['webpBytes'] for c in cases),
                      'thumbnailBytes': sum(c['thumbnailBytes'] for c in cases)}, indent=2))


if __name__ == '__main__':
    main()

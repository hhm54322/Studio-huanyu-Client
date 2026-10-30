#!/usr/bin/env python3
"""Import the six supplied dental profiles; retain both originals as sources."""
import hashlib
import json
import re
from io import BytesIO
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / 'docs/source/dental-physicians'
PLATFORM = ARCHIVE / '寰宇云医牙科平台-医生信息文字版.docx'
ORIGINAL = ARCHIVE / '医生介绍（全）.docx'
NAMES = ['车英林', '万前程', '李腾', '黄建荣', '郑锐', '蒋刚']
SLUGS = ['che-yinglin', 'wan-qiancheng', 'li-teng', 'huang-jianrong', 'zheng-rui', 'jiang-gang']

def blocks(document):
    for element in document.element.body:
        if element.tag == qn('w:p'):
            yield {'text': Paragraph(element, document).text.strip(), 'element': element}
        elif element.tag == qn('w:tbl'):
            yield {'rows': [[cell.text.strip() for cell in row.cells] for row in Table(element, document).rows]}

platform = list(blocks(Document(PLATFORM)))
original_doc = Document(ORIGINAL)
original = list(blocks(original_doc))
starts = [index for index, block in enumerate(platform) if re.match(r'^（[一二三四五六]）(' + '|'.join(NAMES) + ')$', block.get('text', ''))]
assert len(starts) == 6
original_starts = [index for index, block in enumerate(original) if block.get('text') in NAMES]
assert len(original_starts) == 6
summary = next(block['rows'] for block in platform if block.get('rows', [[]])[0] == ['姓名', '职务职称', '城市·专科', '从业经验', '机构', '参考价格'])
common_tables = [block['rows'] for block in platform[:starts[0]] if 'rows' in block]
records, assets = [], []
for index, name in enumerate(NAMES):
    section = platform[starts[index]:starts[index + 1] if index < 5 else next(i for i, block in enumerate(platform) if block.get('text', '').startswith('四、'))]
    paragraphs = [block['text'] for block in section if 'text' in block]
    fields = dict(next(block['rows'][1:] for block in section if block.get('rows', [[]])[0] == ['字段', '内容']))
    assert fields['医生姓名'] == name
    original_section = original[original_starts[index]:original_starts[index + 1] if index < 5 else len(original)]
    original_lines = [block['text'] for block in original_section if block.get('text')]
    field_at = original_lines.index('专业领域') if '专业领域' in original_lines else len(original_lines)
    biography_at = paragraphs.index('3. 医生简介（详情页·医生简介）')
    credentials_at = paragraphs.index('专业资质：')
    credentials_end = paragraphs.index('4. 治疗流程（种植牙标准流程）')
    reviews = next(block['rows'][1:] for block in section if block.get('rows', [[]])[0] == ['序号', '服务类型', '评价内容', '来源'])
    slug = SLUGS[index]
    blips = [element for block in original_section for element in block['element'].iter(qn('a:blip'))]
    assert len(blips) == 1, f'{name}: portrait mapping ambiguous'
    relation = original_doc.part.rels[blips[0].get(qn('r:embed'))]
    image = Image.open(BytesIO(relation.target_part.blob)).convert('RGBA')
    # The source document remains intact. A top-aligned square derivative fits
    # the Figma 60px portrait mask and removes only unused transparent margins.
    bbox = image.getchannel('A').getbbox()
    image = image.crop(bbox) if bbox else image
    image = ImageOps.fit(image, (240, 240), Image.Resampling.LANCZOS, centering=(.5, 0))
    target = ROOT / f'public/images/dental-physicians/{slug}.webp'
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, 'WEBP', quality=86, method=6)
    assets.append({'name': name, 'source': str(ORIGINAL.relative_to(ROOT)), 'relationship': relation.rId, 'sourceSHA256': hashlib.sha256(relation.target_part.blob).hexdigest(), 'projectPath': str(target.relative_to(ROOT)), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'bytes': target.stat().st_size})
    records.append({
        'id': 101 + index, 'slug': slug, 'name': name, 'title': fields['职务职称'],
        'hospital': fields['机构'], 'institutionLabel': '寰宇云医齿科', 'city': fields['城市'],
        'experience': summary[index + 1][3], 'languages': [], 'background': '口腔专科',
        'specialty': fields['擅长（一句话）'], 'department': fields['专科方向'],
        'rating': '', 'cases': '0', 'portrait': f'/images/dental-physicians/{slug}.webp',
        'tags': [], 'startingPrice': 1080, 'priceLabel': summary[index + 1][5],
        'priceDescription': re.sub(r'；为近期活动口径，正式上线以平台实际报价为准', '', fields['参考价格']),
        'bio': paragraphs[biography_at + 1], 'credentials': paragraphs[credentials_at + 1:credentials_end],
        'professionalFields': fields['专业领域'].split('；'),
        'originalCredentials': original_lines[1:field_at], 'originalSpecialty': original_lines[field_at + 1:],
        'institutionIntro': next(text.removeprefix('机构简介：') for text in paragraphs if text.startswith('机构简介：')),
        'institutionEnvironment': next(text.removeprefix('环境与配置：') for text in paragraphs if text.startswith('环境与配置：')),
        'reviews': [{'service': row[1], 'content': row[2], 'source': row[3]} for row in reviews],
    })
    assert len(records[-1]['credentials']) == 4

payload = {
    'sources': [{'path': str(file.relative_to(ROOT)), 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()} for file in [PLATFORM, ORIGINAL]],
    'records': records,
    'treatment': [{'time': row[1], 'title': row[2], 'description': row[3]} for row in common_tables[1][1:]],
    'services': [{'title': row[1], 'description': row[2]} for row in common_tables[2][1:]],
    'assets': assets,
}
assert len(payload['treatment']) == 6 and len(payload['services']) == 10
(ROOT / 'src/data/dentalPhysicians.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
print(f'Imported {len(records)} doctors, 6 portraits ({sum(asset["bytes"] for asset in assets)} bytes), 6 treatment steps and 10 services')

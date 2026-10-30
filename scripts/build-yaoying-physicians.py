#!/usr/bin/env python3
"""Build the editable doctor directory data from the archived Yaoying DOCX."""
from __future__ import annotations
import json, re
from pathlib import Path
from docx import Document

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/source/physicians/曜影医疗专家信息汇总.docx'
OUTPUT = ROOT / 'src/data/yaoyingPhysicians.json'
SECTIONS = ('基本信息', '专业擅长', '执业履历', '学术任职', '科研成果', '可提供的跨境医疗服务')

paras = [p.text.strip() for p in Document(SOURCE).paragraphs]
starts = [i for i, text in enumerate(paras) if text.startswith('▍第')]
if len(starts) != 177:
    raise SystemExit(f'expected 177 records, found {len(starts)}')

records = []
for index, start in enumerate(starts):
    end = starts[index + 1] if index + 1 < len(starts) else len(paras)
    block = paras[start:end]
    header = block[0]
    match = re.match(r'▍第\s*(\d+)\s*位｜(.+?)（([^·）]+)·([^）]+)）', header)
    if not match:
        raise SystemExit(f'cannot parse header: {header}')
    source_number, name, department, employment_type = match.groups()
    fields = {'name': name, 'department': department, 'employmentType': employment_type}
    for line in block[1:]:
        if line.startswith(('姓名：', '职称：', '标签：', '任职：', '擅长：', '底部小字：', '页面标题：')):
            key, value = line.split('：', 1)
            fields[key] = value.strip()
    section = None
    for line in block:
        if line.startswith('—— 以下为源表原始信息'):
            break  # Archived in the DOCX, never publish the designer-only appendix.
        if line in SECTIONS:
            section = line
            fields[section] = []
            continue
        if section and line and not line.startswith('▍') and not line.startswith(('姓名：', '职称：', '标签：', '任职：', '擅长：', '底部小字：', '页面标题：')):
            if line.startswith('—— 以下为源表原始信息') or line.startswith('────────────────'):
                continue
            fields[section].append(line)
    missing = lambda value: value.strip('•□ ').strip() in {'', '/', '／', '—', '-'} or bool(re.search(r'[:：]\s*[/／—-]\s*$', value))
    clean = lambda values: [v for v in values if not missing(v)]
    record = {
        'id': f'yaoying-{int(source_number):03d}',
        'sourceNumber': int(source_number),
        'name': fields['name'],
        'department': department,
        'departmentSource': department,
        'employmentType': employment_type,
        'title': '' if missing(fields.get('职称', '')) else fields.get('职称', ''),
        'label': fields.get('标签', ''),
        'workplace': fields.get('任职', ''),
        'specialty': fields.get('擅长', ''),
        'footerLabel': fields.get('底部小字', ''),
        'basicInfo': clean(fields.get('基本信息', [])),
        'professionalExpertise': clean(fields.get('专业擅长', [])),
        'career': clean(fields.get('执业履历', [])),
        'academic': clean(fields.get('学术任职', [])),
        'research': clean(fields.get('科研成果', [])),
        'crossBorderServices': clean(fields.get('可提供的跨境医疗服务', [])),
    }
    records.append(record)

if len({record['id'] for record in records}) != len(records):
    raise SystemExit('duplicate source numbers; review the source document before importing')

payload = {
    'source': 'docs/source/physicians/曜影医疗专家信息汇总.docx',
    'generatedAt': '2026-10-30',
    'recordCount': len(records),
    'departments': sorted({r['departmentSource'] for r in records}),
    'records': records,
}
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
print(f'Wrote {len(records)} records to {OUTPUT}')
print('Departments:', ', '.join(payload['departments']))

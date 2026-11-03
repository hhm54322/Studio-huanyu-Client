/** Public service topics only. Never insert free-text medical notes into a contact URL. */
export const contactTopicAliases: Record<string, readonly string[]> = {
  general: [], oncology: ['肿瘤科', '肿瘤', '肿瘤治疗'],
  cardiovascular: ['心血管', '心血管科'], neurosurgery: ['神经外科'], orthopedics: ['骨科', 'orthopedic'],
  dental: ['牙科', '口腔科', '口腔'], gynecology: ['妇科'], ophthalmology: ['眼科'],
  gastroenterology: ['消化科'], respiratory: ['呼吸科'], urology: ['泌尿外科'],
  plastic_surgery: ['整形外科'], cell_therapy: ['细胞治疗'], pediatrics: ['儿科'],
  traditional_medicine: ['中医药', '中医康养'], breast_cancer: ['乳腺癌'], lung_cancer: ['肺癌'],
  nasopharyngeal_cancer: ['鼻咽癌'], liver_cancer: ['肝癌'], cardiovascular_tumor: ['心血管肿瘤'],
  spine_surgery: ['脊柱外科'], premium_checkup: ['高端体检', '健康体检', 'checkup'],
  cardiology_cardiothoracic: ['心内科与心胸外科', 'heart_surgery'], endocrinology: ['内分泌与代谢科', 'endocrinology_metabolism'],
  implant: ['种植牙'], whitening: ['牙齿美白'], veneer: ['牙齿贴面'], aligner: ['隐形正畸'],
  crown: ['全瓷牙冠'], periodontal: ['洁牙 / 牙周'], 'root-canal': ['根管治疗'], children: ['儿童齿科'],
}
export type ContactTopic = keyof typeof contactTopicAliases
const aliases = new Map(Object.entries(contactTopicAliases).flatMap(([key, names]) => [key, ...names].map(name => [name, key] as const)))
export const resolveContactTopic = (value: unknown): ContactTopic | undefined => typeof value === 'string' ? aliases.get(value.trim()) : undefined

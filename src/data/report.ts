/** 报告页数据 */

export const diseases = [
  { name: '乳腺癌', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { name: '肺癌', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  { name: '鼻咽癌', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { name: '肝癌', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { name: '心血管肿瘤', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  { name: '神经外科', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { name: '脊柱外科', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { name: '高端体检', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  { name: '牙科', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { name: '心内科与心胸外科', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { name: '内分泌与代谢科', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
]

export const regions = [
  '北美（美国/加拿大）',
  '欧洲（英国/德国/法国）',
  '东南亚（新加坡/泰国/马来西亚）',
  '中东（阿联酋/沙特）',
  '日韩',
  '澳新',
  '其他',
]

export const budgets = ['<$10,000', '$10,000-$30,000', '$30,000-$60,000', '$60,000-$100,000', '>$100,000']

export const reportData = {
  id: '#2026-8842',
  date: '2026年5月',
  disease: '乳腺癌（早期）',
  treatment: '保乳手术 + 术后辅助化疗',
  need: '希望尽快手术，控制总费用在合理范围',
  countries: [
    { flag: '🇨🇳', name: '中国（推荐）', fee: '$15,000 - $25,000', wait: '7-14天', tech: '保乳技术成熟，5年生存率接近发达国家', service: '国际医疗部全流程英文服务', visa: '医疗签证快速通道，48小时邀请函', follow: '术后1/3/6/12月随访，远程云病房' },
    { flag: '🇺🇸', name: '美国', fee: '$80,000 - $150,000', wait: '2-6周', tech: '顶尖技术，新药可及性最高', service: '部分医院提供国际患者协调', visa: 'B1/B2签证，需面签预约', follow: '回国后随访不便' },
    { flag: '🇬🇧', name: '英国', fee: '$50,000 - $80,000', wait: 'NHS等待时间长；私立1-3周', tech: '技术成熟，临床研究丰富', service: '私立医院英文服务完善', visa: '医疗签证审批周期较长', follow: '跨境随访支持有限' },
    { flag: '🇩🇪', name: '德国', fee: '$40,000 - $70,000', wait: '2-4周', tech: '外科技术精湛，康复体系完善', service: '主要城市医院有国际部', visa: '申根医疗签证', follow: '德语区随访需翻译支持' },
    { flag: '🇸🇬', name: '新加坡', fee: '$35,000 - $55,000', wait: '1-3周', tech: '亚洲领先，双语环境', service: '国际患者服务成熟', visa: '入境便利', follow: '随访方便但费用较高' },
    { flag: '🇹🇭', name: '泰国', fee: '$12,000 - $20,000', wait: '1-2周', tech: '部分项目领先，但复杂病例经验有限', service: '医疗旅游成熟', visa: '落地签/旅游签便利', follow: '远程随访相对薄弱' },
    { flag: '🇲🇾', name: '马来西亚', fee: '$15,000 - $25,000', wait: '1-2周', tech: '专科发展迅速，性价比突出', service: '医疗旅游服务完善', visa: '入境便利', follow: '中文/英文随访支持' },
    { flag: '🇯🇵', name: '日本', fee: '$45,000 - $70,000', wait: '2-4周', tech: '技术顶尖，早癌筛查世界领先', service: '日语为主，部分医院英文有限', visa: '医疗签证需日方担保', follow: '文化差异较大，随访沟通成本高' },
  ],
  score: 85,
  advantages: [
    { label: '费用优势', value: '节省70-85%' },
    { label: '效率优势', value: '等待缩短80%' },
    { label: '关键提示', value: '选择JCI认证医院+国际医疗部' },
  ],
  concerns: [
    { concern: '语言沟通', solution: '寰宇云医配备医学翻译全程陪诊' },
    { concern: '流程不熟悉', solution: '专属就医管家，一站式手续代办' },
    { concern: '保险理赔', solution: '协助对接国际保险直付或事后理赔' },
    { concern: '术后随访', solution: '跨境云病房+月度远程随访' },
  ],
  hospitals: [
    { city: '北京', name: '北京协和医院', reason: '乳腺疾病全国顶尖，国际医疗部经验丰富' },
    { city: '北京', name: '北大人民医院', reason: '乳腺外科国家重点学科，保乳率高' },
    { city: '上海', name: '复旦大学附属肿瘤医院', reason: '肿瘤专科全国第一，精准治疗领先' },
    { city: '上海', name: '瑞金医院', reason: '乳腺疾病综合治疗实力雄厚' },
  ],
  plan: {
    direction: '乳腺外科保乳手术 → 病理分期 → 辅助化疗（如需） → 内分泌治疗',
    duration: '预计在华停留14-21天',
    breakdown: [
      { item: '术前检查与评估', cost: '$800-$1,500' },
      { item: '保乳手术及住院', cost: '$6,000-$10,000' },
      { item: '化疗（4-6周期门诊）', cost: '$3,000-$5,000' },
      { item: '内分泌治疗（1年药物）', cost: '$1,500-$3,000' },
      { item: '住宿与生活', cost: '$2,000-$4,000' },
      { item: '翻译与陪诊服务', cost: '$1,000-$2,000' },
    ],
  },
}

export const packages = [
  {
    name: '书面评估基础包',
    price: '¥399',
    features: ['病历整理与归档', '专家智能匹配', '书面初步评估PDF'],
    highlight: false,
    icon: 'FileText',
  },
  {
    name: '单次视频面诊标准包',
    price: '¥1,299',
    features: ['专家视频面诊15-30分钟', '书面诊疗总结', '7天内1次跟进答疑'],
    highlight: true,
    icon: 'Video',
  },
  {
    name: '双专家视频面诊深度包',
    price: '¥2,399',
    features: ['2位相关科室专家会诊', '综合诊疗报告', '14天内2次跟进答疑'],
    highlight: false,
    icon: 'MessageSquare',
  },
]

export const coreHighlights = [
  '副主任医师及以上人工审核',
  '精准到千位的费用清单',
  '锁定具体专家 + 预留VIP号源',
  '个性化定制全流程方案书',
  '医疗签证邀请函（最快48小时）',
  '病例翻译准确率98.5%',
]

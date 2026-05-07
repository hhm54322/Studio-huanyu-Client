/** 首页雷达图数据 */
export const radarData = [
  { subject: '费用优势', china: 95, overseas: 40 },
  { subject: '技术实力', china: 88, overseas: 90 },
  { subject: '等待时长', china: 92, overseas: 55 },
  { subject: '国际服务', china: 85, overseas: 75 },
  { subject: '签证便利', china: 80, overseas: 60 },
  { subject: '术后随访', china: 90, overseas: 50 },
]

/** 首页柱状图数据 (单位: 千美元) */
export const barData = [
  { name: '肿瘤手术', china: 22, usa: 115, uk: 65, germany: 55, singapore: 45, japan: 57 },
  { name: '心血管手术', china: 27, usa: 150, uk: 80, germany: 65, singapore: 52, japan: 70 },
  { name: '质子治疗', china: 46, usa: 200, uk: 100, germany: 85, singapore: 105, japan: 95 },
  { name: 'CAR-T', china: 65, usa: 500, uk: 325, germany: 275, singapore: 275, japan: 325 },
]

/** 首页 + 费用对比页 费用矩阵 (行: 治疗, 列: 国家) */
export const countries = ['美国', '英国', '德国', '马来西亚', '新加坡', '泰国', '中国', '日本']

export const costMatrix = [
  ['肿瘤手术', '$80K-150K', '$50K-80K', '$40K-70K', '$15K-25K', '$35K-55K', '$12K-20K', '$15K-30K', '$45K-70K'],
  ['心血管手术', '$100K-200K', '$60K-100K', '$50K-80K', '$18K-30K', '$40K-65K', '$15K-25K', '$20K-35K', '$55K-85K'],
  ['慢性病年管理', '$30K-50K', '$20K-35K', '$15K-25K', '$5K-8K', '$12K-20K', '$4K-7K', '$3K-6K', '$18K-28K'],
  ['质子治疗', '$150K-250K', '$80K-120K', '$70K-100K', 'N/A', '$80K-130K', 'N/A', '$38K-55K', '$80K-110K'],
  ['CAR-T', '$400K-600K', '$250K-400K', '$200K-350K', 'N/A', '$200K-350K', 'N/A', '$50K-80K', '$250K-400K'],
  ['PD-1年费用', '$150K-200K', '$100K-150K', '$80K-120K', '$25K-40K', '$60K-100K', '$20K-35K', '$3K-5K', '$100K-150K'],
  ['化疗(6周期)', '$60K-100K', '$40K-60K', '$30K-50K', '$8K-15K', '$25K-40K', '$6K-12K', '$5K-10K', '$35K-55K'],
]

/** 中国列在 countries 中的索引 (从0计) */
export const chinaColumnIndex = 6

/** 首页真实案例 */
export const savingsCases = [
  {
    id: 1,
    title: '肿瘤治疗（乳腺癌）',
    patient: 'Sarah M.，英国',
    wait: '英国 NHS 等待62天 → 中国 7天手术',
    cost: '英国私立£60K vs 中国¥120K(约$17K)',
    saving: '节省72%',
    result: '保乳手术成功，术后恢复良好',
    iconType: 'heartPulse' as const,
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    iconColor: 'text-pink-600',
  },
  {
    id: 2,
    title: '心血管治疗（心脏搭桥）',
    patient: 'Ahmed K.，阿联酋',
    wait: '德国4周 → 中国3天入院',
    cost: '德国€65K → 中国¥180K(约$25K)',
    saving: '节省65%',
    result: '微创搭桥，术后5天出院',
    iconType: 'stethoscope' as const,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
  },
  {
    id: 3,
    title: '慢性病管理（糖尿病+肾病）',
    patient: 'Linda W.，新加坡',
    wait: '新加坡 S$25K/年 → 中国¥45K/年(约$6.5K)',
    cost: '年度管理费用',
    saving: '节省74%',
    result: '中西医结合治疗，血糖控制稳定',
    iconType: 'shield' as const,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
  },
]

/** 免费 vs 专业版对比 */
export const freeVsPro = [
  { feature: '病历整理与专家匹配', free: true, pro: true },
  { feature: '初步书面评估PDF', free: true, pro: true },
  { feature: '6国费用对比概览', free: true, pro: true },
  { feature: '副主任医师及以上人工审核', free: false, pro: true },
  { feature: '精准到千位费用清单', free: false, pro: true },
  { feature: '锁定具体专家 + VIP号源预留', free: false, pro: true },
  { feature: '个性化全流程方案书', free: false, pro: true },
  { feature: '医疗签证邀请函（48小时）', free: false, pro: true },
  { feature: '病例翻译准确率98.5%', free: false, pro: true },
  { feature: '视频面诊 + 跟进答疑', free: false, pro: true },
]

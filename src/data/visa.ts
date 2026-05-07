/** 签证免签国家数据 */
export interface Country {
  name: string
  flag: string
  days: string
}

export interface CountryRegion {
  region: string
  countries: Country[]
}

export const visaFreeData: CountryRegion[] = [
  {
    region: '亚洲',
    countries: [
      { name: '新加坡', flag: '🇸🇬', days: '30天' },
      { name: '马尔代夫', flag: '🇲🇻', days: '30天' },
      { name: '哈萨克斯坦', flag: '🇰🇿', days: '30天' },
      { name: '阿联酋', flag: '🇦🇪', days: '30天' },
      { name: '卡塔尔', flag: '🇶🇦', days: '30天' },
      { name: '亚美尼亚', flag: '🇦🇲', days: '90天' },
      { name: '格鲁吉亚', flag: '🇬🇪', days: '30天' },
      { name: '韩国（济州岛）', flag: '🇰🇷', days: '30天' },
    ],
  },
  {
    region: '欧洲',
    countries: [
      { name: '法国', flag: '🇫🇷', days: '15天' },
      { name: '德国', flag: '🇩🇪', days: '15天' },
      { name: '意大利', flag: '🇮🇹', days: '15天' },
      { name: '荷兰', flag: '🇳🇱', days: '15天' },
      { name: '西班牙', flag: '🇪🇸', days: '15天' },
      { name: '瑞士', flag: '🇨🇭', days: '15天' },
      { name: '爱尔兰', flag: '🇮🇪', days: '15天' },
      { name: '奥地利', flag: '🇦🇹', days: '15天' },
      { name: '比利时', flag: '🇧🇪', days: '15天' },
      { name: '卢森堡', flag: '🇱🇺', days: '15天' },
      { name: '新西兰', flag: '🇳🇿', days: '15天' },
      { name: '澳大利亚', flag: '🇦🇺', days: '15天' },
      { name: '波兰', flag: '🇵🇱', days: '15天' },
      { name: '匈牙利', flag: '🇭🇺', days: '15天' },
      { name: '斯洛伐克', flag: '🇸🇰', days: '15天' },
      { name: '斯洛文尼亚', flag: '🇸🇮', days: '15天' },
      { name: '挪威', flag: '🇳🇴', days: '15天' },
      { name: '芬兰', flag: '🇫🇮', days: '15天' },
      { name: '丹麦', flag: '🇩🇰', days: '15天' },
      { name: '冰岛', flag: '🇮🇸', days: '15天' },
      { name: '安道尔', flag: '🇦🇩', days: '15天' },
      { name: '摩纳哥', flag: '🇲🇨', days: '15天' },
      { name: '列支敦士登', flag: '🇱🇮', days: '15天' },
    ],
  },
  {
    region: '北美 / 南美 / 其他',
    countries: [
      { name: '美国（过境免签）', flag: '🇺🇸', days: '24小时' },
      { name: '加拿大（过境免签）', flag: '🇨🇦', days: '24小时' },
      { name: '巴西', flag: '🇧🇷', days: '90天' },
      { name: '阿根廷', flag: '🇦🇷', days: '90天' },
      { name: '智利', flag: '🇨🇱', days: '90天' },
      { name: '塞尔维亚', flag: '🇷🇸', days: '30天' },
      { name: '波黑', flag: '🇧🇦', days: '90天' },
      { name: '黑山', flag: '🇲🇪', days: '免签' },
      { name: '阿尔巴尼亚', flag: '🇦🇱', days: '90天' },
      { name: '毛里求斯', flag: '🇲🇺', days: '60天' },
      { name: '塞舌尔', flag: '🇸🇨', days: '30天' },
      { name: '斐济', flag: '🇫🇯', days: '30天' },
      { name: '汤加', flag: '🇹🇴', days: '30天' },
      { name: '萨摩亚', flag: '🇼🇸', days: '60天' },
    ],
  },
]

/** 签证所需材料 */
export const materials = [
  { icon: 'FileText', text: '护照原件（有效期6个月以上）' },
  { icon: 'FileText', text: '签证申请表（在线填写并打印）' },
  { icon: 'CreditCard', text: '近期白底彩色照片（33mm×48mm）' },
  { icon: 'Stethoscope', text: '医疗邀请函（由合作医院出具，寰宇云医48小时内提供）' },
  { icon: 'FileText', text: '医院预约确认函' },
  { icon: 'CreditCard', text: '财务证明（银行存款证明或收入证明）' },
  { icon: 'Plane', text: '往返机票预订单' },
  { icon: 'Shield', text: '在华期间保险证明（如适用）' },
  { icon: 'HeartPulse', text: '既往病历摘要（英文/中文翻译）' },
]

/** 签证办理时间线 */
export const timelineSteps = [
  { step: 1, title: '提交资料', desc: '在线提交基本信息', icon: 'FileText' },
  { step: 2, title: '获取邀请函', desc: '48小时内出具', icon: 'Stethoscope' },
  { step: 3, title: '递交签证申请', desc: '前往使领馆/签证中心', icon: 'FileText' },
  { step: 4, title: '签证审核', desc: '3-7个工作日', icon: 'Clock' },
  { step: 5, title: '签证获批', desc: '领取护照及签证', icon: 'CheckCircle' },
  { step: 6, title: '预订机票出发', desc: '开启就医之旅', icon: 'Plane' },
]

/** 加急服务 */
export const urgentServices = [
  {
    title: '标准办理',
    price: '包含在服务中',
    time: '7-10 工作日',
    features: ['完整材料审核', '邀请函出具', '进度跟踪'],
    highlight: false,
  },
  {
    title: '加急办理',
    price: '+$50',
    time: '3-5 工作日',
    features: ['优先材料审核', '快速邀请函', '加急递交'],
    highlight: true,
  },
  {
    title: '特急办理',
    price: '+$100',
    time: '1-2 工作日',
    features: ['VIP通道', '最快邀请函', '专人跟进'],
    highlight: false,
  },
]

/** FAQ数据 */
export const faqData = [
  {
    question: '医疗签证可以延期吗？',
    answer: '可以，治疗期间可向医院申请延期，每次延期最长90天。寰宇云医可协助您准备延期所需的医疗证明和申请材料。',
  },
  {
    question: '家属可以陪同吗？',
    answer: '可以，家属可申请S2签证（探亲），与患者同时递交。S2签证有效期与患者M签证匹配，方便家属全程陪同照顾。',
  },
  {
    question: '需要体检吗？',
    answer: '一般不需要，但部分国家公民（如非洲部分国家）需提供健康证明。具体要求请咨询寰宇云医签证顾问。',
  },
  {
    question: '签证被拒怎么办？',
    answer: '寰宇云医提供免费申诉指导，协助补充材料重新申请。我们的专业团队会根据拒签原因制定针对性的解决方案。',
  },
  {
    question: '可以在华期间转换签证类型吗？',
    answer: '可以，治疗期间如需转签可向出入境管理部门申请。寰宇云医可提供转签咨询和材料准备服务。',
  },
]

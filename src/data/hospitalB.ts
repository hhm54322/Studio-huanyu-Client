/** 医院端（B端）数据 */

/* ───────── Home 首页 ───────── */
export const heroStats = [
  { value: '128万+', label: '2025年国际患者接诊人次', icon: 'Users' },
  { value: '73.6%', label: '同比增长率', icon: 'TrendingUp' },
  { value: '¥299-$9,999', label: '平台服务费/月', icon: 'DollarSign' },
  { value: '518种', label: '博鳌乐城特许药械', icon: 'Pill' },
]

export const painPoints = [
  '参加海外展会，成本高转化率低',
  '语言障碍，沟通效率低下',
  '合规风险，政策不熟悉',
  '收款困难，跨境结算复杂',
]

export const solutions = [
  'AI精准匹配，患者直接找到你',
  '多语言支持，专业医学翻译',
  '合规保障，全流程法务支持',
  '安全收款，一站式跨境结算',
]

export const coreSolutions = [
  {
    icon: 'Brain',
    title: 'AI智能患者匹配',
    desc: '平台AI自动将符合条件的国际患者匹配到你的科室，精准度高达95%',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: 'BarChart3',
    title: '全流程管理工具',
    desc: '从询盘到随访的一站式管理后台，提升运营效率300%',
    color: 'text-[#319795]',
    bg: 'bg-teal-50',
  },
  {
    icon: 'TrendingUp',
    title: '数据洞察报告',
    desc: '月度海外患者需求趋势分析，助你精准把握市场动态',
    color: 'text-[#D69E2E]',
    bg: 'bg-amber-50',
  },
]

export const dashboardFeatures = [
  { icon: 'Users', text: '患者线索管理' },
  { icon: 'Calendar', text: '预约排期' },
  { icon: 'MessageSquare', text: '多语言沟通' },
  { icon: 'Receipt', text: '财务报表' },
]

export const processSteps = [
  { icon: 'ClipboardCheck', title: '提交申请', desc: '填写医院基本信息' },
  { icon: 'UserCheck', title: '资质审核', desc: '平台3个工作日内审核' },
  { icon: 'Settings', title: '系统对接', desc: 'API或后台配置' },
  { icon: 'Rocket', title: '开始接收患者', desc: '上线运营获客' },
]

export const successCases = [
  {
    name: '北京协和医院国际医疗部',
    dept: '肿瘤科',
    growth: '+180%',
    revenue: '¥420万/年',
    quote: '入驻3个月，月均国际患者从2人增长到15人',
  },
  {
    name: '上海瑞金医院',
    dept: '心血管中心',
    growth: '+250%',
    revenue: '¥680万/年',
    quote: '东南亚患者占比提升至40%，品牌国际影响力显著提升',
  },
  {
    name: '博鳌乐城恒大国际医院',
    dept: '特许药械科',
    growth: '+400%',
    revenue: '¥1200万/年',
    quote: '借助特许药械政策+平台引流，成为国际医疗标杆',
  },
]

/* ───────── Solutions 解决方案 ───────── */
export const pricingPlans = [
  {
    title: 'Pro版',
    price: '¥1,999',
    period: '适合中小型医院',
    icon: 'Zap',
    highlighted: false,
    features: [
      '智能病例翻译',
      '月度数据报告',
      '优先流量分配',
      '多语言客服支持',
      '基础数据分析',
    ],
    unavailable: [
      'API对接HIS系统',
      '定制化合规方案',
      '白标服务',
      '专属客户成功经理',
    ],
    cta: '选择Pro版',
  },
  {
    title: 'Enterprise版',
    price: '¥9,999',
    period: '适合大型三甲医院',
    icon: 'Shield',
    highlighted: true,
    features: [
      '智能病例翻译',
      '月度数据报告',
      '优先流量分配',
      '多语言客服支持',
      'API对接HIS系统',
      '定制化合规方案',
      '白标服务',
      '专属客户成功经理',
      '7x24技术支持',
      '联合品牌宣传',
    ],
    unavailable: [],
    cta: '选择Enterprise版',
  },
]

export const customPlanFeatures = [
  '集团多院区统一管理',
  '私有化部署选项',
  '专属技术团队',
  '灵活付费模式',
]

export const comparisonRows = [
  { feature: '智能病例翻译', pro: true, enterprise: true },
  { feature: '月度数据报告', pro: true, enterprise: true },
  { feature: '优先流量分配', pro: true, enterprise: true },
  { feature: '多语言客服支持', pro: true, enterprise: true },
  { feature: 'API对接HIS系统', pro: false, enterprise: true },
  { feature: '定制化合规方案', pro: false, enterprise: true },
  { feature: '白标服务', pro: false, enterprise: true },
  { feature: '专属客户成功经理', pro: false, enterprise: true },
  { feature: '7x24技术支持', pro: false, enterprise: true },
  { feature: '联合品牌宣传', pro: false, enterprise: true },
]

export const featureHighlights = [
  { icon: 'Brain', title: 'AI智能匹配', desc: '基于病情、语言、预算等多维度精准匹配' },
  { icon: 'FileText', title: '病例自动翻译', desc: '医学级翻译引擎，支持30+语言' },
  { icon: 'MessageCircle', title: '多语言客服', desc: '7x24小时专业医学客服团队' },
  { icon: 'Headset', title: '专属经理', desc: 'Enterprise客户配备专属成功经理' },
]

/* ───────── CaseStudies 案例研究 ───────── */
export const platformStats = [
  { icon: 'Building2', value: '286+', label: '合作医院' },
  { icon: 'Users', value: '12,800', label: '月活国际患者' },
  { icon: 'DollarSign', value: '¥3,200', label: '平均获客成本' },
  { icon: 'Smile', value: '96.8%', label: '患者满意度' },
]

export const caseStudies = [
  {
    name: '北京和谐三甲医院',
    dept: '肿瘤科',
    challenge: '国际患者获取渠道有限，月均仅接收2-3位海外患者，科室高端医疗资源闲置',
    solution: '接入寰宇云医AI匹配系统，优化多语言病例展示，参与平台东南亚肿瘤患者定向引流计划',
    results: [
      { label: '月均国际患者', value: '15人' },
      { label: '年收入增长', value: '¥300万' },
      { label: '患者满意度', value: '98%' },
    ],
    quote: '寰宇云医让我们在零额外人力投入的情况下，实现了国际患者的稳定增长。AI匹配的患者质量非常高。',
    author: '张明华',
    role: '国际医疗部主任',
  },
  {
    name: '广州南方专科医院',
    dept: '鼻咽癌中心',
    challenge: '鼻咽癌专科优势未在国际市场形成品牌认知，缺乏精准触达东南亚患者的渠道',
    solution: '通过平台精准匹配东南亚鼻咽癌高发区患者，配合多语言客服和病例翻译服务',
    results: [
      { label: '国际患者占比', value: '35%' },
      { label: '区域排名', value: 'No.1' },
      { label: '复购推荐率', value: '85%' },
    ],
    quote: '平台帮助我们将鼻咽癌专科打造成了区域国际化标杆，现在每天都有来自东南亚的咨询。',
    author: '李建国',
    role: '院长',
  },
  {
    name: '博鳌乐城国际医院',
    dept: '特许药械科',
    challenge: '虽然拥有特许药械政策优势，但国际患者知晓度低，患者占比仅5%',
    solution: '结合博鳌乐城政策优势，通过平台向全球患者展示特许药械资源，配合精准广告投放',
    results: [
      { label: '国际患者占比', value: '25%' },
      { label: '提升幅度', value: '+400%' },
      { label: '特许药械使用', value: '+280%' },
    ],
    quote: '特许药械政策+寰宇云医平台引流，让我们真正成为国际医疗旅游的目的地。',
    author: '王芳',
    role: '国际部总监',
  },
]

export const growthData = [
  { month: '1月', value: 35 },
  { month: '2月', value: 42 },
  { month: '3月', value: 58 },
  { month: '4月', value: 65 },
  { month: '5月', value: 78 },
  { month: '6月', value: 92 },
  { month: '7月', value: 105 },
  { month: '8月', value: 118 },
  { month: '9月', value: 135 },
  { month: '10月', value: 148 },
  { month: '11月', value: 162 },
  { month: '12月', value: 180 },
]

/* ───────── API 对接 ───────── */
export const apiFeatures = [
  { icon: 'Server', title: '患者数据同步', desc: '实时同步国际患者基本信息、病历摘要、就诊记录' },
  { icon: 'Cpu', title: '预约排期接口', desc: '创建、查询、取消预约，实时获取科室排期信息' },
  { icon: 'FileJson', title: '电子病历对接', desc: '标准化病历数据交换，支持HL7 FHIR R4协议' },
  { icon: 'Globe', title: '费用实时查询', desc: '查询诊疗项目价格、生成费用预估、获取结算状态' },
  { icon: 'Shield', title: '报告自动生成', desc: '检查报告自动翻译与格式化，支持多语言输出' },
]

export const endpoints = [
  { method: 'GET', path: '/v1/patients', desc: '获取患者列表' },
  { method: 'GET', path: '/v1/patients/{id}', desc: '获取患者详情' },
  { method: 'POST', path: '/v1/appointments', desc: '创建预约' },
  { method: 'GET', path: '/v1/appointments/{id}', desc: '查询预约' },
  { method: 'PUT', path: '/v1/appointments/{id}', desc: '更新预约' },
  { method: 'GET', path: '/v1/billing/quote', desc: '费用预估' },
]

export const requestExample = `POST /v1/appointments HTTP/1.1
Host: api.huanyuyunyi.com
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "patient_id": "P-2025-001288",
  "department": "oncology",
  "doctor_id": "D-4582",
  "preferred_date": "2025-06-15",
  "symptom_summary": "Follow-up for lung cancer treatment",
  "interpreter_needed": true,
  "interpreter_language": "en"
}`

export const responseExample = `{
  "status": "success",
  "data": {
    "appointment_id": "APT-202506-009231",
    "patient_id": "P-2025-001288",
    "department": "oncology",
    "doctor": "Dr. Zhang Ming",
    "scheduled_date": "2025-06-15T09:00:00+08:00",
    "location": "Building A, Floor 3, Room 302",
    "interpreter": {
      "assigned": true,
      "language": "en",
      "interpreter_name": "Lisa Wang"
    },
    "status": "confirmed",
    "created_at": "2025-05-04T14:32:18+08:00"
  }
}`

export const techArchPoints = [
  '支持HL7 FHIR R4国际标准',
  '双向数据同步，实时更新',
  '完善的沙箱测试环境',
  '99.9% API可用性保障',
]

/* ───────── Apply 申请入驻 ───────── */
export const applyProcessSteps = [
  { icon: 'ClipboardCheck', title: '提交申请', desc: '填写医院基本信息和联系方式' },
  { icon: 'UserCheck', title: '资质审核', desc: '平台3-5个工作日内完成审核' },
  { icon: 'FileSignature', title: '签约合作', desc: '确认合作方案，签署服务协议' },
  { icon: 'GraduationCap', title: '系统培训', desc: '后台操作培训和API对接指导' },
  { icon: 'Rocket', title: '正式上线', desc: '开启国际患者接收' },
]

export const applyRequirements = [
  '具有合法医疗机构执业许可证',
  'JCI认证或三级医院优先',
  '具备基本的外语接待能力',
  '至少1个特色优势科室',
  '无重大医疗事故记录',
]

export const deptOptions = [
  '肿瘤科', '心血管科', '神经外科', '骨科', '妇产科',
  '眼科', '口腔科', '康复科', '中医科', '体检中心',
  '生殖医学', '整形外科', '消化内科', '神经内科',
]

export const applyFaqs = [
  {
    q: '入驻需要费用吗？',
    a: '入驻申请和资质审核完全免费。审核通过后，您可以根据需求选择Pro版（¥1,999/月）或Enterprise版（¥9,999/月）服务方案。',
  },
  {
    q: '审核需要多长时间？',
    a: '通常情况下，资质审核会在3-5个工作日内完成。如果资料齐全且符合要求，最快可在2个工作日内通过。',
  },
  {
    q: '没有JCI认证可以申请吗？',
    a: '可以。JCI认证或三级医院资质是优先条件，但不是必须条件。只要具备合法医疗机构执业许可证和特色科室，均可申请入驻。',
  },
  {
    q: '平台如何保障患者数据安全？',
    a: '我们采用AES-256加密传输和存储，通过OAuth 2.0认证，符合HIPAA和《个人信息保护法》要求，并通过等保三级认证。',
  },
  {
    q: '可以对接我们现有的HIS系统吗？',
    a: '可以。Enterprise版提供标准API接口，支持与主流HIS/EMR系统（如东软、卫宁、创业等）对接，技术团队将提供全程支持。',
  },
]

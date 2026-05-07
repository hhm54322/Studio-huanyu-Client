/** 来华就医全流程步骤数据 */
export interface StepData {
  number: string
  title: string
  subtitle: string
  icon: string
  content: string
  time: string
  cost: string
  actions: string[]
}

export const stepsData: StepData[] = [
  {
    number: '01',
    title: '预约医疗咨询',
    subtitle: 'Book Medical Consultation',
    icon: 'Video',
    content:
      '提交病历资料（中英文翻译）→ AI智能匹配推荐医院 → 预约专家视频面诊（15-30分钟）→ 获取专业治疗方案建议',
    time: '1-3天',
    cost: '免费初筛 / ¥399书面评估 / ¥1,299视频面诊',
    actions: ['提交病历', 'AI匹配', '视频面诊', '获取方案'],
  },
  {
    number: '02',
    title: '确定方案与签证',
    subtitle: 'Confirm Plan & Visa',
    icon: 'FileText',
    content:
      '确认治疗方案和费用明细 → 签署知情同意书 → 医院出具医疗邀请函 → 寰宇云医协助签证申请（M字医疗签证）',
    time: '3-7天',
    cost: '签证费自理（各国不同，约$100-$200）',
    actions: ['确认方案', '签署同意书', '医疗邀请函', '签证申请'],
  },
  {
    number: '03',
    title: '行程安排',
    subtitle: 'Travel Arrangement',
    icon: 'Plane',
    content:
      '预订机票（寰宇云医可协助查询优惠航班）→ 预订医院附近住宿（推荐合作酒店/公寓）→ 安排机场接送（专车服务）→ 准备行前资料包（医院地图、联系人、注意事项）',
    time: '出发前1-2周',
    cost: '机票+住宿自理',
    actions: ['预订机票', '预订住宿', '机场接送', '行前资料包'],
  },
  {
    number: '04',
    title: '到达与治疗',
    subtitle: 'Arrival & Treatment',
    icon: 'Stethoscope',
    content:
      '机场接机 → 入住医院国际部病房 → 全面体检和术前评估 → 按计划进行治疗（手术/化疗/放疗/干细胞等）→ 治疗期间专属医疗顾问全程陪同',
    time: '根据病情1-4周',
    cost: '按治疗方案执行',
    actions: ['机场接机', '入住病房', '全面体检', '按计划治疗', '全程陪同'],
  },
  {
    number: '05',
    title: '康复与探索',
    subtitle: 'Recovery & Exploration',
    icon: 'Heart',
    content:
      '术后康复护理 → 中医调理（可选，针灸/推拿/中药） → 城市观光（病情允许情况下）→ 购买康复辅助用品',
    time: '1-2周',
    cost: '康复费用+旅游自费',
    actions: ['康复护理', '中医调理', '城市观光', '康复用品'],
  },
  {
    number: '06',
    title: '回国后随访',
    subtitle: 'Post-Return Follow-up',
    icon: 'Globe',
    content:
      '携带完整病历副本回国 → 远程视频复诊（与主治医生定期沟通）→ 国内医院对接（协助联系当地合作医院）→ 长期健康档案管理',
    time: '持续1-2年',
    cost: '远程复诊¥200/次',
    actions: ['携带病历', '视频复诊', '国内对接', '档案管理'],
  },
]

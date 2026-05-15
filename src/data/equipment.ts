/**
 * 中国高端肿瘤治疗设备数据
 * 数据来源：中国高端肿瘤治疗设备名单.docx
 *
 * i18n 策略：所有面向用户展示的中文文本字段统一使用 LocalizedText 结构。
 * 当前 zh 为权威文案，其他语言（en/id/ru/mn）暂用中文兜底，待后续翻译回填。
 */

export type EquipmentLocale = 'zh' | 'en' | 'id' | 'ru' | 'mn'
export type LocalizedText = Record<EquipmentLocale, string>

/** 把单条中文文案包装成 5 语言对象（其他语言暂时回退到中文） */
const L = (zh: string): LocalizedText => ({ zh, en: zh, id: zh, ru: zh, mn: zh })

export interface DiseaseCategory {
  category: LocalizedText
  diseases: LocalizedText
}

export interface BenefitDetail {
  benefit: LocalizedText
  detail: LocalizedText
}

export interface EquipmentItem {
  id: string
  name: LocalizedText
  nameEn: string
  category: 'radiation' | 'ablation' | 'imaging' | 'surgery' | 'particle'
  image: string
  stars: number
  tag?: LocalizedText
  intro: LocalizedText
  techPoints: LocalizedText[]
  techAdvantages?: BenefitDetail[]
  hospitals: { name: LocalizedText; note?: LocalizedText }[]
  benefits: LocalizedText[]
  benefitDetails?: BenefitDetail[]
  diseases: LocalizedText[]
  diseaseCategories?: DiseaseCategory[]
  priceChina: LocalizedText
  priceOverseas: LocalizedText
}

export const categoryLabels: Record<string, LocalizedText> = {
  radiation: L('精准放疗'),
  particle: L('粒子线治疗'),
  ablation: L('微创消融'),
  imaging: L('影像诊断'),
  surgery: L('机器人手术'),
}

export const categoryColors: Record<string, string> = {
  radiation: 'from-orange-400 to-red-400',
  particle: 'from-blue-500 to-indigo-500',
  ablation: 'from-emerald-400 to-teal-500',
  imaging: 'from-sky-400 to-blue-500',
  surgery: 'from-violet-400 to-purple-500',
}

/** 核心优势对比表 */
export interface CoreAdvantageRow {
  dim: LocalizedText
  china: LocalizedText
  overseas: LocalizedText
  sea: LocalizedText
}

export const coreAdvantages: CoreAdvantageRow[] = [
  { dim: L('价格'), china: L('欧美价格的 1/3～1/2'), overseas: L('最贵'), sea: L('新加坡 ≈ 中国 130-150%') },
  { dim: L('等待时间'), china: L('1-2 周'), overseas: L('6 个月 - 2 年'), sea: L('新加坡排队久') },
  { dim: L('设备水平'), china: L('国际一流，部分全球首创'), overseas: L('技术源头，设备最全'), sea: L('质子/重离子稀缺') },
]

/** 设备硬件水平对比 */
export interface EquipmentComparisonCell {
  v: '✅' | '⚠️' | '❌'
  desc: LocalizedText
}

export interface EquipmentComparisonRow {
  type: LocalizedText
  china: EquipmentComparisonCell
  overseas: EquipmentComparisonCell
  sea: EquipmentComparisonCell
}

export const equipmentComparison: EquipmentComparisonRow[] = [
  { type: L('质子治疗'), china: { v: '✅', desc: L('全覆盖（国产+进口）') }, overseas: { v: '✅', desc: L('设备最全') }, sea: { v: '⚠️', desc: L('新加坡有，其他国家极少') } },
  { type: L('重离子'), china: { v: '✅', desc: L('甘肃武威（商用）') }, overseas: { v: '✅', desc: L('少数中心') }, sea: { v: '❌', desc: L('基本没有') } },
  { type: L('射波刀'), china: { v: '✅', desc: L('顶尖医院普及') }, overseas: { v: '✅', desc: L('普及') }, sea: { v: '⚠️', desc: L('新加坡、泰国部分') } },
  { type: L('MR-Linac'), china: { v: '✅', desc: L('顶级医院配备') }, overseas: { v: '✅', desc: L('普及') }, sea: { v: '⚠️', desc: L('极少') } },
  { type: L('康博刀'), china: { v: '✅', desc: L('全球首创，普及') }, overseas: { v: '❌', desc: L('无') }, sea: { v: '❌', desc: L('无') } },
  { type: L('BNCT'), china: { v: '✅', desc: L('全球领先') }, overseas: { v: '⚠️', desc: L('日本有') }, sea: { v: '❌', desc: L('无') } },
]

export const equipmentList: EquipmentItem[] = [
  {
    id: 'cyberknife',
    name: L('射波刀'),
    nameEn: 'CyberKnife',
    category: 'radiation',
    image: '/images/equipment/image1.jpeg',
    stars: 3,
    intro: L(
      '射波刀（CyberKnife）是目前全球最先进的光子放射外科系统之一，由美国 Accuray 公司研发。它是唯一一种可以实时追踪呼吸运动并进行动态调整的放疗机器人系统。'
    ),
    techPoints: [
      L('Robotic Radiosurgery — 机器人放射外科，精度达亚毫米'),
      L('Synchrony 呼吸追踪 — 实时追踪呼吸运动，无需屏气'),
      L('Xsight 肺部追踪 — 自动识别肺部肿瘤，无需植入标记'),
      L('InTempo 系统 — 实时监控，确保剂量安全'),
    ],
    hospitals: [
      { name: L('佛山复星禅诚医院'), note: L('华南射波刀中心，涉外服务成熟 ⭐️⭐️⭐️') },
      { name: L('复旦大学附属华山医院'), note: L('射波刀技术权威') },
      { name: L('上海瑞金医院'), note: L('射波刀临床经验丰富') },
      { name: L('北京 301 医院'), note: L('机器人放疗技术领先') },
    ],
    benefits: [
      L('完全无创，无需开刀'),
      L('门诊治疗，无需住院'),
      L('1-5 次完成治疗'),
      L('适合老年/体弱患者'),
    ],
    benefitDetails: [
      { benefit: L('完全无创'), detail: L('无需开刀，无切口、无出血、无疼痛') },
      { benefit: L('无需住院'), detail: L('门诊治疗，当天即可回家') },
      { benefit: L('呼吸追踪'), detail: L('肿瘤随呼吸移动，射波刀自动追踪，不遗漏') },
      { benefit: L('舒适治疗'), detail: L('无需头架固定，患者轻松接受治疗') },
      { benefit: L('精度极高'), detail: L('亚毫米精度，保护周围正常组织') },
      { benefit: L('疗程短'), detail: L('1-5 次完成治疗（传统放疗需 20-30 次）') },
      { benefit: L('适合体弱'), detail: L('老年患者、心肺功能差者均可接受') },
      { benefit: L('可重复'), detail: L('复发后可再次治疗，无累计剂量限制') },
    ],
    diseases: [L('肺癌'), L('肝癌'), L('脑转移瘤'), L('胰腺癌'), L('前列腺癌'), L('脊柱转移瘤'), L('鼻咽癌')],
    diseaseCategories: [
      { category: L('颅内'), diseases: L('脑转移瘤、脑膜瘤、听神经瘤、垂体瘤、AVM') },
      { category: L('头颈部'), diseases: L('鼻咽癌、口咽癌、甲状腺癌、颈部淋巴结转移') },
      { category: L('肺部'), diseases: L('早期肺癌、肺部转移瘤（无法手术者）') },
      { category: L('肝脏'), diseases: L('肝癌、肝转移瘤') },
      { category: L('脊椎'), diseases: L('脊柱转移瘤、椎体血管瘤') },
      { category: L('胰腺'), diseases: L('胰腺癌（局部晚期）') },
      { category: L('前列腺'), diseases: L('前列腺癌（低-中危）') },
      { category: L('肾脏'), diseases: L('肾癌（无法手术者）') },
    ],
    priceChina: L('8-15 万'),
    priceOverseas: L('20-30 万'),
  },
  {
    id: 'proton',
    name: L('质子治疗系统'),
    nameEn: 'Proton Therapy',
    category: 'particle',
    image: '/images/equipment/image2.jpeg',
    stars: 3,
    intro: L('采用布拉格峰精准放疗，是儿童肿瘤、颅底肿瘤、腹盆肿瘤的首选放疗方案，正常组织损伤显著低于传统放疗。'),
    techPoints: [
      L('布拉格峰精准放疗'),
      L('保护正常组织'),
      L('适合儿童/颅底/腹盆肿瘤'),
    ],
    hospitals: [
      { name: L('上海瑞金医院（迈胜）') },
      { name: L('合肥离子医学中心') },
    ],
    benefits: [
      L('儿童患者避免发育影响'),
      L('正常组织损伤降低 60%'),
      L('价格 25-35 万（欧美 60-100 万+）'),
    ],
    diseases: [L('儿童肿瘤'), L('颅底肿瘤'), L('腹盆肿瘤')],
    priceChina: L('25-35 万'),
    priceOverseas: L('60-100 万+'),
  },
  {
    id: 'carbon-ion',
    name: L('重离子治疗'),
    nameEn: 'Carbon Ion Therapy',
    category: 'particle',
    image: '/images/equipment/image3.jpeg',
    stars: 3,
    intro: L('生物学效应更强，对耐药肿瘤效果显著，5 年生存率提升 20-30%。中国甘肃武威重离子中心是全球少数商用重离子中心，中国自主研发。'),
    techPoints: [
      L('生物学效应更强'),
      L('对耐药肿瘤有效'),
      L('5 年生存率提升 20-30%'),
    ],
    hospitals: [
      { name: L('甘肃武威重离子中心'), note: L('全球少数商用重离子中心') },
    ],
    benefits: [
      L('骨肉瘤、黑色素瘤疗效显著'),
      L('全球少数商用中心'),
      L('中国自主研发'),
    ],
    diseases: [L('骨肉瘤'), L('黑色素瘤'), L('难治性肿瘤')],
    priceChina: L('25-35 万'),
    priceOverseas: L('60-100 万+'),
  },
  {
    id: 'kangbo',
    name: L('康博刀'),
    nameEn: 'Cryoablation (Cold-Heat)',
    category: 'ablation',
    image: '/images/equipment/image4.jpeg',
    stars: 3,
    tag: L('全球首创'),
    intro: L('康博刀是中国全球首创的冷热复合消融技术，融合 -196℃ 冷冻与 85℃ 加热，一根针即可完成治疗。'),
    techPoints: [
      L('-196℃ 冷冻 + 85℃ 加热'),
      L('一根针完成治疗'),
      L('出血少、复发率低'),
    ],
    hospitals: [
      { name: L('多家三甲医院') },
    ],
    benefits: [
      L('全球首创技术'),
      L('疼痛轻、恢复快'),
      L('可重复治疗'),
      L('适合肝、肺、肾肿瘤'),
    ],
    diseases: [L('肝癌'), L('肺癌'), L('肾癌')],
    priceChina: L('5-10 万'),
    priceOverseas: L('中国独有'),
  },
  {
    id: 'nanoknife',
    name: L('纳米刀'),
    nameEn: 'NanoKnife (IRE)',
    category: 'ablation',
    image: '/images/equipment/image5.jpeg',
    stars: 2,
    intro: L('采用不可逆电穿孔技术，不损伤血管和神经，保留器官功能，适合危险部位的肿瘤治疗。'),
    techPoints: [
      L('不损伤血管/神经'),
      L('保留器官功能'),
      L('适合危险部位肿瘤'),
    ],
    hospitals: [
      { name: L('顶尖肿瘤中心') },
    ],
    benefits: [
      L('适合胰腺癌、肝门部肿瘤'),
      L('提高生活质量'),
      L('术后恢复快'),
    ],
    diseases: [L('胰腺癌'), L('肝门部肿瘤')],
    priceChina: L('5-10 万'),
    priceOverseas: L('15-25 万'),
  },
  {
    id: 'petct',
    name: L('PET-CT'),
    nameEn: 'Positron Emission Tomography-CT',
    category: 'imaging',
    image: '',
    stars: 3,
    intro: L(
      'PET-CT 是目前全球最先进的高端医学影像设备之一，融合 PET（正电子发射断层显像）与 CT（计算机断层扫描），一次检查同时获取人体的功能代谢与解剖结构信息。'
    ),
    techPoints: [
      L('注射含放射性核素的示踪剂（如 ¹⁸F-FDG）'),
      L('示踪剂在代谢活跃部位（如肿瘤）聚集'),
      L('PET 捕捉示踪剂衰变释放的正电子，重建代谢图像'),
      L('CT 提供精确的解剖定位，融合形成精准定位'),
    ],
    techAdvantages: [
      { benefit: L('早期发现'), detail: L('可发现直径 5mm 以下的微小肿瘤') },
      { benefit: L('全身扫描'), detail: L('一次检查全身，了解转移情况') },
      { benefit: L('精准分期'), detail: L('准确判断肿瘤大小、位置、转移') },
      { benefit: L('疗效评估'), detail: L('治疗后评估肿瘤活性，判断治疗效果') },
      { benefit: L('国产突破'), detail: L('联影医疗（United Imaging）精度比肩 GPS，价格更低') },
    ],
    hospitals: [
      { name: L('北京协和医院'), note: L('设备先进，影像科权威') },
      { name: L('复旦大学附属肿瘤医院'), note: L('肿瘤专科 PET-CT 经验丰富') },
      { name: L('广东省人民医院'), note: L('华南地区重要 PET-CT 中心') },
      { name: L('四川大学华西医院'), note: L('西部地区 PET-CT 领先') },
    ],
    benefits: [
      L('比传统 CT 早 6-12 个月发现肿瘤'),
      L('一次扫描了解全身肿瘤情况'),
      L('指导治疗方案制定，避免无效治疗'),
      L('及时评估治疗效果，调整方案'),
    ],
    diseases: [L('肺癌'), L('乳腺癌'), L('结直肠癌'), L('胃癌'), L('肝癌'), L('胰腺癌'), L('淋巴瘤'), L('脑肿瘤')],
    diseaseCategories: [
      { category: L('肿瘤诊断'), diseases: L('肺癌、乳腺癌、结直肠癌、胃癌、食管癌、肝癌、胰腺癌') },
      { category: L('淋巴瘤'), diseases: L('霍奇金淋巴瘤、非霍奇金淋巴瘤') },
      { category: L('脑部疾病'), diseases: L('脑肿瘤、癫痫灶定位、老年痴呆症诊断') },
      { category: L('转移筛查'), diseases: L('全身多发转移、淋巴结转移、骨转移') },
      { category: L('治疗评估'), diseases: L('放化疗效果评估、手术后复发监测') },
      { category: L('早筛体检'), diseases: L('高危人群肿瘤早筛、深度健康体检') },
    ],
    priceChina: L('—'),
    priceOverseas: L('—'),
  },
  {
    id: 'davinci',
    name: L('达芬奇 Xi/XS 手术机器人'),
    nameEn: 'Da Vinci Surgical System',
    category: 'surgery',
    image: '/images/equipment/image6.jpeg',
    stars: 3,
    intro: L(
      '达芬奇手术机器人由美国 Intuitive Surgical 公司研发，是目前全球应用最广泛的手术机器人系统，被誉为"外科手术革命"。'
    ),
    techPoints: [
      L('EndoWrist 技术：机械臂可 360° 旋转，超越人手极限'),
      L('Intuitive 动作：医生手部动作智能缩放'),
      L('震颤过滤：消除医生手部不必要的震颤'),
      L('裸眼 3D 视觉：放大 10 倍，清晰看到细微组织'),
    ],
    hospitals: [
      { name: L('北京和睦家医院'), note: L('中国首台达芬奇 Xi，涉外服务成熟') },
      { name: L('上海长海医院'), note: L('泌尿外科机器人手术量全国领先') },
      { name: L('中山大学附属肿瘤医院'), note: L('机器人辅助手术技术先进') },
      { name: L('四川大学华西医院'), note: L('机器人手术培训基地') },
    ],
    benefits: [
      L('微创切口（0.8-1cm）'),
      L('出血量减少 50-80%'),
      L('住院时间缩短 50%'),
      L('术后镇痛药需求减少 60%'),
    ],
    benefitDetails: [
      { benefit: L('微创切口'), detail: L('仅 4-6 个小孔（0.8-1cm），传统开放手术需 20-30cm') },
      { benefit: L('出血少'), detail: L('手术出血量减少 50%-80%') },
      { benefit: L('恢复快'), detail: L('住院时间缩短 50%，通常 3-5 天即可出院') },
      { benefit: L('疼痛轻'), detail: L('术后镇痛药需求减少 60%') },
      { benefit: L('精准切除'), detail: L('放大 10 倍的视野，神经血管保留更完好') },
      { benefit: L('并发症少'), detail: L('感染率、出血率显著降低') },
      { benefit: L('美容效果好'), detail: L('小切口，疤痕小') },
    ],
    diseases: [L('前列腺癌'), L('直肠癌'), L('肺癌'), L('胃癌'), L('肝癌'), L('甲状腺癌')],
    diseaseCategories: [
      { category: L('泌尿外科'), diseases: L('前列腺癌根治术、肾部分切除术、膀胱癌根治术') },
      { category: L('妇科'), diseases: L('子宫切除术、卵巢肿瘤切除、子宫内膜癌手术') },
      { category: L('结直肠外科'), diseases: L('直肠癌根治术、结肠切除术') },
      { category: L('胸外科'), diseases: L('肺癌肺叶切除、食管癌手术、胸腺瘤切除') },
      { category: L('胃外科'), diseases: L('胃癌根治术、胃部分切除') },
      { category: L('肝胆外科'), diseases: L('肝切除、胆囊切除、胰十二指肠切除') },
      { category: L('心脏外科'), diseases: L('冠脉搭桥、心脏瓣膜修复') },
      { category: L('头颈外科'), diseases: L('甲状腺癌根治、口腔癌手术') },
    ],
    priceChina: L('8-15 万'),
    priceOverseas: L('20-30 万'),
  },
  {
    id: 'bnct',
    name: L('BNCT 硼中子俘获治疗'),
    nameEn: 'Boron Neutron Capture Therapy',
    category: 'radiation',
    image: '/images/equipment/image7.jpeg',
    stars: 3,
    tag: L('第五疗法'),
    intro: L('BNCT（Boron Neutron Capture Therapy，硼中子俘获治疗）被誉为"第五种肿瘤治疗方式"，是当前全球最前沿的放疗技术之一。'),
    techPoints: [
      L('精准定位：仅杀伤聚集硼药的肿瘤细胞'),
      L('高 LET 效应：对乏氧肿瘤（放疗抵抗）同样有效'),
      L('疗程短：通常只需 1-2 次照射即可完成治疗'),
      L('保护正常组织：正常组织损伤极小'),
      L('复发/转移有效：对传统治疗后复发的肿瘤也有效'),
    ],
    techAdvantages: [
      { benefit: L('精准定位'), detail: L('仅杀伤聚集硼药的肿瘤细胞') },
      { benefit: L('高 LET 效应'), detail: L('对乏氧肿瘤（放疗抵抗）同样有效') },
      { benefit: L('疗程短'), detail: L('通常只需 1-2 次照射即可完成治疗') },
      { benefit: L('保护正常组织'), detail: L('正常组织损伤极小') },
      { benefit: L('复发/转移有效'), detail: L('对传统治疗后复发的肿瘤也有效') },
    ],
    hospitals: [
      { name: L('国科中子医疗（厦门）'), note: L('中国 BNCT 技术代表，自主研发 RFQ-BNCT ⭐') },
      { name: L('北京天坛医院'), note: L('脑肿瘤 BNCT 临床试验中心') },
      { name: L('复旦大学附属华山医院'), note: L('脑胶质瘤 BNCT 研究') },
      { name: L('深圳先进院'), note: L('中科院深圳先进院 BNCT 研发中心') },
    ],
    benefits: [
      L('复发救星：对手术、放疗、化疗后复发的肿瘤有效'),
      L('精准打击：仅杀伤肿瘤细胞，保护正常组织'),
      L('疗程极短：1-2 次治疗即可，传统放疗需 20-30 次'),
      L('儿童友好：对儿童发育影响小，适合儿童肿瘤'),
      L('耐药有效：对传统放疗抵抗的乏氧肿瘤同样有效'),
    ],
    diseases: [L('脑胶质母细胞瘤'), L('头颈鳞状细胞癌'), L('恶性脑膜瘤'), L('黑色素瘤'), L('肝癌'), L('儿童脑肿瘤')],
    diseaseCategories: [
      { category: L('优先适应症'), diseases: L('脑胶质母细胞瘤、头颈鳞状细胞癌、恶性脑膜瘤、黑色素瘤、肝癌、儿童脑肿瘤') },
      { category: L('研究适应症'), diseases: L('肺癌、乳腺癌、结直肠癌肝转移、骨肉瘤（临床试验中）') },
    ],
    priceChina: L('—'),
    priceOverseas: L('—'),
  },
  {
    id: 'gammaknife',
    name: L('伽马刀'),
    nameEn: 'Gamma Knife',
    category: 'radiation',
    image: '/images/equipment/image8.jpeg',
    stars: 2,
    intro: L(
      '伽马刀是一种利用伽马射线进行头部立体定向放射外科（SRS）的精准放疗设备，虽然名字里有"刀"，但它是一种无创的放疗技术，不需要切开皮肤。'
    ),
    techPoints: [
      L('Leksell 定位框架 - 头部固定架，确保亚毫米精度'),
      L('自动摆位系统（APS） - 自动化患者定位'),
      L('剂量规划系统 - 三维逆向计划，精确计算剂量分布'),
    ],
    hospitals: [
      { name: L('北京天坛医院'), note: L('中国伽马刀发源地，技术最成熟 ⭐') },
      { name: L('复旦大学附属华山医院'), note: L('神经外科伽马刀权威') },
      { name: L('上海长征医院'), note: L('伽马刀治疗量全国领先') },
      { name: L('广州军区总医院'), note: L('华南地区重要伽马刀中心') },
    ],
    benefits: [
      L('完全无创：不需要开刀，无切口、无出血'),
      L('门诊治疗：通常当天即可出院'),
      L('精准安全：精度达 0.5mm 以内，保护正常脑组织'),
      L('治疗时间短：单次治疗 30-60 分钟'),
      L('适应症广：从良性肿瘤到转移瘤均可治疗'),
      L('可重复治疗：复发后可再次治疗'),
    ],
    diseases: [L('脑转移瘤'), L('脑膜瘤'), L('听神经瘤'), L('垂体瘤'), L('三叉神经痛'), L('脑动静脉畸形')],
    diseaseCategories: [
      { category: L('颅内肿瘤'), diseases: L('脑转移瘤（1-3 个）、脑膜瘤、听神经瘤、垂体瘤') },
      { category: L('脑血管畸形'), diseases: L('脑动静脉畸形（AVM）、海绵状血管瘤') },
      { category: L('功能性疾病'), diseases: L('三叉神经痛、癫痫、帕金森病（丘脑毁损）') },
      { category: L('眼眶疾病'), diseases: L('眼眶血管瘤、黑色素瘤') },
      { category: L('术后残留'), diseases: L('手术后残留或复发的肿瘤') },
    ],
    priceChina: L('3-8 万'),
    priceOverseas: L('10-20 万'),
  },
]

/** 价格对比表 */
export interface PriceComparisonRow {
  name: LocalizedText
  china: string
  usa: string
  singapore: string
  thailand: string
}

export const priceComparison: PriceComparisonRow[] = [
  { name: L('质子治疗'), china: '25-35', usa: '60-100+', singapore: '40-50', thailand: '-' },
  { name: L('重离子'), china: '25-35', usa: '60-100+', singapore: '-', thailand: '-' },
  { name: L('射波刀'), china: '8-15', usa: '20-30', singapore: '12-18', thailand: '10-15' },
  { name: L('伽马刀'), china: '3-8', usa: '10-20', singapore: '8-12', thailand: '6-10' },
  { name: L('康博刀'), china: '5-10', usa: '-', singapore: '-', thailand: '-' },
  { name: L('达芬奇手术'), china: '8-15', usa: '20-30', singapore: '15-20', thailand: '12-18' },
]

/** 伽马刀 vs 射波刀对比 */
export interface GammaVsCyberRow {
  dim: LocalizedText
  gamma: LocalizedText
  cyber: LocalizedText
}

export const gammaVsCyberCompare: GammaVsCyberRow[] = [
  { dim: L('照射方式'), gamma: L('固定钴-60 源'), cyber: L('机器人直线加速器') },
  { dim: L('治疗范围'), gamma: L('头部为主'), cyber: L('全身各部位') },
  { dim: L('追踪方式'), gamma: L('头架固定'), cyber: L('实时呼吸追踪') },
  { dim: L('治疗次数'), gamma: L('通常单次'), cyber: L('1-5 次（可分次）') },
  { dim: L('适应症'), gamma: L('颅内病变为主'), cyber: L('全身肿瘤') },
  { dim: L('固定方式'), gamma: L('有创头架固定'), cyber: L('无需固定，舒适') },
]

/** 重点技术路线 */
export interface TreatmentRoute {
  id: number
  title: LocalizedText
  icon: string
  target: LocalizedText
  techs: LocalizedText[]
  advantages: LocalizedText[]
  color: string
  border: string
  bg: string
}

export const treatmentRoutes: TreatmentRoute[] = [
  {
    id: 1,
    title: L('路线一：精准无创放疗'),
    icon: '🎯',
    target: L('早期肿瘤、老年患者、无法手术的患者'),
    techs: [
      L('射波刀（CyberKnife）— 实时追踪、无创'),
      L('MR-Linac（磁共振引导加速器）— 实时显像 + 放疗'),
    ],
    advantages: [
      L('无创、无痛、无流血'),
      L('门诊治疗，无需住院'),
      L('1-5 次治疗完成'),
      L('保护正常组织'),
    ],
    color: 'from-orange-400 to-red-400',
    border: 'border-orange-200',
    bg: 'bg-orange-50/50',
  },
  {
    id: 2,
    title: L('路线二：高端粒子线治疗'),
    icon: '☢️',
    target: L('儿童肿瘤、颅底肿瘤、腹盆肿瘤、难治性肿瘤'),
    techs: [
      L('质子治疗 — 布拉格峰精准杀伤'),
      L('重离子治疗（碳离子）— 生物学效应强'),
    ],
    advantages: [
      L('保护正常组织和器官'),
      L('儿童患者避免发育影响'),
      L('对耐药肿瘤更有效'),
      L('5 年生存率提升 20-30%'),
    ],
    color: 'from-blue-500 to-indigo-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50/50',
  },
  {
    id: 3,
    title: L('路线三：微创消融'),
    icon: '🔪',
    target: L('肝癌、肺癌、胰腺癌、肾癌等实体肿瘤'),
    techs: [
      L('康博刀（冷热复合消融）— 全球首创'),
      L('纳米刀（不可逆电穿孔）— 不伤血管神经'),
    ],
    advantages: [
      L('一根针完成治疗'),
      L('不损伤血管、神经'),
      L('出血少、疼痛轻'),
      L('恢复快、可重复'),
    ],
    color: 'from-emerald-400 to-teal-500',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/50',
  },
]

/** 患者案例 */
export interface PatientCase {
  flag: string
  patient: LocalizedText
  diagnosis: LocalizedText
  before: LocalizedText
  equipment: LocalizedText
  plan: LocalizedText
  hospital: LocalizedText
  process: LocalizedText
  result: LocalizedText
  feedback: LocalizedText
  color: string
}

export const patientCases: PatientCase[] = [
  {
    flag: '🇮🇩',
    patient: L('男性，58 岁，印度尼西亚雅加达'),
    diagnosis: L('右肺上叶非小细胞肺癌（IIIA 期）'),
    before: L('咳嗽、胸痛、体重下降；印尼当地建议开胸手术'),
    equipment: L('射波刀'),
    plan: L('射波刀精准放疗（5 次治疗）'),
    hospital: L('佛山复星禅诚医院'),
    process: L('无需住院，门诊治疗；每次约 1 小时；无痛无创'),
    result: L('3 个月后复查肿瘤缩小 70%；6 个月后肿瘤完全消失'),
    feedback: L('不用开刀就能治好，中国医生太厉害了'),
    color: 'border-orange-200 bg-orange-50/30',
  },
  {
    flag: '🇹🇭',
    patient: L('男性，52 岁，泰国曼谷'),
    diagnosis: L('原发性肝癌（BCLC B 期），合并肝硬化'),
    before: L('肝功能差，无法耐受传统手术；泰国医生建议保守治疗'),
    equipment: L('康博刀'),
    plan: L('康博刀（冷热复合消融）'),
    hospital: L('上海东方肝胆外科医院'),
    process: L('局部麻醉，一根针完成；治疗时间约 30 分钟；当天出院'),
    result: L('1 个月后复查肿瘤完全坏死；肝功能保持良好'),
    feedback: L('感谢康博刀，让我避免了大手术，恢复得很快'),
    color: 'border-emerald-200 bg-emerald-50/30',
  },
  {
    flag: '🇲🇾',
    patient: L('女性，16 岁，马来西亚吉隆坡'),
    diagnosis: L('髓母细胞瘤（儿童常见脑瘤）'),
    before: L('术后复发，传统放疗会损伤正常脑组织；新加坡质子治疗需等待 3 个月'),
    equipment: L('质子治疗'),
    plan: L('质子治疗（54Gy，分 30 次）'),
    hospital: L('上海瑞金医院'),
    process: L('每天 1 次，周一到周五；每次约 30 分钟；无痛'),
    result: L('治疗结束 1 年后，肿瘤完全控制；智力、发育正常'),
    feedback: L('在中国不仅治好了病，还保住了我的未来'),
    color: 'border-blue-200 bg-blue-50/30',
  },
  {
    flag: '🇸🇬',
    patient: L('男性，61 岁，新加坡'),
    diagnosis: L('局部晚期胰腺癌，包绕肠系膜上血管'),
    before: L('无法手术切除；化疗副作用大；预计生存期 6-12 个月'),
    equipment: L('纳米刀'),
    plan: L('纳米刀（不可逆电穿孔）'),
    hospital: L('复旦大学附属肿瘤医院'),
    process: L('腹腔镜辅助，精准消融；不损伤血管；出血少'),
    result: L('术后 3 个月，肿瘤控制良好；疼痛明显缓解；生活质量改善'),
    feedback: L('纳米刀给了我新的希望，中国技术真的先进'),
    color: 'border-purple-200 bg-purple-50/30',
  },
]

/** 合作医院展示 */
export interface PartnerHospital {
  name: LocalizedText
  stars: number
  tag: LocalizedText
  intro: LocalizedText
  equipment: LocalizedText
  advantage: LocalizedText
  suit: LocalizedText
  color: string
}

export const partnerHospitals: PartnerHospital[] = [
  {
    name: L('佛山复星禅诚医院'),
    stars: 3,
    tag: L('JCI 认证'),
    intro: L('涉外服务成熟'),
    equipment: L('射波刀、达芬奇机器人、PET-CT'),
    advantage: L('国际患者绿色通道，英文服务，专业翻译团队'),
    suit: L('国际患者首选，服务流程成熟'),
    color: 'from-orange-400 to-red-400',
  },
  {
    name: L('上海瑞金医院'),
    stars: 0,
    tag: L('顶级综合'),
    intro: L('疑难病例经验丰富'),
    equipment: L('质子治疗（迈胜）、射波刀、TOMO、PET-MRI'),
    advantage: L('质子治疗国产突破，复杂病例经验全球领先'),
    suit: L('需要质子治疗的儿童、颅底肿瘤患者'),
    color: 'from-blue-500 to-indigo-500',
  },
  {
    name: L('复旦大学附属肿瘤医院'),
    stars: 0,
    tag: L('肿瘤专科'),
    intro: L('排名全国前列'),
    equipment: L('全套高端放疗设备'),
    advantage: L('鼻咽癌、肺癌、胃癌治疗量全球领先'),
    suit: L('常见肿瘤、复杂病例'),
    color: 'from-violet-400 to-purple-500',
  },
  {
    name: L('甘肃武威重离子中心'),
    stars: 0,
    tag: L('全球少数'),
    intro: L('重离子商用中心'),
    equipment: L('重离子治疗系统'),
    advantage: L('骨肉瘤、黑色素瘤疗效显著；中国自主研发'),
    suit: L('难治性肿瘤、骨肿瘤、黑色素瘤'),
    color: 'from-emerald-400 to-teal-500',
  },
]

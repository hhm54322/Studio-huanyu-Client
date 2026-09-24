<script setup lang="ts">
import { computed, ref } from "vue";

const query = ref("");
const services = [
  {
    name: "肿瘤科",
    hospitals: "32家",
    cases: "实体肿瘤、复发难治肿瘤",
    feature: "多学科MDT会诊，前沿新药与个体化治疗方案",
    iconIndex: 0,
  },
  {
    name: "心血管",
    hospitals: "26家",
    cases: "冠心病、瓣膜病、复杂心律失常",
    feature: "微创介入手术、重症心脏外科诊疗",
    iconIndex: 1,
  },
  {
    name: "神经外科",
    hospitals: "24家",
    cases: "脑肿瘤、脑血管病变、脊髓疾病",
    feature: "显微神经外科、神经内镜精准手术",
    iconIndex: 2,
  },
  {
    name: "骨科",
    hospitals: "28家",
    cases: "脊柱疾病、关节置换、复杂创伤修复",
    feature: "微创骨科、快速康复ERAS体系",
    iconIndex: 3,
  },
  {
    name: "牙科",
    hospitals: "21家",
    cases: "全口种植、颌面修复、复杂正畸",
    feature: "数字化口腔、All-on系列种植方案",
    iconIndex: 4,
    path: "/dental",
  },
  {
    name: "眼科",
    hospitals: "20家",
    cases: "眼底病变、白内障、复杂屈光问题",
    feature: "高端晶体植入、微创眼底外科手术",
    iconIndex: 5,
  },
  {
    name: "妇科",
    hospitals: "20家",
    cases: "妇科肿瘤、盆底疾病、生殖相关疾病",
    feature: "微创妇科手术，生育力保护方案",
    iconIndex: 6,
  },
  {
    name: "消化科",
    hospitals: "25家",
    cases: "消化道早癌、肝胆胰肿瘤、难治性胃肠病",
    feature: "内镜微创诊疗，消化道早癌筛查",
    iconIndex: 7,
  },
  {
    name: "呼吸科",
    hospitals: "22家",
    cases: "肺部肿瘤、间质性肺病、复杂肺结节",
    feature: "精准靶向、免疫综合治疗",
    iconIndex: 8,
  },
  {
    name: "泌尿外科",
    hospitals: "23家",
    cases: "泌尿系肿瘤、复杂结石、前列腺疾病",
    feature: "腹腔镜、机器人微创外科",
    iconIndex: 9,
  },
  {
    name: "整形外科",
    hospitals: "19家",
    cases: "肿瘤术后重建、颌面整形、创面修复",
    feature: "显微修复、个性化美学重建",
    iconIndex: 10,
  },
  {
    name: "细胞治疗",
    hospitals: "16家",
    cases: "肿瘤免疫治疗、衰老干预",
    feature: "个体化细胞方案，严格质控管理",
    iconIndex: 11,
  },
  {
    name: "儿科",
    hospitals: "17家",
    cases: "儿童先天疾病、儿童肿瘤、罕见病",
    feature: "儿童专科多学科联合诊疗",
    iconIndex: 12,
  },
  {
    name: "中医药",
    hospitals: "21家",
    cases: "肿瘤辅助治疗、慢病调理",
    feature: "中西医联合干预，个性化调理方案",
    iconIndex: 13,
  },
];
const filtered = computed(() =>
  services.filter((item) =>
    `${item.name}${item.cases}${item.feature}`.includes(query.value.trim()),
  ),
);
function openConsultation() {
  window.dispatchEvent(new CustomEvent("open-consultation"));
}
</script>

<template>
  <div class="disease-page">
    <section class="disease-hero">
      <div class="disease-hero__visual" />
      <div class="hy-container" data-reveal>
        <h1>疾病中心</h1>
        <p>按疾病查找治疗方案，获取权威专家建议</p>
      </div>
    </section>
    <section class="disease-directory">
      <div class="hy-container">
        <label class="disease-search"
          ><img class="disease-search__icon" src="/images/figma/diseases/search.png" alt="" /><input
            v-model="query"
            type="search"
            placeholder="搜索疾病"
        /></label>
        <div class="disease-grid">
          <component
            :is="item.path ? 'RouterLink' : 'article'"
            v-for="(item, index) in filtered"
            :key="item.name"
            :to="item.path"
            data-reveal
            :style="{ '--reveal-delay': `${(index % 3) * 45}ms` }"
            ><img class="disease-card-icon" :src="`/images/figma/diseases/icon-${item.iconIndex}.png`" alt="" />
            <h2>{{ item.name }}</h2>
            <p>
              合作医院：<strong>{{ item.hospitals }}</strong>
            </p>
            <p>擅长病例：{{ item.cases }}</p>
            <p>诊疗特色：{{ item.feature }}</p></component
          >
        </div>
        <div v-if="!filtered.length" class="disease-empty">
          <img class="disease-search__icon" src="/images/figma/diseases/search.png" alt="" />
          <h2>暂未找到相关疾病</h2>
          <p>可以直接向阿宁描述病情，我们会协助匹配对应方向。</p>
        </div>
      </div>
    </section>
    <section class="disease-cta">
      <div class="hy-container" data-reveal>
        <h2>没有找到您的疾病？问阿宁帮您解答</h2>
        <div>
          <RouterLink to="/report"><img class="disease-cta-icon" src="/images/figma/diseases/submit.png" alt="" />提交病历</RouterLink
          ><button type="button" @click="openConsultation">
            <img class="disease-cta-icon" src="/images/figma/diseases/consult.png" alt="" />免费咨询阿宁
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.disease-page {
  margin-top: -64px;
  color: #1e3a5f;
}
.disease-page .hy-container {
  width: min(1216px, calc(100% - 80px));
}
.disease-hero {
  position: relative;
  height: 460px;
  overflow: hidden;
  padding: 180px 112px 146px;
  background: #edf7fb url("/images/figma/disease-hero-background.png") center/cover no-repeat;
  box-sizing: border-box;
}
.disease-hero__visual {
  display: none;
}
.disease-hero > .hy-container {
  position: relative;
  z-index: 1;
  display: flex;
  height: 134px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
}
.disease-hero h1 {
  margin: 0;
  color: #143162;
  font-size: 64px;
  font-weight: 600;
  line-height: 96px;
  letter-spacing: 0.35px;
}
.disease-hero p {
  margin: 0;
  color: #5b606a;
  font-size: 20px;
  font-weight: 400;
  line-height: 30px;
}
.disease-directory {
  padding: 96px 40px;
  background: #fff;
  box-sizing: border-box;
}
.disease-search {
  display: flex;
  width: 800px;
  max-width: 100%;
  height: 60px;
  align-items: center;
  gap: 16px;
  border: 1px solid #dbdee6;
  border-radius: 46px;
  padding: 0 24px;
  box-sizing: border-box;
  color: #1e3a5f;
}
.disease-search__icon {
  width: 20px;
  height: 20px;
  flex: 0 0 24px;
  object-fit: contain;
}
.disease-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1e3a5f;
  font-size: 16px;
  line-height: 24px;
}
.disease-search input::placeholder {
  color: #9ca3af;
}
.disease-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 48px;
}
.disease-grid article,
.disease-grid a {
  display: flex;
  height: 300px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 24px;
  padding: 24px;
  box-sizing: border-box;
  background: #f5f6f7;
  justify-content: space-between;
  transition:
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    background 0.3s ease;
}
.disease-grid article:hover,
.disease-grid a:hover {
  transform: translateY(-6px) !important;
  background: #f5f6f7;
  box-shadow: 0 18px 38px rgba(22, 58, 89, 0.1);
}
.disease-card-icon {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  object-fit: contain;
}
.disease-grid h2 {
  width: 100%;
  margin: 0;
  color: #1e3a5f;
  font-size: 24px;
  font-weight: 600;
  line-height: 24px;
}
.disease-grid h2 + p { margin-top: 16px; }
.disease-grid p {
  width: 100%;
  margin: 0;
  color: #4b5563;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}
.disease-grid strong {
  color: #2563eb;
  font-weight: 500;
}
.disease-empty {
  padding: 75px 0;
  color: #8393a1;
  text-align: center;
}
.disease-empty .disease-search__icon {
  width: 32px;
}
.disease-empty h2 {
  color: #1e3a5f;
}
.disease-cta {
  height: 332px;
  padding: 96px 40px;
  box-sizing: border-box;
  background: #f5f6f7;
  text-align: center;
}
.disease-cta > .hy-container { width: min(1216px, calc(100% - 80px)); }
.disease-cta h2 {
  margin: 0;
  color: #1e3a5f;
  font-size: 40px;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: 0.4px;
}
.disease-cta > div > div {
  display: flex;
  padding-top: 48px;
  justify-content: center;
  gap: 16px;
}
.disease-cta a,
.disease-cta button {
  display: flex;
  height: 52px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 14px;
  padding: 0 24px;
  background: #fff;
  color: #1e3a5f;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.disease-cta a {
  background: #dd6b20;
  color: #fff;
}
.disease-cta-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
@media (max-width: 850px) {
  .disease-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .disease-page {
    margin-top: -64px;
  }
  .disease-hero {
    min-height: 420px;
    padding-top: 64px;
  }
  .disease-hero > .hy-container {
    min-height: 356px;
  }
  .disease-hero__visual {
    background:
      linear-gradient(180deg, rgba(239, 248, 252, 0.35), #eff8fc 75%),
      url("/images/doctor-team.jpg") 60% 15% / cover no-repeat;
  }
  .disease-hero h1 {
    font-size: 39px;
  }
  .disease-grid {
    grid-template-columns: 1fr;
  }
  .disease-grid article,
  .disease-grid a {
    min-height: 235px;
  }
  .disease-cta > div > div {
    flex-direction: column;
  }
  .disease-cta a,
  .disease-cta button {
    justify-content: center;
  }
}

/* Figma node 144:4380 exact desktop geometry. */
.disease-page {
  margin-top: -64px;
  color: #1e3a5f;
}
.disease-page :deep(.hy-container) {
  width: min(1216px, calc(100% - 80px));
}
.disease-hero {
  position: relative;
  height: 460px;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 180px 112px 130px;
  box-sizing: border-box;
  background: #eef7fb;
}
.disease-hero__visual {
  position: absolute;
  inset: 0;
  display: block;
  background: url("/images/figma/disease-hero-background.png") center/cover
    no-repeat;
}
.disease-hero > .hy-container {
  position: relative;
  z-index: 1;
  display: flex;
  height: 150px;
  min-height: 0;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 0;
}
.disease-hero h1 {
  margin: 0;
  color: #143162;
  font-size: 64px;
  font-weight: 600;
  line-height: 96px;
}
.disease-hero p {
  margin: 0;
  color: #5b606a;
  font-size: 20px;
  line-height: 30px;
}
.disease-directory {
  height: 1896px;
  padding: 96px 0;
  background: #fff;
}
.disease-search {
  display: flex;
  width: 800px;
  max-width: 100%;
  height: 60px;
  align-items: center;
  gap: 16px;
  border: 1px solid #dbe0e6;
  border-radius: 46px;
  padding: 0 24px;
  color: #48627d;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.disease-search:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}
.disease-search__icon {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
}
.disease-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1e3a5f;
  font-size: 16px;
  line-height: 24px;
}
.disease-search input::placeholder {
  color: #9ca3af;
}
.disease-grid {
  display: grid;
  height: 1596px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(5, 300px);
  gap: 24px;
  margin-top: 48px;
}
.disease-grid article,
.disease-grid a {
  display: flex;
  width: 100%;
  height: 300px;
  min-height: 0;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 24px;
  padding: 24px;
  background: #f5f6f7;
  transition:
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    background 0.3s ease;
}
.disease-grid article:hover,
.disease-grid a:hover {
  transform: translateY(-6px);
  background: #fff;
  box-shadow: 0 18px 38px rgba(22, 58, 89, 0.1);
}
.disease-card-icon {
  display: block;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
}
.disease-page [data-reveal] {
  opacity: 1;
  filter: none;
  transform: none;
}
.disease-grid article,
.disease-grid a {
  animation: disease-card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--reveal-delay, 0ms);
}
@keyframes disease-card-in {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
.disease-grid h2 {
  margin: auto 0 10px;
  color: #1e3a5f;
  font-size: 24px;
  letter-spacing: -0.44px;
  line-height: 24px;
}
.disease-grid p {
  margin: 0;
  color: #4b5563;
  font-size: 16px;
  line-height: 24px;
}
.disease-grid p + p {
  margin-top: 8px;
}
.disease-grid strong {
  color: #2563eb;
}
.disease-empty {
  height: 1596px;
  padding: 180px 0;
  color: #8393a1;
  text-align: center;
}
.disease-cta {
  height: 332px;
  padding: 96px 0;
  background: #f5f6f7;
  text-align: center;
}
.disease-cta h2 {
  margin: 0;
  color: #1e3a5f;
  font-size: 40px;
  line-height: 40px;
}
.disease-cta > div > div {
  display: flex;
  height: 52px;
  padding-top: 48px;
  justify-content: center;
  gap: 16px;
}
.disease-cta a,
.disease-cta button {
  display: flex;
  height: 52px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #1e3a5f;
  border-radius: 12px;
  padding: 0 24px;
  background: #fff;
  color: #1e3a5f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    color 0.25s ease;
}
.disease-cta a {
  width: 140px;
  border-color: #dd6b20;
  background: #dd6b20;
  color: #fff;
}
.disease-cta button {
  width: 176px;
}
.disease-cta a:hover,
.disease-cta button:hover {
  transform: translateY(-2px);
  border-color: #dd6b20;
  background: #dd6b20;
  color: #fff;
  box-shadow: 0 10px 24px rgba(221, 107, 32, 0.18);
}
.disease-cta-icon {
  display: block;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
}
@media (max-width: 850px) {
  .disease-page :deep(.hy-container) {
    width: calc(100% - 40px);
  }
  .disease-directory,
  .disease-cta {
    height: auto;
  }
  .disease-grid {
    width: 100%;
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
  }
  .disease-grid article,
  .disease-grid a {
    width: 100%;
  }
}
@media (max-width: 600px) {
  .disease-page :deep(.hy-container) {
    width: calc(100% - 32px);
  }
  .disease-hero {
    height: 620px;
    min-height: 0;
    padding: 0;
  }
  .disease-hero__visual {
    background-position: 66% center;
  }
  .disease-hero > .hy-container {
    height: 620px;
    min-height: 0;
    justify-content: flex-end;
    padding: 0 0 64px;
  }
  .disease-hero h1 {
    font-size: 40px;
    line-height: 50px;
  }
  .disease-hero p {
    max-width: 260px;
    margin-top: 18px;
    font-size: 14px;
    line-height: 22px;
  }
  .disease-directory,
  .disease-cta {
    padding: 64px 0;
  }
  .disease-search {
    width: 100%;
    height: 52px;
  }
  .disease-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 32px;
  }
  .disease-grid article,
  .disease-grid a {
    height: 250px;
  }
  .disease-cta h2 {
    font-size: 30px;
    line-height: 40px;
  }
  .disease-cta > div > div {
    height: auto;
    flex-direction: column;
  }
  .disease-cta a,
  .disease-cta button {
    width: 100%;
    height: 48px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .disease-grid article,
  .disease-grid a,
  .disease-cta a,
  .disease-cta button {
    transition: none;
    animation: none;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bed,
  Building2,
  Calendar,
  Check,
  ExternalLink,
  MapPin,
  Microscope,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-vue-next";
import { cities, hospitals } from "@/data/hospitals";

const displayedCities = cities.filter((city) => city !== "博鳌");
const selectedCity = ref("北京");
const selectedId = ref<number | null>(null);
const filtered = computed(() =>
  (selectedCity.value === "全部"
    ? hospitals
    : hospitals.filter((item) => item.city === selectedCity.value)
  ).slice(0, 8),
);
const selectedHospital = computed(
  () => hospitals.find((item) => item.id === selectedId.value) || null,
);
const modalCloseButton = ref<HTMLButtonElement | null>(null);
const modalPanel = ref<HTMLElement | null>(null);
let modalTrigger: HTMLButtonElement | null = null;
const cardImage = (hospitalId: number, fallback: string) =>
  hospitalId >= 1 && hospitalId <= 8
    ? `/images/figma/hospital-card-${String(hospitalId).padStart(2, "0")}.png`
    : fallback;
const hasBakedBadges = (hospitalId: number) =>
  hospitalId >= 1 && hospitalId <= 8;
let savedScrollY = 0;
watch(selectedId, (value) => {
  if (value !== null) {
    modalTrigger = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
    savedScrollY = window.scrollY;
    document.body.classList.add("scroll-locked");
    document.body.style.top = `-${savedScrollY}px`;
    nextTick(() => modalCloseButton.value?.focus());
  } else {
    document.body.classList.remove("scroll-locked");
    document.body.style.top = "";
    window.scrollTo(0, savedScrollY);
    nextTick(() => modalTrigger?.focus());
  }
});
function closeHospital() { selectedId.value = null; }
function handleModalKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && selectedId.value !== null) { closeHospital(); return; }
  if (event.key !== "Tab" || selectedId.value === null || !modalPanel.value) return;
  const focusable = Array.from(modalPanel.value.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"));
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
onMounted(() => window.addEventListener("keydown", handleModalKeydown));
onUnmounted(() => {
  document.body.classList.remove("scroll-locked");
  document.body.style.top = "";
  window.removeEventListener("keydown", handleModalKeydown);
});
function openConsultation() {
  selectedId.value = null;
  setTimeout(
    () => window.dispatchEvent(new CustomEvent("open-consultation")),
    50,
  );
}
</script>

<template>
  <div class="hospital-page">
    <section class="hospital-hero">
      <div class="hospital-hero__visual" />
      <div class="hospital-hero__content hy-container" data-reveal>
        <div class="hospital-hero__features">
          <span><UsersRound />专业团队</span>
          <span><Microscope />先进设备</span>
          <span><BadgeCheck />权威认证</span>
        </div>
        <h1>中国顶尖国际医疗资源</h1>
        <p>51家涉外认证医院，覆盖肿瘤/心血管/神经/骨科/慢性病等全病种</p>
      </div>
    </section>

    <section class="hospital-directory">
      <div class="hy-container">
        <div class="city-tabs" aria-label="按城市筛选医院">
          <button
            v-for="city in displayedCities"
            :key="city"
            type="button"
            :class="{ active: selectedCity === city }"
            @click="selectedCity = city"
          >
            {{ city }}
          </button>
        </div>
        <div class="hospital-grid">
          <article
            v-for="(hospital, index) in filtered"
            :key="hospital.id"
            data-reveal
            :style="{ '--reveal-delay': `${(index % 3) * 45}ms` }"
          >
            <div class="hospital-image">
              <img
                :src="cardImage(hospital.id, hospital.image)"
                :alt="hospital.name"
              />
              <template v-if="!hasBakedBadges(hospital.id)">
                <span><MapPin />{{ hospital.city }}</span>
                <i>{{ hospital.type }}</i>
                <b v-if="hospital.jci"><Award />JCI</b>
              </template>
            </div>
            <div class="hospital-body">
              <h2>{{ hospital.name }}</h2>
              <div class="specialties">
                <span
                  v-for="item in hospital.specialties.slice(0, 3)"
                  :key="item"
                  >{{ item }}</span
                >
              </div>
              <div class="hospital-facts">
                <span><Calendar />{{ hospital.established }}</span>
                <span><Bed />{{ hospital.beds }}床</span>
                <span><Building2 />{{ hospital.departments }}科室</span>
              </div>
              <div class="hospital-actions">
                <button type="button" @click="selectedId = hospital.id">
                  查看详情
                </button>
                <button type="button" @click="openConsultation">
                  预约咨询
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <Teleport to="body"
      ><Transition name="modal"
        ><div
          v-if="selectedHospital"
          class="hospital-modal"
          role="dialog"
          aria-modal="true"
          @click.self="closeHospital"
        >
          <section ref="modalPanel" class="hospital-modal__panel" aria-labelledby="hospital-modal-title">
            <button
              class="modal-close"
              type="button"
              aria-label="关闭"
              ref="modalCloseButton"
              @click="closeHospital"
            >
              <X />
            </button>
            <div class="modal-hero">
              <img :src="selectedHospital.image" :alt="selectedHospital.name" />
              <div />
              <span><MapPin />{{ selectedHospital.city }}</span>
              <h2 id="hospital-modal-title">{{ selectedHospital.name }}</h2>
              <p>{{ selectedHospital.nameEn }}</p>
            </div>
            <div class="modal-content">
              <div class="modal-facts">
                <div>
                  <Calendar /><span
                    ><small>成立年份</small
                    ><strong>{{ selectedHospital.established }}</strong></span
                  >
                </div>
                <div>
                  <Bed /><span
                    ><small>开放床位</small
                    ><strong>{{ selectedHospital.beds }}</strong></span
                  >
                </div>
                <div>
                  <Building2 /><span
                    ><small>科室数量</small
                    ><strong>{{ selectedHospital.departments }}</strong></span
                  >
                </div>
              </div>
              <section>
                <h3>医院简介</h3>
                <p>{{ selectedHospital.intro }}</p>
              </section>
              <div class="modal-columns">
                <section>
                  <h3><Stethoscope />优势专科</h3>
                  <div class="modal-tags">
                    <span
                      v-for="item in selectedHospital.specialties"
                      :key="item"
                      >{{ item }}</span
                    >
                  </div>
                </section>
                <section>
                  <h3><ShieldCheck />国际服务</h3>
                  <ul>
                    <li v-for="item in selectedHospital.services" :key="item">
                      <Check />{{ item }}
                    </li>
                  </ul>
                </section>
              </div>
              <div class="modal-actions">
                <button type="button" @click="openConsultation">
                  预约咨询<ArrowRight /></button
                ><a
                  :href="selectedHospital.website"
                  target="_blank"
                  rel="noopener"
                  >医院官网<ExternalLink
                /></a>
              </div>
            </div>
          </section></div></Transition
    ></Teleport>
  </div>
</template>

<style scoped>
.hospital-page {
  margin-top: -72px;
  color: #173b67;
}
.hospital-hero {
  position: relative;
  min-height: 680px;
  overflow: hidden;
  padding-top: 72px;
  background: #edf7fb;
}
.hospital-hero__visual {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(239, 248, 252, 0.96) 0%,
      rgba(239, 248, 252, 0.62) 43%,
      rgba(239, 248, 252, 0.08) 78%
    ),
    url("/images/china-hospitals.jpg") center/cover;
}
.hospital-hero > .hy-container {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 608px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.hospital-hero > div > span,
.hospital-directory header > span {
  color: #3478ef;
  font-size: 11px;
  font-weight: 750;
}
.hospital-hero h1 {
  margin: 17px 0 15px;
  font-size: 48px;
}
.hospital-hero p {
  margin: 0;
  color: #62788b;
  font-size: 14px;
  line-height: 1.9;
}
.hospital-hero button {
  display: flex;
  height: 46px;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  border: 0;
  border-radius: 7px;
  padding: 0 20px;
  background: #173b63;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.hospital-hero svg {
  width: 15px;
}
.hospital-directory {
  padding: 90px 0 110px;
}
.hospital-directory header {
  text-align: center;
}
.hospital-directory h2 {
  margin: 10px 0 8px;
  font-size: 34px;
}
.hospital-directory header p {
  margin: 0;
  color: #8795a2;
  font-size: 11px;
}
.city-tabs {
  display: flex;
  justify-content: center;
  gap: 9px;
  margin: 38px 0 34px;
  overflow-x: auto;
}
.city-tabs button {
  flex: none;
  border: 1px solid #dbe3e8;
  border-radius: 20px;
  padding: 8px 18px;
  background: #fff;
  color: #657a8d;
  font-size: 10px;
  cursor: pointer;
}
.city-tabs button.active {
  border-color: #2f72f3;
  background: #2f72f3;
  color: #fff;
}
.hospital-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}
.hospital-grid article {
  overflow: hidden;
  border: 1px solid #e0e6ea;
  border-radius: 9px;
  background: #fff;
  transition:
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease;
}
.hospital-grid article:hover {
  transform: translateY(-6px);
  box-shadow: 0 19px 40px rgba(20, 56, 85, 0.11);
}
.hospital-image {
  position: relative;
  height: 210px;
  overflow: hidden;
}
.hospital-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.hospital-grid article:hover .hospital-image img {
  transform: scale(1.045);
}
.hospital-image > span,
.hospital-image > b {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #173b67;
  font-size: 9px;
}
.hospital-image > span {
  bottom: 12px;
  left: 12px;
}
.hospital-image > b {
  top: 12px;
  right: 12px;
  background: #2da775;
  color: #fff;
}
.hospital-image svg {
  width: 12px;
}
.hospital-body {
  padding: 22px;
}
.hospital-type {
  display: flex;
  gap: 6px;
}
.hospital-type span {
  border-radius: 4px;
  padding: 4px 7px;
  background: #edf5ff;
  color: #3478ef;
  font-size: 8px;
}
.hospital-body h3 {
  min-height: 46px;
  margin: 13px 0 4px;
  font-size: 17px;
  line-height: 1.4;
}
.hospital-body > p {
  min-height: 30px;
  margin: 0;
  color: #8996a2;
  font-size: 9px;
}
.specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 48px;
  margin-top: 15px;
}
.specialties span {
  border-radius: 3px;
  padding: 5px 7px;
  background: #f3f5f7;
  color: #617689;
  font-size: 8px;
}
.hospital-body dl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 16px 0;
  border-block: 1px solid #edf1f4;
  padding: 14px 0;
}
.hospital-body dl div {
  display: grid;
  gap: 2px;
  border-left: 1px solid #e5eaee;
  text-align: center;
}
.hospital-body dl div:first-child {
  border-left: 0;
}
.hospital-body dt {
  color: #173b67;
  font-size: 14px;
  font-weight: 700;
}
.hospital-body dd {
  margin: 0;
  color: #96a1aa;
  font-size: 8px;
}
.hospital-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.hospital-actions button {
  display: flex;
  height: 39px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid #173b63;
  border-radius: 5px;
  background: #fff;
  color: #173b63;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}
.hospital-actions button:last-child {
  border-color: #eb6f20;
  background: #eb6f20;
  color: #fff;
}
.hospital-actions svg {
  width: 12px;
}
.hospital-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(4, 27, 44, 0.65);
  backdrop-filter: blur(8px);
}
.hospital-modal__panel {
  position: relative;
  width: min(900px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
}
.modal-close {
  position: absolute;
  top: 17px;
  right: 17px;
  z-index: 3;
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  background: rgba(5, 38, 63, 0.48);
  color: #fff;
  cursor: pointer;
}
.modal-close svg {
  width: 18px;
}
.modal-hero {
  position: relative;
  min-height: 290px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 34px;
  color: #fff;
}
.modal-hero img,
.modal-hero > div {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.modal-hero img {
  object-fit: cover;
}
.modal-hero > div {
  background: linear-gradient(
    0deg,
    rgba(4, 33, 53, 0.92),
    rgba(4, 33, 53, 0.04)
  );
}
.modal-hero span,
.modal-hero h2,
.modal-hero p {
  position: relative;
  z-index: 1;
}
.modal-hero span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8cd8f9;
  font-size: 10px;
}
.modal-hero span svg {
  width: 13px;
}
.modal-hero h2 {
  margin: 8px 0 2px;
  font-size: 29px;
}
.modal-hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
}
.modal-content {
  padding: 30px 36px 38px;
}
.modal-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.modal-facts > div {
  display: flex;
  align-items: center;
  gap: 11px;
  border: 1px solid #dfe8ed;
  border-radius: 6px;
  padding: 15px;
}
.modal-facts svg {
  width: 20px;
  color: #3478ef;
}
.modal-facts span {
  display: grid;
}
.modal-facts small {
  color: #8997a3;
  font-size: 8px;
}
.modal-facts strong {
  font-size: 15px;
}
.modal-content section {
  margin-top: 27px;
}
.modal-content section h3 {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 12px;
  font-size: 15px;
}
.modal-content section h3 svg {
  width: 18px;
  color: #3478ef;
}
.modal-content section > p {
  margin: 0;
  color: #64798c;
  font-size: 11px;
  line-height: 1.85;
}
.modal-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}
.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.modal-tags span {
  border-radius: 4px;
  padding: 6px 8px;
  background: #edf5ff;
  color: #3478ef;
  font-size: 9px;
}
.modal-content ul {
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.modal-content li {
  display: flex;
  gap: 6px;
  color: #65798c;
  font-size: 10px;
}
.modal-content li svg {
  width: 14px;
  color: #2da775;
}
.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
  border-top: 1px solid #e3e9ed;
  padding-top: 24px;
}
.modal-actions button,
.modal-actions a {
  display: flex;
  height: 43px;
  align-items: center;
  gap: 7px;
  border: 1px solid #173b63;
  border-radius: 6px;
  padding: 0 19px;
  background: #173b63;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.modal-actions a {
  background: #fff;
  color: #173b63;
}
.modal-actions svg {
  width: 14px;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .hospital-modal__panel,
.modal-leave-active .hospital-modal__panel {
  transition: transform 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .hospital-modal__panel,
.modal-leave-to .hospital-modal__panel {
  transform: translateY(15px);
}
@media (max-width: 900px) {
  .hospital-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 650px) {
  .hospital-page {
    margin-top: -64px;
  }
  .hospital-hero {
    min-height: 590px;
    padding-top: 64px;
  }
  .hospital-hero > .hy-container {
    min-height: 526px;
    justify-content: flex-end;
    padding-bottom: 70px;
  }
  .hospital-hero__visual {
    background:
      linear-gradient(180deg, rgba(239, 248, 252, 0.2), #eff8fc 73%),
      url("/images/china-hospitals.jpg") center/cover;
  }
  .hospital-hero h1 {
    font-size: 37px;
  }
  .hospital-grid {
    grid-template-columns: 1fr;
  }
  .hospital-modal {
    align-items: end;
    padding: 0;
  }
  .hospital-modal__panel {
    max-height: 94vh;
    border-radius: 9px 9px 0 0;
  }
  .modal-content {
    padding: 24px 18px 32px;
  }
  .modal-facts,
  .modal-columns {
    grid-template-columns: 1fr;
  }
  .modal-actions {
    flex-direction: column;
  }
  .modal-actions button,
  .modal-actions a {
    justify-content: center;
  }
}

/* Figma node 144:4707 exact desktop geometry. */
.hospital-page {
  margin-top: -64px;
  color: #173b67;
}
.hospital-page :deep(.hy-container) {
  width: min(1216px, calc(100% - 64px));
}
.hospital-hero {
  position: relative;
  height: 460px;
  min-height: 0;
  overflow: hidden;
  padding: 64px 0 0;
  background: #eef7fc;
}
.hospital-hero__visual {
  position: absolute;
  inset: 64px 0 0;
  background: url("/images/figma/hospital-directory-hero.png") center/cover
    no-repeat;
}
.hospital-hero__content {
  position: absolute;
  width: 1px !important;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.hospital-directory {
  height: 1524px;
  padding: 96px 0;
  background: #fff;
}
.city-tabs {
  display: flex;
  height: 42px;
  justify-content: flex-start;
  gap: 16px;
  margin: 0;
  overflow-x: auto;
}
.city-tabs button {
  min-width: 80px;
  height: 42px;
  flex: none;
  border: 1px solid #dbdee6;
  border-radius: 22px;
  padding: 0 24px;
  background: #fff;
  color: #4e647c;
  font-size: 16px;
  font-weight: 500;
  line-height: 40px;
  cursor: pointer;
  transition:
    border-color 0.25s ease,
    background 0.25s ease,
    color 0.25s ease,
    transform 0.25s ease;
}
.city-tabs button:hover,
.city-tabs button.active {
  border-color: #dd6b20;
  background: #dd6b20;
  color: #fff;
}
.city-tabs button:hover {
  transform: translateY(-2px);
}
.hospital-grid {
  display: grid;
  height: 1290px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, 398px);
  gap: 24px;
  padding-top: 48px;
  box-sizing: border-box;
}
.hospital-grid article {
  height: 398px;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #e1e7eb;
  border-radius: 24px;
  background: #f5f6f7;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease;
}
.hospital-grid article:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(22, 58, 89, 0.12);
}
.hospital-image {
  position: relative;
  height: 192px;
  overflow: hidden;
}
.hospital-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.hospital-grid article:hover .hospital-image img {
  transform: scale(1.025);
}
.hospital-image > span,
.hospital-image > i,
.hospital-image > b {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  padding: 5px 9px;
  background: rgba(255, 255, 255, 0.92);
  color: #334155;
  font-size: 13px;
  font-style: normal;
}
.hospital-image > span {
  bottom: 12px;
  left: 12px;
  background: #3478ef;
  color: #fff;
}
.hospital-image > i {
  top: 12px;
  left: 12px;
}
.hospital-image > b {
  top: 12px;
  right: 12px;
  background: #0ea472;
  color: #fff;
}
.hospital-image svg {
  width: 14px;
  height: 14px;
}
.hospital-body {
  height: 206px;
  padding: 20px 24px 24px;
}
.hospital-body h2 {
  margin: 0;
  overflow: hidden;
  color: #192d47;
  font-size: 22px;
  font-weight: 700;
  line-height: 36px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.specialties {
  display: flex;
  min-height: 22px;
  flex-wrap: nowrap;
  gap: 8px;
  margin: 10px 0 0;
  overflow: hidden;
}
.specialties span {
  flex: none;
  border-radius: 11px;
  padding: 2px 8px;
  background: #e4ecff;
  color: #4f83ed;
  font-size: 12px;
  line-height: 18px;
}
.hospital-facts {
  display: flex;
  height: 20px;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  color: #7d8792;
  font-size: 13px;
}
.hospital-facts span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.hospital-facts svg {
  width: 14px;
  height: 14px;
}
.hospital-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 14px;
}
.hospital-actions button {
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid #1e3a5f;
  border-radius: 8px;
  background: #fff;
  color: #1e3a5f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease;
}
.hospital-actions button:last-child,
.hospital-actions button:hover {
  border-color: #e86c17;
  background: #e86c17;
  color: #fff;
}
.hospital-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(232, 108, 23, 0.18);
}
@media (max-width: 900px) {
  .hospital-directory {
    height: auto;
  }
  .hospital-grid {
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    padding-top: 0;
  }
}
@media (max-width: 650px) {
  .hospital-page :deep(.hy-container) {
    width: calc(100% - 32px);
  }
  .hospital-hero {
    height: 620px;
    min-height: 0;
    padding-top: 64px;
  }
  .hospital-hero__visual {
    inset: 64px 0 0;
    background:
      linear-gradient(180deg, rgba(238, 247, 252, 0.05), #eef7fc 70%),
      url("/images/china-hospitals.jpg") 62% center/cover no-repeat;
  }
  .hospital-hero__content {
    position: relative;
    display: flex;
    width: calc(100% - 32px) !important;
    height: 556px;
    flex-direction: column;
    justify-content: flex-end;
    overflow: visible;
    padding-bottom: 54px;
    clip-path: none;
    white-space: normal;
  }
  .hospital-hero__features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .hospital-hero__features span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 16px;
    padding: 7px 10px;
    background: rgba(226, 237, 255, 0.92);
    color: #3478ef;
    font-size: 12px;
  }
  .hospital-hero__features svg {
    width: 14px;
    height: 14px;
  }
  .hospital-hero h1 {
    margin: 22px 0 16px;
    font-size: 39px;
    line-height: 49px;
  }
  .hospital-hero p {
    margin: 0;
    color: #596875;
    font-size: 14px;
    line-height: 22px;
  }
  .hospital-directory {
    padding: 64px 0;
  }
  .city-tabs {
    margin-bottom: 32px;
    padding-bottom: 0;
  }
  .city-tabs button {
    min-width: 70px;
    padding: 0 18px;
    font-size: 14px;
  }
  .hospital-grid {
    height: auto;
    grid-template-columns: 1fr;
    gap: 16px;
    padding-top: 0;
  }
  .hospital-grid article {
    height: 398px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hospital-grid article,
  .hospital-image img,
  .city-tabs button,
  .hospital-actions button {
    transition: none;
  }
}
</style>

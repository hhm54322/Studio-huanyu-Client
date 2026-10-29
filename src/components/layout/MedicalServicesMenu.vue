<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const items = [
  { id: '1524:4', label: '健康体检', href: '' },
  { id: '1524:14', label: '专科诊疗', href: '/diseases-technologies' },
  { id: '1524:8', label: '中医康养', href: '' },
  { id: '1524:10', label: '细胞治疗', href: '' },
]
const isActive = computed(() => route.path === '/diseases-technologies')
</script>

<template>
  <div class="medical-services-menu" data-figma-node="1524:2" aria-label="医疗服务菜单">
    <template v-for="(item, index) in items" :key="item.id">
      <RouterLink
        v-if="item.href"
        :to="item.href"
        class="medical-services-menu__item"
        :class="{ 'is-active': isActive }"
        :data-figma-node="index === 1 ? '1524:13' : `1524:${index === 0 ? 3 : index === 2 ? 7 : 9}`"
        :aria-current="isActive ? 'page' : undefined"
      >
        <span :data-figma-node="item.id">{{ item.label }}</span>
      </RouterLink>
      <button
        v-else
        type="button"
        class="medical-services-menu__item"
        :data-figma-node="index === 0 ? '1524:3' : index === 2 ? '1524:7' : '1524:9'"
        title="内容正在准备中"
      >
        <span :data-figma-node="item.id">{{ item.label }}</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.medical-services-menu {
  display: flex;
  width: 111px;
  height: 149px;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 14px 12px 12px;
  border: .5px solid #e3e4e8;
  border-radius: 16px;
  background: #fff;
  box-sizing: border-box;
}
.medical-services-menu__item {
  display: flex;
  width: 84px;
  min-height: 28px;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  padding: 6px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #6B7280;
  font: 400 12px/16px "PingFang SC", sans-serif;
  text-align: left;
  text-decoration: none;
  box-sizing: border-box;
  cursor: pointer;
}
.medical-services-menu__item.is-active { color: #2563EB; font-weight: 600; text-align: center; background: rgba(37, 99, 235, .1); }
.medical-services-menu__item:hover,
.medical-services-menu__item:focus-visible { background: #f5f8ff; outline: none; }
.medical-services-menu__item span { display: block; width: 48px; height: 16px; }
</style>

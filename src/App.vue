<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

onMounted(() => {
  appStore.initResponsive();
});
//
onUnmounted(() => {
  appStore.destroyResponsive();
});
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
</template>

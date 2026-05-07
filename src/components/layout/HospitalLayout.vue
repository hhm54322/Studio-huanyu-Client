<script setup lang="ts">
import HospitalHeader from './HospitalHeader.vue'
import HospitalFooter from './HospitalFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--hospital-light)">
    <HospitalHeader />
    <main class="flex-1 pt-16">
      <RouterView />
    </main>
    <HospitalFooter />
  </div>
</template>

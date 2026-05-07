<script setup lang="ts">
import PatientHeader from './PatientHeader.vue'
import PatientFooter from './PatientFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--bg-page)">
    <PatientHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <PatientFooter />
  </div>
</template>

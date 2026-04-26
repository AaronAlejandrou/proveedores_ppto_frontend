<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppToast from '@/components/ui/AppToast.vue';
</script>

<template>
  <div id="app">
    <RouterView />
    <AppToast position="top-right" :max-toasts="5" />
  </div>
</template>

<style>
/* ===== GLOBAL STYLES ===== */
#app {
  min-height: 100vh;
  font-family: var(--font-family-base);
  background-color: var(--color-app-background);
  color: var(--color-text-primary);
  line-height: var(--leading-normal);
}

/* ===== SCROLLBAR STYLING ===== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-gray-100);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

/* ===== FOCUS STYLES ===== */
*:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

/* ===== SELECTION STYLES ===== */
::selection {
  background: var(--color-primary-200);
  color: var(--color-primary-900);
}

/* ===== PRINT STYLES ===== */
@media print {
  .no-print {
    display: none !important;
  }
  
  * {
    color: black !important;
    background: white !important;
  }
}
</style>

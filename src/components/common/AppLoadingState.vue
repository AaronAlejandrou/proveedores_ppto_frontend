<template>
  <div class="app-loading-state" role="status" aria-live="polite">
    <ProgressSpinner class="spinner" strokeWidth="4" />
    <span v-if="displayText">{{ displayText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ProgressSpinner from "primevue/progressspinner";

const props = defineProps<{
  text?: string;
  message?: string;
}>();

const displayText = computed(() => props.message ?? props.text);
</script>

<style scoped>
.app-loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  gap: 1rem;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
.spinner {
  width: 40px;
  height: 40px;
}
</style>

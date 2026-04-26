<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <header class="section-header">
    <h3 class="section-header-title">{{ title }}</h3>
    <p v-if="subtitle" class="section-header-subtitle">{{ subtitle }}</p>
  </header>
</template>

<style scoped>
.section-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-header-title {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.125rem;
}

.section-header-subtitle {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}
</style>

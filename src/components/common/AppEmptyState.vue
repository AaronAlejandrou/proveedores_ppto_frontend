<template>
  <div class="app-empty-state">
    <AppIcon :name="icon || 'inbox'" class="icon" :size="36" />
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot name="actions"></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon?: string;
}>();
</script>

<style scoped>
.app-empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-12) var(--space-8);
  width: 100%;
  background: var(--color-surface);
  border: 1px dashed var(--color-border-secondary);
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.icon {
  font-size: 2.5rem;
  color: var(--color-primary-300);
  margin-bottom: var(--space-3);
  opacity: 0.9;
}
h3 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
}
p {
  margin: 0 0 var(--space-6) 0;
  color: var(--color-text-secondary);
  max-width: 24rem;
  line-height: var(--leading-relaxed);
}
</style>

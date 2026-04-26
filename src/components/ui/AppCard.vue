<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  rounded: 'md',
  shadow: 'sm',
  border: true,
  hoverable: false,
  clickable: false
});

const cardClasses = computed(() => {
  return [
    'app-card',
    `app-card--${props.variant}`,
    `app-card--padding-${props.padding}`,
    `app-card--rounded-${props.rounded}`,
    `app-card--shadow-${props.shadow}`,
    {
      'app-card--border': props.border,
      'app-card--hoverable': props.hoverable,
      'app-card--clickable': props.clickable
    }
  ];
});
</script>

<template>
  <div :class="cardClasses" class="app-card">
    <slot />
  </div>
</template>

<style scoped>
/* ===== BASE CARD ===== */
.app-card {
  background: var(--color-surface);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

/* ===== VARIANTS ===== */
.app-card--default {
  border: 1px solid var(--color-border-primary);
}

.app-card--elevated {
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-elevated);
}

.app-card--outlined {
  border: 2px solid var(--color-border-primary);
  background: transparent;
}

.app-card--flat {
  border: none;
  background: transparent;
  box-shadow: none;
}

/* ===== PADDING ===== */
.app-card--padding-none {
  padding: 0;
}

.app-card--padding-sm {
  padding: var(--space-4);
}

.app-card--padding-md {
  padding: var(--space-6);
}

.app-card--padding-lg {
  padding: var(--space-8);
}

/* ===== ROUNDED ===== */
.app-card--rounded-none {
  border-radius: 0;
}

.app-card--rounded-sm {
  border-radius: var(--radius-sm);
}

.app-card--rounded-md {
  border-radius: var(--radius-md);
}

.app-card--rounded-lg {
  border-radius: var(--radius-lg);
}

.app-card--rounded-full {
  border-radius: var(--radius-full);
}

/* ===== SHADOW ===== */
.app-card--shadow-none {
  box-shadow: none;
}

.app-card--shadow-sm {
  box-shadow: var(--shadow-sm);
}

.app-card--shadow-md {
  box-shadow: var(--shadow-md);
}

.app-card--shadow-lg {
  box-shadow: var(--shadow-lg);
}

.app-card--shadow-xl {
  box-shadow: var(--shadow-xl);
}

/* ===== INTERACTIVE STATES ===== */
.app-card--border {
  border: 1px solid var(--color-border-primary);
}

.app-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
  border-color: var(--color-primary-200);
}

.app-card--clickable {
  cursor: pointer;
}

.app-card--clickable:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-elevated);
  border-color: var(--color-primary-300);
}

.app-card--clickable:active {
  transform: translateY(0);
}
</style>

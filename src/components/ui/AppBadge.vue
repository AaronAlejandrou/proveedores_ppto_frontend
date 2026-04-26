<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  dot?: boolean;
  outline?: boolean;
  uppercase?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  rounded: 'full',
  dot: false,
  outline: false,
  uppercase: true
});

const badgeClasses = computed(() => {
  return [
    'app-badge',
    `app-badge--${props.variant}`,
    `app-badge--size-${props.size}`,
    `app-badge--rounded-${props.rounded}`,
    {
      'app-badge--dot': props.dot,
      'app-badge--outline': props.outline,
      'app-badge--uppercase': props.uppercase
    }
  ];
});
</script>

<template>
  <div :class="badgeClasses" class="app-badge">
    <div v-if="dot" class="app-badge__dot"></div>
    <span class="app-badge__content">
      <slot />
    </span>
  </div>
</template>

<style scoped>
/* ===== BASE BADGE ===== */
.app-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-tight);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

/* ===== SIZES ===== */
.app-badge--size-sm {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
}

.app-badge--size-md {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
}

.app-badge--size-lg {
  font-size: var(--text-base);
  padding: var(--space-3) var(--space-4);
}

/* ===== ROUNDED ===== */
.app-badge--rounded-none {
  border-radius: 0;
}

.app-badge--rounded-sm {
  border-radius: var(--radius-sm);
}

.app-badge--rounded-md {
  border-radius: var(--radius-md);
}

.app-badge--rounded-lg {
  border-radius: var(--radius-lg);
}

.app-badge--rounded-full {
  border-radius: var(--radius-full);
}

/* ===== VARIANTS ===== */
.app-badge--default {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-200);
}

.app-badge--primary {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border: 1px solid var(--color-primary-200);
}

.app-badge--secondary {
  background: var(--color-secondary-100);
  color: var(--color-secondary-700);
  border: 1px solid var(--color-secondary-200);
}

.app-badge--success {
  background: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.app-badge--warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
}

.app-badge--error {
  background: var(--color-error-light);
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.app-badge--info {
  background: var(--color-info-light);
  color: var(--color-info);
  border: 1px solid var(--color-info);
}

/* ===== OUTLINE VARIANTS ===== */
.app-badge--outline.app-badge--default {
  background: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
}

.app-badge--outline.app-badge--primary {
  background: transparent;
  color: var(--color-primary-600);
  border: 1px solid var(--color-primary-300);
}

.app-badge--outline.app-badge--secondary {
  background: transparent;
  color: var(--color-secondary-600);
  border: 1px solid var(--color-secondary-300);
}

.app-badge--outline.app-badge--success {
  background: transparent;
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.app-badge--outline.app-badge--warning {
  background: transparent;
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
}

.app-badge--outline.app-badge--error {
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.app-badge--outline.app-badge--info {
  background: transparent;
  color: var(--color-info);
  border: 1px solid var(--color-info);
}

/* ===== DOT VARIANT ===== */
.app-badge--dot {
  padding-left: var(--space-1);
}

.app-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}

/* ===== UPPERCASE ===== */
.app-badge--uppercase {
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* ===== CONTENT ===== */
.app-badge__content {
  display: flex;
  align-items: center;
}
</style>

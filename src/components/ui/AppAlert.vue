<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  dismissible?: boolean;
  timeout?: number;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: false,
  timeout: 0,
  size: 'md',
  variant: 'solid'
});

const emit = defineEmits<{
  dismiss: []
}>();

const isVisible = ref(true);

const alertConfig = computed(() => {
  const configs = {
    success: {
      icon: 'approved',
      bgColor: 'var(--color-success)',
      borderColor: 'var(--color-success)',
      textColor: 'var(--color-text-inverse)',
      subtleBg: 'var(--color-success-light)',
      subtleText: 'var(--color-success)'
    },
    error: {
      icon: 'error',
      bgColor: 'var(--color-error)',
      borderColor: 'var(--color-error)',
      textColor: 'var(--color-text-inverse)',
      subtleBg: 'var(--color-error-light)',
      subtleText: 'var(--color-error)'
    },
    warning: {
      icon: 'pending',
      bgColor: 'var(--color-warning)',
      borderColor: 'var(--color-warning)',
      textColor: 'var(--color-text-inverse)',
      subtleBg: 'var(--color-warning-light)',
      subtleText: 'var(--color-warning)'
    },
    info: {
      icon: 'detail',
      bgColor: 'var(--color-info)',
      borderColor: 'var(--color-info)',
      textColor: 'var(--color-text-inverse)',
      subtleBg: 'var(--color-info-light)',
      subtleText: 'var(--color-info)'
    }
  };
  
  return {
    ...configs[props.type],
    icon: props.icon || configs[props.type].icon
  };
});

const alertClasses = computed(() => {
  return [
    'app-alert',
    `app-alert--${props.type}`,
    `app-alert--${props.size}`,
    `app-alert--${props.variant}`,
    {
      'app-alert--dismissible': props.dismissible
    }
  ];
});

const alertStyles = computed(() => {
  const config = alertConfig.value;
  
  if (props.variant === 'solid') {
    return {
      backgroundColor: config.bgColor,
      borderColor: config.borderColor,
      color: config.textColor
    };
  } else if (props.variant === 'outline') {
    return {
      backgroundColor: 'transparent',
      borderColor: config.borderColor,
      color: config.borderColor
    };
  } else {
    return {
      backgroundColor: config.subtleBg,
      borderColor: config.borderColor,
      color: config.subtleText
    };
  }
});

const dismiss = () => {
  isVisible.value = false;
  emit('dismiss');
};

// Auto dismiss functionality
if (props.timeout > 0) {
  setTimeout(() => {
    dismiss();
  }, props.timeout);
}
</script>

<template>
  <Transition name="alert" appear>
    <div v-if="isVisible" :class="alertClasses" :style="alertStyles">
      <!-- Alert Icon -->
      <div class="app-alert__icon">
        <AppIcon :name="alertConfig.icon" :size="20" />
      </div>
      
      <!-- Alert Content -->
      <div class="app-alert__content">
        <h4 v-if="title" class="app-alert__title">{{ title }}</h4>
        <p v-if="message" class="app-alert__message">{{ message }}</p>
        <slot />
      </div>
      
      <!-- Dismiss Button -->
      <button 
        v-if="dismissible" 
        class="app-alert__dismiss" 
        @click="dismiss"
        :aria-label="'Dismiss alert'"
      >
        <AppIcon name="close" :size="16" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/* ===== BASE ALERT ===== */
.app-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid;
  position: relative;
  transition: all var(--transition-fast);
}

/* ===== SIZES ===== */
.app-alert--sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

.app-alert--md {
  padding: var(--space-4);
  font-size: var(--text-sm);
}

.app-alert--lg {
  padding: var(--space-6);
  font-size: var(--text-base);
}

/* ===== VARIANTS ===== */
.app-alert--solid {
  border-color: var(--alert-border-color);
}

.app-alert--outline {
  background: transparent;
  border-width: 2px;
}

.app-alert--subtle {
  border-color: var(--alert-border-color);
}

/* ===== COMPONENTS ===== */
.app-alert__icon {
  flex-shrink: 0;
  font-size: 1.25em;
  line-height: 1;
}

.app-alert--sm .app-alert__icon {
  font-size: 1.1em;
}

.app-alert--lg .app-alert__icon {
  font-size: 1.5em;
}

.app-alert__content {
  flex: 1;
  min-width: 0;
}

.app-alert__title {
  margin: 0 0 var(--space-1) 0;
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
}

.app-alert__message {
  margin: 0;
  line-height: var(--leading-normal);
}

.app-alert__dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  font-size: 1.1em;
  opacity: 0.7;
}

.app-alert__dismiss:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.app-alert--outline .app-alert__dismiss:hover,
.app-alert--subtle .app-alert__dismiss:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* ===== ANIMATIONS ===== */
.alert-enter-active {
  transition: all 0.3s ease-out;
}

.alert-leave-active {
  transition: all 0.2s ease-in;
}

.alert-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== TYPE SPECIFIC STYLES ===== */
.app-alert--success.app-alert--solid {
  --alert-bg-color: var(--color-success);
  --alert-border-color: var(--color-success);
  --alert-text-color: var(--color-text-inverse);
}

.app-alert--error.app-alert--solid {
  --alert-bg-color: var(--color-error);
  --alert-border-color: var(--color-error);
  --alert-text-color: var(--color-text-inverse);
}

.app-alert--warning.app-alert--solid {
  --alert-bg-color: var(--color-warning);
  --alert-border-color: var(--color-warning);
  --alert-text-color: var(--color-text-inverse);
}

.app-alert--info.app-alert--solid {
  --alert-bg-color: var(--color-info);
  --alert-border-color: var(--color-info);
  --alert-text-color: var(--color-text-inverse);
}

.app-alert--success.app-alert--outline {
  --alert-border-color: var(--color-success);
  --alert-text-color: var(--color-success);
}

.app-alert--error.app-alert--outline {
  --alert-border-color: var(--color-error);
  --alert-text-color: var(--color-error);
}

.app-alert--warning.app-alert--outline {
  --alert-border-color: var(--color-warning);
  --alert-text-color: var(--color-warning);
}

.app-alert--info.app-alert--outline {
  --alert-border-color: var(--color-info);
  --alert-text-color: var(--color-info);
}

.app-alert--success.app-alert--subtle {
  --alert-bg-color: var(--color-success-light);
  --alert-border-color: var(--color-success);
  --alert-text-color: var(--color-success);
}

.app-alert--error.app-alert--subtle {
  --alert-bg-color: var(--color-error-light);
  --alert-border-color: var(--color-error);
  --alert-text-color: var(--color-error);
}

.app-alert--warning.app-alert--subtle {
  --alert-bg-color: var(--color-warning-light);
  --alert-border-color: var(--color-warning);
  --alert-text-color: var(--color-warning);
}

.app-alert--info.app-alert--subtle {
  --alert-bg-color: var(--color-info-light);
  --alert-border-color: var(--color-info);
  --alert-text-color: var(--color-info);
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface ToastItem {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  timeout?: number;
  persistent?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface Props {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxToasts: 5
});

const toasts = ref<ToastItem[]>([]);

const toastConfig = computed(() => {
  const configs = {
    success: {
      icon: 'approved',
      bgColor: 'var(--color-success)',
      borderColor: 'var(--color-success)'
    },
    error: {
      icon: 'error',
      bgColor: 'var(--color-error)',
      borderColor: 'var(--color-error)'
    },
    warning: {
      icon: 'pending',
      bgColor: 'var(--color-warning)',
      borderColor: 'var(--color-warning)'
    },
    info: {
      icon: 'detail',
      bgColor: 'var(--color-info)',
      borderColor: 'var(--color-info)'
    }
  };
  
  return configs;
});

const containerClasses = computed(() => {
  return [
    'toast-container',
    `toast-container--${props.position}`
  ];
});

const addToast = (toast: Omit<ToastItem, 'id'>) => {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newToast: ToastItem = { ...toast, id };
  
  // Remove oldest toast if max limit reached
  if (toasts.value.length >= props.maxToasts) {
    toasts.value.shift();
  }
  
  toasts.value.push(newToast);
  
  // Auto dismiss if not persistent
  if (!toast.persistent && toast.timeout !== 0) {
    const timeout = toast.timeout || 5000;
    setTimeout(() => {
      removeToast(id);
    }, timeout);
  }
  
  return id;
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const clearAll = () => {
  toasts.value = [];
};

// Expose methods for external use
defineExpose({
  success: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => 
    addToast({ ...options, message, type: 'success' }),
  error: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => 
    addToast({ ...options, message, type: 'error' }),
  warning: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => 
    addToast({ ...options, message, type: 'warning' }),
  info: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => 
    addToast({ ...options, message, type: 'info' }),
  clear: clearAll
});

// Global toast methods for convenience
onMounted(() => {
  // Make toast methods available globally
  (window as any).$toast = {
    success: addToast,
    error: addToast,
    warning: addToast,
    info: addToast,
    clear: clearAll
  };
});
</script>

<template>
  <Teleport to="body">
    <div :class="containerClasses">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type || 'info'}`"
        >
          <!-- Toast Icon -->
          <div class="toast__icon">
            <AppIcon :name="toastConfig[toast.type || 'info'].icon" :size="18" />
          </div>
          
          <!-- Toast Content -->
          <div class="toast__content">
            <h4 v-if="toast.title" class="toast__title">{{ toast.title }}</h4>
            <p class="toast__message">{{ toast.message }}</p>
          </div>
          
          <!-- Toast Actions -->
          <div class="toast__actions">
            <button
              v-if="toast.action"
              class="toast__action"
              @click="toast.action!.handler"
            >
              {{ toast.action.label }}
            </button>
            <button
              class="toast__close"
              @click="removeToast(toast.id)"
              aria-label="Close toast"
            >
              <AppIcon name="close" :size="16" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* ===== CONTAINER ===== */
.toast-container {
  position: fixed;
  z-index: var(--z-toast);
  pointer-events: none;
  max-width: 400px;
  width: 100%;
}

.toast-container--top-right {
  top: var(--space-4);
  right: var(--space-4);
}

.toast-container--top-left {
  top: var(--space-4);
  left: var(--space-4);
}

.toast-container--bottom-right {
  bottom: var(--space-4);
  right: var(--space-4);
}

.toast-container--bottom-left {
  bottom: var(--space-4);
  left: var(--space-4);
}

.toast-container--top-center {
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
}

.toast-container--bottom-center {
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
}

/* ===== TOAST ITEM ===== */
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-elevated);
  pointer-events: all;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: var(--toast-bg-color);
}

.toast--success::before {
  background: var(--color-success);
}

.toast--error::before {
  background: var(--color-error);
}

.toast--warning::before {
  background: var(--color-warning);
}

.toast--info::before {
  background: var(--color-info);
}

/* ===== TOAST COMPONENTS ===== */
.toast__icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--toast-bg-color);
}

.toast--success .toast__icon {
  color: var(--color-success);
}

.toast--error .toast__icon {
  color: var(--color-error);
}

.toast--warning .toast__icon {
  color: var(--color-warning);
}

.toast--info .toast__icon {
  color: var(--color-info);
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}

.toast__message {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.toast__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.toast__action {
  background: none;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toast__action:hover {
  background: var(--color-gray-50);
  color: var(--color-text-primary);
}

.toast__close {
  background: none;
  border: none;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
  font-size: var(--text-sm);
}

.toast__close:hover {
  background: var(--color-gray-100);
  color: var(--color-text-secondary);
}

/* ===== ANIMATIONS ===== */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-move {
  transition: transform 0.3s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* ===== POSITION ADJUSTMENTS ===== */
.toast-container--top-left .toast-enter-from,
.toast-container--bottom-left .toast-enter-from,
.toast-container--top-left .toast-leave-to,
.toast-container--bottom-left .toast-leave-to {
  transform: translateX(-100%);
}

.toast-container--top-center .toast-enter-from,
.toast-container--bottom-center .toast-enter-from,
.toast-container--top-center .toast-leave-to,
.toast-container--bottom-center .toast-leave-to {
  transform: translateX(-50%) translateY(-100%);
}

.toast-container--top-center .toast-leave-to,
.toast-container--bottom-center .toast-leave-to {
  transform: translateX(-50%) translateY(-100%);
}
</style>

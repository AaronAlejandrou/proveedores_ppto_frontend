<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  variant?: 'dot' | 'badge' | 'chip';
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showLabel: true,
  showIcon: true,
  variant: 'badge',
  animated: false
});

const statusConfig = computed(() => {
  const configs: Record<string, {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  }> = {
    // Purchase Order Statuses
    'CREATED': {
      label: 'Creada',
      color: 'var(--color-gray-600)',
      bgColor: 'var(--color-gray-100)',
      borderColor: 'var(--color-gray-300)',
      icon: 'purchase-order'
    },
    'LINK_GENERATED': {
      label: 'Link Generado',
      color: 'var(--color-primary-600)',
      bgColor: 'var(--color-primary-100)',
      borderColor: 'var(--color-primary-300)',
      icon: 'link'
    },
    'VIEWED_BY_PROVIDER': {
      label: 'Vista por Proveedor',
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-light)',
      borderColor: 'var(--color-warning)',
      icon: 'detail'
    },
    'DOCUMENTS_PENDING': {
      label: 'Pendiente de Documentos',
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-light)',
      borderColor: 'var(--color-warning)',
      icon: 'pending'
    },
    'APPROVED': {
      label: 'Aprobada',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-light)',
      borderColor: 'var(--color-success)',
      icon: 'approved'
    },
    'READY_FOR_MAIN_PPTO': {
      label: 'Lista para PPTO',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-light)',
      borderColor: 'var(--color-success)',
      icon: 'approved'
    },
    
    // Provider Statuses
    'ACTIVE': {
      label: 'Activo',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-light)',
      borderColor: 'var(--color-success)',
      icon: 'approved'
    },
    'INACTIVE': {
      label: 'Inactivo',
      color: 'var(--color-gray-500)',
      bgColor: 'var(--color-gray-100)',
      borderColor: 'var(--color-gray-300)',
      icon: 'close'
    },
    'PENDING': {
      label: 'Pendiente',
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-light)',
      borderColor: 'var(--color-warning)',
      icon: 'pending'
    },
    
    // Submission Statuses
    'VALIDATED': {
      label: 'Validado',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-light)',
      borderColor: 'var(--color-success)',
      icon: 'approved'
    },
    'REJECTED': {
      label: 'Rechazado',
      color: 'var(--color-error)',
      bgColor: 'var(--color-error-light)',
      borderColor: 'var(--color-error)',
      icon: 'error'
    },
    
    // Default
    'UNKNOWN': {
      label: 'Desconocido',
      color: 'var(--color-gray-500)',
      bgColor: 'var(--color-gray-100)',
      borderColor: 'var(--color-gray-300)',
      icon: 'detail'
    }
  };
  
  return configs[props.status.toUpperCase()] || configs['UNKNOWN'];
});

const indicatorClasses = computed(() => {
  return [
    'status-indicator',
    `status-indicator--${props.variant}`,
    `status-indicator--${props.size}`,
    {
      'status-indicator--animated': props.animated
    }
  ];
});

const indicatorStyles = computed(() => {
  const config = statusConfig.value;
  return {
    '--status-color': config.color,
    '--status-bg': config.bgColor,
    '--status-border': config.borderColor
  };
});
</script>

<template>
  <div :class="indicatorClasses" :style="indicatorStyles">
    <!-- Dot Variant -->
    <template v-if="variant === 'dot'">
      <div class="status-dot">
        <div v-if="animated" class="status-dot__pulse"></div>
      </div>
      <span v-if="showLabel" class="status-label">{{ statusConfig.label }}</span>
    </template>
    
    <!-- Badge Variant -->
    <template v-else-if="variant === 'badge'">
      <div class="status-badge">
        <AppIcon
          v-if="showIcon"
          :name="statusConfig.icon"
          class="status-badge__icon"
          :size="size === 'sm' ? 14 : size === 'lg' ? 18 : 16"
        />
        <span class="status-badge__text">{{ statusConfig.label }}</span>
      </div>
    </template>
    
    <!-- Chip Variant -->
    <template v-else-if="variant === 'chip'">
      <div class="status-chip">
        <div v-if="animated" class="status-chip__spinner">
          <AppIcon name="spinner" :size="16" :spin="true" />
        </div>
        <AppIcon
          v-else-if="showIcon"
          :name="statusConfig.icon"
          class="status-chip__icon"
          :size="size === 'sm' ? 14 : size === 'lg' ? 18 : 16"
        />
        <span class="status-chip__text">{{ statusConfig.label }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ===== BASE INDICATOR ===== */
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: var(--font-weight-medium);
  line-height: var(--leading-tight);
}

/* ===== SIZES ===== */
.status-indicator--sm {
  font-size: var(--text-xs);
}

.status-indicator--md {
  font-size: var(--text-sm);
}

.status-indicator--lg {
  font-size: var(--text-base);
}

/* ===== DOT VARIANT ===== */
.status-dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--status-color);
  box-shadow: 0 0 0 2px var(--status-bg);
}

.status-indicator--sm .status-dot {
  width: 6px;
  height: 6px;
}

.status-indicator--lg .status-dot {
  width: 10px;
  height: 10px;
}

.status-dot__pulse {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: var(--radius-full);
  background: var(--status-color);
  opacity: 0.3;
  animation: pulse 2s infinite;
}

.status-label {
  color: var(--color-text-secondary);
  font-size: inherit;
}

/* ===== BADGE VARIANT ===== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--status-bg);
  color: var(--status-color);
  border: 1px solid var(--status-border);
  border-radius: var(--radius-full);
  font-size: inherit;
  font-weight: inherit;
}

.status-badge__icon {
  font-size: inherit;
}

.status-badge__text {
  font-size: inherit;
  font-weight: inherit;
}

/* ===== CHIP VARIANT ===== */
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--status-bg);
  color: var(--status-color);
  border: 1px solid var(--status-border);
  border-radius: var(--radius-md);
  font-size: inherit;
  font-weight: inherit;
  transition: all var(--transition-fast);
}

.status-chip__spinner {
  font-size: inherit;
}

.status-chip__icon {
  font-size: inherit;
}

.status-chip__text {
  font-size: inherit;
  font-weight: inherit;
}

/* ===== ANIMATIONS ===== */
@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

.status-indicator--animated .status-chip {
  position: relative;
  overflow: hidden;
}

.status-indicator--animated .status-chip::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>

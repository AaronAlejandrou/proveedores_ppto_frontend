<script setup lang="ts">
/**
 * Componente ProgressStepper
 * Indicador visual de progreso del flujo de usuario
 * 
 * Muestra los 4 pasos principales del flujo:
 * 1. Revisar Orden
 * 2. Cargar Archivos
 * 3. Procesando
 * 4. Resultado
 */

import { computed } from 'vue';
import { Check } from 'lucide-vue-next';

interface Step {
  id: number;
  title: string;
  subtitle: string;
}

interface Props {
  /** Paso actual (0-3) */
  currentStep: number;
}

const props = defineProps<Props>();

const steps: Step[] = [
  {
    id: 0,
    title: 'Revisar Orden',
    subtitle: 'Monto, moneda y plazo',
  },
  {
    id: 1,
    title: 'Cargar Archivos',
    subtitle: 'XML, PDF y CDR',
  },
  {
    id: 2,
    title: 'Procesando',
    subtitle: 'Validando documentos',
  },
  {
    id: 3,
    title: 'Resultado',
    subtitle: 'Confirmación',
  },
];

/**
 * Determina el estado de un paso específico
 */
const getStepStatus = (stepId: number): 'pending' | 'active' | 'completed' => {
  if (stepId < props.currentStep) return 'completed';
  if (stepId === props.currentStep) return 'active';
  return 'pending';
};
</script>

<template>
  <div class="progress-stepper">
    <div
      v-for="(step, index) in steps"
      :key="step.id"
      class="progress-stepper__step"
      :class="{
        'progress-stepper__step--active': getStepStatus(step.id) === 'active',
        'progress-stepper__step--completed': getStepStatus(step.id) === 'completed',
        'progress-stepper__step--pending': getStepStatus(step.id) === 'pending',
      }"
    >
      <!-- Conector línea (excepto último) -->
      <div
        v-if="index < steps.length - 1"
        class="progress-stepper__connector"
        :class="{
          'progress-stepper__connector--active': getStepStatus(step.id) === 'completed',
        }"
      ></div>

      <!-- Círculo del paso -->
      <div class="progress-stepper__circle">
        <Check
          v-if="getStepStatus(step.id) === 'completed'"
          :size="16"
          class="progress-stepper__check"
        />
        <span v-else class="progress-stepper__number">{{ step.id + 1 }}</span>
      </div>

      <!-- Texto del paso -->
      <div class="progress-stepper__content">
        <span class="progress-stepper__title">{{ step.title }}</span>
        <span class="progress-stepper__subtitle">{{ step.subtitle }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-stepper {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: var(--space-6) 0;
  overflow-x: auto;
}

.progress-stepper__step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 80px;
}

/* Conector línea */
.progress-stepper__connector {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: var(--color-border-primary);
  z-index: 0;
}

.progress-stepper__connector--active {
  background-color: #0855c8;
}

/* Círculo del paso */
.progress-stepper__circle {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all var(--transition-base);
}

.progress-stepper__step--active .progress-stepper__circle {
  background-color: #0855c8;
  box-shadow: 0 0 0 4px rgba(8, 85, 200, 0.2);
}

.progress-stepper__step--completed .progress-stepper__circle {
  background-color: #0855c8;
}

.progress-stepper__check {
  color: var(--color-text-inverse);
}

.progress-stepper__number {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.progress-stepper__step--active .progress-stepper__number,
.progress-stepper__step--completed .progress-stepper__number {
  color: var(--color-text-inverse);
}

/* Contenido del paso */
.progress-stepper__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: var(--space-3);
  text-align: center;
}

.progress-stepper__title {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-1);
}

.progress-stepper__step--active .progress-stepper__title {
  color: #0855c8;
  font-weight: var(--font-weight-semibold);
}

.progress-stepper__step--completed .progress-stepper__title {
  color: #0855c8;
  font-weight: var(--font-weight-semibold);
}

.progress-stepper__subtitle {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
}

.progress-stepper__step--active .progress-stepper__subtitle {
  color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 640px) {
  .progress-stepper {
    gap: var(--space-4);
  }

  .progress-stepper__step {
    min-width: 60px;
  }

  .progress-stepper__circle {
    width: 32px;
    height: 32px;
  }

  .progress-stepper__connector {
    top: 16px;
  }

  .progress-stepper__title {
    font-size: var(--text-xs);
  }

  .progress-stepper__subtitle {
    font-size: 0.625rem;
  }
}
</style>

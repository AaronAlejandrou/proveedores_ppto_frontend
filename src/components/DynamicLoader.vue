<script setup lang="ts">
/**
 * Componente DynamicLoader
 * Pantalla de procesamiento dinámico para mitigación de latencia
 * 
 * Este componente muestra una pantalla de procesamiento con mensajes
 * que rotan cada 2 segundos para retener al usuario durante la latencia
 * de 8-15 segundos de las APIs de Google Drive.
 * 
 * La barra de progreso es simbólica (no basada en datos reales) para
 * indicar que el sistema está trabajando y evitar que el usuario cierre
 * la pestaña pensando que el sistema colgó.
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { PROCESSING_MESSAGES } from '@/types';

const currentMessage = ref(PROCESSING_MESSAGES[0].text);
const progressValue = ref(0);
let messageInterval: number | null = null;
let progressInterval: number | null = null;
let messageIndex = 0;

/**
 * Inicia la rotación de mensajes cada 2 segundos
 */
const startMessageRotation = () => {
  messageInterval = window.setInterval(() => {
    messageIndex = (messageIndex + 1) % PROCESSING_MESSAGES.length;
    currentMessage.value = PROCESSING_MESSAGES[messageIndex].text;
  }, 2000);
};

/**
 * Inicia la animación de la barra de progreso simbólica
 * Ciclo: 0% → 80% → 95% → 99% (nunca 100% hasta response)
 */
const startProgressAnimation = () => {
  progressInterval = window.setInterval(() => {
    if (progressValue.value < 80) {
      progressValue.value += 10;
    } else if (progressValue.value < 95) {
      progressValue.value += 2;
    } else if (progressValue.value < 99) {
      progressValue.value += 1;
    }
  }, 500);
};

/**
 * Detiene todas las animaciones
 */
const stopAnimations = () => {
  if (messageInterval) {
    clearInterval(messageInterval);
    messageInterval = null;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
};

/**
 * Completa la barra de progreso al 100%
 * Se llama cuando se recibe la respuesta del webhook
 */
const completeProgress = () => {
  stopAnimations();
  progressValue.value = 100;
};

/**
 * Reinicia el componente a su estado inicial
 */
const reset = () => {
  stopAnimations();
  currentMessage.value = PROCESSING_MESSAGES[0].text;
  progressValue.value = 0;
  messageIndex = 0;
};

onMounted(() => {
  startMessageRotation();
  startProgressAnimation();
});

onUnmounted(() => {
  stopAnimations();
});

// Exponer métodos para uso externo
defineExpose({
  completeProgress,
  reset,
});
</script>

<template>
  <div class="dynamic-loader">
    <div class="dynamic-loader__container">
      <!-- Spinner animado -->
      <div class="dynamic-loader__spinner">
        <div class="dynamic-loader__spinner-ring"></div>
      </div>

      <!-- Mensaje actual -->
      <p class="dynamic-loader__message">
        {{ currentMessage }}
      </p>

      <!-- Barra de progreso simbólica -->
      <div class="dynamic-loader__progress-container">
        <div
          class="dynamic-loader__progress-bar"
          :style="{ width: `${progressValue}%` }"
        ></div>
      </div>

      <!-- Advertencia de no cerrar ventana -->
      <p class="dynamic-loader__warning">
        Por favor, no cierre esta ventana.
      </p>
      <p class="dynamic-loader__subtext">
        Este proceso puede tardar hasta 15 segundos.
      </p>
    </div>
  </div>
</template>

<style scoped>
.dynamic-loader {
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 2rem;
}

.dynamic-loader__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  max-width: 400px;
}

/* Spinner animado */
.dynamic-loader__spinner {
  position: relative;
  width: 64px;
  height: 64px;
}

.dynamic-loader__spinner-ring {
  width: 100%;
  height: 100%;
  border: 4px solid #e2e8f0;
  border-top-color: #0855c8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mensaje actual */
.dynamic-loader__message {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  min-height: 1.5rem;
}

/* Barra de progreso */
.dynamic-loader__progress-container {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.dynamic-loader__progress-bar {
  height: 100%;
  background-color: #0855c8;
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Advertencia */
.dynamic-loader__warning {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.dynamic-loader__subtext {
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0;
}
</style>

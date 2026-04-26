<script setup lang="ts">
/**
 * PortalView - El Orquestador Maestro
 * 
 * Este componente es el contenedor principal que implementa:
 * - Layout Split-Screen (50/50 desktop, 1 columna móvil)
 * - Extracción de token de URL
 * - Manejo de los 9 estados de aplicación
 * - Integración con PdfViewer, UploadForm, DynamicLoader
 * - Llamadas a n8n.service
 * - Manejo de respuestas (SUCCESS_FULL, SUCCESS_PARTIAL, ERROR_SUBMIT)
 */

import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PdfViewer from '@/components/PdfViewer.vue';
import UploadForm from '@/components/UploadForm.vue';
import DynamicLoader from '@/components/DynamicLoader.vue';
import { n8nService } from '@/services/n8n.service';
import { AppState, type WebhookResponse, SUPPORT_CONFIG, generateMailto } from '@/types';

const route = useRoute();

// ============================================================================
// ESTADO DE LA APLICACIÓN
// ============================================================================

/** Estado actual de la aplicación (9 estados definidos) */
const appState = ref<AppState>(AppState.INITIALIZING);

/** URL temporal del blob del PDF */
const pdfBlobUrl = ref<string>('');

/** Token extraído de la URL */
const token = computed(() => String(route.params.token ?? ''));

/** Referencia al componente DynamicLoader */
const dynamicLoaderRef = ref<InstanceType<typeof DynamicLoader> | null>(null);

/** Mensaje de error */
const errorMessage = ref<string>('');

/** Respuesta del webhook (para SUCCESS_PARTIAL) */
const webhookResponse = ref<WebhookResponse | null>(null);

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Extrae el token y carga el PDF de la OC
 */
onMounted(async () => {
  if (!token.value) {
    appState.value = AppState.INVALID_TOKEN;
    errorMessage.value = 'No se encontró token en la URL';
    return;
  }

  try {
    appState.value = AppState.INITIALIZING;
    
    // Llamar al webhook n8n para obtener el PDF
    const pdfBlob = await n8nService.getPurchaseOrderPdf(token.value);
    
    // Crear URL temporal del blob
    pdfBlobUrl.value = URL.createObjectURL(pdfBlob);
    
    // Transicionar a estado válido
    appState.value = AppState.VALID_TOKEN;
  } catch (error: any) {
    console.error('Error loading PDF:', error);
    
    if (error.message === 'INVALID_TOKEN') {
      appState.value = AppState.INVALID_TOKEN;
      errorMessage.value = 'El enlace ha expirado (30 días). Solicite un nuevo enlace al área de compras.';
    } else if (error.message === 'TIMEOUT') {
      appState.value = AppState.INVALID_TOKEN;
      errorMessage.value = 'La conexión tardó demasiado. Intente nuevamente.';
    } else {
      appState.value = AppState.INVALID_TOKEN;
      errorMessage.value = 'No se pudo cargar la orden de compra. Contacte a soporte.';
    }
  }
});

// ============================================================================
// MANEJO DE SUBMIT
// ============================================================================

/**
 * Maneja el evento submit del UploadForm
 */
const handleFormSubmit = async (formData: FormData) => {
  try {
    // Agregar el token al FormData
    formData.append('token', token.value);
    
    // Transicionar a estado SUBMITTING
    appState.value = AppState.SUBMITTING;
    
    // Llamar al webhook n8n
    const response = await n8nService.submitDocumentation(formData);
    
    // Completar la barra de progreso del loader
    dynamicLoaderRef.value?.completeProgress();
    
    // Esperar un momento para que el usuario vea el 100%
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Analizar la respuesta
    webhookResponse.value = response;
    
    if (response.success) {
      // Verificar si es éxito parcial
      if (response.failed_files && response.failed_files.length > 0) {
        appState.value = AppState.SUCCESS_PARTIAL;
      } else {
        appState.value = AppState.SUCCESS_FULL;
      }
    } else {
      appState.value = AppState.ERROR_SUBMIT;
      errorMessage.value = response.message || 'Error al procesar los archivos';
    }
  } catch (error: any) {
    console.error('Error submitting documentation:', error);
    
    dynamicLoaderRef.value?.completeProgress();
    
    if (error.message === 'TIMEOUT') {
      appState.value = AppState.ERROR_SUBMIT;
      errorMessage.value = 'La conexión tardó demasiado. Intente nuevamente.';
    } else if (error.message === 'NETWORK_ERROR') {
      appState.value = AppState.ERROR_SUBMIT;
      errorMessage.value = 'Error de conexión. Verifique su internet e intente nuevamente.';
    } else if (error.message === 'SERVER_ERROR') {
      appState.value = AppState.ERROR_SUBMIT;
      errorMessage.value = 'Error del servidor. Intente nuevamente más tarde.';
    } else {
      appState.value = AppState.ERROR_SUBMIT;
      errorMessage.value = 'Error al enviar los archivos. Intente nuevamente.';
    }
  }
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Genera el mailto para éxito parcial
 */
const partialSuccessMailto = computed(() => {
  if (!webhookResponse.value) return '';
  
  const failedFiles = webhookResponse.value.failed_files?.join(', ') || 'archivos';
  const body = `Estimados,\n\nAdjunto los archivos que no pudieron ser procesados automáticamente:\n${failedFiles}\n\nToken de referencia: ${token.value}`;
  
  return generateMailto(
    SUPPORT_CONFIG.email,
    SUPPORT_CONFIG.partialSuccessSubject,
    body
  );
});

/**
 * Genera el mailto para error de token
 */
const tokenErrorMailto = computed(() => {
  return generateMailto(
    SUPPORT_CONFIG.email,
    SUPPORT_CONFIG.tokenErrorSubject,
    `Token de referencia: ${token.value}`
  );
});

/**
 * Reinicia el formulario para un nuevo envío
 */
const handleNewSubmission = () => {
  appState.value = AppState.VALID_TOKEN;
  webhookResponse.value = null;
  errorMessage.value = '';
  dynamicLoaderRef.value?.reset();
};

/**
 * Cierra la ventana (o redirige)
 */
const handleClose = () => {
  window.close();
  // Si window.close() no funciona (bloqueado por navegador), redirigir
  setTimeout(() => {
    window.location.href = 'about:blank';
  }, 100);
};
</script>

<template>
  <div class="portal-view">
    <!-- Estado INITIALIZING -->
    <div
      v-if="appState === AppState.INITIALIZING"
      class="portal-view__state portal-view__state--loading"
    >
      <div class="portal-view__spinner"></div>
      <p class="portal-view__state-text">Cargando orden de compra...</p>
    </div>

    <!-- Estado INVALID_TOKEN -->
    <div
      v-else-if="appState === AppState.INVALID_TOKEN"
      class="portal-view__state portal-view__state--error"
    >
      <div class="portal-view__error-icon">⚠️</div>
      <h2 class="portal-view__error-title">Acceso No Disponible</h2>
      <p class="portal-view__error-message">
        {{ errorMessage }}
      </p>
      <a
        :href="tokenErrorMailto"
        class="portal-view__error-cta"
      >
        Contactar Soporte
      </a>
    </div>

    <!-- Estado VALID_TOKEN / FORM_READY - Layout Split-Screen -->
    <div
      v-else-if="appState === AppState.VALID_TOKEN || appState === AppState.FORM_READY"
      class="portal-view__split-screen"
    >
      <!-- Panel Izquierdo: Visor PDF -->
      <div class="portal-view__panel portal-view__panel--left">
        <div class="portal-view__panel-header">
          <h3 class="portal-view__panel-title">Orden de Compra</h3>
          <p class="portal-view__panel-subtitle">
            Verifique monto, moneda y plazo antes de cargar archivos
          </p>
        </div>
        <PdfViewer :pdf-blob-url="pdfBlobUrl" />
      </div>

      <!-- Panel Derecho: Formulario -->
      <div class="portal-view__panel portal-view__panel--right">
        <UploadForm @submit="handleFormSubmit" />
      </div>
    </div>

    <!-- Estado SUBMITTING - Overlay con DynamicLoader -->
    <div
      v-else-if="appState === AppState.SUBMITTING"
      class="portal-view__overlay"
    >
      <DynamicLoader ref="dynamicLoaderRef" />
    </div>

    <!-- Estado SUCCESS_FULL -->
    <div
      v-else-if="appState === AppState.SUCCESS_FULL"
      class="portal-view__state portal-view__state--success"
    >
      <div class="portal-view__success-icon">✅</div>
      <h2 class="portal-view__success-title">Envío Completado con Éxito</h2>
      <p class="portal-view__success-message">
        Todos los archivos fueron recibidos y validados correctamente.
      </p>
      <p class="portal-view__success-submessage">
        Su pago será procesado en las próximas 24-48 horas.
      </p>
      <div class="portal-view__success-actions">
        <button
          @click="handleNewSubmission"
          class="portal-view__success-btn portal-view__success-btn--secondary"
        >
          Nuevo Envío
        </button>
        <button
          @click="handleClose"
          class="portal-view__success-btn portal-view__success-btn--primary"
        >
          Cerrar
        </button>
      </div>
    </div>

    <!-- Estado SUCCESS_PARTIAL -->
    <div
      v-else-if="appState === AppState.SUCCESS_PARTIAL"
      class="portal-view__state portal-view__state--warning"
    >
      <div class="portal-view__warning-icon">⚠️</div>
      <h2 class="portal-view__warning-title">Envío Recibido con Advertencia</h2>
      <p class="portal-view__warning-message">
        Su pago procederá correctamente.
      </p>
      <p class="portal-view__warning-submessage">
        Los archivos principales (PDF y XML) fueron recibidos y validados.
      </p>
      
      <div
        v-if="webhookResponse?.failed_files && webhookResponse.failed_files.length > 0"
        class="portal-view__failed-files"
      >
        <p class="portal-view__failed-files-title">
          Los siguientes archivos no pudieron ser procesados:
        </p>
        <ul class="portal-view__failed-files-list">
          <li
            v-for="(file, index) in webhookResponse.failed_files"
            :key="index"
          >
            {{ file }}
          </li>
        </ul>
      </div>

      <p class="portal-view__warning-instruction">
        Por favor, envíe estos archivos a:
      </p>
      <a
        :href="partialSuccessMailto"
        class="portal-view__warning-cta"
      >
        {{ SUPPORT_CONFIG.email }}
      </a>

      <div class="portal-view__warning-actions">
        <button
          @click="handleNewSubmission"
          class="portal-view__warning-btn portal-view__warning-btn--secondary"
        >
          Nuevo Envío
        </button>
        <button
          @click="handleClose"
          class="portal-view__warning-btn portal-view__warning-btn--primary"
        >
          Cerrar
        </button>
      </div>
    </div>

    <!-- Estado ERROR_SUBMIT -->
    <div
      v-else-if="appState === AppState.ERROR_SUBMIT"
      class="portal-view__state portal-view__state--error"
    >
      <div class="portal-view__error-icon">❌</div>
      <h2 class="portal-view__error-title">Error al Enviar</h2>
      <p class="portal-view__error-message">
        {{ errorMessage }}
      </p>
      <div class="portal-view__error-actions">
        <button
          @click="appState = AppState.VALID_TOKEN"
          class="portal-view__error-btn portal-view__error-btn--secondary"
        >
          Intentar Nuevamente
        </button>
        <button
          @click="handleClose"
          class="portal-view__error-btn portal-view__error-btn--primary"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portal-view {
  width: 100%;
  min-height: 100vh;
  background-color: #f1f5f9;
}

/* Estados generales */
.portal-view__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

.portal-view__state-text {
  color: #64748b;
  font-size: 1rem;
  margin-top: 1rem;
}

/* Loading */
.portal-view__state--loading .portal-view__spinner {
  width: 48px;
  height: 48px;
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

/* Error */
.portal-view__state--error {
  background-color: #fef2f2;
}

.portal-view__error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.portal-view__error-title {
  color: #991b1b;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.portal-view__error-message {
  color: #7f1d1d;
  font-size: 1rem;
  max-width: 500px;
  margin: 0 0 2rem 0;
}

.portal-view__error-cta {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #dc2626;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.portal-view__error-cta:hover {
  background-color: #b91c1c;
}

.portal-view__error-actions {
  display: flex;
  gap: 1rem;
}

.portal-view__error-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.portal-view__error-btn--primary {
  background-color: #0855c8;
  color: white;
}

.portal-view__error-btn--primary:hover {
  background-color: #0644a0;
}

.portal-view__error-btn--secondary {
  background-color: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.portal-view__error-btn--secondary:hover {
  background-color: #f8fafc;
}

/* Success */
.portal-view__state--success {
  background-color: #f0fdf4;
}

.portal-view__success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.portal-view__success-title {
  color: #166534;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.portal-view__success-message {
  color: #14532d;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.portal-view__success-submessage {
  color: #166534;
  font-size: 0.875rem;
  margin: 0 0 2rem 0;
}

.portal-view__success-actions {
  display: flex;
  gap: 1rem;
}

.portal-view__success-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.portal-view__success-btn--primary {
  background-color: #0855c8;
  color: white;
}

.portal-view__success-btn--primary:hover {
  background-color: #0644a0;
}

.portal-view__success-btn--secondary {
  background-color: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.portal-view__success-btn--secondary:hover {
  background-color: #f8fafc;
}

/* Warning (Success Partial) */
.portal-view__state--warning {
  background-color: #fffbeb;
}

.portal-view__warning-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.portal-view__warning-title {
  color: #92400e;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.portal-view__warning-message {
  color: #78350f;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.portal-view__warning-submessage {
  color: #92400e;
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
}

.portal-view__failed-files {
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.portal-view__failed-files-title {
  color: #92400e;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.portal-view__failed-files-list {
  color: #78350f;
  font-size: 0.875rem;
  margin: 0;
  padding-left: 1.5rem;
}

.portal-view__warning-instruction {
  color: #78350f;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.portal-view__warning-cta {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #f59e0b;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
  margin-bottom: 2rem;
}

.portal-view__warning-cta:hover {
  background-color: #d97706;
}

.portal-view__warning-actions {
  display: flex;
  gap: 1rem;
}

.portal-view__warning-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.portal-view__warning-btn--primary {
  background-color: #0855c8;
  color: white;
}

.portal-view__warning-btn--primary:hover {
  background-color: #0644a0;
}

.portal-view__warning-btn--secondary {
  background-color: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.portal-view__warning-btn--secondary:hover {
  background-color: #f8fafc;
}

/* Split-Screen Layout */
.portal-view__split-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .portal-view__split-screen {
    flex-direction: row;
  }
}

.portal-view__panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.portal-view__panel--left {
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

@media (max-width: 1023px) {
  .portal-view__panel--left {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    min-height: 50vh;
  }
}

.portal-view__panel--right {
  background-color: white;
  overflow-y: auto;
}

.portal-view__panel-header {
  margin-bottom: 1rem;
}

.portal-view__panel-title {
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.portal-view__panel-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Overlay para SUBMITTING */
.portal-view__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>

<script setup lang="ts">
/**
 * Componente PdfViewer
 * Visor nativo de PDF sin librerías externas
 * 
 * Este componente renderiza un PDF usando el elemento nativo <object>
 * con fallback para navegadores que no soportan visualización inline.
 * 
 * @props pdfBlobUrl - URL temporal del blob del PDF (creada con URL.createObjectURL)
 */

import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  /** URL temporal del blob del PDF */
  pdfBlobUrl: string;
}

const props = defineProps<Props>();

const isLoading = ref(true);
const loadError = ref(false);
const objectRef = ref<HTMLObjectElement | null>(null);

/**
 * Maneja el evento de carga exitosa del PDF
 */
const onLoad = () => {
  isLoading.value = false;
  loadError.value = false;
};

/**
 * Maneja el evento de error al cargar el PDF
 */
const onError = () => {
  isLoading.value = false;
  loadError.value = true;
};

/**
 * Limpia la URL del blob al desmontar el componente
 * para evitar memory leaks
 */
onUnmounted(() => {
  if (props.pdfBlobUrl) {
    URL.revokeObjectURL(props.pdfBlobUrl);
  }
});
</script>

<template>
  <div class="pdf-viewer">
    <!-- Estado de carga inicial -->
    <div
      v-if="isLoading"
      class="pdf-viewer__loading"
    >
      <div class="pdf-viewer__spinner"></div>
      <p class="pdf-viewer__loading-text">Cargando documento...</p>
    </div>

    <!-- Estado de error -->
    <div
      v-else-if="loadError"
      class="pdf-viewer__error"
    >
      <div class="pdf-viewer__error-icon">⚠️</div>
      <p class="pdf-viewer__error-text">
        No se pudo cargar el PDF en su navegador.
      </p>
      <a
        :href="pdfBlobUrl"
        download="orden-compra.pdf"
        class="pdf-viewer__download-link"
      >
        Descargar archivo
      </a>
    </div>

    <!-- Visor de PDF nativo -->
    <object
      v-else
      ref="objectRef"
      :data="pdfBlobUrl"
      type="application/pdf"
      class="pdf-viewer__object"
      @load="onLoad"
      @error="onError"
    >
      <!-- Fallback para navegadores sin soporte inline -->
      <div class="pdf-viewer__fallback">
        <p class="pdf-viewer__fallback-text">
          Su navegador no soporta visualización de PDF inline.
        </p>
        <a
          :href="pdfBlobUrl"
          download="orden-compra.pdf"
          class="pdf-viewer__download-link"
        >
          Descargar archivo PDF
        </a>
      </div>
    </object>
  </div>
</template>

<style scoped>
.pdf-viewer {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

/* Estado de carga */
.pdf-viewer__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  gap: 1rem;
}

.pdf-viewer__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #0855c8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pdf-viewer__loading-text {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Estado de error */
.pdf-viewer__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.pdf-viewer__error-icon {
  font-size: 3rem;
}

.pdf-viewer__error-text {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Visor de PDF */
.pdf-viewer__object {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: none;
}

/* Fallback */
.pdf-viewer__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.pdf-viewer__fallback-text {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Enlace de descarga */
.pdf-viewer__download-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #0855c8;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.pdf-viewer__download-link:hover {
  background-color: #0644a0;
}

.pdf-viewer__download-link:active {
  background-color: #04337a;
}
</style>

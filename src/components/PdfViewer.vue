<script setup lang="ts">
/**
 * PdfViewer — Visor nativo de PDF con skeleton premium
 *
 * Fix: usa <iframe> en lugar de <object> (más compatible con Chrome/Edge).
 * Fix: watch en pdfBlobUrl para resetear estado de carga cuando llega la URL.
 * Fix: URL.revokeObjectURL() en onUnmounted para evitar memory leaks.
 */

import { ref, watch, onUnmounted } from 'vue';

interface Props {
  /** URL temporal del blob del PDF (creada con URL.createObjectURL) */
  pdfBlobUrl: string;
}

const props = defineProps<Props>();

const isLoading = ref(true);
const loadError = ref(false);
const iframeRef = ref<HTMLIFrameElement | null>(null);

/**
 * Cuando la URL del blob cambia (llega del padre), reseteamos el estado.
 * El iframe se monta con la nueva URL y dispara @load cuando termina.
 */
watch(
  () => props.pdfBlobUrl,
  (newUrl) => {
    if (newUrl) {
      isLoading.value = true;
      loadError.value = false;
    } else {
      isLoading.value = true;
      loadError.value = false;
    }
  },
  { immediate: true }
);

const onIframeLoad = () => {
  if (props.pdfBlobUrl) {
    isLoading.value = false;
    loadError.value = false;
  }
};

const onIframeError = () => {
  isLoading.value = false;
  loadError.value = true;
};

onUnmounted(() => {
  if (props.pdfBlobUrl) {
    URL.revokeObjectURL(props.pdfBlobUrl);
  }
});
</script>

<template>
  <div class="pdf-viewer">
    <!-- Skeleton / Spinner de carga premium -->
    <div v-if="isLoading" class="pdf-viewer__skeleton">
      <div class="pdf-viewer__skeleton-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="url(#pdfGrad1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="14 2 14 8 20 8" stroke="url(#pdfGrad1)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="url(#pdfGrad1)" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="url(#pdfGrad1)" stroke-width="1.5" stroke-linecap="round"/>
          <polyline points="10 9 9 9 8 9" stroke="url(#pdfGrad1)" stroke-width="1.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="pdfGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0855c8"/>
              <stop offset="100%" stop-color="#04aeea"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="pdf-viewer__skeleton-spinner">
        <div class="pdf-viewer__spinner-ring pdf-viewer__spinner-ring--outer"></div>
        <div class="pdf-viewer__spinner-ring pdf-viewer__spinner-ring--inner"></div>
      </div>
      <p class="pdf-viewer__skeleton-text">Cargando Orden de Compra...</p>
      <div class="pdf-viewer__skeleton-lines">
        <div class="pdf-viewer__skeleton-line pdf-viewer__skeleton-line--full"></div>
        <div class="pdf-viewer__skeleton-line pdf-viewer__skeleton-line--wide"></div>
        <div class="pdf-viewer__skeleton-line pdf-viewer__skeleton-line--medium"></div>
        <div class="pdf-viewer__skeleton-line pdf-viewer__skeleton-line--full"></div>
        <div class="pdf-viewer__skeleton-line pdf-viewer__skeleton-line--short"></div>
      </div>
    </div>

    <!-- Estado de error -->
    <div v-else-if="loadError" class="pdf-viewer__error">
      <div class="pdf-viewer__error-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="pdf-viewer__error-title">No se pudo mostrar el PDF</p>
      <p class="pdf-viewer__error-text">Su navegador no soporta visualización inline.</p>
      <a
        :href="pdfBlobUrl"
        download="orden-compra.pdf"
        class="pdf-viewer__download-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Descargar PDF
      </a>
    </div>

    <!-- Iframe del PDF — siempre en DOM cuando hay URL para disparar @load -->
    <iframe
      v-if="pdfBlobUrl"
      ref="iframeRef"
      :src="pdfBlobUrl + '#zoom=page-width&toolbar=1'"
      type="application/pdf"
      class="pdf-viewer__iframe"
      :class="{ 'pdf-viewer__iframe--hidden': isLoading || loadError }"
      title="Orden de Compra"
      @load="onIframeLoad"
      @error="onIframeError"
    ></iframe>

    <!-- Placeholder cuando aún no hay URL -->
    <div v-if="!pdfBlobUrl && isLoading" class="pdf-viewer__placeholder">
      <div class="pdf-viewer__placeholder-bg"></div>
    </div>
  </div>
</template>

<style scoped>
.pdf-viewer {
  width: 100%;
  height: 100%;
  background: #f8fafd;
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
}

/* ===== SKELETON ===== */
.pdf-viewer__skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background: linear-gradient(135deg, #f8fafd 0%, #eef4ff 100%);
}

.pdf-viewer__skeleton-icon {
  opacity: 0.7;
}

.pdf-viewer__skeleton-spinner {
  position: relative;
  width: 56px;
  height: 56px;
  margin-top: var(--space-2);
}

.pdf-viewer__spinner-ring {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
  border-color: transparent;
}

.pdf-viewer__spinner-ring--outer {
  inset: 0;
  border-width: 3px;
  border-top-color: #0855c8;
  animation: spin-cw 1s linear infinite;
}

.pdf-viewer__spinner-ring--inner {
  inset: 8px;
  border-width: 2px;
  border-bottom-color: #04aeea;
  animation: spin-ccw 0.75s linear infinite;
}

@keyframes spin-cw {
  to { transform: rotate(360deg); }
}
@keyframes spin-ccw {
  to { transform: rotate(-360deg); }
}

.pdf-viewer__skeleton-text {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: #0855c8;
  margin: 0;
  letter-spacing: 0.01em;
}

.pdf-viewer__skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  max-width: 280px;
  margin-top: var(--space-2);
}

.pdf-viewer__skeleton-line {
  height: 10px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, #e1eaf8 25%, #c8d9f5 50%, #e1eaf8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

.pdf-viewer__skeleton-line--full { width: 100%; }
.pdf-viewer__skeleton-line--wide { width: 85%; }
.pdf-viewer__skeleton-line--medium { width: 65%; }
.pdf-viewer__skeleton-line--short { width: 45%; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ===== ERROR ===== */
.pdf-viewer__error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8);
  text-align: center;
}

.pdf-viewer__error-icon {
  color: #0855c8;
  opacity: 0.6;
}

.pdf-viewer__error-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.pdf-viewer__error-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.pdf-viewer__download-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #0855c8, #04aeea);
  color: #ffffff;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.pdf-viewer__download-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ===== IFRAME ===== */
.pdf-viewer__iframe {
  width: 100%;
  flex: 1;
  border: none;
  display: block;
  min-height: 0;
  transition: opacity 0.3s ease;
}

.pdf-viewer__iframe--hidden {
  display: none;
}

/* ===== PLACEHOLDER ===== */
.pdf-viewer__placeholder {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(135deg, #f0f6ff 0%, #e8f2ff 100%);
}
</style>

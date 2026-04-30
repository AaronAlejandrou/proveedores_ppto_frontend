<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

// Decode JWT payload (no verification — backend already verifies)
const parseJwt = (t: string) => {
  try { return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); } catch { return null; }
};
import PdfViewer from '@/components/PdfViewer.vue';
import UploadForm from '@/components/UploadForm.vue';
import DynamicLoader from '@/components/DynamicLoader.vue';
import { n8nService } from '@/services/n8n.service';
import { AppState, type WebhookResponse, SUPPORT_CONFIG, generateMailto } from '@/types';

const route = useRoute();
const token = computed(() => String(route.params.token ?? ''));
const appState = ref<AppState>(AppState.INITIALIZING);
const pdfBlobUrl = ref('');
const errorMessage = ref('');
const jwtPayload = computed(() => parseJwt(token.value));
const ocNumber = computed(() => jwtPayload.value?.oc ?? '');
const rucNumber = computed(() => jwtPayload.value?.ruc ?? '');
const webhookResponse = ref<WebhookResponse | null>(null);
const dynamicLoaderRef = ref<InstanceType<typeof DynamicLoader> | null>(null);

onMounted(async () => {
  if (!token.value) { appState.value = AppState.INVALID_TOKEN; errorMessage.value = 'No se encontró token en la URL'; return; }
  try {
    const blob = await n8nService.getPurchaseOrderPdf(token.value);
    pdfBlobUrl.value = URL.createObjectURL(blob);
    appState.value = AppState.VALID_TOKEN;
  } catch (e: any) {
    appState.value = AppState.INVALID_TOKEN;
    errorMessage.value = e.message === 'INVALID_TOKEN'
      ? 'El enlace ha expirado o es inválido. Contacte al área de compras.'
      : e.message === 'TIMEOUT' ? 'La conexión tardó demasiado. Intente nuevamente.'
      : 'No se pudo cargar la orden de compra.';
  }
});

onUnmounted(() => { if (pdfBlobUrl.value) URL.revokeObjectURL(pdfBlobUrl.value); });

const handleStartUpload = () => { appState.value = AppState.FORM_READY; };

const handleFormSubmit = async (formData: FormData) => {
  formData.append('token', token.value);
  appState.value = AppState.SUBMITTING;
  try {
    const resp = await n8nService.submitDocumentation(formData);
    dynamicLoaderRef.value?.completeProgress();
    await new Promise(r => setTimeout(r, 500));
    webhookResponse.value = resp;
    appState.value = resp.success
      ? (resp.failed_files?.length ? AppState.SUCCESS_PARTIAL : AppState.SUCCESS_FULL)
      : AppState.ERROR_SUBMIT;
    if (!resp.success) errorMessage.value = resp.message || 'Error al procesar';
  } catch (e: any) {
    dynamicLoaderRef.value?.completeProgress();
    appState.value = AppState.ERROR_SUBMIT;
    errorMessage.value = e.message === 'TIMEOUT' ? 'Tiempo de espera agotado.' : e.message === 'NETWORK_ERROR' ? 'Error de conexión.' : 'Error al enviar. Intente de nuevo.';
  }
};

const handleRetry = () => { appState.value = AppState.FORM_READY; webhookResponse.value = null; errorMessage.value = ''; dynamicLoaderRef.value?.reset(); };
const handleBackToPreview = () => { appState.value = AppState.VALID_TOKEN; };

const tokenErrorMailto = computed(() => generateMailto(SUPPORT_CONFIG.email, SUPPORT_CONFIG.tokenErrorSubject, `Token: ${token.value}`));
const partialMailto = computed(() => {
  const files = webhookResponse.value?.failed_files?.join(', ') || 'archivos';
  return generateMailto(SUPPORT_CONFIG.email, SUPPORT_CONFIG.partialSuccessSubject, `Archivos pendientes: ${files}\nToken: ${token.value}`);
});
</script>

<template>
  <div class="pv">
    <!-- INITIALIZING -->
    <div v-if="appState === AppState.INITIALIZING" class="pv-state pv-state--loading">
      <div class="pv-spinner">
        <div class="pv-spinner__ring pv-spinner__ring--outer"></div>
        <div class="pv-spinner__ring pv-spinner__ring--inner"></div>
      </div>
      <p class="pv-state__title">Verificando acceso seguro...</p>
      <p class="pv-state__sub">Validando credenciales con Interseguro</p>
    </div>

    <!-- INVALID_TOKEN -->
    <div v-else-if="appState === AppState.INVALID_TOKEN" class="pv-state pv-state--error">
      <div class="pv-icon pv-icon--error">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
      <h2 class="pv-state__title">Acceso no disponible</h2>
      <p class="pv-state__sub">{{ errorMessage }}</p>
      <a :href="tokenErrorMailto" class="pv-btn pv-btn--primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Contactar soporte
      </a>
      <p class="pv-state__hint">pagosproveedores@interseguro.com.pe</p>
    </div>

    <!-- VALID_TOKEN: Landing / Preview de OC -->
    <div v-else-if="appState === AppState.VALID_TOKEN" class="pv-landing">
      <!-- Header informativo con datos de la OC -->
      <div class="pv-oc-header">
        <div class="pv-oc-header__inner">
          <div class="pv-oc-header__verified">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Acceso verificado
          </div>
          <div class="pv-oc-header__fields">
            <div class="pv-oc-field">
              <span class="pv-oc-field__label">Orden de Compra</span>
              <span class="pv-oc-field__value">{{ ocNumber || '—' }}</span>
            </div>
            <div class="pv-oc-header__sep"></div>
            <div class="pv-oc-field">
              <span class="pv-oc-field__label">RUC Proveedor</span>
              <span class="pv-oc-field__value">{{ rucNumber || '—' }}</span>
            </div>
          </div>
          <p class="pv-oc-header__hint">Confirme que los datos corresponden a su empresa antes de continuar</p>
        </div>
      </div>

      <!-- PDF en contenedor centrado con márgenes -->
      <div class="pv-landing__pdf">
        <div class="pv-landing__pdf-frame">
          <PdfViewer :pdf-blob-url="pdfBlobUrl" />
        </div>
      </div>

      <!-- CTA bar inferior -->
      <div class="pv-landing__cta-bar">
        <div class="pv-landing__cta-content">
          <div class="pv-landing__cta-info">
            <h2 class="pv-landing__cta-title">¿Listo para facturar?</h2>
            <p class="pv-landing__cta-desc">Adjunte su factura PDF, XML y CDR (si aplica) para iniciar el proceso de pago.</p>
          </div>
          <button class="pv-btn pv-btn--hero" @click="handleStartUpload">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Cargar Documentación
          </button>
        </div>
      </div>
    </div>

    <!-- FORM_READY: Split-Screen -->
    <div v-else-if="appState === AppState.FORM_READY" class="pv-split">
      <div class="pv-split__left">
        <div class="pv-panel-header">
          <button class="pv-back-btn" @click="handleBackToPreview" title="Volver">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="pv-panel-label">Orden de Compra</span>
        </div>
        <div class="pv-split__pdf">
          <PdfViewer :pdf-blob-url="pdfBlobUrl" />
        </div>
      </div>
      <div class="pv-split__right">
        <UploadForm @submit="handleFormSubmit" />
      </div>
    </div>

    <!-- SUBMITTING -->
    <div v-else-if="appState === AppState.SUBMITTING" class="pv-overlay">
      <DynamicLoader ref="dynamicLoaderRef" />
    </div>

    <!-- SUCCESS_FULL -->
    <div v-else-if="appState === AppState.SUCCESS_FULL" class="pv-state pv-state--success">
      <div class="pv-icon pv-icon--success">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h2 class="pv-state__title">Documentación recibida</h2>
      <p class="pv-state__sub">Todos los archivos fueron validados y almacenados correctamente.<br>Revise su correo electrónico para obtener más información.</p>
      <button class="pv-btn pv-btn--outline" @click="handleRetry">Nuevo envío</button>
    </div>

    <!-- SUCCESS_PARTIAL -->
    <div v-else-if="appState === AppState.SUCCESS_PARTIAL" class="pv-state pv-state--warning">
      <div class="pv-icon pv-icon--warning">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h2 class="pv-state__title">Recibido con advertencia</h2>
      <p class="pv-state__sub">La factura principal fue recibida. Su pago procederá con normalidad.</p>
      <div v-if="webhookResponse?.failed_files?.length" class="pv-failed-files">
        <p class="pv-failed-files__label">Archivos que requieren reenvío manual:</p>
        <ul class="pv-failed-files__list">
          <li v-for="f in webhookResponse.failed_files" :key="f">{{ f }}</li>
        </ul>
      </div>
      <a :href="partialMailto" class="pv-btn pv-btn--primary">Enviar archivos pendientes</a>
      <button class="pv-btn pv-btn--outline" @click="handleRetry">Reintentar</button>
    </div>

    <!-- ERROR_SUBMIT -->
    <div v-else-if="appState === AppState.ERROR_SUBMIT" class="pv-state pv-state--error">
      <div class="pv-icon pv-icon--error">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h2 class="pv-state__title">Error al enviar</h2>
      <p class="pv-state__sub">{{ errorMessage }}</p>
      <button class="pv-btn pv-btn--primary" @click="handleRetry">Intentar nuevamente</button>
    </div>
  </div>
</template>

<style scoped>
/* Root: height fija para que el flex chain funcione correctamente */
.pv { height: calc(100vh - 4rem); display: flex; flex-direction: column; background: #f0f4fb; overflow: hidden; }

/* ===== OC HEADER ===== */
.pv-oc-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.875rem 1.5rem;
  flex-shrink: 0;
}
.pv-oc-header__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.pv-oc-header__verified {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #10b981;
  background: rgba(16,185,129,0.1);
  padding: 0.25rem 0.625rem;
  border-radius: 99px;
  flex-shrink: 0;
}
.pv-oc-header__fields {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex: 1;
}
.pv-oc-header__sep {
  width: 1px;
  height: 28px;
  background: #e5e7eb;
  flex-shrink: 0;
}
.pv-oc-field {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.pv-oc-field__label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
}
.pv-oc-field__value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}
.pv-oc-header__hint {
  font-size: 0.72rem;
  color: #9ca3af;
  margin: 0;
  margin-left: auto;
}

/* ===== STATES ===== */
.pv-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem 1.5rem; text-align: center; gap: 1rem;
}
.pv-state--loading { background: linear-gradient(160deg, #eef4ff 0%, #f8fafd 100%); }
.pv-state--error { background: linear-gradient(160deg, #fff0f0 0%, #fff8f8 100%); }
.pv-state--success { background: linear-gradient(160deg, #f0fff8 0%, #f8fffc 100%); }
.pv-state--warning { background: linear-gradient(160deg, #fffbf0 0%, #fffdf8 100%); }

.pv-state__title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
.pv-state__sub { font-size: 0.9rem; color: #6b7280; margin: 0; max-width: 420px; line-height: 1.6; }
.pv-state__hint { font-size: 0.8rem; color: #9ca3af; margin: 0; }

/* ===== ICONS ===== */
.pv-icon {
  width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;
}
.pv-icon--error { background: rgba(239,68,68,0.1); color: #ef4444; }
.pv-icon--success { background: rgba(16,185,129,0.1); color: #10b981; }
.pv-icon--warning { background: rgba(245,158,11,0.1); color: #f59e0b; }

/* ===== SPINNER ===== */
.pv-spinner { position: relative; width: 60px; height: 60px; margin-bottom: 1rem; }
.pv-spinner__ring { position: absolute; border-radius: 50%; border-style: solid; border-color: transparent; }
.pv-spinner__ring--outer { inset: 0; border-width: 3px; border-top-color: #0855c8; animation: spin 1s linear infinite; }
.pv-spinner__ring--inner { inset: 10px; border-width: 2px; border-bottom-color: #04aeea; animation: spin 0.7s linear infinite reverse; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== BUTTONS ===== */
.pv-btn {
  display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
  font-size: 0.9rem; font-weight: 600; border-radius: 10px; border: none; cursor: pointer;
  text-decoration: none; transition: all 0.18s ease;
}
.pv-btn--primary { background: #0855c8; color: #fff; box-shadow: 0 2px 8px rgba(8,85,200,0.25); }
.pv-btn--primary:hover { background: #0647a6; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(8,85,200,0.3); }
.pv-btn--outline { background: transparent; color: #0855c8; border: 1.5px solid rgba(8,85,200,0.3); }
.pv-btn--outline:hover { background: rgba(8,85,200,0.05); border-color: #0855c8; }
.pv-btn--hero {
  background: #0855c8; color: #fff;
  padding: 0.875rem 1.75rem; font-size: 0.95rem; border-radius: 10px;
  box-shadow: 0 2px 10px rgba(8,85,200,0.28); white-space: nowrap;
}
.pv-btn--hero:hover { background: #0647a6; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(8,85,200,0.35); }

/* ===== LANDING ===== */
.pv-landing { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
.pv-landing__pdf {
  flex: 1; min-height: 0; overflow: hidden;
  background: #dce4f0;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
}
.pv-landing__pdf-frame {
  flex: 1; min-height: 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
}
.pv-landing__cta-bar {
  background: #fff; border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.05); padding: 1rem 1.5rem; flex-shrink: 0;
}
.pv-landing__cta-content { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
.pv-landing__cta-title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem 0; }
.pv-landing__cta-desc { font-size: 0.82rem; color: #6b7280; margin: 0; max-width: 480px; line-height: 1.5; }

/* ===== SPLIT SCREEN ===== */
.pv-split {
  flex: 1; display: grid; grid-template-columns: 1fr 1fr;
  overflow: hidden; min-height: 0;
  padding: 1.25rem 5rem; gap: 1.25rem;
  background: #f0f4fb;
}
@media (max-width: 900px) { .pv-split { grid-template-columns: 1fr; overflow-y: auto; } }

.pv-split__left {
  display: flex; flex-direction: column;
  border: 1px solid #e5e7eb; border-radius: 12px;
  background: #fff; overflow: hidden; min-height: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.pv-panel-header {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #e5e7eb; background: #fff; flex-shrink: 0;
}
.pv-back-btn {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border: 1px solid #d1d5db; background: transparent; border-radius: 7px;
  color: #6b7280; cursor: pointer; transition: all 0.18s;
}
.pv-back-btn:hover { border-color: #0855c8; color: #0855c8; background: rgba(8,85,200,0.04); }
.pv-panel-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
.pv-split__pdf { flex: 1; overflow: hidden; position: relative; min-height: 0; }

.pv-split__right {
  overflow-y: auto; background: #fff;
  border: 1px solid #e5e7eb; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ===== OVERLAY ===== */
.pv-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(255,255,255,0.97); display: flex; align-items: center; justify-content: center; }

/* ===== FAILED FILES ===== */
.pv-failed-files { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 10px; padding: 1rem 1.25rem; text-align: left; width: 100%; max-width: 380px; }
.pv-failed-files__label { font-size: 0.8rem; font-weight: 600; color: #92400e; margin: 0 0 0.5rem 0; }
.pv-failed-files__list { margin: 0; padding-left: 1.25rem; font-size: 0.8rem; color: #78350f; }
.pv-failed-files__list li { margin-bottom: 0.2rem; }

@media (max-width: 768px) {
  .pv-oc-header__hint { display: none; }
  .pv-oc-header__fields { gap: 0.875rem; }
}
@media (max-width: 640px) {
  .pv-landing__cta-content { flex-direction: column; align-items: stretch; }
  .pv-btn--hero { width: 100%; justify-content: center; }
  .pv-oc-header { padding: 0.75rem 1rem; }
}
</style>

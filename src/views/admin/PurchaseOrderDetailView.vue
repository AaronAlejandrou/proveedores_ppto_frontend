<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { purchaseOrderService } from '@/services/purchaseOrder.service';
import { providerService } from '@/services/provider.service';
import type { PurchaseOrder, MagicLinkResponse } from '@/types/purchase-order.types';
import type { Provider } from '@/types/provider.types';
import type { InvoiceSubmission } from '@/types/submission.types';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppStatusBadge from '@/components/common/AppStatusBadge.vue';
import AppLoadingState from '@/components/common/AppLoadingState.vue';

const router = useRouter();
const orderId = computed(() => Number(router.currentRoute.value.params.id));

const purchaseOrder = ref<PurchaseOrder | null>(null);
const provider = ref<Provider | null>(null);
const submissions = ref<InvoiceSubmission[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Magic link state
const magicLink = ref<MagicLinkResponse | null>(null);
const generatingLink = ref(false);
const copyingLink = ref(false);

const loadOrderData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const [orderData] = await Promise.all([
      purchaseOrderService.getById(orderId.value)
    ]);
    
    purchaseOrder.value = orderData;
    
    // Load provider data
    if (orderData.provider_id) {
      provider.value = await providerService.getById(orderData.provider_id);
    }
    
    // Load submissions
    submissions.value = await purchaseOrderService.getSubmissions(orderId.value);
  } catch (err) {
    console.error('Error loading order data:', err);
    error.value = 'No se pudo cargar la orden de compra';
  } finally {
    loading.value = false;
  }
};

const generateMagicLink = async () => {
  try {
    generatingLink.value = true;
    magicLink.value = await purchaseOrderService.generateMagicLink(orderId.value);
  } catch (err) {
    console.error('Error generating magic link:', err);
    error.value = 'No se pudo generar el enlace de acceso';
  } finally {
    generatingLink.value = false;
  }
};

const revokeMagicLink = async () => {
  try {
    await purchaseOrderService.revokeMagicLink(orderId.value);
    magicLink.value = null;
  } catch (err) {
    console.error('Error revoking magic link:', err);
    error.value = 'No se pudo revocar el enlace de acceso';
  }
};

const copyMagicLink = async () => {
  if (!magicLink.value?.access_url) return;
  
  try {
    copyingLink.value = true;
    await navigator.clipboard.writeText(magicLink.value.access_url);
    // Success message could be shown here with a toast
  } catch (err) {
    console.error('Error copying link:', err);
    error.value = 'No se pudo copiar el enlace';
  } finally {
    copyingLink.value = false;
  }
};

const openMagicLink = () => {
  if (magicLink.value?.access_url) {
    window.open(magicLink.value.access_url, '_blank');
  }
};

const goToEdit = () => {
  router.push(`/admin/purchase-orders/${orderId.value}/edit`);
};

const goBack = () => {
  router.push('/admin/purchase-orders');
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'PEN'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getCdrStatusDescription = (cdrStatus: string) => {
  switch (cdrStatus) {
    case 'REQUIRED_PENDING':
      return 'CDR requerido y pendiente de envío';
    case 'NOT_REQUIRED':
      return 'CDR no requerido según reglas';
    case 'UPLOADED':
      return 'CDR cargado correctamente';
    case 'VALIDATED':
      return 'CDR validado y aprobado';
    case 'OBSERVED':
      return 'CDR con observaciones';
    default:
      return 'Estado desconocido';
  }
};

onMounted(() => {
  loadOrderData();
});
</script>

<template>
  <div class="detail-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Orden de Compra</h1>
          <p class="page-subtitle">{{ purchaseOrder ? `Número ${purchaseOrder.po_number}` : 'Cargando detalle...' }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="goBack">
            <AppIcon name="back" :size="16" />
            <span>Volver al Listado</span>
          </button>
          <button v-if="purchaseOrder" class="btn btn-primary" @click="goToEdit">
            <AppIcon name="edit" :size="16" />
            <span>Editar Datos y Estado</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loading-state">
        <div class="loading-spinner">
          <AppIcon name="spinner" :size="32" :spin="true" />
        </div>
        <p class="loading-text">Cargando detalle de la OC...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-container">
      <div class="error-state">
        <div class="error-icon">
          <AppIcon name="error" :size="24" />
        </div>
        <div class="error-content">
          <h3 class="error-title">Error al cargar orden</h3>
          <p class="error-description">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Detail Cards -->
    <div v-else-if="purchaseOrder" class="detail-grid">
      <!-- Order Data Card -->
      <div class="detail-card">
        <div class="card-header">
          <div class="card-icon-wrapper">
            <div class="card-icon">
              <AppIcon name="purchase-orders" :size="18" />
            </div>
          </div>
          <h2 class="card-title">Datos de la Orden</h2>
        </div>
        <div class="card-content">
          <div class="detail-row">
            <span class="detail-label">Número</span>
            <code class="detail-value detail-value--mono">{{ purchaseOrder.po_number }}</code>
          </div>
          <div class="detail-row">
            <span class="detail-label">Monto Esperado</span>
            <span class="detail-value detail-value--amount">{{ formatCurrency(purchaseOrder.expected_amount, purchaseOrder.expected_currency) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Moneda</span>
            <span class="currency-badge">{{ purchaseOrder.expected_currency }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Emisión</span>
            <span class="detail-value">{{ formatDate(purchaseOrder.issue_date) }}</span>
          </div>
          <div v-if="purchaseOrder.description" class="detail-row detail-row--full">
            <span class="detail-label">Alcance / Descripción</span>
            <span class="detail-value">{{ purchaseOrder.description }}</span>
          </div>
          <div v-if="purchaseOrder.drive_link" class="detail-row detail-row--full">
            <span class="detail-label">Carpeta o Documento</span>
            <a :href="purchaseOrder.drive_link" target="_blank" rel="noopener noreferrer" class="detail-value detail-value--link">
              Abrir enlace
              <AppIcon name="external" :size="14" />
            </a>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado de Documentación</span>
            <AppStatusBadge :status="purchaseOrder.status" />
          </div>
        </div>
      </div>

      <!-- Provider Card -->
      <div v-if="provider" class="detail-card">
        <div class="card-header">
          <div class="card-icon-wrapper">
            <div class="card-icon">
              <AppIcon name="building" :size="18" />
            </div>
          </div>
          <h2 class="card-title">Proveedor Vinculado</h2>
        </div>
        <div class="card-content">
          <div class="detail-row">
            <span class="detail-label">Razón Social</span>
            <span class="detail-value">{{ provider.business_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">RUC</span>
            <code class="detail-value detail-value--mono">{{ provider.ruc }}</code>
          </div>
          <div v-if="provider.trade_name" class="detail-row">
            <span class="detail-label">Nombre Comercial</span>
            <span class="detail-value">{{ provider.trade_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Correo</span>
            <a class="detail-value detail-value--link" :href="`mailto:${provider.email}`">{{ provider.email }}</a>
          </div>
        </div>
      </div>

      <!-- Magic Link Card -->
      <div class="detail-card detail-card--full">
        <div class="card-header card-header--no-icon">
          <h2 class="card-title">Acceso Restringido para el Proveedor</h2>
        </div>
        <div class="card-content">
          <div class="magic-info">
            <p class="magic-description">Genere un enlace temporal con el que su proveedor podrá abrir <strong>únicamente</strong> este trámite y cargar o consultar comprobantes.</p>
          </div>
          <div v-if="!magicLink" class="magic-actions">
            <button class="btn btn-primary" @click="generateMagicLink" :disabled="generatingLink">
              <AppIcon v-if="generatingLink" name="spinner" :size="16" :spin="true" />
              <AppIcon v-else name="link" :size="16" />
              <span>Generar Enlace de Acceso</span>
            </button>
          </div>
          <div v-else class="magic-link-block">
            <div class="magic-label">Enlace de acceso (copie y reenvíe por un canal seguro)</div>
            <div class="magic-link-row">
              <div class="magic-link-url-wrapper">
                <code class="magic-link-url">{{ magicLink.access_url }}</code>
              </div>
              <div class="magic-link-actions">
                <button class="btn btn-secondary" @click="copyMagicLink" :disabled="copyingLink">
                  <AppIcon name="copy" :size="16" />
                  <span>Copiar</span>
                </button>
                <button class="btn btn-secondary" @click="openMagicLink">
                  <AppIcon name="external" :size="16" />
                  <span>Abrir</span>
                </button>
                <button class="btn btn-danger" @click="revokeMagicLink">
                  <AppIcon name="cancel" :size="16" />
                  <span>Revocar</span>
                </button>
              </div>
            </div>
            <div class="magic-meta">
              <span class="magic-expiry">Expira: {{ new Date(magicLink.expires_at).toLocaleString('es-PE') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Submissions Card -->
      <div v-if="submissions.length > 0" class="detail-card detail-card--full">
        <div class="card-header">
          <div class="card-icon-wrapper">
            <div class="card-icon">
              <AppIcon name="file" :size="18" />
            </div>
          </div>
          <h2 class="card-title">Documentos e Instrucción al Pago (Envíos)</h2>
        </div>
        <div class="card-content">
          <div class="submissions-list">
            <div v-for="submission in submissions" :key="submission.id" class="submission-item">
              <div class="submission-header">
                <div class="submission-title">
                  <strong>{{ submission.document_type }}</strong>
                  <span class="submission-amount">{{ formatCurrency(submission.declared_amount_with_tax, submission.declared_currency) }}</span>
                </div>
                <div class="submission-badges">
                  <AppStatusBadge :status="submission.validation_status" size="small" />
                  <AppStatusBadge :status="submission.cdr_status" size="small" />
                </div>
              </div>
              <div class="submission-body">
                <div class="submission-grid">
                  <div class="submission-cell">
                    <span class="submission-label">Serie y Número</span>
                    <span v-if="submission.invoice_series && submission.invoice_number" class="submission-value">{{ submission.invoice_series }}-{{ submission.invoice_number }}</span>
                    <span v-else class="submission-value submission-value--muted">Sin dato en envío</span>
                  </div>
                  <div class="submission-cell">
                    <span class="submission-label">Fecha de Emisión</span>
                    <span v-if="submission.invoice_issue_date" class="submission-value">{{ formatDate(submission.invoice_issue_date) }}</span>
                    <span v-else class="submission-value submission-value--muted">Sin dato en envío</span>
                  </div>
                  <div class="submission-cell">
                    <span class="submission-label">Recibido en PPTO</span>
                    <span class="submission-value">{{ formatDate(submission.created_at) }}</span>
                  </div>
                </div>
                <div class="submission-cdr">
                  <span class="submission-label">CDR</span>
                  <div class="cdr-row">
                    <AppStatusBadge :status="submission.cdr_status" size="small" />
                    <span class="cdr-description">{{ getCdrStatusDescription(submission.cdr_status) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== LAYOUT ===== */
.detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  width: 100%;
}

/* ===== PAGE HEADER ===== */
.page-header {
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
  margin: 0 0 var(--space-2) 0;
}

.page-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

/* ===== STATES ===== */
.state-container {
  min-height: 400px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-12);
  text-align: center;
}

.loading-spinner {
  font-size: var(--text-3xl);
  color: var(--color-primary);
  margin-bottom: var(--space-4);
}

.loading-text {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  background: var(--color-error-100);
  color: var(--color-error);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
}

.error-content {
  text-align: center;
}

.error-title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.error-description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* ===== DETAIL GRID ===== */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: var(--space-6);
  align-content: start;
}

/* ===== DETAIL CARDS ===== */
.detail-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.detail-card--full {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-gray-50);
}

.card-header--no-icon {
  gap: 0;
}

.card-icon-wrapper {
  flex-shrink: 0;
}

.card-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  margin: 0;
}

.card-content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ===== DETAIL ROWS ===== */
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.detail-row--full {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.detail-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.detail-value {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  text-align: right;
  word-break: break-word;
}

.detail-row--full .detail-value {
  text-align: left;
}

.detail-value--mono {
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-semibold);
}

.detail-value--amount {
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-semibold);
  font-size: var(--text-base);
}

.detail-value--link {
  color: var(--color-primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: color var(--transition-fast);
}

.detail-value--link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.currency-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

/* ===== MAGIC LINK ===== */
.magic-info {
  padding: var(--space-4);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-5);
}

.magic-description {
  font-size: var(--text-sm);
  color: var(--color-primary-700);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.magic-actions {
  display: flex;
  justify-content: flex-start;
}

.magic-link-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.magic-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.magic-link-row {
  display: flex;
  align-items: stretch;
  gap: var(--space-3);
}

.magic-link-url-wrapper {
  flex: 1;
  min-width: 0;
}

.magic-link-url {
  width: 100%;
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  background: var(--color-gray-50);
  border: 1px solid var(--color-border-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  word-break: break-all;
  display: block;
  line-height: var(--leading-normal);
}

.magic-link-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
  align-items: stretch;
}

.magic-link-actions .btn {
  white-space: nowrap;
}

.magic-meta {
  display: flex;
  align-items: center;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-primary);
}

.magic-expiry {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

.action-button {
  width: 2rem;
  height: 2rem;
  background: var(--color-gray-100);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--text-sm);
}

.action-button:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.action-button--danger:hover {
  background: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-text-inverse);
}

.magic-expiry {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}

/* ===== SUBMISSIONS ===== */
.submissions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.submission-item {
  padding: var(--space-4);
  background: var(--color-gray-50);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
}

.submission-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.submission-title {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.submission-title strong {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.submission-amount {
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-bold);
  font-size: var(--text-base);
  color: var(--color-primary-700);
  font-variant-numeric: tabular-nums;
}

.submission-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.submission-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.submission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--space-4);
}

.submission-cell {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.submission-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.submission-value {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.submission-value--muted {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.submission-cdr {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.cdr-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.cdr-description {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .detail-view {
    gap: var(--space-6);
  }
  
  .page-title {
    font-size: var(--text-2xl);
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .header-actions .btn {
    width: 100%;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .detail-value {
    text-align: left;
  }
  
  .magic-link-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .magic-link-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .submission-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: var(--text-xl);
  }
  
  .page-subtitle {
    font-size: var(--text-sm);
  }
  
  .card-header {
    padding: var(--space-5);
  }
  
  .card-content {
    padding: var(--space-5);
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { purchaseOrderService } from '@/services/purchaseOrder.service';
import { providerService } from '@/services/provider.service';
import type { PurchaseOrderCreate, PurchaseOrderUpdate } from '@/types/purchase-order.types';
import type { Provider } from '@/types/provider.types';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppLoadingState from '@/components/common/AppLoadingState.vue';

const router = useRouter();
const route = useRoute();

const isEdit = computed(() => route.name === 'admin-purchase-orders-edit');
const orderId = computed(() => Number(route.params.id));

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const providers = ref<Provider[]>([]);

const formData = ref<PurchaseOrderCreate>({
  po_number: '',
  provider_id: 0,
  expected_amount: 0,
  expected_currency: 'PEN',
  issue_date: '',
  description: '',
  drive_link: '',
  status: 'CREATED'
});

const currencyOptions = [
  { label: 'Soles (PEN)', value: 'PEN' },
  { label: 'Dólares (USD)', value: 'USD' }
];

const loadProviders = async () => {
  try {
    providers.value = await providerService.getAll();
  } catch (err) {
    console.error('Error loading providers:', err);
  }
};

const loadOrder = async () => {
  if (!isEdit.value) return;

  try {
    loading.value = true;
    error.value = null;
    const order = await purchaseOrderService.getById(orderId.value);
    
    formData.value = {
      po_number: order.po_number,
      provider_id: order.provider_id,
      expected_amount: order.expected_amount,
      expected_currency: order.expected_currency,
      issue_date: order.issue_date,
      description: order.description || '',
      drive_link: order.drive_link || '',
      status: order.status
    };
  } catch (err) {
    console.error('Error loading order:', err);
    error.value = 'No se pudo cargar la orden de compra';
  } finally {
    loading.value = false;
  }
};

const validateForm = (): string | null => {
  if (!formData.value.po_number.trim()) return 'El número de OC es requerido';
  if (!formData.value.provider_id) return 'Debe seleccionar un proveedor';
  if (!formData.value.expected_amount || formData.value.expected_amount <= 0) {
    return 'El monto esperado debe ser mayor a 0';
  }
  if (!formData.value.expected_currency) return 'Debe seleccionar una moneda';
  if (!formData.value.issue_date) return 'La fecha de emisión es requerida';
  
  return null;
};

const saveOrder = async () => {
  const validationError = validateForm();
  if (validationError) {
    error.value = validationError;
    return;
  }

  try {
    saving.value = true;
    error.value = null;

    if (isEdit.value) {
      const updateData: PurchaseOrderUpdate = {
        expected_amount: formData.value.expected_amount,
        expected_currency: formData.value.expected_currency,
        issue_date: formData.value.issue_date,
        description: formData.value.description || null,
        drive_link: formData.value.drive_link || null,
        status: formData.value.status
      };
      await purchaseOrderService.update(orderId.value, updateData);
    } else {
      await purchaseOrderService.create(formData.value);
    }

    router.push('/admin/purchase-orders');
  } catch (err) {
    console.error('Error saving order:', err);
    error.value = 'No se pudo guardar la orden de compra';
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  router.push('/admin/purchase-orders');
};

onMounted(async () => {
  await loadProviders();
  await loadOrder();
});
</script>

<template>
  <div class="form-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">{{ isEdit ? 'Editar Orden de Compra' : 'Nueva Orden de Compra' }}</h1>
          <p class="page-subtitle">
            {{ isEdit 
              ? 'Actualice monto, fechas, describa cambios o ajuste el enlace a documentación' 
              : 'Asocie un proveedor y defina monto, moneda y plazos para generar un enlace seguro' 
            }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="cancel" :disabled="saving">
            <AppIcon name="cancel" :size="16" />
            <span>Cancelar</span>
          </button>
          <button class="btn btn-success" @click="saveOrder" :disabled="saving">
            <AppIcon v-if="saving" name="spinner" :size="16" :spin="true" />
            <AppIcon v-else name="approved" :size="16" />
            <span>{{ saving ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Orden') }}</span>
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
        <p class="loading-text">Cargando datos de la orden de compra...</p>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="form-container">
      <form @submit.prevent="saveOrder" class="form-card">
        <!-- Error Alert -->
        <div v-if="error" class="error-alert" role="alert">
          <div class="error-alert-icon">
            <AppIcon name="error" :size="14" />
          </div>
          <div class="error-alert-content">
            <span class="error-alert-text">{{ error }}</span>
          </div>
        </div>

        <!-- Section: Identification -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon-wrapper">
              <div class="section-icon">
                <AppIcon name="purchase-orders" :size="18" />
              </div>
            </div>
            <div class="section-text">
              <h2 class="section-title">Identificación y Proveedor</h2>
              <p class="section-description">Número interno de OC y vinculación a un registro de proveedor</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="po_number" class="field-label">
                Número de OC
                <span class="field-required">*</span>
              </label>
              <input
                id="po_number"
                v-model="formData.po_number"
                type="text"
                class="field-input"
                placeholder="Ej: OC-2026-000123"
                :disabled="saving || isEdit"
                autocomplete="off"
              />
              <p v-if="isEdit" class="field-hint">En edición, el identificador queda fijado</p>
            </div>
            <div class="form-field">
              <label for="provider_id" class="field-label">
                Proveedor
                <span class="field-required">*</span>
              </label>
              <select
                id="provider_id"
                v-model="formData.provider_id"
                class="field-input"
                :disabled="saving || isEdit"
              >
                <option value="">Seleccione un proveedor</option>
                <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                  {{ provider.business_name }} ({{ provider.ruc }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section: Amount and Validity -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon-wrapper">
              <div class="section-icon">
                <AppIcon name="purchase-order" :size="18" />
              </div>
            </div>
            <div class="section-text">
              <h2 class="section-title">Importe y Vigencia</h2>
              <p class="section-description">Define expectativa de gasto y fecha de emisión</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="expected_amount" class="field-label">
                Monto esperado
                <span class="field-required">*</span>
              </label>
              <input
                id="expected_amount"
                v-model.number="formData.expected_amount"
                type="number"
                step="0.01"
                min="0"
                class="field-input"
                placeholder="0.00"
                :disabled="saving"
                inputmode="decimal"
              />
            </div>
            <div class="form-field">
              <label for="expected_currency" class="field-label">
                Moneda
                <span class="field-required">*</span>
              </label>
              <select
                id="expected_currency"
                v-model="formData.expected_currency"
                class="field-input"
                :disabled="saving"
              >
                <option v-for="option in currencyOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="form-field">
              <label for="issue_date" class="field-label">
                Fecha de emisión
                <span class="field-required">*</span>
              </label>
              <input
                id="issue_date"
                v-model="formData.issue_date"
                type="date"
                class="field-input"
                :disabled="saving"
              />
            </div>
            <div v-if="isEdit" class="form-field">
              <label for="status" class="field-label">Estado del flujo</label>
              <select
                id="status"
                v-model="formData.status"
                class="field-input"
                :disabled="saving"
              >
                <option value="CREATED">Creada</option>
                <option value="LINK_GENERATED">Link generado</option>
                <option value="VIEWED_BY_PROVIDER">Vista por proveedor</option>
                <option value="DOCUMENTS_PENDING">Documentos pendientes</option>
                <option value="DOCUMENTS_UPLOADED">Documentos cargados</option>
                <option value="OBSERVED">Observada</option>
                <option value="APPROVED">Aprobada</option>
                <option value="READY_FOR_MAIN_PPTO">Lista para PPTO</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section: Documentation -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon-wrapper">
              <div class="section-icon">
                <AppIcon name="link" :size="18" />
              </div>
            </div>
            <div class="section-text">
              <h2 class="section-title">Documentación y Contexto</h2>
              <p class="section-description">Enlace a carpeta de Drive u observaciones internas (opcional)</p>
            </div>
          </div>
          <div class="form-grid form-grid--full">
            <div class="form-field">
              <label for="drive_link" class="field-label">Carpeta o documento (URL)</label>
              <input
                id="drive_link"
                v-model="formData.drive_link"
                type="url"
                class="field-input"
                placeholder="https://..."
                :disabled="saving"
              />
            </div>
            <div class="form-field">
              <label for="description" class="field-label">Descripción o alcance</label>
              <input
                id="description"
                v-model="formData.description"
                type="text"
                class="field-input"
                placeholder="Objeto del gasto, centro de costo, glosa breve..."
                :disabled="saving"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* ===== LAYOUT ===== */
.form-view {
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

.loading-state {
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

/* ===== FORM CONTAINER ===== */
.form-container {
  max-width: 900px;
}

.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
}

/* ===== ERROR ALERT ===== */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-6);
}

.error-alert-icon {
  width: 1.5rem;
  height: 1.5rem;
  background: var(--color-error);
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.error-alert-content {
  flex: 1;
}

.error-alert-text {
  font-size: var(--text-sm);
  color: var(--color-error-700);
  line-height: var(--leading-normal);
}

/* ===== FORM SECTIONS ===== */
.form-section {
  padding: var(--space-6) 0;
  border-bottom: 1px solid var(--color-border-primary);
}

.form-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.section-icon-wrapper {
  flex-shrink: 0;
}

.section-icon {
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

.section-text {
  flex: 1;
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  margin: 0 0 var(--space-1) 0;
}

.section-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  margin: 0;
}

/* ===== FORM GRID ===== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

.form-grid--full {
  grid-template-columns: 1fr;
}

/* ===== FORM FIELDS ===== */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}

.field-required {
  color: var(--color-error);
  margin-left: 0.125rem;
}

.field-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-family-base);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.field-input:disabled {
  background: var(--color-gray-100);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.field-input::placeholder {
  color: var(--color-text-tertiary);
}

.field-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-normal);
  margin: 0;
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
  .form-view {
    gap: var(--space-6);
  }
  
  .page-title {
    font-size: var(--text-2xl);
  }
  
  .form-card {
    padding: var(--space-6);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .header-actions .btn {
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: var(--text-xl);
  }
  
  .page-subtitle {
    font-size: var(--text-sm);
  }
  
  .form-card {
    padding: var(--space-5);
  }
  
  .form-section {
    padding: var(--space-5) 0;
  }
}
</style>

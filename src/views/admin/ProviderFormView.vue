<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { providerService } from '@/services/provider.service';
import type { Provider, ProviderCreate, ProviderUpdate } from '@/types/provider.types';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppLoadingState from '@/components/common/AppLoadingState.vue';

const router = useRouter();
const route = useRoute();

const isEdit = computed(() => route.name === 'admin-providers-edit');
const providerId = computed(() => Number(route.params.id));

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

const formData = ref<ProviderCreate>({
  ruc: '',
  business_name: '',
  trade_name: '',
  contact_name: '',
  email: '',
  phone: '',
  status: 'ACTIVE'
});

const loadProvider = async () => {
  if (!isEdit.value) return;

  try {
    loading.value = true;
    error.value = null;
    const provider = await providerService.getById(providerId.value);
    
    formData.value = {
      ruc: provider.ruc,
      business_name: provider.business_name,
      trade_name: provider.trade_name || '',
      contact_name: provider.contact_name || '',
      email: provider.email,
      phone: provider.phone || '',
      status: provider.status
    };
  } catch (err) {
    console.error('Error loading provider:', err);
    error.value = 'No se pudo cargar el proveedor';
  } finally {
    loading.value = false;
  }
};

const validateForm = (): string | null => {
  if (!formData.value.ruc.trim()) return 'El RUC es requerido';
  if (!formData.value.business_name.trim()) return 'La razón social es requerida';
  if (!formData.value.email.trim()) return 'El correo es requerido';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    return 'El formato del correo no es válido';
  }
  
  if (formData.value.ruc.length !== 11) {
    return 'El RUC debe tener 11 dígitos';
  }
  
  return null;
};

const saveProvider = async () => {
  const validationError = validateForm();
  if (validationError) {
    error.value = validationError;
    return;
  }

  try {
    saving.value = true;
    error.value = null;

    if (isEdit.value) {
      const updateData: ProviderUpdate = {
        ...formData.value,
        trade_name: formData.value.trade_name || null,
        contact_name: formData.value.contact_name || null,
        phone: formData.value.phone || null
      };
      await providerService.update(providerId.value, updateData);
    } else {
      await providerService.create(formData.value);
    }

    router.push('/admin/providers');
  } catch (err) {
    console.error('Error saving provider:', err);
    error.value = 'No se pudo guardar el proveedor';
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  router.push('/admin/providers');
};

onMounted(() => {
  loadProvider();
});
</script>

<template>
  <div class="form-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">{{ isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h1>
          <p class="page-subtitle">
            {{ isEdit 
              ? 'Actualice RUC, razón social, contacto y estado del proveedor' 
              : 'Registre al proveedor para vincularlo a órdenes de compra y enlaces de acceso' 
            }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="cancel" :disabled="saving">
            <AppIcon name="cancel" :size="16" />
            <span>Cancelar</span>
          </button>
          <button class="btn btn-success" @click="saveProvider" :disabled="saving">
            <AppIcon v-if="saving" name="spinner" :size="16" :spin="true" />
            <AppIcon v-else name="save" :size="16" />
            <span>{{ saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Proveedor') }}</span>
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
        <p class="loading-text">Cargando datos del proveedor...</p>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="form-container">
      <form @submit.prevent="saveProvider" class="form-card">
        <!-- Error Alert -->
        <div v-if="error" class="error-alert" role="alert">
          <div class="error-alert-icon">
            <AppIcon name="error" :size="14" />
          </div>
          <div class="error-alert-content">
            <span class="error-alert-text">{{ error }}</span>
          </div>
        </div>

        <!-- Section: Company Identification -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon-wrapper">
              <div class="section-icon">
                <AppIcon name="building" :size="18" />
              </div>
            </div>
            <div class="section-text">
              <h2 class="section-title">Identificación de la Empresa</h2>
              <p class="section-description">RUC, razón social y nombre comercial según registro</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="ruc" class="field-label">
                RUC
                <span class="field-required">*</span>
              </label>
              <input
                id="ruc"
                v-model="formData.ruc"
                type="text"
                class="field-input"
                placeholder="11 dígitos"
                maxlength="11"
                :disabled="saving"
                inputmode="numeric"
                autocomplete="off"
              />
              <p class="field-hint">Solo números, 11 caracteres (Perú)</p>
            </div>
            <div class="form-field">
              <label for="business_name" class="field-label">
                Razón Social
                <span class="field-required">*</span>
              </label>
              <input
                id="business_name"
                v-model="formData.business_name"
                type="text"
                class="field-input"
                placeholder="Según constancia de inscripción"
                :disabled="saving"
                autocomplete="organization"
              />
            </div>
            <div class="form-field form-field--full">
              <label for="trade_name" class="field-label">Nombre Comercial</label>
              <input
                id="trade_name"
                v-model="formData.trade_name"
                type="text"
                class="field-input"
                placeholder="Opcional. Nombre con el que opera en el mercado"
                :disabled="saving"
              />
              <p class="field-hint">Opcional. Puede ser distinto a la razón social</p>
            </div>
          </div>
        </div>

        <!-- Section: Contact and Status -->
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon-wrapper">
              <div class="section-icon">
                <AppIcon name="providers" :size="18" />
              </div>
            </div>
            <div class="section-text">
              <h2 class="section-title">Contacto y Estado</h2>
              <p class="section-description">Datos de comunicación y estado en el directorio</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="contact_name" class="field-label">Persona de Contacto</label>
              <input
                id="contact_name"
                v-model="formData.contact_name"
                type="text"
                class="field-input"
                placeholder="Opcional"
                :disabled="saving"
                autocomplete="name"
              />
            </div>
            <div class="form-field">
              <label for="email" class="field-label">
                Correo
                <span class="field-required">*</span>
              </label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="field-input"
                placeholder="notificaciones@empresa.com"
                :disabled="saving"
                autocomplete="email"
              />
              <p class="field-hint">Se usa para notificaciones del flujo con órdenes de compra</p>
            </div>
            <div class="form-field">
              <label for="phone" class="field-label">Teléfono</label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                class="field-input"
                placeholder="Opcional"
                :disabled="saving"
                autocomplete="tel"
              />
            </div>
            <div class="form-field">
              <label for="status" class="field-label">Estado en el Directorio</label>
              <select
                id="status"
                v-model="formData.status"
                class="field-input"
                :disabled="saving"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="PENDING">Pendiente de revisión</option>
              </select>
              <p class="field-hint">Controla la posibilidad de vincular nuevas órdenes de compra</p>
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

.form-field--full {
  grid-column: 1 / -1;
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

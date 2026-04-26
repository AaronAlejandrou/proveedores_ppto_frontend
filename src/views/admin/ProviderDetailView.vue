<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { providerService } from '@/services/provider.service';
import type { Provider } from '@/types/provider.types';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppStatusBadge from '@/components/common/AppStatusBadge.vue';
import AppLoadingState from '@/components/common/AppLoadingState.vue';

const router = useRouter();
const providerId = computed(() => Number(router.currentRoute.value.params.id));

const provider = ref<Provider | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const loadProvider = async () => {
  try {
    loading.value = true;
    error.value = null;
    provider.value = await providerService.getById(providerId.value);
  } catch (err) {
    console.error('Error loading provider:', err);
    error.value = 'No se pudo cargar el proveedor';
  } finally {
    loading.value = false;
  }
};

const goToEdit = () => {
  router.push(`/admin/providers/${providerId.value}/edit`);
};

const goBack = () => {
  router.push('/admin/providers');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadProvider();
});
</script>

<template>
  <div class="detail-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Ficha de Proveedor</h1>
          <p class="page-subtitle">{{ provider?.business_name || 'Cargando datos...' }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="goBack">
            <AppIcon name="back" :size="16" />
            <span>Volver</span>
          </button>
          <button v-if="provider" class="btn btn-primary" @click="goToEdit">
            <AppIcon name="edit" :size="16" />
            <span>Editar</span>
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
        <p class="loading-text">Cargando ficha de proveedor...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-container">
      <div class="error-state">
        <div class="error-icon">
          <AppIcon name="error" :size="24" />
        </div>
        <div class="error-content">
          <h3 class="error-title">Error al cargar proveedor</h3>
          <p class="error-description">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Detail Cards -->
    <div v-else-if="provider" class="detail-grid">
      <!-- Identity Card -->
      <div class="detail-card">
        <div class="card-header">
          <div class="card-icon-wrapper">
            <div class="card-icon">
              <AppIcon name="building" :size="18" />
            </div>
          </div>
          <h2 class="card-title">Registro e Identidad</h2>
        </div>
        <div class="card-content">
          <div class="detail-row">
            <span class="detail-label">RUC</span>
            <code class="detail-value detail-value--mono">{{ provider.ruc }}</code>
          </div>
          <div class="detail-row">
            <span class="detail-label">Razón Social</span>
            <span class="detail-value">{{ provider.business_name }}</span>
          </div>
          <div v-if="provider.trade_name" class="detail-row">
            <span class="detail-label">Nombre Comercial</span>
            <span class="detail-value">{{ provider.trade_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado en Directorio</span>
            <AppStatusBadge :status="provider.status" />
          </div>
        </div>
      </div>

      <!-- Contact Card -->
      <div class="detail-card">
        <div class="card-header">
          <div class="card-icon-wrapper">
            <div class="card-icon">
              <AppIcon name="mail" :size="18" />
            </div>
          </div>
          <h2 class="card-title">Contacto</h2>
        </div>
        <div class="card-content">
          <div class="detail-row">
            <span class="detail-label">Correo</span>
            <a class="detail-value detail-value--link" :href="`mailto:${provider.email}`">
              {{ provider.email }}
            </a>
          </div>
          <div v-if="provider.contact_name" class="detail-row">
            <span class="detail-label">Persona de Contacto</span>
            <span class="detail-value">{{ provider.contact_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Teléfono</span>
            <span v-if="provider.phone" class="detail-value">{{ provider.phone }}</span>
            <span v-else class="detail-value detail-value--muted">No registrado</span>
          </div>
        </div>
      </div>

      <!-- Audit Card -->
      <div class="detail-card">
        <div class="card-header">
          <div class="card-icon-wrapper">
            <div class="card-icon">
              <AppIcon name="pending" :size="18" />
            </div>
          </div>
          <h2 class="card-title">Sistema y Auditoría</h2>
        </div>
        <div class="card-content">
          <div class="detail-row">
            <span class="detail-label">Creado</span>
            <span class="detail-value">{{ formatDate(provider.created_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Última Modificación</span>
            <span class="detail-value">{{ formatDate(provider.updated_at) }}</span>
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

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-gray-50);
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

.detail-value--mono {
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-semibold);
}

.detail-value--link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.detail-value--link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.detail-value--muted {
  color: var(--color-text-tertiary);
  font-style: italic;
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

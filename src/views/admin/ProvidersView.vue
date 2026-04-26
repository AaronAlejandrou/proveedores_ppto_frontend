<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { providerService } from '@/services/provider.service';
import type { Provider } from '@/types/provider.types';
import AppPageHeader from '@/components/common/AppPageHeader.vue';

const router = useRouter();
const providers = ref<Provider[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');

const filteredProviders = computed(() => {
  if (!searchQuery.value) return providers.value;
  
  const query = searchQuery.value.toLowerCase();
  return providers.value.filter(provider => 
    provider.ruc.includes(query) ||
    provider.business_name.toLowerCase().includes(query) ||
    provider.trade_name?.toLowerCase().includes(query) ||
    provider.contact_name?.toLowerCase().includes(query) ||
    provider.email.toLowerCase().includes(query)
  );
});

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'var(--color-success)',
    'INACTIVE': 'var(--color-gray-500)',
    'PENDING': 'var(--color-warning)',
  };
  return colors[status] || 'var(--color-gray-500)';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'ACTIVE': 'Activo',
    'INACTIVE': 'Inactivo',
    'PENDING': 'Pendiente',
  };
  return labels[status] || status;
};

const loadProviders = async () => {
  try {
    loading.value = true;
    error.value = null;
    providers.value = await providerService.getAll();
  } catch (err) {
    console.error('Error loading providers:', err);
    error.value = 'No se pudieron cargar los proveedores';
  } finally {
    loading.value = false;
  }
};

const goToProviderDetail = (id: number) => {
  router.push(`/admin/providers/${id}`);
};

const goToNewProvider = () => {
  router.push('/admin/providers/new');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

onMounted(() => {
  loadProviders();
});
</script>

<template>
  <div class="providers-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Proveedores</h1>
          <p class="page-subtitle">Directorio de proveedores, contactos y estado del sistema</p>
        </div>
        <button class="btn btn-primary" @click="goToNewProvider">
          <AppIcon name="plus" :size="16" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loading-state">
        <div class="loading-spinner">
          <AppIcon name="spinner" :size="32" :spin="true" />
        </div>
        <p class="loading-text">Cargando proveedores...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-container">
      <div class="error-state">
        <div class="error-icon">
          <AppIcon name="error" :size="24" />
        </div>
        <div class="error-content">
          <h3 class="error-title">Error al cargar proveedores</h3>
          <p class="error-description">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="providers.length === 0" class="state-container">
      <div class="empty-state">
        <div class="empty-icon-wrapper">
          <div class="empty-icon">
            <AppIcon name="providers" :size="28" />
          </div>
        </div>
        <h3 class="empty-title">No hay proveedores registrados</h3>
        <p class="empty-description">Comienza agregando tu primer proveedor al sistema</p>
        <button class="btn btn-primary" @click="goToNewProvider">
          <AppIcon name="plus" :size="16" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="providers-content">
      <!-- Search Bar -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <AppIcon name="search" class="search-icon" :size="16" />
          <input
            v-model="searchQuery"
            type="search"
            class="search-input"
            placeholder="Buscar por RUC, razón social, correo o contacto..."
            aria-label="Buscar proveedores"
            autocomplete="off"
          />
        </div>
        <div class="results-count">
          <span class="count-label">Mostrando</span>
          <span class="count-number">{{ filteredProviders.length }}</span>
          <span class="count-divider">de</span>
          <span class="count-total">{{ providers.length }}</span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="table-th">
                <span>RUC</span>
              </th>
              <th class="table-th">
                <span>Razón Social</span>
              </th>
              <th class="table-th">
                <span>Contacto</span>
              </th>
              <th class="table-th">
                <span>Correo</span>
              </th>
              <th class="table-th">
                <span>Teléfono</span>
              </th>
              <th class="table-th">
                <span>Estado</span>
              </th>
              <th class="table-th table-th--actions">
                <span>Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="provider in filteredProviders" 
              :key="provider.id"
              class="table-row"
            >
              <td class="table-td">
                <code class="ruc-badge">{{ provider.ruc }}</code>
              </td>
              <td class="table-td">
                <div class="provider-info">
                  <div class="provider-name">{{ provider.business_name }}</div>
                  <div v-if="provider.trade_name" class="provider-trade">{{ provider.trade_name }}</div>
                </div>
              </td>
              <td class="table-td">
                <span v-if="provider.contact_name" class="contact-name">{{ provider.contact_name }}</span>
                <span v-else class="no-data">—</span>
              </td>
              <td class="table-td">
                <a :href="`mailto:${provider.email}`" class="email-link">{{ provider.email }}</a>
              </td>
              <td class="table-td">
                <span v-if="provider.phone" class="phone-number">{{ provider.phone }}</span>
                <span v-else class="no-data">—</span>
              </td>
              <td class="table-td">
                <span 
                  class="status-badge"
                  :class="`status-badge--${provider.status.toLowerCase()}`"
                >
                  {{ getStatusLabel(provider.status) }}
                </span>
              </td>
              <td class="table-td table-td--actions">
                <button 
                  class="btn btn-link btn-icon"
                  @click="goToProviderDetail(provider.id)"
                  title="Ver detalles"
                >
                  <AppIcon name="detail" :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== LAYOUT ===== */
.providers-view {
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

/* ===== STATES ===== */
.state-container {
  min-height: 400px;
}

.loading-state,
.error-state,
.empty-state {
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

.empty-icon-wrapper {
  margin-bottom: var(--space-6);
}

.empty-icon {
  width: 5rem;
  height: 5rem;
  background: var(--color-gray-100);
  color: var(--color-gray-400);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-3xl);
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
}

.empty-description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-6) 0;
}

/* ===== CONTENT ===== */
.providers-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* ===== SEARCH BAR ===== */
.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.search-input-wrapper {
  flex: 1;
  max-width: 28rem;
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  font-size: var(--text-base);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) calc(var(--space-4) + var(--space-6));
  font-family: var(--font-family-base);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.results-count {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

.count-number,
.count-total {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

/* ===== TABLE ===== */
.table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.table-th {
  background: var(--color-gray-50);
  border-bottom: 1px solid var(--color-border-primary);
  padding: var(--space-4) var(--space-5);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: left;
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-th--actions {
  text-align: center;
  width: 80px;
}

.table-row {
  border-bottom: 1px solid var(--color-border-primary);
  transition: background-color var(--transition-fast);
}

.table-row:hover {
  background: var(--color-gray-50);
}

.table-row:last-child {
  border-bottom: none;
}

.table-td {
  padding: var(--space-4) var(--space-5);
  vertical-align: middle;
}

.table-td--actions {
  text-align: center;
}

/* ===== TABLE CELLS ===== */
.ruc-badge {
  background: var(--color-gray-100);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  font-family: var(--font-family-mono);
}

.provider-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.provider-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}

.provider-trade {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-style: italic;
}

.contact-name,
.phone-number {
  color: var(--color-text-secondary);
}

.no-data {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.email-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: color var(--transition-fast);
}

.email-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* ===== STATUS BADGES ===== */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge--active {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.status-badge--inactive {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.status-badge--pending {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

/* ===== ACTION BUTTON ===== */
.action-button {
  width: 2.25rem;
  height: 2.25rem;
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

.action-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }
  
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input-wrapper {
    max-width: none;
  }
  
  .results-count {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .providers-view {
    gap: var(--space-6);
  }
  
  .page-title {
    font-size: var(--text-2xl);
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .data-table {
    min-width: 600px;
  }
  
  .loading-state,
  .error-state,
  .empty-state {
    padding: var(--space-8);
  }
  
  .empty-icon {
    width: 4rem;
    height: 4rem;
    font-size: var(--text-2xl);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: var(--text-xl);
  }
  
  .page-subtitle {
    font-size: var(--text-sm);
  }
  
  .empty-icon {
    width: 3rem;
    height: 3rem;
    font-size: var(--text-xl);
  }
  
  .empty-title {
    font-size: var(--text-lg);
  }
  
  .empty-description {
    font-size: var(--text-sm);
  }
}
</style>

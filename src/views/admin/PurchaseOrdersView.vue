<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { purchaseOrderService } from "@/services/purchaseOrder.service";
import { providerService } from "@/services/provider.service";
import type { PurchaseOrder } from "@/types/purchase-order.types";
import type { Provider } from "@/types/provider.types";
import AppPageHeader from "@/components/common/AppPageHeader.vue";
import AppStatusBadge from "@/components/common/AppStatusBadge.vue";
import AppLoadingState from "@/components/common/AppLoadingState.vue";
import AppEmptyState from "@/components/common/AppEmptyState.vue";

const router = useRouter();
const purchaseOrders = ref<(PurchaseOrder & { provider?: Provider })[]>([]);
const providers = ref<Provider[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref("");

const filteredOrders = computed(() => {
  if (!searchQuery.value.trim()) return purchaseOrders.value;
  const q = searchQuery.value.toLowerCase().trim();
  return purchaseOrders.value.filter((o) => {
    if (o.po_number.toLowerCase().includes(q)) return true;
    if (o.provider?.business_name.toLowerCase().includes(q)) return true;
    if (o.provider?.ruc?.includes(q)) return true;
    if (String(o.status).toLowerCase().includes(q)) return true;
    return false;
  });
});

const loadPurchaseOrders = async () => {
  try {
    loading.value = true;
    error.value = null;

    const [ordersData, providersData] = await Promise.all([
      purchaseOrderService.getAll(),
      providerService.getAll(),
    ]);

    providers.value = providersData;

    purchaseOrders.value = ordersData.map((order) => ({
      ...order,
      provider: providers.value.find((p) => p.id === order.provider_id),
    }));
  } catch (err) {
    console.error("Error loading purchase orders:", err);
    error.value = "No se pudieron cargar las órdenes de compra";
  } finally {
    loading.value = false;
  }
};

const goToOrderDetail = (id: number) => {
  router.push(`/admin/purchase-orders/${id}`);
};

const goToNewOrder = () => {
  router.push("/admin/purchase-orders/new");
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "PEN",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(() => {
  loadPurchaseOrders();
});
</script>

<template>
  <div class="orders-view">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Órdenes de Compra</h1>
          <p class="page-subtitle">Seguimiento de OCs, enlaces de acceso a proveedores y estados de documentación</p>
        </div>
        <button class="btn btn-primary" @click="goToNewOrder">
          <AppIcon name="plus" :size="16" />
          <span>Nueva Orden</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loading-state">
        <div class="loading-spinner">
          <AppIcon name="spinner" :size="32" :spin="true" />
        </div>
        <p class="loading-text">Cargando órdenes de compra...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-container">
      <div class="error-state">
        <div class="error-icon">
          <AppIcon name="error" :size="24" />
        </div>
        <div class="error-content">
          <h3 class="error-title">Error al cargar órdenes</h3>
          <p class="error-description">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="purchaseOrders.length === 0" class="state-container">
      <div class="empty-state">
        <div class="empty-icon-wrapper">
          <div class="empty-icon">
            <AppIcon name="file" :size="28" />
          </div>
        </div>
        <h3 class="empty-title">No hay órdenes de compra</h3>
        <p class="empty-description">Crea la primera OC y genera un enlace seguro para el proveedor</p>
        <button class="btn btn-primary" @click="goToNewOrder">
          <AppIcon name="plus" :size="16" />
          <span>Nueva Orden</span>
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="orders-content">
      <!-- Search Bar -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <AppIcon name="search" class="search-icon" :size="16" />
          <input
            v-model="searchQuery"
            type="search"
            class="search-input"
            placeholder="Buscar por número, proveedor, RUC o estado..."
            aria-label="Filtrar órdenes"
            autocomplete="off"
          />
        </div>
        <div class="results-count">
          <span class="count-label">Mostrando</span>
          <span class="count-number">{{ filteredOrders.length }}</span>
          <span class="count-divider">de</span>
          <span class="count-total">{{ purchaseOrders.length }}</span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="table-th">
                <span>Número OC</span>
              </th>
              <th class="table-th">
                <span>Proveedor</span>
              </th>
              <th class="table-th">
                <span>Monto</span>
              </th>
              <th class="table-th">
                <span>Moneda</span>
              </th>
              <th class="table-th">
                <span>Emisión</span>
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
              v-for="order in filteredOrders" 
              :key="order.id"
              class="table-row"
            >
              <td class="table-td">
                <button class="po-link" @click="goToOrderDetail(order.id)">
                  {{ order.po_number }}
                </button>
              </td>
              <td class="table-td">
                <div class="provider-info">
                  <div v-if="order.provider" class="provider-name">{{ order.provider.business_name }}</div>
                  <div v-if="order.provider" class="provider-ruc">{{ order.provider.ruc }}</div>
                  <div v-else class="no-provider">ID: {{ order.provider_id }}</div>
                </div>
              </td>
              <td class="table-td">
                <span class="amount">{{ formatCurrency(order.expected_amount, order.expected_currency) }}</span>
              </td>
              <td class="table-td">
                <span class="currency-badge">{{ order.expected_currency }}</span>
              </td>
              <td class="table-td">
                <span class="date">{{ formatDate(order.issue_date) }}</span>
              </td>
              <td class="table-td">
                <AppStatusBadge :status="order.status" />
              </td>
              <td class="table-td table-td--actions">
                <button 
                  class="btn btn-link btn-icon"
                  @click="goToOrderDetail(order.id)"
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
.orders-view {
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
.orders-content {
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
.po-link {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.po-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
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

.provider-ruc {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
}

.no-provider {
  color: var(--color-error);
  font-size: var(--text-sm);
  font-style: italic;
}

.amount {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-family: var(--font-family-mono);
  font-variant-numeric: tabular-nums;
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

.date {
  color: var(--color-text-secondary);
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
  .orders-view {
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

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { providerService } from '@/services/provider.service';
import { purchaseOrderService } from '@/services/purchaseOrder.service';
import type { Provider } from '@/types/provider.types';
import type { PurchaseOrder } from '@/types/purchase-order.types';

interface MetricCard {
  key: string;
  title: string;
  value: string;
  description: string;
  severity: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

const metrics = ref<MetricCard[]>([]);
const loading = ref(true);
const providers = ref<Provider[]>([]);
const purchaseOrders = ref<PurchaseOrder[]>([]);

const calculateMetrics = () => {
  const totalOrders = purchaseOrders.value.length;
  const totalProviders = providers.value.length;
  const linkGenerated = purchaseOrders.value.filter(po => po.status === 'LINK_GENERATED').length;
  const documentsPending = purchaseOrders.value.filter(po => 
    ['DOCUMENTS_PENDING', 'VIEWED_BY_PROVIDER'].includes(po.status)
  ).length;

  metrics.value = [
    {
      key: "total-providers",
      title: "Proveedores",
      value: totalProviders.toString(),
      description: "Total registrados",
      severity: "primary",
    },
    {
      key: "total-orders",
      title: "Órdenes de Compra",
      value: totalOrders.toString(),
      description: "Total generadas",
      severity: "info",
    },
    {
      key: "link-generated",
      title: "Links Generados",
      value: linkGenerated.toString(),
      description: "OCs con acceso",
      severity: "secondary",
    },
    {
      key: "pending-docs",
      title: "Pendientes",
      value: documentsPending.toString(),
      description: "Esperando documentos",
      severity: "warning",
    },
  ];
};

const recentOrders = computed(() => {
  return purchaseOrders.value
    .slice(0, 5)
    .map(order => ({
      ...order,
      statusColor: getStatusColor(order.status),
      statusLabel: getStatusLabel(order.status)
    }));
});

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'CREATED': 'var(--color-gray-500)',
    'LINK_GENERATED': 'var(--color-primary-500)',
    'VIEWED_BY_PROVIDER': 'var(--color-warning)',
    'DOCUMENTS_PENDING': 'var(--color-warning)',
    'APPROVED': 'var(--color-success)',
    'READY_FOR_MAIN_PPTO': 'var(--color-success)',
  };
  return colors[status] || 'var(--color-gray-500)';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'CREATED': 'Creada',
    'LINK_GENERATED': 'Link Generado',
    'VIEWED_BY_PROVIDER': 'Vista por Proveedor',
    'DOCUMENTS_PENDING': 'Pendiente de Documentos',
    'APPROVED': 'Aprobada',
    'READY_FOR_MAIN_PPTO': 'Lista para PPTO',
  };
  return labels[status] || status;
};

const loadData = async () => {
  try {
    loading.value = true;
    const [providersData, ordersData] = await Promise.all([
      providerService.getAll(),
      purchaseOrderService.getAll()
    ]);
    
    providers.value = providersData;
    purchaseOrders.value = ordersData;
    calculateMetrics();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

// Utility functions
const formatCurrency = (amount: number, currency: string) => {
  const formatter = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency === 'PEN' ? 'PEN' : 'USD',
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
</script>

<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="dashboard-loading">
      <div class="loading-content">
        <div class="loading-spinner">
          <AppIcon name="spinner" :size="32" :spin="true" />
        </div>
        <p class="loading-text">Cargando métricas del sistema...</p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Hero Section -->
      <div class="dashboard-hero">
        <h1 class="hero-title">Panel de Control</h1>
        <!--<p class="hero-description">Resumen general de operaciones con proveedores y métricas clave del sistema.</p>-->
      </div>
      <br>
      <!-- Metrics Grid -->
      <div class="metrics-grid">
        <div 
          v-for="metric in metrics" 
          :key="metric.key"
          class="metric-card"
          :class="`metric-card--${metric.severity}`"
        >
          <div class="metric-content">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.title }}</div>
            <div class="metric-description">{{ metric.description }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <section class="quick-actions-section">
        <div class="section-header">
          <h2 class="section-title">Acciones Rápidas</h2>
          <p class="section-description">Operaciones frecuentes del sistema</p>
        </div>
        <div class="quick-actions-grid">
          <router-link to="/admin/providers/new" class="quick-action-card">
            <div class="action-icon action-icon--primary">
              <AppIcon name="plus" :size="18" />
            </div>
            <div class="action-content">
              <h3 class="action-title">Nuevo Proveedor</h3>
              <p class="action-description">Registrar proveedor al sistema</p>
            </div>
            <div class="action-chevron">
              <AppIcon name="chevron-right" :size="16" />
            </div>
          </router-link>
          
          <router-link to="/admin/purchase-orders/new" class="quick-action-card">
            <div class="action-icon action-icon--secondary">
              <AppIcon name="new-order" :size="18" />
            </div>
            <div class="action-content">
              <h3 class="action-title">Nueva Orden</h3>
              <p class="action-description">Crear orden de compra</p>
            </div>
            <div class="action-chevron">
              <AppIcon name="chevron-right" :size="16" />
            </div>
          </router-link>
          
          <router-link to="/admin/providers" class="quick-action-card">
            <div class="action-icon action-icon--info">
              <AppIcon name="directory" :size="18" />
            </div>
            <div class="action-content">
              <h3 class="action-title">Directorio</h3>
              <p class="action-description">Ver todos los proveedores</p>
            </div>
            <div class="action-chevron">
              <AppIcon name="chevron-right" :size="16" />
            </div>
          </router-link>
          
          <router-link to="/admin/purchase-orders" class="quick-action-card">
            <div class="action-icon action-icon--success">
              <AppIcon name="purchase-orders" :size="18" />
            </div>
            <div class="action-content">
              <h3 class="action-title">Órdenes</h3>
              <p class="action-description">Gestionar órdenes de compra</p>
            </div>
            <div class="action-chevron">
              <AppIcon name="chevron-right" :size="16" />
            </div>
          </router-link>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="recent-activity-section">
        <div class="section-header">
          <h2 class="section-title">Actividad Reciente</h2>
          <p class="section-description">Últimas órdenes de compra registradas</p>
        </div>
        
        <div v-if="recentOrders.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <div class="empty-icon">
              <AppIcon name="inbox" :size="28" />
            </div>
          </div>
          <h3 class="empty-title">Sin actividad reciente</h3>
          <p class="empty-description">No hay órdenes de compra registradas aún</p>
          <router-link to="/admin/purchase-orders/new" class="btn btn-primary empty-action">
            <AppIcon name="plus" :size="16" />
            <span>Crear primera orden</span>
          </router-link>
        </div>
        
        <div v-else class="activity-list">
          <div 
            v-for="order in recentOrders" 
            :key="order.id"
            class="activity-card"
          >
            <div class="activity-left">
              <div class="activity-icon-wrapper">
                <div class="activity-icon">
                  <AppIcon name="file" :size="18" />
                </div>
              </div>
              <div class="activity-content">
                <div class="activity-header">
                  <h4 class="activity-title">{{ order.po_number }}</h4>
                  <div 
                    class="activity-badge"
                    :class="`activity-badge--${order.statusColor}`"
                  >
                    {{ order.statusLabel }}
                  </div>
                </div>
                <div class="activity-details">
                  <span class="activity-amount">{{ formatCurrency(order.expected_amount, order.expected_currency) }}</span>
                  <span class="activity-date">{{ formatDate(order.created_at) }}</span>
                </div>
              </div>
            </div>
            <router-link 
              :to="`/admin/purchase-orders/${order.id}`"
              class="activity-action"
            >
              <AppIcon name="continue" :size="16" />
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
/* ===== DASHBOARD LAYOUT ===== */
.dashboard {
  display: block;
  gap: var(--space-8);
  width: 100%;
}

.dashboard-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.loading-spinner {
  font-size: var(--text-3xl);
  color: var(--color-primary);
}

.loading-text {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.dashboard-content {
  display: block;
  gap: var(--space-10);
  width: 100%;
}

/* ===== HERO SECTION ===== */
.dashboard-hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  width: fit-content;
}

.hero-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
  margin: 0;
}

.hero-description {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 40rem;
}

/* ===== SECTION HEADERS ===== */
.section-header {
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.section-description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--leading-normal);
}

/* ===== METRICS GRID ===== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;
  margin-bottom: 2.5rem;
  align-items: stretch;
}

.metrics-section {
  margin-bottom: var(--space-10);
  width: 100%;
}

.metric-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  width: 100%;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-secondary);
}

.metric-card--primary {
  background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-surface) 100%);
  border-color: var(--color-primary-200);
}

.metric-card--secondary {
  background: linear-gradient(135deg, var(--color-secondary-50) 0%, var(--color-surface) 100%);
  border-color: var(--color-secondary-200);
}

.metric-card--success {
  background: linear-gradient(135deg, var(--color-success-50) 0%, var(--color-surface) 100%);
  border-color: var(--color-success-200);
}

.metric-card--warning {
  background: linear-gradient(135deg, var(--color-warning-50) 0%, var(--color-surface) 100%);
  border-color: var(--color-warning-200);
}

.metric-card--error {
  background: linear-gradient(135deg, var(--color-error-50) 0%, var(--color-surface) 100%);
  border-color: var(--color-error-200);
}

.metric-card--info {
  background: linear-gradient(135deg, var(--color-info-50) 0%, var(--color-surface) 100%);
  border-color: var(--color-info-200);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.metric-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.metric-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}

.metric-description {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-normal);
}

/* ===== QUICK ACTIONS ===== */
.quick-actions-section {
  margin-bottom: var(--space-10);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  align-items: stretch;
}

.quick-action-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-secondary);
}

.action-icon {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-primary);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.action-icon--primary {
  color: var(--color-primary-600);
}

.action-icon--secondary {
  color: var(--color-secondary-700);
}

.action-icon--info {
  color: var(--color-info-700);
}

.action-icon--success {
  color: var(--color-success-700);
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.action-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--leading-tight);
}

.action-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--leading-normal);
}

.action-chevron {
  color: var(--color-text-tertiary);
  font-size: var(--text-lg);
  transition: all var(--transition-fast);
}

.quick-action-card:hover .action-chevron {
  color: var(--color-primary);
  transform: translateX(4px);
}

/* ===== RECENT ACTIVITY ===== */
.recent-activity-section {
  margin-bottom: var(--space-10);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  text-align: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
}

.empty-icon-wrapper {
  margin-bottom: var(--space-6);
}

.empty-icon {
  width: 5rem;
  height: 5rem;
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-3xl);
  color: var(--color-gray-400);
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

.empty-action {
  display: inline-flex;
  gap: var(--space-2);
  text-decoration: none;
}

.empty-action:hover {
  text-decoration: none;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.activity-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
}

.activity-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-secondary);
}

.activity-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex: 1;
}

.activity-icon-wrapper {
  flex-shrink: 0;
}

.activity-icon {
  width: 3rem;
  height: 3rem;
  background: var(--color-primary-100);
  color: var(--color-primary-600);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.activity-title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--leading-tight);
}

.activity-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.activity-badge--var\(--color-primary-500\) {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.activity-badge--var\(--color-success\) {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.activity-badge--var\(--color-warning\) {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.activity-details {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-size: var(--text-sm);
}

.activity-amount {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-family: var(--font-family-mono);
}

.activity-date {
  color: var(--color-text-tertiary);
}

.activity-action {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.activity-action:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  transform: translateX(2px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-title {
    font-size: var(--text-3xl);
  }
}

@media (max-width: 640px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .hero-description {
    font-size: var(--text-base);
  }
  
  .section-title {
    font-size: var(--text-xl);
  }
  
  .metric-value {
    font-size: var(--text-3xl);
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
  }
  
  .quick-action-card {
    padding: var(--space-4);
  }
  
  .action-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: var(--text-base);
  }
  
  .activity-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
  
  .activity-left {
    width: 100%;
  }
  
  .activity-header {
    width: 100%;
    justify-content: space-between;
  }
  
  .activity-details {
    width: 100%;
    justify-content: space-between;
  }
  
  .activity-action {
    align-self: flex-end;
  }
  
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
  .hero-title {
    font-size: var(--text-2xl);
  }
  
  .section-title {
    font-size: var(--text-xl);
  }
  
  .metric-value {
    font-size: var(--text-2xl);
  }
  
  .empty-icon {
    width: 3rem;
    height: 3rem;
    font-size: var(--text-xl);
  }
}
</style>

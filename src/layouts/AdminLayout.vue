<template>
  <div class="admin-layout">
    <!-- Modern Header -->
    <header class="admin-header">
      <div class="header-container">
        <!-- Logo -->
        <div class="header-brand">
          <router-link to="/admin/dashboard" class="brand-link">
            <img src="/logo.svg" alt="Interseguro" class="brand-logo" />
            <div class="brand-divider" aria-hidden="true"></div>
            <div class="brand-text">
              <span class="brand-name">PPTO</span>
              <span class="brand-tagline">Portal Proveedores</span>
            </div>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="header-nav">
          <router-link
            to="/admin/dashboard"
            class="nav-link"
            active-class="nav-link--active"
          >
            <AppIcon name="dashboard" class="nav-icon" :size="18" />
            <span>Dashboard</span>
          </router-link>
          <router-link
            to="/admin/providers"
            class="nav-link"
            active-class="nav-link--active"
          >
            <AppIcon name="providers" class="nav-icon" :size="18" />
            <span>Proveedores</span>
          </router-link>
          <router-link
            to="/admin/purchase-orders"
            class="nav-link"
            active-class="nav-link--active"
          >
            <AppIcon name="purchase-orders" class="nav-icon" :size="18" />
            <span>Órdenes</span>
          </router-link>
        </nav>

        <!-- User Actions -->
        <div class="header-actions">
          <div class="user-menu">
            <div class="user-avatar">
              <AppIcon name="provider" :size="18" />
            </div>
            <div class="user-info">
              <span class="user-name">Admin</span>
              <span class="user-role">Sistema</span>
            </div>
          </div>
          <router-link to="/admin/login" class="btn btn-ghost logout-btn">
            <AppIcon name="logout" :size="16" />
            <span>Salir</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Títulos y descripciones viven en cada vista (AppPageHeader o bloque propio).
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-app-background);
}

/* ===== HEADER ===== */
.admin-header {
  position: sticky;
  top: 0;
  z-index: var(--z-fixed);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
}

/* Brand */
.header-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-logo {
  height: 36px;
  width: auto;
  max-width: 180px;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-divider {
  width: 1px;
  height: 2rem;
  background: var(--color-border-primary);
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.brand-name {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.brand-tagline {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  line-height: var(--leading-tight);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Navigation */
.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: var(--color-text-primary);
  background: var(--color-gray-100);
}

.nav-link--active {
  color: var(--color-primary);
  background: var(--color-primary-50);
}

.nav-link--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.nav-icon {
  font-size: var(--text-base);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-shrink: 0;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-gray-50);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-menu:hover {
  background: var(--color-gray-100);
  border-color: var(--color-border-secondary);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-tight);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  text-decoration: none;
  box-shadow: none;
}

.logout-btn:hover {
  color: var(--color-error);
  background: var(--color-error-50);
  border-color: var(--color-error-200);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-container {
  max-width: var(--layout-max-width);
  width: 100%;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 var(--space-4);
    gap: var(--space-4);
  }
  
  .content-container {
    padding: var(--space-6) var(--space-4);
  }
}

@media (max-width: 768px) {
  .header-container {
    height: auto;
    padding: var(--space-4);
    flex-wrap: wrap;
  }
  
  .header-brand {
    width: 100%;
    margin-bottom: var(--space-4);
  }
  
  .header-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: var(--space-4);
  }
  
  .nav-link {
    padding: var(--space-2) var(--space-3);
  }
  
  .nav-link span {
    display: none;
  }
  
  .user-info {
    display: none;
  }
  
  .logout-btn span {
    display: none;
  }
  
  .content-container {
    padding: var(--space-4);
  }
}

@media (max-width: 480px) {
  .brand-logo {
    height: 28px;
    max-width: 140px;
  }

  .brand-name {
    font-size: var(--text-lg);
  }
  
  .brand-tagline {
    font-size: 0.625rem;
  }
}
</style>

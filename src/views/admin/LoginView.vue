<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToDashboard = () => {
  router.push('/admin/dashboard');
};
</script>

<template>
  <div class="auth-screen">
    <div class="auth-background" aria-hidden="true"></div>
    <div class="auth-container">
      <div class="auth-card" role="main">
        <!-- Logo -->
        <div class="auth-logo">
          <div class="logo-icon">
            <AppIcon name="briefcase" :size="22" />
          </div>
          <div class="logo-text">
            <span class="logo-name">PPTO</span>
            <span class="logo-tagline">Portal Proveedores</span>
          </div>
        </div>

        <!-- Header -->
        <div class="auth-header">
          <h1 class="auth-title">Bienvenido</h1>
          <p class="auth-subtitle">Sistema de gestión de proveedores y órdenes de compra</p>
        </div>

        <!-- Notice -->
        <div class="auth-notice" role="status">
          <div class="notice-icon">
            <AppIcon name="detail" :size="18" />
          </div>
          <div class="notice-content">
            <h3 class="notice-title">Entorno de Demostración</h3>
            <p class="notice-description">
              El inicio de sesión corporativo no está activado en esta fase. El acceso es solo para probar el flujo completo con proveedores.
            </p>
          </div>
        </div>

        <!-- Action -->
        <button class="btn btn-primary auth-button" @click="goToDashboard">
          <span>Continuar al Panel</span>
          <AppIcon name="continue" :size="18" />
        </button>

        <!-- Footer -->
        <p class="auth-footer">
          <AppIcon name="validation" :size="16" />
          <span>Conexión segura. Si detecta algún comportamiento inesperado, repórtelo a TI.</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-screen {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-app-background);
  overflow: hidden;
}

.auth-background {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15), transparent 55%),
    radial-gradient(ellipse 60% 40% at 100% 20%, rgba(14, 165, 233, 0.12), transparent 50%),
    radial-gradient(ellipse 50% 35% at 0% 80%, rgba(99, 102, 241, 0.1), transparent 45%);
  pointer-events: none;
}

.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 28rem;
}

.auth-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  padding: var(--space-10) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Logo */
.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-2);
}

.logo-icon {
  width: 3.5rem;
  height: 3.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.logo-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.logo-tagline {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  line-height: var(--leading-tight);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Header */
.auth-header {
  text-align: center;
}

.auth-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  letter-spacing: -0.025em;
  margin: 0 0 var(--space-3) 0;
}

.auth-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin: 0;
}

/* Notice */
.auth-notice {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-100);
  border-radius: var(--radius-xl);
  align-items: flex-start;
}

.notice-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-900);
  line-height: var(--leading-tight);
  margin: 0 0 var(--space-2) 0;
}

.notice-description {
  font-size: var(--text-sm);
  color: var(--color-primary-700);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Button */
.auth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4) var(--space-6);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.auth-button:active {
  transform: translateY(0);
}

/* Footer */
.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  line-height: var(--leading-relaxed);
  text-align: center;
  margin: 0;
}

.auth-footer .app-icon {
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    padding: var(--space-8) var(--space-6);
  }
  
  .auth-title {
    font-size: var(--text-2xl);
  }
  
  .logo-icon {
    width: 3rem;
    height: 3rem;
    font-size: var(--text-lg);
  }
  
  .logo-name {
    font-size: var(--text-xl);
  }
}

@media (max-width: 480px) {
  .auth-screen {
    padding: var(--space-4);
  }
  
  .auth-card {
    padding: var(--space-6) var(--space-5);
  }
  
  .auth-logo {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .logo-text {
    align-items: center;
  }
  
  .auth-notice {
    flex-direction: column;
    text-align: center;
  }
  
  .notice-icon {
    margin: 0 auto;
  }
}
</style>

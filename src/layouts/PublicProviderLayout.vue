<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

/**
 * Activa el modo fullscreen solo para la ruta del portal de proveedores.
 * Esto evita que el max-width del layout rompa el split-screen.
 */
const isPortalRoute = computed(() => route.name === 'provider-portal');
</script>

<template>
  <div class="public-app" :class="{ 'public-app--fullscreen': isPortalRoute }">
    <header class="public-app__bar" role="banner">
      <div class="public-app__bar-inner">
        <div class="public-brand">
          <img src="/logo.svg" alt="Interseguro" class="public-brand__logo" />
          <div class="public-brand__divider" aria-hidden="true"></div>
          <div class="public-brand__text">
            <span class="public-brand__name">PPTO</span>
            <span class="public-brand__tagline">Portal Proveedores</span>
          </div>
        </div>
        <div class="public-header__right">
          <span class="public-header__secure-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Canal seguro
          </span>
        </div>
      </div>
    </header>

    <main class="public-app__main">
      <RouterView />
    </main>

    <footer v-if="!isPortalRoute" class="public-app__footer">
      <p class="public-app__footer-text">
        Conexión cifrada. Sólo utilice el enlace enviado por su contacto comercial.
        Si el enlace venció, solicite uno nuevo a la compañía.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.public-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-app-background);
  color: var(--color-text-primary);
  overflow: hidden;
}

/* ===== HEADER ===== */
.public-app__bar {
  border-bottom: 1px solid rgba(8, 85, 200, 0.12);
  background: #ffffff;
  box-shadow: 0 1px 0 rgba(8, 85, 200, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  flex-shrink: 0;
}

.public-app__bar-inner {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.public-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.public-brand__logo {
  height: 32px;
  width: auto;
  max-width: 160px;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.public-brand__divider {
  width: 1px;
  height: 1.75rem;
  background: linear-gradient(to bottom, transparent, rgba(8, 85, 200, 0.25), transparent);
  flex-shrink: 0;
}

.public-brand__text {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
}

.public-brand__name {
  font-size: var(--text-base);
  font-weight: var(--font-weight-bold);
  color: #0855c8;
  line-height: var(--leading-tight);
  letter-spacing: -0.01em;
}

.public-brand__tagline {
  font-size: 0.6875rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  line-height: var(--leading-tight);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.public-header__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.public-header__secure-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--text-xs);
  color: #0855c8;
  font-weight: var(--font-weight-semibold);
  background: rgba(8, 85, 200, 0.07);
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
}

/* ===== MAIN CONTENT ===== */
.public-app__main {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--space-6) var(--space-5) var(--space-10);
}

/* Fullscreen: el main cede todo el espacio disponible sin padding */
.public-app--fullscreen .public-app__main {
  max-width: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* ===== FOOTER ===== */
.public-app__footer {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--space-4) var(--space-5) var(--space-8);
}

.public-app__footer-text {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-relaxed);
  text-align: center;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .public-app__bar-inner {
    padding: 0 var(--space-4);
    height: 3.25rem;
  }

  .public-brand__logo {
    height: 26px;
    max-width: 130px;
  }

  .public-header__secure-badge {
    font-size: 0;
    gap: 0;
    padding: 0.3rem 0.5rem;
  }

  .public-header__secure-badge svg {
    font-size: initial;
  }
}
</style>

<template>
  <div class="public-app">
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
        <span class="public-header__label">Canal seguro para proveedores</span>
      </div>
    </header>

    <main class="public-app__main">
      <RouterView />
    </main>

    <footer class="public-app__footer">
      <p class="public-app__footer-text">
        Conexión cifrada. Sólo utilice el enlace enviado por su contacto comercial. Si el enlace
        venció, solicite uno nuevo a la compañía.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.public-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-app-background);
  color: var(--color-text-primary);
}

.public-app__bar {
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.public-app__bar-inner {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 4.5rem;
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
  height: 36px;
  width: auto;
  max-width: 180px;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.public-brand__divider {
  width: 1px;
  height: 2rem;
  background: var(--color-border-primary);
  flex-shrink: 0;
}

.public-brand__text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.public-brand__name {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.public-brand__tagline {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  line-height: var(--leading-tight);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.public-header__label {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  flex-shrink: 0;
}

.public-app__main {
  flex: 1;
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-5) var(--space-10);
}

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

@media (max-width: 768px) {
  .public-app__bar-inner {
    padding: 0 var(--space-4);
    height: 3.5rem;
  }

  .public-brand__logo {
    height: 28px;
    max-width: 140px;
  }

  .public-header__label {
    display: none;
  }
}
</style>

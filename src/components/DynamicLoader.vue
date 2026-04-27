<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { PROCESSING_MESSAGES } from '@/types';

const currentMessage = ref(PROCESSING_MESSAGES[0].text);
const progressValue = ref(0);
const messageOpacity = ref(1);
let msgInterval: number | null = null;
let progInterval: number | null = null;
let msgIndex = 0;

const startMessageRotation = () => {
  msgInterval = window.setInterval(() => {
    messageOpacity.value = 0;
    setTimeout(() => {
      msgIndex = (msgIndex + 1) % PROCESSING_MESSAGES.length;
      currentMessage.value = PROCESSING_MESSAGES[msgIndex].text;
      messageOpacity.value = 1;
    }, 300);
  }, 2000);
};

const startProgress = () => {
  progInterval = window.setInterval(() => {
    if (progressValue.value < 75) progressValue.value += 8;
    else if (progressValue.value < 90) progressValue.value += 2;
    else if (progressValue.value < 98) progressValue.value += 0.5;
  }, 500);
};

const stopAll = () => {
  if (msgInterval) { clearInterval(msgInterval); msgInterval = null; }
  if (progInterval) { clearInterval(progInterval); progInterval = null; }
};

const completeProgress = () => { stopAll(); progressValue.value = 100; };
const reset = () => { stopAll(); currentMessage.value = PROCESSING_MESSAGES[0].text; progressValue.value = 0; messageOpacity.value = 1; msgIndex = 0; };

onMounted(() => { startMessageRotation(); startProgress(); });
onUnmounted(() => stopAll());
defineExpose({ completeProgress, reset });
</script>

<template>
  <div class="dl">
    <div class="dl__card">
      <!-- Dual ring spinner -->
      <div class="dl__spinner">
        <div class="dl__ring dl__ring--outer"></div>
        <div class="dl__ring dl__ring--inner"></div>
        <div class="dl__ring-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#dlGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            <defs><linearGradient id="dlGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0855c8"/><stop offset="100%" stop-color="#04aeea"/></linearGradient></defs>
          </svg>
        </div>
      </div>

      <!-- Rotating message with fade -->
      <div class="dl__msg-wrap">
        <p class="dl__msg" :style="{ opacity: messageOpacity, transform: messageOpacity === 1 ? 'translateY(0)' : 'translateY(6px)' }">
          {{ currentMessage }}
        </p>
      </div>

      <!-- Progress bar -->
      <div class="dl__prog-wrap">
        <div class="dl__prog-track">
          <div class="dl__prog-fill" :style="{ width: progressValue + '%' }"></div>
        </div>
        <span class="dl__prog-pct">{{ Math.round(progressValue) }}%</span>
      </div>

      <p class="dl__warn">⚠ No cierre esta pestaña</p>
      <p class="dl__sub">Almacenando documentos en Google Drive · Esto puede tomar hasta 15 segundos</p>

      <!-- Animated dots -->
      <div class="dl__dots">
        <span class="dl__dot" style="animation-delay:0s"></span>
        <span class="dl__dot" style="animation-delay:0.2s"></span>
        <span class="dl__dot" style="animation-delay:0.4s"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dl {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 50% 30%, rgba(8,85,200,0.06) 0%, transparent 70%);
}

.dl__card {
  display: flex; flex-direction: column; align-items: center; gap: 1.25rem;
  text-align: center; padding: 3rem 2.5rem; max-width: 400px; width: 100%;
  background: #fff; border-radius: 24px;
  box-shadow: 0 20px 60px rgba(8,85,200,0.12), 0 4px 16px rgba(0,0,0,0.06);
  border: 1px solid rgba(8,85,200,0.1);
}

/* Dual ring spinner */
.dl__spinner { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.dl__ring { position: absolute; border-radius: 50%; border-style: solid; border-color: transparent; }
.dl__ring--outer { inset: 0; border-width: 3px; border-top-color: #0855c8; animation: spin 1.1s linear infinite; }
.dl__ring--inner { inset: 12px; border-width: 2.5px; border-bottom-color: #04aeea; animation: spin 0.75s linear infinite reverse; }
.dl__ring-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Message */
.dl__msg-wrap { min-height: 1.5rem; }
.dl__msg { font-size: 1rem; font-weight: 600; color: #111827; margin: 0; transition: opacity 0.3s ease, transform 0.3s ease; }

/* Progress */
.dl__prog-wrap { width: 100%; display: flex; align-items: center; gap: 0.75rem; }
.dl__prog-track { flex: 1; height: 8px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
.dl__prog-fill {
  height: 100%; border-radius: 99px; transition: width 0.5s ease;
  background: #0855c8;
}
.dl__prog-pct { font-size: 0.8rem; font-weight: 700; color: #0855c8; min-width: 36px; text-align: right; }

.dl__warn { font-size: 0.85rem; font-weight: 700; color: #374151; margin: 0; }
.dl__sub { font-size: 0.78rem; color: #9ca3af; margin: 0; line-height: 1.5; max-width: 280px; }

/* Dots */
.dl__dots { display: flex; gap: 0.375rem; }
.dl__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #0855c8;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
</style>

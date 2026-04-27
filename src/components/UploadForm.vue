<script setup lang="ts">
import { ref, computed } from 'vue';
import { MAX_FILE_SIZE, VALIDATION_CONFIGS, ADDITIONAL_MIME_TYPES, ADDITIONAL_EXTENSIONS, MAX_ADDITIONAL_FILES } from '@/types';
import type { FileState, FileValidationConfig, ValidationResult } from '@/types';

const emit = defineEmits<{ submit: [formData: FormData] }>();

const emisionSunat = ref<boolean | null>(null);
const facturaPdf = ref<FileState>({ file: null, validation: { valid: true } });
const facturaXml = ref<FileState>({ file: null, validation: { valid: true } });
const cdrXml = ref<FileState>({ file: null, validation: { valid: true } });
const adicionales = ref<FileState[]>([]);
const isSubmitting = ref(false);
const dragOver = ref<string | null>(null);

const validateFile = (file: File, config: FileValidationConfig): ValidationResult => {
  if (file.size > MAX_FILE_SIZE) return { valid: false, error: `Excede 15 MB (${(file.size/1024/1024).toFixed(1)} MB)` };
  if (!config.allowedMimes.includes(file.type)) return { valid: false, error: `Tipo no permitido. Esperado: ${config.allowedMimes.join(', ')}` };
  return { valid: true };
};

const validateAdditional = (file: File): ValidationResult => {
  if (file.size > MAX_FILE_SIZE) return { valid: false, error: `Excede 15 MB` };
  const all = Object.values(ADDITIONAL_MIME_TYPES).flat();
  if (!all.includes(file.type as any)) return { valid: false, error: `Tipo no permitido` };
  return { valid: true };
};

// FIX: keys corregidas a factura_xml, factura_pdf, cdr_xml
const handleFileSelect = (file: File | null, field: 'factura_xml' | 'factura_pdf' | 'cdr_xml') => {
  if (!file) return;
  const config = VALIDATION_CONFIGS[field];
  const validation = validateFile(file, config);
  if (field === 'factura_xml') facturaXml.value = { file, validation };
  else if (field === 'factura_pdf') facturaPdf.value = { file, validation };
  else cdrXml.value = { file, validation };
};

const handleInputChange = (e: Event, field: 'factura_xml' | 'factura_pdf' | 'cdr_xml') => {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
  handleFileSelect(f, field);
  (e.target as HTMLInputElement).value = '';
};

const handleDrop = (e: DragEvent, field: 'factura_xml' | 'factura_pdf' | 'cdr_xml') => {
  dragOver.value = null;
  const f = e.dataTransfer?.files?.[0] ?? null;
  handleFileSelect(f, field);
};

const handleAdditionalDrop = (e: DragEvent) => {
  dragOver.value = null;
  const files = Array.from(e.dataTransfer?.files ?? []);
  for (const f of files) {
    if (adicionales.value.length >= MAX_ADDITIONAL_FILES) break;
    adicionales.value.push({ file: f, validation: validateAdditional(f) });
  }
};

const handleAdditionalInput = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  for (const f of files) {
    if (adicionales.value.length >= MAX_ADDITIONAL_FILES) break;
    adicionales.value.push({ file: f, validation: validateAdditional(f) });
  }
  (e.target as HTMLInputElement).value = '';
};

const clearFile = (field: 'factura_xml' | 'factura_pdf' | 'cdr_xml') => {
  if (field === 'factura_pdf') facturaPdf.value = { file: null, validation: { valid: true } };
  else if (field === 'factura_xml') facturaXml.value = { file: null, validation: { valid: true } };
  else cdrXml.value = { file: null, validation: { valid: true } };
};

const removeAdditional = (i: number) => adicionales.value.splice(i, 1);

const isFormValid = computed(() => {
  if (emisionSunat.value === null) return false;
  if (!facturaPdf.value.file || !facturaXml.value.file) return false;
  if (!facturaPdf.value.validation.valid || !facturaXml.value.validation.valid) return false;
  // CDR es opcional — si se adjunta, debe ser válido
  if (cdrXml.value.file && !cdrXml.value.validation.valid) return false;
  if (adicionales.value.some(a => !a.validation.valid)) return false;
  return true;
});

const handleSubmit = () => {
  if (!isFormValid.value || isSubmitting.value) return;
  isSubmitting.value = true;
  const fd = new FormData();
  if (facturaPdf.value.file) fd.append('factura_pdf', facturaPdf.value.file);
  if (facturaXml.value.file) fd.append('factura_xml', facturaXml.value.file);
  fd.append('emision_sunat', emisionSunat.value ? 'true' : 'false');
  // CDR es opcional: se envía si existe, independientemente de emision_sunat
  if (cdrXml.value.file) fd.append('cdr_xml', cdrXml.value.file);
  adicionales.value.forEach((a, i) => { if (a.file) fd.append(`adicional_${i + 1}`, a.file); });
  emit('submit', fd);
  isSubmitting.value = false;
};

const fmt = (b: number) => b < 1048576 ? `${(b/1024).toFixed(0)} KB` : `${(b/1048576).toFixed(1)} MB`;
const extIcon = (name: string) => name.endsWith('.pdf') ? '📄' : name.endsWith('.xml') ? '📋' : name.match(/\.(jpg|jpeg|png)$/) ? '🖼️' : '📎';
</script>

<template>
  <div class="uf">
    <div class="uf__head">
      <div class="uf__head-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
      <div class="uf__head-text">
        <h2 class="uf__title">Cargar Documentación</h2>
        <p class="uf__sub">Complete los campos requeridos para enviar su comprobante</p>
      </div>
      <button
        type="button"
        class="uf__head-submit"
        :class="{ 'uf__head-submit--disabled': !isFormValid || isSubmitting }"
        :disabled="!isFormValid || isSubmitting"
        @click="handleSubmit"
        title="Enviar Documentación"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Enviar
      </button>
    </div>

    <!-- SUNAT Switch -->
    <div class="uf__section uf__section--sunat">
      <div class="uf__section-header">
        <span class="uf__section-num">1</span>
        <div>
          <h3 class="uf__section-title">Emisión SUNAT</h3>
          <p class="uf__section-desc">¿Esta factura fue emitida desde el portal de SUNAT?</p>
        </div>
      </div>
      <div class="uf__toggle">
        <button type="button" class="uf__toggle-opt" :class="{ active: emisionSunat === false }" @click="emisionSunat = false">
          <span class="uf__toggle-dot"></span>NO
        </button>
        <button type="button" class="uf__toggle-opt" :class="{ active: emisionSunat === true }" @click="emisionSunat = true">
          <span class="uf__toggle-dot"></span>SÍ
        </button>
      </div>
      <p v-if="emisionSunat === true" class="uf__hint uf__hint--ok">✓ Sin CDR requerido — SUNAT lo gestiona automáticamente</p>
      <p v-else-if="emisionSunat === false" class="uf__hint uf__hint--info">ℹ Puede adjuntar su CDR (PDF o XML) si lo tiene disponible. De lo contrario, nuestro equipo lo gestionará automáticamente.</p>
      <p v-else class="uf__hint uf__hint--req">Seleccione una opción para continuar</p>
    </div>

    <!-- Documentos Obligatorios -->
    <div class="uf__section">
      <div class="uf__section-header">
        <span class="uf__section-num">2</span>
        <div><h3 class="uf__section-title">Documentos Obligatorios</h3></div>
      </div>

      <!-- PDF -->
      <div class="uf__field">
        <label class="uf__label">Factura PDF <span class="uf__req">*</span></label>
        <label
          class="uf__drop"
          :class="{ 'uf__drop--over': dragOver === 'pdf', 'uf__drop--loaded': facturaPdf.file && facturaPdf.validation.valid, 'uf__drop--error': facturaPdf.file && !facturaPdf.validation.valid }"
          @dragover.prevent="dragOver = 'pdf'"
          @dragleave="dragOver = null"
          @drop.prevent="handleDrop($event, 'factura_pdf')"
        >
          <input type="file" accept=".pdf,application/pdf" class="uf__input-hidden" @change="handleInputChange($event, 'factura_pdf')" :disabled="isSubmitting" />
          <template v-if="!facturaPdf.file">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="uf__drop-text">Arrastra tu PDF aquí o <strong>haz clic</strong></span>
            <span class="uf__drop-hint">PDF · máx. 15 MB</span>
          </template>
          <template v-else>
            <span class="uf__file-icon">{{ extIcon(facturaPdf.file.name) }}</span>
            <span class="uf__file-name">{{ facturaPdf.file.name }}</span>
            <span class="uf__file-size">{{ fmt(facturaPdf.file.size) }}</span>
            <button type="button" class="uf__clear-btn" @click.prevent="clearFile('factura_pdf')" :disabled="isSubmitting">✕</button>
          </template>
        </label>
        <p v-if="facturaPdf.validation.error" class="uf__error">{{ facturaPdf.validation.error }}</p>
      </div>

      <!-- XML -->
      <div class="uf__field">
        <label class="uf__label">Factura XML <span class="uf__req">*</span></label>
        <label
          class="uf__drop"
          :class="{ 'uf__drop--over': dragOver === 'xml', 'uf__drop--loaded': facturaXml.file && facturaXml.validation.valid, 'uf__drop--error': facturaXml.file && !facturaXml.validation.valid }"
          @dragover.prevent="dragOver = 'xml'"
          @dragleave="dragOver = null"
          @drop.prevent="handleDrop($event, 'factura_xml')"
        >
          <input type="file" accept=".xml,application/xml,text/xml" class="uf__input-hidden" @change="handleInputChange($event, 'factura_xml')" :disabled="isSubmitting" />
          <template v-if="!facturaXml.file">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span class="uf__drop-text">Arrastra tu XML aquí o <strong>haz clic</strong></span>
            <span class="uf__drop-hint">XML · máx. 15 MB</span>
          </template>
          <template v-else>
            <span class="uf__file-icon">📋</span>
            <span class="uf__file-name">{{ facturaXml.file.name }}</span>
            <span class="uf__file-size">{{ fmt(facturaXml.file.size) }}</span>
            <button type="button" class="uf__clear-btn" @click.prevent="clearFile('factura_xml')" :disabled="isSubmitting">✕</button>
          </template>
        </label>
        <p v-if="facturaXml.validation.error" class="uf__error">{{ facturaXml.validation.error }}</p>
      </div>

      <!-- CDR (opcional si no es SUNAT) -->
      <Transition name="uf-fade">
        <div v-if="emisionSunat === false" class="uf__field">
          <label class="uf__label">CDR <span class="uf__opt-tag">Opcional · PDF o XML</span></label>
          <label
            class="uf__drop"
            :class="{ 'uf__drop--over': dragOver === 'cdr', 'uf__drop--loaded': cdrXml.file && cdrXml.validation.valid, 'uf__drop--error': cdrXml.file && !cdrXml.validation.valid }"
            @dragover.prevent="dragOver = 'cdr'"
            @dragleave="dragOver = null"
            @drop.prevent="handleDrop($event, 'cdr_xml')"
          >
            <input type="file" accept=".xml,.pdf,application/xml,text/xml,application/pdf" class="uf__input-hidden" @change="handleInputChange($event, 'cdr_xml')" :disabled="isSubmitting" />
            <template v-if="!cdrXml.file">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span class="uf__drop-text">CDR aquí o <strong>haz clic</strong></span>
              <span class="uf__drop-hint">XML · máx. 15 MB</span>
            </template>
            <template v-else>
              <span class="uf__file-icon">🛡️</span>
              <span class="uf__file-name">{{ cdrXml.file.name }}</span>
              <span class="uf__file-size">{{ fmt(cdrXml.file.size) }}</span>
            </template>
          </label>
          <p v-if="cdrXml.validation.error" class="uf__error">{{ cdrXml.validation.error }}</p>
        </div>
      </Transition>
    </div>

    <!-- Adicionales -->
    <div class="uf__section">
      <div class="uf__section-header">
        <span class="uf__section-num uf__section-num--opt">3</span>
        <div>
          <h3 class="uf__section-title">Documentos Adicionales <span class="uf__opt-tag">Opcional</span></h3>
          <p class="uf__section-desc">Guías, anexos, fotos · Máx. {{ MAX_ADDITIONAL_FILES }} archivos · PDF, XML, JPG, PNG, XLSX, DOCX</p>
        </div>
      </div>
      <label v-if="adicionales.length < MAX_ADDITIONAL_FILES"
        class="uf__drop uf__drop--sm"
        :class="{ 'uf__drop--over': dragOver === 'add' }"
        @dragover.prevent="dragOver = 'add'"
        @dragleave="dragOver = null"
        @drop.prevent="handleAdditionalDrop"
      >
        <input type="file" :accept="ADDITIONAL_EXTENSIONS.join(',')" multiple class="uf__input-hidden" @change="handleAdditionalInput" :disabled="isSubmitting" />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>Agregar archivo ({{ adicionales.length }}/{{ MAX_ADDITIONAL_FILES }})</span>
      </label>
      <div v-for="(item, i) in adicionales" :key="i" class="uf__add-item" :class="{ 'uf__add-item--error': !item.validation.valid }">
        <span class="uf__file-icon">{{ extIcon(item.file?.name ?? '') }}</span>
        <span class="uf__file-name">{{ item.file?.name }}</span>
        <span class="uf__file-size">{{ fmt(item.file?.size ?? 0) }}</span>
        <button type="button" class="uf__rm-btn" @click="removeAdditional(i)" :disabled="isSubmitting">✕</button>
        <p v-if="!item.validation.valid" class="uf__error uf__error--block">{{ item.validation.error }}</p>
      </div>
    </div>

    <!-- Submit -->
    <div class="uf__footer">
      <div v-if="!isFormValid" class="uf__footer-hint">
        <span v-if="emisionSunat === null">Seleccione la opción SUNAT para continuar</span>
        <span v-else-if="!facturaPdf.file || !facturaXml.file">Adjunte la Factura PDF y XML</span>
        <span v-else-if="emisionSunat === false && !cdrXml.file">Adjunte el CDR XML</span>
        <span v-else>Corrija los errores antes de enviar</span>
      </div>
      <button type="button" class="uf__submit" :class="{ 'uf__submit--disabled': !isFormValid || isSubmitting }" :disabled="!isFormValid || isSubmitting" @click="handleSubmit">
        <svg v-if="!isSubmitting" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>{{ isSubmitting ? 'Enviando...' : 'Enviar Documentación' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.uf { display: flex; flex-direction: column; gap: 0; height: 100%; }

.uf__head { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(8,85,200,0.1); }
.uf__head-icon { width: 40px; height: 40px; border-radius: 10px; background: #0855c8; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
.uf__head-text { flex: 1; min-width: 0; }
.uf__title { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
.uf__sub { font-size: 0.78rem; color: #6b7280; margin: 0; }
.uf__head-submit {
  display: inline-flex; align-items: center; gap: 0.4rem; flex-shrink: 0;
  padding: 0.5rem 1rem; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; background: #0855c8; color: #fff;
  box-shadow: 0 2px 6px rgba(8,85,200,0.22); transition: all 0.18s;
}
.uf__head-submit:hover:not(:disabled) { background: #0647a6; transform: translateY(-1px); }
.uf__head-submit--disabled { background: #e5e7eb !important; color: #9ca3af !important; box-shadow: none !important; cursor: not-allowed; transform: none !important; }

.uf__section { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(8,85,200,0.08); display: flex; flex-direction: column; gap: 0.875rem; }
.uf__section--sunat { background: linear-gradient(135deg,rgba(8,85,200,0.03),rgba(4,174,234,0.03)); }

.uf__section-header { display: flex; align-items: flex-start; gap: 0.75rem; }
.uf__section-num { width: 24px; height: 24px; border-radius: 50%; background: #0855c8; color: #fff; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.uf__section-num--opt { background: #e5e7eb; color: #6b7280; }
.uf__section-title { font-size: 0.9rem; font-weight: 700; color: #111827; margin: 0 0 0.125rem 0; display: flex; align-items: center; gap: 0.5rem; }
.uf__section-desc { font-size: 0.78rem; color: #9ca3af; margin: 0; }
.uf__opt-tag { font-size: 0.68rem; font-weight: 500; background: #f3f4f6; color: #9ca3af; padding: 0.125rem 0.5rem; border-radius: 99px; }

.uf__toggle { display: flex; gap: 0.625rem; }
.uf__toggle-opt {
  flex: 1; display: flex; align-items: center; gap: 0.5rem; justify-content: center;
  padding: 0.625rem 1rem; border: 1.5px solid #e5e7eb; background: #fff;
  border-radius: 10px; font-size: 0.85rem; font-weight: 600; color: #6b7280;
  cursor: pointer; transition: all 0.18s;
}
.uf__toggle-opt.active { border-color: #0855c8; background: rgba(8,85,200,0.07); color: #0855c8; }
.uf__toggle-dot { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid currentColor; }
.uf__toggle-opt.active .uf__toggle-dot { background: currentColor; }

.uf__hint { font-size: 0.78rem; margin: 0; line-height: 1.5; }
.uf__hint--ok { color: #10b981; }
.uf__hint--warn { color: #f59e0b; }
.uf__hint--info { color: #0855c8; background: rgba(8,85,200,0.06); padding: 0.5rem 0.75rem; border-radius: 8px; border-left: 3px solid #0855c8; }
.uf__hint--req { color: #ef4444; }

.uf__field { display: flex; flex-direction: column; gap: 0.375rem; }
.uf__label { font-size: 0.8rem; font-weight: 600; color: #374151; }
.uf__req { color: #ef4444; }

.uf__input-hidden { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

.uf__drop {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.375rem; padding: 1.5rem 1rem; border: 1.5px dashed #d1d5db; border-radius: 12px;
  background: #fafafa; cursor: pointer; transition: all 0.18s; text-align: center; color: #9ca3af; min-height: 90px;
}
.uf__drop:hover, .uf__drop--over { border-color: #0855c8; background: rgba(8,85,200,0.03); color: #0855c8; }
.uf__drop--loaded { border-color: #10b981; border-style: solid; background: rgba(16,185,129,0.04); color: #374151; flex-direction: row; padding: 0.875rem 1rem; min-height: auto; gap: 0.5rem; }
.uf__drop--error { border-color: #ef4444; border-style: solid; background: rgba(239,68,68,0.04); }
.uf__drop--sm { min-height: 52px; padding: 0.75rem 1rem; flex-direction: row; gap: 0.5rem; font-size: 0.82rem; }

.uf__drop-text { font-size: 0.82rem; color: #6b7280; }
.uf__drop-text strong { color: #0855c8; }
.uf__drop-hint { font-size: 0.72rem; color: #9ca3af; }

.uf__file-icon { font-size: 1.1rem; flex-shrink: 0; }
.uf__file-name { font-size: 0.8rem; font-weight: 500; color: #374151; flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uf__file-size { font-size: 0.72rem; color: #9ca3af; flex-shrink: 0; }
.uf__clear-btn {
  width: 24px; height: 24px; border-radius: 6px; border: 1px solid #fca5a5;
  background: #fff5f5; color: #ef4444; cursor: pointer; font-size: 0.7rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all 0.15s; margin-left: auto;
}
.uf__clear-btn:hover { background: #fee2e2; }

.uf__error { font-size: 0.75rem; color: #ef4444; margin: 0; }
.uf__error--block { width: 100%; margin-top: 0.25rem; }

.uf__add-item {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 0.875rem;
  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; flex-wrap: wrap;
}
.uf__add-item--error { border-color: #fca5a5; background: #fff5f5; }
.uf__rm-btn { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; color: #9ca3af; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
.uf__rm-btn:hover { border-color: #ef4444; color: #ef4444; }

.uf__footer { padding: 1.25rem 1.5rem; border-top: 1px solid rgba(8,85,200,0.1); background: #fff; display: flex; flex-direction: column; gap: 0.625rem; }
.uf__footer-hint { font-size: 0.78rem; color: #9ca3af; text-align: center; }
.uf__submit {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.9rem; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 700;
  cursor: pointer; background: #0855c8; color: #fff;
  box-shadow: 0 2px 8px rgba(8,85,200,0.25); transition: all 0.18s;
}
.uf__submit:hover:not(:disabled) { background: #0647a6; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(8,85,200,0.3); }
.uf__submit--disabled { background: #e5e7eb; color: #9ca3af; box-shadow: none; cursor: not-allowed; }

.uf-fade-enter-active, .uf-fade-leave-active { transition: all 0.25s ease; }
.uf-fade-enter-from, .uf-fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>

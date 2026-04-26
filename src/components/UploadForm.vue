<script setup lang="ts">
/**
 * Componente UploadForm
 * Motor de validación Zero Trust para carga de archivos
 * 
 * Este componente implementa:
 * - Switch SUNAT con lógica condicional para CDR (Directriz 1)
 * - Validación MIME y tamaño (15MB) en tiempo real (Directriz 4)
 * - Feedback inmediato de errores
 * - Emite FormData al padre sin llamar servicios directamente
 */

import { ref, computed } from 'vue';
import type {
  FileState,
  ValidationResult,
  FileValidationConfig,
} from '@/types';
import {
  MAX_FILE_SIZE,
  VALIDATION_CONFIGS,
  ADDITIONAL_MIME_TYPES,
  ADDITIONAL_EXTENSIONS,
  MAX_ADDITIONAL_FILES,
} from '@/types';

// ============================================================================
// EMITS
// ============================================================================

const emit = defineEmits<{
  submit: [formData: FormData];
}>();

// ============================================================================
// ESTADO DEL FORMULARIO
// ============================================================================

/** Switch SUNAT: undefined | true | false */
const emisionSunat = ref<boolean | null>(null);

/** Estado del archivo XML */
const facturaXml = ref<FileState>({
  file: null,
  validation: { valid: true },
});

/** Estado del archivo PDF */
const facturaPdf = ref<FileState>({
  file: null,
  validation: { valid: true },
});

/** Estado del archivo CDR */
const cdrXml = ref<FileState>({
  file: null,
  validation: { valid: true },
});

/** Archivos adicionales */
const adicionales = ref<FileState[]>([]);

/** Indica si el formulario está siendo enviado */
const isSubmitting = ref(false);

// ============================================================================
// VALIDACIÓN DE ARCHIVOS (ZERO TRUST)
// ============================================================================

/**
 * Valida un archivo según su configuración
 * No confía en la extensión, valida MIME type real
 */
const validateFile = (
  file: File,
  config: FileValidationConfig
): ValidationResult => {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `El archivo excede el límite de 15MB (${sizeMB}MB)`,
    };
  }

  // Validar MIME type
  if (!config.allowedMimes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Se esperaba: ${config.allowedMimes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Valida un archivo adicional según los tipos permitidos
 */
const validateAdditionalFile = (file: File): ValidationResult => {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `El archivo excede el límite de 15MB (${sizeMB}MB)`,
    };
  }

  // Validar MIME type (todos los MIME types permitidos para adicionales)
  const allAllowedMimes = Object.values(ADDITIONAL_MIME_TYPES).flat();
  if (!allAllowedMimes.includes(file.type as any)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Solo: ${ADDITIONAL_EXTENSIONS.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Maneja la selección de un archivo obligatorio
 */
const handleFileSelect = (
  event: Event,
  field: 'facturaXml' | 'facturaPdf' | 'cdrXml'
) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const config = VALIDATION_CONFIGS[field];
  const validation = validateFile(file, config);

  if (field === 'facturaXml') {
    facturaXml.value = { file, validation };
  } else if (field === 'facturaPdf') {
    facturaPdf.value = { file, validation };
  } else if (field === 'cdrXml') {
    cdrXml.value = { file, validation };
  }

  // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
  input.value = '';
};

/**
 * Maneja la selección de un archivo adicional
 */
const handleAdditionalSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  // Validar límite de cantidad
  if (adicionales.value.length >= MAX_ADDITIONAL_FILES) {
    alert(`Máximo ${MAX_ADDITIONAL_FILES} archivos adicionales permitidos`);
    input.value = '';
    return;
  }

  const validation = validateAdditionalFile(file);
  adicionales.value.push({ file, validation });

  // Limpiar el input
  input.value = '';
};

/**
 * Elimina un archivo adicional
 */
const removeAdditional = (index: number) => {
  adicionales.value.splice(index, 1);
};

// ============================================================================
// CÁLCULO DE VALIDEZ DEL FORMULARIO
// ============================================================================

/**
 * Indica si el formulario es válido para submit
 */
const isFormValid = computed(() => {
  // Switch SUNAT debe estar seleccionado
  if (emisionSunat.value === null) {
    return false;
  }

  // XML y PDF son obligatorios
  if (!facturaXml.value.file || !facturaPdf.value.file) {
    return false;
  }

  // Validaciones de XML y PDF deben pasar
  if (!facturaXml.value.validation.valid || !facturaPdf.value.validation.valid) {
    return false;
  }

  // Si NO es emisión SUNAT, CDR es obligatorio
  if (!emisionSunat.value && !cdrXml.value.file) {
    return false;
  }

  // Si CDR está cargado, su validación debe pasar
  if (cdrXml.value.file && !cdrXml.value.validation.valid) {
    return false;
  }

  // Todos los adicionales deben ser válidos
  if (adicionales.value.some((a) => !a.validation.valid)) {
    return false;
  }

  return true;
});

// ============================================================================
// SUBMIT
// ============================================================================

/**
 * Construye el FormData y emite el evento submit
 */
const handleSubmit = () => {
  if (!isFormValid.value || isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  const formData = new FormData();

  // Agregar archivos obligatorios
  if (facturaXml.value.file) {
    formData.append('factura_xml', facturaXml.value.file);
  }
  if (facturaPdf.value.file) {
    formData.append('factura_pdf', facturaPdf.value.file);
  }

  // Agregar switch SUNAT
  formData.append('emision_sunat', emisionSunat.value ? 'true' : 'false');

  // Agregar CDR solo si no es emisión SUNAT
  if (!emisionSunat.value && cdrXml.value.file) {
    formData.append('cdr_xml', cdrXml.value.file);
  }

  // Agregar archivos adicionales con claves iterativas
  adicionales.value.forEach((item, index) => {
    if (item.file) {
      formData.append(`adicional_${index + 1}`, item.file);
    }
  });

  emit('submit', formData);

  // Resetear estado de submitting después de emitir
  isSubmitting.value = false;
};

// ============================================================================
// UTILIDADES DE FORMATO
// ============================================================================

/**
 * Formatea el tamaño de archivo en KB o MB
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
</script>

<template>
  <div class="upload-form">
    <div class="upload-form__header">
      <h2 class="upload-form__title">Cargar Documentación</h2>
      <p class="upload-form__subtitle">
        Complete el formulario para enviar su comprobante electrónico
      </p>
    </div>

    <!-- Switch SUNAT (Directriz 1) -->
    <div class="upload-form__section upload-form__section--sunat">
      <h3 class="upload-form__section-title">
        🔒 Emisión de Factura
      </h3>
      <p class="upload-form__section-subtitle">
        ¿Esta factura fue emitida desde el portal de SUNAT?
      </p>
      
      <div class="upload-form__switch-container">
        <button
          type="button"
          class="upload-form__switch-btn"
          :class="{
            'upload-form__switch-btn--active': emisionSunat === false,
            'upload-form__switch-btn--inactive': emisionSunat === true,
          }"
          @click="emisionSunat = false"
        >
          NO
        </button>
        <button
          type="button"
          class="upload-form__switch-btn"
          :class="{
            'upload-form__switch-btn--active': emisionSunat === true,
            'upload-form__switch-btn--inactive': emisionSunat === false,
          }"
          @click="emisionSunat = true"
        >
          SÍ
        </button>
      </div>

      <p class="upload-form__switch-info">
        <span v-if="emisionSunat === true">
          Si selecciona SÍ, no necesita cargar el CDR.
        </span>
        <span v-else-if="emisionSunat === false">
          Si selecciona NO, el CDR es obligatorio.
        </span>
        <span v-else class="upload-form__switch-info--required">
          Seleccione una opción para continuar
        </span>
      </p>
    </div>

    <!-- Archivos Obligatorios -->
    <div class="upload-form__section">
      <h3 class="upload-form__section-title">
        📋 Documentos Obligatorios
      </h3>

      <!-- XML -->
      <div class="upload-form__field">
        <label class="upload-form__label">
          Archivo XML <span class="upload-form__required">*</span>
        </label>
        <input
          type="file"
          accept=".xml"
          @change="handleFileSelect($event, 'facturaXml')"
          :disabled="isSubmitting"
          class="upload-form__input"
        />
        <div v-if="facturaXml.file" class="upload-form__file-info">
          <span class="upload-form__file-name">✓ {{ facturaXml.file.name }}</span>
          <span class="upload-form__file-size">{{ formatFileSize(facturaXml.file.size) }}</span>
        </div>
        <div
          v-if="facturaXml.validation.error"
          class="upload-form__error"
        >
          ❌ {{ facturaXml.validation.error }}
        </div>
      </div>

      <!-- PDF -->
      <div class="upload-form__field">
        <label class="upload-form__label">
          Archivo PDF <span class="upload-form__required">*</span>
        </label>
        <input
          type="file"
          accept=".pdf"
          @change="handleFileSelect($event, 'facturaPdf')"
          :disabled="isSubmitting"
          class="upload-form__input"
        />
        <div v-if="facturaPdf.file" class="upload-form__file-info">
          <span class="upload-form__file-name">✓ {{ facturaPdf.file.name }}</span>
          <span class="upload-form__file-size">{{ formatFileSize(facturaPdf.file.size) }}</span>
        </div>
        <div
          v-if="facturaPdf.validation.error"
          class="upload-form__error"
        >
          ❌ {{ facturaPdf.validation.error }}
        </div>
      </div>

      <!-- CDR (condicional) -->
      <div
        v-if="emisionSunat === false"
        class="upload-form__field"
      >
        <label class="upload-form__label">
          Archivo CDR <span class="upload-form__required">*</span>
        </label>
        <input
          type="file"
          accept=".xml"
          @change="handleFileSelect($event, 'cdrXml')"
          :disabled="isSubmitting"
          class="upload-form__input"
        />
        <div v-if="cdrXml.file" class="upload-form__file-info">
          <span class="upload-form__file-name">✓ {{ cdrXml.file.name }}</span>
          <span class="upload-form__file-size">{{ formatFileSize(cdrXml.file.size) }}</span>
        </div>
        <div
          v-if="cdrXml.validation.error"
          class="upload-form__error"
        >
          ❌ {{ cdrXml.validation.error }}
        </div>
      </div>
    </div>

    <!-- Documentos Adicionales -->
    <div class="upload-form__section">
      <h3 class="upload-form__section-title">
        📎 Documentos Adicionales (Opcional)
      </h3>
      <p class="upload-form__section-subtitle">
        Guías, anexos, fotos. Máximo {{ MAX_ADDITIONAL_FILES }} archivos.
        Solo: {{ ADDITIONAL_EXTENSIONS.join(', ') }}
      </p>

      <div class="upload-form__field">
        <input
          type="file"
          :accept="ADDITIONAL_EXTENSIONS.join(',')"
          @change="handleAdditionalSelect"
          :disabled="isSubmitting || adicionales.length >= MAX_ADDITIONAL_FILES"
          class="upload-form__input"
        />
      </div>

      <!-- Lista de adicionales -->
      <div
        v-for="(item, index) in adicionales"
        :key="index"
        class="upload-form__additional-item"
      >
        <div class="upload-form__additional-info">
          <span class="upload-form__file-name">{{ item.file?.name }}</span>
          <span class="upload-form__file-size">{{ formatFileSize(item.file?.size || 0) }}</span>
        </div>
        <button
          type="button"
          @click="removeAdditional(index)"
          :disabled="isSubmitting"
          class="upload-form__remove-btn"
        >
          ✕
        </button>
        <div
          v-if="item.validation.error"
          class="upload-form__error upload-form__error--inline"
        >
          ❌ {{ item.validation.error }}
        </div>
      </div>
    </div>

    <!-- Botón Submit -->
    <div class="upload-form__actions">
      <button
        type="button"
        @click="handleSubmit"
        :disabled="!isFormValid || isSubmitting"
        class="upload-form__submit-btn"
        :class="{
          'upload-form__submit-btn--disabled': !isFormValid || isSubmitting,
        }"
      >
        <span v-if="isSubmitting">Enviando...</span>
        <span v-else>Subir Documentos</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.upload-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.upload-form__header {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

.upload-form__title {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.upload-form__subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Secciones */
.upload-form__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-form__section--sunat {
  background-color: #f8fafc;
  border-radius: 6px;
  padding: 1.5rem;
  border-left: 4px solid #0855c8;
}

.upload-form__section-title {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.upload-form__section-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Switch SUNAT */
.upload-form__switch-container {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.upload-form__switch-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  background-color: white;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-form__switch-btn:hover {
  border-color: #cbd5e1;
}

.upload-form__switch-btn--active {
  border-color: #0855c8;
  background-color: #0855c8;
  color: white;
}

.upload-form__switch-btn--inactive {
  border-color: #e2e8f0;
  background-color: white;
  color: #64748b;
}

.upload-form__switch-info {
  color: #64748b;
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0;
}

.upload-form__switch-info--required {
  color: #dc2626;
  font-weight: 500;
}

/* Campos */
.upload-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-form__label {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
}

.upload-form__required {
  color: #dc2626;
}

.upload-form__input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e293b;
  transition: border-color 0.2s ease;
}

.upload-form__input:focus {
  outline: none;
  border-color: #0855c8;
}

.upload-form__input:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
}

/* Info de archivo */
.upload-form__file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
}

.upload-form__file-name {
  color: #166534;
  font-size: 0.75rem;
  font-family: monospace;
}

.upload-form__file-size {
  color: #64748b;
  font-size: 0.75rem;
}

/* Error */
.upload-form__error {
  color: #dc2626;
  font-size: 0.75rem;
  margin: 0;
}

.upload-form__error--inline {
  margin-top: 0.25rem;
}

/* Adicionales */
.upload-form__additional-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.upload-form__additional-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-form__remove-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #64748b;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.upload-form__remove-btn:hover {
  border-color: #dc2626;
  color: #dc2626;
}

.upload-form__remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Acciones */
.upload-form__actions {
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.upload-form__submit-btn {
  width: 100%;
  padding: 1rem;
  background-color: #0855c8;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.upload-form__submit-btn:hover:not(:disabled) {
  background-color: #0644a0;
}

.upload-form__submit-btn:active:not(:disabled) {
  background-color: #04337a;
}

.upload-form__submit-btn--disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}
</style>

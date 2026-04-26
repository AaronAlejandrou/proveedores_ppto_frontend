<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { publicAccessService, type SubmissionWithFilesPayload } from '@/services/publicAccess.service';
import type { PurchaseOrder } from '@/types/purchase-order.types';
import type { InvoiceSubmission, InvoiceSubmissionCreate } from '@/types/submission.types';
import type { PublicAccessResponse } from '@/types/public-access.types';

const route = useRoute();
const token = computed(() => String(route.params.token ?? ''));

const loading = ref(true);
const validating = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const accessData = ref<PublicAccessResponse | null>(null);
const purchaseOrder = ref<PurchaseOrder | null>(null);
const submission = ref<InvoiceSubmission | null>(null);

const currentStep = ref(0);
const steps = [
  { title: 'Revisar la orden', sub: 'Monto, moneda y plazo', icon: 'search' },
  { title: 'Cargar archivos', sub: 'XML, PDF y CDR (si aplica)', icon: 'upload' },
  { title: 'Validando', sub: 'No cierre esta ventana', icon: 'validation' },
  { title: 'Resultado', sub: 'Recibo y estados de validación', icon: 'approved' }
];

const formData = ref<SubmissionWithFilesPayload>({
  document_type: 'FACTURA',
  declared_currency: 'PEN',
  declared_amount_with_tax: 0,
  invoice_xml: null as any,
  invoice_pdf: null as any,
  cdr_file: null as any
});

const documentTypeOptions = [
  { label: 'Factura', value: 'FACTURA' },
  { label: 'Nota de Crédito', value: 'NOTA_CREDITO' }
];

const currencyOptions = [
  { label: 'Soles (PEN)', value: 'PEN' },
  { label: 'Dólares (USD)', value: 'USD' }
];

const validateToken = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    accessData.value = await publicAccessService.validateToken(token.value);
    
    if (accessData.value.status === 'valid') {
      purchaseOrder.value = await publicAccessService.getPurchaseOrder(token.value);
      currentStep.value = 0;
    } else {
      error.value = 'El enlace de acceso no es válido o ha expirado';
    }
  } catch (err) {
    console.error('Error validating token:', err);
    error.value = 'No se pudo validar el acceso. Verifique el enlace.';
  } finally {
    loading.value = false;
  }
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const submitDocument = async () => {
  try {
    submitting.value = true;
    error.value = null;
    success.value = null;
    
    submission.value = await publicAccessService.createSubmission(token.value, formData.value);
    
    success.value = 'Documento registrado correctamente';
    currentStep.value = 3; // Go to result step
  } catch (err) {
    console.error('Error submitting document:', err);
    error.value = 'No se pudo registrar el documento. Verifique los datos.';
  } finally {
    submitting.value = false;
  }
};

const validateFiles = () => {
  const errors = [];
  
  // Validar XML
  if (!formData.value.invoice_xml) {
    errors.push('El archivo XML es obligatorio');
  } else if (!formData.value.invoice_xml.name.toLowerCase().endsWith('.xml')) {
    errors.push('El archivo XML debe tener extensión .xml');
  }
  
  // Validar PDF
  if (!formData.value.invoice_pdf) {
    errors.push('El archivo PDF es obligatorio');
  } else if (!formData.value.invoice_pdf.name.toLowerCase().endsWith('.pdf')) {
    errors.push('El archivo PDF debe tener extensión .pdf');
  }
  
  // Validar CDR si se proporcionó
  if (formData.value.cdr_file) {
    const cdrName = formData.value.cdr_file.name.toLowerCase();
    if (!cdrName.endsWith('.xml') && !cdrName.endsWith('.zip')) {
      errors.push('El archivo CDR debe tener extensión .xml o .zip');
    }
  }
  
  // Validar monto
  if (!formData.value.declared_amount_with_tax || formData.value.declared_amount_with_tax <= 0) {
    errors.push('El monto debe ser mayor a 0');
  }
  
  return errors;
};

const submitDocumentWithFiles = async () => {
  try {
    submitting.value = true;
    error.value = null;
    success.value = null;
    
    // Validar archivos frontend
    const validationErrors = validateFiles();
    if (validationErrors.length > 0) {
      error.value = validationErrors.join('. ');
      return;
    }
    
    // Avanzar a paso de validación
    currentStep.value = 2;
    
    // Simular proceso de validación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Enviar archivos al backend
    submission.value = await publicAccessService.createSubmissionWithFiles(token.value, formData.value);
    
    success.value = 'Documentos subidos y validados correctamente';
    currentStep.value = 3; // Go to result step
  } catch (err: any) {
    console.error('Error submitting documents:', err);
    const res = err.response?.data;
    const fromApi = res?.error;
    const rawErrors = fromApi?.errors ?? (Array.isArray(res?.errors) ? res.errors : null);
    if (rawErrors?.length) {
      const backendErrors = (rawErrors as { message: string }[]).map((e) => e.message).join('. ');
      error.value = `Error de validación: ${backendErrors}`;
    } else if (typeof fromApi?.message === 'string' && fromApi.message) {
      error.value = fromApi.message;
    } else {
      error.value = 'No se pudieron subir los documentos. Verifique los archivos y datos.';
    }
    
    // Volver al paso de formulario en caso de error
    currentStep.value = 1;
  } finally {
    submitting.value = false;
  }
};

const getCdrStatusMessage = (cdrStatus: string) => {
  switch (cdrStatus) {
    case 'REQUIRED_PENDING':
      return 'El CDR queda pendiente según la regla de validación configurada.';
    case 'NOT_REQUIRED':
      return 'Por el monto y moneda declarados, el CDR no es requerido en esta etapa.';
    case 'UPLOADED':
      return 'CDR cargado y en proceso de validación.';
    case 'VALIDATED':
      return 'CDR validado correctamente.';
    case 'OBSERVED':
      return 'CDR con observaciones. Por favor revise los detalles.';
    default:
      return 'Estado de CDR desconocido.';
  }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'PEN'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'CREATED': 'Creada',
    'LINK_GENERATED': 'Link Generado',
    'VIEWED_BY_PROVIDER': 'Vista por Proveedor',
    'DOCUMENTS_PENDING': 'Pendiente de Documentos',
    'APPROVED': 'Aprobada',
    'READY_FOR_MAIN_PPTO': 'Lista para PPTO',
    'PENDING': 'Pendiente',
    'VALIDATED': 'Validado',
    'REJECTED': 'Rechazado',
  };
  return labels[status] || status;
};

const onFileSelect = (event: any, fieldName: string) => {
  const file = event.target.files[0];
  if (file) {
    (formData.value as any)[fieldName] = file;
  }
};

onMounted(() => {
  validateToken();
});
</script>

<template>
  <div class="provider-access-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <PvCard class="loading-card app-ui-pcard">
        <template #content>
          <div class="loading-content">
            <AppIcon name="spinner" class="loading-icon" :size="32" :spin="true" />
            <p>Validando acceso...</p>
          </div>
        </template>
      </PvCard>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <PvCard class="error-card app-ui-pcard">
        <template #title>Acceso No Disponible</template>
        <template #content>
          <PvMessage severity="error" :closable="false">
            {{ error }}
          </PvMessage>
          <div class="error-actions">
            <button class="btn btn-secondary" type="button" @click="validateToken">
              <AppIcon name="refresh" :size="16" />
              <span>Intentar nuevamente</span>
            </button>
          </div>
        </template>
      </PvCard>
    </div>

    <div v-else-if="purchaseOrder" class="main-content">
      <header class="public-hero">
        <p class="public-hero__kicker">Canal asegurado</p>
        <h2 class="public-hero__title">Carga de comprobante electrónico</h2>
        <p class="public-hero__lede">
          Este enlace aplica a una sola orden. Verifique monto, moneda y plazo antes de adjuntar archivos.
        </p>
      </header>

      <div class="ui-stepper" role="list" aria-label="Etapas del trámite">
        <div
          v-for="(step, index) in steps"
          :key="index"
          :class="['ui-step', { 'ui-step--active': currentStep === index, 'ui-step--done': currentStep > index }]"
          role="listitem"
        >
          <div class="ui-step__n" aria-hidden="true">
            <AppIcon :name="currentStep > index ? 'approved' : step.icon" :size="16" />
          </div>
          <div class="ui-step__label">{{ step.title }}</div>
          <div v-if="step.sub" class="ui-step__subl">{{ step.sub }}</div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <!-- Step 1: Order Review -->
        <div v-if="currentStep === 0" class="step-panel">
          <PvCard class="step-card app-ui-pcard">
            <template #title>Revisión de Orden de Compra</template>
            <template #content>
              <div class="order-summary">
                <div class="summary-grid">
                  <div class="summary-item">
                    <label>Número de OC</label>
                    <span class="po-number">{{ purchaseOrder.po_number }}</span>
                  </div>
                  <div class="summary-item">
                    <label>Monto Esperado</label>
                    <span class="amount">{{ formatCurrency(purchaseOrder.expected_amount, purchaseOrder.expected_currency) }}</span>
                  </div>
                  <div class="summary-item">
                    <label>Moneda</label>
                    <PvTag :value="purchaseOrder.expected_currency" severity="secondary" />
                  </div>
                  <div class="summary-item">
                    <label>Fecha de Emisión</label>
                    <span>{{ formatDate(purchaseOrder.issue_date) }}</span>
                  </div>
                  <div v-if="purchaseOrder.description" class="summary-item full-width">
                    <label>Descripción</label>
                    <span>{{ purchaseOrder.description }}</span>
                  </div>
                </div>
              </div>
              
              <div class="step-actions">
                <button class="btn btn-primary" type="button" @click="nextStep">
                  <span>Continuar</span>
                  <AppIcon name="continue" :size="16" />
                </button>
              </div>
            </template>
          </PvCard>
        </div>

        <!-- Step 2: Document Registration -->
        <div v-if="currentStep === 1" class="step-panel">
          <PvCard class="step-card app-ui-pcard">
            <template #title>Registrar documento y archivos</template>
            <template #content>
              <PvMessage severity="info" :closable="false" class="info-message">
                Cargue los archivos del comprobante electrónico. XML y PDF son obligatorios, CDR es opcional.
              </PvMessage>

              <form @submit.prevent="submitDocumentWithFiles" class="document-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="document_type" class="form-label">Tipo de Documento *</label>
                    <PvDropdown
                      id="document_type"
                      v-model="formData.document_type"
                      :options="documentTypeOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccione tipo"
                      class="form-input"
                      :disabled="submitting"
                    />
                  </div>

                  <div class="form-group">
                    <label for="declared_currency" class="form-label">Moneda *</label>
                    <PvDropdown
                      id="declared_currency"
                      v-model="formData.declared_currency"
                      :options="currencyOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccione moneda"
                      class="form-input"
                      :disabled="submitting"
                    />
                  </div>

                  <div class="form-group">
                    <label for="declared_amount_with_tax" class="form-label">Monto con IGV *</label>
                    <PvInputNumber
                      id="declared_amount_with_tax"
                      v-model="formData.declared_amount_with_tax"
                      mode="currency"
                      currency="PEN"
                      :minFractionDigits="2"
                      placeholder="0.00"
                      class="form-input"
                      :disabled="submitting"
                    />
                  </div>

                  <div class="form-group full-width">
                    <label for="invoice_xml" class="form-label">Archivo XML *</label>
                    <PvFileUpload
                      id="invoice_xml"
                      v-model="formData.invoice_xml"
                      mode="basic"
                      :chooseLabel="'Seleccionar archivo XML'"
                      :auto="false"
                      :multiple="false"
                      accept=".xml"
                      class="form-input"
                      :disabled="submitting"
                    >
                      <template #empty>
                        <div class="file-upload-empty ui-file-drop">
                          <AppIcon name="file" :size="20" />
                          <span>Seleccione el comprobante en formato XML (SUNAT / OSE)</span>
                        </div>
                      </template>
                    </PvFileUpload>
                    <div v-if="formData.invoice_xml" class="file-info">
                      <small>{{ formData.invoice_xml.name }}</small>
                    </div>
                  </div>

                  <div class="form-group full-width">
                    <label for="invoice_pdf" class="form-label">Archivo PDF *</label>
                    <PvFileUpload
                      id="invoice_pdf"
                      v-model="formData.invoice_pdf"
                      mode="basic"
                      :chooseLabel="'Seleccionar archivo PDF'"
                      :auto="false"
                      :multiple="false"
                      accept=".pdf"
                      class="form-input"
                      :disabled="submitting"
                    >
                      <template #empty>
                        <div class="file-upload-empty ui-file-drop">
                          <AppIcon name="pdf" :size="20" />
                          <span>Representación impresa en PDF (mismo comprobante que el XML)</span>
                        </div>
                      </template>
                    </PvFileUpload>
                    <div v-if="formData.invoice_pdf" class="file-info">
                      <small>{{ formData.invoice_pdf.name }}</small>
                    </div>
                  </div>

                  <div class="form-group full-width">
                    <label for="cdr_file" class="form-label">Archivo CDR (opcional)</label>
                    <PvFileUpload
                      id="cdr_file"
                      v-model="formData.cdr_file"
                      mode="basic"
                      :chooseLabel="'Seleccionar archivo CDR'"
                      :auto="false"
                      :multiple="false"
                      accept=".xml,.zip"
                      class="form-input"
                      :disabled="submitting"
                    >
                      <template #empty>
                        <div class="file-upload-empty ui-file-drop">
                          <AppIcon name="attachment" :size="20" />
                          <span>Constancia de recepción (CDR) — opcional según regla interna</span>
                        </div>
                      </template>
                    </PvFileUpload>
                    <div v-if="formData.cdr_file" class="file-info">
                      <small>{{ formData.cdr_file.name }}</small>
                    </div>
                  </div>
                </div>

                <div v-if="error" class="error-section">
                  <PvMessage severity="error" :closable="false">
                    {{ error }}
                  </PvMessage>
                </div>

                <div class="form-actions">
                  <button class="btn btn-ghost" type="button" @click="prevStep" :disabled="submitting">
                    <AppIcon name="back" :size="16" />
                    <span>Anterior</span>
                  </button>
                  <button class="btn btn-success" type="submit" :disabled="submitting">
                    <AppIcon v-if="submitting" name="spinner" :size="16" :spin="true" />
                    <AppIcon v-else name="upload" :size="16" />
                    <span>{{ submitting ? 'Subiendo...' : 'Subir Documentos' }}</span>
                  </button>
                </div>
              </form>
            </template>
          </PvCard>
        </div>

        <!-- Step 3: Validation -->
        <div v-if="currentStep === 2" class="step-panel">
          <PvCard class="step-card app-ui-pcard">
            <template #title>Procesando su envío</template>
            <template #content>
              <div class="validation-content">
                <AppIcon name="spinner" class="validation-icon" :size="40" :spin="true" />
                <p>Validando la información del documento...</p>
                <small>Este proceso puede tardar unos momentos.</small>
              </div>
            </template>
          </PvCard>
        </div>

        <!-- Step 4: Result -->
        <div v-if="currentStep === 3" class="step-panel">
          <PvCard class="step-card app-ui-pcard">
            <template #title>Resumen y estado de validación</template>
            <template #content>
              <div v-if="success" class="success-content">
                <PvMessage severity="success" :closable="false">
                  {{ success }}
                </PvMessage>
                
                <div v-if="submission" class="result-details">
                  <h4>Detalles del Registro:</h4>
                  <div class="result-grid">
                    <div class="result-item">
                      <label>Tipo de Documento</label>
                      <span>{{ submission.document_type }}</span>
                    </div>
                    <div class="result-item">
                      <label>Monto Declarado</label>
                      <span>{{ formatCurrency(submission.declared_amount_with_tax, submission.declared_currency) }}</span>
                    </div>
                    <div class="result-item">
                      <label>Estado de Validación</label>
                      <PvTag :value="submission.validation_status" severity="info" />
                    </div>
                    <div class="result-item">
                      <label>Estado CDR</label>
                      <PvTag :value="submission.cdr_status" severity="secondary" />
                    </div>
                  </div>
                  
                  <!-- Archivos Cargados -->
                  <div v-if="formData.invoice_xml || formData.invoice_pdf || formData.cdr_file" class="files-section">
                    <h4>Archivos Cargados:</h4>
                    <div class="files-list">
                      <div v-if="formData.invoice_xml" class="file-item">
                        <AppIcon name="file" :size="20" />
                        <div class="file-info">
                          <strong>XML</strong>
                          <small>{{ formData.invoice_xml.name }}</small>
                        </div>
                      </div>
                      <div v-if="formData.invoice_pdf" class="file-item">
                        <AppIcon name="pdf" :size="20" />
                        <div class="file-info">
                          <strong>PDF</strong>
                          <small>{{ formData.invoice_pdf.name }}</small>
                        </div>
                      </div>
                      <div v-if="formData.cdr_file" class="file-item">
                        <AppIcon name="file" :size="20" />
                        <div class="file-info">
                          <strong>CDR</strong>
                          <small>{{ formData.cdr_file.name }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="cdr-message">
                    <p><strong>Información CDR:</strong></p>
                    <p>{{ getCdrStatusMessage(submission.cdr_status) }}</p>
                  </div>
                  
                  <!-- Mensaje según estado de validación -->
                  <div class="validation-message">
                    <PvMessage 
                      v-if="submission.validation_status === 'PASSED'"
                      severity="success" 
                      :closable="false"
                    >
                      Los documentos fueron recibidos y validados correctamente.
                    </PvMessage>
                    <PvMessage 
                      v-else-if="submission.validation_status === 'OBSERVED'"
                      severity="warning" 
                      :closable="false"
                    >
                      Los documentos fueron recibidos, pero se detectaron observaciones.
                    </PvMessage>
                    <PvMessage 
                      v-else-if="submission.validation_status === 'FAILED'"
                      severity="error" 
                      :closable="false"
                    >
                      No pudimos validar correctamente la documentación. Revisa las observaciones.
                    </PvMessage>
                  </div>
                </div>
              </div>
            </template>
          </PvCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.provider-access-container {
  min-height: 0;
  padding: 0;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-card,
.error-card {
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.loading-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.error-actions {
  margin-top: 1.5rem;
}

.main-content {
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
}

.step-content {
  margin-top: 2rem;
}

.step-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.order-summary {
  margin-bottom: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item.full-width {
  grid-column: 1 / -1;
}

.summary-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-item span {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
}

.po-number {
  font-family: monospace;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-primary);
}

.amount {
  font-family: monospace;
  font-weight: 700;
  font-size: 1.125rem;
  color: #059669;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
}

.document-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-message {
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
}

.form-input {
  width: 100%;
}

.error-section {
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Drop zones: .ui-file-drop en app-ui.css (clase añadida al template) */
.file-upload-empty {
  margin: 0;
}

.file-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  color: #374151;
}

.files-section {
  margin-top: 1.5rem;
}

.files-section h4 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-weight: 600;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: var(--color-primary);
  background: #eff6ff;
}

.file-item .app-icon {
  color: var(--color-primary);
}

.file-item .file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-item .file-info strong {
  color: #111827;
  font-weight: 600;
}

.file-item .file-info small {
  color: #6b7280;
  font-size: 0.75rem;
  font-family: monospace;
}

.validation-message {
  margin-top: 1.5rem;
}

.validation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
  text-align: center;
}

.validation-icon {
  font-size: 3rem;
  color: var(--color-primary);
}

.success-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.result-details {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.result-details h4 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-weight: 600;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.result-item span {
  font-size: 1rem;
  color: #111827;
  font-weight: 500;
}

.cdr-message {
  padding: 1rem;
  background: #eff6ff;
  border-radius: 6px;
  border-left: 4px solid var(--color-primary);
}

.cdr-message p {
  margin: 0;
  line-height: 1.5;
}

.cdr-message p:first-child {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .summary-grid,
  .form-grid,
  .result-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .step-actions {
    justify-content: stretch;
  }
}
</style>

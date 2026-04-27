/**
 * Tipos centrales para el Portal de Proveedores
 * Arquitectura Enterprise-Grade - Fase 1.5
 */

// ============================================================================
// ENUM DE ESTADOS DE APLICACIÓN
// ============================================================================

/**
 * Los 9 estados de la aplicación en arquitectura stateless
 * Cada estado representa un momento específico del flujo de usuario
 */
export enum AppState {
  /** Estado inicial: extrayendo token y validando acceso */
  INITIALIZING = 'INITIALIZING',
  
  /** Token válido: PDF de OC cargado, formulario habilitado */
  VALID_TOKEN = 'VALID_TOKEN',
  
  /** Token inválido o expirado (30 días): mostrar error + mailto soporte */
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  /** Formulario listo: todos los archivos obligatorios cargados y validados */
  FORM_READY = 'FORM_READY',
  
  /** Enviando: POST en progreso, pantalla de procesamiento dinámica */
  SUBMITTING = 'SUBMITTING',
  
  /** Éxito total: todos los archivos procesados correctamente */
  SUCCESS_FULL = 'SUCCESS_FULL',
  
  /** Éxito parcial: archivos principales recibidos, algunos anexos fallaron */
  SUCCESS_PARTIAL = 'SUCCESS_PARTIAL',
  
  /** Error de envío: error de red o error 500 del webhook */
  ERROR_SUBMIT = 'ERROR_SUBMIT',
  
  /** Error de validación: archivo inválido (MIME o tamaño) detectado */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// ============================================================================
// INTERFACES PARA PAYLOAD DE DOCUMENTACIÓN
// ============================================================================

/**
 * Payload completo para enviar documentación al webhook n8n
 * Incluye el switch SUNAT y archivos adicionales dinámicos
 */
export interface DocumentationPayload {
  /** Token JWT extraído de la URL */
  token: string;
  
  /** Archivo PDF de la factura (OBLIGATORIO) */
  factura_pdf: File;
  
  /** Archivo XML de la factura (OBLIGATORIO) */
  factura_xml: File;
  
  /** Switch: ¿Factura emitida desde portal SUNAT? */
  emision_sunat: boolean;
  
  /** CDR XML (OBLIGATORIO solo si emision_sunat === false) */
  cdr_xml?: File;
  
  /** Documentos adicionales opcionales (guías, anexos, fotos) */
  adicionales?: File[];
}

// ============================================================================
// INTERFACES PARA RESPONSE DEL WEBHOOK N8N
// ============================================================================

/**
 * Respuesta estándar del webhook de n8n
 * Puede indicar éxito total, éxito parcial o error
 */
export interface WebhookResponse {
  /** Indica si la operación fue exitosa (total o parcial) */
  success: boolean;
  
  /** Mensaje descriptivo del resultado */
  message: string;
  
  /** Lista de archivos que fallaron (opcional, para éxito parcial) */
  failed_files?: string[];
  
  /** Lista de archivos recibidos exitosamente (opcional) */
  received_files?: string[];
}

// ============================================================================
// INTERFACES PARA VALIDACIÓN DE ARCHIVOS (ZERO TRUST)
// ============================================================================

/**
 * Resultado de validación de un archivo individual
 */
export interface ValidationResult {
  /** Indica si el archivo pasó todas las validaciones */
  valid: boolean;
  
  /** Mensaje de error si la validación falló */
  error?: string;
}

/**
 * Configuración de validación para un tipo de archivo específico
 */
export interface FileValidationConfig {
  /** Array de MIME types permitidos para este campo */
  allowedMimes: readonly string[];
  
  /** Tamaño máximo en bytes (15MB = 15 * 1024 * 1024) */
  maxSize: number;
  
  /** Etiqueta legible para el usuario (ej. "Archivo XML") */
  label: string;
}

/**
 * Estado de un archivo en el formulario
 */
export interface FileState {
  /** El archivo seleccionado (null si no seleccionado) */
  file: File | null;
  
  /** Resultado de la validación más reciente */
  validation: ValidationResult;
  
  /** Indica si el archivo está siendo subido actualmente */
  uploading?: boolean;
}

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

/**
 * Tamaño máximo de archivo: 15MB estricto
 */
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB en bytes

/**
 * Mapa de MIME types permitidos para archivos obligatorios
 */
export const OBLIGATORY_MIME_TYPES = {
  /** Archivos XML */
  xml: ['application/xml', 'text/xml'] as const,
  
  /** Archivos PDF */
  pdf: ['application/pdf'] as const,
} as const;

/**
 * Mapa de MIME types permitidos para archivos adicionales
 * Solo: .pdf, .xml, .jpg, .jpeg, .png, .xlsx, .docx
 */
export const ADDITIONAL_MIME_TYPES = {
  pdf: ['application/pdf'] as const,
  xml: ['application/xml', 'text/xml'] as const,
  jpg: ['image/jpeg'] as const,
  jpeg: ['image/jpeg'] as const,
  png: ['image/png'] as const,
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] as const,
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const,
} as const;

/**
 * Extensiones de archivo permitidas para adicionales
 */
export const ADDITIONAL_EXTENSIONS = [
  '.pdf',
  '.xml',
  '.jpg',
  '.jpeg',
  '.png',
  '.xlsx',
  '.docx',
] as const;

/**
 * Máximo número de archivos adicionales permitidos
 */
export const MAX_ADDITIONAL_FILES = 10;

/**
 * Configuración de validación para cada campo del formulario
 */
export const VALIDATION_CONFIGS: Record<string, FileValidationConfig> = {
  factura_xml: {
    allowedMimes: OBLIGATORY_MIME_TYPES.xml,
    maxSize: MAX_FILE_SIZE,
    label: 'Archivo XML de Factura',
  },
  factura_pdf: {
    allowedMimes: OBLIGATORY_MIME_TYPES.pdf,
    maxSize: MAX_FILE_SIZE,
    label: 'Archivo PDF de Factura',
  },
  cdr_xml: {
    // CDR acepta PDF o XML (ambos son válidos)
    allowedMimes: [...OBLIGATORY_MIME_TYPES.xml, ...OBLIGATORY_MIME_TYPES.pdf],
    maxSize: MAX_FILE_SIZE,
    label: 'Archivo CDR (PDF o XML)',
  },
};

// ============================================================================
// INTERFACES PARA MENSAJES DE PROCESAMIENTO DINÁMICO
// ============================================================================

/**
 * Mensaje de progreso para la pantalla de procesamiento dinámico
 */
export interface ProgressMessage {
  /** Texto a mostrar al usuario */
  text: string;
  
  /** Tiempo en segundos desde el inicio para mostrar este mensaje */
  delay: number;
}

/**
 * Secuencia de mensajes para la pantalla de procesamiento
 * Rotan cada 2 segundos durante 8-15 segundos de latencia
 */
export const PROCESSING_MESSAGES: ProgressMessage[] = [
  { text: 'Validando seguridad de archivos...', delay: 0 },
  { text: 'Verificando integridad de documentos...', delay: 2 },
  { text: 'Almacenando en repositorios corporativos...', delay: 4 },
  { text: 'Procesando comprobante electrónico...', delay: 6 },
  { text: 'Finalizando registro...', delay: 8 },
  { text: 'Casi terminamos...', delay: 10 },
];

// ============================================================================
// INTERFACES PARA CONFIGURACIÓN DE CONTACTO DE SOPORTE
// ============================================================================

/**
 * Configuración para mailto de soporte
 */
export const SUPPORT_CONFIG = {
  /** Email de soporte para pagos a proveedores */
  email: 'pagosproveedores@interseguro.com.pe',
  
  /** Asunto por defecto para reportar problemas de token */
  tokenErrorSubject: 'Enlace expirado - Portal de Proveedores',
  
  /** Asunto por defecto para enviar anexos faltantes */
  partialSuccessSubject: 'Anexos faltantes - Envío parcial',
} as const;

/**
 * Genera un mailto URL con asunto y cuerpo preconfigurados
 */
export const generateMailto = (
  email: string,
  subject: string,
  body?: string
): string => {
  const params = new URLSearchParams();
  params.append('subject', subject);
  if (body) {
    params.append('body', body);
  }
  return `mailto:${email}?${params.toString()}`;
};

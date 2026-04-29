/**
 * Servicio para comunicación con webhooks de n8n
 * Arquitectura Enterprise-Grade - Fase 1.5
 * 
 * Este servicio maneja la comunicación directa con los webhooks de n8n
 * sin intermediación de backend proxy, siguiendo la arquitectura serverless.
 */

import axios, { type AxiosProgressEvent } from 'axios';
import type { WebhookResponse } from '@/types';

// ============================================================================
// CONFIGURACIÓN DE ENDPOINTS N8N
// ============================================================================

/**
 * URL del webhook n8n para ver la Orden de Compra (PDF)
 * Dev:  https://interseguro-workflows.app.n8n.cloud/webhook-test/ver-oc
 * Prod: https://interseguro-workflows.app.n8n.cloud/webhook/ver-oc
 */
const N8N_VIEW_OC_URL = import.meta.env.VITE_N8N_VIEW_OC_URL as string;

/**
 * URL del webhook n8n para subir documentación
 * Dev:  https://interseguro-workflows.app.n8n.cloud/webhook-test/subir-documentacion
 * Prod: https://interseguro-workflows.app.n8n.cloud/webhook/subir-documentacion
 */
const N8N_SUBMIT_DOCS_URL = import.meta.env.VITE_N8N_SUBMIT_DOCS_URL as string;

/**
 * Timeout para la petición GET del PDF (30 segundos)
 */
const GET_TIMEOUT = 30000;

/**
 * Timeout para la petición POST de subida (60 segundos)
 * Considera la latencia de APIs de Google Drive (8-15s)
 */
const POST_TIMEOUT = 60000;

// ============================================================================
// TIPOS PARA CALLBACKS
// ============================================================================

/**
 * Callback para reportar progreso de subida
 * @param progress - Porcentaje completado (0-100)
 */
export type ProgressCallback = (progress: number) => void;

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

export const n8nService = {
  /**
   * Obtiene el PDF de la Orden de Compra como blob
   * 
   * @param token - Token JWT extraído de la URL
   * @returns Promise<Blob> - El binario del PDF
   * @throws Error si el token es inválido o hay error de red
   */
  async getPurchaseOrderPdf(token: string): Promise<Blob> {
    try {
      const response = await axios.get<Blob>(N8N_VIEW_OC_URL, {
        params: { token },
        responseType: 'blob',
        timeout: GET_TIMEOUT,
      });

      return response.data;
    } catch (error) {
      // Diferenciar entre error de token (401/403/404) y error de red
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
          throw new Error('INVALID_TOKEN');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('TIMEOUT');
        }
      }
      throw error;
    }
  },

  /**
   * Envía la documentación al webhook de n8n
   * 
   * @param formData - FormData con todos los archivos y campos
   * @param onProgress - Callback opcional para reportar progreso de subida
   * @returns Promise<WebhookResponse> - Respuesta del webhook
   * @throws Error si hay error de red o el webhook falla
   */
  async submitDocumentation(
    formData: FormData,
    onProgress?: ProgressCallback
  ): Promise<WebhookResponse> {
    try {
      const response = await axios.post<WebhookResponse>(
        N8N_SUBMIT_DOCS_URL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
          timeout: POST_TIMEOUT,
        }
      );

      return response.data;
    } catch (error) {
      // Manejo específico de errores
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('TIMEOUT');
        }
        if (!error.response) {
          throw new Error('NETWORK_ERROR');
        }
        if (error.response.status >= 500) {
          throw new Error('SERVER_ERROR');
        }
      }
      throw error;
    }
  },
};

// ============================================================================
// UTILIDADES PARA CONSTRUCCIÓN DE FORMDATA
// ============================================================================

/**
 * Construye un FormData a partir del payload de documentación
 * Convierte los archivos adicionales a claves iterativas (adicional_1, adicional_2, etc.)
 * 
 * @param payload - Payload de documentación con archivos
 * @returns FormData - FormData listo para enviar al webhook
 */
export const buildFormData = (payload: {
  token: string;
  factura_pdf: File;
  factura_xml: File;
  emision_sunat: boolean;
  cdr_xml?: File;
  adicionales?: File[];
}): FormData => {
  const formData = new FormData();

  // Agregar token
  formData.append('token', payload.token);

  // Agregar archivos obligatorios
  formData.append('factura_pdf', payload.factura_pdf);
  formData.append('factura_xml', payload.factura_xml);

  // Agregar switch SUNAT
  formData.append('emision_sunat', payload.emision_sunat ? 'true' : 'false');

  // Agregar CDR solo si no es emisión SUNAT
  if (!payload.emision_sunat && payload.cdr_xml) {
    formData.append('cdr_xml', payload.cdr_xml);
  }

  // Agregar archivos adicionales con claves iterativas
  if (payload.adicionales && payload.adicionales.length > 0) {
    payload.adicionales.forEach((file, index) => {
      formData.append(`adicional_${index + 1}`, file);
    });
  }

  return formData;
};

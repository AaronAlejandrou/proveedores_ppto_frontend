import { api } from './api';
import type { PublicAccessResponse } from '@/types/public-access.types';
import type { PurchaseOrder } from '@/types/purchase-order.types';
import type { InvoiceSubmission, InvoiceSubmissionCreate } from '@/types/submission.types';

export interface SubmissionWithFilesPayload extends InvoiceSubmissionCreate {
  invoice_xml: File;
  invoice_pdf: File;
  cdr_file?: File;
}

export const publicAccessService = {
  async validateToken(token: string): Promise<PublicAccessResponse> {
    const { data } = await api.get<PublicAccessResponse>(`/public/access/${token}`);
    return data;
  },

  async getPurchaseOrder(token: string): Promise<PurchaseOrder> {
    const { data } = await api.get<PurchaseOrder>(`/public/access/${token}/purchase-order`);
    return data;
  },

  async createSubmission(token: string, payload: InvoiceSubmissionCreate): Promise<InvoiceSubmission> {
    const { data } = await api.post<InvoiceSubmission>(`/public/access/${token}/submission`, payload);
    return data;
  },

  async createSubmissionWithFiles(token: string, payload: SubmissionWithFilesPayload): Promise<InvoiceSubmission> {
    const formData = new FormData();
    
    // Agregar campos del formulario
    formData.append('document_type', payload.document_type);
    formData.append('declared_currency', payload.declared_currency);
    formData.append('declared_amount_with_tax', payload.declared_amount_with_tax.toString());
    
    // Agregar archivos
    formData.append('invoice_xml', payload.invoice_xml);
    formData.append('invoice_pdf', payload.invoice_pdf);
    
    if (payload.cdr_file) {
      formData.append('cdr_file', payload.cdr_file);
    }
    
    // Dejar el boundary automático: no fijar Content-Type manualmente
    const { data } = await api.post<InvoiceSubmission>(
      `/public/access/${token}/submission-with-files`,
      formData
    );
    return data;
  }
};

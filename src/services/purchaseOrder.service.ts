import { api } from './api';
import type { PurchaseOrder, PurchaseOrderCreate, PurchaseOrderUpdate, MagicLinkResponse } from '@/types/purchase-order.types';
import type { InvoiceSubmission } from '@/types/submission.types';

export const purchaseOrderService = {
  async getAll(): Promise<PurchaseOrder[]> {
    const { data } = await api.get<PurchaseOrder[]>('/purchase-orders');
    return data;
  },

  async getById(id: number): Promise<PurchaseOrder> {
    const { data } = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
    return data;
  },

  async create(payload: PurchaseOrderCreate): Promise<PurchaseOrder> {
    const { data } = await api.post<PurchaseOrder>('/purchase-orders', payload);
    return data;
  },

  async update(id: number, payload: PurchaseOrderUpdate): Promise<PurchaseOrder> {
    const { data } = await api.put<PurchaseOrder>(`/purchase-orders/${id}`, payload);
    return data;
  },

  async generateMagicLink(id: number): Promise<MagicLinkResponse> {
    const { data } = await api.post<MagicLinkResponse>(`/purchase-orders/${id}/magic-link`);
    return data;
  },

  async revokeMagicLink(id: number): Promise<{status: string}> {
    const { data } = await api.post<{status: string}>(`/purchase-orders/${id}/magic-link/revoke`);
    return data;
  },

  async getSubmissions(id: number): Promise<InvoiceSubmission[]> {
    const { data } = await api.get<InvoiceSubmission[]>(`/purchase-orders/${id}/submissions`);
    return data;
  }
};

import { api } from './api';
import type { InvoiceSubmission } from '@/types/submission.types';

export const submissionService = {
  async getById(id: number): Promise<InvoiceSubmission> {
    const { data } = await api.get<InvoiceSubmission>(`/submissions/${id}`);
    return data;
  }
};

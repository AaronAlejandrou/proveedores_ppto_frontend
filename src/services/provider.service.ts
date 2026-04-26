import { api } from './api';
import type { Provider, ProviderCreate, ProviderUpdate } from '@/types/provider.types';

export const providerService = {
  async getAll(): Promise<Provider[]> {
    const { data } = await api.get<Provider[]>('/providers');
    return data;
  },

  async getById(id: number): Promise<Provider> {
    const { data } = await api.get<Provider>(`/providers/${id}`);
    return data;
  },

  async create(payload: ProviderCreate): Promise<Provider> {
    const { data } = await api.post<Provider>('/providers', payload);
    return data;
  },

  async update(id: number, payload: ProviderUpdate): Promise<Provider> {
    const { data } = await api.put<Provider>(`/providers/${id}`, payload);
    return data;
  },
};

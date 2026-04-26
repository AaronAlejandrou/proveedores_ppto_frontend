import type { ProviderStatus } from './common.types';

export interface Provider {
  id: number;
  ruc: string;
  business_name: string;
  trade_name: string | null;
  contact_name: string | null;
  email: string;
  phone: string | null;
  status: ProviderStatus;
  created_at: string;
  updated_at: string;
}

export interface ProviderCreate {
  ruc: string;
  business_name: string;
  trade_name?: string | null;
  contact_name?: string | null;
  email: string;
  phone?: string | null;
  status?: ProviderStatus;
}

export type ProviderUpdate = Partial<ProviderCreate>;

import type { PurchaseOrderStatus, Currency } from './common.types';
import type { Provider } from './provider.types';

export interface PurchaseOrder {
  id: number;
  po_number: string;
  provider_id: number;
  provider?: Provider | null; // Optional if provided
  expected_amount: number;
  expected_currency: Currency;
  issue_date: string;
  description: string | null;
  drive_link: string | null;
  status: PurchaseOrderStatus;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderCreate {
  po_number: string;
  provider_id: number;
  expected_amount: number;
  expected_currency: Currency;
  issue_date: string;
  description?: string | null;
  drive_link?: string | null;
  status?: PurchaseOrderStatus;
}

export type PurchaseOrderUpdate = Partial<Omit<PurchaseOrderCreate, 'po_number' | 'provider_id'>>;

export interface MagicLinkResponse {
  access_url: string;
  expires_at: string;
}

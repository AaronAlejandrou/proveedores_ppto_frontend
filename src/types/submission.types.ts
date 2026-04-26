import type { DocumentType, Currency, ValidationStatus, CdrStatus } from './common.types';

export interface InvoiceSubmission {
  id: number;
  purchase_order_id: number;
  provider_id: number;
  document_type: DocumentType;
  declared_currency: Currency;
  declared_amount_with_tax: number;
  invoice_series: string | null;
  invoice_number: string | null;
  invoice_issue_date: string | null;
  xml_extracted_data_json?: string | null;
  validation_status: ValidationStatus;
  validation_summary?: string | null;
  cdr_status: CdrStatus;
  created_at: string;
  updated_at: string;
}

export interface InvoiceSubmissionCreate {
  document_type: DocumentType;
  declared_currency: Currency;
  declared_amount_with_tax: number;
  invoice_series?: string | null;
  invoice_number?: string | null;
  invoice_issue_date?: string | null;
}

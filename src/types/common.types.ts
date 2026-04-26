export type PurchaseOrderStatus = 
  | 'CREATED' 
  | 'LINK_GENERATED' 
  | 'VIEWED_BY_PROVIDER' 
  | 'DOCUMENTS_PENDING' 
  | 'DOCUMENTS_UPLOADED' 
  | 'OBSERVED' 
  | 'APPROVED' 
  | 'READY_FOR_MAIN_PPTO' 
  | 'CANCELLED';

export type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'OBSERVED';
export type DocumentType = 'FACTURA' | 'NOTA_CREDITO';
export type Currency = 'PEN' | 'USD';
export type ValidationStatus = 'PENDING' | 'VALIDATING' | 'PASSED' | 'FAILED' | 'OBSERVED';
export type CdrStatus = 'NOT_REQUIRED' | 'REQUIRED_PENDING' | 'UPLOADED' | 'VALIDATED' | 'OBSERVED';

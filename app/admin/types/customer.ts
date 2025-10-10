export type CustomerType = "IMPORTER" | "SERVICE_MANAGER";

export interface Customer {
  customerId: number;
  name: string;
  address: string;
  email: string;
  dob: string | null;
  phone: string;
  note: string;
  taxCode: string;
  customerType: CustomerType;
  createdAt: string;
  updatedAt: string;
  username?: string; 
  isActive?: boolean; 
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: Sort;
}

export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface CustomerResponse {
  content: Customer[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  empty: boolean;
}

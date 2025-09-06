export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxCode?: string;
  contactPerson?: string;
  customerType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  customerId: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  note?: string;
  taxCode?: string;
  contactPerson?: string;
  customerType: string;
  createdAt?: string;
  updatedAt?: string;
}

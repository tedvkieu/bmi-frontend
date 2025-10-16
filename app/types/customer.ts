
export type CustomerSubmit = {
  customerId: number;
  name: string;
  address: string;
  email: string;
  dob: string | null;
  phone: string;
  note: string;
  taxCode: string;
  customerType: string;
  createdAt: string;
  updatedAt: string;
}
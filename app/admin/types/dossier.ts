export interface ReceiptResponse {
  pageData: {
    content: Receipt[];
    page: PageInfo;
  };
  total: number;
  obtained: number;
  pending: number;
  notObtained: number;
  notWithinScope: number;
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface Receipt {
  receiptId: number;
  registrationNo: string;
  customerRelatedId: number;
  customerSubmit: Customer;
  customerSubmitName: string;
  customerRelatedName: string;
  inspectionTypeId: string;
  inspectionTypeName: string;
  declarationNo: string;
  billOfLading: string;
  shipName: string;
  cout10: string | null;
  cout20: string | null;
  bulkShip: boolean;
  declarationDoc: string;
  declarationPlace: string;
  inspectionDate: string; // ISO date
  certificateDate: string; // ISO date
  inspectionLocation: string;
  files: string;
  certificateStatus: "PENDING" | "OBTAINED" | "NOT_OBTAINED" | "NOT_WITHIN_SCOPE";
  createdByUserId: number;
  createdByUserName: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface Customer {
  customerId: number;
  name: string;
  address: string;
  email: string;
  dob: string | null;
  phone: string;
  note: string;
  taxCode: string;
  customerType: "SERVICE_MANAGER" | "INDIVIDUAL" | "COMPANY" | string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

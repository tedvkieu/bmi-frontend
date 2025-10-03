export interface MachineryFormData {
  receiptId: number;
  registrationNo: string;
  itemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureCountry: string;
  manufacturerName: string;
  manufacturateYear: number;
  quantity: number;
  usage: string;
  note: string;
}

export interface SubmitReceiptResponse {
  success: boolean;
  message?: string;
  receiptId?: number;
  data?: any;
}

export interface SubmitMachineryResponse {
  success: boolean;
  message?: string;
  machineryId?: number;
  data?: any;
}

export interface InspectionFormData {
  customerId: number;
  serviceAddress: string;
  taxCode: string;
  email: string;
  objectType: "SERVICE_MANAGER" | "IMPORTER";
  inspectionTypeId: string;
}

export interface ReceiptFormData {
  registrationNo: string;
  customerSubmitId: number;
  customerRelatedId: number;
  inspectionTypeId: string;
  declarationNo: string;
  billOfLading: string;
  shipName: string;
  cout10: number;
  cout20: number;
  bulkShip: boolean;
  declarationDoc: string;
  declarationPlace: string;
  inspectionDate: string;
  certificateDate: string;
  inspectionLocation: string;
  certificateStatus: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
}

export interface ObjectTypeOption {
  value: "SERVICE_MANAGER" | "IMPORTER";
  label: string;
}

export interface InspectionTypeOption {
  value: string;
  label: string;
}

export interface CertificateStatusOption {
  value: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  label: string;
}


// components/types/inspection.ts
export interface InspectionReport {
  receiptId: number;
  registrationNo: string;
  customerSubmitId: number;
  customerRelatedId: number;
  inspectionTypeId: string;
  declarationNo: string | null;
  billOfLading: string;
  shipName: string | null;
  cout10: string | null;
  cout20: string | null;
  bulkShip: boolean;
  declarationDoc: string | null;
  declarationPlace: string | null;
  inspectionDate: string | null;
  certificateDate: string | null;
  inspectionLocation: string | null;
  certificateStatus: "PENDING" | "NOT_WITHIN_SCOPE" | "NOT_OBTAINED" | "OBTAINED"; // Adjust as per actual statuses
  createdAt: string;
  updatedAt: string;

  // Add these for UI display, mapping from API fields
  id: string; // Mapped from registrationNo or receiptId
  name: string; // Mapped from registrationNo or billOfLading
  client: string; // You'll need to fetch customer details separately or use a placeholder
  inspector: string; // You'll need to fetch inspector details separately or use a placeholder
  date: string; // Mapped from createdAt or inspectionDate
  type: string; // Mapped from inspectionTypeId
  status: "pending" | "not_within_scope" | "not_obtained" | "obtained"; // Mapped from certificateStatus
}




// Full API response structure if needed for context
export interface ApiResponse {
  content: InspectionReportApi[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Type ReceiptData for getReceiptById response
export interface ReceiptData {
  receiptId: number;
  registrationNo: string;
  customerSubmitId: number;
  customerRelatedId: number;
  customerSubmitName?: string | null;
  customerRelatedName?: string | null;
  inspectionTypeId: string;
  inspectionTypeName?: string | null;
  declarationNo: string | null;
  billOfLading: string;
  shipName: string | null;
  cout10: string | null;
  cout20: string | null;
  bulkShip: boolean;
  declarationDoc: string | null;
  declarationPlace: string | null;
  inspectionDate: string | null;
  certificateDate: string | null;
  inspectionLocation: string | null;
  certificateStatus: "PENDING" | "NOT_WITHIN_SCOPE" | "NOT_OBTAINED" | "OBTAINED";
  createdByUserId?: number | null;
  createdByUserName?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Type matching the API's 'content' array directly
export interface InspectionReportApi {
  receiptId: number;
  registrationNo: string;
  customerSubmitId: number;
  customerRelatedId: number;
  customerSubmitName?: string | null;
  customerRelatedName?: string | null;
  inspectionTypeId: string;
  inspectionTypeName?: string | null;
  declarationNo: string | null;
  billOfLading: string;
  shipName: string | null;
  cout10: string | null;
  cout20: string | null;
  bulkShip: boolean;
  declarationDoc: string | null;
  declarationPlace: string | null;
  inspectionDate: string | null;
  certificateDate: string | null;
  inspectionLocation: string | null;
  certificateStatus: "PENDING" | "NOT_WITHIN_SCOPE" | "NOT_OBTAINED" | "OBTAINED"; // Adjust based on actual values
  createdByUserId?: number | null;
  createdByUserName?: string | null;
  createdAt: string;
  updatedAt: string;
}

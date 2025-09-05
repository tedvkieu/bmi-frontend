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

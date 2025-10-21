export interface Customer {
  id: string;
  name: string;
  address: string;
  taxCode: string;
  phone: string;
  email: string;
}

export interface InspectionType {
  id: string;
  name: string;
}

export interface UserSummary {
  id: string;
  name: string;
}

export interface DossierDetails {
  dossierId: number;
  registrationNo: string;
  registrationDate: string; 
  dailySeqNo: number;
  declarationNo: string;
  declarationDate: string;
  invoiceNo: string;
  invoiceDate: string;
  billOfLading: string;
  billOfLadingDate: string;
  shipName: string;
  cout10: number;
  cout20: number;
  bulkShip: boolean;
  contact: string | null;
  declarationDoc: string;
  declarationPlace: string;
  inspectionLocation: string;
  inspectionDate: string;
  scheduledInspectionDate?: string | null;
  certificateDate: string;
  certificateStatus: "PENDING" | "APPROVED" | "REJECTED" | string;
  files: string;
  archiveId: string | null;
  isUploaded: boolean;
  createdAt: string;
  updatedAt: string;

  customerSubmit: Customer;
  customerRelated: Customer;
  inspectionType: InspectionType;
  createdByUser: UserSummary;
  updatedByUser: UserSummary;
}

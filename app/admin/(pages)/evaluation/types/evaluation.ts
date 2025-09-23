// types/evaluation.ts
export interface DossierInfo {
  receiptId: number;
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
  files: string;
  certificateStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  teamId: number;
  dossierId: number;
  userId: number;
  fullName: string;
  roleId: number;
  roleCode: string;
  roleName: string;
  assignedDate: string;
  isActive: boolean;
  // Comma-separated tasks like "A,C" indicating assigned sections
  assignTask?: string;
}

export interface Category {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  categoryOrder: number;
  isActive: boolean;
}

export interface Criteria {
  criteriaId: number;
  categoryId: number;
  criteriaCode: string;
  criteriaOrder: number;
  criteriaText: string;
  inputType: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface EvaluationData {
  [criteriaId: number]: "YES" | "NO" | null;
}

export interface DocumentType {
  documentTypeId: number;
  typeCode: string;
  typeName: string;
  typeNameEnglish: string;
  category: string;
  isRequired: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface DocumentCheckData {
  [documentTypeId: number]: {
    hasHardCopy: boolean;
    hasElectronic: boolean;
  };
}

export interface InspectorUser {
  userId: number;
  fullName: string;
}

export interface Certification {
    certificationId: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCategory {
    productCategoryId: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserCertification {
    userId: number;
    certificationId: number;
    obtainedDate?: string;
    expiryDate?: string;
    certificateNumber?: string;
    issuingOrganization?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserProductCategory {
    userId: number;
    productCategoryId: number;
    assignedDate?: string;
    experienceLevel?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CertificationFormData {
    name: string;
    description?: string;
}

export interface ProductCategoryFormData {
    name: string;
    description?: string;
}

export interface UserCertificationFormData {
    certificationIds: number[];
    obtainedDate?: string;
    expiryDate?: string;
    certificateNumber?: string;
    issuingOrganization?: string;
}

export interface UserProductCategoryFormData {
    productCategoryIds: number[];
    assignedDate?: string;
    experienceLevel?: string;
    notes?: string;
}

export interface QualifiedInspectorSearchParams {
    certificationId?: number;
    productCategoryId?: number;
}

export interface InspectorQualificationCheck {
    userId: number;
    hasCertification: boolean;
    hasProductCategory: boolean;
    isQualified: boolean;
}

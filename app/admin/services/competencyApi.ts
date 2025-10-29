import { authApi } from "../../services/authApi";

// ==================== TYPES ====================

export interface Certification {
    certificationId: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCategory {
    productCategoryId: number;
    name: string;
    description?: string;
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

export interface QualifiedInspector {
    userId: number;
    fullName: string;
    email: string;
    phone?: string;
    certificationName: string;
    productCategoryName: string;
    qualificationScore?: number;
    isQualified?: boolean;
}

export interface QualifiedInspectorResponse {
    success: boolean;
    message: string;
    data: QualifiedInspector[];
}

export interface InspectorQualificationCheck {
    userId: number;
    hasCertification: boolean;
    hasProductCategory: boolean;
    isQualified: boolean;
}

// ==================== REQUEST TYPES ====================

export interface CertificationFormData {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface ProductCategoryFormData {
    name: string;
    description?: string;
    isActive?: boolean;
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

// ==================== RESPONSE TYPES ====================

export interface PaginatedResponse<T> {
    data: T[];
    totalPages: number;
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
}

export interface BackendError {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    path?: string;
}

// ==================== API SERVICE ====================

class CompetencyApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = authApi.getToken();
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (token) {
            (headers as any).Authorization = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData: BackendError = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // ==================== CERTIFICATIONS ====================

    async getCertifications(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<PaginatedResponse<Certification>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());
        if (params?.status) searchParams.append("status", params.status);

        const query = searchParams.toString();
        const url = `/api/certifications${query ? `?${query}` : ""}`;

        return await this.request<PaginatedResponse<Certification>>(url);
    }

    async getActiveCertifications(params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Certification>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());

        const query = searchParams.toString();
        const url = `/api/certifications/active${query ? `?${query}` : ""}`;

        return await this.request<PaginatedResponse<Certification>>(url);
    }

    async getInactiveCertifications(params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Certification>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());

        const query = searchParams.toString();
        const url = `/api/certifications/inactive${query ? `?${query}` : ""}`;

        return await this.request<PaginatedResponse<Certification>>(url);
    }

    async createCertification(data: CertificationFormData): Promise<Certification> {
        return this.request<Certification>("/api/certifications", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateCertification(id: number, data: CertificationFormData): Promise<Certification> {
        return this.request<Certification>(`/api/certifications/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async deleteCertification(id: number): Promise<void> {
        return this.request<void>(`/api/certifications/${id}`, {
            method: "DELETE",
        });
    }

    async searchCertifications(keyword: string): Promise<PaginatedResponse<Certification>> {
        const searchParams = new URLSearchParams();
        if (keyword?.trim()) {
            searchParams.append("q", keyword.trim());
        }
        const query = searchParams.toString();
        const url = `/api/certifications/search${query ? `?${query}` : ""}`;
        return await this.request<PaginatedResponse<Certification>>(url);
    }

    // ==================== PRODUCT CATEGORIES ====================

    async getProductCategories(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<PaginatedResponse<ProductCategory>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());
        if (params?.status) searchParams.append("status", params.status);

        const query = searchParams.toString();
        const url = `/api/product-categories${query ? `?${query}` : ""}`;

        return await this.request<PaginatedResponse<ProductCategory>>(url);
    }

    async getActiveProductCategories(params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<ProductCategory>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());

        const query = searchParams.toString();
        const url = `/api/product-categories/active${query ? `?${query}` : ""}`;

        return await this.request<PaginatedResponse<ProductCategory>>(url);
    }

    async getInactiveProductCategories(params?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<ProductCategory>> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());

        const query = searchParams.toString();
        const url = `/api/product-categories/inactive${query ? `?${query}` : ""}`;

        return await this.request<PaginatedResponse<ProductCategory>>(url);
    }

    async createProductCategory(data: ProductCategoryFormData): Promise<ProductCategory> {
        return this.request<ProductCategory>("/api/product-categories", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateProductCategory(id: number, data: ProductCategoryFormData): Promise<ProductCategory> {
        return this.request<ProductCategory>(`/api/product-categories/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async deleteProductCategory(id: number): Promise<void> {
        return this.request<void>(`/api/product-categories/${id}`, {
            method: "DELETE",
        });
    }

    async searchProductCategories(keyword: string): Promise<PaginatedResponse<ProductCategory>> {
        const searchParams = new URLSearchParams();
        if (keyword?.trim()) {
            searchParams.append("q", keyword.trim());
        }
        const query = searchParams.toString();
        const url = `/api/product-categories/search${query ? `?${query}` : ""}`;
        return await this.request<PaginatedResponse<ProductCategory>>(url);
    }

    // ==================== USER CERTIFICATIONS ====================

    async getUserCertifications(userId: number): Promise<UserCertification[]> {
        const response = await this.request<{ data: UserCertification[] }>(`/api/users/${userId}/competency/certifications`);
        return response.data || [];
    }

    async assignUserCertifications(userId: number, data: UserCertificationFormData): Promise<void> {
        return this.request<void>(`/api/users/${userId}/certifications`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async removeUserCertifications(userId: number, certificationIds: number[]): Promise<void> {
        return this.request<void>(`/api/users/${userId}/certifications`, {
            method: "DELETE",
            body: JSON.stringify({ certificationIds }),
        });
    }

    // ==================== USER PRODUCT CATEGORIES ====================

    async getUserProductCategories(userId: number): Promise<UserProductCategory[]> {
        const response = await this.request<{ data: UserProductCategory[] }>(`/api/users/${userId}/competency/product-categories`);
        return response.data || [];
    }

    async assignUserProductCategories(userId: number, data: UserProductCategoryFormData): Promise<void> {
        return this.request<void>(`/api/users/${userId}/product-categories`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async removeUserProductCategories(userId: number, productCategoryIds: number[]): Promise<void> {
        return this.request<void>(`/api/users/${userId}/product-categories`, {
            method: "DELETE",
            body: JSON.stringify({ productCategoryIds }),
        });
    }

    // ==================== QUALIFIED INSPECTORS ====================

    async getQualifiedInspectors(params: QualifiedInspectorSearchParams): Promise<QualifiedInspectorResponse> {
        const searchParams = new URLSearchParams();
        if (params.certificationId) searchParams.append("certificationId", params.certificationId.toString());
        if (params.productCategoryId) searchParams.append("productCategoryId", params.productCategoryId.toString());

        const query = searchParams.toString();
        return this.request<QualifiedInspectorResponse>(`/api/inspectors/qualified${query ? `?${query}` : ""}`);
    }

    async checkInspectorQualification(userId: number, params: QualifiedInspectorSearchParams): Promise<InspectorQualificationCheck> {
        return this.request<InspectorQualificationCheck>(`/api/inspectors/${userId}/qualification-check`, {
            method: "POST",
            body: JSON.stringify(params),
        });
    }
}

export const competencyApi = new CompetencyApiService();

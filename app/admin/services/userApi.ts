import { authApi } from "../../services/authApi";

export type UserRole =
    | "ADMIN"
    | "MANAGER"
    | "INSPECTOR"
    | "DOCUMENT_STAFF"
    | "ISO_STAFF"
    | "CUSTOMER"
    | "GUEST";

export interface UserRequest {
    fullName: string;
    dob: string | null;
    role: UserRole;
    username: string;
    passwordHash?: string;
    email: string;
    phone?: string;
    note?: string;
    isActive: boolean;
}

export interface UserResponse {
    userId: number;
    fullName: string;
    dob: string | null;
    role: UserRole;
    username: string;
    email: string;
    phone?: string;
    note?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserDossierStatsResponse {
    userId: number;
    total: number;
    obtained: number;
    notObtained: number;
    pending: number;
    notWithinScope: number;
    byStatus?: Record<string, number>;
}

export interface BackendError {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
}

export interface PaginatedUserResponse {
    content: UserResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export interface ReceiptResponseLite {
    receiptId: number;
    registrationNo: string;
    certificateStatus: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedReceiptResponse {
    content: ReceiptResponseLite[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

function authHeaders() {
    const token = authApi.getToken();
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    } as Record<string, string>;
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (res.ok) return res.json();
    const data = (await res.json().catch(() => ({}))) as BackendError;
    const msg = data?.message || data?.error || "Có lỗi xảy ra";
    throw new Error(msg);
}

export const userApi = {
    async getMe() {
        const res = await fetch(`/api/profile/me`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<{ userId: number; username: string; email: string; role: UserRole }>(res);
    },

    async getAdminStatus() {
        const res = await fetch(`/api/users/admin/status`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<{ hasAdmin: boolean; canCreateAdmin: boolean; isOnlyAdmin: boolean }>(res);
    },
   async getAllUsersPage(
    page: number,
    size: number,
    search: string | null = null,
    role: string | null = null
): Promise<PaginatedUserResponse> {
    const token = authApi.getToken();
    if (!token) throw new Error("No authentication token found.");

    // Build query params
    const params: Record<string, string> = {
        page: page.toString(),
        size: size.toString(),
    };
    if (search) params.search = search;
    if (role && role !== 'all') params.role = role;

    const queryString = new URLSearchParams(params).toString();

    const response = await fetch(`/api/users/page?${queryString}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch users");
    }

    return response.json();
},


    async getAll(): Promise<UserResponse[]> {
        const res = await fetch(`/api/users`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<UserResponse[]>(res);
    },

    async getStaff(): Promise<UserResponse[]> {
        const res = await fetch(`/api/users/staff`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<UserResponse[]>(res);
    },

    async getById(id: number): Promise<UserResponse> {
        const res = await fetch(`/api/users/${id}`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<UserResponse>(res);
    },

    async searchByUsername(username: string): Promise<UserResponse> {
        const res = await fetch(`/api/users/username/${encodeURIComponent(username)}`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<UserResponse>(res);
    },

    async searchByEmail(email: string): Promise<UserResponse> {
        const res = await fetch(`/api/users/email/${encodeURIComponent(email)}`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<UserResponse>(res);
    },

    async create(body: UserRequest): Promise<UserResponse> {
        const res = await fetch(`/api/users`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<UserResponse>(res);
    },

    async createStaff(body: UserRequest): Promise<UserResponse> {
        const res = await fetch(`/api/users/staff`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<UserResponse>(res);
    },

    async update(id: number, body: UserRequest): Promise<UserResponse> {
        const payload = { ...body } as UserRequest;
        if (!payload.passwordHash) delete (payload as any).passwordHash;
        const res = await fetch(`/api/users/${id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(payload),
        });
        return handleResponse<UserResponse>(res);
    },

    async remove(id: number): Promise<void> {
        const res = await fetch(`/api/users/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as BackendError;
            throw new Error(data?.message || data?.error || "Xóa thất bại");
        }
    },

    async getDossierStats(userId: number): Promise<UserDossierStatsResponse> {
        const res = await fetch(`/api/users/${userId}/dossier-stats`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<UserDossierStatsResponse>(res);
    },

    async getDossiersByUser(userId: number, page = 0, size = 10): Promise<PaginatedReceiptResponse> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        const res = await fetch(`/api/users/${userId}/dossiers?${params.toString()}`, {
            headers: authHeaders(),
            cache: "no-store",
        });
        return handleResponse<PaginatedReceiptResponse>(res);
    },
};



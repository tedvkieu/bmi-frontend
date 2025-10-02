import { authApi } from "@/app/services/authApi";

// services/customerApi.ts
export type CustomerResponse = {
    customerId: number;
    name: string;
    address: string;
    email: string;
    dob: string | null;
    phone: string | null;
    note: string | null;
    taxCode: string;
    customerType: "IMPORTER" | "SERVICE_MANAGER"; // Added types
    createdAt: string;
    updatedAt: string;
};

export type CustomerUpdateRequest = {
    name: string;
    address: string;
    email: string;
    dob: string | null;
    phone: string | null;
    note: string | null;
    taxCode: string;
    customerType: "IMPORTER" | "SERVICE_MANAGER";
};

// Also define a specific type for the unactive customer list if it's different
export type UnactiveCustomer = {
    customerId: number;
    name: string;
    email: string;
    phone: string;
    customerType: "IMPORTER" | "SERVICE_MANAGER";
    // Add any other fields your unactive API returns
};

export type DocumentRequest = {
    customerId: number;
    name: string;
    address: string;
    email: string;
    dob: string | null;
    phone: string;
    note: string | null;
    taxCode: string;
    customerType: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustPublicResponse {
    customerId: number;
    email: string;
    isActivated: number;
}

export interface CustomerLoginRequest {
    email: string;
    password: string;
}

export interface CustomerLoginResponse {
    token: string;
    type: string;
    customerId: number;
    email: string;
    fullName: string;
    customerType: string; // "IMPORTER", "SERVICE_MANAGER", ...
}

export interface CustomerUser {
    customerId: number;
    email: string;
    fullName: string;
    customerType: string;
}

export interface Customer {
    username: string;
    email: string;
    role: string;
    fullName: string;
    userId: number;
}


export const customerApi = {
    // Existing customer API methods (if any) for the main table
    async getAllCustomers(page: number, size: number, searchTerm: string, customerType: string): Promise<any> {
        const token = authApi.getToken(); // Assuming authApi.getToken exists
        if (!token) throw new Error("No authentication token found.");


        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });

        if (searchTerm) {
            params.append("search", searchTerm);
        }
        if (customerType && customerType !== "all") {
            params.append("customerType", customerType);
        }

        const response = await fetch(`/api/customers?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch customers");
        }
        return response.json();
    },

    async getCustomerById(customerId: number): Promise<CustomerResponse[]> {
        const token = authApi.getToken();
        if (!token) throw new Error("No authentication token found.");
        const response = await fetch(`/api/customers/${customerId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch customer by id");
        }
        return response.json();
    },
    updateCustomer: async (id: number, customerData: CustomerUpdateRequest): Promise<Customer> => {
        const token = authApi.getToken();
        if (!token) throw new Error("No authentication token found.");

        const response = await fetch(`/api/customers/${id}`, {
            method: 'PUT', // Specify PUT method
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData), // Send the customerData as JSON in the request body
        });

        if (!response.ok) {
            const errorData = await response.json(); // Assuming backend sends error details as JSON
            throw new Error(errorData.message || `Failed to update customer with ID ${id}`);
        }
        return response.json(); // Return the updated customer data from the response
    },
    deleteCustomerById: async (id: number): Promise<void> => {
        const token = authApi.getToken();
        if (!token) throw new Error("No authentication token found.");

        const response = await fetch(`/api/customers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let errorMessage = `Failed to delete customer with ID ${id}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
            }
            throw new Error(errorMessage);
        }
    },


    async getUnactiveCustomers(): Promise<UnactiveCustomer[]> { // Using UnactiveCustomer type
        const token = authApi.getToken();
        if (!token) throw new Error("No authentication token found.");
        const response = await fetch("/api/customers/unactive", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch unactive customers");
        }
        return response.json();
    },

    async approveCustomer(customerId: number): Promise<{ success: boolean; message: string }> {
        const token = authApi.getToken();
        if (!token) throw new Error("No authentication token found.");

        const response = await fetch(`/api/customers/approve/${customerId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            // cố gắng parse JSON nếu có, fallback sang thông báo chung
            let errorMessage = `Failed to approve customer ${customerId}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch { }
            throw new Error(errorMessage);
        }

        // Nếu response có body, parse JSON, nếu không trả về mặc định
        let data: { success: boolean; message: string } = { success: true, message: "Đã duyệt thành công" };
        try {
            data = await response.json();
        } catch { }

        return data;
    },


    async rejectCustomer(customerId: number): Promise<{ success: boolean; message: string }> {
        const token = authApi.getToken();
        if (!token) throw new Error("No authentication token found.");

        const response = await fetch(`/api/customers/reject/${customerId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        let data: any = { success: true, message: "Tài khoản đã bị từ chối" };
        try {
            data = await response.json();
        } catch { }

        if (!response.ok) {
            throw new Error(data.message || `Failed to reject customer ${customerId}`);
        }

        return data;
    },
    async getCustomerByEmail(email: string): Promise<CustPublicResponse | null> {
        const token = authApi.getToken();
        if (!token) throw new Error("No authentication token");

        const res = await fetch(`/api/customers/email?email=${encodeURIComponent(email)}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            console.error("Failed to fetch customer by email");
            return null;
        }

        const result = await res.json();
        if (!result.success) return null;

        return result.data;
    },
    // Lấy token chỉ từ cookie
    getToken(): string | null {
        return this.getTokenFromCookie();
    },

    // Lấy token từ cookie
    getTokenFromCookie(): string | null {
        if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
            return tokenCookie ? tokenCookie.split('=')[1] : null;
        }
        return null;
    },

    // Decode JWT payload (no verification), return null on error
    decodeJwt<T = any>(token?: string | null): T | null {
        try {
            const t = token ?? this.getTokenFromCookie();
            if (!t) return null;
            const parts = t.split('.');
            if (parts.length < 2) return null;
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8');
            return JSON.parse(json) as T;
        } catch {
            return null;
        }
    },

    // Get role from JWT in cookie
    getRoleFromToken(): string | null {
        const payload = this.decodeJwt<{ role?: string }>();
        return payload?.role || null;
    },

    // Get userId from JWT in cookie
    getUserIdFromToken(): number | null {
        const payload = this.decodeJwt<{ userId?: number }>();
        return (payload?.userId as number) ?? null;
    },

    // Lấy user info từ JWT (không dùng localStorage)
    getUser(): Customer | null {
        const payload = this.decodeJwt<{ sub?: string; email?: string; role?: string; userId?: number; fullName?: string }>();
        if (!payload) return null;
        return {
            username: payload.sub || '',
            email: payload.email || '',
            role: payload.role || '',
            fullName: payload.fullName || payload.sub || '',
            userId: (payload.userId as number) ?? 0,
        };
    },

    // Xóa auth data
    clearAuthData(): void {
        if (typeof window !== 'undefined') {
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    },

    // Kiểm tra xem user đã đăng nhập chưa
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

};
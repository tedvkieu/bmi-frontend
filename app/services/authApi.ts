export interface LoginRequest {
    email: string;
    password: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    username: string;
    email: string;
    role: string;
    fullName: string;
    userId: number;
    mustChangePassword: boolean
}

export interface User {
    username: string;
    email: string;
    role: string;
    fullName: string;
    userId: number;
    phoneNumber?: string;
    address?: string;
}

export const authApi = {
    async loginAdmin(credentials: LoginRequest): Promise<LoginResponse> {
        // Use Next.js API proxy
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Đăng nhập thất bại');
        }

        return response.json();
    },
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        // Use Next.js API proxy
        const response = await fetch('/api/customers/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Đăng nhập thất bại');
        }

        return response.json();
    },

    // Lưu token vào cookie (không dùng localStorage)
    saveAuthData(authData: LoginResponse): void {
        if (typeof window !== 'undefined') {
            document.cookie = `token=${authData.token}; path=/; max-age=86400; secure; samesite=strict`;
        }
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
    getUser(): User | null {
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
    },

    // Đổi mật khẩu
    async changePassword(credentials: ChangePasswordRequest): Promise<{ message: string }> {
        const response = await fetch('/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Đổi mật khẩu thất bại');
        }

        return response.json();
    }
};

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    username: string;
    email: string;
    position: string;
    fullName: string;
    employeeId: number;
}

export interface User {
    username: string;
    email: string;
    position: string;
    fullName: string;
    employeeId: number;
}

export const authApi = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
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

    // Lưu token và user info vào localStorage và cookie
    saveAuthData(authData: LoginResponse): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', authData.token);
            localStorage.setItem('user', JSON.stringify({
                username: authData.username,
                email: authData.email,
                position: authData.position,
                fullName: authData.fullName,
                employeeId: authData.employeeId,
            }));

            // Lưu token vào cookie
            document.cookie = `token=${authData.token}; path=/; max-age=86400; secure; samesite=strict`;
        }
    },

    // Lấy token từ localStorage hoặc cookie
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token') || this.getTokenFromCookie();
        }
        return null;
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

    // Lấy user info từ localStorage
    getUser(): User | null {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    },

    // Xóa auth data
    clearAuthData(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    },

    // Kiểm tra xem user đã đăng nhập chưa
    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};

"use client";

import React, { useState, useEffect } from "react";
import { authApi, LoginRequest } from "../../services/authApi";
import AuthCard from "../../auth/components/AuthCard";
import FormInput from "../../auth/components/FormInput";

interface LoginWrapperProps {
    children: React.ReactNode;
}

const LoginWrapper: React.FC<LoginWrapperProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // Kiểm tra xem user đã đăng nhập chưa
        const checkAuth = () => {
            const token = authApi.getToken();
            if (token) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const loginData: LoginRequest = {
                email: formData.email,
                password: formData.password,
            };

            const response = await authApi.login(loginData);

            // Lưu thông tin đăng nhập
            authApi.saveAuthData(response);

            // console.log("Login successful:", response);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error("Login error:", error);
            setErrors({ general: error.message || "Đăng nhập thất bại. Vui lòng thử lại." });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Đang kiểm tra đăng nhập...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <AuthCard
                        title="Đăng nhập để tiếp tục"
                        subtitle="Vui lòng đăng nhập để truy cập trang quản trị"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-600 text-sm">{errors.general}</p>
                                </div>
                            )}

                            <FormInput
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Nhập email của bạn"
                                required
                                error={errors.email}
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                }
                            />

                            <FormInput
                                id="password"
                                name="password"
                                label="Mật khẩu"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu của bạn"
                                required
                                error={errors.password}
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors font-medium"
                            >
                                Đăng nhập
                            </button>
                        </form>
                    </AuthCard>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default LoginWrapper;

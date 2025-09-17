"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import { authApi, LoginRequest } from "../../services/authApi";

const LoginPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleRegisterClick = () => {
        router.push('/auth/register');
    }

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 5000);
        }
    }, [searchParams]);

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

        setIsLoading(true);

        try {
            const loginData: LoginRequest = {
                email: formData.email,
                password: formData.password,
            };

            const response = await authApi.login(loginData);

            authApi.saveAuthData(response);

            const role = authApi.getRoleFromToken();

            if (role === "ADMIN") {
                router.push("/admin");
            } else if (role === "CUSTOMER") {
                router.push("/");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            setErrors({ general: error.message || "Đăng nhập thất bại. Vui lòng thử lại." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard
            title="Đăng nhập"
            subtitle="Chào mừng bạn quay trở lại"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {showSuccessMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-600 text-sm">Đăng ký thành công! Vui lòng đăng nhập với thông tin của bạn.</p>
                        </div>
                    </div>
                )}

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

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                    </label>
                    <Link
                        href="/auth/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang đăng nhập...
                        </div>
                    ) : (
                        "Đăng nhập"
                    )}
                </button>

                <p className="text-center text-sm text-gray-600">
                    Chưa có tài khoản?{" "}
                    <button
                        type="button"
                        onClick={handleRegisterClick}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        Đăng ký
                    </button>
                </p>

            </form>
        </AuthCard>
    );
};

export default LoginPage;

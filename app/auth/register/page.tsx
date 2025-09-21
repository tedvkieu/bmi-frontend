"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import { MdHome } from "react-icons/md";

const RegisterPage: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

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

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Họ tên là bắt buộc";
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
        }

        if (!formData.email) {
            newErrors.email = "Email là bắt buộc";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ";
        }

        if (!formData.phone) {
            newErrors.phone = "Số điện thoại là bắt buộc";
        } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
            newErrors.phone = "Số điện thoại không hợp lệ";
        }

        // Kiểm tra mật khẩu
        if (!formData.password) {
            newErrors.password = "Mật khẩu là bắt buộc";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.password)) {
            newErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số";
        }

        // Kiểm tra xác nhận mật khẩu
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
        } else if (formData.password && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
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
            await new Promise(resolve => setTimeout(resolve, 1500));
            const respionse = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!respionse.ok) {
                const errorData = await respionse.json();
                throw new Error(errorData.message || "Đăng ký thất bại");
            }

            router.push("/auth/login?registered=true");
        } catch (error) {
            console.error("Register error:", error);
            setErrors({ general: "Đăng ký thất bại. Vui lòng thử lại." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => router.push('/')}
                className="absolute top-4 left-4 flex items-center gap-1 px-4 py-2 text-gray-800 text-xs font-semibold z-10" // Added z-10 for good measure
            >
                <MdHome className="text-2xl text-gray-600 hover:text-blue-500" size={26} />
            </button>
            <AuthCard
                title="Đăng ký tài khoản"
                subtitle="Tạo tài khoản mới để bắt đầu"
            >
                <form onSubmit={handleSubmit} className="space-y-6 text-sm ">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    <FormInput
                        name="fullName"
                        id="fullName"
                        label="Họ và tên"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ tên đầy đủ"
                        required
                        error={errors.fullName}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    />

                    <FormInput
                        name="email"
                        id="email"
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
                        name="phone"
                        id="phone"
                        label="Số điện thoại"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                        required
                        error={errors.phone}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        }
                    />

                    <FormInput
                        name="password"
                        id="password"
                        label="Mật khẩu"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Nhập mật khẩu mạnh"
                        required
                        error={errors.password}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                    />

                    <FormInput
                        name="confirmPassword"
                        id="confirmPassword"
                        label="Xác nhận mật khẩu"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Nhập lại mật khẩu"
                        required
                        error={errors.confirmPassword}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-gray-600">
                                Tôi đồng ý với{" "}
                                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                                    Điều khoản sử dụng
                                </Link>{" "}
                                và{" "}
                                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                                    Chính sách bảo mật
                                </Link>
                            </label>
                        </div>
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
                                Đang tạo tài khoản...
                            </div>
                        ) : (
                            "Tạo tài khoản"
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-gray-600">
                            Đã có tài khoản?{" "}
                            <Link
                                href="/auth/login"
                                className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                            >
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </form>
            </AuthCard>
        </div>
    );
};

export default RegisterPage;

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../admin/component/AdminLayout";
import { authApi } from "../services/authApi";
import { userApi } from "../admin/services/userApi";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";

interface ChangePasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const SettingsPage: React.FC = () => {
    const router = useRouter();
    const [form, setForm] = useState<ChangePasswordForm>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currentUser = authApi.getUser();
    const userRole = authApi.getRoleFromToken();
    const isAdmin = userRole === "ADMIN";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const validateForm = (): string | null => {
        if (!form.currentPassword.trim()) {
            return "Vui lòng nhập mật khẩu hiện tại";
        }
        if (!form.newPassword.trim()) {
            return "Vui lòng nhập mật khẩu mới";
        }
        if (form.newPassword.length < 6) {
            return "Mật khẩu mới phải có ít nhất 6 ký tự";
        }
        if (form.newPassword !== form.confirmPassword) {
            return "Mật khẩu xác nhận không khớp";
        }
        if (form.currentPassword === form.newPassword) {
            return "Mật khẩu mới phải khác mật khẩu hiện tại";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            if (isAdmin) {
                // Sử dụng API admin change password
                await userApi.adminChangePassword({
                    userId: currentUser?.userId || 0,
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                    confirmPassword: form.confirmPassword,
                });
            } else {
                // Fallback cho non-admin (không nên xảy ra vì đã check role)
                await authApi.changePassword({
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                });
            }

            toast.success("Đổi mật khẩu thành công!");
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err: any) {
            setError(err?.message || "Đổi mật khẩu thất bại");
            toast.error("Đổi mật khẩu thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Cài đặt tài khoản
                            </h1>
                            <p className="text-gray-600">
                                Quản lý thông tin tài khoản và bảo mật
                            </p>
                        </div>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            ← Quay lại
                        </button>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {currentUser?.fullName || "Người dùng"}
                            </h3>
                            <p className="text-gray-600">{currentUser?.email}</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                {currentUser?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Đổi mật khẩu
                            </h2>
                            <p className="text-gray-600">
                                {isAdmin
                                    ? "Cập nhật mật khẩu để bảo mật tài khoản của bạn"
                                    : "Quản lý mật khẩu tài khoản"
                                }
                            </p>
                        </div>
                    </div>

                    {isAdmin ? (
                        <>
                            {error && (
                                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu hiện tại
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={form.currentPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Nhập mật khẩu hiện tại"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility("current")}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            disabled={loading}
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            value={form.newPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility("new")}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            disabled={loading}
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Nhập lại mật khẩu mới"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility("confirm")}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            disabled={loading}
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Requirements */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                                        Yêu cầu mật khẩu:
                                    </h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Tối thiểu 6 ký tự</li>
                                        <li>• Khác với mật khẩu hiện tại</li>
                                        <li>• Khuyến nghị sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Đang xử lý...</span>
                                            </>
                                        ) : (
                                            <span>Đổi mật khẩu</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* Non-admin users message */
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                                Không thể đổi mật khẩu
                            </h3>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-amber-800">
                                            Liên hệ quản trị viên hoặc quản lý cấp trên
                                        </p>
                                        <p className="text-sm text-amber-700">
                                            Để được hỗ trợ cấp lại mật khẩu
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleBack}
                                className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Quay lại
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default SettingsPage;

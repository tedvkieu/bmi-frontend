"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AuthPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Chào mừng đến với BMI Inspection
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Hệ thống quản lý giám định và kiểm tra chất lượng
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => router.push("/auth/login")}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors font-medium"
                        >
                            Đăng nhập
                        </button>

                        {/* <button
                            onClick={() => router.push("/auth/register")}
                            className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg border border-blue-600 hover:bg-blue-50 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors font-medium"
                        >
                            Đăng ký tài khoản
                        </button> */}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Bạn có thể truy cập{" "}
                            <Link
                                href="/admin"
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                trang quản trị
                            </Link>{" "}
                            để xem demo
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

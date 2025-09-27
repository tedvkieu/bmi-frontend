"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, User } from "../../services/authApi"; // Đảm bảo đường dẫn này đúng

const UserMenu: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userData = authApi.getUser();
        setUser(userData);
    }, []);

    const handleLogout = () => {
        authApi.clearAuthData();
        router.push("/auth/login");
    };

    const showProfile = () => {
        router.push("/profile");
        setIsOpen(false); // Đóng menu sau khi click
    };

    const showSettings = () => {
        router.push("/settings"); // Giả định bạn có trang cài đặt
        setIsOpen(false);
    };

    const showActivityLog = () => {
        router.push("/activity-log"); // Giả định bạn có trang nhật ký hoạt động
        setIsOpen(false);
    };

    if (!user) return null;

    // Lấy chữ cái đầu của tên để làm avatar fake
    const getInitials = (fullName: string) => {
        if (!fullName) return "";
        const parts = fullName.split(' ');
        if (parts.length > 1) {
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        return fullName.charAt(0).toUpperCase();
    };

    const userInitials = getInitials(user.fullName);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1" // Thêm focus styles
            >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-md font-semibold shadow-sm">
                    {userInitials}
                </div>
                <div className="text-left hidden md:block"> {/* Ẩn tên và vai trò trên màn hình nhỏ */}
                    <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Overlay để đóng menu khi click ra ngoài */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden transform transition-all duration-200 ease-out origin-top-right">
                        {/* Thông tin người dùng ở đầu menu */}
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-md">
                                    {userInitials}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{user.fullName}</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <p className="text-xs text-blue-600 mt-1 px-2 py-0.5 bg-blue-100 rounded-full inline-block">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Các mục điều hướng */}
                        <div className="py-2">
                            <button
                                onClick={showProfile}
                                className="w-full text-left px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-3 focus:outline-none"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Hồ sơ cá nhân</span>
                            </button>
                            <button
                                onClick={showSettings}
                                className="w-full text-left px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-3 focus:outline-none"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.53-.325 1.157-.598 1.817-.824zm-.94 13.918c-1.189 0-2.16-2.073-2.16-4.66S8.196 9 9.385 9c1.189 0 2.16 2.073 2.16 4.66s-.971 4.658-2.16 4.658z" />
                                </svg>
                                <span>Cài đặt tài khoản</span>
                            </button>
                            <button
                                onClick={showActivityLog}
                                className="w-full text-left px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-3 focus:outline-none"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Nhật ký hoạt động</span>
                            </button>
                        </div>

                        {/* Mục đăng xuất */}
                        <div className="py-2 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3 focus:outline-none"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserMenu;
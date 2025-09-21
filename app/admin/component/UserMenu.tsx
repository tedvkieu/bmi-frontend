"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, User } from "../../services/authApi";


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
    }

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div onClick={showProfile} className="p-4 border-b border-gray-200 hover:bg-gray-200 cursor-pointer">
                            <p className="font-medium text-gray-900">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.role}</p>
                        </div>

                        <div className="py-2">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

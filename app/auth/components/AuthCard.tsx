"use client";
import React from "react";

interface AuthCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-8">
                {/* <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
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
                </div> */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                {subtitle && (
                    <p className="text-gray-600">{subtitle}</p>
                )}
            </div>
            {children}
        </div>
    );
};

export default AuthCard;

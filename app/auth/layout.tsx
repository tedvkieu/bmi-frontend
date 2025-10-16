"use client";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full sm:max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

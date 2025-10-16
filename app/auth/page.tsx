"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, ArrowRight, ChevronLeft } from "lucide-react";

const AuthPage: React.FC = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"customer" | "admin" | null>(
    null
  );

  const handleRoleSelection = (role: "customer" | "admin") => {
    setSelectedRole(role);

    // Smooth transition delay
    setTimeout(() => {
      if (role === "customer") {
        router.push("/auth/login");
      } else {
        router.push("/auth/admin/login");
      }
    }, 300);
  };

  const resetSelection = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            BMI Inspection
          </h1>
          <p className="text-gray-600 text-lg">
            Hệ thống quản lý giám định và kiểm tra chất lượng
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          {!selectedRole ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Bạn là ai?
              </h2>
              <p className="text-gray-600 mb-8 text-center">
                Vui lòng chọn vai trò của bạn để tiếp tục
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Card */}
                <button
                  onClick={() => handleRoleSelection("customer")}
                  className="group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-left"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="text-blue-600" size={24} />
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Khách hàng
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Tra cứu và quản lý hồ sơ giám định của bạn
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center space-x-2 text-blue-600 font-medium">
                    <span>Đăng nhập</span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>

                {/* Admin Card */}
                <button
                  onClick={() => handleRoleSelection("admin")}
                  className="group relative bg-gradient-to-br from-indigo-50 to-purple-100 hover:from-indigo-100 hover:to-purple-200 rounded-xl p-8 border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-left"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="text-indigo-600" size={24} />
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Quản trị viên
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Quản lý hệ thống và giám định viên
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center space-x-2 text-indigo-600 font-medium">
                    <span>Đăng nhập</span>
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>
              </div>
            </>
          ) : (
            /* Loading State */
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center space-x-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-medium text-gray-700">
                  Đang chuyển hướng...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

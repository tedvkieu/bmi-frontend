// app/page.tsx (Dashboard Page)
"use client";
import React from "react";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import AdminLayout from "./component/AdminLayout";

const DashboardPage = () => {
  const stats = [
    {
      label: "Tổng tài liệu",
      value: "124",
      color: "bg-blue-600",
      icon: FileText,
    },
    {
      label: "Hoàn thành",
      value: "89",
      color: "bg-green-600",
      icon: CheckCircle,
    },
    { label: "Đang xử lý", value: "28", color: "bg-yellow-600", icon: Clock },
    { label: "Chờ duyệt", value: "7", color: "bg-red-600", icon: AlertCircle },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                    {stat.label}
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-2 lg:p-3 rounded-lg ${stat.color} flex-shrink-0`}
                >
                  <stat.icon size={16} className="text-white lg:w-5 lg:h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Hoạt động gần đây
            </h3>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Nguyễn Văn A</span> đã hoàn
                    thành giám định máy móc BMI001
                  </p>
                  <span className="text-xs text-gray-400">2 giờ trước</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Trần Thị B</span> đã tạo tài
                    liệu mới BMI005
                  </p>
                  <span className="text-xs text-gray-400">4 giờ trước</span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">
                    Tài liệu BMI002 đang chờ phê duyệt
                  </p>
                  <span className="text-xs text-gray-400">6 giờ trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;

// app/page.tsx (Dashboard Page)
"use client";
import React, { useEffect, useState } from "react";
import { FileText, CheckCircle, Users, Briefcase, Clock } from "lucide-react"; // Đổi icon cho phù hợp hơn
import AdminLayout from "./component/AdminLayout";

interface MiscData {
  users: number;
  customers: number;
  dossiers: number;
  evaluationResults: number;
}

const DashboardPage = () => {
  const [miscData, setMiscData] = useState<MiscData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMiscData = async () => {
      try {
        const response = await fetch("/api/misc");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MiscData = await response.json();
        setMiscData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMiscData();
  }, []);

  const totalDocuments = miscData?.dossiers || 0;
  const totalUsers = miscData?.users || 0;
  const totalCustomers = miscData?.customers || 0;
  const completedDocuments = miscData?.evaluationResults || 0;

  const stats = [
    {
      label: "Khách hàng",
      value: totalCustomers.toString(),
      icon: Briefcase, // Icon mới
      bgColor: "from-purple-500 to-indigo-600",
    },
    {
      label: "Nhân viên",
      value: totalUsers.toString(),
      icon: Users, // Icon mới
      bgColor: "from-green-500 to-emerald-600",
    },
    {
      label: "Tổng hồ sơ",
      value: totalDocuments.toString(),
      icon: FileText,
      bgColor: "from-blue-500 to-sky-600",
    },
    {
      label: "Hoàn thành",
      value: completedDocuments.toString(),
      icon: CheckCircle,
      bgColor: "from-orange-500 to-red-600",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center p-6 text-gray-700">Đang tải dữ liệu...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center p-6 text-red-600">
          Lỗi: {error}. Vui lòng thử lại sau.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-4 sm:p-4 lg:p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300
                         bg-gradient-to-br ${stat.bgColor} text-white overflow-hidden`}
            >
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 opacity-70"></div>
              <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 rounded-full bg-white/10 opacity-70"></div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <stat.icon size={24} className="opacity-80" />
              </div>
              <p className="text-3xl font-extrabold relative z-10">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">
              Hoạt động gần đây
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    <span className="font-semibold">Nguyễn Văn A</span> đã hoàn
                    thành giám định máy móc <span className="text-blue-600">BMI001</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">2 giờ trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    <span className="font-semibold">Trần Thị B</span> đã tạo tài
                    liệu mới <span className="text-blue-600">BMI005</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">4 giờ trước</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    Tài liệu <span className="text-blue-600">BMI002</span> đang
                    chờ phê duyệt
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">6 giờ trước</p>
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
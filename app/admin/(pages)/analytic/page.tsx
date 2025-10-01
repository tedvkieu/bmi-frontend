// C:\Workspace\bmi-2\bmi-frontend\app\admin\(pages)\analytic\page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { FileText, CheckCircle, Users, Briefcase, TrendingUp, BarChart2, PieChart } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import AdminLayout from "../../component/AdminLayout";

interface MiscData {
  users: number;
  customers: number;
  dossiers: number;
  evaluationResults: number;
}

// --- Dữ liệu giả định cho phân tích ---
const monthlyDossiersData = [
  { name: 'Tháng 1', Hồ_sơ: 4000, Hoàn_thành: 2400 },
  { name: 'Tháng 2', Hồ_sơ: 3000, Hoàn_thành: 1398 },
  { name: 'Tháng 3', Hồ_sơ: 2000, Hoàn_thành: 9800 },
  { name: 'Tháng 4', Hồ_sơ: 2780, Hoàn_thành: 3908 },
  { name: 'Tháng 5', Hồ_sơ: 1890, Hoàn_thành: 4800 },
  { name: 'Tháng 6', Hồ_sơ: 2390, Hoàn_thành: 3800 },
];

const dossierStatusData = [
  { name: 'Hoàn thành', value: 60, color: '#4CAF50' }, // Green
  { name: 'Đang xử lý', value: 25, color: '#FFC107' }, // Yellow
  { name: 'Chờ duyệt', value: 15, color: '#2196F3' }, // Blue
];

const topEmployeesData = [
  { name: 'Nguyễn Văn A', dossiers: 120, completed: 95 },
  { name: 'Trần Thị B', dossiers: 110, completed: 88 },
  { name: 'Lê Văn C', dossiers: 95, completed: 75 },
  { name: 'Phạm Thị D', dossiers: 80, completed: 60 },
];


const AnalyticPage = () => {
  const [miscData, setMiscData] = useState<MiscData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMiscData = async () => {
      try {
        const response = await fetch("/api/misc"); // Your existing API endpoint
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
      icon: Briefcase,
      bgColor: "bg-gradient-to-br from-purple-500 to-indigo-600",
    },
    {
      label: "Nhân viên",
      value: totalUsers.toString(),
      icon: Users,
      bgColor: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    {
      label: "Tổng hồ sơ",
      value: totalDocuments.toString(),
      icon: FileText,
      bgColor: "bg-gradient-to-br from-blue-500 to-sky-600",
    },
    {
      label: "Hoàn thành",
      value: completedDocuments.toString(),
      icon: CheckCircle,
      bgColor: "bg-gradient-to-br from-orange-500 to-red-600",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center p-8 text-lg text-gray-700">Đang tải dữ liệu phân tích...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center p-8 text-lg text-red-600">
          Lỗi: {error}. Vui lòng thử lại sau.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Bảng Phân Tích Tổng Quan</h1>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl shadow-lg ${stat.bgColor} text-white overflow-hidden`}
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Dossiers Line Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-500" />
              Số lượng Hồ sơ theo Tháng
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyDossiersData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  labelStyle={{ color: '#374151' }}
                  itemStyle={{ color: '#4b5563' }}
                  formatter={(value: number) => value.toLocaleString('vi-VN')}
                />
                <Legend />
                <Line type="monotone" dataKey="Hồ_sơ" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                <Line type="monotone" dataKey="Hoàn_thành" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Dossier Status Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <PieChart size={20} className="mr-2 text-red-500" />
              Tỷ lệ Trạng thái Hồ sơ
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={dossierStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dossierStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  labelStyle={{ color: '#374151' }}
                  itemStyle={{ color: '#4b5563' }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Employees Bar Chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart2 size={20} className="mr-2 text-yellow-600" />
            Top Nhân viên thực hiện Hồ sơ
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topEmployeesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                cursor={{ stroke: '#9ca3af', strokeWidth: 1 }}
                labelStyle={{ color: '#374151' }}
                itemStyle={{ color: '#4b5563' }}
                formatter={(value: number) => value.toLocaleString('vi-VN')}
              />
              <Legend />
              <Bar dataKey="dossiers" name="Tổng hồ sơ" fill="#8884d8" />
              <Bar dataKey="completed" name="Hoàn thành" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Example of a simple table for more detailed data */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText size={20} className="mr-2 text-purple-600" />
            Thống kê chi tiết Hồ sơ
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Hồ sơ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Hồ sơ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người phụ trách
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">BMI001</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Giám định Máy A</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Hoàn thành
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2023-01-15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Nguyễn Văn A</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">BMI002</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Giám định Xe B</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Đang xử lý
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2023-01-20</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Trần Thị B</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">BMI003</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Đánh giá Công trình C</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Chờ duyệt
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2023-02-01</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Lê Văn C</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticPage;
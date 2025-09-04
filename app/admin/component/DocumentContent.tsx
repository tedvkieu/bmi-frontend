// components/admin/DocumentsContent.tsx
"use client";
import React, { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Calendar,
  User,
  Building,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
} from "lucide-react";

const DocumentsContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Sample data
  const documents = [
    {
      id: "BMI001",
      name: "Giám định máy móc Công ty ABC",
      type: "Máy móc thiết bị",
      status: "completed",
      date: "25/08/2024",
      client: "Công ty TNHH ABC",
      inspector: "Nguyễn Văn A",
    },
    {
      id: "BMI002",
      name: "Chứng nhận hợp quy vật liệu XD",
      type: "Vật liệu xây dựng",
      status: "pending",
      date: "28/08/2024",
      client: "Công ty XYZ Ltd",
      inspector: "Trần Thị B",
    },
    {
      id: "BMI003",
      name: "Giám định chằng buộc hàng hóa",
      type: "Chằng buộc",
      status: "in_progress",
      date: "30/08/2024",
      client: "Công ty DEF Corp",
      inspector: "Lê Văn C",
    },
    {
      id: "BMI004",
      name: "Xử lý vật thể kiểm dịch",
      type: "Xử lý kiểm dịch",
      status: "completed",
      date: "20/08/2024",
      client: "Công ty GHI Ltd",
      inspector: "Phạm Thị D",
    },
  ];

  const getStatusColor = (status: any) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: any) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "in_progress":
        return "Đang thực hiện";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={14} />;
      case "pending":
        return <Clock size={14} />;
      case "in_progress":
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 sm:w-auto">
              <Filter size={16} className="text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm flex-1 sm:w-auto min-w-0"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Chờ xử lý</option>
                <option value="in_progress">Đang thực hiện</option>
              </select>
            </div>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium">
            <Plus size={16} />
            <span>Tạo hồ sơ giám định mới</span>
          </button>
        </div>
      </div>

      {/* Documents - Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <FileText size={16} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doc.id} • {doc.type}
                  </p>
                </div>
              </div>
              <div className="relative flex-shrink-0">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center space-x-2">
                <Building size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 truncate">
                  {doc.client}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900 truncate">
                  {doc.inspector}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">{doc.date}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  doc.status
                )}`}
              >
                {getStatusIcon(doc.status)}
                <span>{getStatusText(doc.status)}</span>
              </span>

              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600">
                  <Eye size={16} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600">
                  <Download size={16} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài liệu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giám định viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <FileText size={16} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doc.id} • {doc.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Building size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {doc.client}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {doc.inspector}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        doc.status
                      )}`}
                    >
                      {getStatusIcon(doc.status)}
                      <span>{getStatusText(doc.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">{doc.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-green-600">
                        <Download size={16} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsContent;

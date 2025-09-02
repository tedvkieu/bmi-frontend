"use client";
import React, { useState, useEffect } from "react";
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
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Home,
  Folder,
  Users,
  BarChart3,
  ChevronDown,
  MoreVertical,
} from "lucide-react";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("documents");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  const navItems = [
    { key: "dashboard", icon: Home, label: "Tổng quan", badge: null },
    {
      key: "documents",
      icon: FileText,
      label: "Tài liệu giám định",
      badge: "24",
    },
    { key: "clients", icon: Building, label: "Khách hàng", badge: null },
    { key: "inspectors", icon: Users, label: "Giám định viên", badge: null },
    { key: "categories", icon: Folder, label: "Danh mục", badge: null },
    { key: "reports", icon: BarChart3, label: "Báo cáo", badge: null },
    { key: "settings", icon: Settings, label: "Cài đặt", badge: null },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white shadow-xl transition-all duration-300 z-50 ${
          isMobile ? "fixed h-full" : "relative"
        } ${
          isSidebarOpen
            ? isMobile
              ? "w-64"
              : "w-64"
            : isMobile
            ? "-translate-x-full w-64"
            : "w-16"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">BM</span>
            </div>
            {(isSidebarOpen || isMobile) && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-800 truncate">
                  Bảo Minh
                </h1>
                <p className="text-xs text-gray-500 truncate">
                  Giám định & Dịch vụ
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2 pb-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handlePageChange(item.key)}
              className={`w-full flex items-center px-3 py-3 mb-1 rounded-lg text-left transition-colors ${
                currentPage === item.key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title={!isSidebarOpen && !isMobile ? item.label : undefined}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {(isSidebarOpen || isMobile) && (
                <>
                  <span className="ml-3 font-medium truncate">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={handleSidebarToggle}
                className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                {isSidebarOpen && isMobile ? (
                  <X size={20} />
                ) : (
                  <Menu size={20} />
                )}
              </button>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
                {currentPage === "dashboard" && "Tổng quan"}
                {currentPage === "documents" && "Quản lý Tài liệu Giám định"}
                {currentPage === "clients" && "Quản lý Khách hàng"}
                {currentPage === "inspectors" && "Quản lý Giám định viên"}
                {currentPage === "categories" && "Quản lý Danh mục"}
                {currentPage === "reports" && "Báo cáo"}
                {currentPage === "settings" && "Cài đặt"}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative flex-shrink-0">
                <Bell size={18} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-r-lg p-2"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      Admin
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Quản trị viên
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-gray-400 hidden sm:block"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <User size={16} />
                      <span>Thông tin cá nhân</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <Settings size={16} />
                      <span>Cài đặt</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6">
          {currentPage === "dashboard" && (
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
                        <stat.icon
                          size={16}
                          className="text-white lg:w-5 lg:h-5"
                        />
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
                          <span className="font-medium">Nguyễn Văn A</span> đã
                          hoàn thành giám định máy móc BMI001
                        </p>
                        <span className="text-xs text-gray-400">
                          2 giờ trước
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Trần Thị B</span> đã tạo
                          tài liệu mới BMI005
                        </p>
                        <span className="text-xs text-gray-400">
                          4 giờ trước
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">
                          Tài liệu BMI002 đang chờ phê duyệt
                        </p>
                        <span className="text-xs text-gray-400">
                          6 giờ trước
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === "documents" && (
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
                      <Filter
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
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
                        <FileText
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
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
                        <Building
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-900 truncate">
                          {doc.client}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-900 truncate">
                          {doc.inspector}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar
                          size={14}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="text-sm text-gray-900">
                          {doc.date}
                        </span>
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
                              <span className="text-sm text-gray-900">
                                {doc.date}
                              </span>
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
          )}

          {/* Placeholder for other pages */}
          {!["dashboard", "documents"].includes(currentPage) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Folder size={48} className="mx-auto lg:w-16 lg:h-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Đang phát triển
              </h3>
              <p className="text-gray-500 text-sm lg:text-base">
                Tính năng này sẽ được bổ sung trong phiên bản tiếp theo.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

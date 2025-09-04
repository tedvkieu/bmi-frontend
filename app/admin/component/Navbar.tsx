"use client";
import React from "react";
import {
  Home,
  FileText,
  Building,
  Users,
  Folder,
  BarChart3,
  Settings,
} from "lucide-react";

interface NavbarProps {
  currentPage: string;
  isSidebarOpen: boolean;
  isMobile: boolean;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  isSidebarOpen,
  isMobile,
  onPageChange,
}) => {
  const navItems = [
    {
      key: "dashboard",
      icon: Home,
      label: "Tổng quan",
      badge: null,
      href: "/admin",
    },
    {
      key: "dossiers",
      icon: FileText,
      label: "Hồ sơ giám định",
      badge: "24",
      href: "/admin/ho-so",
    },
    {
      key: "documents",
      icon: FileText,
      label: "Tài liệu giám định",
      badge: "24",
      href: "/admin/tai-lieu-giam-dinh",
    },
    {
      key: "clients",
      icon: Building,
      label: "Khách hàng",
      badge: null,
      href: "/admin/khach-hang",
    },
    {
      key: "inspectors",
      icon: Users,
      label: "Giám định viên",
      badge: null,
      href: "/admin/giam-dinh-vien",
    },
    {
      key: "categories",
      icon: Folder,
      label: "Danh mục",
      badge: null,
      href: "/admin/danh-muc",
    },
    {
      key: "reports",
      icon: BarChart3,
      label: "Báo cáo",
      badge: null,
      href: "/bao-cao",
    },
    {
      key: "settings",
      icon: Settings,
      label: "Cài đặt",
      badge: null,
      href: "/admin/cai-dat",
    },
  ];

  return (
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
            onClick={() => onPageChange(item.key)}
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
                <span className="ml-3 font-medium truncate">{item.label}</span>
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
  );
};

export default Navbar;

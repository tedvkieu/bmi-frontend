"use client";
import React, { useEffect, useState } from "react";
import {
  Home,
  FileText,
  Building,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { authApi } from "../../services/authApi";

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
      key: "documents",
      icon: FileText,
      label: "Hồ sơ giám định",
      badge: "24",
      href: "/admin/ho-so",
    },

    {
      key: "evaluation",
      icon: FileText,
      label: "Phiếu đánh giá hồ sơ",
      badge: null,
      href: "/admin/evaluation",
    },
    {
      key: "clients",
      icon: Building,
      label: "Khách hàng",
      badge: null,
      href: "/admin/khach-hang",
    },
    {
      key: "users",
      icon: Users,
      label: "Quản lý nhân viên",
      badge: null,
      href: "/admin/quan-ly-nhan-vien",
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

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const r = authApi.getRoleFromToken();
    setRole(r);
  }, []);

  const shouldHideItem = (
    itemKey: string,
    userRole: string | null
  ): boolean => {
    if (!userRole || userRole === "ADMIN") return false;
    if (userRole === "MANAGER") {
      return itemKey === "settings";
    }
    if (userRole === "ISO_STAFF" || userRole === "DOCUMENT_STAFF") {
      return itemKey === "settings" || itemKey === "users";
    }
    return false;
  };

  const filteredNavItems = navItems.filter(
    (item) => !shouldHideItem(item.key, role)
  );

  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 z-50 h-screen flex flex-col fixed left-0 top-0 ${
        isSidebarOpen
          ? isMobile
            ? "w-64"
            : "w-64"
          : isMobile
          ? "-translate-x-full w-64"
          : "w-16"
      }`}
    >
      {/* Logo - Fixed at top */}
      <div className="p-5 border-b border-gray-200 flex-shrink-0">
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

      {/* Navigation - Scrollable area */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-1">
          {filteredNavItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
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
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

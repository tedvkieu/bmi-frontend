// components/Header.tsx
"use client";

import React from "react";
import { AlignLeft, X } from "lucide-react";

import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  currentPage: string;
  isSidebarOpen: boolean;
  isMobile: boolean;
  onSidebarToggle: () => void; // Prop này sẽ được sử dụng cho nút toggle
}

// components/Header.tsx
const Header: React.FC<HeaderProps> = ({
  currentPage,
  isSidebarOpen,
  isMobile,
  onSidebarToggle,
}) => {
  const getPageTitle = (page: string) => {
    switch (page) {
      case "dasboard":
        return "Dashboard";
      case "dashboard_overview":
        return "Dashboard Overview";
      case "dashboard_analytic":
        return "Dashboard Analytic";
      case "documents":
        return "Hồ sơ giám định";
      case "documents_requests":
        return "Yêu cầu giám định";
      case "assignment":
        return "Phân công hồ sơ";
      case "evaluation":
        return "Đánh giá hồ sơ";
      case "clients":
        return "Khách hàng";
      case "users":
        return "Quản lý nhân viên";
      case "approve-users":
        return "Phê duyệt khách hàng";
      case "reports":
        return "Báo cáo";
      case "settings":
        return "Cài đặt";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between h-14">
        {/* Left side: Nút toggle sidebar và tiêu đề trang */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onSidebarToggle}
            className="p-2 text-gray-800 hover:bg-gray-100 rounded-lg flex items-center justify-center"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen && isMobile ? <X size={22} /> : <AlignLeft size={22} />}
          </button>

          <h2 className="text-lg lg:text-2xl font-semibold text-gray-800 truncate">
            {getPageTitle(currentPage)}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="pl-3 border-l border-gray-200">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header; // This export is handled below in AdminLayout
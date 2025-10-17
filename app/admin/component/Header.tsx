"use client";

import React, { useMemo } from "react";
import { AlignLeft, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

interface HeaderProps {
  currentPageKey: string;
  isMobile?: boolean;
  onSidebarToggle: () => void;
}

const pageTitleMap: Record<string, { title: string; subtitle?: string }> = {
  dashboard_overview: { title: "Tổng quan hệ thống", subtitle: "Tình trạng chung và cập nhật nhanh" },
  dashboard_analytic: { title: "Phân tích dữ liệu", subtitle: "Biểu đồ & số liệu theo thời gian" },
  documents_requests: { title: "Tiếp nhận yêu cầu", subtitle: "Danh sách yêu cầu chờ xử lý" },
  documents: { title: "Quản lý hồ sơ", subtitle: "Thao tác nhanh, chỉnh sửa và theo dõi tiến trình" },
  assignment: { title: "Phân công", subtitle: "Gán giám định viên và theo dõi" },
  evaluation: { title: "Đánh giá hồ sơ", subtitle: "Đánh giá chất lượng và kết luận" },
  clients: { title: "Khách hàng", subtitle: "Quản lý thông tin khách hàng" },
  users: { title: "Nhân viên", subtitle: "Quản lý tài khoản nhân sự" },
  reports: { title: "Báo cáo", subtitle: "Tổng hợp & xuất báo cáo" },
  settings: { title: "Cài đặt hệ thống", subtitle: "Thiết lập & quyền hạn" },
  dashboard: { title: "Dashboard", subtitle: "" },
};

const Header: React.FC<HeaderProps> = ({ currentPageKey, isMobile = false, onSidebarToggle }) => {
  const page = pageTitleMap[currentPageKey] ?? { title: "Dashboard", subtitle: "" };

  // Breadcrumb simple derivation from key
  const breadcrumb = useMemo(() => {
    const parts = currentPageKey.split("_");
    if (currentPageKey === "dashboard_overview") return ["Dashboard", "Tổng quan"];
    if (parts.length >= 2) {
      return [parts[0][0].toUpperCase() + parts[0].slice(1), parts.slice(1).join(" ")];
    }
    return ["Dashboard"];
  }, [currentPageKey]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4 min-w-0">
          {/* Sidebar toggle (mobile) */}
          <button
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
          >
            <AlignLeft size={20} color="black" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">{page.title}</h1>
              {!isMobile && page.subtitle && <span className="text-sm text-gray-500">{page.subtitle}</span>}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 truncate">
              {breadcrumb.join(" / ")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-800">
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 min-w-[240px]">
            <Search size={16} className="text-gray-400" />
            <input
              type="search"
              placeholder="Tìm hồ sơ, khách hàng"
              className="bg-transparent flex-1 text-sm px-2 py-1 outline-none"
              aria-label="Tìm kiếm"
            />
            <button className="text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-100">Tìm</button>
          </div>

          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;

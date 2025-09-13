"use client";

import React from "react";
import {
  Menu,
  X,
  Bell,
} from "lucide-react";
import UserMenu from "./UserMenu";

interface HeaderProps {
  currentPage: string;
  isSidebarOpen: boolean;
  isMobile: boolean;
  onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  isSidebarOpen,
  isMobile,
  onSidebarToggle,
}) => {

  const getPageTitle = (page: string) => {
    switch (page) {
      case "dashboard":
        return "Tổng quan";
      case "documents":
        return "Quản lý Tài liệu Giám định";
      case "clients":
        return "Quản lý Khách hàng";
      case "inspectors":
        return "Quản lý Giám định viên";
      case "categories":
        return "Quản lý Danh mục";
      case "reports":
        return "Báo cáo";
      case "settings":
        return "Cài đặt";
      default:
        return "Tổng quan";
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 min-w-0">
          <button
            onClick={onSidebarToggle}
            className="p-2 text-gray-800 hover:bg-gray-100 rounded-lg flex-shrink-0"
          >
            {isSidebarOpen && isMobile ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
            {getPageTitle(currentPage)}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg relative flex-shrink-0">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="pl-3 border-l border-gray-200">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

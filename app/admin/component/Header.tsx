// components/admin/Header.tsx
"use client";
import React, { useState } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

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
  const [showUserMenu, setShowUserMenu] = useState(false);

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
            className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
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
                <p className="text-xs text-gray-500 truncate">Quản trị viên</p>
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
  );
};

export default Header;

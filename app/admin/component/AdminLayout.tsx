"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "./Navbar";
import LoginWrapper from "./LoginWrapper";
import Header from "./Header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentPage = () => {
    if (pathname === "/admin") return "dashboard_overview";
    if (pathname.startsWith("/admin/analytic")) return "dashboard_analytic";
    if (pathname.startsWith("/admin/hoso")) return "documents";
    if (pathname.startsWith("/admin/phancong")) return "assignment";
    if (pathname.startsWith("/admin/evaluation")) return "evaluation";
    if (pathname.startsWith("/admin/khachhang")) return "clients";
    if (pathname.startsWith("/admin/nhanvien")) return "users";
    if (pathname.startsWith("/admin/danhmuc")) return "categories";
    if (pathname.startsWith("/admin/baocao")) return "reports";
    if (pathname.startsWith("/admin/caidat")) return "settings";
    if (pathname.startsWith("/admin/yeu-cau-giam-dinh")) return "documents_requests"; // Thêm route này
    return "dashboard";
  };

  const currentPage = getCurrentPage();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handlePageChange = (page: string) => {
    const routes = {
      dashboard: "/admin",
      dashboard_overview: "/admin",
      dashboard_analytic: "/admin/analytic",
      documents: "/admin/hoso",
      assignment: "/admin/phancong",
      evaluation: "/admin/evaluation",
      clients: "/admin/khachhang",
      users: "/admin/nhanvien",
      categories: "/admin/danhmuc",
      reports: "/admin/baocao",
      settings: "/admin/caidat",
      documents_requests: "/admin/yeu-cau-giam-dinh",
    };

    router.push(routes[page as keyof typeof routes] || "/admin");

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <LoginWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Fixed Sidebar */}
        <Navbar
          currentPage={currentPage}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
          onPageChange={handlePageChange}
        />

        {/* Main Content with dynamic margin */}
        <div
          className={`min-h-screen transition-all duration-300 ${
            isMobile
              ? isSidebarOpen
                ? "ml-72" // Khi mở trên mobile, đẩy content sang phải
                : "ml-0"
              : isSidebarOpen
              ? "ml-72"
              : "ml-20"
          }`}
        >
          {/* Header */}
          <Header
            currentPage={currentPage}
            isSidebarOpen={isSidebarOpen}
            isMobile={isMobile}
            onSidebarToggle={handleSidebarToggle}
          />

          {/* Page Content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </LoginWrapper>
  );
};

export default AdminLayout;
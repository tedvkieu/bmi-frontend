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
    if (pathname === "/admin") return "dashboard";
    if (pathname === "/") return "dashboard_overview";
    if (pathname.startsWith("/analytic")) return "dashboard_analytic";
    if (pathname.startsWith("/admin/ho-so")) return "documents";
    if (pathname.startsWith("/admin/phan-cong")) return "assignment";
    if (pathname.startsWith("/admin/evaluation")) return "evaluation";
    if (pathname.startsWith("/admin/khach-hang")) return "clients";
    if (pathname.startsWith("/admin/quan-ly-nhan-vien")) return "users";
    if (pathname.startsWith("/admin/danh-muc")) return "categories";
    if (pathname.startsWith("/bao-cao")) return "reports";
    if (pathname.startsWith("/admin/cai-dat")) return "settings";
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
      dashboard_overview: "/admin", // <-- thêm
      dashboard_analytic: "/admin/analytic", // <-- thêm
      documents: "/admin/ho-so",
      assignment: "/admin/phan-cong",
      evaluation: "/admin/evaluation",
      clients: "/admin/khach-hang",
      users: "/admin/quan-ly-nhan-vien",
      categories: "/admin/danh-muc",
      reports: "/admin/bao-cao",
      settings: "/admin/cai-dat",
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
            isMobile ? "ml-0" : isSidebarOpen ? "ml-72" : "ml-20"
          }`}
        >
          {/* Header */}
          <Header
            currentPage={currentPage}
            isSidebarOpen={isSidebarOpen}
            isMobile={isMobile}
            onSidebarToggle={handleSidebarToggle} // Truyền prop vào Header
          />

          {/* Page Content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </LoginWrapper>
  );
};

export default AdminLayout;

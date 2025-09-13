// components/admin/AdminLayout.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Header from "./Header";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Determine current page based on pathname
  const getCurrentPage = () => {
    if (pathname === "/admin") return "admin";
    if (pathname.startsWith("/admin/ho-so")) return "documents";
    if (pathname.startsWith("/admin/khach-hang")) return "clients";
    if (pathname.startsWith("/admin/giam-dinh-vien")) return "inspectors";
    if (pathname.startsWith("/admin/danh-muc")) return "categories";
    if (pathname.startsWith("/admin/bao-cao")) return "reports";
    if (pathname.startsWith("/admin/cai-dat")) return "settings";
    return "dashboard";
  };

  const currentPage = getCurrentPage();

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

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePageChange = (page: string) => {
    const routes = {
      dashboard: "/admin",
      documents: "/admin/ho-so",
      clients: "/admin/khach-hang",
      inspectors: "/admin/giam-dinh-vien",
      categories: "/admin/danh-muc",
      reports: "/admin/bao-cao",
      settings: "/admin/cai-dat",
    };

    router.push(routes[page as keyof typeof routes] || "/");

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
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
          isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"
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
  );
};

export default AdminLayout;

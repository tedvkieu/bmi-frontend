"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Header from "./Header";
import LoginWrapper from "./LoginWrapper";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // map route -> logical page (for header title + breadcrumb)
  const pageMap: { path: string; key: string }[] = [
    { path: "/admin/analytic", key: "dashboard_analytic" },
    { path: "/admin/yeu-cau-giam-dinh", key: "documents_requests" },
    { path: "/admin/tao-ho-so-khach", key: "documents" },
    { path: "/admin/tao-ho-so", key: "documents" },
    { path: "/admin/hoso", key: "documents" },
    { path: "/admin/phancong", key: "assignment" },
    { path: "/admin/evaluation", key: "evaluation" },
    { path: "/admin/khachhang", key: "clients" },
    { path: "/admin/nhanvien", key: "users" },
    { path: "/admin/baocao", key: "reports" },
    { path: "/admin/caidat", key: "settings" },
    { path: "/admin", key: "dashboard_overview" },
  ];

  const currentPage = pageMap.find((p) => pathname.startsWith(p.path))?.key ?? "dashboard";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // default desktop expanded, mobile collapsed
      setSidebarCollapsed(mobile ? true : false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // helper: change route from Navbar
  const handlePageChange = (route: string) => {
    if (!route) return;
    router.push(route);
    if (isMobile) {
      // on mobile we want sidebar collapsed after routing
      setSidebarCollapsed(true);
    }
  };

  return (
    <LoginWrapper>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Navbar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((s) => !s)}
          onNavigate={handlePageChange}
          isMobile={isMobile}
          currentPageKey={currentPage}
        />

        {/* Main area */}
        <div
          className={`flex-1 min-h-screen transition-all duration-200 flex flex-col ${
            sidebarCollapsed ? "ml-20" : "ml-72"
          }`}
        >
          <Header
            currentPageKey={currentPage}
            onSidebarToggle={() => setSidebarCollapsed((s) => !s)}
            isMobile={isMobile}
          />

          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </LoginWrapper>
  );
};

export default AdminLayout;

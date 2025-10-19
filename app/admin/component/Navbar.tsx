"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  FileText,
  Briefcase,
  UserCog,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
  GanttChart,
  TextSearch,
  Handshake,
  ClipboardCheck,
} from "lucide-react";
import { authApi } from "../../services/authApi";

type NavItem = {
  key: string;
  label: string;
  href?: string;
  icon?: React.ElementType;
  badge?: string | number | null;
  subItems?: NavItem[];
};

interface NavbarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate: (route: string) => void;
  isMobile: boolean;
  currentPageKey: string;
}

const Navbar: React.FC<NavbarProps> = ({
  collapsed,
  onToggle,
  onNavigate,
  currentPageKey,
}) => {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const r = authApi.getRoleFromToken?.() ?? null;
    setRole(r);
  }, []);

  const isStaffUI = role === "ISO_STAFF" || role === "DOCUMENT_STAFF";

  // ------------------- NAVIGATION CỦA ADMIN / MANAGER -------------------
  const adminNavSections = useMemo(
    () => [
      {
        key: "dashboard",
        title: "Dashboard",
        items: [
          {
            key: "dashboard_overview",
            label: "Tổng quan",
            href: "/admin",
            icon: LayoutDashboard,
          },
          {
            key: "dashboard_analytic",
            label: "Phân tích dữ liệu",
            href: "/admin/analytic",
            icon: LineChart,
          },
          {
            key: "reports",
            label: "Tổng hợp / Báo cáo",
            href: "/admin/baocao",
            icon: BarChart3,
          },
        ],
      },
      {
        key: "workflow",
        title: "Quy trình giám định",
        items: [
          {
            key: "documents_requests",
            label: "Tiếp nhận yêu cầu",
            href: "/admin/yeu-cau-giam-dinh",
            icon: TextSearch,
          },
          {
            key: "assignment",
            label: "Phân công giám định",
            href: "/admin/phancong",
            icon: Handshake,
          },
          {
            key: "evaluation",
            label: "Đánh giá hồ sơ",
            href: "/admin/evaluation",
            icon: GanttChart,
          },
           {
            key: "documents",
            label: "Giám sát / Quản lý hồ sơ",
            href: "/admin/hoso",
            icon: FileText,
          },
        ],
      },
      {
        key: "management",
        title: "Khách hàng & Nhân sự",
        items: [
          {
            key: "clients",
            label: "Khách hàng",
            href: "/admin/khachhang",
            icon: Briefcase,
          },
          {
            key: "users",
            label: "Nhân viên",
            href: "/admin/nhanvien",
            icon: UserCog,
          },
        ],
      },
      {
        key: "system",
        title: "Hệ thống",
        items: [
          {
            key: "settings",
            label: "Cài đặt",
            href: "/admin/caidat",
            icon: Settings,
          },
        ],
      },
    ],
    []
  );

  // ------------------- NAVIGATION CỦA STAFF -------------------
  const staffNavSections = useMemo(
    () => [
      {
        key: "main",
        title: "Nghiệp vụ chính",
        items: [
          {
            key: "documents_requests",
            label: "Tiếp nhận yêu cầu",
            href: "/admin/yeu-cau-giam-dinh",
            icon: TextSearch,
          },
          {
            key: "documents",
            label: "Hồ sơ giám định",
            href: "/admin/hoso",
            icon: FileText,
          },
          {
            key: "assignment",
            label: "Phân công giám định",
            href: "/admin/phancong",
            icon: Handshake,
          },
          {
            key: "evaluation",
            label: "Đánh giá hồ sơ",
            href: "/admin/evaluation",
            icon: ClipboardCheck,
          },
        ],
      },
      {
        key: "management",
        title: "Khách hàng",
        items: [
          {
            key: "clients",
            label: "Khách hàng",
            href: "/admin/khachhang",
            icon: Briefcase,
          },
        ],
      },
      {
        key: "support",
        title: "Báo cáo",
        items: [
          {
            key: "reports",
            label: "Tổng hợp / Báo cáo",
            href: "/admin/baocao",
            icon: BarChart3,
          },
        ],
      },
    ],
    []
  );

  const navSections = isStaffUI ? staffNavSections : adminNavSections;

  const isActive = (item: NavItem) => {
    if (item.href && pathname === item.href) return true;
    if (
      item.href &&
      item.href !== "/admin" &&
      pathname?.startsWith(item.href + "/")
    )
      return true;
    if (item.key === currentPageKey) return true;
    if (item.subItems && item.subItems.some((si) => isActive(si))) return true;
    return false;
  };

  useEffect(() => {
    let autoOpen: string | null = null;

    navSections.forEach((sec) => {
      sec.items.forEach((it: NavItem) => {
        if (
          Array.isArray(it.subItems) &&
          it.subItems.some((s) => isActive(s))
        ) {
          autoOpen = it.key;
        }
      });
    });

    setOpenDropdown((prev) => prev ?? autoOpen);
  }, [pathname, role, navSections]);

  const handleItemClick = (item: NavItem) => {
    if (item.subItems) {
      setOpenDropdown((prev) => (prev === item.key ? null : item.key));
      return;
    }
    if (item.href) onNavigate(item.href);
  };

  const renderItem = (item: NavItem, isSub = false) => {
    const active = isActive(item);
    const open = openDropdown === item.key;

    const activeColor = "bg-blue-50 text-blue-700";
    const hoverColor = "hover:bg-gray-100";

    const base = `flex items-center ${isSub ? "pl-6" : "pl-3"}
      pr-3 py-3 rounded-lg transition-all duration-150 text-base font-medium 
      ${active ? activeColor : `text-gray-700 ${hoverColor}`}`;

    return (
      <div key={item.key} className={isSub ? "ml-2" : ""}>
        <button
          onClick={() => handleItemClick(item)}
          className={`w-full text-left ${base}`}
          aria-expanded={!!open}
          aria-current={active ? "page" : undefined}
          title={collapsed ? item.label : undefined}
        >
          {item.icon && (
            <span className="flex-shrink-0">
              <item.icon
                size={20}
                className={`${active ? "text-blue-600" : "text-gray-500"}`}
              />
            </span>
          )}

          {!collapsed && (
            <span className="ml-4 flex items-center justify-between w-full">
              <span className="truncate">{item.label}</span>
              {item.subItems &&
                (open ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
            </span>
          )}
        </button>

        {item.subItems && !collapsed && open && (
          <div className="mt-1 space-y-1 pl-3">
            {item.subItems.map((sub) => (
              <div key={sub.key}>{renderItem(sub, true)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col border-r transition-all duration-200 
        ${collapsed ? "w-20" : "w-72"} 
        bg-white border-gray-100`}
      aria-label="Sidebar"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <Link
          href="/admin"
          onClick={() => onNavigate("/admin")}
          className="flex items-center"
        >
          <div className="w-9 h-9 relative">
            <Image
              src="/images/logo.png"
              alt="Logo"
              fill
              sizes="36px"
              className="object-contain rounded-sm"
            />
          </div>
          {!collapsed && (
            <span className="ml-2 font-semibold text-lg text-gray-800">
              Bảo Minh
            </span>
          )}
        </Link>

        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label={collapsed ? "Mở sidebar" : "Thu nhỏ sidebar"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d={collapsed ? "M8 5v14l11-7L8 5z" : "M16 19V5l-11 7 11 7z"}
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-5 custom-scrollbar">
        {navSections.map((sec) => (
          <div key={sec.key} className="mb-6">
            {!collapsed && (
              <div className="px-3 mb-3 text-base font-semibold uppercase tracking-wide text-gray-600">
                {sec.title}
              </div>
            )}
            <div className="space-y-2">
              {sec.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}

        <style jsx>{`
          nav {
            scrollbar-width: thin;
            scrollbar-color: rgba(120, 120, 120, 0.4) transparent;
          }
          nav::-webkit-scrollbar {
            width: 8px;
          }
          nav::-webkit-scrollbar-track {
            background: transparent;
          }
          nav::-webkit-scrollbar-thumb {
            background: linear-gradient(
              180deg,
              rgba(180, 180, 180, 0.5),
              rgba(120, 120, 120, 0.6)
            );
            border-radius: 9999px;
            transition: background 0.3s ease;
          }
          nav::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(
              180deg,
              rgba(120, 120, 120, 0.7),
              rgba(80, 80, 80, 0.8)
            );
          }
        `}</style>
      </nav>

      <div className="p-4 bg-gray-100 border-t border-gray-100">
        {!collapsed ? (
          <div className="text-sm text-gray-500">Phiên bản hệ thống</div>
        ) : (
          <div className="sr-only">Phiên bản hệ thống</div>
        )}
      </div>
    </aside>
  );
};

export default Navbar;

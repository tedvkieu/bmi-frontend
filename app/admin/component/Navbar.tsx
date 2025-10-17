// app/admin/components/Navbar.tsx
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
  collapsed: boolean; // true = collapsed (thin), false = expanded
  onToggle: () => void;
  onNavigate: (route: string) => void;
  isMobile: boolean;
  currentPageKey: string;
}

const Navbar: React.FC<NavbarProps> = ({ collapsed, onToggle, onNavigate, currentPageKey }) => {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const r = authApi.getRoleFromToken?.() ?? null;
    setRole(r);
  }, []);

  // Navigation structure grouped by workflow + management
  const navSections = useMemo(
    () => [
      {
        key: "dashboard",
        title: "Dashboard",
        items: [
          { key: "dashboard_overview", label: "Tổng quan", href: "/admin", icon: LayoutDashboard },
          { key: "dashboard_analytic", label: "Phân tích dữ liệu", href: "/admin/analytic", icon: LineChart },
          { key: "reports", label: "Tổng hợp / Báo cáo", href: "/admin/baocao", icon: BarChart3 },
        ] as NavItem[],
      },
      {
        key: "workflow",
        title: "Quy trình giám định",
        items: [
          { key: "documents_requests", label: "Tiếp nhận yêu cầu", href: "/admin/yeu-cau-giam-dinh", icon: TextSearch },
          { key: "documents", label: "Giám sát / Quản lý hồ sơ", href: "/admin/hoso", icon: FileText },
          { key: "assignment", label: "Phân công giám định", href: "/admin/phancong", icon: Handshake },
          { key: "evaluation", label: "Đánh giá hồ sơ", href: "/admin/evaluation", icon: GanttChart },
        ] as NavItem[],
      },
      {
        key: "management",
        title: "Khách hàng & Nhân sự",
        items: [
          { key: "clients", label: "Khách hàng", href: "/admin/khachhang", icon: Briefcase },
          { key: "users", label: "Nhân viên", href: "/admin/nhanvien", icon: UserCog },
        ] as NavItem[],
      },
      {
        key: "system",
        title: "Hệ thống",
        items: [{ key: "settings", label: "Cài đặt", href: "/admin/caidat", icon: Settings }],
      },
    ],
    []
  );

  // Role-based hide logic
  const shouldHideItem = (itemKey: string) => {
    if (!role || role === "ADMIN") return false;
    if (role === "MANAGER") return itemKey === "settings";
    if (role === "ISO_STAFF" || role === "DOCUMENT_STAFF") {
      return itemKey === "settings" || itemKey === "users";
    }
    return false;
  };

  const filteredSections = navSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((i) => !shouldHideItem(i.key)),
    }))
    .filter((s) => s.items.length > 0);

  // active detection
  const isActive = (item: NavItem) => {
    if (item.href && pathname === item.href) return true;
    if (item.href && item.href !== "/admin" && pathname?.startsWith(item.href + "/")) return true;
    if (item.key === currentPageKey) return true;
    if (item.subItems && item.subItems.some((si) => isActive(si))) return true;
    return false;
  };


  useEffect(() => {
    let autoOpen: string | null = null;
    filteredSections.forEach((sec) =>
      (sec.items as NavItem[]).forEach((it) => {
        if (it.subItems && it.subItems.some((s) => isActive(s))) {
          autoOpen = it.key;
        }
      })
    );
    setOpenDropdown((prev) => (prev ?? autoOpen));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, role]);


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

    const base = `flex items-center ${isSub ? "pl-6" : "pl-3"} pr-3 py-2 rounded-lg transition-all duration-150
      ${active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`;

    return (
      <div key={item.key} className={isSub ? "ml-2" : ""}>
        <button
          onClick={() => handleItemClick(item)}
          className={`w-full text-left ${base}`}
          aria-expanded={!!open}
          aria-current={active ? "page" : undefined}
          title={collapsed ? item.label : undefined} // tooltip text when collapsed
        >
          {item.icon && (
            <span className="flex-shrink-0">
              <item.icon size={18} className={`${active ? "text-blue-600" : "text-gray-500"}`} />
            </span>
          )}

          {!collapsed && (
            <span className="ml-3 flex items-center justify-between w-full">
              <span className="text-sm font-medium truncate">{item.label}</span>
              {item.subItems && (open ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </span>
          )}
        </button>

        {/* Subitems */}
        {item.subItems && !collapsed && open && (
          <div className="mt-1 space-y-1 pl-2">
            {item.subItems.map((sub) => (
              <div key={sub.key} className="pl-3">
                {renderItem(sub, true)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-gray-100 bg-white transition-all duration-200
        ${collapsed ? "w-20" : "w-64"}`}
      aria-label="Sidebar"
    >
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <Link href="/admin" onClick={() => onNavigate("/admin")} className="flex items-center">
              <div className="w-8 h-8 relative">
                <Image src="/images/logo-2.jpg" alt="Logo" fill sizes="32px" className="object-contain rounded-sm" />
              </div>
              {!collapsed && <span className="ml-2 font-semibold text-gray-800 text-sm">Bảo Minh</span>}
            </Link>
          </div>
        </div>

        {/* collapse toggle */}
        <div>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            aria-label={collapsed ? "Mở sidebar" : "Thu nhỏ sidebar"}
          >
            {/* simple chevron */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d={collapsed ? "M8 5v14l11-7L8 5z" : "M16 19V5l-11 7 11 7z"} fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
        {filteredSections.map((sec) => (
          <div key={sec.key} className="mb-6">
            {!collapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{sec.title}</div>
            )}
            <div className="space-y-1">
              {sec.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        {!collapsed ? (
          <div className="text-xs text-gray-500">Phiên bản hệ thống • v1.0</div>
        ) : (
          <div className="sr-only">Phiên bản hệ thống</div>
        )}
      </div>
    </aside>
  );
};

export default Navbar;
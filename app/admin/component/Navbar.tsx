"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
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

interface NavItem {
  key: string;
  icon?: React.ElementType;
  label: string;
  badge?: string | null;
  href?: string;
  subItems?: NavItem[];
}

interface NavSection {
  key: string;
  title?: string;
  items: NavItem[];
}

interface NavbarProps {
  currentPage: string;
  isSidebarOpen: boolean;
  isMobile: boolean;
  onPageChange: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  isSidebarOpen,
  isMobile,
  onPageChange,
}) => {
  const [role, setRole] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    const r = authApi.getRoleFromToken();
    setRole(r);
    // Removed API fetch for brevity, assuming it works
  }, []);

  const navSections: NavSection[] = [
    {
      key: "dashboard",
      title: "Dashboard",
      items: [
        {
          key: "dashboard_overview",
          icon: LayoutDashboard,
          label: "Tổng quan",
          href: "/admin",
        },
        {
          key: "dashboard_analytic",
          icon: LineChart,
          label: "Phân tích hệ thống",
          href: "/admin/analytic",
        },
        {
          key: "reports",
          icon: BarChart3,
          label: "Báo cáo dữ liệu giám định",
          href: "/admin/baocao",
        },
      ],
    },
    {
      key: "management_section",
      title: "Quản lý hồ sơ",
      items: [
        {
          key: "documents_requests",
          icon: TextSearch,
          label: "Yêu cầu giám định",
          href: "/admin/yeu-cau-giam-dinh",
        },
        {
          key: "documents",
          icon: FileText,
          label: "Hồ sơ giám định",
          href: "/admin/hoso",
        },
        {
          key: "assignment",
          icon: Handshake,
          label: "Phân công hồ sơ",
          href: "/admin/phancong",
        },
        {
          key: "evaluation",
          icon: GanttChart,
          label: "Đánh giá hồ sơ",
          href: "/admin/evaluation",
        },
      ],
    },
    {
      key: "client_section",
      title: "Khách hàng & Nhân viên",
      items: [
        {
          key: "clients",
          icon: Briefcase,
          label: "Khách hàng",
          href: "/admin/khachhang",
        },
        {
          key: "users",
          icon: UserCog,
          label: "Nhân viên",
          href: "/admin/nhanvien",
        },
      ],
    },
    {
      key: "report_section",
      title: "Cài đặt",
      items: [
  
        {
          key: "settings",
          icon: Settings,
          label: "Cài đặt",
          href: "/admin/caidat",
        },
      ],
    },
  ];

  const shouldHideItem = (itemKey: string, userRole: string | null): boolean => {
    if (!userRole || userRole === "ADMIN") return false;
    if (userRole === "MANAGER") return itemKey === "settings";
    if (userRole === "ISO_STAFF" || userRole === "DOCUMENT_STAFF") {
      return itemKey === "settings" || itemKey === "users";
    }
    return false;
  };

  const filterNavItemsByRole = (items: NavItem[]): NavItem[] =>
    items
      .map((item) => {
        if (shouldHideItem(item.key, role)) return null;
        if (item.subItems) {
          const filteredSub = filterNavItemsByRole(item.subItems);
          return filteredSub.length > 0 ? { ...item, subItems: filteredSub } : null;
        }
        return item;
      })
      .filter((item): item is NavItem => item !== null);

  const filteredNavSections = navSections.map((section) => ({
    ...section,
    items: filterNavItemsByRole(section.items),
  })).filter(section => section.items.length > 0);

  const isItemActive = (item: NavItem): boolean => {
    if (item.href === pathname) {
      return true;
    }

    if (item.href && item.href !== '/admin' && pathname.startsWith(item.href + '/')) {
      return true;
    }

    if (item.key === "dashboard_overview" && pathname === "/admin") {
      return true;
    }

    if (item.subItems && item.subItems.some(sub => isItemActive(sub))) {
        return true;
    }

    return item.key === currentPage;
  };

  useEffect(() => {
    let newOpenDropdown: string | null = null;
    filteredNavSections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems) {
          if (item.subItems.some(subItem => isItemActive(subItem))) {
            newOpenDropdown = item.key;
          }
        }
      });
    });
    setOpenDropdown(newOpenDropdown);
  }, [pathname, filteredNavSections, currentPage, isItemActive]);

  const renderNavItem = (item: NavItem, isSubItem: boolean = false) => {
    const isActive = isItemActive(item);
    const isOpen = openDropdown === item.key;

    let paddingLeftClass = "pl-3";
    if (isSubItem) {
      paddingLeftClass = "pl-9";
    }

    if (!(isSidebarOpen || isMobile)) {
      paddingLeftClass = "px-0 justify-center";
    }

    const commonClasses = `flex items-center ${paddingLeftClass} py-2.5 rounded-lg transition-all duration-200 ${isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-gray-700 hover:bg-gray-100"
      }`;

    const content = (
      <>
        {item.icon && (
          <item.icon
            size={20}
            className={`flex-shrink-0`}
          />
        )}
        {(isSidebarOpen || isMobile) && (
          <div className="flex-grow flex items-center min-w-0">
            <span className="ml-3 font-medium truncate flex-grow text-sm">
              {item.label}
            </span>
            {item.badge && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 font-medium">
                {item.badge}
              </span>
            )}
            {item.subItems && (
              <span className="ml-2 flex-shrink-0 text-gray-400">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            )}
          </div>
        )}
      </>
    );

    return (
      <div key={item.key}>
        {item.href && !item.subItems ? (
          <Link
            href={item.href}
            onClick={() => onPageChange(item.key)}
            className={`w-full ${commonClasses}`}
          >
            {content}
          </Link>
        ) : (
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === item.key ? null : item.key)
            }
            className={`w-full text-left ${commonClasses}`}
          >
            {content}
          </button>
        )}

        {item.subItems && (isSidebarOpen || isMobile) && isOpen && (
          <div className="ml-7 mt-1 space-y-1">
            {item.subItems.map((sub) => renderNavItem(sub, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white shadow-lg transition-all duration-300 z-50 h-screen flex flex-col fixed left-0 top-0 border-r border-gray-100 ${isSidebarOpen
        ? "w-72"
        : isMobile
          ? "-translate-x-full w-72"
          : "w-20"
        }`}
    >
      <div className="p-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-center">
        {!(isSidebarOpen || isMobile) ? (
          <div className="w-full h-12  flex items-center justify-center flex-shrink-0">
            <Image
              src="/images/logo-2.jpg"
              alt="Logo Bảo Minh"
              width={52}
              height={52}
              className="object-contain rounded-sm"
            />
          </div>
        ) : (
          <div className="min-w-0">
            <Image
              src="/images/logo-1.jpg"
              alt="Logo Bảo Minh"
              width={140}
              height={40}
              className="object-contain"
            />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-hidden px-4 py-6 text-sm custom-scrollbar">
        {filteredNavSections.map((section) => (
          <div key={section.key} className="mb-6">
            {isSidebarOpen && section.title && (
              <h4 className="text-gray-500 text-xs font-semibold uppercase px-3 mb-3 tracking-wide">
                {section.title}
              </h4>
            )}
            <div className="space-y-1.5">
              {section.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Navbar;
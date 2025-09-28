"use client";
import React, { useEffect, useState } from "react";
import {
  PanelsTopLeft,
  ChartSpline,
  Users,
  UserPlus,
  BarChart3,
  Settings,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  BriefcaseBusiness, // Example for customers/clients - assuming Building is for companies
  ScrollText, // More specific for dossiers/documents
  ShieldCheck, // For evaluation, suggesting a review or check
} from "lucide-react";
import { authApi } from "../../services/authApi";
import Image from "next/image";

interface NavItem {
  key: string;
  icon: React.ElementType;
  label: string;
  badge: string | null;
  href?: string;
  subItems?: NavItem[];
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
  const [stats, setStats] = useState<{
    users?: number;
    customers?: number;
    dossiers?: number;
    evaluationResults?: number;
  }>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const r = authApi.getRoleFromToken();
    setRole(r);

    fetch("/api/misc")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          users: data.users,
          customers: data.customers,
          dossiers: data.dossiers,
          evaluationResults: data.evaluationResults,
        });
      })
      .catch((error) => console.error("Failed to fetch stats:", error));
  }, []);

  const navItems: NavItem[] = [
    {
      key: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      badge: null,
      href: "/admin",
      subItems: [
        {
          key: "dashboard_overview",
          icon: PanelsTopLeft,
          label: "Tổng quan hệ thống",
          badge: null,
          href: "/",
        },
        {
          key: "dashboard_analytic",
          icon: ChartSpline,
          label: "Biểu đồ phân tích",
          badge: null,
          href: "/admin/analytic",
        },
      ],
    },
    {
      key: "documents",
      icon: ScrollText,
      label: "Hồ sơ giám định",
      badge: null,
      href: "/admin/ho-so",
      // badge: stats.dossiers ? String(stats.dossiers) : null,
    },
    {
      key: "assignment",
      icon: UserPlus,
      label: "Phân công hồ sơ",
      // badge: stats.evaluationResults ? String(stats.evaluationResults) : null,
      badge: null,
      href: "/admin/phan-cong",
    },
    {
      key: "evaluation",
      icon: ShieldCheck,
      label: "Đánh giá hồ sơ",
      // badge: stats.evaluationResults ? String(stats.evaluationResults) : null,
      badge: null,
      href: "/admin/evaluation",
    },
    {
      key: "clients",
      icon: BriefcaseBusiness,
      label: "Khách hàng",
      // badge: stats.customers ? String(stats.customers) : null,
      badge: null,
      href: "/admin/khach-hang",
    },
    {
      key: "users",
      icon: Users,
      label: "Nhân viên",
      badge: null,
      // badge: stats.users ? String(stats.users) : null,
      href: "/admin/quan-ly-nhan-vien",
    },
    {
      key: "reports",
      icon: BarChart3,
      label: "Báo cáo",
      badge: null,
      // badge: stats.users ? String(stats.users) : null,
      href: "/admin/bao-cao",
    },
    {
      key: "settings",
      icon: Settings,
      label: "Cài đặt",
      badge: null,
      href: "/admin/cai-dat",
    },
  ];

  const shouldHideItem = (
    itemKey: string,
    userRole: string | null
  ): boolean => {
    if (!userRole || userRole === "ADMIN") return false;
    if (userRole === "MANAGER") {
      return itemKey === "settings";
    }
    if (userRole === "ISO_STAFF" || userRole === "DOCUMENT_STAFF") {
      return itemKey === "settings" || itemKey === "users";
    }
    return false;
  };

  const filterNavItemsByRole = (items: NavItem[]): NavItem[] => {
    return items
      .map((item) => {
        if (shouldHideItem(item.key, role)) {
          return null;
        }
        if (item.subItems) {
          const filteredSubItems = filterNavItemsByRole(item.subItems);
          // Only return parent if it has subItems or a direct href and is not hidden
          if (filteredSubItems.length > 0 || item.href) {
            return { ...item, subItems: filteredSubItems };
          }
          return null;
        }
        return item;
      })
      .filter((item): item is NavItem => item !== null);
  };

  const filteredNavItems = filterNavItemsByRole(navItems);

  // Mở dropdown khi trang hiện tại nằm trong sub-item của nó
  useEffect(() => {
    const findParentKeyOfActivePage = (
      items: NavItem[],
      currentPath: string
    ): string | null => {
      for (const item of items) {
        if (item.subItems) {
          if (item.subItems.some((sub) => sub.href === currentPath)) {
            return item.key;
          }
          const subParentKey = findParentKeyOfActivePage(
            item.subItems,
            currentPath
          );
          if (subParentKey) return item.key;
        }
      }
      return null;
    };

    const currentPath = window.location.pathname;
    const parentKey = findParentKeyOfActivePage(filteredNavItems, currentPath);
    if (parentKey && openDropdown !== parentKey) {
      setOpenDropdown(parentKey);
    }
  }, [currentPage, filteredNavItems]);

  const handleItemClick = (item: NavItem) => {
    if (item.subItems) {
      // Khi click vào mục có sub-items, đóng/mở dropdown
      setOpenDropdown(openDropdown === item.key ? null : item.key);
    } else if (item.href) {
      onPageChange(item.key);
      // Nếu mục không có sub-items và có href, có thể đóng các dropdown khác (tùy chọn)
      // setOpenDropdown(null);
    }
  };

  const isItemActive = (item: NavItem): boolean => {
    // Check if the current page directly matches the item's key
    if (currentPage === item.key) {
      return true;
    }
    // Check if the current page matches the item's href (if present)
    if (item.href && window.location.pathname === item.href) {
      return true;
    }
    // Check if any sub-item is active
    if (item.subItems) {
      return item.subItems.some((subItem) => isItemActive(subItem));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, isSubItem: boolean = false) => {
    const isActive = isItemActive(item);
    // isOpen chỉ phụ thuộc vào state openDropdown, không còn phụ thuộc vào isActive
    const isOpen = openDropdown === item.key;
    const paddingLeft = isSubItem ? "pl-9" : "pl-3";

    return (
      <div key={item.key}>
        <button
          onClick={() => handleItemClick(item)}
          className={`w-full flex items-center ${paddingLeft} py-3 rounded-lg text-left transition-colors relative
            ${
              isActive
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }
          `}
          title={
            !isSidebarOpen && !isMobile && !item.subItems && item.label
              ? item.label
              : undefined
          }
        >
          {item.icon && (
            <item.icon
              size={20}
              className={`flex-shrink-0 ${
                isSidebarOpen || isMobile ? "" : "mx-auto"
              }`}
            />
          )}

          {(isSidebarOpen || isMobile) && (
            <div className="flex-grow flex items-center min-w-0">
              {" "}
              {/* Wrapper để căn chỉnh */}
              <span className="ml-3 font-medium truncate flex-grow">
                {item.label}
              </span>
              {item.badge && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">
                  {" "}
                  {/* ml-2 thay vì ml-auto */}
                  {item.badge}
                </span>
              )}
              {item.subItems && (
                <span className="ml-2 flex-shrink-0">
                  {" "}
                  {/* Điều chỉnh khoảng cách cho icon dropdown */}
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              )}
            </div>
          )}
        </button>
        {item.subItems && (isSidebarOpen || isMobile) && isOpen && (
          <div className="ml-4 border-l border-gray-200 mt-1 space-y-1">
            {item.subItems.map((subItem) => renderNavItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 z-50 h-screen flex flex-col fixed left-0 top-0 ${
        isSidebarOpen
          ? isMobile
            ? "w-72"
            : "w-72"
          : isMobile
          ? "-translate-x-full w-72"
          : "w-20"
      }`}
    >
      {/* Logo */}
      <div className="p-5 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {/* Logo thu gọn (logo-2) */}
          {!(isSidebarOpen || isMobile) && (
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Image
                src="/images/logo-2.jpg"
                alt="Logo Bảo Minh"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          )}

          {/* Logo đầy đủ (logo-1) */}
          {(isSidebarOpen || isMobile) && (
            <div className="min-w-0">
              <Image
                src="/images/logo-1.jpg"
                alt="Logo Bảo Minh"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 text-sm">
        <div className="space-y-1">
          {filteredNavItems.map((item) => renderNavItem(item))}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

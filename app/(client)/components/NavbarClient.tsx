"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserMenu from "@/app/admin/component/UserMenu";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { customerApi } from "@/app/admin/services/customerApi";

interface NavbarClientProps {
  onScrollToContact?: (section: string) => void;
}

export interface Customer {
  email: string;
  fullName: string;
  username?: string;
  role?: string;
  userId?: number;
}

export default function NavbarClient({ onScrollToContact }: NavbarClientProps) {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = customerApi.getUser();
    if (stored) {
      setUser({
        email: stored.email,
        fullName: stored.fullName,
        role: stored.customerType,
        userId: stored.customerId,
      });
    }
    setLoading(false);
  }, []);

  const handleLoginClick = () => {
    router.push("/auth");
    setIsOpen(false);
  };

  const handleTaoHoSoClick = () => {
    if (user) {
      router.push(`/tao-ho-so/${user.userId}`);
    } else {
      handleLoginClick();
    }
    setIsOpen(false);
  };

  if (loading) {
    return <div className="h-16 bg-gray-50 shadow-md" />;
  }

  return (
    <nav className="bg-white shadow-md py-3 md:py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 navbar-logo">
          <Image
            src="/BMI_LOGO.png"
            width={180}
            height={90}
            alt="logo"
            className="h-auto w-auto max-h-[50px] md:max-h-[60px]"
          />
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          {onScrollToContact && (
            <>
              <NavScrollButton
                label="Thông tin liên hệ"
                onClick={() => onScrollToContact("info")}
                className="navbar-menu-contact-info"
              />
              <NavScrollButton
                label="Gửi yêu cầu giám định"
                onClick={() => onScrollToContact("form")}
                className="navbar-menu-contact-form"
              />
              <NavScrollButton
                label="Tra cứu hồ sơ"
                onClick={() => onScrollToContact("dossierSearch")}
                className="navbar-menu-dossier-search"
              />
            </>
          )}

          {/* Luôn hiện Tải hồ sơ */}
          <button
            onClick={handleTaoHoSoClick}
            className="btn-tao-ho-so block text-gray-700 hover:text-blue-700 transition-colors text-sm font-medium"
          >
            Tạo hồ sơ giám định
          </button>

          {user ? (
            <>
              <UserMenu />
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Đăng nhập
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t mt-2 px-4 py-3 space-y-3">
          {onScrollToContact && (
            <>
              <NavScrollButton
                label="Gửi yêu cầu giám định"
                onClick={() => onScrollToContact("form")}
                className="navbar-menu-contact-form-mobile"
              />
              <NavScrollButton
                label="Thông tin liên hệ"
                onClick={() => onScrollToContact("info")}
                className="navbar-menu-contact-info-mobile"
              />
              <NavScrollButton
                label="Tra cứu hồ sơ"
                onClick={() => onScrollToContact("dossierSearch")}
                className="navbar-menu-dossier-search-mobile"
              />
            </>
          )}

          {/* Luôn hiện Tải hồ sơ */}
          <button
            onClick={handleTaoHoSoClick}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:text-blue-700 transition-colors text-sm font-medium"
          >
            Tải hồ sơ
          </button>

          {user ? (
            <>
              <UserMenu />
            </>
          ) : (
            <button
              onClick={handleLoginClick}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Đăng nhập
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

// New component for scrollable navigation buttons
function NavScrollButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center text-gray-700 hover:text-blue-700 transition-colors text-sm font-medium ${
        className || ""
      }`}
    >
      {label}
      <ChevronDownIcon className="ml-1 w-4 h-4" />
    </button>
  );
}

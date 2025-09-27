"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserMenu from "@/app/admin/component/UserMenu";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { customerApi } from "@/app/admin/services/customerApi";
import NotificationBell from "@/app/admin/component/NotificationBell";

interface NavbarClientProps {
  onScrollToContact?: (section: string) => void; // 🔹 optional
}

export interface Customer {
  username: string;
  email: string;
  role: string;
  fullName: string;
  userId: number;
}

export default function NavbarClient({ onScrollToContact }: NavbarClientProps) {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const u = customerApi.getUser();
    if (u) {
      setUser(u);
      setRole(u.role);
    }
    setLoading(false);
  }, []);

  const handleLoginClick = () => {
    router.push("/auth/login");
    setIsOpen(false);
  };

  if (loading) {
    return <div className="h-16 bg-gray-50 shadow-md" />;
  }

  return (
    <nav className="bg-white shadow-md py-3 md:py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
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
              <NavButton label="Thông tin liên hệ" onClick={() => onScrollToContact("info")} />
              <NavButton label="Gửi yêu cầu giám định" onClick={() => onScrollToContact("form")} />
              <NavButton label="Tra cứu hồ sơ" onClick={() => onScrollToContact("dossierSearch")} />
            </>
          )}
          {user ? (
            <>
              <button
                onClick={() => router.push(`/tao-ho-so/${user.userId}`)}
                className="block text-gray-700 hover:text-blue-700 transition-colors text-sm font-medium"
              >
                Tải hồ sơ
              </button>
              <NotificationBell />
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
              <NavButton label="Gửi Liên Hệ" onClick={() => onScrollToContact("form")} />
              <NavButton label="Thông tin liên hệ" onClick={() => onScrollToContact("info")} />
              <NavButton label="Tra cứu hồ sơ" onClick={() => onScrollToContact("dossierSearch")} />
            </>
          )}

          {user && role === "CUSTOMER" ? (
            <UserMenu />
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

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block text-gray-700 hover:text-blue-700 transition-colors text-sm font-medium"
    >
      {label}
    </button>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi, User } from "../../services/authApi";
import UserMenu from "@/app/admin/component/UserMenu";

interface NavbarClientProps {
  onScrollToContact: (section: string) => void;
}

export default function NavbarClient({ onScrollToContact }: NavbarClientProps) {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  //const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const u = authApi.getUser();
    if (u) {
      setUser(u);
      setRole(u.role);
    }
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   // const handleClickOutside = (event: MouseEvent) => {
  //   //   if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
  //   //     setIsDropdownOpen(false);
  //   //   }
  //   // };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  if (loading) {
    return <div className="h-16 bg-gray-50 shadow-md" />; // Placeholder khi đang load
  }

  return (
    <nav className="bg-white shadow-md py-3 md:py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/BMI_LOGO.png"
            width={180}
            height={90}
            alt="logo"
            className="h-auto w-auto max-h-[50px] md:max-h-[60px]"
          />
        </Link>

        <div className="flex items-center space-x-4 md:space-x-6">
          <button
            onClick={() => onScrollToContact("form")}
            className="text-gray-700 hover:text-blue-700 transition-colors text-sm md:text-base font-medium"
          >
            Gửi Liên Hệ
          </button>
          <button
            onClick={() => onScrollToContact("info")}
            className="text-gray-700 hover:text-blue-700 transition-colors text-sm md:text-base font-medium"
          >
            Thông tin liên hệ
          </button>
          <button
            onClick={() => onScrollToContact("search")}
            className="text-gray-700 hover:text-blue-700 transition-colors text-sm md:text-base font-medium"
          >
            Tra cứu hồ sơ
          </button>

          {user && role === "CUSTOMER" ? (
            <UserMenu />
          ) : (
            <button
              onClick={handleLoginClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base font-medium"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

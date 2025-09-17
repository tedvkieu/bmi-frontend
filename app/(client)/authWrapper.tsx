"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../services/authApi";

interface AuthWrapperProps {
  children: React.ReactNode;
  allowedRoles?: string[]; 
}

export default function AuthWrapper({ children, allowedRoles }: AuthWrapperProps) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const r = authApi.getRoleFromToken(); 
    setRole(r);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  // ✅ Nếu không có role => vẫn cho phép
  if (!role) {
    return <>{children}</>;
  }

  // Nếu có role thì check như cũ
  if (allowedRoles && !allowedRoles.includes(role)) {
    router.replace("/unauthorized");
    return null;
  }

  return <>{children}</>;
}
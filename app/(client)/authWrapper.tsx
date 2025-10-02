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
  const router = useRouter();

  useEffect(() => {
    const r = authApi.getRoleFromToken();
    setRole(r);
  }, []);


  if (!role) {
    return <>{children}</>;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    router.replace("/unauthorized");
    return null;
  }

  return <>{children}</>;
}
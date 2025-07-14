"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  requiredRole?: "admin" | "user";
  children: React.ReactNode;
}

export default function ProtectedRoute({
  requiredRole,
  children,
}: ProtectedRouteProps) {
  const { isAuthenticated, role } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (requiredRole && role !== requiredRole) {
      router.replace("/auth/unauthorized");
    }
  }, [isAuthenticated, role, requiredRole, router]);

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return null;
  }
  return <>{children}</>;
}

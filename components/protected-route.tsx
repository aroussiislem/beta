"use client";

import React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requiredRole && !requiredRole.includes(user?.role || "")) {
      router.push("/dashboard");
      return;
    }
  }, [isLoading, isAuthenticated, user?.role, requiredRole, router]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && !requiredRole.includes(user?.role || "")) {
    return null;
  }

  return <>{children}</>;
}

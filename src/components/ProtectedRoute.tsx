// src/components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // This prevents unnecessary redirects during the authentication check
    if (!isChecking) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (requiredRole && user?.role !== requiredRole) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, requiredRole, router, isChecking]);

  // Set isChecking to false after the initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100); // Small delay to ensure auth context is initialized

    return () => clearTimeout(timer);
  }, []);

  if (isChecking || (!isAuthenticated && typeof window !== "undefined")) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If we reach here, the user is authenticated and has the required role
  return <>{children}</>;
}

// src/app/test-auth/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function TestAuthPage() {
  const { user, isAuthenticated } = useAuth();
  const [authStatus, setAuthStatus] = useState("Checking...");

  useEffect(() => {
    if (isAuthenticated && user) {
      setAuthStatus(`Authenticated as ${user.name} (${user.email})`);
    } else {
      setAuthStatus("Not authenticated");
    }
  }, [isAuthenticated, user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Authentication Test
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This page tests if authentication state persists after reload
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Auth Status:</strong> {authStatus}
                </p>
                <p>
                  <strong>Is Authenticated:</strong>{" "}
                  {isAuthenticated ? "Yes" : "No"}
                </p>
                {user && (
                  <div className="mt-2">
                    <p>
                      <strong>User Details:</strong>
                    </p>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>To test authentication persistence:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Refresh this page</li>
                <li>You should remain logged in</li>
                <li>If you get redirected to login, there&apos;s an issue</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

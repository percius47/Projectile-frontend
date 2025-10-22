// src/app/reset-password/ResetPasswordForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ApiService from "@/services/api";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from URL query parameters
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid or missing reset token");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await ApiService.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setMessage(
        "Password reset successfully. You can now login with your new password."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while resetting your password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // No logout needed for this page
  };

  const navigationItems = [{ name: "Home", href: "/", current: true }];

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveNavigation
        onLogout={handleLogout}
        navigationItems={navigationItems}
      />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Reset your password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[400px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              {message && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-sm text-green-700">{message}</div>
                  <div className="mt-4">
                    <Link
                      href="/login"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Go to login page
                    </Link>
                  </div>
                </div>
              )}
              {!message && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        New Password
                      </label>
                      <div className="mt-2">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter new password"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Confirm Password
                      </label>
                      <div className="mt-2">
                        <input
                          id="confirm-password"
                          name="confirm-password"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
          {!message && (
            <p className="mt-10 text-center text-sm text-gray-500">
              <Link
                href="/login"
                className="font-semibold leading-6 text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

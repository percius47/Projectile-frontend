// src/app/vendors/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";

interface VendorUser {
  id: number;
  name: string;
  email: string;
  role: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  gst_number?: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // In a real application, you would fetch all users with role "vendor"
    // For now, we'll simulate this with mock data
    const fetchVendors = () => {
      try {
        // This is a placeholder - in a real app, you would make an API call
        // to fetch all users with role "vendor"
        const mockVendors: VendorUser[] = [
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "vendor",
            company_name: "ABC Construction",
            contact_person: "John Doe",
            phone: "1234567890",
            gst_number: "GST1234567890",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "vendor",
            company_name: "XYZ Builders",
            contact_person: "Jane Smith",
            phone: "0987654321",
            gst_number: "GST0987654321",
          },
        ];
        setVendors(mockVendors);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch vendors"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleLogout = () => {
    // Logout functionality would be handled by AuthContext
  };

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", current: false },
    { name: "Vendors", href: "/vendors", current: true },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ResponsiveNavigation
          user={user || undefined}
          onLogout={handleLogout}
          navigationItems={navigationItems}
        />

        {/* Main Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Vendors</h2>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {vendors.length === 0 ? (
                    <li className="px-6 py-4 text-center">
                      <p className="text-gray-500">No vendors found.</p>
                    </li>
                  ) : (
                    vendors.map((vendor) => (
                      <li key={vendor.id} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-lg font-medium text-blue-600 truncate">
                              {vendor.company_name}
                            </p>
                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {vendor.contact_person}
                              </div>
                              <div className="flex items-center">
                                <svg
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {vendor.phone}
                              </div>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {vendor.email}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {vendor.role}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

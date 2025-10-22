// src/app/vendors/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import VendorService, { CreateVendorData } from "@/services/vendorService";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";

export default function VendorRegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const vendorData: CreateVendorData = {
        user_id: user?.id || 0,
        company_name: companyName,
        contact_person: contactPerson || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        gst_number: gstNumber || undefined,
      };

      await VendorService.createVendor(vendorData);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while registering as a vendor"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Handle logout if needed
  };

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", current: false },
    { name: "Vendor Registration", href: "#", current: true },
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
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Vendor Registration
              </h2>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="company-name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Company Name *
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          id="company-name"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-person"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Contact Person
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          id="contact-person"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter contact person name"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Phone Number
                      </label>
                      <div className="mt-2">
                        <input
                          type="tel"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Email Address
                      </label>
                      <div className="mt-2">
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Address
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="address"
                          rows={3}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter business address"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="gst-number"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        GST Number
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          id="gst-number"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter GST number"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="w-full sm:w-auto bg-white py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? "Registering..." : "Register as Vendor"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

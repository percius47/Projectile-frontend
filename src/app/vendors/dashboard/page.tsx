// src/app/vendors/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import VendorService, { Vendor } from "@/services/vendorService";
import RfqService, { Rfq } from "@/services/rfqService";
import QuoteService, { Quote } from "@/services/quoteService";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";
import { formatDate } from "@/utils/dateUtils";

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [openRfqs, setOpenRfqs] = useState<Rfq[]>([]);
  const [vendorQuotes, setVendorQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      // Get vendor profile
      const vendorResponse = await VendorService.getVendorByUserId(
        user?.id || 0
      );
      setVendor(vendorResponse.vendor);

      // Get vendor quotes
      const quotesResponse = await QuoteService.getQuotesByVendorId(
        vendorResponse.vendor.id
      );
      setVendorQuotes(quotesResponse.quotes);

      // Get all open RFQs (in a real app, you might want to filter by vendor category or location)
      const rfqsResponse = await RfqService.getAllRfqs();
      const openRfqs = rfqsResponse.rfqs.filter((rfq) => rfq.status === "open");
      setOpenRfqs(openRfqs);

      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch vendor data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navigationItems = [
    { name: "Vendor Dashboard", href: "#", current: true },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ResponsiveNavigation
            user={user || undefined}
            onLogout={handleLogout}
            navigationItems={navigationItems}
          />
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ResponsiveNavigation
            user={user || undefined}
            onLogout={handleLogout}
            navigationItems={navigationItems}
          />
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
            {vendor && (
              <div className="space-y-6">
                {/* Vendor Profile */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {vendor.company_name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Vendor Profile
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {vendor.contact_person && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              Contact: {vendor.contact_person}
                            </span>
                          )}
                          {vendor.phone && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Phone: {vendor.phone}
                            </span>
                          )}
                          {vendor.email && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              Email: {vendor.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <Link
                          href={`/vendors/register`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          Edit Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quotes Section */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        My Quotes
                      </h3>
                    </div>

                    {/* Quotes List */}
                    {vendorQuotes.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">
                          You haven&apos;t submitted any quotes yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {vendorQuotes.map((quote) => (
                            <li key={quote.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <p className="text-sm font-medium text-blue-600 truncate">
                                    Quote #{quote.id}
                                  </p>
                                  <div className="flex-shrink-0">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {quote.status}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-2">
                                  <div className="flex flex-col">
                                    <p className="flex items-center text-sm text-gray-500">
                                      Total Amount: ₹{quote.total_amount}
                                    </p>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <p>
                                      Submitted:{" "}
                                      {quote.created_at
                                        ? formatDate(quote.created_at)
                                        : "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Open RFQs Section */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Open RFQs
                      </h3>
                    </div>

                    {/* RFQs List */}
                    {openRfqs.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">
                          No open RFQs available at the moment.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {openRfqs.map((rfq) => (
                            <li key={rfq.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <p className="text-sm font-medium text-blue-600 truncate">
                                    {rfq.title}
                                  </p>
                                  <div className="flex-shrink-0">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {rfq.status}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-2">
                                  <div className="flex flex-col">
                                    <p className="flex items-center text-sm text-gray-500">
                                      {rfq.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <p>
                                      Deadline:{" "}
                                      {rfq.deadline
                                        ? formatDate(rfq.deadline)
                                        : "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <Link
                                    href={`/vendors/rfqs/${rfq.id}`}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
                                  >
                                    View Details & Submit Quote
                                  </Link>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

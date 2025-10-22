// src/app/vendors/rfqs/[id]/page.tsx
"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import RfqService, { Rfq } from "@/services/rfqService";
import VendorService, { Vendor } from "@/services/vendorService";
import QuoteService, { CreateQuoteData } from "@/services/quoteService";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatDate } from "@/utils/dateUtils";

export default function RfqDetailPage({ params }: { params: { id: string } }) {
  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter();
  const unwrappedParams = use(
    params instanceof Promise ? params : Promise.resolve(params)
  );
  const rfqId = parseInt(unwrappedParams.id);

  const fetchRfqDetails = useCallback(async () => {
    try {
      const response = await RfqService.getRfqById(rfqId);
      setRfq(response.rfq);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch RFQ details"
      );
    }
  }, [rfqId]);

  const fetchVendorDetails = useCallback(async () => {
    try {
      const response = await VendorService.getVendorByUserId(user?.id || 0);
      setVendor(response.vendor);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch vendor details"
      );
    }
  }, [user]);

  useEffect(() => {
    if (!isNaN(rfqId)) {
      fetchRfqDetails();
      fetchVendorDetails();
    }
  }, [rfqId, fetchRfqDetails, fetchVendorDetails]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!vendor) {
        throw new Error("Vendor profile not found");
      }

      const quoteData: CreateQuoteData = {
        rfq_id: rfqId,
        vendor_id: vendor.id,
        total_amount: parseFloat(totalAmount),
      };

      await QuoteService.createQuote(quoteData);
      router.push("/vendors/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting the quote"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
              <button
                onClick={() => router.push("/vendors/dashboard")}
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
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    Projectile
                  </h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/vendors/dashboard"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Vendor Dashboard
                  </Link>
                  <Link
                    href="#"
                    className="border-b-2 border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    RFQ Details
                  </Link>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">{user?.name}</span>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {user?.role}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {rfq && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {rfq.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Request for Quotation
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {rfq.status}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="border-t border-gray-200">
                        <dl>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                              Description
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {rfq.description || "No description provided"}
                            </dd>
                          </div>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                              Deadline
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {rfq.deadline ? formatDate(rfq.deadline) : "N/A"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Quote Form */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Submit Quote
                    </h3>
                    <form onSubmit={handleSubmitQuote} className="space-y-6">
                      {error && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="text-sm text-red-700">{error}</div>
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="total-amount"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Total Amount (₹) *
                        </label>
                        <input
                          type="number"
                          id="total-amount"
                          required
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => router.push("/vendors/dashboard")}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : "Submit Quote"}
                        </button>
                      </div>
                    </form>
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

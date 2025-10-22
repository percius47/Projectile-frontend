// src/app/rfqs/[id]/closed/page.tsx
"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import RfqService, { Rfq } from "@/services/rfqService";
import QuoteService, { Quote } from "@/services/quoteService";
import DocumentService, { Document } from "@/services/documentService";
import ProtectedRoute from "@/components/ProtectedRoute";
import { formatDate } from "@/utils/dateUtils";

export default function ClosedRfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [vendorQuote, setVendorQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);

  const { user, logout } = useAuth();
  const router = useRouter();

  // Properly unwrap params using React.use() for Next.js 15
  const unwrappedParams = use(
    params instanceof Promise ? params : Promise.resolve(params)
  );
  const rfqId = parseInt(unwrappedParams.id);

  const fetchRfqDetails = useCallback(async () => {
    try {
      // Fetch RFQ details
      const rfqResponse = await RfqService.getRfqById(rfqId);
      setRfq(rfqResponse.rfq);

      // Fetch documents for this RFQ
      try {
        const docResponse = await DocumentService.getDocumentsByEntity(
          "rfq",
          rfqId
        );
        setDocuments(docResponse.documents);
      } catch {
        // Not critical if documents fail to load
        setDocuments([]);
      }

      // Fetch vendor's quote for this RFQ
      if (user) {
        try {
          const quotesResponse = await QuoteService.getQuotesByRfqId(rfqId);
          // Find the quote submitted by this vendor
          const vendorQuote = quotesResponse.quotes.find(
            (quote) => quote.vendor_id === user.id
          );

          // Ensure total_amount is a number
          if (vendorQuote && typeof vendorQuote.total_amount === "string") {
            vendorQuote.total_amount = parseFloat(vendorQuote.total_amount);
          }

          setVendorQuote(vendorQuote || null);
        } catch {
          // Handle case where vendor has no quote for this RFQ
          // This is not an error, it just means the vendor didn't submit a quote
          console.log("No quote found for this vendor");
          setVendorQuote(null);
        }
      }

      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch RFQ details"
      );
    } finally {
      setLoading(false);
    }
  }, [rfqId, user]);

  useEffect(() => {
    if (!isNaN(rfqId)) {
      fetchRfqDetails();
    }
  }, [rfqId, fetchRfqDetails]);

  // Add document download handler
  const handleDownloadDocument = async (documentId: number) => {
    try {
      const blob = await DocumentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        documents.find((doc) => doc.id === documentId)?.original_name ||
        "document";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download document"
      );
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
                    href="/dashboard"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="#"
                    className="border-b-2 border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Closed RFQ Details
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
                {/* RFQ Details Section */}
                <div className="bg-white shadow sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {rfq.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Request for Quotation (Closed)
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
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

                          {rfq.contact_person && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">
                                Contact Person
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {rfq.contact_person}
                              </dd>
                            </div>
                          )}

                          {rfq.contact_email && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">
                                Contact Email
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {rfq.contact_email}
                              </dd>
                            </div>
                          )}

                          {rfq.contact_phone && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">
                                Contact Phone
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {rfq.contact_phone}
                              </dd>
                            </div>
                          )}

                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                              Deadline
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {rfq.deadline ? formatDate(rfq.deadline) : "N/A"}
                            </dd>
                          </div>

                          {rfq.special_requirements && (
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                              <dt className="text-sm font-medium text-gray-500">
                                Special Requirements
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {rfq.special_requirements}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RFQ Documents Section */}
                <div className="bg-white shadow sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        RFQ Documents
                      </h3>
                    </div>

                    {/* Documents List */}
                    {documents.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">
                          No documents uploaded for this RFQ.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {documents.map((document) => (
                            <li key={document.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                                      <svg
                                        className="h-6 w-6 text-blue-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                    </div>
                                    <div className="ml-4">
                                      <p className="text-sm font-medium text-gray-900">
                                        {document.original_name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {(document.file_size / 1024).toFixed(2)}{" "}
                                        KB
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() =>
                                        handleDownloadDocument(document.id)
                                      }
                                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                    >
                                      Download
                                    </button>
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

                {/* Vendor Quote Section */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Your Quote Details
                    </h3>

                    {vendorQuote ? (
                      <div className="border-t border-gray-200">
                        <dl>
                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                              Quote Status
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  vendorQuote.status === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : vendorQuote.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {vendorQuote.status || "N/A"}
                              </span>
                            </dd>
                          </div>

                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                              Total Amount
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              ₹
                              {typeof vendorQuote.total_amount === "number"
                                ? vendorQuote.total_amount.toFixed(2)
                                : "N/A"}
                            </dd>
                          </div>

                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                              Submission Date
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {vendorQuote.created_at &&
                              typeof vendorQuote.created_at === "string"
                                ? new Date(
                                    vendorQuote.created_at
                                  ).toLocaleString()
                                : "N/A"}
                            </dd>
                          </div>

                          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className="text-sm font-medium text-gray-500">
                              Last Updated
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {vendorQuote.updated_at &&
                              typeof vendorQuote.updated_at === "string"
                                ? new Date(
                                    vendorQuote.updated_at
                                  ).toLocaleString()
                                : "N/A"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">
                          You did not submit a quote for this RFQ.
                        </p>
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

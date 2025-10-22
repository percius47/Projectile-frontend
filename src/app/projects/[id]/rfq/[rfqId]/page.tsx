// src/app/projects/[id]/rfq/[rfqId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProjectService, { Project } from "@/services/projectService";
import RfqService, { Rfq } from "@/services/rfqService";
import QuoteService, { Quote } from "@/services/quoteService";
import DocumentService, { Document } from "@/services/documentService";
import ProtectedRoute from "@/components/ProtectedRoute";
import VendorDetailsModal from "@/components/VendorDetailsModal";
import { formatDate } from "@/utils/dateUtils";

export default function RfqDetailWithQuotesPage({
  params,
}: {
  params:
    | Promise<{ id: string; rfqId: string }>
    | { id: string; rfqId: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

  // Vendor details modal state
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedVendorDetails, setSelectedVendorDetails] =
    useState<Quote["vendor_details"]>(undefined);

  // Add document state
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  const { user, logout } = useAuth();
  const router = useRouter();

  // Properly unwrap params using React.use() for Next.js 15
  const unwrappedParams = use(
    params instanceof Promise ? params : Promise.resolve(params)
  );
  const projectId = parseInt(unwrappedParams.id);
  const rfqId = parseInt(unwrappedParams.rfqId);

  useEffect(() => {
    if (!isNaN(projectId) && !isNaN(rfqId)) {
      fetchData();
    }
  }, [projectId, rfqId]);

  const fetchData = async () => {
    try {
      // Fetch project details
      const projectResponse = await ProjectService.getProjectById(projectId);
      setProject(projectResponse.project);

      // Fetch RFQ details
      const rfqResponse = await RfqService.getRfqById(rfqId);
      setRfq(rfqResponse.rfq);

      // Fetch quotes for this RFQ
      const quotesResponse = await QuoteService.getQuotesByRfqId(rfqId);
      setQuotes(quotesResponse.quotes);

      // Fetch documents for this RFQ
      try {
        const docResponse = await DocumentService.getDocumentsByEntity(
          "rfq",
          rfqId
        );
        setDocuments(docResponse.documents);
      } catch (docErr) {
        // Not critical if documents fail to load
        setDocuments([]);
      }

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAwardQuote = async (quoteId: number) => {
    if (window.confirm("Are you sure you want to award this quote?")) {
      try {
        // Update RFQ status to 'awarded'
        await RfqService.updateRfq(rfqId, { status: "awarded" });

        // Update awarded quote status
        const awardedQuote = quotes.find((q) => q.id === quoteId);
        if (awardedQuote) {
          await QuoteService.updateQuote(quoteId, {
            status: "accepted",
            total_amount: awardedQuote.total_amount,
          });

          // Update other quotes to 'rejected'
          for (const quote of quotes) {
            if (quote.id !== quoteId) {
              await QuoteService.updateQuote(quote.id, { status: "rejected" });
            }
          }
        }

        // Refresh data
        fetchData();
        alert("Quote awarded successfully!");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to award quote");
      }
    }
  };

  // Add document upload handler
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const file = selectedFiles[0];
      const response = await DocumentService.uploadDocument("rfq", rfqId, file);

      // Add the new document to the list
      setDocuments([response.document, ...documents]);

      // Clear the file input
      setSelectedFiles(null);

      // Show success message
      alert("Document uploaded successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload document"
      );
    } finally {
      setUploading(false);
    }
  };

  // Add document delete handler
  const handleDeleteDocument = async (documentId: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await DocumentService.deleteDocument(documentId);
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        alert("Document deleted successfully!");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete document"
        );
      }
    }
  };

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

  const openVendorDetailsModal = (vendorDetails: Quote["vendor_details"]) => {
    setSelectedVendorDetails(vendorDetails);
    setIsVendorModalOpen(true);
  };

  const closeVendorDetailsModal = () => {
    setIsVendorModalOpen(false);
    setSelectedVendorDetails(undefined);
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
                onClick={() => router.push(`/projects/${projectId}`)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Back to Project
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
                    href={`/projects/${projectId}`}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Project
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
            {rfq && project && (
              <div className="max-w-7xl mx-auto">
                {/* RFQ Header */}
                <div className="bg-white shadow sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {rfq.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Request for Quotation
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {project.name}
                          </span>
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {rfq.status}
                          </span>
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {quotes.length} Quotes
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/projects/${projectId}`)}
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Back to Project
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-gray-200">
                      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Description
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {rfq.description || "No description provided"}
                          </dd>
                        </div>

                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            Deadline
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {rfq.deadline ? formatDate(rfq.deadline) : "N/A"}
                          </dd>
                        </div>

                        {rfq.contact_person && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                              Contact Person
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {rfq.contact_person}
                            </dd>
                          </div>
                        )}

                        {rfq.contact_email && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                              Contact Email
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {rfq.contact_email}
                            </dd>
                          </div>
                        )}

                        {rfq.contact_phone && (
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">
                              Contact Phone
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {rfq.contact_phone}
                            </dd>
                          </div>
                        )}

                        {rfq.special_requirements && (
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">
                              Special Requirements
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {rfq.special_requirements}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="bg-white shadow sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Documents
                      </h3>
                    </div>

                    {/* Upload Form */}
                    <form onSubmit={handleFileUpload} className="mb-6">
                      <div className="flex items-end space-x-4">
                        <div className="flex-1">
                          <label
                            htmlFor="document-upload"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Upload Document
                          </label>
                          <input
                            type="file"
                            id="document-upload"
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            className="mt-1 block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-medium
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={
                            uploading ||
                            !selectedFiles ||
                            selectedFiles.length === 0
                          }
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </button>
                      </div>
                      {error && (
                        <div className="mt-2 text-sm text-red-600">{error}</div>
                      )}
                    </form>

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
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      Download
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteDocument(document.id)
                                      }
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      Delete
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

                {/* Quote Comparison Dashboard */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Quote Comparison
                      </h3>
                    </div>

                    {quotes.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No quotes have been submitted for this RFQ yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Vendor
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Total Amount
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Submitted
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {quotes.map((quote) => (
                              <tr
                                key={quote.id}
                                className={
                                  selectedQuoteId === quote.id
                                    ? "bg-blue-50"
                                    : ""
                                }
                                onClick={() =>
                                  setSelectedQuoteId(
                                    quote.id === selectedQuoteId
                                      ? null
                                      : quote.id
                                  )
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {quote.vendor_details?.company_name ||
                                      quote.vendor_details?.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {quote.vendor_details?.email}
                                  </div>
                                  {quote.vendor_details?.contact_person && (
                                    <div className="text-sm text-gray-500">
                                      Contact:{" "}
                                      {quote.vendor_details.contact_person}
                                    </div>
                                  )}
                                  {quote.vendor_details?.phone && (
                                    <div className="text-sm text-gray-500">
                                      Phone: {quote.vendor_details.phone}
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (quote.vendor_details) {
                                        openVendorDetailsModal(
                                          quote.vendor_details
                                        );
                                      }
                                    }}
                                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    View Details
                                  </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    ₹
                                    {quote.total_amount.toLocaleString("en-IN")}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      quote.status === "accepted"
                                        ? "bg-green-100 text-green-800"
                                        : quote.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {quote.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {quote.created_at
                                    ? formatDate(quote.created_at)
                                    : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {rfq.status !== "awarded" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAwardQuote(quote.id);
                                      }}
                                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      Award
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Awarded Quote Details */}
                {rfq.status === "awarded" && selectedQuoteId && (
                  <div className="bg-white shadow sm:rounded-lg mt-6">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Awarded Quote Details
                      </h3>
                      {(() => {
                        const awardedQuote = quotes.find(
                          (q) => q.id === selectedQuoteId
                        );
                        return awardedQuote ? (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <h4 className="text-md font-medium text-gray-700">
                                Vendor Information
                              </h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">Name:</span>{" "}
                                  {awardedQuote.vendor_details?.name}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Company:</span>{" "}
                                  {awardedQuote.vendor_details?.company_name}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Email:</span>{" "}
                                  {awardedQuote.vendor_details?.email}
                                </p>
                                {awardedQuote.vendor_details
                                  ?.contact_person && (
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Contact Person:
                                    </span>{" "}
                                    {awardedQuote.vendor_details.contact_person}
                                  </p>
                                )}
                                {awardedQuote.vendor_details?.phone && (
                                  <p className="text-sm">
                                    <span className="font-medium">Phone:</span>{" "}
                                    {awardedQuote.vendor_details.phone}
                                  </p>
                                )}
                                {awardedQuote.vendor_details?.address && (
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Address:
                                    </span>{" "}
                                    {awardedQuote.vendor_details.address}
                                  </p>
                                )}
                                {awardedQuote.vendor_details?.gst_number && (
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      GST Number:
                                    </span>{" "}
                                    {awardedQuote.vendor_details.gst_number}
                                  </p>
                                )}
                                <button
                                  onClick={() => {
                                    if (awardedQuote.vendor_details) {
                                      openVendorDetailsModal(
                                        awardedQuote.vendor_details
                                      );
                                    }
                                  }}
                                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  View Full Details
                                </button>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-md font-medium text-gray-700">
                                Quote Details
                              </h4>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Total Amount:
                                  </span>{" "}
                                  ₹
                                  {awardedQuote.total_amount.toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Status:</span>{" "}
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {awardedQuote.status}
                                  </span>
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Submitted:
                                  </span>{" "}
                                  {awardedQuote.created_at
                                    ? formatDate(awardedQuote.created_at)
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Vendor Details Modal */}
        <VendorDetailsModal
          isOpen={isVendorModalOpen}
          onClose={closeVendorDetailsModal}
          vendorDetails={selectedVendorDetails}
        />
      </div>
    </ProtectedRoute>
  );
}

// src/app/quotes/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import QuoteService, { Quote, UpdateQuoteData } from "@/services/quoteService";
import DocumentService, { Document } from "@/services/documentService";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState("submitted");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
  const quoteId = parseInt(unwrappedParams.id);

  useEffect(() => {
    if (!isNaN(quoteId)) {
      fetchQuoteDetails();
    }
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      const response = await QuoteService.getQuoteById(quoteId);
      setQuote(response.quote);
      setTotalAmount(response.quote.total_amount.toString());
      setStatus(response.quote.status);

      // Fetch documents for this quote
      try {
        const docResponse = await DocumentService.getDocumentsByEntity(
          "quote",
          quoteId
        );
        setDocuments(docResponse.documents);
      } catch (docErr) {
        // Not critical if documents fail to load
        setDocuments([]);
      }

      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch quote details"
      );
    } finally {
      setLoading(false);
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
      const response = await DocumentService.uploadDocument(
        "quote",
        quoteId,
        file
      );

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
      console.error("Download error:", err); // Log the actual error for debugging
      setError(
        err instanceof Error
          ? `Failed to download document: ${err.message}`
          : "Failed to download document"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!user) {
        throw new Error("User not found");
      }

      if (!totalAmount || isNaN(parseFloat(totalAmount))) {
        throw new Error("Please enter a valid total amount");
      }

      const updateData: UpdateQuoteData = {
        total_amount: parseFloat(totalAmount),
        status: status as
          | "draft"
          | "submitted"
          | "revised"
          | "accepted"
          | "rejected",
      };

      await QuoteService.updateQuote(quoteId, updateData);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating the quote"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      try {
        await QuoteService.deleteQuote(quoteId);
        router.push("/dashboard");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while deleting the quote"
        );
      }
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
                    Edit Quote
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
            {quote && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg mb-6">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Edit Quote
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {quote.custom_id || `Quote #${quote.id}`}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {quote.status}
                        </p>
                      </div>
                    </div>

                    {quote.project_details && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <h3 className="text-lg font-medium text-gray-900">
                          Project Information
                        </h3>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          <p className="text-sm">
                            <span className="font-medium">Project:</span>{" "}
                            {quote.project_details.name}
                          </p>
                          {quote.project_details.custom_id && (
                            <p className="text-sm">
                              <span className="font-medium">Project ID:</span>{" "}
                              {quote.project_details.custom_id}
                            </p>
                          )}
                          {quote.rfq_details && (
                            <>
                              <p className="text-sm">
                                <span className="font-medium">RFQ:</span>{" "}
                                {quote.rfq_details.title}
                              </p>
                              {quote.rfq_details.custom_id && (
                                <p className="text-sm">
                                  <span className="font-medium">RFQ ID:</span>{" "}
                                  {quote.rfq_details.custom_id}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Document Upload Section */}
                    <div className="bg-white shadow sm:rounded-lg mb-6">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Quote Documents
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
                                onChange={(e) =>
                                  setSelectedFiles(e.target.files)
                                }
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
                            <div className="mt-2 text-sm text-red-600">
                              {error}
                            </div>
                          )}
                        </form>

                        {/* Documents List */}
                        {documents.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-500">
                              No documents uploaded for this quote.
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
                                            {(
                                              document.file_size / 1024
                                            ).toFixed(2)}{" "}
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

                    {/* Edit Quote Form */}
                    <div className="bg-white shadow sm:rounded-lg mb-6">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Update Quote Details
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {error && (
                            <div className="rounded-md bg-red-50 p-4">
                              <div className="text-sm text-red-700">
                                {error}
                              </div>
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
                              placeholder="Enter total amount"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="status"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Status
                            </label>
                            <select
                              id="status"
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="draft">Draft</option>
                              <option value="submitted">Submitted</option>
                              <option value="revised">Revised</option>
                            </select>
                          </div>

                          <div className="flex justify-between space-x-3">
                            <button
                              type="button"
                              onClick={() => router.push("/dashboard")}
                              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Cancel
                            </button>
                            <div className="flex space-x-3">
                              <button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Delete Quote
                              </button>
                              <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                              >
                                {submitting ? "Updating..." : "Update Quote"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
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

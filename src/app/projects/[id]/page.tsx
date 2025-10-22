// src/app/projects/[id]/page.tsx
"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProjectService, { Project } from "@/services/projectService";
import RequirementService, {
  Requirement,
  CreateRequirementData,
  UpdateRequirementData,
} from "@/services/requirementService";
import RfqService, { Rfq } from "@/services/rfqService";
import QuoteService, { Quote } from "@/services/quoteService";
import DocumentService, { Document } from "@/services/documentService";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";
import { formatDate } from "@/utils/dateUtils";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [closedRfqs, setClosedRfqs] = useState<Rfq[]>([]); // Add this state
  const [rfqQuotes, setRfqQuotes] = useState<{ [key: number]: Quote[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRequirement, setIsAddingRequirement] = useState(false);

  // Project edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  // Requirement form state
  const [reqItemName, setReqItemName] = useState("");
  const [reqDescription, setReqDescription] = useState("");
  const [reqQuantity, setReqQuantity] = useState("");
  const [reqUnit, setReqUnit] = useState("");
  const [reqRate, setReqRate] = useState("");
  const [reqCategory, setReqCategory] = useState("");

  // Document upload state
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Editing requirement state
  const [editingRequirementId, setEditingRequirementId] = useState<
    number | null
  >(null);
  const [editReqItemName, setEditReqItemName] = useState("");
  const [editReqDescription, setEditReqDescription] = useState("");
  const [editReqQuantity, setEditReqQuantity] = useState("");
  const [editReqUnit, setEditReqUnit] = useState("");
  const [editReqRate, setEditReqRate] = useState("");
  const [editReqCategory, setEditReqCategory] = useState("");

  const { user, logout } = useAuth();
  const router = useRouter();

  // Properly unwrap params using React.use() for Next.js 15
  // Handle both Promise and direct object cases
  const unwrappedParams = use(
    params instanceof Promise ? params : Promise.resolve(params)
  );
  const projectId = parseInt(unwrappedParams.id);

  const fetchProject = useCallback(async () => {
    try {
      const response = await ProjectService.getProjectById(projectId);
      setProject(response.project);
      setEditName(response.project.name);
      setEditDescription(response.project.description || "");
      setEditLocation(response.project.location || "");
      setEditDeadline(response.project.deadline || "");

      // Fetch documents for this project
      try {
        const docResponse = await DocumentService.getDocumentsByEntity(
          "project",
          projectId
        );
        setDocuments(docResponse.documents);
      } catch {
        // Not critical if documents fail to load
        setDocuments([]);
      }

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch project");
    }
  }, [projectId]);

  const fetchRequirements = useCallback(async () => {
    try {
      const response = await RequirementService.getRequirementsByProjectId(
        projectId
      );
      setRequirements(response.requirements);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch requirements"
      );
    }
  }, [projectId]);

  const fetchRfqs = useCallback(async () => {
    try {
      const response = await RfqService.getRfqsByProjectId(projectId);
      // Filter open RFQs
      const openRfqs = response.rfqs.filter((rfq) => rfq.status === "open");
      setRfqs(openRfqs);

      // Fetch closed RFQs
      const closedRfqsResponse = await RfqService.getClosedRfqsByProjectId(
        projectId
      );
      setClosedRfqs(closedRfqsResponse.rfqs);

      // Fetch quotes for all RFQs (both open and closed)
      const allRfqs = [...response.rfqs, ...closedRfqsResponse.rfqs];
      const quotesData: { [key: number]: Quote[] } = {};
      for (const rfq of allRfqs) {
        try {
          const quotesResponse = await QuoteService.getQuotesByRfqId(rfq.id);
          quotesData[rfq.id] = quotesResponse.quotes;
        } catch {
          quotesData[rfq.id] = [];
        }
      }
      setRfqQuotes(quotesData);

      setError("");
    } catch {
      // RFQs might not be available for all users, so we won&apos;t set an error here
      setRfqs([]);
      setClosedRfqs([]);
      setRfqQuotes({});
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData = {
        name: editName,
        description: editDescription || undefined,
        location: editLocation || undefined,
        deadline: editDeadline || undefined,
      };

      await ProjectService.updateProject(projectId, updateData);
      await fetchProject();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await ProjectService.deleteProject(projectId);
        router.push("/dashboard");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete project"
        );
      }
    }
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requirementData: CreateRequirementData = {
        project_id: projectId,
        item_name: reqItemName,
        description: reqDescription || undefined,
        quantity: parseFloat(reqQuantity),
        unit: reqUnit,
        rate: reqRate ? parseFloat(reqRate) : undefined,
        category: reqCategory || undefined,
      };

      await RequirementService.addRequirement(requirementData);
      await fetchRequirements();
      resetRequirementForm();
      setIsAddingRequirement(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add requirement"
      );
    }
  };

  const resetRequirementForm = () => {
    setReqItemName("");
    setReqDescription("");
    setReqQuantity("");
    setReqUnit("");
    setReqRate("");
    setReqCategory("");
  };

  const handleDeleteRequirement = async (requirementId: number) => {
    if (window.confirm("Are you sure you want to delete this requirement?")) {
      try {
        await RequirementService.deleteRequirement(requirementId);
        await fetchRequirements();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete requirement"
        );
      }
    }
  };

  const startEditingRequirement = (requirement: Requirement) => {
    setEditingRequirementId(requirement.id);
    setEditReqItemName(requirement.item_name);
    setEditReqDescription(requirement.description || "");
    setEditReqQuantity(requirement.quantity.toString());
    setEditReqUnit(requirement.unit);
    setEditReqRate(requirement.rate?.toString() || "");
    setEditReqCategory(requirement.category || "");
  };

  const cancelEditingRequirement = () => {
    setEditingRequirementId(null);
    resetEditRequirementForm();
  };

  const resetEditRequirementForm = () => {
    setEditReqItemName("");
    setEditReqDescription("");
    setEditReqQuantity("");
    setEditReqUnit("");
    setEditReqRate("");
    setEditReqCategory("");
  };

  const handleUpdateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequirementId) return;

    try {
      const updateData: UpdateRequirementData = {
        item_name: editReqItemName,
        description: editReqDescription || undefined,
        quantity: parseFloat(editReqQuantity),
        unit: editReqUnit,
        rate: editReqRate ? parseFloat(editReqRate) : undefined,
        category: editReqCategory || undefined,
      };

      await RequirementService.updateRequirement(
        editingRequirementId,
        updateData
      );
      await fetchRequirements();
      setEditingRequirementId(null);
      resetEditRequirementForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update requirement"
      );
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
        "project",
        projectId,
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

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", current: false },
    { name: "Project Details", href: "#", current: true },
  ];

  if (loading || isNaN(projectId)) {
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
            {project && (
              <div className="space-y-6">
                {/* Project Header */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {project.name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {project.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {project.location || "No location"}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {project.deadline
                              ? `Due: ${formatDate(project.deadline)}`
                              : "No deadline"}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {requirements.length} Requirements
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                        <button
                          onClick={handleDeleteProject}
                          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    {isEditing && (
                      <form
                        onSubmit={handleUpdateProject}
                        className="mt-6 space-y-4 border-t border-gray-200 pt-4"
                      >
                        <div>
                          <label
                            htmlFor="edit-name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Project Name *
                          </label>
                          <input
                            type="text"
                            id="edit-name"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="edit-description"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Description
                          </label>
                          <textarea
                            id="edit-description"
                            rows={3}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="edit-location"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Location
                            </label>
                            <input
                              type="text"
                              id="edit-location"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="edit-deadline"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Deadline
                            </label>
                            <input
                              type="date"
                              id="edit-deadline"
                              value={editDeadline}
                              onChange={(e) => setEditDeadline(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Update Project
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Project Documents
                      </h3>
                    </div>

                    {/* Upload Form */}
                    <form onSubmit={handleFileUpload} className="mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
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
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto"
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
                          No documents uploaded for this project.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {documents.map((document) => (
                            <li key={document.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                                  <div className="flex flex-wrap gap-2">
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

                {/* RFQs Section */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Request for Quotations (RFQs)
                      </h3>
                      <Link
                        href={`/projects/${projectId}/rfqs/create`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create RFQ
                      </Link>
                    </div>

                    {/* Open RFQs List */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-2">
                        Open RFQs
                      </h4>
                      {rfqs.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            No open RFQs created yet.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden bg-white shadow sm:rounded-md">
                          <ul className="divide-y divide-gray-200">
                            {rfqs.map((rfq) => (
                              <li key={rfq.id}>
                                <div className="px-4 py-4 sm:px-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                                    <div>
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
                                      href={`/projects/${projectId}/rfq/${rfq.id}`}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
                                    >
                                      View Details & Compare Quotes
                                    </Link>
                                  </div>

                                  {/* Quotes for this RFQ */}
                                  {rfqQuotes[rfq.id] &&
                                    rfqQuotes[rfq.id].length > 0 && (
                                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                          Quotes ({rfqQuotes[rfq.id].length})
                                        </h4>
                                        <div className="space-y-3">
                                          {rfqQuotes[rfq.id].map(
                                            (quote: Quote) => (
                                              <div
                                                key={quote.id}
                                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 bg-white rounded border"
                                              >
                                                <div>
                                                  <p className="font-medium text-gray-900">
                                                    {quote.vendor_details
                                                      ?.company_name ||
                                                      quote.vendor_details
                                                        ?.name}
                                                  </p>
                                                  <p className="text-gray-500 text-sm">
                                                    {
                                                      quote.vendor_details
                                                        ?.email
                                                    }
                                                  </p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="font-medium text-gray-900">
                                                    ₹{quote.total_amount}
                                                  </p>
                                                  <p className="text-gray-500 text-sm">
                                                    {quote.status}
                                                  </p>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Closed/Awarded RFQs List */}
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">
                        Closed/Awarded RFQs
                      </h4>
                      {closedRfqs.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            No closed or awarded RFQs yet.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden bg-white shadow sm:rounded-md">
                          <ul className="divide-y divide-gray-200">
                            {closedRfqs.map((rfq) => (
                              <li key={rfq.id}>
                                <div className="px-4 py-4 sm:px-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-blue-600 truncate">
                                      {rfq.title}
                                    </p>
                                    <div className="flex-shrink-0">
                                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {rfq.status}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-2">
                                    <div>
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
                                      href={`/projects/${projectId}/rfq/${rfq.id}`}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
                                    >
                                      View Details & Awarded Quote
                                    </Link>
                                  </div>

                                  {/* Quotes for this RFQ */}
                                  {rfqQuotes[rfq.id] &&
                                    rfqQuotes[rfq.id].length > 0 && (
                                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                          Quotes ({rfqQuotes[rfq.id].length})
                                        </h4>
                                        <div className="space-y-3">
                                          {rfqQuotes[rfq.id].map(
                                            (quote: Quote) => (
                                              <div
                                                key={quote.id}
                                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 bg-white rounded border"
                                              >
                                                <div>
                                                  <p className="font-medium text-gray-900">
                                                    {quote.vendor_details
                                                      ?.company_name ||
                                                      quote.vendor_details
                                                        ?.name}
                                                  </p>
                                                  <p className="text-gray-500 text-sm">
                                                    {
                                                      quote.vendor_details
                                                        ?.email
                                                    }
                                                  </p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="font-medium text-gray-900">
                                                    ₹{quote.total_amount}
                                                  </p>
                                                  <p
                                                    className={`text-sm font-medium ${
                                                      quote.status ===
                                                      "accepted"
                                                        ? "text-green-600"
                                                        : quote.status ===
                                                          "rejected"
                                                        ? "text-red-600"
                                                        : "text-gray-500"
                                                    }`}
                                                  >
                                                    {quote.status}
                                                  </p>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Requirements
                      </h3>
                      <button
                        onClick={() =>
                          setIsAddingRequirement(!isAddingRequirement)
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        Add Requirement
                      </button>
                    </div>

                    {/* Add Requirement Form */}
                    {isAddingRequirement && (
                      <form
                        onSubmit={handleAddRequirement}
                        className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          Add New Requirement
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="req-item-name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Item Name *
                            </label>
                            <input
                              type="text"
                              id="req-item-name"
                              required
                              value={reqItemName}
                              onChange={(e) => setReqItemName(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="req-unit"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Unit *
                            </label>
                            <input
                              type="text"
                              id="req-unit"
                              required
                              value={reqUnit}
                              onChange={(e) => setReqUnit(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="req-quantity"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Quantity *
                            </label>
                            <input
                              type="number"
                              id="req-quantity"
                              required
                              value={reqQuantity}
                              onChange={(e) => setReqQuantity(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="req-rate"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Rate (Optional)
                            </label>
                            <input
                              type="number"
                              id="req-rate"
                              step="0.01"
                              value={reqRate}
                              onChange={(e) => setReqRate(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="req-description"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Description
                            </label>
                            <textarea
                              id="req-description"
                              rows={2}
                              value={reqDescription}
                              onChange={(e) =>
                                setReqDescription(e.target.value)
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label
                              htmlFor="req-category"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Category (Optional)
                            </label>
                            <input
                              type="text"
                              id="req-category"
                              value={reqCategory}
                              onChange={(e) => setReqCategory(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingRequirement(false);
                              resetRequirementForm();
                            }}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Add Requirement
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Requirements List */}
                    {requirements.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No requirements added yet. Add your first requirement
                          to get started.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {requirements.map((requirement) => (
                            <div key={requirement.id}>
                              {editingRequirementId === requirement.id ? (
                                <div className="px-4 py-4 sm:px-6">
                                  <form onSubmit={handleUpdateRequirement}>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                      <div>
                                        <label
                                          htmlFor="edit-req-item-name"
                                          className="block text-sm font-medium text-gray-700"
                                        >
                                          Item Name *
                                        </label>
                                        <input
                                          type="text"
                                          id="edit-req-item-name"
                                          required
                                          value={editReqItemName}
                                          onChange={(e) =>
                                            setEditReqItemName(e.target.value)
                                          }
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                      </div>

                                      <div>
                                        <label
                                          htmlFor="edit-req-unit"
                                          className="block text-sm font-medium text-gray-700"
                                        >
                                          Unit *
                                        </label>
                                        <input
                                          type="text"
                                          id="edit-req-unit"
                                          required
                                          value={editReqUnit}
                                          onChange={(e) =>
                                            setEditReqUnit(e.target.value)
                                          }
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                      </div>

                                      <div>
                                        <label
                                          htmlFor="edit-req-quantity"
                                          className="block text-sm font-medium text-gray-700"
                                        >
                                          Quantity *
                                        </label>
                                        <input
                                          type="number"
                                          id="edit-req-quantity"
                                          required
                                          value={editReqQuantity}
                                          onChange={(e) =>
                                            setEditReqQuantity(e.target.value)
                                          }
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                      </div>

                                      <div>
                                        <label
                                          htmlFor="edit-req-rate"
                                          className="block text-sm font-medium text-gray-700"
                                        >
                                          Rate (Optional)
                                        </label>
                                        <input
                                          type="number"
                                          id="edit-req-rate"
                                          step="0.01"
                                          value={editReqRate}
                                          onChange={(e) =>
                                            setEditReqRate(e.target.value)
                                          }
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                      </div>

                                      <div className="sm:col-span-2">
                                        <label
                                          htmlFor="edit-req-description"
                                          className="block text-sm font-medium text-gray-700"
                                        >
                                          Description
                                        </label>
                                        <textarea
                                          id="edit-req-description"
                                          rows={2}
                                          value={editReqDescription}
                                          onChange={(e) =>
                                            setEditReqDescription(
                                              e.target.value
                                            )
                                          }
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                      </div>

                                      <div className="sm:col-span-2">
                                        <label
                                          htmlFor="edit-req-category"
                                          className="block text-sm font-medium text-gray-700"
                                        >
                                          Category (Optional)
                                        </label>
                                        <input
                                          type="text"
                                          id="edit-req-category"
                                          value={editReqCategory}
                                          onChange={(e) =>
                                            setEditReqCategory(e.target.value)
                                          }
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 mt-4">
                                      <button
                                        type="button"
                                        onClick={cancelEditingRequirement}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      >
                                        Update Requirement
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              ) : (
                                <div className="px-4 py-4 sm:px-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-blue-600 truncate">
                                      {requirement.item_name}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        onClick={() =>
                                          startEditingRequirement(requirement)
                                        }
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteRequirement(
                                            requirement.id
                                          )
                                        }
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <p>
                                      {requirement.quantity} {requirement.unit}
                                      {requirement.rate && (
                                        <span>
                                          {" "}
                                          @ ₹{requirement.rate} = ₹
                                          {(
                                            requirement.quantity *
                                            (requirement.rate || 0)
                                          ).toFixed(2)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {requirement.category && (
                                <div className="px-4 pb-3 sm:px-6">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {requirement.category}
                                  </span>
                                </div>
                              )}
                              {/* Add link to requirement detail page */}
                              <div className="px-4 pb-4 sm:px-6">
                                <Link
                                  href={`/projects/${projectId}/requirements/${requirement.id}`}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
                                >
                                  View Details & Documents
                                </Link>
                              </div>
                            </div>
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

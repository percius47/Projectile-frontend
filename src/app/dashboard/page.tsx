// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProjectService, { Project } from "@/services/projectService";
import RfqService, { Rfq } from "@/services/rfqService";
import QuoteService, { Quote } from "@/services/quoteService";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";
import ResponsiveCard from "@/components/ResponsiveCard";
import ResponsiveButton from "@/components/ResponsiveButton";
import { formatDate } from "@/utils/dateUtils";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openRfqs, setOpenRfqs] = useState<Rfq[]>([]);
  const [closedRfqs, setClosedRfqs] = useState<Rfq[]>([]);
  const [vendorQuotes, setVendorQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch data based on user role
      if (user?.role === "project_owner") {
        const response = await ProjectService.getProjects();
        setProjects(response.projects);
      } else if (user?.role === "vendor") {
        // Fetch vendor quotes directly using user ID
        try {
          const quotesResponse = await QuoteService.getQuotesByVendorId(
            user.id
          );
          setVendorQuotes(quotesResponse.quotes);
        } catch (quotesError) {
          setVendorQuotes([]);
        }

        // Fetch open RFQs
        try {
          const rfqsResponse = await RfqService.getAllRfqs();
          // Filter to only show truly open RFQs
          const openRfqs = rfqsResponse.rfqs.filter(
            (rfq) => rfq.status === "open"
          );
          setOpenRfqs(openRfqs);
        } catch (rfqsError) {
          setOpenRfqs([]);
        }

        // Fetch closed RFQs
        try {
          const closedRfqsResponse = await RfqService.getClosedRfqs();
          setClosedRfqs(closedRfqsResponse.rfqs);
        } catch (closedRfqsError) {
          setClosedRfqs([]);
        }
      }

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Navigation items for responsive navigation
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", current: true },
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
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              {user?.role === "project_owner" && (
                <ResponsiveButton
                  href="/projects/create"
                  variant="primary"
                  fullWidth={true}
                  className="sm:w-auto"
                >
                  Create Project
                </ResponsiveButton>
              )}
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
              <>
                {/* Vendor Dashboard Content */}
                {user?.role === "vendor" && (
                  <div className="space-y-6">
                    {/* Vendor Profile */}
                    <ResponsiveCard
                      title="Vendor Profile"
                      actions={
                        <ResponsiveButton
                          onClick={() => router.push("/vendors/profile")}
                          variant="primary"
                          size="small"
                        >
                          Edit Profile
                        </ResponsiveButton>
                      }
                    >
                      <div>
                        <p className="mt-1 text-sm text-gray-500">
                          {user?.company_name}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {user?.contact_person && (
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              Contact: {user?.contact_person}
                            </span>
                          )}
                          {user?.phone && (
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Phone: {user?.phone}
                            </span>
                          )}
                          {user?.email && (
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                              Email: {user?.email}
                            </span>
                          )}
                          {user?.gst_number && (
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              GST: {user?.gst_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </ResponsiveCard>

                    {/* Live Quotes Section */}
                    <ResponsiveCard title="Live Quotes">
                      {vendorQuotes.filter(
                        (quote) =>
                          openRfqs.some((rfq) => rfq.id === quote.rfq_id) &&
                          quote.status !== "accepted" &&
                          quote.status !== "rejected"
                      ).length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            You haven't submitted any quotes for open RFQs yet.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden bg-white shadow sm:rounded-md">
                          <ul className="divide-y divide-gray-200">
                            {vendorQuotes
                              .filter(
                                (quote) =>
                                  openRfqs.some(
                                    (rfq) => rfq.id === quote.rfq_id
                                  ) &&
                                  quote.status !== "accepted" &&
                                  quote.status !== "rejected"
                              )
                              .map((quote) => (
                                <li key={quote.id}>
                                  <div className="px-4 py-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <div className="flex flex-col">
                                        <p className="text-sm font-medium text-blue-600 truncate">
                                          {quote.custom_id ||
                                            `Quote #${quote.id}`}
                                        </p>
                                        {quote.rfq_details && (
                                          <p className="text-xs text-gray-500 truncate">
                                            RFQ:{" "}
                                            {quote.rfq_details.custom_id ||
                                              quote.rfq_details.title}
                                          </p>
                                        )}
                                        {quote.project_details && (
                                          <p className="text-xs text-gray-500 truncate">
                                            Project:{" "}
                                            {quote.project_details.custom_id ||
                                              quote.project_details.name}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
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
                                        {quote.rfq_details && (
                                          <p className="flex items-center text-sm text-gray-500">
                                            RFQ: {quote.rfq_details.title}
                                          </p>
                                        )}
                                        {quote.project_details && (
                                          <p className="flex items-center text-sm text-gray-500">
                                            Project:{" "}
                                            {quote.project_details.name}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center text-sm text-gray-500">
                                        <p>
                                          Submitted:{" "}
                                          {formatDate(quote.created_at)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <ResponsiveButton
                                        href={`/quotes/${quote.id}`}
                                        variant="primary"
                                        size="small"
                                        fullWidth={true}
                                        className="sm:w-auto"
                                      >
                                        Edit Quote
                                      </ResponsiveButton>
                                    </div>
                                  </div>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </ResponsiveCard>

                    {/* Open RFQs Section */}
                    <ResponsiveCard title="Open RFQs">
                      {openRfqs.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            No open RFQs available at the moment.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden bg-white shadow sm:rounded-md">
                          <ul className="divide-y divide-gray-200">
                            {openRfqs.map((rfq) => {
                              // Check if vendor has already submitted a quote for this RFQ
                              const hasQuoted = vendorQuotes.some(
                                (quote) => quote.rfq_id === rfq.id
                              );

                              return (
                                <li key={rfq.id}>
                                  <div className="px-4 py-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <p className="text-sm font-medium text-blue-600 truncate">
                                        {rfq.title}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <p
                                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            hasQuoted
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-green-100 text-green-800"
                                          }`}
                                        >
                                          {hasQuoted ? "Quoted" : "Open"}
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
                                          Deadline: {formatDate(rfq.deadline)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      {!hasQuoted ? (
                                        <ResponsiveButton
                                          href={`/rfqs/${rfq.id}`}
                                          variant="primary"
                                          size="small"
                                          fullWidth={true}
                                          className="sm:w-auto"
                                        >
                                          Apply
                                        </ResponsiveButton>
                                      ) : (
                                        <span className="text-sm text-gray-500">
                                          You have already submitted a quote
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </ResponsiveCard>

                    {/* Closed RFQs Section */}
                    <ResponsiveCard title="Closed RFQs">
                      {closedRfqs.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            No closed RFQs available at the moment.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden bg-white shadow sm:rounded-md">
                          <ul className="divide-y divide-gray-200">
                            {closedRfqs.map((rfq) => {
                              // Find the vendor's quote for this RFQ if it exists
                              const vendorQuote = vendorQuotes.find(
                                (quote) => quote.rfq_id === rfq.id
                              );

                              return (
                                <li key={rfq.id}>
                                  <div className="px-4 py-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <p className="text-sm font-medium text-blue-600 truncate">
                                        {rfq.title}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <p
                                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            vendorQuote?.status === "accepted"
                                              ? "bg-green-100 text-green-800"
                                              : vendorQuote?.status ===
                                                "rejected"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {vendorQuote?.status === "accepted"
                                            ? "Accepted"
                                            : vendorQuote?.status === "rejected"
                                            ? "Rejected"
                                            : rfq.status}
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
                                    <div className="mt-2">
                                      <ResponsiveButton
                                        href={`/rfqs/${rfq.id}/closed`}
                                        variant="primary"
                                        size="small"
                                        fullWidth={true}
                                        className="sm:w-auto"
                                      >
                                        View Details
                                      </ResponsiveButton>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </ResponsiveCard>
                  </div>
                )}

                {/* Project Owner Dashboard Content */}
                {user?.role === "project_owner" && (
                  <ResponsiveCard>
                    <ul className="divide-y divide-gray-200">
                      {projects.length === 0 ? (
                        <li className="px-6 py-4 text-center">
                          <p className="text-gray-500">
                            No projects found. Create your first project to get
                            started.
                          </p>
                        </li>
                      ) : (
                        projects.map((project) => (
                          <li key={project.id}>
                            <Link
                              href={`/projects/${project.id}`}
                              className="block hover:bg-gray-50"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <p className="text-sm font-medium text-blue-600 truncate">
                                    {project.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Active
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 flex flex-col sm:flex-row sm:justify-between gap-2">
                                  <div className="flex flex-col">
                                    <p className="flex items-center text-sm text-gray-500">
                                      {project.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <p>
                                      Deadline: {formatDate(project.deadline)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </ResponsiveCard>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

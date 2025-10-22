// src/app/projects/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProjectService, { CreateProjectData } from "@/services/projectService";
import ProtectedRoute from "@/components/ProtectedRoute";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";

export default function CreateProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const projectData: CreateProjectData = {
        name,
        description: description || undefined,
        location: location || undefined,
        deadline: deadline || undefined,
      };

      await ProjectService.createProject(projectData);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the project"
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
    { name: "Dashboard", href: "/dashboard", current: false },
    { name: "Create Project", href: "#", current: true },
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
                Create New Project
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
                        htmlFor="project-name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Project Name *
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          id="project-name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter project name"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Description
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="description"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter project description"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Location
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          placeholder="Enter project location"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="deadline"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Deadline
                      </label>
                      <div className="mt-2">
                        <input
                          type="date"
                          id="deadline"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="block w-full rounded-md border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
                        {loading ? "Creating..." : "Create Project"}
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

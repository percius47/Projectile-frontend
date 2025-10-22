// src/app/test/page.tsx
"use client";

import { useState } from "react";
import ProjectService from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";

export default function TestPage() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { user } = useAuth();

  const testProjectCreation = async () => {
    try {
      const testData = {
        name: "Test Project",
        description: "This is a test project",
        location: "Test Location",
        deadline: "2025-12-31",
      };

      const response = await ProjectService.createProject(testData);
      setResult(JSON.stringify(response, null, 2));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setResult("");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">
        User: {user?.name} ({user?.role})
      </p>

      <button
        onClick={testProjectCreation}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
      >
        Test Project Creation
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-bold">Error:</h2>
          <pre>{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <h2 className="font-bold">Success:</h2>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

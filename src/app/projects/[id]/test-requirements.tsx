// Test component to verify requirements functionality
import { useEffect, useState, useCallback } from "react";
import RequirementService, { Requirement } from "@/services/requirementService";

export default function TestRequirements({ projectId }: { projectId: number }) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRequirements();
  }, [projectId, fetchRequirements]);

  if (loading) return <div>Loading requirements...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Requirements for Project {projectId}</h3>
      <ul>
        {requirements.map((req) => (
          <li key={req.id}>
            {req.item_name} - {req.quantity} {req.unit}
          </li>
        ))}
      </ul>
    </div>
  );
}
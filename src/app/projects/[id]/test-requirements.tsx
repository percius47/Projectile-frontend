// Test component to verify requirements functionality
import { useEffect, useState } from "react";
import RequirementService from "@/services/requirementService";

export default function TestRequirements({ projectId }: { projectId: number }) {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequirements();
  }, [projectId]);

  const fetchRequirements = async () => {
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
  };

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

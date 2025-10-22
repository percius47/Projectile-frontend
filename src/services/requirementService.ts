// src/services/requirementService.ts
import ApiService from "./api";
import AuthService from "./authService";

interface Requirement {
  id: number;
  project_id: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  rate?: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface RequirementResponse {
  message: string;
  requirement: Requirement;
}

interface RequirementsResponse {
  requirements: Requirement[];
}

interface CreateRequirementData {
  project_id: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  rate?: number;
  category?: string;
}

interface UpdateRequirementData {
  item_name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  category?: string;
}

class RequirementService {
  static async addRequirement(
    data: CreateRequirementData
  ): Promise<RequirementResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.post<RequirementResponse>("/requirements", data, token);
  }

  static async getRequirementsByProjectId(
    project_id: number
  ): Promise<RequirementsResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<RequirementsResponse>(
      `/requirements/project/${project_id}`,
      token
    );
  }

  static async getRequirementById(id: number): Promise<RequirementResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<RequirementResponse>(`/requirements/${id}`, token);
  }

  static async updateRequirement(
    id: number,
    data: UpdateRequirementData
  ): Promise<RequirementResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.put<RequirementResponse>(
      `/requirements/${id}`,
      data,
      token
    );
  }

  static async deleteRequirement(id: number): Promise<{ message: string }> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.delete<{ message: string }>(`/requirements/${id}`, token);
  }
}

export default RequirementService;
export type {
  Requirement,
  RequirementResponse,
  RequirementsResponse,
  CreateRequirementData,
  UpdateRequirementData,
};

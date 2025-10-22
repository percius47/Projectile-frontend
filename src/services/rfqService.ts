// src/services/rfqService.ts
import ApiService from "./api";
import AuthService from "./authService";

interface Rfq {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  deadline: string;
  status: "open" | "closed" | "awarded";
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  special_requirements?: string;
  created_at?: string;
  updated_at?: string;
}

interface RfqResponse {
  message: string;
  rfq: Rfq;
}

interface RfqsResponse {
  rfqs: Rfq[];
}

interface CreateRfqData {
  project_id: number;
  title: string;
  description?: string;
  deadline: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  special_requirements?: string;
}

interface UpdateRfqData {
  title?: string;
  description?: string;
  deadline?: string;
  status?: "open" | "closed" | "awarded";
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  special_requirements?: string;
}

class RfqService {
  static async createRfq(data: CreateRfqData): Promise<RfqResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.post<RfqResponse>("/rfqs", data, token);
  }

  static async getRfqById(id: number): Promise<RfqResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<RfqResponse>(`/rfqs/${id}`, token);
  }

  static async getRfqsByProjectId(projectId: number): Promise<RfqsResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<RfqsResponse>(`/rfqs/project/${projectId}`, token);
  }

  static async getAllRfqs(): Promise<RfqsResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<RfqsResponse>("/rfqs", token);
  }

  static async getClosedRfqs(): Promise<RfqsResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<RfqsResponse>("/rfqs/closed", token);
  }

  static async getClosedRfqsByProjectId(
    projectId: number
  ): Promise<RfqsResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<RfqsResponse>(
      `/rfqs/project/${projectId}/closed`,
      token
    );
  }

  static async updateRfq(
    id: number,
    data: UpdateRfqData
  ): Promise<RfqResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.put<RfqResponse>(`/rfqs/${id}`, data, token);
  }

  static async deleteRfq(id: number): Promise<{ message: string }> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.delete<{ message: string }>(`/rfqs/${id}`, token);
  }
}

export default RfqService;
export type { Rfq, RfqResponse, RfqsResponse, CreateRfqData, UpdateRfqData };

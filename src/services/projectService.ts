// src/services/projectService.ts
import ApiService from "./api";
import AuthService from "./authService";

interface Project {
  id: number;
  name: string;
  description?: string;
  location?: string;
  deadline?: string;
  owner_id: number;
  created_at?: string;
  updated_at?: string;
}

interface ProjectResponse {
  message: string;
  project: Project;
}

interface ProjectsResponse {
  projects: Project[];
}

interface CreateProjectData {
  name: string;
  description?: string;
  location?: string;
  deadline?: string;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  location?: string;
  deadline?: string;
}

class ProjectService {
  static async createProject(
    data: CreateProjectData
  ): Promise<ProjectResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.post<ProjectResponse, CreateProjectData>(
      "/projects",
      data,
      token
    );
  }

  static async getProjects(): Promise<ProjectsResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<ProjectsResponse>("/projects", token);
  }

  static async getProjectById(id: number): Promise<ProjectResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<ProjectResponse>(`/projects/${id}`, token);
  }

  static async updateProject(
    id: number,
    data: UpdateProjectData
  ): Promise<ProjectResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.put<ProjectResponse, UpdateProjectData>(
      `/projects/${id}`,
      data,
      token
    );
  }

  static async deleteProject(id: number): Promise<{ message: string }> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.delete<{ message: string }>(`/projects/${id}`, token);
  }
}

export default ProjectService;
export type {
  Project,
  ProjectResponse,
  ProjectsResponse,
  CreateProjectData,
  UpdateProjectData,
};

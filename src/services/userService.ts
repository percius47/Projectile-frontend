// src/services/userService.ts
import ApiService from "./api";
import AuthService from "./authService";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  gst_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserResponse {
  message: string;
  user: User;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  gst_number?: string;
}

class UserService {
  static async getUserById(id: number): Promise<UserResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<UserResponse>(`/users/${id}`, token);
  }

  static async updateUser(
    id: number,
    data: UpdateUserData
  ): Promise<UserResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.put<UserResponse, UpdateUserData>(
      `/users/${id}`,
      data,
      token
    );
  }
}

export default UserService;
export type { User, UserResponse, UpdateUserData };

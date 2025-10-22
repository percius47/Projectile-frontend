// src/services/authService.ts
import ApiService from "./api";

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
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  company_name: string;
  contact_person: string;
  phone?: string;
  address?: string;
  gst_number: string;
}

class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      return await ApiService.post<AuthResponse, RegisterData>(
        "/auth/register",
        data
      );
    } catch (error) {
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      return await ApiService.post<AuthResponse, LoginCredentials>(
        "/auth/login",
        credentials
      );
    } catch (error) {
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  }

  static getCurrentUser(): User | null {
    // Always return null on server-side
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  static getToken(): string | null {
    // Always return null on server-side
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  static loginSuccess(token: string, user: User): void {
    // Only run on client-side
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        // Handle storage errors silently
        console.error("Failed to save user data to localStorage:", error);
      }
    }
  }

  static logout(): void {
    // Only run on client-side
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (error) {
        // Handle storage errors silently
        console.error("Failed to remove user data from localStorage:", error);
      }
    }
  }

  // Validate if the current token is still valid
  static async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      // In a real application, you would have a specific endpoint to validate tokens
      // For now, we'll just return true since we're storing valid tokens
      // A more robust solution would be to have a /auth/validate endpoint
      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      this.logout();
      return false;
    }
  }
}

export default AuthService;
export type { User, AuthResponse, LoginCredentials, RegisterData };

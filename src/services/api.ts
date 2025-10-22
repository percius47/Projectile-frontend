// src/services/api.ts
const LOCAL_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

const NETWORK_API_BASE_URL =
  process.env.NEXT_PUBLIC_NETWORK_API_BASE_URL ||
  "http://192.168.0.101:3001/api";

// Determine which API base URL to use based on the environment
const getApiBaseUrl = () => {
  // On the server side, always use the local API URL
  if (typeof window === "undefined") {
    return LOCAL_API_BASE_URL;
  }

  // On the client side, use the current hostname and port for API calls
  // This allows the app to work both on localhost and network devices
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const apiPort = "3001"; // API port is fixed

  return `${protocol}//${hostname}:${apiPort}/api`;
};

const API_BASE_URL = getApiBaseUrl();

interface ApiError {
  message: string;
}

class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        // Clear local storage and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // Redirect to login page
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData: ApiError = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Provide more specific error messages for network issues
        if (
          error.message.includes("fetch") ||
          error.message.includes("Failed to connect")
        ) {
          throw new Error(
            "Failed to connect to the server. Please check your network connection and ensure the backend server is running."
          );
        }
        throw new Error(`API Error: ${error.message}`);
      }
      throw new Error("An unknown error occurred");
    }
  }

  static async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, { headers });
  }

  static async post<T>(
    endpoint: string,
    data: any,
    token?: string
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
  }

  static async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
  }

  static async delete<T>(endpoint: string, token?: string): Promise<T> {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}

export default ApiService;

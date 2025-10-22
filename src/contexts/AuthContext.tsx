// src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AuthService, { User } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
    companyName: string,
    phone: string | undefined,
    contactPerson: string,
    address: string | undefined,
    gstNumber: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in and validate token
    const initializeAuth = async () => {
      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();

      if (currentUser && token) {
        // Validate token
        const isValid = await AuthService.validateToken();
        if (isValid) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // If token is invalid, logout the user
          AuthService.logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password });
      AuthService.loginSuccess(response.token, response.user);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    companyName: string,
    phone: string | undefined,
    contactPerson: string,
    address: string | undefined,
    gstNumber: string
  ) => {
    try {
      const response = await AuthService.register({
        name,
        email,
        password,
        role,
        company_name: companyName,
        phone,
        contact_person: contactPerson,
        address,
        gst_number: gstNumber,
      });
      AuthService.loginSuccess(response.token, response.user);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Re-throw the error to be handled by the calling function
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated: isAuthenticated && !isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

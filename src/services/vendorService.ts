// src/services/vendorService.ts
import ApiService from "./api";
import AuthService from "./authService";

interface Vendor {
  id: number;
  user_id: number;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface VendorResponse {
  message: string;
  vendor: Vendor;
}

interface VendorsResponse {
  vendors: Vendor[];
}

interface CreateVendorData {
  user_id: number;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
}

interface UpdateVendorData {
  company_name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_number?: string;
}

class VendorService {
  static async createVendor(data: CreateVendorData): Promise<VendorResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.post<VendorResponse, CreateVendorData>(
      "/vendors",
      data,
      token
    );
  }

  static async getVendorById(id: number): Promise<VendorResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<VendorResponse>(`/vendors/${id}`, token);
  }

  static async getVendorByUserId(userId: number): Promise<VendorResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<VendorResponse>(`/vendors/user/${userId}`, token);
  }

  static async getAllVendors(): Promise<VendorsResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<VendorsResponse>("/vendors", token);
  }

  static async updateVendor(
    id: number,
    data: UpdateVendorData
  ): Promise<VendorResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.put<VendorResponse, UpdateVendorData>(
      `/vendors/${id}`,
      data,
      token
    );
  }

  static async deleteVendor(id: number): Promise<{ message: string }> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.delete<{ message: string }>(`/vendors/${id}`, token);
  }
}

export default VendorService;
export type {
  Vendor,
  VendorResponse,
  VendorsResponse,
  CreateVendorData,
  UpdateVendorData,
};

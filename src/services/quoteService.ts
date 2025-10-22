// src/services/quoteService.ts
import ApiService from "./api";
import AuthService from "./authService";

interface Quote {
  id: number;
  custom_id?: string;
  rfq_custom_id?: string;
  vendor_custom_id?: string;
  rfq_id: number;
  vendor_id: number;
  status: "draft" | "submitted" | "revised" | "accepted" | "rejected";
  total_amount: number;
  project_details?: {
    id: number;
    custom_id: string;
    name: string;
    description: string;
    owner_id?: number;
  };
  rfq_details?: {
    id: number;
    custom_id: string;
    title: string;
    description: string;
  };
  vendor_details?: {
    id: number;
    name: string;
    company_name: string;
    email: string;
    contact_person?: string;
    phone?: string;
    address?: string;
    gst_number?: string;
  };
  created_at?: string;
  updated_at?: string;
}

interface QuoteResponse {
  message: string;
  quote: Quote;
}

interface QuotesResponse {
  quotes: Quote[];
}

interface CreateQuoteData {
  rfq_id: number;
  vendor_id: number;
  total_amount: number;
}

interface UpdateQuoteData {
  status?: "draft" | "submitted" | "revised" | "accepted" | "rejected";
  total_amount?: number;
}

class QuoteService {
  static async createQuote(data: CreateQuoteData): Promise<QuoteResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.post<QuoteResponse>("/quotes", data, token);
  }

  static async getQuoteById(id: number): Promise<QuoteResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<QuoteResponse>(`/quotes/${id}`, token);
  }

  static async getQuotesByRfqId(rfqId: number): Promise<QuotesResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<QuotesResponse>(`/quotes/rfq/${rfqId}`, token);
  }

  static async getQuotesByVendorId(vendorId: number): Promise<QuotesResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<QuotesResponse>(`/quotes/vendor/${vendorId}`, token);
  }

  static async getAllQuotes(): Promise<QuotesResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<QuotesResponse>("/quotes", token);
  }

  static async updateQuote(
    id: number,
    data: UpdateQuoteData
  ): Promise<QuoteResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.put<QuoteResponse>(`/quotes/${id}`, data, token);
  }

  static async deleteQuote(id: number): Promise<{ message: string }> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.delete<{ message: string }>(`/quotes/${id}`, token);
  }
}

export default QuoteService;
export type {
  Quote,
  QuoteResponse,
  QuotesResponse,
  CreateQuoteData,
  UpdateQuoteData,
};

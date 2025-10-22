// src/services/documentService.ts
import ApiService from "./api";
import AuthService from "./authService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

interface Document {
  id: number;
  entity_type: string;
  entity_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at?: string;
  updated_at?: string;
}

interface DocumentResponse {
  message: string;
  document: Document;
}

interface DocumentsResponse {
  message: string;
  documents: Document[];
}

class DocumentService {
  static async uploadDocument(
    entity_type: string,
    entity_id: number,
    file: File
  ): Promise<DocumentResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity_type", entity_type);
    formData.append("entity_id", entity_id.toString());

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload document");
    }

    return response.json();
  }

  static async getDocumentsByEntity(
    entity_type: string,
    entity_id: number
  ): Promise<DocumentsResponse> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.get<DocumentsResponse>(
      `/documents/${entity_type}/${entity_id}`,
      token
    );
  }

  static async deleteDocument(id: number): Promise<{ message: string }> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");
    return ApiService.delete<{ message: string }>(`/documents/${id}`, token);
  }

  static async downloadDocument(id: number): Promise<Blob> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${API_BASE_URL}/documents/download/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = "Failed to download document";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If we can't parse JSON, use status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.blob();
  }
}

export default DocumentService;
export type { Document, DocumentResponse, DocumentsResponse };

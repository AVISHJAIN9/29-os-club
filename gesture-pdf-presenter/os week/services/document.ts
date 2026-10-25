import { authService } from './auth';

/// <reference types="vite/client" />

const API_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:4001';

export interface PDFDocument {
  id: string;
  name: string;
  filename: string;
  file_path: string;
  userId: string | number;
  uploadedAt: string;
  pages: number;
}

class DocumentService {
  async uploadPDF(file: File): Promise<PDFDocument> {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${API_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async downloadPDF(documentId: string): Promise<Blob> {
    const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }

  async getPDF(documentId: string): Promise<PDFDocument> {
    const response = await fetch(`${API_URL}/api/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    return response.json();
  }
}

export const documentService = new DocumentService();
export default documentService;

// PDF Utilities
export interface PDFDocument {
  id: string;
  name: string;
  file: File;
  pages: number;
  url: string;
  uploadedAt: Date;
  userId?: string;
}

export interface Annotation {
  id: string;
  slideIndex: number;
  drawing: ImageData;
  timestamp: Date;
  author?: string;
}

export interface PresentationSession {
  id: string;
  documentId: string;
  userId: string;
  annotations: Annotation[];
  currentSlide: number;
  startedAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareToken?: string;
}

export const uploadPDF = async (file: File): Promise<PDFDocument> => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    file,
    pages: 0, // Will be set after PDF loads
    url: URL.createObjectURL(file),
    uploadedAt: new Date(),
  };
};

const BACKEND_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:4001';

export const savePresentationSession = async (
  session: PresentationSession,
  backendUrl: string = BACKEND_URL
): Promise<PresentationSession> => {
  const response = await fetch(`${backendUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
  if (!response.ok) throw new Error('Failed to save session');
  return response.json();
};

export const loadPresentationSession = async (
  sessionId: string,
  backendUrl: string = BACKEND_URL
): Promise<PresentationSession> => {
  const response = await fetch(`${backendUrl}/api/sessions/${sessionId}`);
  if (!response.ok) throw new Error('Failed to load session');
  return response.json();
};

export const exportAnnotatedPDF = async (
  pdfUrl: string,
  annotations: Annotation[]
): Promise<Blob> => {
  // Placeholder - requires PDF lib integration
  const blob = await fetch(pdfUrl).then(r => r.blob());
  return blob;
};

export const generateShareToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

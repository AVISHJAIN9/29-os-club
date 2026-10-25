import { authService } from './auth';
import { Annotation, PresentationSession } from '@/utils/pdf-utils';

/// <reference types="vite/client" />

const API_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:4001';

class SessionService {
  async createSession(documentId: string, isPublic: boolean = false): Promise<PresentationSession> {
    const response = await fetch(`${API_URL}/api/sessions`, {
      method: 'POST',
      headers: authService.getAuthHeader(),
      body: JSON.stringify({ documentId, isPublic }),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  }

  async getSession(sessionId: string): Promise<PresentationSession> {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      headers: authService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }

    return response.json();
  }

  async updateSession(
    sessionId: string,
    annotations: Annotation[],
    currentSlide: number
  ): Promise<PresentationSession> {
    const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: authService.getAuthHeader(),
      body: JSON.stringify({ annotations, currentSlide }),
    });

    if (!response.ok) {
      throw new Error('Failed to update session');
    }

    return response.json();
  }

  async getUserSessions(): Promise<PresentationSession[]> {
    const response = await fetch(`${API_URL}/api/sessions/user/list`, {
      headers: authService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    return response.json();
  }

  async getPublicSession(shareToken: string): Promise<PresentationSession> {
    const response = await fetch(`${API_URL}/api/sessions/share/${shareToken}`);

    if (!response.ok) {
      throw new Error('Failed to fetch shared session');
    }

    return response.json();
  }
}

export const sessionService = new SessionService();
export default sessionService;

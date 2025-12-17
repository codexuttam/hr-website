import { ResumeData, ResumeColor } from '@/types/resume';

export interface SavedResume {
  resume_id: number;
  resume_name: string;
  template_id: number;
  resume_data: ResumeData;
  color_scheme: ResumeColor;
  created_at: string;
  updated_at: string;
  user_id?: number;
}

export interface SaveResumeRequest {
  resumeData: ResumeData;
  templateId: number;
  colorScheme: ResumeColor;
  userId?: string;
  title?: string;
}

export interface UpdateResumeRequest {
  resumeId: number;
  resumeData: ResumeData;
  templateId: number;
  colorScheme?: ResumeColor;
  title?: string;
}

export interface ListResumesResponse {
  success: boolean;
  resumes: SavedResume[];
  total: number;
  limit: number;
  offset: number;
}

export class ResumeService {
  private static baseUrl = '/api/resumes';

  static async saveResume(request: SaveResumeRequest): Promise<SavedResume> {
    try {
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save resume API error:', errorData?.error || errorData?.details || errorData || 'Unknown error');
        const errorMessage = errorData?.details || errorData?.error || errorData?.message || `Failed to save resume (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.resume;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    }
  }

  static async updateResume(request: UpdateResumeRequest): Promise<SavedResume> {
    try {
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Update resume API error:', errorData?.error || errorData?.details || errorData || 'Unknown error');
        const errorMessage = errorData?.details || errorData?.error || errorData?.message || `Failed to update resume (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.resume;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  static async getResume(id: number): Promise<SavedResume> {
    try {
      console.log('Fetching resume with ID:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Get resume API error:', errorData);
        throw new Error(errorData.details || errorData.error || `Failed to fetch resume (${response.status})`);
      }

      const data = await response.json();
      console.log('Resume fetched successfully:', data);
      return data.resume;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  }

  static async listResumes(
    userId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ListResumesResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`${this.baseUrl}/list?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('List resumes API error:', errorData?.error || errorData?.details || errorData || 'Unknown error');
        const errorMessage = errorData?.details || errorData?.error || errorData?.message || `Failed to fetch resumes (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  }

  static async deleteResume(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Delete resume API error:', errorData?.error || errorData?.details || errorData || 'Unknown error');
        const errorMessage = errorData?.details || errorData?.error || errorData?.message || `Failed to delete resume (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  static async autoSave(
    resumeData: ResumeData,
    templateId: number,
    colorScheme: ResumeColor,
    userId?: string,
    existingResumeId?: number
  ): Promise<SavedResume> {
    const title = resumeData.contact?.name 
      ? `${resumeData.contact.name}'s Resume` 
      : 'Auto-saved Resume';

    if (existingResumeId) {
      return this.updateResume({
        resumeId: existingResumeId,
        resumeData,
        templateId,
        colorScheme,
        title,
      });
    } else {
      return this.saveResume({
        resumeData,
        templateId,
        colorScheme,
        userId,
        title,
      });
    }
  }
}

// Auto-save hook for React components
export const useAutoSave = (
  resumeData: ResumeData,
  templateId: number,
  colorScheme: ResumeColor,
  userId?: string,
  interval: number = 30000 // 30 seconds
) => {
  const [lastSavedId, setLastSavedId] = React.useState<number | undefined>();
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (!resumeData.contact?.name) return; // Don't save empty resumes

      try {
        setIsSaving(true);
        const savedResume = await ResumeService.autoSave(
          resumeData,
          templateId,
          colorScheme,
          userId,
          lastSavedId
        );
        setLastSavedId(savedResume.resume_id);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, interval);

    return () => clearInterval(autoSaveInterval);
  }, [resumeData, templateId, colorScheme, userId, lastSavedId, interval]);

  return { isSaving, lastSaved, lastSavedId };
};

// Import React for the hook
import React from 'react';
export interface ATSResult {
  ats_id: number;
  resume_id: number;
  job_description: string;
  matching_keywords: string[];
  missing_keywords: string[];
  overall_score: number;
  suggestions: string;
  analysis_data: any;
  created_at: string;
  updated_at: string;
  resumes?: {
    resume_id: number;
    resume_name: string;
    user_id: number;
    resume_data?: any;
  };
}

export interface SaveATSResultRequest {
  resumeId: number | null;
  jobDescription: string;
  matchingKeywords: string[];
  missingKeywords: string[];
  overallScore: number;
  suggestions: string;
  analysisData?: any;
  userId?: number;
}

export interface UpdateATSResultRequest {
  atsId: number;
  jobDescription?: string;
  matchingKeywords?: string[];
  missingKeywords?: string[];
  overallScore?: number;
  suggestions?: string;
  analysisData?: any;
}

export interface ListATSResultsResponse {
  success: boolean;
  atsResults: ATSResult[];
  total: number;
  limit: number;
  offset: number;
}

export class ATSResultService {
  private static baseUrl = '/api/ats-results';

  static async saveATSResult(request: SaveATSResultRequest): Promise<ATSResult> {
    try {
      console.log('Saving ATS result:', request);
      
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save ATS result API error:', errorData);
        throw new Error(errorData.details || errorData.error || `Failed to save ATS result (${response.status})`);
      }

      const data = await response.json();
      console.log('ATS result saved successfully:', data);
      return data.atsResult;
    } catch (error) {
      console.error('Error saving ATS result:', error);
      throw error;
    }
  }

  static async updateATSResult(request: UpdateATSResultRequest): Promise<ATSResult> {
    try {
      console.log('Updating ATS result:', request.atsId);
      
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Update ATS result API error:', errorData);
        throw new Error(errorData.details || errorData.error || `Failed to update ATS result (${response.status})`);
      }

      const data = await response.json();
      console.log('ATS result updated successfully:', data);
      return data.atsResult;
    } catch (error) {
      console.error('Error updating ATS result:', error);
      throw error;
    }
  }

  static async getATSResult(id: number): Promise<ATSResult> {
    try {
      console.log('Fetching ATS result with ID:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Get ATS result API error:', errorData);
        throw new Error(errorData.details || errorData.error || `Failed to fetch ATS result (${response.status})`);
      }

      const data = await response.json();
      console.log('ATS result fetched successfully:', data);
      return data.atsResult;
    } catch (error) {
      console.error('Error fetching ATS result:', error);
      throw error;
    }
  }

  static async listATSResults(
    resumeId?: number,
    userId?: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ListATSResultsResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (resumeId) {
        params.append('resumeId', resumeId.toString());
      }

      if (userId) {
        params.append('userId', userId.toString());
      }

      const response = await fetch(`${this.baseUrl}/list?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('List ATS results API error:', errorData);
        throw new Error(errorData.details || errorData.error || `Failed to fetch ATS results (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ATS results:', error);
      throw error;
    }
  }

  static async deleteATSResult(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Delete ATS result API error:', errorData);
        throw new Error(errorData.details || errorData.error || `Failed to delete ATS result (${response.status})`);
      }
    } catch (error) {
      console.error('Error deleting ATS result:', error);
      throw error;
    }
  }

  static async saveAnalysisResult(
    resumeId: number,
    analysisResult: any,
    jobDescription: string,
    userId?: number
  ): Promise<ATSResult> {
    const request: SaveATSResultRequest = {
      resumeId,
      jobDescription,
      matchingKeywords: analysisResult.matching_keywords || [],
      missingKeywords: analysisResult.missing_keywords || [],
      overallScore: analysisResult.overall_score || 0,
      suggestions: analysisResult.suggestions || '',
      analysisData: analysisResult.analysis_data || {},
      userId,
    };

    return this.saveATSResult(request);
  }
}

// Utility functions
export const calculateATSScore = (matchingKeywords: string[], missingKeywords: string[]): number => {
  const totalKeywords = matchingKeywords.length + missingKeywords.length;
  if (totalKeywords === 0) return 0;
  
  return Math.round((matchingKeywords.length / totalKeywords) * 100);
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getScoreBadgeColor = (score: number): string => {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};
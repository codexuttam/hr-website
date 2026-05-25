import { API_ENDPOINTS } from '../config/api';
import { ResumeData } from '../types/resume';

// Enhanced interfaces with more detailed typing
export interface Suggestion {
  id: string;
  section: 'summary' | 'experience' | 'education' | 'skills' | 'contact' | 'objective' | 'certifications' | 'languages';
  type: 'keyword' | 'formatting' | 'content' | 'structure' | 'grammar' | 'impact';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentText: string;
  suggestedText: string;
  reasoning: string;
  confidence: number; // 0-100 confidence score
  category?: 'ats-optimization' | 'readability' | 'impact' | 'completeness';
}

export interface KeywordRecommendation {
  keyword: string;
  section: string;
  importance: 'high' | 'medium' | 'low';
  context: string;
  frequency?: number;
  alternatives?: string[];
  industryRelevance: number; // 0-100 score
}

export interface FormattingTip {
  tip: string;
  section: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  category: 'structure' | 'style' | 'length' | 'clarity';
  example?: string;
}

export interface ATSCompatibilityScore {
  overall: number; // 0-100
  breakdown: {
    keywords: number;
    formatting: number;
    structure: number;
    completeness: number;
  };
  recommendations: string[];
}

export interface AISuggestionsResponse {
  success: boolean;
  data: {
    overallScore: number;
    atsCompatibility: ATSCompatibilityScore;
    suggestions: Suggestion[];
    keywordRecommendations: KeywordRecommendation[];
    formattingTips: FormattingTip[];
    industryInsights?: {
      targetIndustry: string;
      commonSkills: string[];
      trendingKeywords: string[];
      salaryRange?: string;
    };
  };
  metadata: {
    timestamp: string;
    processingTime: number;
    version: string;
    targetJob?: string;
    targetIndustry?: string;
  };
  error?: string;
}

export interface SuggestionFilters {
  sections?: string[];
  types?: string[];
  priorities?: string[];
  minConfidence?: number;
}

export interface BulkSuggestionRequest {
  resumes: ResumeData[];
  targetJob?: string;
  targetIndustry?: string;
  options?: {
    includeComparison: boolean;
    generateReport: boolean;
  };
}

// Main API functions
export const generateAISuggestions = async (
  resumeData: ResumeData,
  targetJob?: string,
  targetIndustry?: string,
  options?: {
    includeATSAnalysis?: boolean;
    includeIndustryInsights?: boolean;
    filters?: SuggestionFilters;
  }
): Promise<AISuggestionsResponse> => {
  try {
    const requestBody = {
      resumeData,
      targetJob,
      targetIndustry,
      options: {
        includeATSAnalysis: true,
        includeIndustryInsights: true,
        ...options,
      },
    };

    const response = await fetch(API_ENDPOINTS.AI_SUGGESTIONS.GENERATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    throw error;
  }
};

export const applySuggestion = async (
  suggestionId: string,
  resumeData: ResumeData
): Promise<{ success: boolean; updatedResume: ResumeData; message: string }> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.AI_SUGGESTIONS.GENERATE}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        suggestionId,
        resumeData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to apply suggestion: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error applying suggestion:', error);
    throw error;
  }
};

export const getSuggestionHistory = async (
  resumeId: string,
  limit: number = 50
): Promise<{
  success: boolean;
  history: Array<{
    id: string;
    timestamp: string;
    suggestions: Suggestion[];
    applied: string[];
    targetJob?: string;
    targetIndustry?: string;
  }>;
}> => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.AI_SUGGESTIONS.GENERATE}/history?resumeId=${resumeId}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch suggestion history: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching suggestion history:', error);
    throw error;
  }
};

export const generateBulkSuggestions = async (
  request: BulkSuggestionRequest
): Promise<{
  success: boolean;
  results: Array<{
    resumeIndex: number;
    suggestions: AISuggestionsResponse;
    comparison?: {
      rank: number;
      strengths: string[];
      improvements: string[];
    };
  }>;
  report?: {
    summary: string;
    commonIssues: string[];
    bestPractices: string[];
  };
}> => {
  try {
    const response = await fetch(`${API_ENDPOINTS.AI_SUGGESTIONS.GENERATE}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Bulk suggestions failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error generating bulk suggestions:', error);
    throw error;
  }
};

export const checkAIServiceHealth = async (): Promise<{
  status: string;
  message: string;
  details: {
    uptime: number;
    version: string;
    features: string[];
    limits: {
      requestsPerMinute: number;
      maxResumeSize: number;
    };
  };
}> => {
  try {
    const response = await fetch(API_ENDPOINTS.AI_SUGGESTIONS.HEALTH, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('AI service health check failed:', error);
    throw error;
  }
};

// Utility functions
export const filterSuggestions = (
  suggestions: Suggestion[],
  filters: SuggestionFilters
): Suggestion[] => {
  return suggestions.filter(suggestion => {
    if (filters.sections && !filters.sections.includes(suggestion.section)) {
      return false;
    }
    if (filters.types && !filters.types.includes(suggestion.type)) {
      return false;
    }
    if (filters.priorities && !filters.priorities.includes(suggestion.priority)) {
      return false;
    }
    if (filters.minConfidence && suggestion.confidence < filters.minConfidence) {
      return false;
    }
    return true;
  });
};

export const groupSuggestionsBySection = (suggestions: Suggestion[]): Record<string, Suggestion[]> => {
  return suggestions.reduce((groups, suggestion) => {
    const section = suggestion.section;
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(suggestion);
    return groups;
  }, {} as Record<string, Suggestion[]>);
};

export const calculateImpactScore = (suggestions: Suggestion[]): number => {
  if (suggestions.length === 0) return 0;
  
  const weightedScore = suggestions.reduce((total, suggestion) => {
    const priorityWeight = suggestion.priority === 'high' ? 3 : suggestion.priority === 'medium' ? 2 : 1;
    const confidenceWeight = suggestion.confidence / 100;
    return total + (priorityWeight * confidenceWeight);
  }, 0);
  
  const maxPossibleScore = suggestions.length * 3; // All high priority with 100% confidence
  return Math.round((weightedScore / maxPossibleScore) * 100);
};

// Error handling utilities
export class AISuggestionsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AISuggestionsError';
  }
}

export const handleAPIError = (error: any): AISuggestionsError => {
  if (error instanceof AISuggestionsError) {
    return error;
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new AISuggestionsError(
      'Network error: Unable to connect to AI suggestions service',
      'NETWORK_ERROR',
      0,
      { originalError: error.message }
    );
  }
  
  return new AISuggestionsError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    undefined,
    { originalError: error }
  );
};
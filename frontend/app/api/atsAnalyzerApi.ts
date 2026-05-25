import { API_ENDPOINTS } from '../config/api';

export interface AnalysisParams {
  resumeText: string;
  jobDescription?: string;
  withJobDescription?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface RephraseParams {
  text: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CoverLetterParams {
  resumeText: string;
  jobDescription: string;
  temperature?: number;
  maxTokens?: number;
}

export interface InterviewQuestionsParams {
  jobDescription: string;
  temperature?: number;
  maxTokens?: number;
}

// Upload and process resume file
export const uploadResume = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(API_ENDPOINTS.ATS_ANALYZER.PROCESS_RESUME, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to process resume');
    }

    return data.resumeText;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

// Analyze resume against job description
export const analyzeResume = async (
  resumeText: string,
  jobDescription: string = '',
  withJobDescription: boolean = true,
  temperature: number = 0.5,
  maxTokens: number = 1024
): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINTS.ATS_ANALYZER.ANALYZE_RESUME, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
        withJobDescription,
        temperature,
        maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to analyze resume');
    }

    return data.analysis;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

// Rephrase text content
export const rephraseText = async (
  text: string,
  temperature: number = 0.5,
  maxTokens: number = 1024
): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINTS.ATS_ANALYZER.REPHRASE_TEXT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        temperature,
        maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to rephrase text');
    }

    return data.rephrasedText;
  } catch (error) {
    console.error('Error rephrasing text:', error);
    throw error;
  }
};

// Generate cover letter
export const generateCoverLetter = async (
  resumeText: string,
  jobDescription: string,
  temperature: number = 0.5,
  maxTokens: number = 1024
): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINTS.ATS_ANALYZER.GENERATE_COVER_LETTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
        temperature,
        maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate cover letter');
    }

    return data.coverLetter;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

// Generate interview questions
export const generateInterviewQuestions = async (
  jobDescription: string,
  temperature: number = 0.5,
  maxTokens: number = 1024
): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINTS.ATS_ANALYZER.GENERATE_INTERVIEW_QUESTIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobDescription,
        temperature,
        maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate interview questions');
    }

    return data.interviewQuestions;
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw error;
  }
};

// Check API health
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.ATS_ANALYZER.HEALTH);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('Error checking API health:', error);
    return false;
  }
};
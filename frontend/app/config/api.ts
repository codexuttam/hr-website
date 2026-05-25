// API Configuration
const isDevelopment = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  : process.env.NODE_ENV === 'development';
  
const VERCEL_API_URL = 'https://ai-edu-platform-backend.vercel.app';
const LOCAL_API_URL = 'http://localhost:5000';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (isDevelopment ? LOCAL_API_URL : VERCEL_API_URL);

// Full API endpoints
export const API_ENDPOINTS = {
  // Resume Builder
  RESUME_BUILDER: {
    GENERATE_PDF: `${API_BASE_URL}/api/resume-builder/generate-pdf`,
    HEALTH: `${API_BASE_URL}/api/resume-builder/health`,
  },
  
  // ATS Analyzer
  ATS_ANALYZER: {
    PROCESS_RESUME: `${API_BASE_URL}/api/ats-analyzer/process-resume`,
    ANALYZE_RESUME: `${API_BASE_URL}/api/ats-analyzer/analyze-resume`,
    ANALYZE_AND_SAVE: `${API_BASE_URL}/api/ats-analyzer/analyze-and-save`,
    GENERATE_COVER_LETTER: `${API_BASE_URL}/api/ats-analyzer/generate-cover-letter`,
    GENERATE_INTERVIEW_QUESTIONS: `${API_BASE_URL}/api/ats-analyzer/generate-interview-questions`,
    REPHRASE_TEXT: `${API_BASE_URL}/api/ats-analyzer/rephrase-text`,
    RESULTS: `${API_BASE_URL}/api/ats-analyzer/results`,
    HEALTH: `${API_BASE_URL}/api/ats-analyzer/health`,
  },

  // AI Suggestions
  AI_SUGGESTIONS: {
    GENERATE: `${API_BASE_URL}/api/ai-suggestions/generate-suggestions`,
    HEALTH: `${API_BASE_URL}/api/ai-suggestions/health`,
  },

  // Database
  DATABASE: {
    HEALTH: `${API_BASE_URL}/api/database/health`,
    USERS: `${API_BASE_URL}/api/database/users`,
    RESUMES: `${API_BASE_URL}/api/database/resumes`,
    ATS_RESULTS: `${API_BASE_URL}/api/database/ats-results`,
    TEST_DATA: `${API_BASE_URL}/api/database/test-data`,
  }
};

export default API_BASE_URL;
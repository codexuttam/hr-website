import { API_ENDPOINTS } from '../config/api';

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'mentor' | 'admin';
  created_at: string;
}

export interface Resume {
  resume_id: number;
  user_id: number;
  resume_name: string;
  resume_file_path?: string;
  resume_data?: any;
  ats_score: number;
  last_updated: string;
  created_at: string;
}

export interface ATSResult {
  ats_id: number;
  resume_id: number;
  job_description?: string;
  matching_keywords: string[];
  missing_keywords: string[];
  overall_score: number;
  suggestions?: string;
  analysis_data?: any;
  created_at: string;
}

export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Database health check
export const checkDatabaseHealth = async (): Promise<DatabaseResponse<{ status: string; message: string }>> => {
  const response = await fetch(API_ENDPOINTS.DATABASE.HEALTH);
  return response.json();
};

// User operations
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<DatabaseResponse<User>> => {
  // Password strength validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(userData.password)) {
    return {
      success: false,
      error: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
    };
  }

  const response = await fetch(API_ENDPOINTS.DATABASE.USERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const getUserById = async (userId: number): Promise<DatabaseResponse<User>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.USERS}/${userId}`);
  return response.json();
};

export const updateUser = async (userId: number, updateData: Partial<User>): Promise<DatabaseResponse<User>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.USERS}/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  return response.json();
};

export const getUserStats = async (userId: number): Promise<DatabaseResponse<any>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.USERS}/${userId}/stats`);
  return response.json();
};

// Resume operations
export const createResume = async (resumeData: {
  user_id: number;
  resume_name: string;
  resume_data?: any;
  ats_score?: number;
}): Promise<DatabaseResponse<Resume>> => {
  const response = await fetch(API_ENDPOINTS.DATABASE.RESUMES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resumeData),
  });
  return response.json();
};

export const getUserResumes = async (userId: number): Promise<DatabaseResponse<Resume[]>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.USERS}/${userId}/resumes`);
  return response.json();
};

export const getResumeById = async (resumeId: number): Promise<DatabaseResponse<Resume>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.RESUMES}/${resumeId}`);
  return response.json();
};

export const updateResume = async (resumeId: number, updateData: Partial<Resume>): Promise<DatabaseResponse<Resume>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.RESUMES}/${resumeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  return response.json();
};

export const deleteResume = async (resumeId: number): Promise<DatabaseResponse<{ message: string }>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.RESUMES}/${resumeId}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const getResumeStats = async (userId: number): Promise<DatabaseResponse<any>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.USERS}/${userId}/resumes/stats`);
  return response.json();
};

// ATS operations
export const createATSResult = async (atsData: {
  resume_id: number;
  job_description?: string;
  matching_keywords?: string[];
  missing_keywords?: string[];
  overall_score: number;
  suggestions?: string;
  analysis_data?: any;
}): Promise<DatabaseResponse<ATSResult>> => {
  const response = await fetch(API_ENDPOINTS.DATABASE.ATS_RESULTS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(atsData),
  });
  return response.json();
};

export const getATSResultsByResumeId = async (resumeId: number): Promise<DatabaseResponse<ATSResult[]>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.RESUMES}/${resumeId}/ats-results`);
  return response.json();
};

export const getLatestATSResult = async (resumeId: number): Promise<DatabaseResponse<ATSResult>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.RESUMES}/${resumeId}/ats-results/latest`);
  return response.json();
};

export const getATSStats = async (userId: number): Promise<DatabaseResponse<any>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.USERS}/${userId}/ats-results/stats`);
  return response.json();
};

export const getKeywordAnalysis = async (userId: number): Promise<DatabaseResponse<any>> => {
  const response = await fetch(`${API_ENDPOINTS.DATABASE.USERS}/${userId}/ats-results/keywords`);
  return response.json();
};

// Test data creation
export const createTestData = async (): Promise<DatabaseResponse<any>> => {
  const response = await fetch(API_ENDPOINTS.DATABASE.TEST_DATA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};
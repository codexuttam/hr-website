import { useState } from 'react';
import { 
  analyzeResume, 
  generateCoverLetter, 
  prepareInterview, 
  rephraseContent 
} from '../api/api';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useResumeApi = () => {
  const [state, setState] = useState<{
    analyzeResult: ApiResponse<any>;
    coverLetter: ApiResponse<string>;
    interviewPrep: ApiResponse<any>;
    rephraseResult: ApiResponse<string>;
  }>({
    analyzeResult: { data: null, loading: false, error: null },
    coverLetter: { data: null, loading: false, error: null },
    interviewPrep: { data: null, loading: false, error: null },
    rephraseResult: { data: null, loading: false, error: null },
  });

  const analyzeResumeText = async (resumeText: string) => {
    setState(prev => ({
      ...prev,
      analyzeResult: { ...prev.analyzeResult, loading: true, error: null }
    }));
    
    try {
      const data = await analyzeResume(resumeText);
      setState(prev => ({
        ...prev,
        analyzeResult: { data, loading: false, error: null }
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze resume';
      setState(prev => ({
        ...prev,
        analyzeResult: { data: null, loading: false, error: errorMessage }
      }));
      throw error;
    }
  };

  const generateCoverLetterText = async (jobDescription: string, resumeData: any) => {
    setState(prev => ({
      ...prev,
      coverLetter: { ...prev.coverLetter, loading: true, error: null }
    }));
    
    try {
      const data = await generateCoverLetter(jobDescription, resumeData);
      setState(prev => ({
        ...prev,
        coverLetter: { data: data.content, loading: false, error: null }
      }));
      return data.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate cover letter';
      setState(prev => ({
        ...prev,
        coverLetter: { data: null, loading: false, error: errorMessage }
      }));
      throw error;
    }
  };

  const prepareInterviewQuestions = async (jobDescription: string, resumeData: any) => {
    setState(prev => ({
      ...prev,
      interviewPrep: { ...prev.interviewPrep, loading: true, error: null }
    }));
    
    try {
      const data = await prepareInterview(jobDescription, resumeData);
      setState(prev => ({
        ...prev,
        interviewPrep: { data, loading: false, error: null }
      }));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to prepare interview questions';
      setState(prev => ({
        ...prev,
        interviewPrep: { data: null, loading: false, error: errorMessage }
      }));
      throw error;
    }
  };

  const rephraseContentText = async (content: string, tone: string) => {
    setState(prev => ({
      ...prev,
      rephraseResult: { ...prev.rephraseResult, loading: true, error: null }
    }));
    
    try {
      const data = await rephraseContent(content, tone);
      setState(prev => ({
        ...prev,
        rephraseResult: { data: data.content, loading: false, error: null }
      }));
      return data.content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rephrase content';
      setState(prev => ({
        ...prev,
        rephraseResult: { data: null, loading: false, error: errorMessage }
      }));
      throw error;
    }
  };

  return {
    // State
    analyzeResult: state.analyzeResult,
    coverLetter: state.coverLetter,
    interviewPrep: state.interviewPrep,
    rephraseResult: state.rephraseResult,
    
    // Methods
    analyzeResume: analyzeResumeText,
    generateCoverLetter: generateCoverLetterText,
    prepareInterview: prepareInterviewQuestions,
    rephraseContent: rephraseContentText,
  };
};

export default useResumeApi;

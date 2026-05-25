'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ResumeTone = 'Professional' | 'Technical' | 'Creative';
export type ResumeTemplate = 'classic' | 'modern' | 'minimal' | 'creative' | 'executive' | 'tech' | 'academic' | 'designer' | 'startup' | 'corporate';

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  resumeTone: ResumeTone;
  template: ResumeTemplate;
}

interface ResumeContextType {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

interface ResumeProviderProps {
  children: ReactNode;
}

const initialResumeData: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  summary: '',
  experience: '',
  education: '',
  skills: '',
  resumeTone: 'Professional',
  template: 'classic',
};

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  const value: ResumeContextType = {
    resumeData,
    setResumeData,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};
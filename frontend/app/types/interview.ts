export interface Interview {
  id: string;
  role: string;
  type: string;
  level: string;
  techstack: string[];
  questions: string[];
  userId: string;
  finalized: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Feedback {
  id: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    feedback: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  recommendations: string[];
  createdAt: string;
}

export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: Array<{
    role: "user" | "system" | "assistant";
    content: string;
  }>;
  feedbackId?: string;
}

export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

export interface InterviewCardProps {
  interviewId: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

export interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'general' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  role: string;
  sampleAnswer?: string;
  tips?: string[];
}

export interface InterviewSession {
  id: string;
  role: string;
  level: string;
  type: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  responses: Array<{
    questionId: string;
    response: string;
    timestamp: string;
  }>;
  status: 'preparing' | 'active' | 'completed';
}

export interface MockInterviewProps {
  role?: string;
  level?: string;
  duration?: number; // in minutes
}

export interface InterviewState {
  status: 'setup' | 'ready' | 'active' | 'paused' | 'completed';
  currentQuestionIndex: number;
  timeRemaining: number;
  responses: Array<{
    question: string;
    response: string;
    duration: number;
  }>;
}
"use server";

// Mock implementations for development
export async function createFeedback(params: any) {
  console.log('Mock createFeedback called with:', params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock successful response
  return {
    success: true,
    feedbackId: `feedback_${Date.now()}`
  };
}

export async function ensureInterviewExists(interviewId: string, userId: string): Promise<boolean> {
  console.log('Mock ensureInterviewExists called with:', { interviewId, userId });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock successful response
  return true;
}

export async function getFeedbackByInterviewId(params: { interviewId: string; userId: string }) {
  console.log('Mock getFeedbackByInterviewId called with:', params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response - sometimes return feedback, sometimes null
  if (Math.random() > 0.5) {
    return {
      id: `feedback_${params.interviewId}`,
      totalScore: Math.floor(Math.random() * 40) + 60, // Score between 60-100
      finalAssessment: "Great job! You demonstrated strong technical knowledge and communication skills. Areas for improvement include providing more specific examples and asking clarifying questions.",
      createdAt: new Date().toISOString()
    };
  }
  
  return null;
}

export async function getInterviewById(id: string) {
  console.log('Mock getInterviewById called with:', id);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id,
    role: "Frontend Developer",
    type: "Technical",
    level: "Mid-level",
    techstack: ["React", "JavaScript", "TypeScript", "CSS"],
    questions: [
      "Tell me about yourself",
      "What is your experience with React?",
      "How do you handle state management?",
      "Describe a challenging project you worked on",
      "Do you have any questions for me?"
    ],
    userId: "user_123",
    finalized: true,
    createdAt: new Date().toISOString()
  };
}

export async function getInterviewsByUserId(userId: string) {
  console.log('Mock getInterviewsByUserId called with:', userId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock interviews data
  return [
    {
      id: "interview_1",
      role: "Frontend Developer",
      type: "Technical",
      level: "Junior",
      techstack: ["React", "JavaScript", "CSS"],
      finalized: true,
      createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
    },
    {
      id: "interview_2", 
      role: "Backend Developer",
      type: "Mixed",
      level: "Mid-level",
      techstack: ["Node.js", "Express", "MongoDB"],
      finalized: true,
      createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: "interview_3",
      role: "Full Stack Developer", 
      type: "Behavioral",
      level: "Senior",
      techstack: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      finalized: false,
      createdAt: new Date().toISOString() // Today
    }
  ];
}

export async function createInterview(params: any) {
  console.log('Mock createInterview called with:', params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    interviewId: `interview_${Date.now()}`
  };
}
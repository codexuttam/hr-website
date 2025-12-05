export type RoadmapInput = {
  goal: string;
  skill_level: "Beginner" | "Intermediate" | "Advanced" | string;
  duration: string;
  roadmap_type: string;
  extra_preferences?: string;
  project_hierarchy?: string;
  user_id?: string | null;
};

// Structured roadmap types for JSON format
export interface Week {
  week: number;
  title: string;
  topics: string[];
  timeAllocation?: string;
  resources?: string[];
  practicalTasks?: string[];
}

export interface Phase {
  title: string;
  weeks: string; // e.g., "Week 1-4"
  weekStart: number;
  weekEnd: number;
  description?: string;
  topics: string[];
  color?: string;
}

export interface Milestone {
  week: number;
  title: string;
  description: string;
  criteria?: string[];
}

export interface Resource {
  title: string;
  type: 'documentation' | 'tutorial' | 'course' | 'book' | 'tool' | 'community';
  url?: string;
  description?: string;
}

export interface RoadmapStructure {
  overview: {
    summary: string;
    totalWeeks: number;
    keyMilestones: string[];
  };
  phases: Phase[];
  weeks?: Week[];
  milestones: Milestone[];
  resources?: Resource[];
  assessmentCheckpoints?: {
    week: number;
    title: string;
    criteria: string[];
  }[];
}

export type RoadmapOutput = {
  ai_response: string;
  structured_data?: RoadmapStructure; // Optional structured JSON
  metadata: Record<string, any>;
};
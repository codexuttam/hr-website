export type RoadmapInput = {
  goal: string;
  skill_level: "Beginner" | "Intermediate" | "Advanced" | string;
  duration: string;
  roadmap_type: string;
  extra_preferences?: string;
  project_hierarchy?: string;
  user_id?: string | null;
};

export type RoadmapOutput = {
  ai_response: string;
  metadata: Record<string, any>;
};
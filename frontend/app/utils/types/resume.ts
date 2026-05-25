/** Type for resume data shared across all templates */
export interface ResumeData {
  contact: {
    name: string;
    position?: string;
    photoUrl?: string;
    phone?: string;
    email?: string;
    linkedin?: string;
    github?: string;
    address?: string;
    portfolio?: string;
  };

  objective?: string; // Profile Summary / About Me / Objective

  education: {
  year?: string;
  course?: string;
  institution?: string;
  university?: string;
  percentage?: string | number;
  achievements?: string;
  description?: string; // ✅ Added this line
}[];


  experience: {
    year?: string;
    company?: string;
    position?: string;
    description?: string;
    location?: string;
  }[];

  skills: string[];

  certifications: {
  year?: string;
  course?: string;
  institution?: string;
  issuer?: string;
  description?: string;
}[];

  projects?: {
    title?: string;
    link?: string;
    description?: string;
  }[];

  workshops?: {
    year?: string;
    description?: string;
  }[];

  activities?: {
    title?: string;
  }[];

  references: {
    name?: string;
    desig?: string;
    phone?: string;
    email?: string;
  }[];

  languages?: {
    language: string;
    level?: string | number;
  }[];

  tools?: string[];

  interests?: string[];
}

/** Type for color configuration (used in color pickers and themes) */
export interface ResumeColor {
  primary: string;
  background: string;
  skills?: string;
  accent?: string;
}

export interface CourseRecommendation {
  title: string;
  platform: string;
  url: string;
}

export interface AnalysisResult {
  missingSkills: string[];
  weakSkills: string[];
  recommendedCourses: CourseRecommendation[];
}

export function compareSkills(userSkills: string[], requiredSkills: string[]): { missing: string[], present: string[] } {
  const normalizedUser = userSkills.map(s => s.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim());

  const missing = requiredSkills.filter(req => 
    !normalizedUser.includes(req.toLowerCase().trim())
  );
  
  const present = requiredSkills.filter(req => 
    normalizedUser.includes(req.toLowerCase().trim())
  );

  return { missing, present };
}

export const RESOURCE_DB: Record<string, CourseRecommendation[]> = {
  "react": [
    {
      title: "React - The Complete Guide",
      platform: "Udemy",
      url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"
    },
    {
      title: "React Beginner Course",
      platform: "FreeCodeCamp (YouTube)",
      url: "https://www.youtube.com/watch?v=bMknfKXIFA8"
    }
  ],

  "next.js": [
    {
      title: "Next.js Full Course",
      platform: "FreeCodeCamp",
      url: "https://www.youtube.com/watch?v=O5cmLDVTgAs"
    },
    {
      title: "Next.js Documentation",
      platform: "Official Docs",
      url: "https://nextjs.org/learn"
    }
  ],

  "typescript": [
    {
      title: "Understanding TypeScript",
      platform: "Udemy",
      url: "https://www.udemy.com/course/understanding-typescript/"
    },
    {
      title: "TypeScript Tutorial",
      platform: "FreeCodeCamp",
      url: "https://www.youtube.com/watch?v=30LWjhZzg50"
    }
  ],

  "node.js": [
    {
      title: "Node.js Complete Developer Course",
      platform: "Udemy",
      url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/"
    },
    {
      title: "Node.js Crash Course",
      platform: "Traversy Media (YouTube)",
      url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4"
    }
  ],

  "python": [
    {
      title: "Python for Everybody",
      platform: "Coursera",
      url: "https://www.coursera.org/specializations/python"
    },
    {
      title: "Python Full Course",
      platform: "FreeCodeCamp",
      url: "https://www.youtube.com/watch?v=rfscVS0vtbw"
    }
  ],

  "machine learning": [
    {
      title: "Machine Learning by Andrew Ng",
      platform: "Coursera",
      url: "https://www.coursera.org/learn/machine-learning"
    },
    {
      title: "Machine Learning Full Course",
      platform: "FreeCodeCamp",
      url: "https://www.youtube.com/watch?v=GwIo3gDZCVQ"
    }
  ],

  "docker": [
    {
      title: "Docker Mastery",
      platform: "Udemy",
      url: "https://www.udemy.com/course/docker-mastery/"
    },
    {
      title: "Docker Tutorial",
      platform: "FreeCodeCamp",
      url: "https://www.youtube.com/watch?v=fqMOX6JJhGo"
    }
  ],

  "kubernetes": [
    {
      title: "Kubernetes for Beginners",
      platform: "Udemy",
      url: "https://www.udemy.com/course/kubernetes-for-the-absolute-beginners-hands-on/"
    },
    {
      title: "Kubernetes Crash Course",
      platform: "TechWorld with Nana (YouTube)",
      url: "https://www.youtube.com/watch?v=X48VuDVv0do"
    }
  ],

  "sql": [
    {
      title: "SQL for Data Science",
      platform: "Coursera",
      url: "https://www.coursera.org/learn/sql-for-data-science"
    },
    {
      title: "SQL Full Course",
      platform: "FreeCodeCamp",
      url: "https://www.youtube.com/watch?v=HXV3zeQKqGY"
    }
  ],

  "pandas": [
    {
      title: "Data Analysis with Pandas",
      platform: "FreeCodeCamp",
      url: "https://www.youtube.com/watch?v=vmEHCJofslg"
    }
  ]
};

export function getRecommendations(missingSkills: string[]): CourseRecommendation[] {
  const results: CourseRecommendation[] = [];

  missingSkills.forEach(skill => {
    const key = skill.toLowerCase().trim();

    if (RESOURCE_DB[key]) {
      // Add curated resources
      results.push(...RESOURCE_DB[key]);
    } else {
      // Fallback mock course (your original logic)
      results.push({
        title: `Master ${skill} in 30 Days`,
        platform: 'EduAI Learning',
        url: `#course-${skill.toLowerCase().replace(/\s+/g, '-')}`
      });
    }
  });

  return results;
}

export function analyzeSkillGap(userSkills: string[], jobSkillsRaw: string[]): AnalysisResult {
  const { missing, present } = compareSkills(userSkills, jobSkillsRaw);
  
  // Logic identifying "weak" skills. 
  // For this MVP, we'll arbitrarily mark the last "present" skill as "weak" 
  // to simulate the "needs improvement" feature if there are any present skills.
  // In a real app, this would come from assessment scores.
  const weakSkills = present.length > 0 ? [present[present.length - 1]] : [];

  return {
    missingSkills: missing,
    weakSkills: weakSkills,
    recommendedCourses: getRecommendations(missing)
  };
}

export type JobRole =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Data Scientist'
  | 'DevOps Engineer'
  | 'Machine Learning Engineer'
  | 'AI Engineer'
  | 'Data Engineer'
  | 'Mobile App Developer'
  | 'Cloud Engineer'
  | 'Cybersecurity Engineer'
  | 'QA Engineer'
  | 'Product Manager'
  | 'UI/UX Designer';

export interface JobRequirements {
  required: string[];
  niceToHave: string[];
}

export const JOB_SKILLS_DB: Record<string, JobRequirements> = {
  'Frontend Developer': {
    required: ['React', 'TypeScript', 'CSS', 'HTML', 'Next.js'],
    niceToHave: ['Tailwind', 'Redux', 'GraphQL', 'Figma']
  },

  'Backend Developer': {
    required: ['Node.js', 'Express', 'PostgreSQL', 'API Design'],
    niceToHave: ['Docker', 'Redis', 'AWS', 'Microservices']
  },

  'Full Stack Developer': {
    required: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Next.js'],
    niceToHave: ['Docker', 'AWS', 'GraphQL', 'Tailwind']
  },

  'Data Scientist': {
    required: ['Python', 'Pandas', 'NumPy', 'SQL', 'Machine Learning'],
    niceToHave: ['TensorFlow', 'PyTorch', 'Data Visualization', 'Spark']
  },

  'DevOps Engineer': {
    required: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
    niceToHave: ['Terraform', 'Ansible', 'Monitoring', 'Bash']
  },

  /* 🔥 Newly Added Job Roles */

  'Machine Learning Engineer': {
    required: ['Python', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'ML Pipelines'],
    niceToHave: ['MLOps', 'Docker', 'Kubernetes', 'Feature Engineering']
  },

  'AI Engineer': {
    required: ['Python', 'LLMs', 'Prompt Engineering', 'Vector Databases', 'APIs'],
    niceToHave: ['LangChain', 'RAG Pipelines', 'Transformer Models', 'DevOps Basics']
  },

  'Data Engineer': {
    required: ['SQL', 'ETL Pipelines', 'Airflow', 'Python', 'Data Warehousing'],
    niceToHave: ['Spark', 'Kafka', 'AWS Redshift', 'Snowflake']
  },

  'Mobile App Developer': {
    required: ['Flutter', 'React Native', 'Dart/JavaScript', 'REST APIs'],
    niceToHave: ['Firebase', 'Native iOS/Android', 'State Management Libraries']
  },

  'Cloud Engineer': {
    required: ['AWS', 'Terraform', 'Linux', 'Networking Fundamentals'],
    niceToHave: ['GCP', 'Azure', 'Kubernetes', 'Cloud Security']
  },

  'Cybersecurity Engineer': {
    required: ['Networking', 'Linux', 'Firewalls', 'SIEM Tools'],
    niceToHave: ['Ethical Hacking', 'OWASP', 'Cloud Security', 'Threat Modeling']
  },

  'QA Engineer': {
    required: ['Manual Testing', 'Automation Testing', 'Selenium', 'Test Cases'],
    niceToHave: ['Cypress', 'Jest', 'CI/CD', 'Performance Testing']
  },

  'Product Manager': {
    required: ['Roadmaps', 'User Research', 'Agile', 'Data Analysis'],
    niceToHave: ['SQL', 'Figma', 'A/B Testing', 'Tech Architecture Basics']
  },

  'UI/UX Designer': {
    required: ['Figma', 'Wireframing', 'Prototyping', 'User Research'],
    niceToHave: ['Motion Design', 'Design Systems', 'HTML/CSS Awareness']
  }
};


export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  category: string;
  initialCode: Record<string, string>;
  testCases: TestCase[];
  constraints: string[];
}

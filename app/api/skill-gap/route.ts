import { NextResponse } from 'next/server';
import { analyzeSkillGap } from '@/lib/skill-gap/skillAnalyzer';
import { JOB_SKILLS_DB } from '@/lib/skill-gap/jobSkillsDB';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Skill Gap Analysis Request:', body);
    const { userSkills, jobRole } = body;

    if (!userSkills || !Array.isArray(userSkills) || !jobRole) {
      console.error('Invalid input:', { userSkills, jobRole });
      return NextResponse.json(
        { error: 'Invalid input. Requirements: userSkills (array) and jobRole (string)' },
        { status: 400 }
      );
    }

    const jobData = JOB_SKILLS_DB[jobRole];
    
    if (!jobData) {
      console.error('Job role not found:', jobRole);
      return NextResponse.json(
        { error: 'Job role not found in database' },
        { status: 404 }
      );
    }

    const result = analyzeSkillGap(userSkills, jobData.required);
    console.log('Analysis Result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in skill-gap analysis:', error);
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
  }
}

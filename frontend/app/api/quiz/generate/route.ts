import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

// Init AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});

type AIProvider = 'openai' | 'gemini' | 'auto';

/* -------------------------------------------------------------------------
    COMPANY QUESTION BLUEPRINTS (expand anytime)
------------------------------------------------------------------------- */
const COMPANY_TEMPLATES: Record<string, string> = {
  GOOGLE: `
Ask questions similar to Google interview style:
- Emphasize DSA (Trees, DP, Graphs)
- Algorithmic reasoning
- Big O complexity analysis
  `,

  AMAZON: `
Follow Amazon interview style:
- Amazon Leadership Principles
- Behavioural STAR format questions 
- Basic DSA (arrays, strings, greedy)
  `,

  MICROSOFT: `
Microsoft style:
- System design fundamentals 
- OOPS and architecture patterns 
- Practical coding (hashmap, recursion)
  `,

  META: `
Meta interview approach:
- Product sense thinking
- Debugging based coding
- Practical real-world problems
  `,

  TCS: `
TCS style:
- Aptitude (Quant, Verbal)
- Basic programming MCQs
- SQL and DBMS theory
  `,
};

/* -------------------------------------------------------------------------
    Generate Prompt Dynamically (Company + Topic + Custom)
------------------------------------------------------------------------- */
function buildFinalPrompt(
  topic: string,
  companies: string[],
  customPrompt: string,
  numQuestions: number,
  difficulty: string
): string {

  let sections: string[] = [];

  // Topic Section
  if (topic.trim()) {
    sections.push(`Topic Focus: ${topic}`);
  }

  // Company Style Section
  if (companies.length > 0) {
    const mergedCompanies = companies.map(c => COMPANY_TEMPLATES[c] || '').join('\n');
    sections.push(`
Generate questions matching the interview style of the following companies:
${companies.join(', ')}

Use these guidelines:
${mergedCompanies}
`);
  }

  // Custom Prompt Section
  if (customPrompt.trim()) {
    sections.push(`
Custom Instructor Prompt:
${customPrompt}
`);
  }

  // Final rules for JSON output
  sections.push(`
Generate a quiz with the following settings:
- Number of questions: ${numQuestions}
- Difficulty: ${difficulty}
- Every question MUST have exactly 4 MCQs.
- Include "correct_answer" which is ONE of the choices.
- Format: VALID JSON ONLY.

JSON FORMAT STRICTLY:
{
  "title": "Quiz Title",
  "description": "Short 1-2 line summary",
  "questions": [
    {
      "question": "text",
      "choices": ["A","B","C","D"],
      "correct_answer": "The correct choice",
      "difficulty": "${difficulty}"
    }
  ]
}
`);

  return sections.join('\n\n');
}

/* -------------------------------------------------------------------------
    AI GENERATION ENGINE
------------------------------------------------------------------------- */
async function generateQuizWithAI(
  finalPrompt: string,
  provider: AIProvider = 'auto'
) {
  let text = '';
  let usedProvider = '';

  /* ---------------- Try OPENAI ---------------- */
  if ((provider === 'openai' || provider === 'auto') && openai.apiKey) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You generate only VALID JSON. Never add explanations or markdown.'
          },
          { role: 'user', content: finalPrompt }
        ],
        temperature: 0.6,
      });

      text = completion.choices[0]?.message?.content || '';
      usedProvider = 'OpenAI';
    } catch (e) {
      const error = e as Error;
      console.error('OpenAI error:', error.message);
      if (provider === 'openai') {
        throw new Error(`OpenAI failed: ${error.message}`);
      }
    }
  }

  /* ---------------- Try GEMINI ---------------- */
  if (!text && (provider === 'auto' || provider === 'gemini')) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(finalPrompt);
      const response = result.response;
      text = response.text();
      usedProvider = 'Gemini';
    } catch (e) {
      const error = e as Error;
      console.error('Gemini error:', error.message);
      throw new Error(`Gemini failed: ${error.message}`);
    }
  }

  if (!text) throw new Error('No AI provider returned output');

  // Clean markdown noise
  const cleanText = text.replace(/```json|```/g, '').trim();

  try {
    return { ...JSON.parse(cleanText), usedProvider };
  } catch (e) {
    const error = e as Error;
    console.error('Invalid JSON returned:', cleanText, error.message);
    throw new Error('AI returned invalid JSON.');
  }
}

/* -------------------------------------------------------------------------
    POST HANDLER
------------------------------------------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      topic = '',
      numQuestions = 5,
      difficulty = 'medium',
      provider = 'auto',
      companies = [],        // NEW
      customPrompt = ''      // NEW
    } = body;

    // Build dynamic prompt
    const finalPrompt = buildFinalPrompt(
      topic,
      companies,
      customPrompt,
      numQuestions,
      difficulty
    );

    // Generate content
    const quizData = await generateQuizWithAI(finalPrompt, provider);

    // Insert quiz into DB
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([
        { title: quizData.title, description: quizData.description }
      ])
      .select()
      .single();

    if (quizError) throw new Error(quizError.message);

    // Insert questions
    const formattedQuestions = quizData.questions.map((q: any) => ({
      question: q.question,
      choices: q.choices,
      correct_answer: q.correct_answer,
      difficulty: q.difficulty || difficulty,
    }));

    const { data: insertedQ, error: questionsError } = await supabase
      .from('questions')
      .insert(formattedQuestions)
      .select();

    if (questionsError) throw new Error(questionsError.message);

    // Attach to quiz
    const mappings = insertedQ.map((q: any) => ({
      quiz_id: quiz.quiz_id,
      question_id: q.question_id,
    }));

    await supabase.from('quiz_questions').insert(mappings);

    return NextResponse.json({
      success: true,
      message: `Quiz created with ${insertedQ.length} questions.`,
      quiz: quiz,
      aiProvider: quizData.usedProvider,
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}

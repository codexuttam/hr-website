import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// API Keys
const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// Initialize Supabase admin client for credit updates
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper function to call OpenAI
async function callOpenAI(prompt: string): Promise<string> {
    if (!openaiKey) throw new Error('OpenAI API key not configured');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 1500
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Helper function to call Gemini
async function callGemini(prompt: string): Promise<string | null> {
    if (!genAI) return null;
    
    const models = ['gemini-2.0-flash', 'gemini-1.5-pro-latest', 'gemini-pro'];
    
    for (const modelName of models) {
        try {
            console.log('Trying Gemini model:', modelName);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) return text;
        } catch (error) {
            console.log(`Gemini model ${modelName} failed:`, error);
        }
    }
    return null;
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, userId } = await request.json();

    // Credit Check Logic
    if (userId) {
      if (!supabaseServiceKey) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is missing, skipping credit check');
      } else {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Check current credits
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits')
          .eq('user_id', userId)
          .single();

        if (!userError && userData) {
          const currentCredits = userData.credits ?? 0;
          if (currentCredits < 10) {
             return NextResponse.json(
              { error: 'Insufficient credits. You need 10 credits to analyze a resume.' },
              { status: 403 }
            );
          }
          
          // Deduct credits
          await supabase
            .from('users')
            .update({ credits: currentCredits - 10 })
            .eq('user_id', userId);
            
          console.log(`Deducted 1 credits from user ${userId}. Remaining: ${currentCredits - 1}`);
        }
      }
    }

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume text and job description are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an ATS analyzer. Analyze this resume against the job description.

RESUME: ${resumeText.substring(0, 2000)}
JOB: ${jobDescription.substring(0, 2000)}

Return ONLY a valid JSON object in this exact format:
{
  "overall_score": 75,
  "matching_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["missing1", "missing2"],
  "suggestions": "Brief improvement suggestions"
}

No additional text, explanations, or markdown formatting. Just the JSON object.`;

    let aiResponse: string | null = null;

    // Try OpenAI first
    if (openaiKey) {
      try {
        console.log('Attempting OpenAI for ATS analysis...');
        aiResponse = await callOpenAI(prompt);
        console.log('OpenAI succeeded for ATS analysis');
      } catch (error) {
        console.warn('OpenAI failed for ATS, falling back to Gemini:', error);
      }
    }

    // Fallback to Gemini
    if (!aiResponse && geminiKey) {
      try {
        console.log('Attempting Gemini for ATS analysis...');
        aiResponse = await callGemini(prompt);
        if (aiResponse) console.log('Gemini succeeded for ATS analysis');
      } catch (error) {
        console.warn('Gemini also failed for ATS:', error);
      }
    }

    // Parse AI response
    if (aiResponse) {
      try {
        let cleanText = aiResponse.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        }
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        const analysisResult = JSON.parse(cleanText);
        return NextResponse.json({
          success: true,
          atsResult: {
            ...analysisResult,
            analysis_data: {
              keyword_density: 70,
              readability_score: 85,
              format_score: 75,
              full_analysis: aiResponse
            }
          },
          saveToDatabase: true
        });
      } catch (parseError) {
        console.log('AI response parse failed:', parseError);
      }
    }

    // AI unavailable — return a clear error instead of a fallback
    return NextResponse.json(
      { success: false, error: 'AI service is currently unavailable. Please try again in a moment.' },
      { status: 503 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


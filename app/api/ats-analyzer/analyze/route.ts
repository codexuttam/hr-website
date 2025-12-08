import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for credit updates
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
          if (currentCredits < 5) {
             return NextResponse.json(
              { error: 'Insufficient credits. You need 5 credits to analyze a resume.' },
              { status: 403 }
            );
          }
          
          // Deduct credits
          await supabase
            .from('users')
            .update({ credits: currentCredits - 1 })
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

    // Try AI analysis first
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || 'AIzaSyCq0PKLdwdR7E-2BWDmBjCV_Svfb2yZKhI';
      
      if (apiKey && apiKey !== 'your-api-key-here') {
        console.log('Using API key:', apiKey.substring(0, 10) + '...');
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const models = ['gemini-2.5-flash', 'gemini-1.5-pro-latest', 'gemini-pro'];
        
        for (const modelName of models) {
          try {
            console.log('Trying model:', modelName);
            const model = genAI.getGenerativeModel({ model: modelName });

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

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            if (text) {
              console.log('AI response received:', text.substring(0, 200) + '...');
              try {
                // Clean the response - remove any markdown formatting or extra text
                let cleanText = text.trim();
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
                      full_analysis: text
                    }
                  },
                  saveToDatabase: true // Flag to indicate this should be saved
                });
              } catch (parseError) {
                console.log('JSON parse failed:', parseError);
                console.log('Raw AI response:', text);
                console.log('Using fallback keyword analysis');
                break;
              }
            }
          } catch (modelError) {
            console.log(`Model ${modelName} failed:`, modelError);
          }
        }
      }
    } catch (aiError) {
      console.log('AI analysis failed:', aiError);
    }

    // Fallback analysis
    console.log('Using fallback keyword analysis');
    const keywords = extractKeywords(resumeText, jobDescription);
    const score = Math.min(90, Math.max(40, (keywords.matching.length / Math.max(keywords.missing.length + keywords.matching.length, 1)) * 100));
    
    const fallbackResult = {
      overall_score: Math.round(score),
      matching_keywords: keywords.matching,
      missing_keywords: keywords.missing,
      suggestions: `Your resume matches ${keywords.matching.length} keywords from the job description. Consider adding these missing keywords: ${keywords.missing.slice(0, 5).join(', ')}. Focus on including relevant skills, technologies, and qualifications mentioned in the job posting.`,
      analysis_data: {
        keyword_density: Math.round((keywords.matching.length / (keywords.matching.length + keywords.missing.length)) * 100),
        readability_score: 80,
        format_score: 75,
        full_analysis: `Keyword Analysis:\n\nMatching Keywords (${keywords.matching.length}): ${keywords.matching.join(', ')}\n\nMissing Keywords (${keywords.missing.length}): ${keywords.missing.join(', ')}\n\nRecommendation: Include more relevant keywords from the job description to improve ATS compatibility.`
      }
    };

    return NextResponse.json({
      success: true,
      atsResult: fallbackResult,
      saveToDatabase: true // Flag to indicate this should be saved
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to extract keywords
function extractKeywords(resumeText: string, jobDescription: string) {
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'within', 'without', 'under', 'over', 'this', 'that', 'these', 'those', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'have', 'has', 'had', 'been', 'being', 'are', 'was', 'were', 'is', 'am']);
  
  const resumeWords = resumeText.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
  
  const jobWords = jobDescription.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
  
  const jobKeywords = [...new Set(jobWords)];
  const matching = jobKeywords.filter(keyword => resumeWords.includes(keyword));
  const missing = jobKeywords.filter(keyword => !resumeWords.includes(keyword)).slice(0, 15);
  
  return { 
    matching: matching.slice(0, 20), 
    missing: missing 
  };
}
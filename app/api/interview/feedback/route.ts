import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

// API Keys
const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;

// Initialize Gemini as fallback
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

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
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Helper function to call Gemini with model fallbacks
async function callGemini(prompt: string): Promise<string> {
    if (!genAI) throw new Error('Gemini API key not configured');
    
    // Try multiple models - each has separate quota
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
    
    for (const modelName of models) {
        try {
            console.log(`Trying Gemini model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) {
                console.log(`Gemini model ${modelName} succeeded`);
                return text;
            }
        } catch (error: any) {
            console.warn(`Gemini model ${modelName} failed:`, error.message?.substring(0, 100));
            // Continue to next model
        }
    }
    
    throw new Error('All Gemini models failed or quota exceeded');
}

// Generate AI response with OpenAI-first, Gemini fallback
async function generateAIResponse(prompt: string): Promise<string> {
    // Try OpenAI first
    if (openaiKey) {
        try {
            console.log('Attempting OpenAI for interview feedback...');
            const response = await callOpenAI(prompt);
            console.log('OpenAI succeeded');
            return response;
        } catch (error) {
            console.warn('OpenAI failed, falling back to Gemini:', error);
        }
    }

    // Fallback to Gemini
    if (geminiKey) {
        try {
            console.log('Attempting Gemini for interview feedback...');
            const response = await callGemini(prompt);
            console.log('Gemini succeeded');
            return response;
        } catch (error) {
            console.error('Gemini also failed:', error);
            throw error;
        }
    }

    throw new Error('No AI service configured. Please set OPENAI_API_KEY or NEXT_PUBLIC_GOOGLE_AI_API_KEY');
}

export async function POST(req: Request) {
    try {
        // Check if any API is configured
        if (!openaiKey && !geminiKey) {
            console.error('No AI API key is configured');
            return NextResponse.json(
                { error: "AI service is not configured. Please set OPENAI_API_KEY or NEXT_PUBLIC_GOOGLE_AI_API_KEY in environment." },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { transcript, eyeContact, config, duration, userId } = body;

        console.log('Received interview feedback request:', { 
            hasTranscript: !!transcript, 
            transcriptLength: transcript?.length,
            hasConfig: !!config,
            userId,
            duration,
            hasOpenAI: !!openaiKey,
            hasGemini: !!geminiKey
        });

        if (!transcript || !config) {
            return NextResponse.json(
                { error: "Missing required fields: transcript and config are required" },
                { status: 400 }
            );
        }

        // Credit Check & Deduction (10 credits)
        if (userId) {
            const { data: userData, error: userError } = await supabaseAdmin
                .from('users')
                .select('credits')
                .eq('user_id', userId)
                .single();

            if (!userError && userData) {
                const currentCredits = userData.credits ?? 0;
                if (currentCredits < 10) {
                     return NextResponse.json(
                        { error: 'Insufficient credits. You need 10 credits to process interview feedback.' },
                        { status: 403 }
                    );
                }
                
                // Deduct credits
                await supabaseAdmin
                    .from('users')
                    .update({ credits: currentCredits - 10 })
                    .eq('user_id', userId);
                
                console.log(`Deducted 10 credits from user ${userId} for Interview Feedback. Remaining: ${currentCredits - 10}`);
            }
        }

        // Construct the prompt
        const prompt = `
You are an expert technical interviewer and soft skills coach.
Analyze the following interview data for a ${config.role} position (${config.experience} level).

Context:
- Role: ${config.role}
- Experience Level: ${config.experience}
- Tech Stack: ${config.techStack}
- Duration: ${duration} seconds
- Eye Contact Percentage: ${eyeContact?.percentage?.toFixed(1) || 0}%

Transcript:
${JSON.stringify(transcript, null, 2)}

Please provide a structured evaluation including:
1. Technical Knowledge Assessment (0-10 score)
2. Communication Skills (0-10 score)
3. Eye Contact & Engagement Analysis (based on the stats provided)
4. Strengths
5. Areas for Improvement
6. Overall Feedback Summary

Format the output as JSON with the following structure:
{
  "technicalScore": number,
  "communicationScore": number,
  "eyeContactFeedback": "string",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "summary": "string"
}
`;

        // Generate content using OpenAI or Gemini
        const text = await generateAIResponse(prompt);

        // Extract JSON from the response
        let feedbackData;
        try {
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                feedbackData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            } else {
                feedbackData = { summary: text }; // Fallback
            }
        } catch (e) {
            console.error("Failed to parse AI response as JSON:", e);
            feedbackData = { summary: text };
        }

        // Save to Database
        console.log('=== DATABASE SAVE SECTION ===');
        console.log('userId provided:', userId);
        console.log('Has service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        if (userId) {
            // 1. Log to ai_mentor_logs (keep existing logging)
            const { error: logError } = await supabaseAdmin
                .from('ai_mentor_logs')
                .insert({
                    user_id: userId,
                    query: `Interview Feedback - ${config.role}`,
                    ai_response: text,
                    context_type: 'interview_feedback',
                    metadata: {
                        transcript,
                        eyeContact,
                        config,
                        duration,
                        scores: feedbackData
                    }
                });

            if (logError) {
                console.error("AI Mentor Log save error:", logError);
            }

            // 2. Save to mock_interviews table
            try {
                const technicalScore = Number(feedbackData.technicalScore) || 0;
                const communicationScore = Number(feedbackData.communicationScore) || 0;
                
                // Calculate rating (0-5 scale based on 0-10 scores)
                // Average of tech + comm scores (max 20), divided by 4 to get max 5
                let rating = (technicalScore + communicationScore) / 4;
                rating = Math.min(Math.max(rating, 0), 5); // Ensure bounds

                // Map to existing analysis schema structure provided in DB schema
                const analysisPayload = {
                    eyeContactScore: eyeContact.percentage,
                    overallAssessment: feedbackData.summary,
                    engagementAnalysis: {
                        notes: `Strengths: ${feedbackData.strengths?.join(', ')}. Improvements: ${feedbackData.improvements?.join(', ')}`,
                        greeting: "Analyzed via Transcript",
                        readiness: "Analyzed via Transcript",
                        confidence: `Communication Score: ${communicationScore}/10`
                    },
                    eyeContactCategory: eyeContact.percentage > 50 ? "Good" : "Needs Improvement",
                    eyeContactExplanation: feedbackData.eyeContactFeedback || "Analysis based on camera tracking.",
                    detailed_scores: {
                        technical: technicalScore,
                        communication: communicationScore
                    }
                };

                const { data: savedInterview, error: interviewError } = await supabaseAdmin
                    .from('mock_interviews')
                    .insert({
                        student_id: userId,
                        scheduled_date: new Date().toISOString(),
                        feedback: feedbackData.summary,
                        rating: rating,
                        analysis: analysisPayload
                    })
                    .select()
                    .single();

                if (interviewError) {
                    console.error("Mock Interview save error:", {
                        code: interviewError.code,
                        message: interviewError.message,
                        details: interviewError.details,
                        hint: interviewError.hint,
                        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                        userId: userId
                    });
                } else {
                    console.log("Successfully saved to mock_interviews, ID:", savedInterview?.id);
                    // Add ID to feedback data for frontend redirect
                    if (savedInterview) {
                        feedbackData.interviewId = savedInterview.id;
                    }
                }
            } catch (err) {
                console.error("Error saving to mock_interviews:", err);
                // Don't fail the request, just log the error
                // Feedback was still generated successfully
            }
        } else {
            console.log("No userId provided, skipping database save");
        }

        // Always return success if we got to this point - feedback was generated
        return NextResponse.json({
            success: true,
            feedback: feedbackData
        });

    } catch (error: any) {
        console.error("Feedback generation error:", error);
        console.error("Error stack:", error.stack);
        
        // Provide more specific error messages
        let errorMessage = "Failed to generate feedback";
        if (error.message?.includes('API_KEY')) {
            errorMessage = "AI service API key is invalid or missing";
        } else if (error.message?.includes('quota')) {
            errorMessage = "AI service quota exceeded. Please try again later.";
        } else if (error.message?.includes('network')) {
            errorMessage = "Network error connecting to AI service";
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return NextResponse.json(
            { error: errorMessage, details: error.message },
            { status: 500 }
        );
    }
}

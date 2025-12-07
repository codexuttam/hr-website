import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { transcript, eyeContact, config, duration, userId } = body;

        if (!transcript || !config) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Construct the prompt for Gemini
        const prompt = `
You are an expert technical interviewer and soft skills coach.
Analyze the following interview data for a ${config.role} position (${config.experience} level).

Context:
- Role: ${config.role}
- Experience Level: ${config.experience}
- Tech Stack: ${config.techStack}
- Duration: ${duration} seconds
- Eye Contact Percentage: ${eyeContact.percentage.toFixed(1)}%

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

        // Generate content using Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

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

                const { error: interviewError } = await supabaseAdmin
                    .from('mock_interviews')
                    .insert({
                        student_id: userId,
                        scheduled_date: new Date().toISOString(),
                        feedback: feedbackData.summary,
                        rating: rating,
                        analysis: analysisPayload
                    });

                if (interviewError) {
                    console.error("Mock Interview save error:", interviewError);
                } else {
                    console.log("Successfully saved to mock_interviews");
                }
            } catch (err) {
                console.error("Error saving to mock_interviews:", err);
            }
        }

        return NextResponse.json({
            success: true,
            feedback: feedbackData
        });

    } catch (error: any) {
        console.error("Feedback generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate feedback" },
            { status: 500 }
        );
    }
}

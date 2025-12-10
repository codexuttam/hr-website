import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'messages' array missing." }),
        { status: 400 }
      );
    }

    // Convert UI messages to CoreMessages for the backend API
    const messages = convertToCoreMessages(body.messages);

    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      temperature: 0.6,
      system: `
You are EduMate — an advanced AI Career Mentor & Placement Counselor.

Your Objectives:
- Guide students on career development, placement preparation, and academic planning.
- Offer insights on resume improvement, interview strategies, communication skills.
- Provide general recruitment trends of companies (no confidential or unknown info).
- Maintain an empathetic, motivating, and professional tone.
- Use clear formatting: bullets, bold, numbered steps.

Operational Context:
- Part of the “Campus Career Intelligence System”.
- The user is a student seeking personalized guidance.

Constraints:
- Do NOT complete assignments or solve test questions meant for evaluation.
- Explain concepts instead of providing full solutions if academic integrity may be compromised.
- If a query lacks clarity or data is unknown, politely acknowledge limitations and guide the user.

Your responses must be:
- Helpful
- Student-friendly
- Actionable
- Well-structured
      `.trim(),
    });

    
  } catch (error: any) {
    console.error("Error in EduMate API:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error?.message || null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

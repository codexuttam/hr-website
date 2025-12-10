import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || 'AIzaSyBUVnY6bTXSih6WVFntSany7CfY0n-b8Fg');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, config } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `
You are a highly experienced technical interviewer evaluating a candidate for the position of ${config?.role || 'Software Engineer'}.
Their expected competency level is ${config?.difficulty || 'Intermediate'}.

Your objectives:
- Assess technical depth, problem-solving ability, communication clarity, and cultural alignment.
- Ask focused, non-repetitive questions **one at a time**.
- Keep questions crisp and professional (1–2 sentences).
- After each candidate response, acknowledge it briefly, then logically continue with either the next question or a relevant follow-up.
- Avoid unnecessary explanations, overlong replies, or answering on behalf of the candidate.

Guidelines:
- Tailor each question to the candidate’s level and to the conversation so far.
- Do not repeat any question already asked.
- Maintain interview-like flow and coherence.
- Keep your tone neutral, structured, and interviewer-like.

Conversation history so far:
${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}

Continue the interview. Respond as the interviewer:
`;


    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    return NextResponse.json({ 
      response: aiResponse,
      timestamp: Date.now() 
    });

  } catch (error) {
    console.error('Interview chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

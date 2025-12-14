import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API Keys
const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
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
            max_tokens: 500
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
// Helper function to call Gemini with model fallbacks
async function callGemini(prompt: string): Promise<string> {
    if (!genAI) throw new Error('Gemini API key not configured');
    
    // Try multiple models - each has separate quota
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
    
    for (const modelName of models) {
        try {
            console.log(`Trying Gemini model: ${modelName} for chat`);
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
- Tailor each question to the candidate's level and to the conversation so far.
- Do not repeat any question already asked.
- Maintain interview-like flow and coherence.
- Keep your tone neutral, structured, and interviewer-like.

Conversation history so far:
${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}

Continue the interview. Respond as the interviewer:
`;

    let aiResponse: string | null = null;

    // Try OpenAI first
    if (openaiKey) {
      try {
        console.log('Attempting OpenAI for interview chat...');
        aiResponse = await callOpenAI(systemPrompt);
        console.log('OpenAI succeeded for interview chat');
      } catch (error) {
        console.warn('OpenAI failed for interview chat, falling back to Gemini:', error);
      }
    }

    // Fallback to Gemini
    if (!aiResponse && geminiKey) {
      try {
        console.log('Attempting Gemini for interview chat...');
        aiResponse = await callGemini(systemPrompt);
        console.log('Gemini succeeded for interview chat');
      } catch (error) {
        console.error('Gemini also failed for interview chat:', error);
        throw error;
      }
    }

    if (!aiResponse) {
      throw new Error('No AI service available. Please configure OPENAI_API_KEY or NEXT_PUBLIC_GOOGLE_AI_API_KEY');
    }

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

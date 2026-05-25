import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

async function callOpenAI(prompt: string): Promise<string> {
    if (!openaiKey) throw new Error('OpenAI API key not configured');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 1500 }),
    });
    if (!response.ok) throw new Error(`OpenAI error: ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGemini(prompt: string): Promise<string> {
    if (!genAI) throw new Error('Gemini not configured');
    for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro']) {
        try {
            const m = genAI.getGenerativeModel({ model });
            const result = await m.generateContent(prompt);
            const text = result.response.text();
            if (text) return text;
        } catch { /* try next */ }
    }
    throw new Error('All Gemini models failed');
}

export async function POST(req: Request) {
    try {
        const { role, experience, techStack, resumeText } = await req.json();

        if (!role || !techStack) {
            return NextResponse.json({ error: 'role and techStack are required' }, { status: 400 });
        }

        const resumeSection = resumeText
            ? `\n\nCandidate's resume:\n${resumeText.substring(0, 2000)}`
            : '';

        const prompt = `You are a technical interviewer. Generate exactly 8 interview questions for a ${experience}-level ${role} position.
Tech stack: ${techStack}.${resumeSection}

Rules:
- Mix of technical (5 questions) and behavioral (3 questions)
- Technical questions should be specific to the tech stack
- If resume is provided, reference specific projects or skills from it
- Each question should be clear and concise

Return ONLY a valid JSON array of strings, no markdown, no extra text:
["question 1", "question 2", "question 3", "question 4", "question 5", "question 6", "question 7", "question 8"]`;

        let text: string | null = null;

        if (openaiKey) {
            try { text = await callOpenAI(prompt); } catch { /* fall through */ }
        }
        if (!text && geminiKey) {
            try { text = await callGemini(prompt); } catch { /* fall through */ }
        }

        if (!text) {
            return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
        }

        // Parse
        let questions: string[];
        try {
            const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            questions = JSON.parse(clean);
            if (!Array.isArray(questions)) throw new Error('Not an array');
        } catch {
            return NextResponse.json({ error: 'Failed to parse questions from AI response' }, { status: 500 });
        }

        return NextResponse.json({ success: true, questions });
    } catch (error) {
        console.error('Questions API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

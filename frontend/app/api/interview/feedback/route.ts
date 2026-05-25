import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const genAI     = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

// ── AI helpers ───────────────────────────────────────────────────────

async function callOpenAI(prompt: string): Promise<string> {
    if (!openaiKey) throw new Error('OpenAI API key not configured');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 1200,
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`OpenAI error: ${err.error?.message || res.statusText}`);
    }
    return (await res.json()).choices[0].message.content;
}

async function callGemini(prompt: string): Promise<string> {
    if (!genAI) throw new Error('Gemini not configured');
    for (const modelName of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
        try {
            const model  = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text   = result.response.text();
            if (text) return text;
        } catch { /* try next */ }
    }
    throw new Error('All Gemini models failed');
}

async function generateFeedback(prompt: string): Promise<string> {
    if (openaiKey) {
        try { return await callOpenAI(prompt); } catch (e) {
            console.warn('OpenAI failed, trying Gemini:', e);
        }
    }
    if (geminiKey) return await callGemini(prompt);
    throw new Error('No AI service configured');
}

// ── Strict JSON extractor — throws if invalid ────────────────────────

function extractJSON(raw: string): Record<string, unknown> {
    const clean = raw
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
    // Try the whole string first, then find the first {...} block
    const attempts = [clean, (clean.match(/\{[\s\S]*\}/) || [])[0] ?? ''];
    for (const attempt of attempts) {
        try { return JSON.parse(attempt); } catch { /* next */ }
    }
    throw new Error('AI did not return valid JSON');
}

// ── Route ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const { transcript, eyeContact, config, duration, userId } = await req.json();

        if (!transcript || !config) {
            return NextResponse.json(
                { error: 'transcript and config are required' },
                { status: 400 }
            );
        }
        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required to save interview results' },
                { status: 400 }
            );
        }
        if (!openaiKey && !geminiKey) {
            return NextResponse.json(
                { error: 'No AI service configured on the server' },
                { status: 500 }
            );
        }

        // ── Credit check ─────────────────────────────────────────────
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('credits')
            .eq('user_id', userId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentCredits = userData.credits ?? 0;
        if (currentCredits < 10) {
            return NextResponse.json(
                { error: 'Insufficient credits. You need 10 credits to process interview feedback.' },
                { status: 403 }
            );
        }

        await supabaseAdmin
            .from('users')
            .update({ credits: currentCredits - 10 })
            .eq('user_id', userId);

        // ── Build transcript string ───────────────────────────────────
        const transcriptText = (transcript as Array<{ speaker: string; text: string }>)
            .map(t => `${t.speaker}: ${t.text}`)
            .join('\n');

        const eyePct = eyeContact?.percentage?.toFixed(1) ?? '0';

        // ── AI prompt — requests EXACTLY the Analysis shape ──────────
        const prompt = `You are an expert technical interviewer. Analyze this interview and return structured feedback.

Role: ${config.role} (${config.experience} level)
Tech Stack: ${config.techStack}
Duration: ${Math.round((duration || 0) / 60)} minutes
Eye Contact: ${eyePct}%

Transcript:
${transcriptText}

Return ONLY a valid JSON object with this exact structure — no markdown, no extra text:
{
  "technicalScore": <integer 0-10>,
  "communicationScore": <integer 0-10>,
  "summary": "<2-3 sentences summarising overall performance>",
  "eyeContactFeedback": "<1-2 sentences specifically about eye contact and presence>",
  "eyeContactCategory": "<exactly one of: Excellent | Good | Fair | Needs Improvement>",
  "greeting": "<verbatim or paraphrased opening words the candidate used>",
  "readiness": "<1 sentence: how well-prepared the candidate appeared>",
  "confidence": "<1 sentence: candidate's confidence level and delivery>",
  "strengths": ["<specific strength>", "<specific strength>", "<specific strength>"],
  "improvements": ["<specific area to improve>", "<specific area to improve>", "<specific area to improve>"]
}`;

        // ── Generate & parse ──────────────────────────────────────────
        const raw  = await generateFeedback(prompt);
        const data = extractJSON(raw);

        // Validate required numeric fields
        const technicalScore    = Number(data.technicalScore);
        const communicationScore = Number(data.communicationScore);

        if (isNaN(technicalScore) || isNaN(communicationScore)) {
            return NextResponse.json(
                { error: 'AI returned invalid scores — please try again' },
                { status: 500 }
            );
        }

        const strengths   = Array.isArray(data.strengths)   ? (data.strengths   as string[]) : [];
        const improvements = Array.isArray(data.improvements) ? (data.improvements as string[]) : [];

        // ── Build analysis payload (matches Analysis interface) ───────
        const analysisPayload = {
            eyeContactScore:   Number(eyePct),
            overallAssessment: String(data.summary || ''),
            engagementAnalysis: {
                notes:      `Strengths: ${strengths.join(', ')}. Improvements: ${improvements.join(', ')}`,
                greeting:   String(data.greeting   || ''),
                readiness:  String(data.readiness  || ''),
                confidence: String(data.confidence || ''),
            },
            eyeContactCategory:   String(data.eyeContactCategory || ''),
            eyeContactExplanation: String(data.eyeContactFeedback || ''),
            detailed_scores: {
                technical:     technicalScore,
                communication: communicationScore,
            },
        };

        // rating 0-5 = average of both 0-10 scores / 2
        const rating = Math.min(5, Math.max(0, (technicalScore + communicationScore) / 4));

        // ── Save to mock_interviews — hard fail if this fails ─────────
        const { data: saved, error: saveError } = await supabaseAdmin
            .from('mock_interviews')
            .insert({
                student_id:     userId,
                scheduled_date: new Date().toISOString(),
                feedback:       String(data.summary || ''),
                rating,
                analysis:       analysisPayload,
            })
            .select('id')
            .single();

        if (saveError || !saved) {
            console.error('mock_interviews save error:', saveError);
            return NextResponse.json(
                { error: 'Failed to save interview results to database', details: saveError?.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success:  true,
            feedback: { interviewId: saved.id },
        });

    } catch (error: unknown) {
        console.error('Interview feedback error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

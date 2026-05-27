import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { RoadmapInput, RoadmapStructure } from "@/types/roadmap";

export const runtime = 'nodejs';

async function callAI(prompt: string): Promise<{ text: string; provider: string }> {
  // 1. Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content || '';
      if (text) return { text, provider: 'OpenAI' };
    } catch (err: any) {
      console.error('OpenAI error, falling back to Gemini:', err.message);
    }
  }

  // 2. Fallback: Gemini 1.5 Flash
  const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return { text, provider: 'Gemini' };
    } catch (err: any) {
      console.error('Gemini Flash error:', err.message);
    }
  }

  throw new Error('All AI providers failed. Please check your API keys.');
}


// Extract JSON from AI response
function extractJSON(text: string): RoadmapStructure | null {
  try {
    // Look for JSON code block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to find JSON object directly
    const objectMatch = text.match(/\{[\s\S]*"overview"[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
  } catch (error) {
    console.error("Failed to extract JSON:", error);
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RoadmapInput;

    // Validation
    if (!body || !body.goal || !body.roadmap_type || !body.skill_level || !body.duration) {
      return NextResponse.json(
        { error: "Missing required fields: goal, skill_level, duration, roadmap_type" },
        { status: 400 }
      );
    }

    // Load project README
    const projectReadmePath = path.join(process.cwd(), "README.md");
    let readmeContent = "";
    try {
      readmeContent = readFileSync(projectReadmePath, { encoding: "utf-8" });
    } catch {
      console.warn("README.md not found, continuing without project context");
    }

    // Build and send prompt to AI
    const prompt = buildPrompt(body, readmeContent);
    const { text: aiText, provider: aiProvider } = await callAI(prompt);

    if (!aiText || aiText.trim().length === 0) {
      return NextResponse.json({ error: "Failed to generate roadmap content" }, { status: 500 });
    }

    // Extract structured JSON data
    const structuredData = extractJSON(aiText);

    // Prepare metadata
    const metadata = {
      goal: body.goal,
      skill_level: body.skill_level,
      duration: body.duration,
      roadmap_type: body.roadmap_type,
      extra_preferences: body.extra_preferences || null,
      generated_at: new Date().toISOString(),
      ai_provider: aiProvider,
      has_structured_data: !!structuredData,
    };

    // Save to Supabase
    try {
      const supabase = supabaseAdmin;
      const insertPayload = {
        user_id: body.user_id || null,
        query: `${body.goal} - ${body.roadmap_type}`,
        ai_response: aiText,
        context_type: "roadmap",
        metadata,
      };

      const { error } = await supabase.from("ai_mentor_logs").insert(insertPayload);

      if (error) {
        console.error("Supabase insert warning (continuing):", error.message);
      }
    } catch (supabaseErr) {
      console.error("Supabase connection warning:", supabaseErr);
      // Continue - don't fail the response if Supabase fails
    }

    return NextResponse.json({
      ai_response: aiText,
      structured_data: structuredData,
      metadata,
    });
  } catch (err) {
    console.error("API Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function buildPrompt(body: RoadmapInput, readmeContent: string): string {
  const lines: string[] = [];

  lines.push(
    "You are an expert AI mentor and roadmap architect specializing in developer learning paths and career progression."
  );
  lines.push("");
  lines.push("=== USER REQUEST ===");
  lines.push(`Goal: ${body.goal}`);
  lines.push(`Skill Level: ${body.skill_level}`);
  lines.push(`Duration: ${body.duration}`);
  lines.push(`Roadmap Type: ${body.roadmap_type}`);

  if (body.extra_preferences) {
    lines.push(`Additional Preferences: ${body.extra_preferences}`);
  }

  lines.push("");
  lines.push("=== PROJECT CONTEXT ===");
  if (readmeContent) {
    lines.push(readmeContent.slice(0, 8000));
  } else {
    lines.push("No project context available.");
  }

  lines.push("");
  lines.push("=== OUTPUT FORMAT ===");
  lines.push("Generate a comprehensive roadmap in TWO parts:");
  lines.push("");
  lines.push("PART 1: JSON Structure (wrapped in ```json code block)");
  lines.push("Provide a structured JSON object with this exact schema:");
  lines.push(JSON.stringify({
    overview: {
      summary: "Brief summary of the learning journey",
      totalWeeks: 12,
      keyMilestones: ["milestone 1", "milestone 2"]
    },
    phases: [
      {
        title: "Foundation Phase",
        weeks: "Week 1-4",
        weekStart: 1,
        weekEnd: 4,
        description: "What this phase covers",
        topics: ["topic 1", "topic 2", "topic 3"]
      }
    ],
    weeks: [
      {
        week: 1,
        title: "Week 1: Getting Started",
        topics: ["specific topic 1", "specific topic 2"],
        timeAllocation: "10 hours per week",
        resources: ["resource 1", "resource 2"],
        practicalTasks: ["task 1", "task 2"]
      }
    ],
    milestones: [
      {
        week: 4,
        title: "Complete Foundation",
        description: "What to achieve",
        criteria: ["criterion 1", "criterion 2"]
      }
    ],
    resources: [
      {
        title: "Resource name",
        type: "documentation",
        url: "https://example.com",
        description: "Brief description"
      }
    ],
    assessmentCheckpoints: [
      {
        week: 4,
        title: "Foundation Assessment",
        criteria: ["what to validate"]
      }
    ]
  }, null, 2));
  lines.push("");
  lines.push("PART 2: Detailed Markdown Explanation");
  lines.push("After the JSON, provide a detailed markdown explanation with:");
  lines.push("");
  lines.push("1. OVERVIEW");
  lines.push("   - Brief summary of the learning journey");
  lines.push("   - Key milestones for this duration");
  lines.push("");
  lines.push("2. PHASES");
  lines.push("   - Foundational Phase (weeks 1-X)");
  lines.push("   - Intermediate Phase (weeks X-Y)");
  lines.push("   - Advanced Phase (weeks Y-end)");
  lines.push("");
  lines.push("3. WEEKLY BREAKDOWN");
  lines.push("   - Weekly topics and learning outcomes");
  lines.push("   - Time allocation per topic");
  lines.push("   - Resources (documentation, tutorials, articles)");
  lines.push("");
  lines.push("4. PRACTICAL TASKS");
  lines.push("   - Mini-projects and hands-on exercises");
  lines.push("   - Integration points with platform features (IDE, Quizzes, Mock Interviews, ATS)");
  lines.push("");
  lines.push("5. ASSESSMENT CHECKPOINTS");
  lines.push("   - Key milestones to validate progress");
  lines.push("   - Self-assessment criteria");
  lines.push("");
  lines.push("6. RESOURCES & TOOLS");
  lines.push("   - Recommended learning platforms");
  lines.push("   - Books, courses, and documentation");
  lines.push("   - Community and networking opportunities");
  lines.push("");
  lines.push("IMPORTANT: Start your response with the JSON in a ```json code block, then follow with the markdown explanation.");

  return lines.join("\n");
}

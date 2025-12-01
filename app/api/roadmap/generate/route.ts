import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { RoadmapInput } from "@/types/roadmap";

// Initialize AI providers
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || 'AIzaSyDLGMBHuZqJOo34xdm4ceujuqAcI0T_sGs');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});

async function callAI(prompt: string): Promise<{ text: string; provider: string }> {
  let text = '';
  let usedProvider = '';

  // Try OpenAI first
  if (openai.apiKey) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
      });
      text = completion.choices[0]?.message?.content || "";
      usedProvider = 'OpenAI';
    } catch (error) {
      console.error("OpenAI error:", error);
      // Will fall through to Gemini
    }
  }

  // Fallback to Gemini if OpenAI failed or unavailable
  if (!text) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response;
      text = response.text();
      usedProvider = 'Gemini';
    } catch (error) {
      console.error("Gemini error:", error);
      throw new Error("Both OpenAI and Gemini failed to generate content");
    }
  }

  if (!text) {
    throw new Error("No AI provider returned output");
  }

  return { text, provider: usedProvider };
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

    // Prepare metadata
    const metadata = {
      goal: body.goal,
      skill_level: body.skill_level,
      duration: body.duration,
      roadmap_type: body.roadmap_type,
      extra_preferences: body.extra_preferences || null,
      generated_at: new Date().toISOString(),
      ai_provider: aiProvider,
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
  lines.push("=== ROADMAP STRUCTURE ===");
  lines.push("Generate a detailed, actionable roadmap with:");
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
  lines.push("Format output in clean Markdown with clear sections, bullet points, and emphasis on actionability.");

  return lines.join("\n");
}
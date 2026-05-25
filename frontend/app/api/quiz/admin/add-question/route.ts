// src/app/api/quiz/admin/add-question/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, choices, correct_answer, difficulty, category } = body;
    if (!question) return NextResponse.json({ error: "question required" }, { status: 400 });

    const rec = {
      source: "admin",
      question,
      choices: Array.isArray(choices) ? choices : (choices ? choices : []),
      correct_answer: correct_answer ?? null,
      difficulty: difficulty ?? null,
      category: category ?? null,
      metadata: { createdBy: "admin" }
    };

    const { data, error } = await supabaseAdmin.from("questions").insert([rec]).select().single();
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ question: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

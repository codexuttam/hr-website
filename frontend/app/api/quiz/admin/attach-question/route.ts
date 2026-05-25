// src/app/api/quiz/admin/attach-question/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId, questionId, position } = body;
    if (!quizId || !questionId) return NextResponse.json({ error: "quizId & questionId required" }, { status: 400 });

    // find max position to append if not provided
    const { data: maxData } = await supabaseAdmin
      .from("quiz_questions")
      .select("position")
      .eq("quiz_id", quizId)
      .order("position", { ascending: false })
      .limit(1);

    const nextPos = position ?? (maxData && maxData.length ? (maxData[0].position || 0) + 1 : 1);

    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .insert([{ quiz_id: quizId, question_id: questionId, position: nextPos }])
      .select()
      .single();

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ mapping: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

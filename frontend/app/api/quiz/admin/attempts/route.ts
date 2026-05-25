// src/app/api/quiz/admin/attempts/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const quizId = Number(url.searchParams.get("quizId"));
    if (!quizId) return NextResponse.json({ error: "quizId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

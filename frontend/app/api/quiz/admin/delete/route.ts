// src/app/api/quiz/admin/delete/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId } = body;
    if (!quizId) return NextResponse.json({ error: "quizId required" }, { status: 400 });

    // delete quiz_questions mapping, attempts, leaderboard handled by FK cascade if configured,
    // but to be safe we'll delete child rows explicitly if cascade not configured.
    
    // First get attempt IDs for this quiz
    const { data: attemptIds } = await supabaseAdmin
      .from("attempts")
      .select("attempt_id")
      .eq("quiz_id", quizId);
    
    // Delete attempt answers if there are attempts
    if (attemptIds && attemptIds.length > 0) {
      const ids = attemptIds.map((a: { attempt_id: number }) => a.attempt_id);
      await supabaseAdmin.from("attempt_answers").delete().in("attempt_id", ids);
    }
    
    // Delete other related records
    await supabaseAdmin.from("quiz_questions").delete().eq("quiz_id", quizId);
    await supabaseAdmin.from("attempts").delete().eq("quiz_id", quizId);
    await supabaseAdmin.from("leaderboard").delete().eq("quiz_id", quizId);

    const { error } = await supabaseAdmin.from("quizzes").delete().eq("quiz_id", quizId);
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

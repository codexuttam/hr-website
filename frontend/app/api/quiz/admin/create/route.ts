// src/app/api/quiz/admin/create/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body;
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .insert([{ title, description }])
      .select()
      .single();

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ quiz: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

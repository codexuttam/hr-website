import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tokenResponse = await fetch("https://api.vapi.ai/v1/token/web", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.json({ error: errorText }, { status: tokenResponse.status });
    }

    const data = await tokenResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
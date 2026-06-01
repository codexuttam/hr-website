import { NextRequest, NextResponse } from 'next/server';

const CODE_SERVER_URL = process.env.CODE_SERVER_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

async function proxy(req: NextRequest, params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const search = req.nextUrl.search;
  const upstream = `${CODE_SERVER_URL}/api/${path.join('/')}${search}`;
  console.log('[proxy] upstream:', upstream);

  const init: RequestInit = {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(60_000),
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }

  const res = await fetch(upstream, init);
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try { return await proxy(req, ctx.params); }
  catch (err: any) { 
    console.error('[proxy GET error]', err);
    return NextResponse.json({ error: err.message }, { status: 502 }); 
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try { return await proxy(req, ctx.params); }
  catch (err: any) { return NextResponse.json({ error: err.message }, { status: 502 }); }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try { return await proxy(req, ctx.params); }
  catch (err: any) { return NextResponse.json({ error: err.message }, { status: 502 }); }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  try { return await proxy(req, ctx.params); }
  catch (err: any) { return NextResponse.json({ error: err.message }, { status: 502 }); }
}
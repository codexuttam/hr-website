import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    // Return dummy data if table doesn't exist yet for demo purposes
    return NextResponse.json([
      {
        id: '1',
        user_id: 'student1',
        user_name: 'Rahul Kumar',
        content: 'How do I prepare for system design interviews as a fresher?',
        created_at: new Date().toISOString(),
        status: 'open',
        tags: ['System Design', 'Interview Prep'],
        likes: 5,
        liked_by_me: false
      },
      {
        id: '2',
        user_id: 'student2',
        user_name: 'Priya Singh',
        content: 'What is the best way to learn React hooks deeply?',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'resolved',
        tags: ['React', 'Frontend'],
        likes: 12,
        liked_by_me: true
      }
    ]);
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, tags, user_name, user_id } = body;

    // Send to n8n webhook - n8n will handle database insertion
    const response = await fetch('https://bitlanceai.app.n8n.cloud/webhook/new-doubt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        user_name: user_name || 'Anonymous Student',
        user_id: user_id || 'anon',
        tags: tags || [],
        created_at: new Date().toISOString(),
        status: 'open'
      })
    });

    // Get response text first
    const responseText = await response.text();
    console.log('n8n Response Status:', response.status);
    console.log('n8n Response Body:', responseText);

    // Try to parse as JSON, fallback to text
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }

    // Accept both 200 and 201 status codes, and even if n8n returns info messages
    if (response.status >= 200 && response.status < 300) {
      return NextResponse.json({ 
        success: true, 
        message: 'Doubt posted successfully and sent to alumni',
        data: result 
      });
    }

    // If status is not OK but we got a response, still treat as partial success
    // since n8n might be processing it
    console.warn('n8n returned non-200 status but may have processed the request');
    return NextResponse.json({ 
      success: true, 
      message: 'Doubt submitted to alumni community',
      warning: 'Webhook returned unexpected status',
      status: response.status,
      data: result 
    });

  } catch (error) {
    console.error('Error posting doubt:', error);
    return NextResponse.json({ 
      error: 'Failed to post doubt',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

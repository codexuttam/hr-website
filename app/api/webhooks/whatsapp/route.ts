import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { post_id, sender_name, message, sender_phone } = body;

    if (!post_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // 1. Save the reply to the database
    const { data, error } = await supabase
      .from('community_replies')
      .insert([
        {
          post_id,
          user_name: sender_name || 'Alumni',
          content: message,
          source: 'whatsapp',
          is_alumni: true,
          // You might want to store sender_phone if you have a private column for it
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving WhatsApp reply:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. (Optional) Update post status or notify the student
    // await supabase.from('community_posts').update({ status: 'answered' }).eq('id', post_id);

    return NextResponse.json({ success: true, reply: data });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { postId: string } }) {
  const supabase = supabaseAdmin;
  const { postId } = params;

  const { data, error } = await supabase
    .from('community_replies')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching replies:', error);
    // Dummy data for demo
    if (postId === '1') {
      return NextResponse.json([
        {
          id: 'r1',
          post_id: '1',
          user_name: 'Amit (Alumni - Google)',
          content: 'Focus on low-level design first. Learn design patterns and practice standard problems like Parking Lot, Snake and Ladder.',
          created_at: new Date().toISOString(),
          source: 'whatsapp',
          is_alumni: true
        }
      ]);
    }
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}

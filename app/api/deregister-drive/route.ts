import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Use admin client to bypass RLS
const sb = supabaseAdmin || supabase;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { drive_id, user_id } = body;

        // Validate required fields
        if (!drive_id || !user_id) {
            return NextResponse.json(
                { error: 'Missing required fields: drive_id and user_id are required' },
                { status: 400 }
            );
        }

        console.log('[Deregister Drive API] Attempting to deregister:', { drive_id, user_id });

        // Delete the application
        const { error } = await sb
            .from('drive_applications')
            .delete()
            .eq('drive_id', drive_id)
            .eq('user_id', user_id);

        if (error) {
            console.error('[Deregister Drive API] Delete error:', error);
            return NextResponse.json(
                { error: `Failed to deregister from drive: ${error.message}` },
                { status: 500 }
            );
        }

        console.log('[Deregister Drive API] Successfully deregistered');
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Deregister Drive API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

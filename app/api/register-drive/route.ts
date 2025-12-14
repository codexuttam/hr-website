import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Use admin client to bypass RLS
const sb = supabaseAdmin || supabase;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { drive_id, user_id, status } = body;

        // Validate required fields
        if (!drive_id || !user_id) {
            return NextResponse.json(
                { error: 'Missing required fields: drive_id and user_id are required' },
                { status: 400 }
            );
        }

        console.log('[Register Drive API] Attempting to register:', { drive_id, user_id, status });

        // Check if already registered
        const { data: existingApplication, error: checkError } = await sb
            .from('drive_applications')
            .select('id')
            .eq('drive_id', drive_id)
            .eq('user_id', user_id)
            .maybeSingle();

        if (checkError) {
            console.error('[Register Drive API] Check error:', checkError);
            return NextResponse.json(
                { error: `Failed to check existing application: ${checkError.message}` },
                { status: 500 }
            );
        }

        if (existingApplication) {
            console.log('[Register Drive API] User already registered for this drive');
            return NextResponse.json(
                { error: 'You have already registered for this drive', alreadyRegistered: true },
                { status: 409 }
            );
        }

        // Insert new application
        const { data, error } = await sb
            .from('drive_applications')
            .insert([
                {
                    drive_id: drive_id,
                    user_id: user_id,
                    resume_link: '',
                    cover_letter: '',
                    status: status || 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('[Register Drive API] Insert error:', error);
            return NextResponse.json(
                { error: `Failed to register for drive: ${error.message}` },
                { status: 500 }
            );
        }

        console.log('[Register Drive API] Successfully registered:', data);
        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('[Register Drive API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

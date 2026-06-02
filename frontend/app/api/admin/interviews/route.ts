import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('mock_interviews')
            .select(`
                *,
                users:student_id (
                    user_id,
                    name,
                    email
                )
            `)
            .order('scheduled_date', { ascending: false });

        if (error) {
            console.error('Error fetching interviews:', error);
            throw error;
        }

        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error('Admin interviews API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

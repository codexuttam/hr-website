import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Use supabaseAdmin to bypass RLS, filtering by userId
        const { data, error } = await supabaseAdmin
            .from('mock_interviews')
            .select('*')
            .eq('student_id', userId)
            .order('scheduled_date', { ascending: false });

        if (error) {
            console.error('Error fetching interview history:', error);
            throw error;
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Server error fetching history:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

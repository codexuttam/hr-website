import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Use supabaseAdmin to bypass RLS, but strictly filter by userId
        const { data, error } = await supabaseAdmin
            .from('mock_interviews')
            .select('*')
            .eq('id', id)
            .eq('student_id', userId)
            .single();

        if (error) {
            console.error('Error fetching interview result:', error);
            if (error.code === 'PGRST116') {
                 return NextResponse.json(
                    { error: 'Interview not found' },
                    { status: 404 }
                 );
            }
            throw error;
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Server error fetching interview:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

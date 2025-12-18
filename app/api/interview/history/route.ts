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

        // Determine if userId is a UUID or numeric ID
        let numericUserId: number | null = null;
        
        // Check if it's a valid integer
        const parsedId = parseInt(userId);
        if (!isNaN(parsedId) && String(parsedId) === userId) {
            // It's already a numeric ID
            numericUserId = parsedId;
        } else {
            // It's likely a UUID - look up the numeric user_id
            const { data: userData, error: userError } = await supabaseAdmin
                .from('users')
                .select('user_id')
                .eq('user_uid', userId)
                .maybeSingle();

            if (userData?.user_id) {
                numericUserId = userData.user_id;
            } else {
                // Fallback: try to find by checking if email matches (if userId looks like email)
                // For now, just use the UUID approach for mock_interviews if stored that way
                console.log('User not found by user_uid, checking if interviews stored by UUID...');
                
                // Check if any interviews exist with this UUID as student_id
                const { data: directData, error: directError } = await supabaseAdmin
                    .from('mock_interviews')
                    .select('*')
                    .eq('student_id', userId)
                    .order('scheduled_date', { ascending: false });

                // This will fail if student_id is integer type, but if it's text it might work
                if (!directError && directData && directData.length > 0) {
                    return NextResponse.json(directData);
                }
            }
        }

        if (!numericUserId) {
            console.log('Could not resolve numeric user ID for:', userId);
            return NextResponse.json([]);
        }

        // Use supabaseAdmin to bypass RLS, filtering by numeric userId
        const { data, error } = await supabaseAdmin
            .from('mock_interviews')
            .select('*')
            .eq('student_id', numericUserId)
            .order('scheduled_date', { ascending: false });

        if (error) {
            console.error('Error fetching interview history:', error);
            throw error;
        }

        return NextResponse.json(data || []);

    } catch (error: any) {
        console.error('Server error fetching history:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

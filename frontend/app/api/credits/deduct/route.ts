import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { userId, amount = 10, action } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('credits')
            .eq('user_id', userId)
            .single();

        if (!userData) {
             return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentCredits = userData.credits ?? 0;
        if (currentCredits < amount) {
             return NextResponse.json(
                { error: `Insufficient credits. You need ${amount} credits.` },
                { status: 403 }
            );
        }
        
        // Deduct credits
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ credits: currentCredits - amount })
            .eq('user_id', userId);

        if (updateError) {
             console.error('Credit update failed:', updateError);
             console.error('Has Service Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
             return NextResponse.json({ error: `Failed to update credits: ${updateError.message}` }, { status: 500 });
        }

        console.log(`Deducted ${amount} credits from user ${userId} for ${action}. Remaining: ${currentCredits - amount}`);

        return NextResponse.json({ success: true, remaining: currentCredits - amount });

    } catch (error) {
        console.error('Credit deduction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

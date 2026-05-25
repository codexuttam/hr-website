import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Helper to select the best client (admin if available for RLS bypass, otherwise standard)
const sb = supabaseAdmin || supabase;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        
        const driveId = formData.get('drive_id') as string;
        const userId = formData.get('user_id') as string;
        const file = formData.get('Upload your CV') as File;
        
        // Extract other fields for Webhook
        const payload: Record<string, any> = {};
        formData.forEach((value, key) => {
            if (key !== 'Upload your CV' && key !== 'drive_id' && key !== 'user_id') {
                payload[key] = value;
            }
        });

        let resumeUrl = '';

        // 1. Upload File to Supabase Storage if present
        if (file && userId && driveId) {
            const timestamp = Date.now();
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `resumes/${driveId}/${userId}_${timestamp}_${cleanFileName}`;

            const { data: uploadData, error: uploadError } = await sb.storage
                .from('resumes') // Make sure this bucket exists
                .upload(filePath, file);

            if (uploadError) {
                console.error('Storage Upload Error:', uploadError);
                // We continue even if upload fails? No, critical.
                throw new Error(`Failed to upload resume: ${uploadError.message}`);
            }

            // Get Public URL
            const { data: { publicUrl } } = sb.storage
                .from('resumes')
                .getPublicUrl(filePath);
            
            resumeUrl = publicUrl;
            payload['resume_link'] = resumeUrl;
        }

        // 2. Update Database (drive_applications)
        if (userId && driveId) {
            const { error: dbError } = await sb
                .from('drive_applications')
                .update({ 
                    resume_link: resumeUrl,
                    status: 'applied', // Update status
                    // We might not have columns for phone/exp, so we skip them unless we know they exist.
                })
                .eq('drive_id', driveId)
                .eq('user_id', userId);

            if (dbError) {
                console.error('Database Update Error:', dbError);
                 // If the application doesn't exist, we might want to insert it?
                 // But logic says it should exist from previous step.
                 // If it fails, we log but still try to send to webhook?
                 // Let's treat DB error as non-fatal for webhook if possible, but fatal for user response?
                 // No, consistency is important.
                 throw new Error(`Failed to save application to database: ${dbError.message}`);
            }
        }

        // 3. Send to N8N Webhook
        const n8nUrl = 'https://bitlanceai.app.n8n.cloud/webhook/job-application';
        
        // Include IDs in payload
        payload['drive_id'] = driveId;
        payload['user_id'] = userId;

        const webhookResponse = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!webhookResponse.ok) {
            console.error('N8N Webhook Error:', await webhookResponse.text());
            // We don't fail the user request just because webhook failed, if DB save was success.
            // But we warn.
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Submit Application Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

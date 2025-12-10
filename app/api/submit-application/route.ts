import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        
        // Forward the request to n8n
        // We need to reconstruct the FormData or just send it as is?
        // fetch accepts FormData directly in body.
        
        const n8nUrl = 'https://bitlanceai.app.n8n.cloud/webhook/job-application';
        
        const response = await fetch(n8nUrl, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header manually when using FormData, 
            // fetch will set it with the boundary.
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('n8n Error:', text);
            return NextResponse.json(
                { error: `Failed to submit to external service: ${response.statusText}` },
                { status: response.status }
            );
        }

        // n8n might return HTML or text or JSON.
        // We'll just return success to our client.
        return NextResponse.json({ success: true });
        
    } catch (error: any) {
        console.error('Proxy Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File is too large. Maximum size is 10 MB.' },
                { status: 400 }
            );
        }

        const name = file.name.toLowerCase();
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        let text = '';

        if (name.endsWith('.pdf')) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { PDFParse } = require('pdf-parse') as { PDFParse: (buf: Buffer) => Promise<{ text: string }> };
            const result = await PDFParse(buffer);
            text = result.text;
        } else if (name.endsWith('.docx')) {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (name.endsWith('.doc')) {
            // mammoth has partial .doc support
            try {
                const mammoth = await import('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;
            } catch {
                return NextResponse.json(
                    { error: 'Old .doc format could not be parsed. Please save as .docx or .pdf and try again.' },
                    { status: 422 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Unsupported format. Please upload a PDF, DOC, or DOCX file.' },
                { status: 400 }
            );
        }

        text = text.trim();

        if (!text) {
            return NextResponse.json(
                { error: 'No text could be extracted. The file may be image-based or password-protected.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ success: true, text });

    } catch (error) {
        console.error('Resume parse error:', error);
        return NextResponse.json(
            { error: 'Failed to parse file. Please try a different format.' },
            { status: 500 }
        );
    }
}

import OpenAI from 'openai';

/**
 * Creates an OpenAI client at call-time (never at module load / build time).
 * Call this INSIDE your API handler, not at the top of the file.
 */
function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing environment variable: OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

export async function callOpenAI(prompt: string): Promise<string> {
  const client = createOpenAIClient();

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});

export async function callOpenAI(prompt: string): Promise<string> {
  if (!openai.apiKey) {
    console.error("Missing OpenAI API Key");
    throw new Error("OpenAI API Key is missing");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { CoreMessage } from 'ai';
import { rateLimiter } from '@/lib/rateLimiter';

export const maxDuration = 30;
export const runtime = 'edge';

// Generate a user identifier (in production, use proper session/auth)
function getUserId(req: Request): string {
  // Try to get user identifier from headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'anonymous';
  
  // You can also use session ID or user authentication here
  // const sessionId = req.headers.get('x-session-id');
  
  return ip;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = getUserId(req);

    console.log('Request from user:', userId);

    if (!body?.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'messages' array missing." }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check rate limits
    const rateLimitCheck = rateLimiter.checkRateLimit(userId);
    if (!rateLimitCheck.allowed) {
      const usage = rateLimiter.getUsage(userId);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded",
          message: `You've reached your request limit. Please try again in ${rateLimitCheck.retryAfter} seconds.`,
          usage: {
            requestsThisMinute: usage.minute,
            requestsThisHour: usage.hour,
            limits: {
              perMinute: 10,
              perHour: 50
            }
          }
        }),
        { 
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": rateLimitCheck.retryAfter?.toString() || "60"
          }
        }
      );
    }

    // Get the last user message for caching
    const userMessages = body.messages.filter((m: any) => m.role === 'user');
    const lastUserMessage = userMessages.length > 0 
      ? userMessages[userMessages.length - 1]?.content || ''
      : '';

    console.log('Last user message for cache:', lastUserMessage.substring(0, 50) + '...');

    // Check cache for similar queries (only if there's a user message)
    if (lastUserMessage) {
      const cachedResponse = rateLimiter.getCachedResponse(lastUserMessage);
      if (cachedResponse) {
        console.log('✅ Returning cached response, length:', cachedResponse.length);
        
        // Return cached response as a stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(cachedResponse));
            controller.close();
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Cache-Hit': 'true'
          }
        });
      }
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Record the request
    rateLimiter.recordRequest(userId);

    // Format messages correctly for AI SDK
    const formattedMessages: CoreMessage[] = body.messages.map((msg: any) => {
      const role = msg.role === 'user' ? 'user' : 'assistant';
      const content = msg.content || '';
      
      return {
        role,
        content
      } as CoreMessage;
    });

    console.log('Formatted messages:', formattedMessages.length);

    // Use OpenAI model with correct message format
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: formattedMessages,
      temperature: 0.7,
      system: `You are EduMate — an advanced AI Career Mentor & Placement Counselor.

Your Objectives:
- Guide students on career development, placement preparation, and academic planning.
- Offer insights on resume improvement, interview strategies, communication skills.
- Answer ANY questions the user asks - technical, career-related, general knowledge, or personal advice.
- Provide accurate, helpful information on a wide range of topics including:
  * Programming and software development
  * Data structures and algorithms
  * Computer science concepts
  * Career guidance and job search strategies
  * Interview preparation and tips
  * General knowledge and explanations
  * Study plans and learning resources
  * Personal development and soft skills
- Maintain an empathetic, motivating, and professional tone.

IMPORTANT FORMATTING RULES:
- NEVER use markdown formatting (no **, *, #, etc.)
- Use plain text only
- For emphasis, use CAPS or simple indentation
- For lists, use simple bullets (•) or numbers followed by a period
- For sections, use blank lines to separate topics
- Keep responses clear and well-structured without special characters

Operational Context:
- Part of the "Campus Career Intelligence System".
- The user is a student seeking guidance, but may ask questions on any topic.
- You have broad knowledge and can help with diverse questions.

Constraints:
- Do NOT complete assignments or solve test questions meant for evaluation.
- Explain concepts and provide guidance instead of direct solutions when academic integrity may be compromised.
- If a query lacks clarity, politely ask for more details.
- Be honest if you don't know something and suggest where to find information.

Your responses must be:
- Helpful and informative
- Student-friendly and engaging
- Actionable with practical advice
- Well-structured and easy to follow
- Adaptable to any topic the user asks about
- Written in PLAIN TEXT without any markdown formatting`,
    });

    console.log('Stream created successfully');

    // Collect the full response for caching
    const fullResponseChunks: string[] = [];
    const originalStream = result.toTextStreamResponse();
    const reader = originalStream.body?.getReader();

    if (!reader) {
      return originalStream;
    }

    // Create a new stream that caches while streaming
    const cachedStream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullResponseChunks.push(chunk);
            controller.enqueue(value);
          }
          
          // Cache the complete response
          const fullResponse = fullResponseChunks.join('');
          if (lastUserMessage && fullResponse) {
            rateLimiter.cacheResponse(lastUserMessage, fullResponse);
            console.log('✅ Response cached successfully');
          }
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(cachedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Cache-Hit': 'false'
      }
    });

  } catch (error: any) {
    console.error("EduMate API Error:", error);
    console.error("Error stack:", error?.stack);

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
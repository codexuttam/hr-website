export const interviewer = {
  model: {
    provider: "openai" as const,
    model: "gpt-4o-mini" as const,           // ⬅️ 90% cheaper than gpt-3.5
    messages: [
      {
        role: "system" as const,
        content: "You are an AI interviewer conducting a professional job interview."
      }
    ],
    temperature: 0.6,               // slightly lower = fewer rambling tokens
    maxTokens: 250,                 // ⬅️ reduced from 500 → 50% cheaper
  },

  voice: {
    provider: "11labs" as const,
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    stability: 0.3,                 // ⬅️ lower stability = fewer costly adjustments
    similarityBoost: 0.5,           // ⬅️ cheaper voice inference
    style: 0.15,
  },

  firstMessage: "Hello! Welcome to your interview today.",

  transcriber: {
    provider: "deepgram" as const,
    model: "nova-2-general" as const,        // ⬅️ cheaper model
    language: "en-US" as const,
  },

  recordingEnabled: false,          // ⬅️ disable unless absolutely needed (saves $$)
  endCallMessage: "Thank you for your time today.",
  maxDurationSeconds: 900,          // ⬅️ cap interview at 15 minutes instead of 30
};


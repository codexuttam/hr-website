# Adding Gemini API Key

## Steps to Add Your Gemini API Key:

1. **Get your Gemini API Key:**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

2. **Add to your `.env.local` file:**
   Open your `.env.local` file and add this line:
   ```
   NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_gemini_api_key_here
   ```

3. **Restart your development server:**
   - Stop the current `npm run dev` process (Ctrl+C)
   - Run `npm run dev` again

## How It Works:

The roadmap generator now supports **both OpenAI and Gemini** with automatic fallback:

1. **Primary**: Tries OpenAI first (if `OPENAI_API_KEY` is set)
2. **Fallback**: If OpenAI fails or is unavailable, automatically uses Gemini
3. **Error Handling**: Only fails if both providers are unavailable

## Benefits:

✅ **Reliability**: If one API is down, the other takes over
✅ **Cost Optimization**: Use Gemini as a free alternative to OpenAI
✅ **Flexibility**: Can switch between providers seamlessly
✅ **Transparency**: The metadata shows which AI provider was used

## Environment Variables Needed:

```env
# OpenAI (Optional - will fallback to Gemini if not set)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...

# Gemini (Required for fallback)
NEXT_PUBLIC_GOOGLE_AI_API_KEY=AIza...
```

## Testing:

After adding the Gemini API key, test the roadmap generator at:
http://localhost:3000/games/roadmap

The system will automatically choose the best available AI provider!

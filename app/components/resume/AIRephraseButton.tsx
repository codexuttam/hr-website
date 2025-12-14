import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIRephraseButtonProps {
  text: string;
  section: string;
  onApply: (newText: string) => void;
}

// API Keys
const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

const AIRephraseButton: React.FC<AIRephraseButtonProps> = ({ text, section, onApply }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Call OpenAI
  const callOpenAI = async (prompt: string): Promise<string> => {
    if (!openaiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Call Gemini
  const callGemini = async (prompt: string): Promise<string> => {
    if (!geminiKey) throw new Error('Gemini API key not configured');

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  };

  const generateSuggestions = async () => {
    if (!text || text.trim().length < 10) {
      setError('Please enter at least 10 characters to get AI suggestions');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    const prompt = `You are a professional resume writer. Rephrase the following ${section} section text to make it more professional, impactful, and ATS-friendly. Provide 3 different variations. Keep the same meaning but improve clarity, use action verbs, and quantify achievements where possible.

Original text: "${text}"

Provide 3 rephrased versions, each on a new line, numbered 1-3.`;

    try {
      let generatedText = '';

      // Try OpenAI first
      if (openaiKey) {
        try {
          console.log('Attempting OpenAI for AI Rephrase...');
          generatedText = await callOpenAI(prompt);
          console.log('OpenAI succeeded for AI Rephrase');
        } catch (err) {
          console.warn('OpenAI failed, falling back to Gemini:', err);
        }
      }

      // Fallback to Gemini
      if (!generatedText && geminiKey) {
        try {
          console.log('Attempting Gemini for AI Rephrase...');
          generatedText = await callGemini(prompt);
          console.log('Gemini succeeded for AI Rephrase');
        } catch (err) {
          console.error('Gemini also failed:', err);
          throw err;
        }
      }

      if (!generatedText) {
        throw new Error('No AI service available. Please configure NEXT_PUBLIC_OPENAI_API_KEY or NEXT_PUBLIC_GOOGLE_AI_API_KEY');
      }

      console.log('Generated text:', generatedText);

      // Parse the numbered suggestions
      const lines = generatedText.split('\n').filter((line: string) => line.trim());
      const parsedSuggestions = lines
        .filter((line: string) => /^\d+[.)]/.test(line.trim()))
        .map((line: string) => line.replace(/^\d+[.)]/, '').trim())
        .filter((s: string) => s.length > 0);

      if (parsedSuggestions.length === 0) {
        // Fallback: split by newlines if no numbered format
        const fallbackSuggestions = lines.slice(0, 3).filter((s: string) => s.length > 10);
        setSuggestions(fallbackSuggestions.length > 0 ? fallbackSuggestions : [generatedText.trim()]);
      } else {
        setSuggestions(parsedSuggestions.slice(0, 3));
      }

      setShowSuggestions(true);
    } catch (err) {
      console.error('AI Rephrase Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate suggestions';
      setError(`${errorMessage}. Please check your API keys in .env.local`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (suggestion: string) => {
    onApply(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={generateSuggestions}
        disabled={isLoading || !text}
        className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>AI Rephrase</span>
          </>
        )}
      </button>

      {error && (
        <div className="absolute z-10 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg text-sm text-red-600 w-80">
          {error}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-2 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">AI Suggestions</h4>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-purple-50 dark:bg-slate-700 rounded-lg border border-purple-200 dark:border-slate-600"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {suggestion}
                </p>
                <button
                  onClick={() => handleApply(suggestion)}
                  className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Use This
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRephraseButton;

import React, { useState } from 'react';
import { ResumeData } from '../types/resume';
import { generateAISuggestions, Suggestion, KeywordRecommendation, FormattingTip } from '../api/aiSuggestionsApi';

interface SuggestionsData {
  overallScore: number;
  suggestions: Suggestion[];
  keywordRecommendations: KeywordRecommendation[];
  formattingTips: FormattingTip[];
}

interface AISuggestionsProps {
  resumeData: ResumeData;
  onApplySuggestion: (section: keyof ResumeData, newValue: string) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ resumeData, onApplySuggestion }) => {
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateAISuggestions(resumeData);

      if (response.success && response.data) {
        setSuggestions({
          overallScore: response.data.overallScore,
          suggestions: response.data.suggestions,
          keywordRecommendations: response.data.keywordRecommendations,
          formattingTips: response.data.formattingTips
        });
      } else {
        // Fallback for development/testing
        setSuggestions({
          overallScore: 75,
          suggestions: [
            {
              id: 'mock-1',
              section: 'summary' as any,
              type: 'content',
              priority: 'high',
              title: 'Improve Professional Summary',
              description: 'Your summary could be more impactful with specific achievements.',
              currentText: resumeData.objective || '',
              suggestedText: 'Results-driven professional with proven track record of delivering high-quality solutions and exceeding performance targets.',
              reasoning: 'Adding quantifiable achievements makes your summary more compelling to recruiters.',
              confidence: 85
            }
          ],
          keywordRecommendations: [
            {
              keyword: 'Leadership',
              section: 'experience',
              importance: 'high' as any,
              context: 'Important for senior roles',
              industryRelevance: 90
            }
          ],
          formattingTips: [
            {
              tip: 'Use bullet points for better readability',
              section: 'experience',
              impact: 'Improves ATS parsing and human readability',
              priority: 'medium' as any,
              category: 'structure' as any
            }
          ]
        });
      }
    } catch (err) {
      console.error('AI Suggestions error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');

      // Fallback
      setSuggestions({
        overallScore: 65,
        suggestions: [
          {
            id: 'fallback-1',
            section: 'summary' as any,
            type: 'content',
            priority: 'medium',
            title: 'AI Service Unavailable',
            description: 'Using fallback suggestions for development.',
            currentText: '',
            suggestedText: 'Consider adding more specific achievements and metrics to your resume.',
            reasoning: 'This is a fallback suggestion while the AI service is being set up.',
            confidence: 50
          }
        ],
        keywordRecommendations: [],
        formattingTips: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    // Map 'summary' to 'objective' as per our ResumeData type
    if (suggestion.section === 'summary' || suggestion.section === 'objective') {
      onApplySuggestion('objective', suggestion.suggestedText);
      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    } else {
      // For complex sections like experience/education, we can't easily auto-apply
      // because they are arrays of objects.
      // Instead, we'll copy to clipboard.
      navigator.clipboard.writeText(suggestion.suggestedText);
      alert('Suggestion copied to clipboard! Please paste it in the relevant field.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keyword': return '🔍';
      case 'formatting': return '📝';
      case 'content': return '✨';
      case 'structure': return '🏗️';
      default: return '💡';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          🤖 AI Resume Suggestions
        </h2>
        <button
          onClick={handleGenerateSuggestions}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg shrink-0">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      {suggestions ? (
        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Resume Score
              </span>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {suggestions.overallScore}
                </span>
                <span className="text-gray-600 dark:text-gray-300 ml-1 text-sm">/100</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${suggestions.overallScore}%` }}
              ></div>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                Improvements
              </h3>
              <div className="space-y-3">
                {suggestions.suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`border rounded-lg p-3 ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                        <div>
                          <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                          <span className="text-[10px] uppercase font-bold opacity-75">
                            {suggestion.section} • {suggestion.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs mb-2 opacity-90">{suggestion.description}</p>

                    <div className="space-y-2 mb-3">
                      {suggestion.currentText && (
                        <div className="text-xs bg-white/50 dark:bg-black/20 p-2 rounded">
                          <span className="font-semibold opacity-70 block mb-0.5">Current:</span>
                          <span className="italic">"{suggestion.currentText}"</span>
                        </div>
                      )}
                      <div className="text-xs bg-white dark:bg-slate-700 p-2 rounded border border-black/5 dark:border-white/10">
                        <span className="font-semibold opacity-70 block mb-0.5">Suggested:</span>
                        <span>"{suggestion.suggestedText}"</span>
                      </div>
                    </div>

                    <button
                      onClick={() => applySuggestion(suggestion)}
                      disabled={appliedSuggestions.has(suggestion.id)}
                      className={`w-full py-1.5 rounded text-xs font-medium transition-colors ${appliedSuggestions.has(suggestion.id)
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                        }`}
                    >
                      {appliedSuggestions.has(suggestion.id) ? '✓ Applied' : (
                        suggestion.section === 'summary' || suggestion.section === 'objective'
                          ? 'Apply Suggestion'
                          : 'Copy to Clipboard'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Recommendations */}
          {suggestions.keywordRecommendations.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.keywordRecommendations.map((keyword, index) => (
                  <div key={index} className="bg-blue-50 dark:bg-slate-700 px-2 py-1.5 rounded text-xs border border-blue-100 dark:border-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-blue-900 dark:text-blue-300">
                        {keyword.keyword}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${keyword.importance === 'high' ? 'bg-red-500' :
                          keyword.importance === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                        }`}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 opacity-60">
          <div className="text-5xl mb-4">✨</div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            AI Analysis Ready
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click "Analyze" to get personalized suggestions for your resume.
          </p>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
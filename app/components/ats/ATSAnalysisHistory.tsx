'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseATSService } from '../../services/supabaseATSService';

interface AnalysisHistoryItem {
  id: number;
  overall_score: number;
  created_at: string;
  analysis_data: any;
  suggestions: any;
  detailed_feedback: string;
  model_version: string;
}

const ATSAnalysisHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);

  useEffect(() => {
    if (user?.user_id) {
      loadAnalysisHistory();
    }
  }, [user]);

  const loadAnalysisHistory = async () => {
    try {
      setLoading(true);
      const historyData = await SupabaseATSService.getAnalysisHistory(Number(user!.user_id), 20);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading analysis history...</span>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis History</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analysis History</h4>
          <p className="text-gray-600 dark:text-gray-400">
            Your ATS analysis results will appear here after you analyze resumes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analysis History ({history.length})
        </h3>

        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => setSelectedAnalysis(selectedAnalysis?.id === item.id ? null : item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(item.overall_score)}`}>
                    <span className={getScoreColor(item.overall_score)}>
                      {item.overall_score}%
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ATS Analysis
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.created_at)} • {item.model_version}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 dark:text-gray-500">
                  {selectedAnalysis?.id === item.id ? '▼' : '▶'}
                </div>
              </div>

              {selectedAnalysis?.id === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {item.analysis_data?.keyword_analysis && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {item.analysis_data.keyword_analysis.keyword_density}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Keyword Match</div>
                      </div>
                    )}
                    {item.analysis_data?.content_analysis && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {item.analysis_data.content_analysis.readability_score}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Readability</div>
                      </div>
                    )}
                    {item.analysis_data?.structure_analysis && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                          {item.analysis_data.structure_analysis.format_score}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">Format</div>
                      </div>
                    )}
                  </div>

                  {item.suggestions && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Suggestions:</h5>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {item.suggestions.high_priority && item.suggestions.high_priority.length > 0 && (
                          <div className="mb-2">
                            <span className="font-medium text-red-600 dark:text-red-400">High Priority:</span>
                            <ul className="list-disc list-inside ml-4">
                              {item.suggestions.high_priority.map((suggestion: string, index: number) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {item.detailed_feedback && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">AI Feedback:</h5>
                      <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <pre className="whitespace-pre-wrap font-sans">
                          {item.detailed_feedback.substring(0, 500)}
                          {item.detailed_feedback.length > 500 && '...'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ATSAnalysisHistory;
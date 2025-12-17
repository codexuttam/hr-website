import React, { useState, useEffect } from 'react';
import { ATSResultService, ATSResult, getScoreColor, getScoreBadgeColor } from '@/backend/services/atsResultService';
import { useAuth } from '../../contexts/AuthContext';

interface ATSResultHistoryProps {
  resumeId?: number;
  onSelectResult?: (result: ATSResult) => void;
}

const ATSResultHistory: React.FC<ATSResultHistoryProps> = ({ resumeId, onSelectResult }) => {
  const [results, setResults] = useState<ATSResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadResults();
  }, [user, resumeId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ATSResultService.listATSResults(
        resumeId,
        user?.user_id ? Number(user.user_id) : undefined
      );
      setResults(response.atsResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ATS results');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ATSResultService.deleteATSResult(id);
      setResults(prev => prev.filter(result => result.ats_id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ATS result');
    }
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

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading ATS results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          <h3 className="text-red-800 font-medium">Error Loading ATS Results</h3>
        </div>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <button
          onClick={loadResults}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ATS Analysis History</h2>
          <p className="text-gray-600 mt-1">
            {results.length} {results.length === 1 ? 'analysis' : 'analyses'} found
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ATS analyses yet</h3>
          <p className="text-gray-600 mb-6">Run your first ATS analysis to see results here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.ats_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {result.resumes?.resume_name || `Resume ${result.resume_id}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreBadgeColor(result.overall_score)}`}>
                        {result.overall_score}% ATS Score
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Analyzed on {formatDate(result.created_at)}
                    </p>
                    <p className="text-sm text-gray-700">
                      {truncateText(result.job_description)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {result.matching_keywords.length}
                    </div>
                    <div className="text-xs text-gray-600">Matching Keywords</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">
                      {result.missing_keywords.length}
                    </div>
                    <div className="text-xs text-gray-600">Missing Keywords</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {result.analysis_data?.readability_score || 'N/A'}%
                    </div>
                    <div className="text-xs text-gray-600">Readability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">
                      {result.analysis_data?.format_score || 'N/A'}%
                    </div>
                    <div className="text-xs text-gray-600">Format</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {onSelectResult && (
                    <button
                      onClick={() => onSelectResult(result)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(result.ats_id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete ATS Analysis
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ATS analysis? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSResultHistory;
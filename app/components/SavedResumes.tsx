import React, { useState, useEffect } from 'react';
import { ResumeService, SavedResume } from '@/backend/services/resumeService';
import { useAuth } from '../contexts/AuthContext';

interface SavedResumesProps {
  onLoadResume?: (resume: SavedResume) => void;
  onCreateNew?: () => void;
}

const SavedResumes: React.FC<SavedResumesProps> = ({ onLoadResume, onCreateNew }) => {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ResumeService.listResumes(user?.user_id?.toString());
      setResumes(response.resumes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ResumeService.deleteResume(id);
      setResumes(prev => prev.filter(resume => resume.resume_id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume');
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

  const getTemplateNames = () => [
    'Professional with Photo',
    'Modern Executive',
    'Minimal Professional',
    'Creative Designer',
    'Executive Premium',
    'Tech Professional',
    'Academic Scholar',
    'Designer Portfolio',
    'Startup Dynamic',
    'Corporate Standard'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading your resumes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          <h3 className="text-red-800 dark:text-red-300 font-medium">Error Loading Resumes</h3>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm mb-4">{error}</p>
        <button
          onClick={loadResumes}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Resumes</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} saved
          </p>
        </div>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            + Create New Resume
          </button>
        )}
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resumes yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Create your first resume to get started</p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Your First Resume
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.resume_id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {resume.resume_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {getTemplateNames()[resume.template_id] || `Template ${resume.template_id + 1}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {resume.color_scheme && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: resume.color_scheme.primary }}
                        title="Color scheme"
                      />
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div>Created: {formatDate(resume.created_at)}</div>
                  <div>Updated: {formatDate(resume.updated_at)}</div>
                </div>

                <div className="flex gap-2">
                  {onLoadResume && (
                    <button
                      onClick={() => onLoadResume(resume)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Open
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(resume.resume_id)}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Resume
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this resume? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
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

export default SavedResumes;
'use client';
import { useRouter } from 'next/navigation';
import SavedResumes from '../components/SavedResumes';
import { SavedResume } from '../services/resumeService';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const MyResumesPage: React.FC = () => {
  const router = useRouter();

  const handleLoadResume = (resume: SavedResume) => {
    // Navigate to resume builder with the loaded resume data
    // We'll need to pass the resume data through URL params or state
    router.push(`/resume-builder?resumeId=${resume.resume_id}`);
  };

  const handleCreateNew = () => {
    router.push('/resume-builder');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-8">
          <SavedResumes 
            onLoadResume={handleLoadResume}
            onCreateNew={handleCreateNew}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyResumesPage;
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResumeBuilder from '../../pages/ResumeBuilder';
import TemplateSelection from '../../pages/TemplateSelection';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ResumeService } from '@/backend/services/resumeService';

function ResumeBuilderContent() {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [showTemplateSelection, setShowTemplateSelection] = useState<boolean>(true);
  const [loadingResume, setLoadingResume] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');

  useEffect(() => {
    if (resumeId) {
      loadExistingResume(resumeId);
    }
  }, [resumeId]);

  const loadExistingResume = async (id: string) => {
    try {
      setLoadingResume(true);
      const resume = await ResumeService.getResume(parseInt(id));
      if (resume) {
        // Set the template from the loaded resume
        setSelectedTemplate(resume.template_id || 0);
        // Skip template selection and go directly to the builder
        setShowTemplateSelection(false);
      }
    } catch (error) {
      console.error('Failed to load resume:', error);
      // If loading fails, show template selection
      setShowTemplateSelection(true);
    } finally {
      setLoadingResume(false);
    }
  };

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId);
    setShowTemplateSelection(false);
  };

  if (loadingResume) {
    return (
      <ProtectedRoute>
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
          <Header />
          <main className="min-h-screen flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-300">Loading your resume...</span>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
      <Header />
      <main>
        {showTemplateSelection ? (
          <TemplateSelection onTemplateSelect={handleTemplateSelect} />
        ) : (
          <ResumeBuilder
            selectedTemplate={selectedTemplate}
            onBackToTemplates={() => setShowTemplateSelection(true)}
            resumeId={resumeId ? parseInt(resumeId) : undefined}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-sans">
          <Header />
          <main className="min-h-screen flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-300">Loading...</span>
            </div>
          </main>
          <Footer />
        </div>
      }>
        <ResumeBuilderContent />
      </Suspense>
    </ProtectedRoute>
  );
}

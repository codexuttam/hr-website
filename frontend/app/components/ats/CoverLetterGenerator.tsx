import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { get, post } from '../../utils/api';

interface Resume {
  resume_id: number;
  resume_name: string;
  resume_data: any;
}

const CoverLetterGenerator: React.FC = () => {
  const { user } = useAuth();
  const [userResumes, setUserResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserResumes();
    }
  }, [user]);

  const loadUserResumes = async () => {
    try {
      const response = await get(`/api/database/users/${user?.user_id}/resumes`);
      if (response.success) {
        setUserResumes(response.data);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  const handleResumeSelect = (resumeId: number) => {
    setSelectedResumeId(resumeId);
    const resume = userResumes.find(r => r.resume_id === resumeId);
    if (resume?.resume_data?.resumeText) {
      setResumeText(resume.resume_data.resumeText);
    } else if (resume?.resume_data) {
      // Convert structured resume data to text
      const data = resume.resume_data;
      const text = `
${data.fullName || ''}
${data.email || ''} | ${data.phone || ''}

SUMMARY:
${data.summary || ''}

EXPERIENCE:
${data.experience || ''}

EDUCATION:
${data.education || ''}

SKILLS:
${data.skills || ''}
      `.trim();
      setResumeText(text);
    }
  };

  const generateCoverLetter = async () => {
    if (!resumeText || !jobDescription) {
      alert('Please provide both resume text and job description.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await post('/api/ats-analyzer/generate-cover-letter', {
        resumeText,
        jobDescription,
        temperature: 0.7,
        maxTokens: 1024
      });

      if (response.success) {
        let generatedLetter = response.coverLetter;
        
        // Customize with company and position if provided
        if (companyName) {
          generatedLetter = generatedLetter.replace(/\[Company Name\]/g, companyName);
        }
        if (positionTitle) {
          generatedLetter = generatedLetter.replace(/\[Position Title\]/g, positionTitle);
        }
        
        setCoverLetter(generatedLetter);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    alert('Cover letter copied to clipboard!');
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${companyName || 'job'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Cover Letter Generator</h1>
          <p className="text-gray-600">
            Generate personalized cover letters based on your resume and job requirements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Resume Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Resume</h3>
              
              {userResumes.length > 0 ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose from your resumes
                  </label>
                  <select
                    value={selectedResumeId || ''}
                    onChange={(e) => handleResumeSelect(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a resume...</option>
                    {userResumes.map((resume) => (
                      <option key={resume.resume_id} value={resume.resume_id}>
                        {resume.resume_name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-gray-500 mb-4">No resumes found. Create a resume first.</p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Text
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here or select from above..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                />
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                />
              </div>

              <button
                onClick={generateCoverLetter}
                disabled={!resumeText || !jobDescription || isGenerating}
                className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Cover Letter...
                  </span>
                ) : (
                  '✉️ Generate Cover Letter'
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generated Cover Letter</h3>
              {coverLetter && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    💾 Download
                  </button>
                </div>
              )}
            </div>

            {coverLetter ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {coverLetter}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-md text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">
                  Your generated cover letter will appear here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Fill in the resume and job description to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
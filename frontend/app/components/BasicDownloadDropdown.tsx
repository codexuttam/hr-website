import React, { useState, useRef, useEffect } from 'react';
import { generatePDF, generateDOC, printResume } from '../utils/documentGenerator';
import { ResumeData } from '../types/resume';

interface BasicDownloadDropdownProps {
  onDownloadPDF: () => void;
  isGeneratingPDF?: boolean;
  resumeData?: ResumeData;
  elementId?: string;
  filename?: string;
  className?: string;
}

const BasicDownloadDropdown: React.FC<BasicDownloadDropdownProps> = ({ 
  onDownloadPDF,
  isGeneratingPDF = false,
  resumeData,
  elementId = 'resume-preview', 
  filename = 'resume',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownload = async (format: 'pdf-server' | 'pdf-client' | 'doc' | 'print') => {
    setIsLoading(format);
    
    try {
      switch (format) {
        case 'pdf-server':
          await onDownloadPDF();
          break;
        case 'pdf-client':
          await generatePDF(elementId, filename);
          break;
        case 'doc':
          if (resumeData) {
            await generateDOC(resumeData, filename);
          } else {
            throw new Error('Resume data is required for DOC generation');
          }
          break;
        case 'print':
          printResume();
          break;
      }
      setIsOpen(false);
    } catch (error) {
      console.error(`Error generating ${format}:`, error);
      alert(`Failed to generate document. Please try again.`);
    } finally {
      setIsLoading(null);
    }
  };

  const downloadOptions = [
    {
      id: 'pdf-server',
      label: 'Download PDF (Server)',
      description: 'High-quality PDF from server',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-red-600',
    },
    {
      id: 'pdf-client',
      label: 'Download PDF (Client)',
      description: 'Generate PDF in browser',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-blue-600',
    },
    {
      id: 'doc',
      label: 'Download as DOC',
      description: 'Editable Word document',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-green-600',
    },
    {
      id: 'print',
      label: 'Print Resume',
      description: 'Open print dialog',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      ),
      color: 'text-gray-600',
    },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isGeneratingPDF || isLoading !== null}
        className={`w-full py-3 rounded-lg transition flex items-center justify-center ${
          isGeneratingPDF || isLoading !== null
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white`}
      >
        {isGeneratingPDF || isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isGeneratingPDF ? 'Generating PDF...' : `Generating ${isLoading?.toUpperCase()}...`}
          </>
        ) : (
          <>
            📄 Download Resume
            <svg className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {downloadOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleDownload(option.id as 'pdf-server' | 'pdf-client' | 'doc' | 'print')}
                disabled={isGeneratingPDF || isLoading !== null}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-start"
              >
                <div className={`${option.color} mr-3 mt-0.5`}>
                  {option.icon}
                </div>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicDownloadDropdown;
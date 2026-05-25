import React, { useState, useRef } from 'react';
import {
  AlertTriangle, CheckCircle2, Loader2, WifiOff, Save,
  FileText, BarChart2, Upload, Lightbulb, Target, XCircle,
  TrendingUp, Bot, ClipboardList, LayoutTemplate, ScanSearch,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ATSResultService, ATSResult as ATSResultType } from '@/backend/services/atsResultService';
import ATSResultHistory from './ATSResultHistory';
import { ResumeData } from '../../types/resume';


interface ATSResult {
  ats_id: number;
  overall_score: number;
  matching_keywords: string[];
  missing_keywords: string[];
  suggestions: string;
  job_description: string;
  created_at: string;
  analysis_data?: {
    full_analysis: string;
    keyword_density: number;
    readability_score: number;
    format_score: number;
    sections_analysis: {
      hasContactInfo: boolean;
      hasSummary: boolean;
      hasExperience: boolean;
      hasEducation: boolean;
      hasSkills: boolean;
    };
    hugging_face_analysis?: {
      content_analysis: {
        readability_score: number;
        professional_tone_score: number;
        action_verbs_count: number;
        quantified_achievements: number;
      };
      structure_analysis: {
        format_score: number;
        sections_completeness: number;
        length_appropriateness: number;
        bullet_point_usage: number;
      };
      industry_alignment: {
        score: number;
        relevant_skills: string[];
        trending_keywords: string[];
      };
      detailed_feedback: string;
    };
  };
}



const BANNER_CONFIG: Record<string, { icon: React.ReactNode; text: string; cls: string }> = {
  AI_UNAVAILABLE: {
    icon: <WifiOff className="h-4 w-4 shrink-0" />,
    text: 'Our AI service is currently unavailable. Please try again in a few minutes.',
    cls: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
  },
};

function getBannerProps(message: string) {
  if (BANNER_CONFIG[message]) return BANNER_CONFIG[message];
  if (message.includes('✅') || message.includes('completed'))
    return { icon: <CheckCircle2 className="h-4 w-4 shrink-0" />, text: message.replace(/^[^\w]+/, ''), cls: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' };
  if (message.includes('💾') || message.includes('Saving'))
    return { icon: <Save className="h-4 w-4 shrink-0" />, text: message.replace(/^[^\w]+/, ''), cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' };
  if (message.includes('🔄') || message.includes('Analyzing') || message.includes('Processing'))
    return { icon: <Loader2 className="h-4 w-4 shrink-0 animate-spin" />, text: message.replace(/^[^\w]+/, ''), cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' };
  return { icon: <AlertTriangle className="h-4 w-4 shrink-0" />, text: message.replace(/^[^\w]+/, ''), cls: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' };
}

const ProcessingBanner: React.FC<{ message: string }> = ({ message }) => {
  const { icon, text, cls } = getBannerProps(message);
  return (
    <div className={`mt-3 flex items-center gap-2 p-3 rounded-md text-sm ${cls}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

const ATSAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<ATSResult | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const handleSelectResult = (result: ATSResultType) => {
    setCurrentResult(result as ATSResult);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const [processingMessage, setProcessingMessage] = useState<string | null>(null);


  const handleFileUpload = async () => {
    if (!file) return;

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setProcessingMessage('❌ File size too large. Please upload a file smaller than 10MB.');
      setTimeout(() => setProcessingMessage(null), 5000);
      return;
    }

    // Basic file validation
    if (file.size === 0) {
      setProcessingMessage('❌ The selected file is empty. Please choose a valid resume file.');
      setTimeout(() => setProcessingMessage(null), 5000);
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('🔄 Processing your resume file...');

    try {
      console.log('Starting file processing for:', file.name);
      const extractedText = await extractTextFromFile(file);

      if (extractedText && extractedText.trim().length > 0) {
        setResumeText(extractedText);
        const wordCount = extractedText.trim().split(/\s+/).length;
        setProcessingMessage(`✅ Resume text extracted successfully! Found ${extractedText.length} characters (≈${wordCount} words). You can now analyze it against a job description.`);
        // Clear the message after 7 seconds
        setTimeout(() => setProcessingMessage(null), 7000);
      } else {
        setProcessingMessage('⚠️ Could not extract text from the file or the file appears to be empty. Please try pasting your resume text manually.');
        setTimeout(() => setProcessingMessage(null), 8000);
      }
    } catch (error) {
      console.error('Error processing resume:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setProcessingMessage(`❌ ${errorMessage}`);
      setTimeout(() => setProcessingMessage(null), 10000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to extract text from uploaded files
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    console.log('File details:', { name: fileName, type: fileType, size: file.size });

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        try {
          return await extractTextFromPDF(file);
        } catch (pdfError) {
          console.error('Primary PDF extraction failed:', pdfError);
          // Try fallback method
          return await extractTextFromPDFFallback(file);
        }
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        return await extractTextFromDOCX(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await file.text();
      } else {
        throw new Error(`Unsupported file type: ${fileType || 'unknown'}. Please upload a PDF, DOCX, or TXT file.`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw error;
    }
  };

  // Fallback PDF extraction method with simpler configuration
  const extractTextFromPDFFallback = async (file: File): Promise<string> => {
    console.log('Trying fallback PDF extraction method...');

    try {
      const pdfjsLib = await import('pdfjs-dist');

      // For pdfjs-dist v5.x, use unpkg which has correct file structure
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();

      // Simpler PDF loading configuration
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
      }).promise;

      let fullText = '';

      // Try to extract text from first few pages only to avoid timeout
      const maxPages = Math.min(pdf.numPages, 5);

      for (let i = 1; i <= maxPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          if (textContent?.items) {
            const pageText = textContent.items
              .map((item: any) => item?.str || '')
              .filter((text: string) => text.trim())
              .join(' ');

            if (pageText.trim()) {
              fullText += pageText + '\n';
            }
          }
        } catch (pageError) {
          console.warn(`Fallback: Could not process page ${i}:`, pageError);
          // Continue with other pages
        }
      }

      if (fullText.trim().length === 0) {
        throw new Error('No readable text found in PDF using fallback method.');
      }

      console.log('Fallback PDF extraction successful');
      return fullText.trim();
    } catch (error) {
      console.error('Fallback PDF extraction also failed:', error);
      throw new Error('Both primary and fallback PDF extraction methods failed. This PDF might be scanned (image-only), password-protected, or corrupted. Please copy and paste your resume text manually.');
    }
  };

  // Validate if file is actually a PDF by checking header
  const validatePDFFile = async (file: File): Promise<boolean> => {
    try {
      const arrayBuffer = await file.slice(0, 8).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = Array.from(uint8Array).map(b => String.fromCharCode(b)).join('');
      return header.startsWith('%PDF');
    } catch {
      return false;
    }
  };

  // Extract text from PDF using PDF.js (client-side)
  const extractTextFromPDF = async (file: File): Promise<string> => {
    console.log('Starting PDF text extraction for file:', file.name, 'Size:', file.size);

    // Validate PDF header
    const isValidPDF = await validatePDFFile(file);
    if (!isValidPDF) {
      throw new Error('File does not appear to be a valid PDF. Please check the file format.');
    }

    try {
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      console.log('PDF.js library loaded, version:', pdfjsLib.version);

      // Set worker source for pdfjs-dist v5.x
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        // Use unpkg which has correct file structure for v5.x
        const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        console.log('Setting PDF.js worker source:', workerSrc);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      }

      console.log('Converting file to array buffer...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('Array buffer created, size:', arrayBuffer.byteLength);

      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
      });

      // Add timeout for PDF loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('PDF loading timeout')), 30000);
      });

      const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
      console.log('PDF loaded successfully, pages:', pdf.numPages);

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}/${pdf.numPages}...`);
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          if (textContent && textContent.items && textContent.items.length > 0) {
            const pageText = textContent.items
              .map((item: any) => {
                // Handle different item types
                if (typeof item === 'string') return item;
                if (item && typeof item.str === 'string') return item.str;
                if (item && typeof item.text === 'string') return item.text;
                return '';
              })
              .filter((text: string) => text.trim().length > 0)
              .join(' ');

            if (pageText.trim()) {
              fullText += pageText + '\n';
              console.log(`Page ${i} extracted ${pageText.length} characters`);
            } else {
              console.log(`Page ${i} appears to be empty or contains only images`);
            }
          } else {
            console.log(`Page ${i} has no text content (might be image-only)`);
          }
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          // Continue with other pages
        }
      }

      const finalText = fullText.trim();
      console.log('PDF text extraction completed. Total characters:', finalText.length);

      if (finalText.length === 0) {
        throw new Error('No text found in PDF. This might be a scanned PDF (image-only) or the PDF is corrupted.');
      }

      return finalText;
    } catch (error) {
      console.error('PDF extraction error details:', error);

      if (error instanceof Error) {
        // More specific error messages based on the error type
        if (error.message.includes('Invalid PDF')) {
          throw new Error('Invalid PDF file. The file might be corrupted or not a valid PDF.');
        } else if (error.message.includes('No text found')) {
          throw error; // Re-throw our custom message
        } else if (error.message.includes('Cannot read properties')) {
          throw new Error('PDF processing library failed to load. Please refresh the page and try again.');
        } else if (error.message.includes('timeout')) {
          throw new Error('PDF processing timed out. The file might be too large or complex. Please try a smaller file or paste the text manually.');
        } else if (error.message.includes('Loading')) {
          throw new Error('Failed to load PDF. The file might be corrupted or password-protected.');
        } else if (error.message.includes('Worker')) {
          throw new Error('PDF processing worker failed to load. Please check your internet connection and try again.');
        }
      }

      throw new Error('Failed to extract text from PDF. Please try copying and pasting your resume text manually.');
    }
  };

  // Extract text from DOCX using mammoth.js (client-side)
  const extractTextFromDOCX = async (file: File): Promise<string> => {
    console.log('Starting DOCX text extraction for file:', file.name);

    try {
      // Dynamic import to avoid SSR issues
      const mammoth = await import('mammoth');
      console.log('Mammoth library loaded successfully');

      const arrayBuffer = await file.arrayBuffer();
      console.log('DOCX file converted to array buffer, size:', arrayBuffer.byteLength);

      const result = await mammoth.extractRawText({ arrayBuffer });

      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX extraction warnings:', result.messages);
        // Check for critical errors in messages
        const errors = result.messages.filter(msg => msg.type === 'error');
        if (errors.length > 0) {
          console.error('DOCX extraction errors:', errors);
        }
      }

      const extractedText = result.value.trim();
      console.log('DOCX text extraction completed. Characters:', extractedText.length);

      if (extractedText.length === 0) {
        throw new Error('No text found in DOCX file. The document might be empty or contain only images.');
      }

      return extractedText;
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);

      if (error instanceof Error) {
        if (error.message.includes('Cannot read properties')) {
          throw new Error('DOCX processing library failed to load. Please refresh the page and try again.');
        } else if (error.message.includes('No text found')) {
          throw error; // Re-throw our custom message
        } else if (error.message.includes('Invalid')) {
          throw new Error('Invalid DOCX file. The file might be corrupted or not a valid Word document.');
        }
      }

      throw new Error('Failed to extract text from DOCX. The file might be corrupted, password-protected, or in an unsupported format. Please try copying and pasting your resume text manually.');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      alert('Please provide both resume text and job description.');
      return;
    }

    setIsAnalyzing(true);
    setProcessingMessage('🔄 Analyzing your resume against the job description...');

    try {
      let result: ATSResult;

      try {
        result = await analyzeResumeServerSide(resumeText, jobDescription);
      } catch (serverError) {
        setIsAnalyzing(false);
        setProcessingMessage('AI_UNAVAILABLE');
        setTimeout(() => setProcessingMessage(null), 8000);
        return;
      }

      setCurrentResult(result);

      setProcessingMessage('💾 Saving analysis results...');

      // Save result to database if user is authenticated
      if (user?.user_id) {
        try {
          // Skip resume saving for now to avoid foreign key constraint issues
          // We'll save the ATS result directly instead
          console.log('Skipping temporary resume creation to avoid foreign key issues...');

          // Create a minimal resume data structure for ATS result saving
          const tempResumeData: ResumeData = {
            contact: {
              name: "ATS Analysis Resume",
              position: "Analyzed Resume",
              photoUrl: "",
              phone: "",
              email: "",
              linkedin: "",
              github: "",
              address: "",
            },
            objective: "",
            skills: [],
            tools: [],
            languages: [],
            interests: [],
            education: [],
            experience: [],
            certifications: [],
            references: [],
          };

          // Create a temporary resume first to satisfy foreign key constraint
          console.log('Creating temporary resume for ATS analysis...');

          const resumePayload = {
            resumeData: tempResumeData,
            templateId: 1,
            colorScheme: 'blue',
            userId: user.user_id,
            title: `ATS Analysis - ${new Date().toLocaleDateString()}`
          };

          const resumeResponse = await fetch('/api/resumes/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumePayload)
          });

          if (!resumeResponse.ok) {
            throw new Error('Failed to create temporary resume');
          }

          const resumeResult = await resumeResponse.json();

          if (!resumeResult.success) {
            throw new Error(resumeResult.error || 'Failed to create resume');
          }

          const resumeId = resumeResult.resume.resume_id;

          console.log('Saving ATS result with resume ID:', resumeId);

          const atsResultData = {
            resumeId: resumeId,
            jobDescription,
            matchingKeywords: result.matching_keywords,
            missingKeywords: result.missing_keywords,
            overallScore: result.overall_score,
            suggestions: result.suggestions,
            analysisData: result.analysis_data,
            userId: Number(user.user_id)
          };
          console.log('ATS result data to save:', atsResultData);

          const savedResult = await ATSResultService.saveATSResult(atsResultData);
          console.log('ATS result saved successfully:', savedResult);

          setProcessingMessage('✅ Analysis completed and saved to your history!');
        } catch (saveError) {
          console.error('Failed to save ATS result:', saveError);
          // Show a non-intrusive message to the user
          setProcessingMessage('⚠️ Analysis completed but could not save to history. Results are still available below.');
          setTimeout(() => setProcessingMessage(null), 5000);
        }
      } else {
        console.log('User not authenticated, skipping ATS result save');
      }

      setActiveTab('results');

      // Clear processing message after showing results
      setTimeout(() => setProcessingMessage(null), 3000);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setProcessingMessage(`❌ Failed to analyze resume: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => setProcessingMessage(null), 8000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Server-side ATS analysis function to avoid CORS issues
  const analyzeResumeServerSide = async (resumeText: string, jobDescription: string): Promise<ATSResult> => {
    try {
      console.log('Starting server-side ATS analysis...');

      const response = await fetch('/api/ats-analyzer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          userId: user?.user_id
        }),
      });

      if (!response.ok) {
        throw new Error(`Server analysis failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Server analysis returned error');
      }

      // Convert server response to ATSResult format
      const serverResult = data.atsResult;
      return {
        ats_id: Date.now(),
        overall_score: serverResult.overall_score,
        matching_keywords: serverResult.matching_keywords || [],
        missing_keywords: serverResult.missing_keywords || [],
        suggestions: serverResult.suggestions || 'No specific suggestions available.',
        job_description: jobDescription,
        created_at: new Date().toISOString(),
        analysis_data: {
          keyword_density: serverResult.analysis_data?.keyword_density || 0,
          readability_score: serverResult.analysis_data?.readability_score || 80,
          format_score: serverResult.analysis_data?.format_score || 75,
          full_analysis: serverResult.analysis_data?.full_analysis || 'Analysis completed successfully.',
          sections_analysis: {
            hasContactInfo: /email|phone|linkedin|github/i.test(resumeText),
            hasSummary: /summary|objective|profile/i.test(resumeText),
            hasExperience: /experience|work|employment|job/i.test(resumeText),
            hasEducation: /education|degree|university|college/i.test(resumeText),
            hasSkills: /skills|technologies|tools|proficient/i.test(resumeText)
          }
        }
      };
    } catch (error) {
      console.error('Server-side analysis failed:', error);
      throw error;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ResumeATS AI Analyzer</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analyze your resume with AI and get a detailed report.
          </p>
        </div>



        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <FileText className="h-4 w-4" /> Analyze Resume
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'results'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            <BarChart2 className="h-4 w-4" /> View Results
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resume Input</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload a file or paste your resume text below. Your analysis will be automatically saved to your history.
              </p>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resume File (PDF, DOCX, or TXT)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      // Clear any previous resume text when a new file is selected
                      if (selectedFile && resumeText) {
                        const shouldClear = confirm('A new file was selected. Do you want to replace the current resume text?');
                        if (shouldClear) {
                          setResumeText('');
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {file && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                  <button
                    onClick={handleFileUpload}
                    disabled={!file || isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing Resume...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Upload className="h-4 w-4" /> Process Resume File
                      </span>
                    )}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: PDF, DOCX, TXT (Max 10MB)
                  <br />
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Lightbulb className="h-3 w-3 shrink-0" /> Tip: If PDF processing fails, try converting your PDF to text first or copy-paste the content manually.
                  </span>
                </div>
                {processingMessage && <ProcessingBanner message={processingMessage} />}
              </div>



              {/* Resume Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resume Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here or upload a file above to extract text automatically..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Required for analysis. Include your complete resume content for best results.
                </div>
              </div>
            </div>

            {/* Job Description Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description you want to analyze your resume against..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Required for analysis. Include the complete job posting for accurate keyword matching.
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!resumeText || !jobDescription || isAnalyzing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Resume...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ScanSearch className="h-4 w-4" /> Analyze Resume
                  </span>
                )}
              </button>

              {processingMessage && <ProcessingBanner message={processingMessage} />}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* History List */}
            <ATSResultHistory onSelectResult={handleSelectResult} />

            {/* Detail View */}
            {currentResult && (
            <div ref={detailRef} className="space-y-6">
            {/* Score Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ATS Analysis Results</h3>
                <div className={`px-4 py-2 rounded-full ${getScoreBgColor(currentResult.overall_score)}`}>
                  <span className={`text-2xl font-bold ${getScoreColor(currentResult.overall_score)}`}>
                    {currentResult.overall_score}%
                  </span>
                </div>
              </div>

              {/* Detailed Scores */}
              {currentResult.analysis_data && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {Math.round(currentResult.analysis_data.keyword_density)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Keyword Match</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                      {Math.round(currentResult.analysis_data.readability_score)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Readability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                      {Math.round(currentResult.analysis_data.format_score)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Format</div>
                  </div>
                  {currentResult.analysis_data.hugging_face_analysis && (
                    <div className="text-center">
                      <div className="text-xl font-semibold text-orange-600 dark:text-orange-400">
                        {currentResult.analysis_data.hugging_face_analysis.industry_alignment.score}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Industry Match</div>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced AI Insights */}
              {currentResult.analysis_data?.hugging_face_analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><Target className="h-4 w-4" /> Content Quality</h4>
                    <div className="space-y-1 text-sm">
                      <div>Professional Tone: {currentResult.analysis_data.hugging_face_analysis.content_analysis.professional_tone_score}%</div>
                      <div>Action Verbs: {currentResult.analysis_data.hugging_face_analysis.content_analysis.action_verbs_count}</div>
                      <div>Quantified Results: {currentResult.analysis_data.hugging_face_analysis.content_analysis.quantified_achievements}</div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2"><LayoutTemplate className="h-4 w-4" /> Structure Quality</h4>
                    <div className="space-y-1 text-sm">
                      <div>Sections Complete: {currentResult.analysis_data.hugging_face_analysis.structure_analysis.sections_completeness}%</div>
                      <div>Length Score: {currentResult.analysis_data.hugging_face_analysis.structure_analysis.length_appropriateness}%</div>
                      <div>Bullet Points: {currentResult.analysis_data.hugging_face_analysis.structure_analysis.bullet_point_usage}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Keywords Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Matching Keywords */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Matching Keywords ({currentResult.matching_keywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentResult.matching_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5" /> Missing Keywords ({currentResult.missing_keywords.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentResult.missing_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2"><Lightbulb className="h-5 w-5" /> Suggestions for Improvement</h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentResult.suggestions}</p>
              </div>
            </div>

            {/* Industry Alignment */}
            {currentResult.analysis_data?.hugging_face_analysis?.industry_alignment && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Target className="h-5 w-5" /> Industry Alignment</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Relevant Skills Found</h5>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.analysis_data.hugging_face_analysis.industry_alignment.relevant_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Trending Keywords</h5>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.analysis_data.hugging_face_analysis.industry_alignment.trending_keywords.map((keyword, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Detailed Feedback */}
            {currentResult.analysis_data?.hugging_face_analysis?.detailed_feedback && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Bot className="h-5 w-5" /> AI Detailed Feedback</h4>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-md">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {currentResult.analysis_data.hugging_face_analysis.detailed_feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Full Analysis */}
            {currentResult.analysis_data?.full_analysis && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Complete Analysis Report</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {currentResult.analysis_data.full_analysis}
                  </pre>
                </div>
              </div>
            )}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSAnalyzer;
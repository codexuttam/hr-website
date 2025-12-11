import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ATSResultService } from '../../services/atsResultService';
import { ResumeService } from '../../services/resumeService';
import { ResumeData } from '../../types/resume';
import { HuggingFaceService, HuggingFaceATSAnalysis } from '../../services/huggingFaceService';
import { SupabaseATSService, SupabaseATSAnalysis } from '../../services/supabaseATSService';


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



const ATSAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<ATSResult | null>(null);

  const [atsStats, setAtsStats] = useState<any>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [testingAPI, setTestingAPI] = useState(false);

  useEffect(() => {
    if (user) {
      loadATSStats();
    }
  }, [user]);



  const testAPIConnection = async () => {
    setTestingAPI(true);
    setProcessingMessage('🔧 Testing API connection...');

    try {
      const result = await SupabaseATSService.testAPIConnection();

      if (result.success) {
        setProcessingMessage('✅ API connection successful! ResumeATS model is ready.');
      } else {
        setProcessingMessage(`❌ API connection failed: ${result.message}`);
      }
    } catch (error) {
      setProcessingMessage(`❌ Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingAPI(false);
      setTimeout(() => setProcessingMessage(null), 5000);
    }
  };

  const loadATSStats = async () => {
    try {
      if (user?.user_id) {
        console.log('Loading ATS stats for user:', user.user_id);
        const response = await ATSResultService.listATSResults(undefined, Number(user.user_id));
        console.log('ATS results response:', response);

        const results = response.atsResults;

        if (results && results.length > 0) {
          const scores = results.map(r => r.overall_score);
          const stats = {
            total_analyses: results.length,
            average_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            highest_score: Math.max(...scores),
            lowest_score: Math.min(...scores)
          };
          console.log('Setting ATS stats:', stats);
          setAtsStats(stats);
        } else {
          console.log('No ATS results found, setting empty stats');
          setAtsStats({
            total_analyses: 0,
            average_score: 0,
            highest_score: 0,
            lowest_score: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading ATS stats:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      setAtsStats({
        total_analyses: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0
      });
    }
  };

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

      // Use a simpler worker configuration
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();

      // Simpler PDF loading configuration
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
        // Minimal options to avoid compatibility issues
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
              .filter(text => text.trim())
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

      // Set worker source with better error handling
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        console.log('Setting PDF.js worker source:', workerSrc);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      }

      console.log('Converting file to array buffer...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('Array buffer created, size:', arrayBuffer.byteLength);

      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        // Add options to handle various PDF issues
        verbosity: 0, // Reduce console noise
        disableFontFace: true, // Avoid font loading issues
        disableRange: true, // Load entire PDF at once
        disableStream: true, // Disable streaming
      });

      const pdf = await loadingTask.promise;
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
              .filter(text => text.trim().length > 0)
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
        // Try server-side ATS analysis first to avoid CORS issues
        result = await analyzeResumeServerSide(resumeText, jobDescription);
        console.log('Server-side analysis successful');
      } catch (serverError) {
        console.warn('Server-side analysis failed, falling back to client-side:', serverError);
        setProcessingMessage('🔄 Trying alternative analysis method...');

        // Fallback to client-side analysis
        result = await analyzeResumeClientSide(resumeText, jobDescription);
        console.log('Client-side fallback analysis successful');
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

          // Reload stats to reflect the new analysis (with small delay to ensure DB is updated)
          setTimeout(() => {
            loadATSStats();
          }, 500);

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

  // Enhanced ATS analysis function using Supabase and ResumeATS model
  const analyzeResumeClientSide = async (resumeText: string, jobDescription: string): Promise<ATSResult> => {
    try {
      console.log('Starting AI-powered ATS analysis with ResumeATS model...');

      // Try Supabase ATS analysis with ResumeATS model first
      const supabaseAnalysis = await SupabaseATSService.analyzeResumeWithSupabaseATS(
        resumeText,
        jobDescription,
        user?.user_id ? Number(user.user_id) : undefined
      );

      // Convert Supabase analysis to ATSResult format
      return {
        ats_id: Date.now(),
        overall_score: supabaseAnalysis.overall_score,
        matching_keywords: supabaseAnalysis.keyword_analysis.matching_keywords,
        missing_keywords: supabaseAnalysis.keyword_analysis.missing_keywords,
        suggestions: formatSupabaseSuggestions(supabaseAnalysis.suggestions),
        job_description: jobDescription,
        created_at: new Date().toISOString(),
        analysis_data: {
          keyword_density: supabaseAnalysis.keyword_analysis.keyword_density,
          readability_score: supabaseAnalysis.content_analysis.readability_score,
          format_score: supabaseAnalysis.structure_analysis.format_score,
          full_analysis: generateSupabaseAnalysisReport(supabaseAnalysis),
          sections_analysis: {
            hasContactInfo: /email|phone|linkedin|github/i.test(resumeText),
            hasSummary: /summary|objective|profile/i.test(resumeText),
            hasExperience: /experience|work|employment|job/i.test(resumeText),
            hasEducation: /education|degree|university|college/i.test(resumeText),
            hasSkills: /skills|technologies|tools|proficient/i.test(resumeText)
          },
          // Enhanced analysis data from Supabase ATS
          hugging_face_analysis: {
            content_analysis: supabaseAnalysis.content_analysis,
            structure_analysis: supabaseAnalysis.structure_analysis,
            industry_alignment: supabaseAnalysis.industry_alignment,
            detailed_feedback: supabaseAnalysis.detailed_feedback
          }
        }
      };
    } catch (error) {
      console.warn('Supabase ATS analysis failed, trying Hugging Face fallback:', error);

      // Fallback to Hugging Face service
      try {
        const hfAnalysis = await HuggingFaceService.analyzeResumeWithHuggingFace(resumeText, jobDescription);

        return {
          ats_id: Date.now(),
          overall_score: hfAnalysis.overall_score,
          matching_keywords: hfAnalysis.keyword_analysis.matching_keywords,
          missing_keywords: hfAnalysis.keyword_analysis.missing_keywords,
          suggestions: formatHuggingFaceSuggestions(hfAnalysis.suggestions),
          job_description: jobDescription,
          created_at: new Date().toISOString(),
          analysis_data: {
            keyword_density: hfAnalysis.keyword_analysis.keyword_density,
            readability_score: hfAnalysis.content_analysis.readability_score,
            format_score: hfAnalysis.structure_analysis.format_score,
            full_analysis: generateEnhancedAnalysisReport(hfAnalysis),
            sections_analysis: {
              hasContactInfo: /email|phone|linkedin|github/i.test(resumeText),
              hasSummary: /summary|objective|profile/i.test(resumeText),
              hasExperience: /experience|work|employment|job/i.test(resumeText),
              hasEducation: /education|degree|university|college/i.test(resumeText),
              hasSkills: /skills|technologies|tools|proficient/i.test(resumeText)
            },
            hugging_face_analysis: {
              content_analysis: hfAnalysis.content_analysis,
              structure_analysis: hfAnalysis.structure_analysis,
              industry_alignment: hfAnalysis.industry_alignment,
              detailed_feedback: hfAnalysis.detailed_feedback
            }
          }
        };
      } catch (hfError) {
        console.warn('All AI analysis methods failed, using rule-based fallback:', hfError);

        // Final fallback to rule-based analysis
        return await analyzeResumeWithFallback(resumeText, jobDescription);
      }
    }
  };

  // Fallback analysis method (original implementation)
  const analyzeResumeWithFallback = async (resumeText: string, jobDescription: string): Promise<ATSResult> => {
    // Extract keywords
    const keywords = extractKeywords(resumeText, jobDescription);

    // Calculate scores
    const keywordScore = Math.min(100, (keywords.matching.length / Math.max(keywords.total, 1)) * 100);
    const formatScore = analyzeFormat(resumeText);
    const readabilityScore = analyzeReadability(resumeText);
    const overallScore = Math.round((keywordScore * 0.5) + (formatScore * 0.25) + (readabilityScore * 0.25));

    // Generate suggestions
    const suggestions = generateSuggestions(keywords, formatScore, readabilityScore);

    return {
      ats_id: Date.now(),
      overall_score: overallScore,
      matching_keywords: keywords.matching,
      missing_keywords: keywords.missing,
      suggestions: suggestions,
      job_description: jobDescription,
      created_at: new Date().toISOString(),
      analysis_data: {
        keyword_density: Math.round(keywordScore),
        readability_score: Math.round(readabilityScore),
        format_score: Math.round(formatScore),
        full_analysis: `ATS Analysis Report:\n\nKeyword Match: ${keywords.matching.length}/${keywords.total} (${Math.round(keywordScore)}%)\nFormat Score: ${Math.round(formatScore)}%\nReadability: ${Math.round(readabilityScore)}%\n\nMatching Keywords: ${keywords.matching.join(', ')}\n\nMissing Keywords: ${keywords.missing.join(', ')}`,
        sections_analysis: {
          hasContactInfo: /email|phone|linkedin|github/i.test(resumeText),
          hasSummary: /summary|objective|profile/i.test(resumeText),
          hasExperience: /experience|work|employment|job/i.test(resumeText),
          hasEducation: /education|degree|university|college/i.test(resumeText),
          hasSkills: /skills|technologies|tools|proficient/i.test(resumeText)
        }
      }
    };
  };

  // Helper function to format Supabase ATS suggestions
  const formatSupabaseSuggestions = (suggestions: any): string => {
    const formatted = [];

    if (suggestions.high_priority?.length > 0) {
      formatted.push('🔴 HIGH PRIORITY (ResumeATS Model):');
      suggestions.high_priority.forEach((suggestion: string, index: number) => {
        formatted.push(`${index + 1}. ${suggestion}`);
      });
      formatted.push('');
    }

    if (suggestions.medium_priority?.length > 0) {
      formatted.push('🟡 MEDIUM PRIORITY:');
      suggestions.medium_priority.forEach((suggestion: string, index: number) => {
        formatted.push(`${index + 1}. ${suggestion}`);
      });
      formatted.push('');
    }

    if (suggestions.low_priority?.length > 0) {
      formatted.push('🟢 LOW PRIORITY:');
      suggestions.low_priority.forEach((suggestion: string, index: number) => {
        formatted.push(`${index + 1}. ${suggestion}`);
      });
    }

    return formatted.join('\n');
  };

  // Helper function to format Hugging Face suggestions
  const formatHuggingFaceSuggestions = (suggestions: any): string => {
    const formatted = [];

    if (suggestions.high_priority?.length > 0) {
      formatted.push('🔴 HIGH PRIORITY:');
      suggestions.high_priority.forEach((suggestion: string, index: number) => {
        formatted.push(`${index + 1}. ${suggestion}`);
      });
      formatted.push('');
    }

    if (suggestions.medium_priority?.length > 0) {
      formatted.push('🟡 MEDIUM PRIORITY:');
      suggestions.medium_priority.forEach((suggestion: string, index: number) => {
        formatted.push(`${index + 1}. ${suggestion}`);
      });
      formatted.push('');
    }

    if (suggestions.low_priority?.length > 0) {
      formatted.push('🟢 LOW PRIORITY:');
      suggestions.low_priority.forEach((suggestion: string, index: number) => {
        formatted.push(`${index + 1}. ${suggestion}`);
      });
    }

    return formatted.join('\n');
  };

  // Generate Supabase ATS analysis report
  const generateSupabaseAnalysisReport = (analysis: SupabaseATSAnalysis): string => {
    return `🤖 RESUMEATS MODEL ANALYSIS REPORT

📊 OVERALL SCORE: ${analysis.overall_score}/100

🔍 KEYWORD ANALYSIS:
• Keyword Match: ${analysis.keyword_analysis.matching_keywords.length} found
• Keyword Density: ${analysis.keyword_analysis.keyword_density}%
• Relevance Score: ${analysis.keyword_analysis.relevance_score}%
• Matching Keywords: ${analysis.keyword_analysis.matching_keywords.join(', ')}
• Missing Keywords: ${analysis.keyword_analysis.missing_keywords.join(', ')}

📝 CONTENT ANALYSIS:
• Readability Score: ${analysis.content_analysis.readability_score}%
• Professional Tone: ${analysis.content_analysis.professional_tone_score}%
• Action Verbs Used: ${analysis.content_analysis.action_verbs_count}
• Quantified Achievements: ${analysis.content_analysis.quantified_achievements}

🏗️ STRUCTURE ANALYSIS:
• Format Score: ${analysis.structure_analysis.format_score}%
• Sections Completeness: ${analysis.structure_analysis.sections_completeness}%
• Length Appropriateness: ${analysis.structure_analysis.length_appropriateness}%
• Bullet Point Usage: ${analysis.structure_analysis.bullet_point_usage}

🎯 INDUSTRY ALIGNMENT:
• Industry Match Score: ${analysis.industry_alignment.score}%
• Relevant Skills: ${analysis.industry_alignment.relevant_skills.join(', ')}
• Trending Keywords: ${analysis.industry_alignment.trending_keywords.join(', ')}

💡 RESUMEATS MODEL FEEDBACK:
${analysis.detailed_feedback}

🔗 POWERED BY: Supabase + ResumeATS Model (girishwangikar/ResumeATS)`;
  };

  // Generate enhanced analysis report
  const generateEnhancedAnalysisReport = (analysis: HuggingFaceATSAnalysis): string => {
    return `🤖 AI-POWERED ATS ANALYSIS REPORT

📊 OVERALL SCORE: ${analysis.overall_score}/100

🔍 KEYWORD ANALYSIS:
• Keyword Match: ${analysis.keyword_analysis.matching_keywords.length} found
• Keyword Density: ${analysis.keyword_analysis.keyword_density}%
• Relevance Score: ${analysis.keyword_analysis.relevance_score}%
• Matching Keywords: ${analysis.keyword_analysis.matching_keywords.join(', ')}
• Missing Keywords: ${analysis.keyword_analysis.missing_keywords.join(', ')}

📝 CONTENT ANALYSIS:
• Readability Score: ${analysis.content_analysis.readability_score}%
• Professional Tone: ${analysis.content_analysis.professional_tone_score}%
• Action Verbs Used: ${analysis.content_analysis.action_verbs_count}
• Quantified Achievements: ${analysis.content_analysis.quantified_achievements}

🏗️ STRUCTURE ANALYSIS:
• Format Score: ${analysis.structure_analysis.format_score}%
• Sections Completeness: ${analysis.structure_analysis.sections_completeness}%
• Length Appropriateness: ${analysis.structure_analysis.length_appropriateness}%
• Bullet Point Usage: ${analysis.structure_analysis.bullet_point_usage}

🎯 INDUSTRY ALIGNMENT:
• Industry Match Score: ${analysis.industry_alignment.score}%
• Relevant Skills: ${analysis.industry_alignment.relevant_skills.join(', ')}
• Trending Keywords: ${analysis.industry_alignment.trending_keywords.join(', ')}

💡 AI FEEDBACK:
${analysis.detailed_feedback}`;
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
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            📄 Analyze Resume
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'results'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
          >
            📊 View Results
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
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Resume...
                      </span>
                    ) : (
                      '📄 Process Resume File'
                    )}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: PDF, DOCX, TXT (Max 10MB)
                  <br />
                  <span className="text-blue-600 dark:text-blue-400">
                    💡 Tip: If PDF processing fails, try converting your PDF to text first or copy-paste the content manually.
                  </span>
                  <br />
                  <span className="text-orange-600 dark:text-orange-400">
                    ⚠️ If analysis fails, the system automatically uses enhanced rule-based analysis as fallback.
                  </span>
                </div>
                {processingMessage && (
                  <div className={`mt-3 p-3 rounded-md text-sm ${processingMessage.includes('✅')
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : processingMessage.includes('⚠️')
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}>
                    {processingMessage}
                  </div>
                )}
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
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Resume...
                  </span>
                ) : (
                  '🎯 Analyze Resume'
                )}
              </button>

              {processingMessage && (
                <div className={`mt-3 p-3 rounded-md text-sm ${processingMessage.includes('✅')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : processingMessage.includes('⚠️')
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                    : processingMessage.includes('🔄') || processingMessage.includes('💾')
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                  }`}>
                  {processingMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && currentResult && (
          <div className="space-y-6">
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
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🎯 Content Quality</h4>
                    <div className="space-y-1 text-sm">
                      <div>Professional Tone: {currentResult.analysis_data.hugging_face_analysis.content_analysis.professional_tone_score}%</div>
                      <div>Action Verbs: {currentResult.analysis_data.hugging_face_analysis.content_analysis.action_verbs_count}</div>
                      <div>Quantified Results: {currentResult.analysis_data.hugging_face_analysis.content_analysis.quantified_achievements}</div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">🏗️ Structure Quality</h4>
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
                <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
                  ✅ Matching Keywords ({currentResult.matching_keywords.length})
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
                <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                  ❌ Missing Keywords ({currentResult.missing_keywords.length})
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
              <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">💡 Suggestions for Improvement</h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentResult.suggestions}</p>
              </div>
            </div>

            {/* Industry Alignment */}
            {currentResult.analysis_data?.hugging_face_analysis?.industry_alignment && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎯 Industry Alignment</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-green-600 dark:text-green-400 mb-3">✅ Relevant Skills Found</h5>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.analysis_data.hugging_face_analysis.industry_alignment.relevant_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-3">📈 Trending Keywords</h5>
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
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🤖 AI Detailed Feedback</h4>
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
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Complete Analysis Report</h4>
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
    </div>
  );
};

// Helper functions for client-side analysis
const extractKeywords = (resumeText: string, jobDescription: string) => {
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'within', 'without', 'under', 'over', 'this', 'that', 'these', 'those', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'have', 'has', 'had', 'been', 'being', 'are', 'was', 'were', 'is', 'am', 'an', 'a']);

  const resumeWords = resumeText.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  const jobWords = jobDescription.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 2 && !commonWords.has(word));

  const jobKeywords = [...new Set(jobWords)];
  const matching = jobKeywords.filter(keyword => resumeWords.includes(keyword));
  const missing = jobKeywords.filter(keyword => !resumeWords.includes(keyword)).slice(0, 15);

  return {
    matching: matching.slice(0, 20),
    missing: missing,
    total: jobKeywords.length
  };
};

const analyzeFormat = (resumeText: string): number => {
  let score = 100;

  // Check for basic sections
  if (!/contact|email|phone/i.test(resumeText)) score -= 20;
  if (!/experience|work/i.test(resumeText)) score -= 20;
  if (!/education|degree/i.test(resumeText)) score -= 15;
  if (!/skills|technologies/i.test(resumeText)) score -= 15;

  // Check for good formatting indicators
  if (resumeText.length < 500) score -= 10; // Too short
  if (resumeText.length > 5000) score -= 10; // Too long
  if (!/\d{4}/.test(resumeText)) score -= 10; // No dates

  return Math.max(0, score);
};

const analyzeReadability = (resumeText: string): number => {
  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = resumeText.split(/\s+/).filter(w => w.length > 0);
  const avgWordsPerSentence = words.length / sentences.length;

  let score = 100;

  // Penalize very long or very short sentences
  if (avgWordsPerSentence > 25) score -= 20;
  if (avgWordsPerSentence < 8) score -= 10;

  // Check for bullet points (good for readability)
  const bulletPoints = (resumeText.match(/[•\-\*]/g) || []).length;
  if (bulletPoints > 5) score += 10;

  // Check for action verbs
  const actionVerbs = ['managed', 'led', 'developed', 'created', 'implemented', 'designed', 'improved', 'increased', 'reduced', 'achieved'];
  const actionVerbCount = actionVerbs.filter(verb => resumeText.toLowerCase().includes(verb)).length;
  score += Math.min(20, actionVerbCount * 3);

  return Math.min(100, Math.max(0, score));
};

const generateSuggestions = (keywords: any, formatScore: number, readabilityScore: number): string => {
  const suggestions = [];

  if (keywords.matching.length < 5) {
    suggestions.push(`• Add more relevant keywords from the job description. You're only matching ${keywords.matching.length} keywords.`);
  }

  if (keywords.missing.length > 0) {
    suggestions.push(`• Consider including these missing keywords: ${keywords.missing.slice(0, 5).join(', ')}`);
  }

  if (formatScore < 80) {
    suggestions.push('• Improve resume structure by including clear sections: Contact, Summary, Experience, Education, Skills');
    suggestions.push('• Add dates to your experience and education entries');
  }

  if (readabilityScore < 70) {
    suggestions.push('• Use bullet points to improve readability');
    suggestions.push('• Start bullet points with action verbs (managed, developed, created, etc.)');
    suggestions.push('• Keep sentences concise and focused');
  }

  suggestions.push('• Quantify your achievements with numbers and percentages when possible');
  suggestions.push('• Tailor your resume for each job application by matching more keywords');

  return suggestions.join('\n');
};



export default ATSAnalyzer;
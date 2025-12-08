import React, { useState, useEffect } from "react";
import Form from "../components/resume/Form";
import Resume from "../components/resume/Resume";
import AISuggestions from "../components/AISuggestions";
import DownloadDropdown from "../components/resume/DownloadDropdown";
import { ResumeData, ResumeColor } from "../types/resume";
import { ResumeService, useAutoSave } from "../services/resumeService";
import { useAuth } from "../contexts/AuthContext";

// 🎨 Color Presets
const colorPresets: ResumeColor[] = [
  { primary: "#667eea", background: "#764ba2", skills: "#9f7aea" },
  { primary: "#4f46e5", background: "#7c3aed", skills: "#8b5cf6" },
  { primary: "#6b7280", background: "#4b5563", skills: "#9ca3af" },
  { primary: "#10b981", background: "#3b82f6", skills: "#14b8a6" },
  { primary: "#f59e0b", background: "#ef4444", skills: "#fb923c" },
  { primary: "#ec4899", background: "#f43f5e", skills: "#f472b6" },
];

// 🧱 Initial Resume Data
const initialData: ResumeData = {
  contact: {
    name: "Your Name",
    position: "Web Designer",
    photoUrl: "",
    phone: "+123-456-7890",
    email: "hello@example.com",
    linkedin: "linkedin.com/in/yourname",
    github: "github.com/yourname",
    address: "City, Country",
  },
  objective:
    "Creative and detail-oriented web designer with a passion for clean, user-centered design. Seeking opportunities to bring modern design and usability principles to impactful digital projects.",
  skills: [
    "Web Design Tools",
    "Front-End Development",
    "UI/UX Design",
    "Version Control",
    "Color Theory",
    "Typography",
    "SEO Fundamentals",
    "Web Accessibility",
  ],
  tools: ["Figma", "Adobe XD", "Photoshop", "Illustrator"],
  languages: [{ language: "English", level: 5 }, { language: "Spanish", level: 3 }],
  interests: ["Photography", "Travel", "Reading", "Music"],
  education: [
    {
      year: "2020 - 2023",
      course: "Master of IT Management",
      institution: "Wardiere University",
      achievements:
        "Focused on digital transformation and user experience management in web systems.",
    },
    {
      year: "2016 - 2020",
      course: "Bachelor of Art and Design",
      institution: "Borcelle University",
      achievements:
        "Studied creative design, typography, and interaction design principles.",
    },
  ],
  experience: [
    {
      year: "2020 - 2023",
      company: "Wardiere Company",
      position: "Web Designer",
      description:
        "Designed and developed responsive websites using Figma and React. Collaborated with developers and stakeholders to improve usability and brand consistency.",
    },
    {
      year: "2018 - 2020",
      company: "Borcelle Studio",
      position: "Junior Web Designer",
      description:
        "Supported senior designers with UI/UX mockups, visual assets, and client communication.",
    },
  ],
  certifications: [
    {
      year: "2022",
      course: "Certified Web Designer",
      institution: "Design Institute",
      description: "Awarded for excellence in creative digital design.",
    },
  ],
  projects: [
    {
      title: "E-commerce Website",
      link: "",
      description:
        "Developed a full-stack e-commerce platform with integrated payment system and admin dashboard using React and Node.js.",
    },
  ],
  workshops: [{ year: "2023", description: "Advanced UI/UX Workshop at TechHub" }],
  activities: [
    {
      title: "Design Community Leader",
    },
  ],
  references: [
    {
      name: "Niranjan Devi",
      desig: "CEO, Wardiere Company",
      phone: "123-456-7890",
      email: "reference@company.com",
    },
    {
      name: "Aarya Agarwal",
      desig: "HR Head, Wardiere Company",
      phone: "123-456-7890",
      email: "reference@company.com",
    },
  ],
};

interface ResumeBuilderProps {
  selectedTemplate?: number;
  onBackToTemplates?: () => void;
  resumeId?: number;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  selectedTemplate = 0,
  onBackToTemplates,
  resumeId,
}) => {
  const [data, setData] = useState<ResumeData>(initialData);
  const [color, setColor] = useState<ResumeColor>(colorPresets[0]);
  const [template, setTemplate] = useState<number>(selectedTemplate);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<number | undefined>();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  const { user } = useAuth();

  // Handle responsive view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode(prev => prev === 'split' ? 'edit' : prev);
      } else {
        setViewMode('split');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load existing resume if resumeId is provided
  useEffect(() => {
    const loadExistingResume = async () => {
      if (resumeId) {
        try {
          setIsLoading(true);
          const resume = await ResumeService.getResume(resumeId);
          setData(resume.resume_data);
          setTemplate(resume.template_id);
          if (resume.color_scheme) {
            setColor(resume.color_scheme);
          }
          setCurrentResumeId(resume.resume_id);
        } catch (error) {
          console.error('Failed to load resume:', error);
          setSaveStatus('error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingResume();
  }, [resumeId]);

  // Auto-save functionality
  const { isSaving, lastSaved, lastSavedId } = useAutoSave(
    data,
    template,
    color,
    user?.user_id?.toString(),
    30000 // Auto-save every 30 seconds
  );

  // Update current resume ID when auto-save creates a new resume
  useEffect(() => {
    if (lastSavedId && lastSavedId !== currentResumeId) {
      setCurrentResumeId(lastSavedId);
    }
  }, [lastSavedId, currentResumeId]);

  // Update save status based on auto-save state
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    } else if (lastSaved) {
      setSaveStatus('saved');
      const timeout = setTimeout(() => setSaveStatus(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isSaving, lastSaved]);

  const handleApplySuggestion = (section: keyof ResumeData, newValue: string) => {
    setData(prev => ({
      ...prev,
      [section]: newValue
    }));
  };

  const handleManualSave = async () => {
    try {
      setSaveStatus('saving');
      const savedResume = await ResumeService.autoSave(
        data,
        template,
        color,
        user?.user_id?.toString(),
        currentResumeId
      );
      setCurrentResumeId(savedResume.resume_id);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Manual save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your resume...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          {onBackToTemplates && (
            <button
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              onClick={onBackToTemplates}
              title="Back to Templates"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">Resume Builder</h1>

          {/* Save Status */}
          {saveStatus && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
              saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Error'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle for Mobile */}
          <div className="lg:hidden flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'edit'
                ? 'bg-white dark:bg-slate-600 text-indigo-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
                }`}
            >
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'preview'
                ? 'bg-white dark:bg-slate-600 text-indigo-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
                }`}
            >
              Preview
            </button>
          </div>

          <button
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showAISuggestions
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
            onClick={() => setShowAISuggestions(!showAISuggestions)}
          >
            <span>🤖</span> AI Suggestions
          </button>

          <button
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
            onClick={handleManualSave}
            disabled={isSaving}
          >
            Save
          </button>

          <DownloadDropdown
            data={data}
            templateId={template}
            color={color}
            resumeId={currentResumeId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Panel - Form */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${viewMode === 'preview' ? 'hidden' : 'flex'
          } ${viewMode === 'split' ? 'w-1/2 max-w-2xl border-r border-gray-200 dark:border-slate-700' : 'w-full'}`}>
          <div className="flex-1 overflow-hidden p-4 sm:p-6">
            <Form
              data={data}
              setData={setData}
              preset={colorPresets}
              setColor={setColor}
              selectedTemplate={template}
              setSelectedTemplate={setTemplate}
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className={`flex-1 flex flex-col min-w-0 bg-gray-200 dark:bg-slate-950 transition-all duration-300 ${viewMode === 'edit' ? 'hidden' : 'flex'
          } ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl origin-top transform scale-90 sm:scale-100 transition-transform">
              <Resume data={data} color={color} selectedTemplate={template} />
            </div>
          </div>
        </div>

        {/* AI Suggestions Sidebar (Floating) */}
        {showAISuggestions && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-800 shadow-2xl border-l border-gray-200 dark:border-slate-700 z-20 animate-slideLeft flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                <span>🤖</span> AI Suggestions
              </h3>
              <button
                onClick={() => setShowAISuggestions(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AISuggestions
                resumeData={data}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;

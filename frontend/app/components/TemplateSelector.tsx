import React from "react";
import { useRouter } from "next/navigation";
import { ResumeTemplate } from "../contexts";

// 🧱 Type-safe prop interface
interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
}

// 🎨 Template metadata
const templates = [
  { id: "classic" as ResumeTemplate, name: "Professional with Photo", preview: "/images/resume_templates-images-0.jpg", accent: "border-blue-400 hover:border-blue-600" },
  { id: "modern" as ResumeTemplate, name: "Modern Executive", preview: "/images/resume_templates-images-1.jpg", accent: "border-purple-400 hover:border-purple-600" },
  { id: "minimal" as ResumeTemplate, name: "Minimal Professional", preview: "/images/resume_templates-images-2.jpg", accent: "border-gray-400 hover:border-gray-600" },
  { id: "creative" as ResumeTemplate, name: "Creative Designer", preview: "/images/resume_templates-images-3.jpg", accent: "border-pink-400 hover:border-pink-600" },
  { id: "executive" as ResumeTemplate, name: "Executive Premium", preview: "/images/resume_templates-images-4.jpg", accent: "border-indigo-400 hover:border-indigo-600" },
  { id: "tech" as ResumeTemplate, name: "Tech Professional", preview: "/images/resume_templates-images-5.jpg", accent: "border-blue-500 hover:border-blue-700" },
  { id: "academic" as ResumeTemplate, name: "Academic Scholar", preview: "/images/resume_templates-images-6.jpg", accent: "border-gray-500 hover:border-gray-700" },
  { id: "designer" as ResumeTemplate, name: "Designer Portfolio", preview: "/images/resume_templates-images-7.jpg", accent: "border-pink-500 hover:border-pink-700" },
  { id: "startup" as ResumeTemplate, name: "Startup Dynamic", preview: "/images/resume_templates-images-8.jpg", accent: "border-green-500 hover:border-green-700" },
  { id: "corporate" as ResumeTemplate, name: "Corporate Standard", preview: "/images/resume_templates-images-9.jpg", accent: "border-slate-500 hover:border-slate-700" },
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
}) => {
  const router = useRouter();

  const handleTemplateSelect = (templateId: ResumeTemplate) => {
    onTemplateChange(templateId);
    // Auto-navigate after selection
    setTimeout(() => router.push("/resume-builder"), 400); // short delay for UX smoothness
  };

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
        Choose a Resume Template
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            className={`border-2 rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === template.id
                ? `${template.accent} border-opacity-100 scale-105`
                : "border-gray-200 dark:border-slate-600 hover:border-gray-400"
            }`}
          >
            <div className="w-full h-40 overflow-hidden">
              <img
                src={template.preview}
                alt={template.name}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
              />
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 text-center">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {template.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {template.accent}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;

import React, { useState, useMemo } from 'react';

const templates = [
  { id: 0, name: 'Professional with Photo', image: '/images/resume_templates-images-0.jpg', description: 'Clean layout with photo header, perfect for corporate roles', category: 'Professional' },
  { id: 1, name: 'Modern Executive', image: '/images/resume_templates-images-1.jpg', description: 'Contemporary two-column design with elegant styling', category: 'Professional' },
  { id: 2, name: 'Minimal Professional', image: '/images/resume_templates-images-2.jpg', description: 'Simple and clean, emphasizes content over design', category: 'Simple' },
  { id: 3, name: 'Creative Designer', image: '/images/resume_templates-images-3.jpg', description: 'Bold layout with visual elements for creative fields', category: 'Creative' },
  { id: 4, name: 'Executive Premium', image: '/images/resume_templates-images-4.jpg', description: 'Sophisticated design for senior leadership positions', category: 'Professional' },
  { id: 5, name: 'Tech Professional', image: '/images/resume_templates-images-5.jpg', description: 'Modern layout optimized for tech and IT roles', category: 'Tech' },
  { id: 6, name: 'Academic Scholar', image: '/images/resume_templates-images-6.jpg', description: 'Traditional format ideal for academic and research positions', category: 'Simple' },
  { id: 7, name: 'Designer Portfolio', image: '/images/resume_templates-images-7.jpg', description: 'Visual-focused design to showcase creative work', category: 'Creative' },
  { id: 8, name: 'Startup Dynamic', image: '/images/resume_templates-images-8.jpg', description: 'Energetic and modern design for startup culture', category: 'Creative' },
  { id: 9, name: 'Corporate Standard', image: '/images/resume_templates-images-9.jpg', description: 'Classic professional format for large corporations', category: 'Professional' }
];

const categories = ['All', 'Professional', 'Creative', 'Simple', 'Tech'];

interface TemplateSelectionProps {
  onTemplateSelect: (templateId: number) => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({ onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return templates;
    return templates.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const handleSelectTemplate = (templateId: number) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate !== null) {
      onTemplateSelect(selectedTemplate);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Choose Your <span className="text-indigo-600 dark:text-indigo-400">Perfect Resume</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select a professional template that matches your industry and personal style.
            Stand out from the crowd with our ATS-friendly designs.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-24">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 ${selectedTemplate === template.id
                  ? 'ring-4 ring-indigo-500 shadow-2xl scale-[1.02]'
                  : 'border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl'
                }`}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <div className="relative aspect-[1/1.414] overflow-hidden bg-gray-100 dark:bg-slate-700">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-content')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-content absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800';
                      fallback.innerHTML = `
                        <div class="text-6xl mb-4 opacity-50">📄</div>
                        <div class="text-lg font-medium">Template ${template.id + 1}</div>
                        <div class="text-xs mt-2 opacity-75">Preview Loading</div>
                      `;
                      parent.appendChild(fallback);
                    }
                  }}
                />

                {/* Selection Overlay */}
                <div className={`absolute inset-0 bg-indigo-600/20 dark:bg-indigo-500/20 transition-opacity duration-300 ${selectedTemplate === template.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                {selectedTemplate === template.id && (
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg animate-bounce">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
                    {template.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Bottom Bar */}
        <div className={`fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 p-4 transition-transform duration-300 z-50 ${selectedTemplate !== null ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selected Template: <span className="font-bold text-slate-900 dark:text-white">{selectedTemplate !== null ? templates.find(t => t.id === selectedTemplate)?.name : ''}</span>
              </p>
            </div>
            <button
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              onClick={handleContinue}
            >
              Continue to Builder
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;

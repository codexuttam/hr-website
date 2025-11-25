import React, { useState, useRef } from "react";
import { ResumeData, ResumeColor } from "../../types/resume";
import AIRephraseButton from "./AIRephraseButton";

interface FormProps {
  data: ResumeData;
  setData: (data: ResumeData) => void;
  preset: ResumeColor[];
  setColor: (color: ResumeColor) => void;
  selectedTemplate: number;
  setSelectedTemplate: (id: number) => void;
}

// Default structure (safety net)
const defaultResume: ResumeData = {
  contact: {
    name: "",
    position: "",
    photoUrl: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    address: "",
  },
  objective: "",
  education: [],
  experience: [],
  skills: [],
  certifications: [],
  references: [],
  languages: [],
  tools: [],
  interests: [],
};

const Form: React.FC<FormProps> = ({
  data,
  setData,
  preset,
  setColor,
  selectedTemplate,
  setSelectedTemplate,
}) => {
  const safeData = { ...defaultResume, ...data };
  const [activeTab, setActiveTab] = useState('personal');
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const [skills, setSkills] = useState((safeData.skills || []).join(","));
  const [tools, setTools] = useState((safeData.tools || []).join(","));
  const [interests, setInterests] = useState((safeData.interests || []).join(","));

  // --- Photo Upload Handler ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    setData({
      ...data,
      contact: { ...data.contact, photoUrl: URL.createObjectURL(file) },
    });
  };

  // --- Contact Handler ---
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      contact: { ...data.contact, [e.target.name]: e.target.value },
    });
  };

  // --- Dynamic Section Update ---
  const addRow = <K extends keyof ResumeData>(key: K, row: any) => {
    const temp = [...((data[key] as any[]) || []), row];
    setData({ ...data, [key]: temp });
  };

  const removeRow = <K extends keyof ResumeData>(key: K, index: number) => {
    const temp = (data[key] as any[]).filter((_, i) => i !== index);
    setData({ ...data, [key]: temp });
  };

  const handleRowChange = <K extends keyof ResumeData>(
    key: K,
    index: number,
    field: string,
    value: string
  ) => {
    const temp = [...((data[key] as any[]) || [])];
    temp[index][field] = value;
    setData({ ...data, [key]: temp });
  };

  const handleArrayUpdate = (key: keyof ResumeData, value: string) => {
    setData({ ...data, [key]: value.split(",").map((v) => v.trim()) });
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'extras', label: 'Extras', icon: '➕' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 rounded-xl overflow-hidden">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'personal' && (
          <div className="space-y-8 animate-fadeIn">
            <Section title="Profile Photo">
              <div className="flex items-center gap-6">
                {safeData.contact.photoUrl ? (
                  <div className="relative group">
                    <img
                      src={safeData.contact.photoUrl}
                      alt="Profile Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <button
                      onClick={() => setData({ ...data, contact: { ...data.contact, photoUrl: "" } })}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-3xl">
                    👤
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => photoFileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    {safeData.contact.photoUrl ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recommended: Square JPG/PNG, max 5MB
                  </p>
                </div>
                <input
                  ref={photoFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  hidden
                />
              </div>
            </Section>

            <Section title="Contact Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(safeData.contact).map((field) => (
                  field !== 'photoUrl' && (
                    <div key={field} className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={(safeData.contact as any)[field] || ""}
                        onChange={handleContactChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder={`Enter your ${field}`}
                      />
                    </div>
                  )
                ))}
              </div>
            </Section>

            <Section title="Professional Summary">
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={safeData.objective}
                  onChange={(e) => setData({ ...data, objective: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Write a brief summary of your professional background and goals..."
                />
                <div className="flex justify-end">
                  <AIRephraseButton
                    text={safeData.objective || ''}
                    section="objective"
                    onApply={(newText) => setData({ ...data, objective: newText })}
                  />
                </div>
              </div>
            </Section>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="animate-fadeIn">
            <SectionEditor
              title="Work Experience"
              section="experience"
              fields={["position", "company", "year", "description"]}
              data={safeData}
              addRow={addRow}
              removeRow={removeRow}
              handleRowChange={handleRowChange}
            />
          </div>
        )}

        {activeTab === 'education' && (
          <div className="animate-fadeIn">
            <SectionEditor
              title="Education"
              section="education"
              fields={["course", "institution", "year", "description"]}
              data={safeData}
              addRow={addRow}
              removeRow={removeRow}
              handleRowChange={handleRowChange}
            />
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-8 animate-fadeIn">
            <SimpleTextArea
              title="Technical Skills"
              value={skills}
              onChange={setSkills}
              onUpdate={() => handleArrayUpdate("skills", skills)}
              placeholder="React, TypeScript, Node.js, Python..."
            />
            <SimpleTextArea
              title="Tools & Software"
              value={tools}
              onChange={setTools}
              onUpdate={() => handleArrayUpdate("tools", tools)}
              placeholder="VS Code, Figma, Jira, Git..."
            />
            <SectionEditor
              title="Languages"
              section="languages"
              fields={["language", "level"]}
              data={safeData}
              addRow={addRow}
              removeRow={removeRow}
              handleRowChange={handleRowChange}
            />
          </div>
        )}

        {activeTab === 'extras' && (
          <div className="space-y-8 animate-fadeIn">
            <SectionEditor
              title="Certifications"
              section="certifications"
              fields={["course", "institution", "year", "description"]}
              data={safeData}
              addRow={addRow}
              removeRow={removeRow}
              handleRowChange={handleRowChange}
            />
            <SectionEditor
              title="References"
              section="references"
              fields={["name", "desig", "phone", "email"]}
              data={safeData}
              addRow={addRow}
              removeRow={removeRow}
              handleRowChange={handleRowChange}
            />
            <SimpleTextArea
              title="Interests"
              value={interests}
              onChange={setInterests}
              onUpdate={() => handleArrayUpdate("interests", interests)}
              placeholder="Photography, Traveling, Reading..."
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fadeIn">
            <Section title="Color Scheme">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {preset.map((item, key) => (
                  <button
                    key={key}
                    className={`group relative h-16 rounded-xl border-2 transition-all duration-200 ${JSON.stringify(item) === JSON.stringify(data.color_scheme) // Assuming data has color_scheme or we use a prop for selected color
                        ? 'border-indigo-600 scale-105 shadow-md'
                        : 'border-transparent hover:scale-105 hover:shadow-sm'
                      }`}
                    style={{ backgroundColor: item.primary }}
                    onClick={() => setColor(item)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                        ✨
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Reusable Components ---
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
      <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
      {title}
    </h3>
    {children}
  </div>
);

const SimpleTextArea = ({
  title,
  value,
  onChange,
  onUpdate,
  placeholder,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onUpdate: () => void;
  placeholder?: string;
}) => (
  <Section title={title}>
    <div className="space-y-3">
      <textarea
        rows={3}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className="flex justify-end">
        <button
          onClick={onUpdate}
          className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium"
        >
          Update {title}
        </button>
      </div>
    </div>
  </Section>
);

const SectionEditor = ({
  title,
  section,
  fields,
  data,
  addRow,
  removeRow,
  handleRowChange,
}: {
  title: string;
  section: keyof ResumeData;
  fields: string[];
  data: ResumeData;
  addRow: <K extends keyof ResumeData>(key: K, row: any) => void;
  removeRow: <K extends keyof ResumeData>(key: K, index: number) => void;
  handleRowChange: <K extends keyof ResumeData>(
    key: K,
    index: number,
    field: string,
    value: string
  ) => void;
}) => {
  const rows = (data[section] as any[]) || [];

  return (
    <Section title={title}>
      <div className="space-y-6">
        {rows.map((row, i) => (
          <div key={i} className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-100 dark:border-slate-700 relative group">
            <button
              onClick={() => removeRow(section, i)}
              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Remove item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {fields.map((field) => (
                <div key={field} className={field === 'description' ? 'md:col-span-2' : ''}>
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1 block">
                    {field}
                  </label>
                  {field === 'description' ? (
                    <div className="space-y-2">
                      <textarea
                        value={row[field] || ""}
                        onChange={(e) => handleRowChange(section, i, field, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder={`Enter ${field}...`}
                      />
                      <div className="flex justify-end">
                        <AIRephraseButton
                          text={row[field] || ''}
                          section={`${title} description`}
                          onApply={(newText) => handleRowChange(section, i, field, newText)}
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={row[field] || ""}
                      onChange={(e) => handleRowChange(section, i, field, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder={field}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            const emptyRow = Object.fromEntries(fields.map((f) => [f, ""]));
            addRow(section, emptyRow);
          }}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {title}
        </button>
      </div>
    </Section>
  );
};

export default Form;

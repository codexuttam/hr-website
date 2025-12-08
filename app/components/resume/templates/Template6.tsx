import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface TemplateProps {
  data: ResumeData;
  color: ResumeColor;
}

const Template6: React.FC<TemplateProps> = ({ data, color }) => {
  if (!data || !data.contact) return null;
  const { contact, objective, education, skills, languages, experience, references } = data;

  return (
    <div className="w-[850px] mx-auto bg-white text-gray-900 font-sans">
      {/* ===== HEADER ===== */}
      <header className="grid grid-cols-2 border-b-4 p-8" style={{ borderColor: color.primary }}>
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wide">{contact.name}</h1>
          <h3 className="text-lg font-medium mt-1 text-gray-700">
            {contact.position || "Marketing Manager"}
          </h3>
        </div>
        <div className="flex flex-col items-end text-sm text-gray-700 space-y-1">
          <p>📞 {contact.phone}</p>
          <p>✉️ {contact.email}</p>
          <p>📍 {contact.linkedin}</p>
        </div>
      </header>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-2 divide-x divide-gray-300">
        {/* LEFT COLUMN */}
        <div className="p-8 space-y-8">
          {/* PROFILE */}
          {objective && (
            <section>
              <h2
                className="text-base font-semibold uppercase tracking-wide mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Profile
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{objective}</p>
            </section>
          )}

          {/* WORK EXPERIENCE */}
          {experience && experience.length > 0 && (
            <section>
              <h2
                className="text-base font-semibold uppercase tracking-wide mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Work Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-gray-900">{exp.position}</p>
                    <p className="text-sm text-gray-700">
                      <b>{exp.company}</b> ({exp.year})
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-1 leading-relaxed">
                      {exp.description
                        ?.split(".")
                        .filter((d) => d.trim())
                        .map((d, idx) => (
                          <li key={idx}>{d.trim()}.</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="p-8 space-y-8">
          {/* EDUCATION */}
          {education && education.length > 0 && (
            <section>
              <h2
                className="text-base font-semibold uppercase tracking-wide mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Education
              </h2>
              <div className="space-y-2 text-sm text-gray-700">
                {education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-semibold text-gray-900">
                      {edu.year} — {edu.institution}
                    </p>
                    <p>{edu.course}</p>
                    {edu.description && (
                      <p className="text-gray-600 mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SKILLS */}
          {skills && skills.length > 0 && (
            <section>
              <h2
                className="text-base font-semibold uppercase tracking-wide mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Skills
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          {/* LANGUAGES */}
          {languages && languages.length > 0 && (
            <section>
              <h2
                className="text-base font-semibold uppercase tracking-wide mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Languages
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {languages.map((lang, i) => (
                  <li key={i}>
                    {lang.language} {lang.level ? `(${lang.level})` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* REFERENCES */}
          {references && references.length > 0 && (
            <section>
              <h2
                className="text-base font-semibold uppercase tracking-wide mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                References
              </h2>
              <div className="space-y-2 text-sm text-gray-700">
                {references.map((ref, i) => (
                  <div key={i}>
                    <p className="font-semibold text-gray-900">{ref.name}</p>
                    <p className="text-gray-600">{ref.desig}</p>
                    {ref.phone && <p>📞 {ref.phone}</p>}
                    {ref.email && <p>✉️ {ref.email}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template6;

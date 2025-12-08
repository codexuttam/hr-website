import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface TemplateProps {
  data: ResumeData;
  color: ResumeColor;
}

const Template8: React.FC<TemplateProps> = ({ data, color }) => {
  if (!data || !data.contact) return null;
  const { contact, objective, education, skills, languages, experience, references } = data;

  return (
    <div className="w-[850px] mx-auto bg-white text-gray-900 font-sans">
      {/* ===== HEADER ===== */}
      <header
        className="flex items-center gap-5 p-6 border-b"
        style={{ borderColor: color.primary }}
      >
        {contact.photoUrl && (
          <img
            src={contact.photoUrl}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4"
            style={{ borderColor: color.primary }}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
            {contact.name}
          </h1>
          <h3
            className="text-lg font-medium mt-1"
            style={{ color: color.primary }}
          >
            {contact.position || "Marketing Manager"}
          </h3>
        </div>
      </header>

      {/* ===== BODY (2 COLUMNS) ===== */}
      <div className="grid grid-cols-3 gap-8 p-6">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="col-span-1 border-r pr-6" style={{ borderColor: color.primary }}>
          {/* ABOUT */}
          {objective && (
            <section className="mb-6">
              <h4
                className="text-base font-semibold uppercase mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                About Me
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{objective}</p>
            </section>
          )}

          {/* EDUCATION */}
          {education && education.length > 0 && (
            <section className="mb-6">
              <h4
                className="text-base font-semibold uppercase mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Education
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                {education.map((edu, i) => (
                  <p key={i}>
                    <b>{edu.course}</b> — {edu.institution} ({edu.year})
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* SKILLS */}
          {skills && skills.length > 0 && (
            <section className="mb-6">
              <h4
                className="text-base font-semibold uppercase mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Skills
              </h4>
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
              <h4
                className="text-base font-semibold uppercase mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Languages
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {languages.map((l, i) => (
                  <li key={i}>{l.language}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="col-span-2 pl-4">
          {/* CONTACT INFO */}
          <section className="mb-6 text-sm text-gray-700">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {contact.phone && (
                <p className="flex items-center gap-1">
                  <span>📞</span> {contact.phone}
                </p>
              )}
              {contact.email && (
                <p className="flex items-center gap-1">
                  <span>✉️</span> {contact.email}
                </p>
              )}
              {contact.linkedin && (
                <p className="flex items-center gap-1">
                  <span>🌐</span> {contact.linkedin}
                </p>
              )}
            </div>
          </section>

          {/* EXPERIENCE */}
          {experience && experience.length > 0 && (
            <section className="mb-6">
              <h4
                className="text-base font-semibold uppercase mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Experience
              </h4>
              {experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-900">
                    {exp.position}
                  </h5>
                  <p className="text-sm text-gray-600">
                    <b>{exp.company}</b> ({exp.year})
                  </p>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* REFERENCES */}
          {references && references.length > 0 && (
            <section>
              <h4
                className="text-base font-semibold uppercase mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                References
              </h4>
              <div className="grid grid-cols-2 text-sm text-gray-700 gap-y-3">
                {references.map((ref, i) => (
                  <div key={i}>
                    <p className="font-semibold">{ref.name}</p>
                    <p className="text-gray-600">{ref.desig}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Template8;

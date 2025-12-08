import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface TemplateProps {
  data: ResumeData;
  color: ResumeColor;
}

const Template7: React.FC<TemplateProps> = ({ data, color }) => {
  if (!data || !data.contact) return null;
  const { contact, objective, education, skills, languages, experience } = data;

  return (
    <div className="w-[850px] mx-auto bg-white text-gray-900 font-sans">
      {/* ===== HEADER ===== */}
      <header
        className="text-center border-b-4 py-6"
        style={{ borderColor: color.primary }}
      >
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          {contact.name}
        </h1>
        <h3
          className="text-lg font-medium mt-1"
          style={{ color: color.primary }}
        >
          {contact.position || "Marketing Manager"}
        </h3>
      </header>

      {/* ===== GRID BODY ===== */}
      <div className="grid grid-cols-3 gap-8 p-8">
        {/* LEFT COLUMN */}
        <aside className="col-span-1 border-r pr-6" style={{ borderColor: color.primary }}>
          {/* CONTACT INFO */}
          <section className="mb-6">
            <h4
              className="text-base font-semibold uppercase mb-2 border-b pb-1"
              style={{ borderColor: color.primary, color: color.primary }}
            >
              Contact
            </h4>
            <p className="text-sm text-gray-700">📞 {contact.phone}</p>
            <p className="text-sm text-gray-700">✉️ {contact.email}</p>
            <p className="text-sm text-gray-700">📍 {contact.linkedin}</p>
          </section>

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

        {/* RIGHT COLUMN */}
        <main className="col-span-2 pl-4">
          {/* PROFILE SUMMARY */}
          {objective && (
            <section className="mb-6">
              <h4
                className="text-base font-semibold uppercase mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Profile Summary
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{objective}</p>
            </section>
          )}

          {/* EXPERIENCE */}
          {experience && experience.length > 0 && (
            <section>
              <h4
                className="text-base font-semibold uppercase mb-2 border-b pb-1"
                style={{ borderColor: color.primary, color: color.primary }}
              >
                Work Experience
              </h4>
              <div className="space-y-4">
                {experience.map((exp, i) => (
                  <div key={i}>
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
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Template7;

import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface TemplateProps {
  data: ResumeData;
  color: ResumeColor;
}

const Template3: React.FC<TemplateProps> = ({ data, color }) => {
  if (!data || !data.contact) return null;
  const { contact, objective, education, skills, experience, certifications } = data;

  return (
    <div className="w-[850px] mx-auto bg-white text-gray-900 font-sans shadow-lg print:shadow-none print:border-0 px-10 py-12 leading-relaxed">
      {/* ===== HEADER ===== */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-[3px] uppercase">
          {contact.name}
        </h1>
        <h3 className="text-lg text-gray-700 font-light tracking-wide mt-1">
          {contact.position || "Real Estate Agent"}
        </h3>
        <p className="text-sm text-gray-500 mt-3">
          {contact.phone} | {contact.email} | {contact.linkedin}
        </p>
      </header>

      {/* ===== PROFILE ===== */}
      {objective && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold tracking-[3px] uppercase mb-2 text-gray-700">
            Profile
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">{objective}</p>
        </section>
      )}

      {/* ===== WORK EXPERIENCE ===== */}
      {experience && experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold tracking-[3px] uppercase mb-4 text-gray-700">
            Work Experience
          </h2>

          {experience.map((exp, i) => (
            <div key={i} className="mb-6">
              <p className="text-[13px] text-gray-800 font-semibold uppercase tracking-wide">
                {exp.position}
              </p>
              <p className="text-sm text-gray-700 italic">
                {exp.company} <span className="not-italic">({exp.year})</span>
              </p>
              {exp.description && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ===== EDUCATION + SKILLS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* EDUCATION */}
        {education && education.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold tracking-[3px] uppercase mb-3 text-gray-700">
              Education
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              {education.map((edu, i) => (
                <div key={i}>
                  <p className="font-semibold">{edu.institution}</p>
                  <p className="italic">{edu.year}</p>
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
            <h2 className="text-xs font-semibold tracking-[3px] uppercase mb-3 text-gray-700">
              Skills
            </h2>
            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
              {skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* ===== CERTIFICATIONS ===== */}
      {certifications && certifications.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold tracking-[3px] uppercase mb-3 text-gray-700">
            Certifications
          </h2>
          <div className="text-sm text-gray-800 space-y-1">
            {certifications.map((cert, i) => (
              <p key={i}>
                {cert.course}
                {cert.institution && (
                  <span className="text-gray-600"> — {cert.institution}</span>
                )}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Template3;

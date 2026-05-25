import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface TemplateProps {
  data: ResumeData;
  color: ResumeColor;
}

const Template5: React.FC<TemplateProps> = ({ data, color }) => {
  if (!data || !data.contact) return null;
  const { contact, objective, education, skills, languages, experience, references } = data;

  return (
    <div className="w-[900px] mx-auto bg-white text-gray-900 font-sans flex">
      {/* ===== LEFT SIDEBAR ===== */}
      <aside
        className="w-[35%] text-white p-6 flex flex-col items-center"
        style={{ backgroundColor: color.background }}
      >
        {/* PHOTO */}
        {contact.photoUrl && (
          <img
            src={contact.photoUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mb-4 border-4"
            style={{ borderColor: color.primary }}
          />
        )}

        {/* CONTACT */}
        <section className="w-full mb-6">
          <h4 className="text-lg font-semibold border-b border-gray-400 pb-1 mb-2">
            Contact
          </h4>
          <p className="text-sm">📞 {contact.phone}</p>
          <p className="text-sm">✉️ {contact.email}</p>
          <p className="text-sm">📍 {contact.linkedin}</p>
        </section>

        {/* EDUCATION */}
        {education && education.length > 0 && (
          <section className="w-full mb-6">
            <h4 className="text-lg font-semibold border-b border-gray-400 pb-1 mb-2">
              Education
            </h4>
            <ul className="space-y-2 text-sm">
              {education.map((edu, i) => (
                <li key={i}>
                  <p className="font-medium">{edu.year}</p>
                  <p>{edu.course}</p>
                  <p className="text-gray-200 text-xs">{edu.institution}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* SKILLS */}
        {skills && skills.length > 0 && (
          <section className="w-full mb-6">
            <h4 className="text-lg font-semibold border-b border-gray-400 pb-1 mb-2">
              Expertise
            </h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        {/* LANGUAGES */}
        {languages && languages.length > 0 && (
          <section className="w-full">
            <h4 className="text-lg font-semibold border-b border-gray-400 pb-1 mb-2">
              Languages
            </h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {languages.map((l, i) => (
                <li key={i}>{l.language}</li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="w-[65%] p-8">
        {/* HEADER */}
        <header className="mb-4">
          <h1 className="text-3xl font-bold uppercase">{contact.name}</h1>
          <h3 className="text-lg font-medium mt-1" style={{ color: color.primary }}>
            {contact.position || "Marketing Manager"}
          </h3>
        </header>

        {/* OBJECTIVE / SUMMARY */}
        {objective && (
          <section className="mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">{objective}</p>
          </section>
        )}

        {/* EXPERIENCE */}
        {experience && experience.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-lg font-semibold uppercase mb-2 border-b pb-1"
              style={{ borderColor: color.primary, color: color.primary }}
            >
              Experience
            </h2>
            <div className="relative ml-4 border-l-2 border-gray-300 pl-4 space-y-6">
              {experience.map((exp, i) => (
                <div key={i} className="relative">
                  <div
                    className="absolute -left-[9px] w-4 h-4 rounded-full"
                    style={{ backgroundColor: color.primary }}
                  ></div>
                  <p className="text-sm text-gray-500">{exp.year}</p>
                  <h4 className="text-base font-semibold">{exp.position}</h4>
                  <p className="text-sm text-gray-700 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REFERENCES */}
        {references && references.length > 0 && (
          <section>
            <h2
              className="text-lg font-semibold uppercase mb-2 border-b pb-1"
              style={{ borderColor: color.primary, color: color.primary }}
            >
              Reference
            </h2>
            <div className="grid grid-cols-2 text-sm text-gray-700 gap-y-3">
              {references.map((ref, i) => (
                <div key={i}>
                  <p className="font-semibold">{ref.name}</p>
                  <p className="text-gray-600">{ref.desig}</p>
                  {ref.phone && <p>📞 {ref.phone}</p>}
                  {ref.email && <p>✉️ {ref.email}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Template5;

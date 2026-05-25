import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface TemplateProps {
  data: ResumeData;
  color: ResumeColor;
}

const Template4: React.FC<TemplateProps> = ({ data, color }) => {
  if (!data || !data.contact) return null;
  const { contact, objective, education, skills, languages, experience } = data;

  return (
    <div className="w-[900px] mx-auto bg-white font-sans text-gray-900 flex min-h-[1000px] shadow-2xl">
      {/* ===== LEFT SIDEBAR ===== */}
      <aside
        className="w-[35%] text-white p-8 flex flex-col justify-start items-center relative"
        style={{ backgroundColor: color.background }}
      >
        {/* PHOTO */}
        {contact.photoUrl && (
          <div className="relative mb-8">
            <div className="w-40 h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-xl">
              <img
                src={contact.photoUrl}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}

        {/* ABOUT ME */}
        <section className="text-center mb-8 w-full">
          <h3 className="text-lg font-bold mb-3 border-b border-white/30 inline-block pb-1 tracking-wide">
            ABOUT ME
          </h3>
          <p className="text-sm text-white/90 mt-2 leading-relaxed text-left">{objective}</p>
        </section>

        {/* CONTACT */}
        <section className="w-full mb-8">
          <h3 className="text-lg font-bold mb-3 border-b border-white/30 inline-block pb-1 tracking-wide">
            CONTACT
          </h3>
          <div className="space-y-3 text-sm text-white/90">
            {contact.phone && (
              <p className="flex items-center gap-3">
                <span className="text-lg">📞</span> <span>{contact.phone}</span>
              </p>
            )}
            {contact.email && (
              <p className="flex items-center gap-3">
                <span className="text-lg">✉️</span> <span className="break-all">{contact.email}</span>
              </p>
            )}
            {contact.linkedin && (
              <p className="flex items-center gap-3">
                <span className="text-lg">📍</span> <span>{contact.linkedin}</span>
              </p>
            )}
            {contact.address && (
              <p className="flex items-center gap-3">
                <span className="text-lg">🏠</span> <span>{contact.address}</span>
              </p>
            )}
          </div>
        </section>

        {/* LANGUAGES */}
        {languages && languages.length > 0 && (
          <section className="w-full mb-8">
            <h3 className="text-lg font-bold mb-3 border-b border-white/30 inline-block pb-1 tracking-wide">
              LANGUAGES
            </h3>
            <ul className="space-y-2 text-sm text-white/90">
              {languages.map((l, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>{l.language}</span>
                  <span className="text-xs opacity-75">
                    {typeof l.level === 'number' ? '★'.repeat(l.level) : l.level}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* EXPERTISE */}
        {skills && skills.length > 0 && (
          <section className="w-full">
            <h3 className="text-lg font-bold mb-3 border-b border-white/30 inline-block pb-1 tracking-wide">
              EXPERTISE
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 10).map((s, i) => (
                <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs text-white/90">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="w-[65%] flex flex-col">
        {/* HEADER BANNER */}
        <header
          className="w-full p-10 text-white flex flex-col justify-center"
          style={{ backgroundColor: color.primary }}
        >
          <h1 className="text-4xl font-extrabold uppercase tracking-tight leading-tight mb-2">
            {contact.name}
          </h1>
          <h2 className="text-xl font-medium opacity-90 tracking-wide">
            {contact.position || "Product Designer"}
          </h2>
        </header>

        <div className="p-10 space-y-8">
          {/* EXPERIENCE SECTION */}
          {experience && experience.length > 0 && (
            <section>
              <h2
                className="text-xl font-bold uppercase mb-4 flex items-center gap-3"
                style={{ color: color.primary }}
              >
                <span className="w-8 h-1 bg-current"></span>
                Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-gray-200">
                    <div
                      className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white"
                      style={{ borderColor: color.primary }}
                    ></div>
                    <div className="mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{exp.position}</h4>
                      <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
                        <span>{exp.company}</span>
                        <span>{exp.year}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mt-2">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EDUCATION SECTION */}
          {education && education.length > 0 && (
            <section>
              <h2
                className="text-xl font-bold uppercase mb-4 flex items-center gap-3"
                style={{ color: color.primary }}
              >
                <span className="w-8 h-1 bg-current"></span>
                Education
              </h2>
              <div className="space-y-5">
                {education.map((edu, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: color.primary }}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900">{edu.course}</h4>
                      <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded shadow-sm">{edu.year}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{edu.institution}</p>
                    {edu.description && (
                      <p className="text-gray-600 text-sm mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CERTIFICATIONS SECTION (Added as it was missing in original but present in data) */}
          {data.certifications && data.certifications.length > 0 && (
            <section>
              <h2
                className="text-xl font-bold uppercase mb-4 flex items-center gap-3"
                style={{ color: color.primary }}
              >
                <span className="w-8 h-1 bg-current"></span>
                Certifications
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {data.certifications.map((cert, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg mt-0.5" style={{ color: color.primary }}>🏆</span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{cert.course}</h4>
                      <p className="text-gray-600 text-xs">{cert.institution} • {cert.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Template4;

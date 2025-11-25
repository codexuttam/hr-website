import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface TemplateProps {
  data: ResumeData;
  color: ResumeColor;
}

const Template9: React.FC<TemplateProps> = ({ data, color }) => {
  const { contact, objective, education, projects, certifications, experience, skills } = data;

  return (
    <div className="w-[850px] mx-auto bg-white text-gray-900 font-sans p-10 shadow-2xl min-h-[1100px]">
      {/* ===== HEADER ===== */}
      <header className="border-b-2 pb-6 mb-8 flex items-center justify-between gap-6" style={{ borderColor: color.primary }}>
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold uppercase tracking-wide text-gray-900 mb-2">{contact.name}</h1>
          <h3 className="text-xl font-medium" style={{ color: color.primary }}>
            {contact.position || "Professional"}
          </h3>

          {/* Contact Grid */}
          <div className="mt-4 grid grid-cols-2 gap-y-1 gap-x-4 text-sm text-gray-600">
            {contact.phone && (
              <p className="flex items-center gap-2">
                <span>📞</span> {contact.phone}
              </p>
            )}
            {contact.email && (
              <p className="flex items-center gap-2">
                <span>✉️</span> {contact.email}
              </p>
            )}
            {contact.linkedin && (
              <p className="flex items-center gap-2">
                <span>in</span> {contact.linkedin.replace(/^https?:\/\//, '')}
              </p>
            )}
            {contact.address && (
              <p className="flex items-center gap-2">
                <span>📍</span> {contact.address}
              </p>
            )}
          </div>
        </div>

        {/* Photo */}
        {contact.photoUrl && (
          <div className="shrink-0">
            <div
              className="w-32 h-32 rounded-xl overflow-hidden border-4 shadow-md"
              style={{ borderColor: color.primary }}
            >
              <img
                src={contact.photoUrl}
                alt={contact.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* ===== PROFESSIONAL SUMMARY ===== */}
        {objective && (
          <section>
            <h2
              className="text-lg font-bold uppercase mb-3 flex items-center gap-2"
              style={{ color: color.primary }}
            >
              <span className="w-2 h-8 rounded-sm" style={{ backgroundColor: color.primary }}></span>
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">{objective}</p>
          </section>
        )}

        {/* ===== EXPERIENCE ===== */}
        {experience && experience.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold uppercase mb-4 flex items-center gap-2"
              style={{ color: color.primary }}
            >
              <span className="w-2 h-8 rounded-sm" style={{ backgroundColor: color.primary }}></span>
              Work Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-gray-100">
                  <div
                    className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color.primary }}
                  ></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-lg">{exp.position}</h4>
                    <span className="text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">{exp.year}</span>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">{exp.company}</p>
                  <p className="text-gray-600 text-sm leading-relaxed text-justify">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== EDUCATION ===== */}
        {education && education.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold uppercase mb-4 flex items-center gap-2"
              style={{ color: color.primary }}
            >
              <span className="w-2 h-8 rounded-sm" style={{ backgroundColor: color.primary }}></span>
              Education
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {education.map((edu, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <h4 className="font-bold text-gray-900">{edu.course}</h4>
                  <p className="text-gray-700 font-medium">{edu.institution}</p>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>{edu.year}</span>
                    {edu.percentage && <span>Grade: {edu.percentage}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== SKILLS & PROJECTS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SKILLS */}
          {skills && skills.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold uppercase mb-4 flex items-center gap-2"
                style={{ color: color.primary }}
              >
                <span className="w-2 h-8 rounded-sm" style={{ backgroundColor: color.primary }}></span>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {projects && projects.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold uppercase mb-4 flex items-center gap-2"
                style={{ color: color.primary }}
              >
                <span className="w-2 h-8 rounded-sm" style={{ backgroundColor: color.primary }}></span>
                Key Projects
              </h2>
              <div className="space-y-4">
                {projects.map((p, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-gray-900 text-sm flex items-center justify-between">
                      {p.title}
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs font-normal">
                          Link ↗
                        </a>
                      )}
                    </h4>
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ===== CERTIFICATIONS ===== */}
        {certifications && certifications.length > 0 && (
          <section>
            <h2
              className="text-lg font-bold uppercase mb-4 flex items-center gap-2"
              style={{ color: color.primary }}
            >
              <span className="w-2 h-8 rounded-sm" style={{ backgroundColor: color.primary }}></span>
              Certifications
            </h2>
            <div className="flex flex-wrap gap-4">
              {certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                  <span className="text-xl">🏆</span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{cert.course}</h4>
                    <p className="text-gray-500 text-xs">{cert.institution} • {cert.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Template9;

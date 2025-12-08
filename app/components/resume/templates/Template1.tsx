import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface Template0Props {
  data: ResumeData;
  color: ResumeColor;
}

const Template0: React.FC<Template0Props> = ({ data, color }) => {
  if (!data || !data.contact) {
    return null;
  }
  const { contact, objective, education, experience, skills, references } = data;

  const show = (item?: any) =>
    item && (Array.isArray(item) ? item.length > 0 : !!item);

  return (
    <div
      className="w-[850px] mx-auto bg-white text-gray-900 font-sans p-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center gap-4">
          {contact.photoUrl && (
            <img
              src={contact.photoUrl}
              alt={contact.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-300"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase">
              {contact.name}
            </h1>
            {contact.position && (
              <p className="text-lg text-gray-500 font-medium">
                {contact.position}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-700 leading-6">
          {contact.phone && (
            <p className="flex items-center gap-2">
              📞 <span>{contact.phone}</span>
            </p>
          )}
          {contact.email && (
            <p className="flex items-center gap-2">
              ✉️ <span>{contact.email}</span>
            </p>
          )}
          {contact.linkedin && (
            <p className="flex items-center gap-2">
              🔗 <a href={contact.linkedin}>{contact.linkedin}</a>
            </p>
          )}
          {contact.github && (
            <p className="flex items-center gap-2">
              💻 <a href={contact.github}>{contact.github}</a>
            </p>
          )}
        </div>
      </div>

      {/* ABOUT ME */}
      {show(objective) && (
        <div className="mb-6">
          <h2
            className="text-lg font-semibold uppercase mb-2 border-b-2 pb-1"
            style={{ borderColor: color.primary, color: color.primary }}
          >
            About Me
          </h2>
          <p className="text-sm text-gray-700 leading-6">{objective}</p>
        </div>
      )}

      {/* EDUCATION */}
      {show(education) && (
        <div className="mb-6">
          <h2
            className="text-lg font-semibold uppercase mb-2 border-b-2 pb-1"
            style={{ borderColor: color.primary, color: color.primary }}
          >
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index}>
                <p className="text-sm font-semibold">
                  {edu.year} —{" "}
                  <span className="font-medium text-gray-800">
                    {edu.course}
                  </span>
                </p>
                <p className="text-sm italic text-gray-600">
                  {edu.institution}
                </p>
                <p className="text-sm text-gray-700">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXPERIENCE */}
      {show(experience) && (
        <div className="mb-6">
          <h2
            className="text-lg font-semibold uppercase mb-2 border-b-2 pb-1"
            style={{ borderColor: color.primary, color: color.primary }}
          >
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index}>
                <p className="text-sm font-semibold">
                  {exp.year} —{" "}
                  <span className="font-medium text-gray-800">
                    {exp.position}
                  </span>
                </p>
                <p className="text-sm italic text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS */}
      {show(skills) && (
        <div className="mb-6">
          <h2
            className="text-lg font-semibold uppercase mb-2 border-b-2 pb-1"
            style={{ borderColor: color.primary, color: color.primary }}
          >
            Skills
          </h2>
          <ul className="grid grid-cols-2 text-sm gap-y-1 list-disc list-inside">
            {skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
      )}

      {/* REFERENCES */}
      {show(references) && (
        <div>
          <h2
            className="text-lg font-semibold uppercase mb-2 border-b-2 pb-1"
            style={{ borderColor: color.primary, color: color.primary }}
          >
            References
          </h2>
          <div className="grid grid-cols-2 text-sm gap-y-2">
            {references.map((ref, index) => (
              <div key={index}>
                <p className="font-semibold text-gray-900">{ref.name}</p>
                <p className="text-gray-600">{ref.desig}</p>
                {ref.phone && <p>📞 {ref.phone}</p>}
                {ref.email && <p>✉️ {ref.email}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Template0;

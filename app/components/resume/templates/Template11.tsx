import React from "react";
import { ResumeData, ResumeColor } from "../../../types/resume";

interface TemplateProps {
    data: ResumeData;
    color: ResumeColor;
}

const Template11: React.FC<TemplateProps> = ({ data, color }) => {
    if (!data || !data.contact) return null;
    const { contact, objective, skills, experience, projects, education, certifications, activities } = data;

    // Helper to check if section has data
    const hasData = (arr: any[] | undefined) => arr && arr.length > 0;

    return (
        <div className="w-[850px] mx-auto bg-white text-gray-900 font-serif p-8 leading-relaxed">
            {/* HEADER */}
            <header className="mb-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h1
                            className="text-4xl font-bold tracking-wide mb-2"
                            style={{ color: color.primary }}
                        >
                            {contact.name}
                        </h1>
                    </div>
                    <div className="text-right text-sm">
                        <div className="flex flex-col items-end gap-1">
                            {contact.email && (
                                <a href={`mailto:${contact.email}`} className="text-blue-700 hover:underline">
                                    {contact.email}
                                </a>
                            )}
                            {contact.phone && <span>{contact.phone}</span>}
                        </div>
                    </div>
                </div>

                <div className="mt-1 flex flex-wrap gap-4 text-sm text-blue-700">
                    {contact.linkedin && (
                        <a href={contact.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                            LinkedIn: {contact.linkedin}
                        </a>
                    )}
                    {contact.github && (
                        <a href={contact.github} target="_blank" rel="noreferrer" className="hover:underline">
                            GitHub: {contact.github}
                        </a>
                    )}
                </div>
            </header>

            {/* SKILLS */}
            {hasData(skills) && (
                <section className="mb-4">
                    <h2
                        className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider text-blue-800"
                        style={{ color: color.primary, borderColor: color.primary }}
                    >
                        Skills
                    </h2>
                    <div className="text-sm">
                        <ul className="list-disc list-inside">
                            {/* Since we don't have categories in standard data, we just list them cleanly. 
                    If the user entered "Category: Skill", we could parse it, but standard use is just list.
                    We'll display them as a comma-separated list or a grid to be compact.
                */}
                            <li className="flex flex-wrap gap-2">
                                <span className="font-bold">Key Skills:</span>
                                <span>{skills.join(", ")}</span>
                            </li>
                        </ul>
                    </div>
                </section>
            )}

            {/* INTERNSHIP / EXPERIENCE */}
            {hasData(experience) && (
                <section className="mb-4">
                    <h2
                        className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider"
                        style={{ color: color.primary, borderColor: color.primary }}
                    >
                        Experience
                    </h2>
                    <div className="space-y-3">
                        {experience.map((exp, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-900 text-base">
                                        {exp.company}
                                    </h3>
                                    <span className="text-sm italic">{exp.year}</span>
                                </div>
                                <div className="mb-1 text-sm font-medium italic">
                                    {exp.position}
                                </div>
                                {exp.description && (
                                    <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                                        {exp.description.split('.').filter(s => s.trim()).map((sentence, idx) => (
                                            <li key={idx}>{sentence.trim()}.</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJECTS */}
            {hasData(projects) && (
                <section className="mb-4">
                    <h2
                        className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider"
                        style={{ color: color.primary, borderColor: color.primary }}
                    >
                        Projects
                    </h2>
                    <div className="space-y-3">
                        {projects?.map((proj, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base" style={{ color: color.primary }}>
                                            {proj.title}
                                        </h3>
                                        {/* If description contains tech stack like | React, Node | we could parse it, but standard is just description. */}
                                        {proj.link && (
                                            <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                                                [Link]
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {proj.description && (
                                    <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                                        {proj.description.split('.').filter(s => s.trim()).map((sentence, idx) => (
                                            <li key={idx}>{sentence.trim()}.</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CERTIFICATES */}
            {hasData(certifications) && (
                <section className="mb-4">
                    <h2
                        className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider"
                        style={{ color: color.primary, borderColor: color.primary }}
                    >
                        Certificates
                    </h2>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {certifications.map((cert, i) => (
                            <li key={i}>
                                <span className="font-medium text-gray-900">{cert.course}</span>
                                {cert.institution && <span> | {cert.institution}</span>}
                                {cert.year && <span className="float-right italic text-sm">{cert.year}</span>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* EXTRACURRICULAR ACTIVITIES (Mapped from activities) */}
            {hasData(activities) && (
                <section className="mb-4">
                    <h2
                        className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider"
                        style={{ color: color.primary, borderColor: color.primary }}
                    >
                        Extracurricular Activities
                    </h2>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {activities?.map((act, i) => (
                            <li key={i}>
                                {act.title}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* EDUCATION */}
            {hasData(education) && (
                <section className="mb-4">
                    <h2
                        className="text-lg font-bold uppercase border-b border-gray-400 mb-2 tracking-wider"
                        style={{ color: color.primary, borderColor: color.primary }}
                    >
                        Education
                    </h2>
                    <div className="space-y-2">
                        {education.map((edu, i) => (
                            <div key={i} className="flex justify-between items-start text-sm">
                                <div>
                                    <h3 className="font-bold text-base" style={{ color: color.primary }}>{edu.institution}</h3>
                                    <p className="italic text-gray-800">{edu.course}</p>
                                </div>
                                <div className="text-right">
                                    <p className="italic">{edu.year}</p>
                                    {edu.percentage && <p className="font-semibold">GPA/Percentage: {edu.percentage}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Template11;

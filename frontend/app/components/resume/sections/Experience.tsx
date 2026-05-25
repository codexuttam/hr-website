import React from 'react';

interface ExperienceProps {
  data: any;
  color: any;
}

const Experience: React.FC<ExperienceProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>EXPERIENCE</h3>
      <div className='experience-list'>
        {data.experience.map((exp: any, index: number) => (
          <div key={index} className='experience-item'>
            <div className='timeline'>
              <p className='duration'>{exp.year || exp.duration || ''}</p>
              <p className='company'>{exp.company || ''}</p>
            </div>
            <div className='details'>
              <p className='position'>{exp.position || ''}</p>
              {exp.description && <p className='description'>{exp.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Experience;

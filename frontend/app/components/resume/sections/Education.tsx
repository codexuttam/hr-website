import React from 'react';

interface EducationProps {
  data: any;
  color: any;
}

const Education: React.FC<EducationProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>EDUCATION</h3>
      <div className='education-list'>
        {data.education.map((edu: any, index: number) => (
          <div key={index} className='education-item'>
            <div className='timeline'>
              <p className='duration'>{edu.year || edu.duration || ''}</p>
              <p className='institution'>{edu.institution || ''}</p>
            </div>
            <div className='details'>
              <p className='degree'>{edu.course || edu.degree || ''}</p>
              {(edu.achievements || edu.description) && (
                <p className='description'>{edu.achievements || edu.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Education;

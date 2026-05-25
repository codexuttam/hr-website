import React from 'react';

interface SkillsProps {
  data: any;
  color: any;
}

const Skills: React.FC<SkillsProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>SKILLS</h3>
      <div className='skills-list'>
        {data.skills.map((skill: string, index: number) => (
          <div key={index} className='skill-item' style={{ backgroundColor: color.skills }}>
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;

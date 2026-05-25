import React from 'react';

interface InterestsProps {
  data: any;
  color: any;
}

const Interests: React.FC<InterestsProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>INTERESTS</h3>
      <div className='interests-list'>
        {data.interests.map((interest: string, index: number) => (
          <p key={index} className='interest-item'>• {interest}</p>
        ))}
      </div>
    </div>
  );
};

export default Interests;

import React from 'react';

interface ObjectiveProps {
  data: any;
  color: any;
}

const Objective: React.FC<ObjectiveProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>ABOUT ME</h3>
      <p className='objective-text'>{data.objective}</p>
    </div>
  );
};

export default Objective;

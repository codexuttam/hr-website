import React from 'react';

interface WorkshopsProps {
  data: any;
  color: any;
}

const Workshops: React.FC<WorkshopsProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>WORKSHOPS</h3>
      <div className='workshops-list'>
        {data.workshops.map((workshop: any, index: number) => (
          <div key={index} className='workshop-item'>
            <p className='workshop-name'>{workshop.name}</p>
            <p className='workshop-date'>{workshop.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workshops;

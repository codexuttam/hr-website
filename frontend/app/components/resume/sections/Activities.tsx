import React from 'react';

interface ActivitiesProps {
  data: any;
  color: any;
}

const Activities: React.FC<ActivitiesProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>ACTIVITIES</h3>
      <div className='activities-list'>
        {data.activities.map((activity: any, index: number) => (
          <div key={index} className='activity-item'>
            <p className='activity-name'>{activity.name}</p>
            {activity.description && <p className='activity-description'>{activity.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;

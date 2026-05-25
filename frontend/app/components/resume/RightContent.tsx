import React from 'react';
import Objective from './sections/Objective';
import Education from './sections/Education';
import Experience from './sections/Experience';
import Certifications from './sections/Certifications';
import Projects from './sections/Projects';
import Workshops from './sections/Workshops';
import Activities from './sections/Activities';

interface RightContentProps {
  data: any;
  color: any;
}

const RightContent: React.FC<RightContentProps> = ({ data, color }) => {
  const show = (item: any) => item && item.length > 0;

  return (
    <div className='right-content'>
      {show(data.objective) && <Objective data={data} color={color} />}
      {show(data.education) && <Education data={data} color={color} />}
      {show(data.experience) && <Experience data={data} color={color} />}
      {show(data.certifications) && <Certifications data={data} color={color} />}
      {show(data.projects) && <Projects data={data} color={color} />}
      {show(data.workshops) && <Workshops data={data} color={color} />}
      {show(data.activities) && <Activities data={data} color={color} />}
    </div>
  );
};

export default RightContent;

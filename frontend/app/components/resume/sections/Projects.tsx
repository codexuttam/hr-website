import React from 'react';

interface ProjectsProps {
  data: any;
  color: any;
}

const Projects: React.FC<ProjectsProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>PROJECTS</h3>
      <div className='projects-list'>
        {data.projects.map((project: any, index: number) => (
          <div key={index} className='project-item'>
            <p className='project-name'>{project.name}</p>
            <p className='project-duration'>{project.duration}</p>
            {project.technologies && (
              <p className='project-tech'>Technologies: {project.technologies.join(', ')}</p>
            )}
            {project.description && <p className='project-description'>{project.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;

import React from 'react';
import Image from 'next/image';

interface DisplayTechIconsProps {
  techStack: string[];
  maxIcons?: number;
}

const DisplayTechIcons: React.FC<DisplayTechIconsProps> = ({ 
  techStack, 
  maxIcons = 4 
}) => {
  const getTechIcon = (tech: string): string => {
    const techLower = tech.toLowerCase();
    
    // Map common technologies to their icons
    const iconMap: { [key: string]: string } = {
      'react': '/icons/react.svg',
      'javascript': '/icons/javascript.svg',
      'typescript': '/icons/typescript.svg',
      'node.js': '/icons/nodejs.svg',
      'nodejs': '/icons/nodejs.svg',
      'python': '/icons/python.svg',
      'java': '/icons/java.svg',
      'html': '/icons/html.svg',
      'css': '/icons/css.svg',
      'mongodb': '/icons/mongodb.svg',
      'postgresql': '/icons/postgresql.svg',
      'mysql': '/icons/mysql.svg',
      'express': '/icons/express.svg',
      'vue': '/icons/vue.svg',
      'angular': '/icons/angular.svg',
      'docker': '/icons/docker.svg',
      'aws': '/icons/aws.svg',
      'git': '/icons/git.svg',
    };

    return iconMap[techLower] || '/icons/default-tech.svg';
  };

  const displayedTech = techStack.slice(0, maxIcons);
  const remainingCount = techStack.length - maxIcons;

  return (
    <div className="flex items-center gap-2">
      {displayedTech.map((tech, index) => (
        <div
          key={index}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
          title={tech}
        >
          <Image
            src={getTechIcon(tech)}
            alt={tech}
            width={20}
            height={20}
            className="object-contain"
            onError={(e) => {
              // Fallback to text if icon doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = tech.charAt(0).toUpperCase();
                parent.className += ' text-xs font-medium text-gray-600 dark:text-gray-300';
              }
            }}
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default DisplayTechIcons;
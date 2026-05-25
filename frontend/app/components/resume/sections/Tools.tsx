import React from 'react';

interface ToolsProps {
  data: any;
  color: any;
}

const Tools: React.FC<ToolsProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>TOOLS</h3>
      <div className='tools-list'>
        {data.tools.map((tool: string, index: number) => (
          <p key={index} className='tool-item'>• {tool}</p>
        ))}
      </div>
    </div>
  );
};

export default Tools;

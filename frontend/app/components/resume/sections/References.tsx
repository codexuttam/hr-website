import React from 'react';

interface ReferencesProps {
  data: any;
  color: any;
}

const References: React.FC<ReferencesProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>REFERENCES</h3>
      <div className='references-list'>
        {data.references.map((ref: any, index: number) => (
          <div key={index} className='reference-item'>
            <p className='reference-name'>{ref.name || ''}</p>
            <p className='reference-position'>{ref.desig || ref.position || ''}</p>
            {ref.phone && <p className='reference-contact'>📞 {ref.phone}</p>}
            {ref.email && <p className='reference-contact'>✉️ {ref.email}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default References;

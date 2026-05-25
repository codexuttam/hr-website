import React from 'react';

interface LanguagesProps {
  data: any;
  color: any;
}

const Languages: React.FC<LanguagesProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>LANGUAGES</h3>
      <div className='languages-list'>
        {data.languages.map((lang: any, index: number) => (
          <div key={index} className='language-item'>
            <span className='language-name'>{lang.name}</span>
            <div className='language-level'>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className='level-dot'
                  style={{
                    backgroundColor: i < lang.level ? color.primary : '#ddd'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Languages;

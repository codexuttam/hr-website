import React from 'react';

interface CertificationsProps {
  data: any;
  color: any;
}

const Certifications: React.FC<CertificationsProps> = ({ data, color }) => {
  return (
    <div className='section'>
      <h3 className='section-title' style={{ color: color.primary }}>CERTIFICATIONS</h3>
      <div className='certifications-list'>
        {data.certifications.map((cert: any, index: number) => (
          <div key={index} className='certification-item'>
            <p className='cert-name'>{cert.name}</p>
            <p className='cert-issuer'>{cert.issuer} - {cert.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certifications;

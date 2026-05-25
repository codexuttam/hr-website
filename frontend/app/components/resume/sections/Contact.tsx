
import React from 'react';

interface ContactProps {
  data: any;
  color: any;
}

const Contact: React.FC<ContactProps> = ({ data, color }) => {
  const { name, photoUrl, location, phone, email, linkedin, github } = data.contact;

  return (
    <div className='contact-section'>
      <div className='photo-container'>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className='profile-photo' />
        ) : (
          <span>👤</span>
        )}
      </div>
      <div className='contact-info'>
        <h1 className='name'>{name || 'YOUR NAME'}</h1>
        <p className='title'>Web Designer</p>
        <div className='contact-details'>
          {phone && <div className='contact-item'>📞 {phone}</div>}
          {email && <div className='contact-item'>✉️ {email}</div>}
          {location && <div className='contact-item'>📍 {location}</div>}
          {linkedin && <div className='contact-item'>🔗 {linkedin}</div>}
          {github && <div className='contact-item'>💻 {github}</div>}
        </div>
      </div>
    </div>
  );
};

export default Contact;

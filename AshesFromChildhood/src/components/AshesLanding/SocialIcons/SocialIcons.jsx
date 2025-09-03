/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import './SocialIcons.css';

const SocialIcons = () => {
  const [isHovered, setIsHovered] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleMouseMove = (e, platform) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15;
    setMousePosition({ x, y });
  };

  // Proper Facebook Icon
  const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="social-svg" fill="none">
      <circle cx="12" cy="12" r="12" fill="url(#facebookGradient)"/>
      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" fill="white"/>
      <defs>
        <linearGradient id="facebookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1877f2"/>
          <stop offset="100%" stopColor="#42a5f5"/>
        </linearGradient>
      </defs>
    </svg>
  );

  // Proper Viber Icon  
  const ViberIcon = () => (
    <svg viewBox="0 0 24 24" className="social-svg" fill="none">
      <circle cx="12" cy="12" r="12" fill="url(#viberGradient)"/>
      <path d="M11.4 3.9c3.9.1 7.1 3.2 7.2 7.2v.4c0 .2-.1.3-.3.3s-.3-.1-.3-.3v-.4c-.1-3.4-2.9-6.2-6.3-6.3h-.4c-.2 0-.3-.1-.3-.3s.1-.3.3-.3h.1zm.1 2.1c2.5.1 4.5 2.1 4.6 4.6v.2c0 .2-.1.3-.3.3s-.3-.1-.3-.3v-.2c-.1-2.1-1.7-3.7-3.8-3.8h-.2c-.2 0-.3-.1-.3-.3s.1-.3.3-.3zm.1 2.1c1.1.1 2 .9 2.1 2v.1c0 .2-.1.3-.3.3s-.3-.1-.3-.3v-.1c-.1-.7-.6-1.2-1.3-1.3h-.1c-.2 0-.3-.1-.3-.3s.1-.3.3-.3zm4.2 6.4c-.2.2-.4.3-.7.3-.7 0-1.3-.2-1.9-.5l-1.8-1c-.1-.1-.3-.1-.4 0l-2.2 1.2c-.6.3-1.2.5-1.9.5-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l.9-.9c.1-.1.1-.3 0-.4l-1-1.8c-.3-.6-.5-1.2-.5-1.9 0-.3.1-.5.3-.7.4-.4 1-.4 1.4 0l.9.9c.1.1.3.1.4 0l1.8-1c.6-.3 1.2-.5 1.9-.5.3 0 .5.1.7.3.4.4.4 1 0 1.4l-.9.9c-.1.1-.1.3 0 .4l1 1.8c.3.6.5 1.2.5 1.9 0 .3-.1.5-.3.7-.4.4-1 .4-1.4 0z" fill="white"/>
      <defs>
        <linearGradient id="viberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#665cac"/>
          <stop offset="50%" stopColor="#8e7cc3"/>
          <stop offset="100%" stopColor="#665cac"/>
        </linearGradient>
      </defs>
    </svg>
  );

  const socialLinks = [
    {
      platform: 'facebook',
      url: 'https://facebook.com/asheschildhood',
      icon: <FacebookIcon />,
      gradient: 'linear-gradient(135deg, #1877f2, #42a5f5)',
      name: 'Facebook',
      label: 'Последвайте в Facebook'
    },
    {
      platform: 'viber', 
      url: 'viber://chat?number=+359123456789',
      icon: <ViberIcon />,
      gradient: 'linear-gradient(135deg, #665cac, #8e7cc3)',
      name: 'Viber',
      label: 'Свържете се във Viber'
    }
  ];

  return (
    <div className={`social-icons-container ${isVisible ? 'visible' : ''}`}>
      
      {/* Background Effects */}
      <div className="social-atmosphere">
        <div className="atmosphere-ring ring-1"></div>
        <div className="atmosphere-ring ring-2"></div>
      </div>

      {/* Social Icons */}
      <div className="social-icons-wrapper">
        {socialLinks.map((social, index) => (
          <div 
            key={social.platform}
            className={`social-icon-container ${isHovered === social.platform ? 'hovered' : ''}`}
            style={{ 
              animationDelay: `${index * 0.3}s`,
              transform: isHovered === social.platform 
                ? `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale(1.15)` 
                : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
            }}
            onMouseEnter={() => setIsHovered(social.platform)}
            onMouseLeave={() => setIsHovered(null)}
            onMouseMove={(e) => handleMouseMove(e, social.platform)}
          >
            
            {/* 3D Icon Structure */}
            <div className="social-icon-3d">
              
              {/* Icon Base */}
              <div className="icon-base">
                <div className="base-glow"></div>
              </div>
              
              {/* Icon Face */}
              <div className="icon-face">
                <div className="icon-content">
                  {social.icon}
                </div>
                <div className="face-shine"></div>
              </div>
              
              {/* 3D Sides */}
              <div className="icon-side side-top"></div>
              <div className="icon-side side-right"></div>
              
              {/* Floating Ring */}
              <div className="floating-ring">
                <div className="ring-inner"></div>
              </div>
            </div>

            {/* Platform Label */}
            <div className="platform-label">
              <span className="label-text">{social.name}</span>
            </div>

            {/* Hover Tooltip */}
            <div className="social-tooltip">
              <span className="tooltip-text">{social.label}</span>
              <div className="tooltip-arrow"></div>
            </div>

            {/* Click Link */}
            <a 
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label={social.label}
            ></a>
          </div>
        ))}
      </div>

      {/* Connection Line */}
      <div className="connection-line">
        <div className="line-glow"></div>
      </div>
    </div>
  );
};

export default SocialIcons;
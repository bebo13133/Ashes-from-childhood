import { useState, useEffect } from 'react';
import './SocialIcons.css';

const SocialIcons = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Показва иконките след като hero секцията излезе от viewport
        setIsVisible(!entry.isIntersecting);
      },
      { 
        threshold: 0.1,
        rootMargin: '-100px 0px 0px 0px'
      }
    );

    const heroSection = document.querySelector('.hero-section, .hero, section:first-of-type');
    if (heroSection) {
      observer.observe(heroSection);
    }

    return () => observer.disconnect();
  }, []);

  const socialLinks = [
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/pepelotdetstvoto',
      icon: (
        <svg viewBox="0 0 24 24" className="social-icon">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      label: 'Facebook страница на книгата',
      color: '#1877f2'
    },
    {
      platform: 'viber',
      url: 'viber://chat?number=+359887123456',
      icon: (
        <svg viewBox="0 0 24 24" className="social-icon">
          <path d="M11.398.009C9.473.028 7.713.264 6.176.664 3.176 1.452.648 3.651.063 6.832c-.169.914-.24 1.878-.24 2.902 0 .962.06 1.868.179 2.729.003.024.003.048.006.071L.006 18.876c-.004.283.114.533.301.684.113.091.251.136.39.136.078 0 .157-.015.234-.045l4.596-1.846c.9.3 1.875.45 2.895.45.965 0 1.88-.135 2.729-.375 3.177-.9 5.474-3.673 5.474-6.973 0-.42-.03-.825-.09-1.215.045-.915.075-1.875.075-2.85 0-1.065-.075-2.085-.24-3.06C15.784 1.35 13.703.075 11.398.009z"/>
        </svg>
      ),
      label: 'Свържете се във Viber',
      color: '#7360f2'
    }
  ];

  return (
    <div className={`social-icons ${isVisible ? 'visible' : ''}`}>
      {socialLinks.map((social, index) => (
        
         <a key={social.platform}
          href={social.url}
          target={social.platform === 'facebook' ? '_blank' : '_self'}
          rel={social.platform === 'facebook' ? 'noopener noreferrer' : ''}
          className={`social-button ${social.platform}`}
          style={{ animationDelay: `${index * 0.2}s` }}
          title={social.label}
        >
          <div className="icon-container">
            {social.icon}
          </div>
          <div className="ripple-effect"></div>
        </a>
      ))}
    </div>
  );
};

export default SocialIcons;
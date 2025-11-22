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
                rootMargin: '-100px 0px 0px 0px',
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
            url: 'https://www.facebook.com/people/%D0%9C%D0%B5%D0%B6%D0%B4%D1%83-%D0%A0%D0%B5%D0%B4%D0%BE%D0%B2%D0%B5%D1%82%D0%B5/61578024990297/',
            icon: (
                <svg viewBox='0 0 24 24' className='social-icon'>
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                </svg>
            ),
            label: 'Facebook страница на книгата',
            color: '#1877f2',
        },
    ];

    return (
        <div className={`social-icons ${isVisible ? 'visible' : ''}`}>
            {socialLinks.map((social, index) => (
                <a
                    key={social.platform}
                    href={social.url}
                    target={social.platform === 'facebook' ? '_blank' : '_self'}
                    rel={social.platform === 'facebook' ? 'noopener noreferrer' : ''}
                    className={`social-button ${social.platform}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                    title={social.label}
                >
                    <div className='icon-container'>{social.icon}</div>
                    <div className='ripple-effect'></div>
                </a>
            ))}
        </div>
    );
};

export default SocialIcons;

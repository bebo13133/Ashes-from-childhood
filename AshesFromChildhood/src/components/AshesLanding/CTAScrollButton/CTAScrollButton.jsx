import { useState, useEffect } from 'react';
import './CTAScrollButton.css';

const CTAScrollButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isOrderSectionVisible, setIsOrderSectionVisible] = useState(false);

    useEffect(() => {
        const orderObserver = new IntersectionObserver(
            ([entry]) => {
                setIsOrderSectionVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        const orderSection = document.getElementById('order-section');
        if (orderSection) {
            orderObserver.observe(orderSection);
        }

        const heroObserver = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(!entry.isIntersecting);
            },
            { threshold: 0.1, rootMargin: '-100px 0px 0px 0px' }
        );

        const heroSection = document.querySelector('.hero-section, .hero, section:first-of-type');
        if (heroSection) {
            heroObserver.observe(heroSection);
        }

        return () => {
            orderObserver.disconnect();
            heroObserver.disconnect();
        };
    }, []);

    const handleScrollToOrder = () => {
        const orderSection = document.getElementById('order-section');
        if (orderSection) {
            orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const shouldShow = isVisible && !isOrderSectionVisible;

    return (
        <button className={`cta-scroll-button ${shouldShow ? 'cta-visible' : ''}`} onClick={handleScrollToOrder} aria-label='Поръчайте Вашата книга сега'>
            <span className='cta-button-text'>Поръчайте Вашата книга сега</span>
        </button>
    );
};

export default CTAScrollButton;

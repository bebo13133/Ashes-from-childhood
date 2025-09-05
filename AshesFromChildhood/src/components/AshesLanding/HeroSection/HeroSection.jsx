import { useEffect, useState } from 'react';
import './HeroSection.css';

const HeroSection = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 600);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const handleScrollToNext = () => {
        const nextSection = document.getElementById('book-presentation');
        if (nextSection) {
            const start = window.pageYOffset;
            const target = nextSection.offsetTop - 0;
            const distance = target - start;
            const duration = 150;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = ease(timeElapsed, start, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function ease(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        }
    };

    return (
        <section className="hero-section-main">
            {/* Atmospheric background */}
            <div className="hero-section-background"></div>

            {/* Enhanced dust particles */}
            <div className="hero-section-dust-particles">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`hero-section-dust-particle hero-section-dust-${i % 4}`}></div>
                ))}
            </div>

            {/* Ambient lighting overlay */}
            <div className="hero-section-ambient-lighting"></div>

            <div className="hero-section-container">

                {/* Left side - Content */}
                <div className="hero-section-content-side">
                    <div className={`hero-section-hero-content ${isVisible ? 'hero-section-animate-in' : ''}`}>

                        {/* Title */}
                        <div className="hero-section-title-group">
                            <h1 className="hero-section-book-title-hero">
                                <span className="hero-section-title-main">ПЕПЕЛ от ДЕТСТВОТО</span>
                                <span className="hero-section-title-sub">Из мислите на едно дете</span>
                            </h1>

                            <p className="hero-section-author-line">
                                от <span className="hero-section-author-highlight">Сибел Ибрямова</span>
                            </p>
                        </div>

                        {/* Description като цитат */}
                        <div className="hero-section-story-quote">
                            <p className="hero-section-quote-preview-text">
                                Ако си майка… баща… бъдещ или настоящ родител… Ако сте двойка, която мечтае един ден да прегърне свое дете… Ако си самотна майка, която всяка вечер стиска зъби, за да не се разпадне пред малките очи, които я гледат… Ако си дете, което е пораснало твърде рано…
                                Тази книга е за теб.
                            </p>
                        </div>

                        {/* Quote */}
                        <div className="hero-section-emotional-quote">
                            <span className="hero-section-quote-content">
                                "История написана  през очите на дете.."
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right side - Enhanced Book Display */}
                <div className="hero-section-book-side">
                    <div className="hero-section-book-display">

                        {/* Enhanced platform */}
                        <div className="hero-section-book-platform">
                            <div className="hero-section-platform-base"></div>
                            <div className="hero-section-platform-reflection"></div>
                            <div className="hero-section-platform-glow"></div>
                        </div>

                        {/* Enhanced book stack with new single image */}
                        <div className="hero-section-book-stack">
                            <img
                                src="/images/book/two-books3.png"
                                alt="Пепел от детството - 3D изглед на книгата"
                                className="hero-section-book-new"
                            />

                            {/* Enhanced lighting effects */}
                            <div className="hero-section-book-lighting">
                                <div className="hero-section-light-beam hero-section-light-1"></div>
                                <div className="hero-section-light-beam hero-section-light-2"></div>
                                <div className="hero-section-light-beam hero-section-light-3"></div>
                                <div className="hero-section-light-beam hero-section-light-4"></div>
                            </div>

                            {/* Enhanced shadow */}
                            <div className="hero-section-book-shadow"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Нова стрелка - отделена */}
            <div className="hero-section-scroll-section">
                <div className="hero-section-simple-arrow" onClick={handleScrollToNext}>
                    <div className="hero-section-arrow-down">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span className="hero-section-scroll-text" onClick={handleScrollToNext}>разкрийте историята</span>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
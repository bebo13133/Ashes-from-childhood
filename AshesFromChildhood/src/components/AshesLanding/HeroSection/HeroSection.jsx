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
        const target = nextSection.offsetTop - 0; // 100px отстояние
        const distance = target - start;
        const duration = 150; // 1.5 секунди вместо стандартните ~500ms
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
        <section className="hero-section">
            {/* Atmospheric background */}
            <div className="hero-background"></div>

            {/* Enhanced dust particles */}
            <div className="dust-particles">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`dust-particle dust-${i % 4}`}></div>
                ))}
            </div>

            {/* Ambient lighting overlay */}
            <div className="ambient-lighting"></div>

            <div className="hero-container">

                {/* Left side - Content */}
                <div className="content-side">
                    <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>

                        {/* Title */}
                        <div className="title-group">
                            <h1 className="book-title">
                                <span className="title-main">Пепел от детството</span>
                                <span className="title-sub">Из мислите на едно дете</span>
                            </h1>

                            <p className="author-line">
                                от <span className="author-highlight">Сибел Ибрямова</span>
                            </p>
                        </div>

                        {/* Description като цитат */}
                        <div className="story-quote">
                            <p className="quote-preview-text">
                                Дълбоко емоционално и откровено пътешествие през невинността и болката на детското сърце.
                                През погледа на новороденото, което се сблъсква с любовта, разочарованието и загубата,
                                тази книга разкрива най-съкровените мисли и чувства.
                            </p>
                        </div>

                        {/* Quote */}
                        <div className="emotional-quote">
                            <span className="quote-content">
                                "Историята, която ще промени погледа ви към детството..."
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right side - Enhanced Book Display */}
                <div className="book-side">
                    <div className="book-display">

                        {/* Enhanced platform */}
                        <div className="book-platform">
                            <div className="platform-base"></div>
                            <div className="platform-reflection"></div>
                            <div className="platform-glow"></div>
                        </div>

                        {/* Enhanced book stack with 3D effects */}
                        <div className="book-stack">
                            <img
                                src="/images/book/book-fron-ai.jpeg"
                                alt="Пепел от детството - предна корица"
                                className="book-front"
                            />
                            <img
                                src="/images/book/cover-back.jpg"
                                alt="Пепел от детството - задна корица"
                                className="book-back"
                            />

                            {/* Enhanced lighting effects */}
                            <div className="book-lighting">
                                <div className="light-beam light-1"></div>
                                <div className="light-beam light-2"></div>
                                <div className="light-beam light-3"></div>
                                <div className="light-beam light-4"></div>
                            </div>

                            {/* Enhanced shadow */}
                            <div className="book-shadow"></div>

                            {/* New: Book spine effect */}
                            <div className="book-spine"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Нова стрелка - отделена */}
            <div className="scroll-section">
                <div className="simple-arrow" onClick={handleScrollToNext}>
                    <div className="arrow-down">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span className="scroll-text" onClick={handleScrollToNext}>разкрийте историята</span>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
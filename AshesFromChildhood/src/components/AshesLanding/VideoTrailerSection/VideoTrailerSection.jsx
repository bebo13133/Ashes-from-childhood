import { useState, useEffect, useRef } from 'react';
import './videoTrailerSection.css';

const VideoTrailerSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);

  // Intersection Observer за анимация при скрол
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Parallax ефект
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const translateY = (scrollPercent - 0.5) * 50;
        
        if (videoRef.current) {
          videoRef.current.style.transform = `translateY(${translateY}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  return (
    <section className="video-trailer-section" ref={sectionRef}>
      <div className="video-trailer-container">
        <div className={`video-trailer-content ${isVisible ? 'trailer-animate-in' : ''}`}>
          
          {/* Header */}
          <div className="trailer-header">
            <div className="trailer-subtitle">Гледайте сега</div>
            <h2 className="trailer-title">
              Официален трейлър на <span className="book-title-accent">"Пепел от детството"</span>
            </h2>
            <div className="title-underline">
              <div className="underline-dot"></div>
              <div className="underline-line"></div>
              <div className="underline-dot"></div>
            </div>
          </div>

          {/* Video Container */}
          <div 
            className="video-wrapper"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Декоративни елементи */}
            <div className="video-frame-corners">
              <div className="corner corner-tl"></div>
              <div className="corner corner-tr"></div>
              <div className="corner corner-bl"></div>
              <div className="corner corner-br"></div>
            </div>

            {/* Glow ефекти */}
            <div className="video-glow-effect"></div>
            
            {/* Видео елемент */}
            <video
              ref={videoRef}
              className="trailer-video"
              poster="/images/book/trailer-poster.png"
              onClick={togglePlay}
            >
              <source src="/videos/book-trailer.mp4" type="video/mp4" />
              Вашият браузър не поддържа видео елемента.
            </video>

            {/* Play overlay когато видеото не се изпълнява */}
            {!isPlaying && (
              <div className="play-overlay" onClick={togglePlay}>
                <div className="play-button">
                  <div className="play-icon">▶</div>
                  <div className="play-pulse"></div>
                </div>
                <p className="play-text">Пусни трейлъра</p>
              </div>
            )}

            {/* Custom Controls */}
            <div className={`video-controls ${showControls || !isPlaying ? 'controls-visible' : ''}`}>
              <button 
                className="control-btn play-pause-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Пауза' : 'Пусни'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              <button 
                className="control-btn mute-btn"
                onClick={toggleMute}
                aria-label={isMuted ? 'Включи звук' : 'Изключи звук'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>

              <button 
                className="control-btn fullscreen-btn"
                onClick={toggleFullscreen}
                aria-label="Цял екран"
              >
                ⛶
              </button>
            </div>
          </div>

          {/* Call to action под видеото */}
          <div className="trailer-cta">
            <p className="cta-text">
              Вдъхновени от историята? Книгата ви очаква.
            </p>
            <button 
              className="cta-button"
              onClick={() => {
                const orderSection = document.getElementById('order-section');
                if (orderSection) {
                  orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Поръчай сега
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoTrailerSection;
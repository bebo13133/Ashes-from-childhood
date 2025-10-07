import { useState, useEffect, useRef } from 'react';
import './videoTrailerSection.css';

const VideoTrailerSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const playerRef = useRef(null);
  const sectionRef = useRef(null);

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

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initPlayer;
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player('yt-player', {
      videoId: 'sBpkjFZXO6c',
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        iv_load_policy: 3,
        disablekb: 1
      },
      events: {
        onStateChange: (e) => {
          if (e.data === 1) setIsPlaying(true);
          if (e.data === 2 || e.data === 0) setIsPlaying(false);
        }
      }
    });
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById('yt-player');
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  return (
    <section className="video-trailer-section" ref={sectionRef}>
      <div className="video-trailer-container">
        <div className={`video-trailer-content ${isVisible ? 'trailer-animate-in' : ''}`}>
          
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

          <div 
            className="video-wrapper"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <div className="video-frame-corners">
              <div className="corner corner-tl"></div>
              <div className="corner corner-tr"></div>
              <div className="corner corner-bl"></div>
              <div className="corner corner-br"></div>
            </div>

            <div className="video-glow-effect"></div>
            
            <div id="yt-player" className="trailer-video"></div>
            
            {/* БЛОКИРА YouTube контроли */}
            <div className="yt-blocker"></div>

            {!isPlaying && (
              <>
                <div className="video-poster">
                  <img src="/images/book/trailer-poster.png" alt="Trailer" />
                </div>
                <div className="play-overlay" onClick={togglePlay}>
                  <div className="play-button">
                    <div className="play-icon">▶</div>
                    <div className="play-pulse"></div>
                  </div>
                  <p className="play-text">Пусни трейлъра</p>
                </div>
              </>
            )}

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
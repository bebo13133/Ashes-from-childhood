import { useState, useEffect, useRef } from 'react';
import './videoTrailerSection.css';

const VideoTrailerSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [shouldLoadPlayer, setShouldLoadPlayer] = useState(false);
  const playerRef = useRef(null);
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

  // Load YouTube IFrame API само когато е нужно
  useEffect(() => {
    if (!shouldLoadPlayer) return;

    // Проверка дали вече е заредено
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    // Зареждане на YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initPlayer;
  }, [shouldLoadPlayer]);

  const initPlayer = () => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: 'sBpkjFZXO6c',
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 1,
        enablejsapi: 1,
        autoplay: 1,
        playsinline: 1,
        vq: 'hd1080'  // Форсира HD качество
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  };

  const onPlayerReady = (event) => {
    // Форсирай най-високото качество
    const availableQualityLevels = event.target.getAvailableQualityLevels();
    if (availableQualityLevels.length > 0) {
      // Избери hd1080 или hd720
      if (availableQualityLevels.includes('hd1080')) {
        event.target.setPlaybackQuality('hd1080');
      } else if (availableQualityLevels.includes('hd720')) {
        event.target.setPlaybackQuality('hd720');
      } else {
        event.target.setPlaybackQuality(availableQualityLevels[0]);
      }
    }
    // Пусни видеото
    event.target.playVideo();
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  };

  const handlePlayClick = () => {
    if (!shouldLoadPlayer) {
      // Първо кликване - зареди player-а
      setShouldLoadPlayer(true);
    } else if (playerRef.current) {
      // Player-а е зареден - toggle play/pause
      togglePlay();
    }
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
    const iframe = document.getElementById('youtube-player');
    if (!iframe) return;
    
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.mozRequestFullScreen) {
      iframe.mozRequestFullScreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
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
            
            {/* ТВОЯ Thumbnail преди зареждане на player */}
            {!shouldLoadPlayer && (
              <div className="video-thumbnail">
                <img 
                  src="/images/book/trailer-poster.png"
                  alt="Пепел от детството трейлър"
                  className="trailer-video"
                />
              </div>
            )}

            {/* YouTube Player - зарежда се при първо кликване */}
            {shouldLoadPlayer && (
              <div id="youtube-player" className="trailer-video"></div>
            )}

            {/* Play overlay когато видеото не се изпълнява */}
            {!isPlaying && (
              <div className="play-overlay" onClick={handlePlayClick}>
                <div className="play-button">
                  <div className="play-icon">▶</div>
                  <div className="play-pulse"></div>
                </div>
                <p className="play-text">Пусни трейлъра</p>
              </div>
            )}

            {/* Custom Controls - показват се само след зареждане на player */}
            {shouldLoadPlayer && (
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
            )}
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
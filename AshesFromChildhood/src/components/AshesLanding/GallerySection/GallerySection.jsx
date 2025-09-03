import { useState, useEffect } from 'react';
import './GallerySection.css';

const GallerySection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const bookImages = [
    {
      src: '/images/book/cover-front.jpg',
      alt: 'Предна корица на Пепел от детството',
      title: 'Художествена корица',
      description: 'Професионален дизайн, който привлича погледа'
    },
    {
      src: '/images/book/cover-back.jpg', 
      alt: 'Задна корица с описание',
      title: 'Подробно описание',
      description: 'Пълна информация за съдържанието на книгата'
    },
    {
      src: '/images/book/book-3d-1.jpg',
      alt: '3D изглед на книгата',
      title: 'Качествени материали', 
      description: 'Висококласна печат и издание'
    },
    {
      src: '/images/book/book-mockup.jpg',
      alt: 'Книгата в реална среда',
      title: 'Перфектен подарък',
      description: 'Идеална за четене и колекциониране'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector('.gallery-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!lightboxOpen) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % bookImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [bookImages.length, lightboxOpen]);

  // Lightbox functions
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  // ПОПРАВЕНИ функции с preventDefault
  const nextLightboxImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(prev => (prev + 1) % bookImages.length);
  };

  const prevLightboxImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(prev => (prev - 1 + bookImages.length) % bookImages.length);
  };

  const handleLightboxClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeLightbox();
  };

  const handleThumbnailClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex(prev => (prev + 1) % bookImages.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex(prev => (prev - 1 + bookImages.length) % bookImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, bookImages.length]);

  return (
    <section className="gallery-section">
      <div className="container">
        <div className={`gallery-content ${isVisible ? 'fade-in-up' : ''}`}>
          
          {/* Gallery Header */}
          <div className="gallery-header">
            <h2 className="gallery-title dramatic-text">
              Разгледайте <span className="title-accent">Книгата</span>
            </h2>
            <p className="gallery-subtitle">
              "Пепел от детството" в детайли - качество, което можете да почувствате
            </p>
          </div>

          {/* Main Gallery Display */}
          <div className="gallery-showcase">
            <div className="image-slider">
              <div className="slides-container">
                {bookImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`slide ${index === currentIndex ? 'active' : ''}`}
                  >
                    <div className="slide-image-container">
                      <img 
                        src={image.src}
                        alt={image.alt}
                        className="slide-image"
                      />
                      <div className="slide-overlay">
                        <div className="slide-info">
                          <h3 className="slide-title">{image.title}</h3>
                          <p className="slide-description">{image.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="gallery-dots">
                {bookImages.map((_, index) => (
                  <button
                    key={index}
                    className={`gallery-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <span className="dot-inner"></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clickable Thumbnails */}
            <div className="thumbnails-row">
              {bookImages.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => openLightbox(index)}
                >
                  <img 
                    src={image.src}
                    alt={image.alt}
                    className="thumbnail-img"
                  />
                  <div className="thumbnail-label">{image.title}</div>
                  <div className="thumbnail-zoom-hint">
                    <span>🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Book Quality Features */}
          <div className="quality-features">
            <h3 className="features-title">Защо именно тази книга?</h3>
            <div className="features-grid">
              <div className="quality-item">
                <div className="quality-icon">📖</div>
                <h4>200+ страници</h4>
                <p>Пълноценна история, която ще ви завладее</p>
              </div>
              
              <div className="quality-item">
                <div className="quality-icon">✍️</div>
                <h4>Автентична история</h4>
                <p>Реални преживявания, написани от сърцето</p>
              </div>
              
              <div className="quality-item">
                <div className="quality-icon">🎯</div>
                <h4>Емоционална сила</h4>
                <p>Книга, която ще остане с вас завинаги</p>
              </div>
              
              <div className="quality-item">
                <div className="quality-icon">💎</div>
                <h4>Премиум качество</h4>
                <p>Висококлассна печат и материали</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container">
            {/* Close Button */}
            <button className="lightbox-close" onClick={handleLightboxClose}>
              <span>×</span>
            </button>

            {/* Navigation Arrows - ПОПРАВЕНИ */}
            <button 
              className="lightbox-nav lightbox-prev" 
              onClick={prevLightboxImage}
            >
              <span>‹</span>
            </button>
            <button 
              className="lightbox-nav lightbox-next" 
              onClick={nextLightboxImage}
            >
              <span>›</span>
            </button>

            {/* Main Image */}
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img 
                src={bookImages[lightboxIndex].src}
                alt={bookImages[lightboxIndex].alt}
                className="lightbox-image"
              />
              <div className="lightbox-info">
                <h3 className="lightbox-title">{bookImages[lightboxIndex].title}</h3>
                <p className="lightbox-description">{bookImages[lightboxIndex].description}</p>
              </div>
            </div>

            {/* Image Counter */}
            <div className="lightbox-counter">
              {lightboxIndex + 1} / {bookImages.length}
            </div>

            {/* Thumbnail Navigation - ПОПРАВЕНИ */}
            <div className="lightbox-thumbnails" onClick={(e) => e.stopPropagation()}>
              {bookImages.map((image, index) => (
                <div
                  key={index}
                  className={`lightbox-thumb ${index === lightboxIndex ? 'active' : ''}`}
                  onClick={(e) => handleThumbnailClick(e, index)}
                >
                  <img src={image.src} alt={image.alt} />
                </div>
              ))}
            </div>

            {/* Keyboard Hint */}
            <div className="lightbox-hint">
              Използвайте стрелките или ESC за затваряне
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
import { useState, useEffect, useRef } from 'react';
import './BookPresentation.css';

const BookPresentation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [bookRotation, setBookRotation] = useState({ x: -10, y: -15 });
  const [isHovered, setIsHovered] = useState(false);
  const bookRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.querySelector('.book-presentation');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    if (!bookRef.current || !isHovered) return;
    
    const rect = bookRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / 10;
    const deltaY = (e.clientY - centerY) / 10;
    
    setBookRotation({
      x: Math.max(-25, Math.min(15, -10 + deltaY)),
      y: Math.max(-35, Math.min(35, -15 + deltaX))
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setBookRotation({ x: -10, y: -15 });
  };

  return (
    <section  className="book-presentation">
      <div className="presentation-background">
        <div className="floating-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className={`presentation-content ${isVisible ? 'fade-in-up' : ''}`}>
          
          <div className="section-header">
            <h2 className="section-title">
              Открийте Мистерията
            </h2>
            <p className="section-subtitle">
              "Пепел от детството" - История, която ще докосне сърцето ви
            </p>
          </div>

          <div className="presentation-grid">
            
            {/* Професионален 3D Book Display */}
            <div className="book-showcase">
              <div className="book-stage">
                <div 
                  className="book-3d-container"
                  ref={bookRef}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    transform: `perspective(1200px) rotateX(${bookRotation.x}deg) rotateY(${bookRotation.y}deg)`
                  }}
                >
                  <div className="book-3d">
                    {/* Предна корица */}
                    <div className="book-face book-front">
                      <img 
                        src="/images/book/cover-front.jpg" 
                        alt="Предна корица"
                        className="book-image"
                      />
                      <div className="book-gloss"></div>
                    </div>
                    
                    {/* Задна корица */}
                    <div className="book-face book-back">
                      <img 
                        src="/images/book/cover-back.jpg" 
                        alt="Задна корица"
                        className="book-image"
                      />
                    </div>
                    
                    {/* Гръб на книгата */}
                    <div className="book-face book-spine">
                      <div className="spine-text">
                        <span>ПЕПЕЛ ОТ ДЕТСТВОТО</span>
                        <span>СИБЕЛ ИБРЯМОВА</span>
                      </div>
                    </div>
                    
                    {/* Горна страна */}
                    <div className="book-face book-top"></div>
                    
                    {/* Долна страна */}
                    <div className="book-face book-bottom"></div>
                    
                    {/* Дясна страна */}
                    <div className="book-face book-right"></div>
                  </div>
                  
                  {/* Подобрени сенки */}
                  <div className="book-shadows">
                    <div className="shadow-ground"></div>
                    <div className="shadow-ambient"></div>
                  </div>
                </div>
              </div>

              {/* Атмосферни ефекти */}
              <div className="atmosphere-effects">
                <div className="light-beam beam-1"></div>
                <div className="light-beam beam-2"></div>
                <div className="dust-motes">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`dust-mote mote-${i + 1}`}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Подобрена information секция */}
            <div className="book-info">
              <h3 className="info-title">
                Защо да изберете тази книга?
              </h3>
              
              <div className="features-list">
                <div className={`feature-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
                  <div className="feature-icon">💭</div>
                  <div className="feature-content">
                    <h4>Откровена История</h4>
                    <p>Разкрива най-дълбоките мисли и чувства на детската душа</p>
                  </div>
                </div>

                <div className={`feature-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.4s' }}>
                  <div className="feature-icon">❤️</div>
                  <div className="feature-content">
                    <h4>Емоционално Пътешествие</h4>
                    <p>Преживейте невинността, болката и надеждата през детски очи</p>
                  </div>
                </div>

                <div className={`feature-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.6s' }}>
                  <div className="feature-icon">👁️</div>
                  <div className="feature-content">
                    <h4>Уникална Перспектива</h4>
                    <p>Взгляд към света от гледна точка на новородено дете</p>
                  </div>
                </div>

                <div className={`feature-item ${isVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.8s' }}>
                  <div className="feature-icon">✨</div>
                  <div className="feature-content">
                    <h4>Дълбок Смисъл</h4>
                    <p>Книга, която ще ви кара да преосмислите детството и семейството</p>
                  </div>
                </div>
              </div>

              <div className="cta-section">
                <blockquote className="book-quote">
                  "От топлината на семейния дом до студената пустота след разялата..."
                </blockquote>
                <p className="quote-caption">
                  История за развиране, приемане и надежда
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookPresentation;
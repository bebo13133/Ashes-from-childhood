import { useState, useEffect } from 'react';
import './AuthorSection.css';

const AuthorSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  const authorQuotes = [
    "Писането е начин да споделя частици от душата си с света.",
    "Всяка история носи в себе си истина, която чака да бъде разказана.",
    "Детството е най-честният период от живота - именно затова пиша за него.",
    "Думите имат сила да лекуват рани, които дори не знаем, че имаме."
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

    const element = document.querySelector('.author-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % authorQuotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="author-section">
      <div className="container-author">
        <div className={`author-content ${isVisible ? 'animate-in' : ''}`}>
          
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">
              Запознайте се с <span className="author-name-accent">Автора</span>
            </h2>
            <div className="title-divider">
              <div className="divider-line"></div>
              <div className="divider-diamond"></div>
              <div className="divider-line"></div>
            </div>
          </div>

          <div className="author-grid">
            
            {/* Author Image Side */}
            <div className="author-image-container">
              <div className="image-frame">
                <div className="image-borders">
                  <div className="border-corner top-left"></div>
                  <div className="border-corner top-right"></div>
                  <div className="border-corner bottom-left"></div>
                  <div className="border-corner bottom-right"></div>
                </div>
                
                <div className="author-image-wrapper">
                  <img 
                    src="/images/book/sibil1.png" 
                    alt="Сибел Ибрямова - автор"
                    className="author-image"
                  />
                  <div className="image-glow"></div>
                </div>

                <div className="floating-elements">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`floating-dot dot-${i + 1}`}></div>
                  ))}
                </div>
              </div>

              {/* Dynamic Quote Display */}
              <div className="author-quote-display">
                <div className="quote-container">
                  <div className="quote-mark">"</div>
                  <p className="rotating-quote">
                    {authorQuotes[currentQuote]}
                  </p>
                  <cite className="quote-attribution">- Сибел Ибрямова</cite>
                </div>
                <div className="quote-indicators">
                  {authorQuotes.map((_, index) => (
                    <div 
                      key={index} 
                      className={`quote-dot ${index === currentQuote ? 'active' : ''}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Author Info Side */}
            <div className="author-info">
              <div className="author-name-section">
                <h3 className="author-full-name">Сибел Ибрямова</h3>
                <p className="author-title">Автор и разказвач</p>
              </div>

              <div className="author-bio">
                <div className="bio-section">
                  <h4 className="bio-subtitle">За автора</h4>
                  <p className="bio-text">
                    Сибел Ибрямова е съпруга и майка на две деца, които са вдъхновение за всичко, което твори. Любовта ѝ към думите се заражда още в тийнейджърските ѝ години, когато започва да пише стихове, поеми и приказки – един личен свят, в който тя превръща емоциите в истории. 
Днес аудиторията ѝ в социалните мрежи я познава като жена, която умее да разказва с обич и искреност – малки истории за семейството, детството и смисъла на истинската връзка между хората.
Дебютната ѝ книга е отражение на собствения ѝ вътрешен свят – смела изповед, в която личните липси и преживявания се превръщат в литература.
                  </p>
                </div>

                <div className="bio-section">
                  <h4 className="bio-subtitle">Философия на писането</h4>
                  <p className="bio-text">
                    " Тя вярва, че всяка история носи послание и че именно през думите човек може да докосне душите на другите."
                  </p>
                </div>

                <div className="achievements">
                  <h4 className="bio-subtitle">Признание</h4>
                  <div className="achievement-list">
                    <div className="achievement-item">
                      <div className="achievement-icon">📚</div>
                      <span>Дебютна книга с високи читателски оценки</span>
                    </div>
                    <div className="achievement-item">
                      <div className="achievement-icon">🎯</div>
                      <span>Фокус върху автентичното разказване</span>
                    </div>
                    <div className="achievement-item">
                      <div className="achievement-icon">💭</div>
                      <span>Специализация в психологически портрети</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact/Connect Section */}
              {/* <div className="author-connect">
                <h4 className="connect-title">Свържете се с автора</h4>
                <div className="connect-info">
                  <p className="connect-text">
                    Сибел винаги е отворена за разговори с читателите си. 
                    Споделете впечатленията си от книгата или задайте въпрос.
                  </p>
                  <div className="connect-channels">
                    <div className="connect-item">
                      <div className="connect-icon">✉️</div>
                      <span>Контакт чрез издателя</span>
                    </div>
                    <div className="connect-item">
                      <div className="connect-icon">📖</div>
                      <span>Литературни срещи</span>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorSection;
import { useState, useEffect } from 'react';
import './MysterySection.css';

const MysterySection = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const bookQuotes = [
    "Понякога детските очи виждат повече от възрастните сърца...",
    "В тишината на нощта, мислите на детето стават най-ясни...", 
    "Когато светът рухне, детето търси смисъл в хаоса...",
    "Болката формира характера, но любовта го изцелява...",
    "Детството не е подготовка за живота - то е самият живот..."
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

    const element = document.querySelector('.mystery-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const nextQuote = () => {
    setCurrentQuoteIndex(prev => (prev + 1) % bookQuotes.length);
  };

  return (
    <section className="mystery-section">
      <div className="container-mystery">
        <div className={`section-content ${isVisible ? 'animate-in' : ''}`}>
          
          {/* Header */}
          <div className="section-header">
            <h2 className="main-title">
              Защо хиляди читатели не могат да забравят тази книга?
            </h2>
            <p className="main-subtitle">
              Открийте историята, която ще промени начина ви на мислене за детството
            </p>
          </div>

          <div className="content-grid">
            
            {/* Emotional Connection Side */}
            <div className="emotional-side">
              
              {/* Quote Display */}
              <div className="quote-showcase">
                <div className="quote-container">
                  <div className="quote-mark">"</div>
                  <blockquote className="featured-quote">
                    {bookQuotes[currentQuoteIndex]}
                  </blockquote>
                  <cite className="quote-source">- Из "Пепел от детството"</cite>
                </div>
                
                <button 
                  className="next-quote-btn"
                  onClick={nextQuote}
                >
                  <span>Следваща мисъл</span>
                  <div className="btn-glow"></div>
                </button>
              </div>

              {/* Emotional Impact */}
              <div className="impact-section">
                <h3 className="impact-title">Тази книга ще ви:</h3>
                <div className="impact-list">
                  <div className="impact-item">
                    <div className="impact-icon">💡</div>
                    <div className="impact-text">
                      <strong>Разкрие нови перспективи</strong> за детския свят
                    </div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">❤️</div>
                    <div className="impact-text">
                      <strong>Докосне емоционално</strong> с истински моменти
                    </div>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">🔗</div>
                    <div className="impact-text">
                      <strong>Свърже с личните ви спомени</strong> от детството
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales-focused Side */}
            <div className="sales-side">
              
              {/* Value Proposition */}
              <div className="value-prop">
                <h3 className="value-title">
                  Повече от книга - Това е емоционално преживяване
                </h3>
                
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <div className="benefit-header">
                      <span className="benefit-icon">👁️</span>
                      <h4>Уникална перспектива</h4>
                    </div>
                    <p>Света през очите на новородено дете - гледна точка, която никога не сте изживявали</p>
                  </div>
                  
                  <div className="benefit-card">
                    <div className="benefit-header">
                      <span className="benefit-icon">🎭</span>
                      <h4>Автентични емоции</h4>
                    </div>
                    <p>Истински моменти на радост, болка и надежда, разказани с рядка откровеност</p>
                  </div>
                  
                  <div className="benefit-card">
                    <div className="benefit-header">
                      <span className="benefit-icon">🌟</span>
                      <h4>Трайно въздействие</h4>
                    </div>
                    <p>История, която ще остане с вас дълго след последната страница</p>
                  </div>
                  
                  <div className="benefit-card">
                    <div className="benefit-header">
                      <span className="benefit-icon">🔍</span>
                      <h4>Дълбок смисъл</h4>
                    </div>
                    <p>Философски въпроси за семейството, любовта и човешката природа</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="social-proof">
                <h4 className="social-title">Читателите споделят:</h4>
                <div className="testimonials">
                  <div className="testimonial">
                    <div className="testimonial-text">
                      "Не можах да спра да чета. Всяка страница ме докосваше все по-дълбоко..."
                    </div>
                    <div className="testimonial-author">- Мария, 34 г.</div>
                  </div>
                  
                  <div className="testimonial">
                    <div className="testimonial-text">
                      "Като родител, тази книга ми отвори очите за нещо, които никога не бях забелязвал."
                    </div>
                    <div className="testimonial-author">- Петър, 28 г.</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MysterySection;
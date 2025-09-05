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

    const element = document.querySelector('.mystery-section-main');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const nextQuote = () => {
    setCurrentQuoteIndex(prev => (prev + 1) % bookQuotes.length);
  };

  return (
    <section className="mystery-section-main">
      <div className="mystery-section-container">
        <div className={`mystery-section-content ${isVisible ? 'mystery-section-animate-in' : ''}`}>
          
          {/* Header */}
          <div className="mystery-section-header">
            <h2 className="mystery-section-main-title">
              Защо хиляди читатели не могат да забравят тази книга?
            </h2>
            <p className="mystery-section-main-subtitle">
              Открийте историята, която ще промени начина ви на мислене за детството
            </p>
          </div>

          <div className="mystery-section-content-grid">
            
            {/* Emotional Connection Side */}
            <div className="mystery-section-emotional-side">
              
              {/* Quote Display */}
              <div className="mystery-section-quote-showcase">
                <div className="mystery-section-quote-container">
                  <div className="mystery-section-quote-mark">"</div>
                  <blockquote className="mystery-section-featured-quote">
                    {bookQuotes[currentQuoteIndex]}
                  </blockquote>
                  <cite className="mystery-section-quote-source">- Из "Пепел от детството"</cite>
                </div>
                
                <button 
                  className="mystery-section-next-quote-btn"
                  onClick={nextQuote}
                >
                  <span>Следваща мисъл</span>
                  <div className="mystery-section-btn-glow"></div>
                </button>
              </div>

              {/* Emotional Impact */}
              <div className="mystery-section-impact-section">
                <h3 className="mystery-section-impact-title">Тази книга ще ви:</h3>
                <div className="mystery-section-impact-list">
                  <div className="mystery-section-impact-item">
                    <div className="mystery-section-impact-icon">💡</div>
                    <div className="mystery-section-impact-text">
                      <strong>Разкрие нови перспективи</strong> за детския свят
                    </div>
                  </div>
                  <div className="mystery-section-impact-item">
                    <div className="mystery-section-impact-icon">❤️</div>
                    <div className="mystery-section-impact-text">
                      <strong>Докосне емоционално</strong> с истински моменти
                    </div>
                  </div>
                  <div className="mystery-section-impact-item">
                    <div className="mystery-section-impact-icon">🔗</div>
                    <div className="mystery-section-impact-text">
                      <strong>Свърже с личните ви спомени</strong> от детството
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales-focused Side */}
            <div className="mystery-section-sales-side">
              
              {/* Value Proposition */}
              <div className="mystery-section-value-prop">
                <h3 className="mystery-section-value-title">
                  Повече от книга - Това е емоционално преживяване
                </h3>
                
                <div className="mystery-section-benefits-grid">
                  <div className="mystery-section-benefit-card">
                    <div className="mystery-section-benefit-header">
                      <span className="mystery-section-benefit-icon">👁️</span>
                      <h4>Уникална перспектива</h4>
                    </div>
                    <p>Света през очите на новородено дете - гледна точка, която никога не сте изживявали</p>
                  </div>
                  
                  <div className="mystery-section-benefit-card">
                    <div className="mystery-section-benefit-header">
                      <span className="mystery-section-benefit-icon">🎭</span>
                      <h4>Автентични емоции</h4>
                    </div>
                    <p>Истински моменти на радост, болка и надежда, разказани с рядка откровеност</p>
                  </div>
                  
                  <div className="mystery-section-benefit-card">
                    <div className="mystery-section-benefit-header">
                      <span className="mystery-section-benefit-icon">🌟</span>
                      <h4>Трайно въздействие</h4>
                    </div>
                    <p>История, която ще остане с вас дълго след последната страница</p>
                  </div>
                  
                  <div className="mystery-section-benefit-card">
                    <div className="mystery-section-benefit-header">
                      <span className="mystery-section-benefit-icon">🔍</span>
                      <h4>Дълбок смисъл</h4>
                    </div>
                    <p>Философски въпроси за семейството, любовта и човешката природа</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="mystery-section-social-proof">
                <h4 className="mystery-section-social-title">Читателите споделят:</h4>
                <div className="mystery-section-testimonials">
                  <div className="mystery-section-testimonial">
                    <div className="mystery-section-testimonial-text">
                      "Не можах да спра да чета. Всяка страница ме докосваше все по-дълбоко..."
                    </div>
                    <div className="mystery-section-testimonial-author">- Мария, 34 г.</div>
                  </div>
                  
                  <div className="mystery-section-testimonial">
                    <div className="mystery-section-testimonial-text">
                      "Като родител, тази книга ми отвори очите за нещо, които никога не бях забелязвал."
                    </div>
                    <div className="mystery-section-testimonial-author">- Петър, 28 г.</div>
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
import { useState, useEffect } from 'react';
import './MysterySection.css';

const MysterySection = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const bookQuotes = [
    "Домът може да бъде крепост… или клетка....",
    "Детството не забравя – то шепне през целия живот...", 
    "Очите на едно дете виждат повече, отколкото възрастните искат да признаят....",
    "Любимите хора понякога са най-голямата болка....",
    "Когато възрастните воюват, децата са първите ранени..."
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

    const element = document.querySelector('.why-book-main');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const nextQuote = () => {
    setCurrentQuoteIndex(prev => (prev + 1) % bookQuotes.length);
  };

  const scrollToOrder = () => {
    const orderSection = document.getElementById('order-section');
    if (orderSection) {
      orderSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="why-book-main">
      <div className="why-book-container">
        <div className={`why-book-content ${isVisible ? 'why-book-animate-in' : ''}`}>
          
          {/* Header */}
          <div className="why-book-header">
            <h2 className="why-book-main-title">
              Защо хиляди читатели не могат да забравят тази книга?
            </h2>
            <p className="why-book-main-subtitle">
              Открийте историята, която ще промени начина ви на мислене за детството
            </p>
          </div>

          <div className="why-book-content-grid">
            
            {/* Emotional Connection Side */}
            <div className="why-book-emotional-side">
              
              {/* Quote Display */}
              <div className="why-book-quote-showcase">
                <div className="why-book-quote-container">
                  <div className="why-book-quote-mark">"</div>
                  <blockquote className="why-book-featured-quote">
                    {bookQuotes[currentQuoteIndex]}
                  </blockquote>
                  <cite className="why-book-quote-source">- Из "Пепел от детството"</cite>
                </div>
                
                <button 
                  className="why-book-next-quote-btn"
                  onClick={nextQuote}
                >
                  <span>Следваща мисъл</span>
                  <div className="why-book-btn-glow"></div>
                </button>
              </div>

              {/* Emotional Impact */}
              <div className="why-book-impact-section">
                <h3 className="why-book-impact-title">Тази книга ще ви:</h3>
                <div className="why-book-impact-list">
                  <div className="why-book-impact-item">
                    <div className="why-book-impact-icon">💡</div>
                    <div className="why-book-impact-text">
                      <strong>Разкрие нови перспективи</strong> за детския свят
                    </div>
                  </div>
                  <div className="why-book-impact-item">
                    <div className="why-book-impact-icon">❤️</div>
                    <div className="why-book-impact-text">
                      <strong>Докосне емоционално</strong> с истински моменти
                    </div>
                  </div>
                  <div className="why-book-impact-item">
                    <div className="why-book-impact-icon">🔗</div>
                    <div className="why-book-impact-text">
                      <strong>Свържете с личните ви спомени</strong> от детството
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgent Message */}
              <div className="why-book-urgent-section">
                <div className="why-book-urgent-label">
                  <span>📖 Важно! Бройките са строго ограничени. Не отлагай. Тази история не чака.</span>
                </div>
                
                <button className="why-book-order-btn" onClick={scrollToOrder}>
                  Вземи я сега
                </button>
              </div>
            </div>

            {/* Sales-focused Side */}
            <div className="why-book-sales-side">
              
              {/* Value Proposition */}
              <div className="why-book-value-prop">
                <h3 className="why-book-value-title">
                  Повече от книга - Това е емоционално преживяване
                </h3>
                
                <div className="why-book-benefits-grid">
                  <div className="why-book-benefit-card">
                    <div className="why-book-benefit-header">
                      <span className="why-book-benefit-icon">👁️</span>
                      <h4>Уникална перспектива</h4>
                    </div>
                    <p>Света през очите на новородено дете - гледна точка, която никога не сте изживявали</p>
                  </div>
                  
                  <div className="why-book-benefit-card">
                    <div className="why-book-benefit-header">
                      <span className="why-book-benefit-icon">🎭</span>
                      <h4>Автентични емоции</h4>
                    </div>
                    <p>Истински моменти на радост, болка и надежда, разказани с рядка откровеност</p>
                  </div>
                  
                  <div className="why-book-benefit-card">
                    <div className="why-book-benefit-header">
                      <span className="why-book-benefit-icon">🌟</span>
                      <h4>Трайно въздействие</h4>
                    </div>
                    <p>История, която ще остане с вас дълго след последната страница</p>
                  </div>
                  
                  <div className="why-book-benefit-card">
                    <div className="why-book-benefit-header">
                      <span className="why-book-benefit-icon">🔍</span>
                      <h4>Дълбок смисъл</h4>
                    </div>
                    <p>Философски въпроси за семейството, любовта и човешката природа</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="why-book-social-proof">
                <h4 className="why-book-social-title">Читателите споделят:</h4>
                <div className="why-book-testimonials">
                  <div className="why-book-testimonial">
                    <div className="why-book-testimonial-text">
                      "Не можах да спра да чета. Всяка страница ме докосваше все по-дълбоко..."
                    </div>
                    <div className="why-book-testimonial-author">- Мария, 34 г.</div>
                  </div>
                  
                  <div className="why-book-testimonial">
                    <div className="why-book-testimonial-text">
                      "Като родител, тази книга ми отвори очите за нещо, които никога не бях забелязвал."
                    </div>
                    <div className="why-book-testimonial-author">- Петър, 28 г.</div>
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
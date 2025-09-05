import { useState, useEffect } from 'react';
import './OrderSection.css';
import { useAuthContext } from '../../contexts/userContext';

const OrderSection = () => {
  const { submitBookOrder, isLoading, errorMessage, clearError } = useAuthContext();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    quantity: 1, // Вече е число
    address: '',
    city: '',
    phone: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.querySelector('.order-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Специално третиране на quantity
    if (name === 'quantity') {
      const numValue = parseInt(value) || 1;
      setFormData(prev => ({
        ...prev,
        [name]: Math.max(1, Math.min(10, numValue)) // Ограничава между 1 и 10
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear any errors when user starts typing
    if (errorMessage) {
      clearError();
    }
  };

  // Поправени функции за quantity бутоните
  const decreaseQuantity = () => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity - 1)
    }));
  };

  const increaseQuantity = () => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.min(10, prev.quantity + 1)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const orderData = {
        ...formData,
        totalPrice: totalPrice,
        paymentMethod: 'cash_on_delivery',
        bookTitle: 'Пепел от детството',
        orderDate: new Date().toISOString()
      };

      const result = await submitBookOrder(orderData);
      
      if (result.success) {
        setOrderSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          quantity: 1,
          address: '',
          city: '',
          phone: ''
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setOrderSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Order submission error:', error);
    }
  };

  // Поправено изчисление - винаги се уверяваме, че quantity е число
  const totalPrice = Number(formData.quantity) * 25;

  if (orderSuccess) {
    return (
      <section className="order-section">
        <div className="container">
          <div className="success-message">
            <div className="success-animation">
              <div className="success-icon">✅</div>
              <h2 className="success-title">Поръчката е изпратена!</h2>
              <p className="success-text">
                Благодарим ви! Ще се свържем с вас в рамките на 24 часа за потвърждение.
              </p>
              <button 
                className="success-btn"
                onClick={() => setOrderSuccess(false)}
              >
                Нова поръчка
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="order-section" className="order-section">
      <div className="order-background">
        <div className="background-pattern"></div>
        <div className="floating-orbs">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`floating-orb orb-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className={`order-content ${isVisible ? 'fade-in-up' : ''}`}>
          
          <div className="order-header">
            <h2 className="order-title dramatic-text">
              <span className="title-accent">Поръчайте</span> Вашето Копие
            </h2>
            <p className="order-subtitle">
              Получете "Пепел от детството" директно до вашия дом
            </p>
            <div className="price-display">
              <span className="price-label">Цена:</span>
              <span className="price-amount">25.00 лв</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <p>{errorMessage}</p>
              <button onClick={clearError} className="error-close">×</button>
            </div>
          )}

          <div className="order-grid">
            
            <div className="order-form-container">
              <div className="form-wrapper">
                <div className="form-header">
                  <h3 className="form-title">Данни за поръчка</h3>
                  <div className="form-decoration"></div>
                </div>

                <form onSubmit={handleSubmit} className="order-form">
                  
                  <div className="form-row">
                    <div className={`form-group ${focusedField === 'firstName' ? 'focused' : ''}`}>
                      <label htmlFor="firstName" className="form-label">Име</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField('')}
                        className="form-input"
                        required
                      />
                      <div className="input-glow"></div>
                    </div>

                    <div className={`form-group ${focusedField === 'lastName' ? 'focused' : ''}`}>
                      <label htmlFor="lastName" className="form-label">Фамилия</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField('')}
                        className="form-input"
                        required
                      />
                      <div className="input-glow"></div>
                    </div>
                  </div>

                  <div className={`form-group ${focusedField === 'email' ? 'focused' : ''}`}>
                    <label htmlFor="email" className="form-label">Имейл адрес</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      className="form-input"
                      required
                    />
                    <div className="input-glow"></div>
                  </div>

                  <div className={`form-group ${focusedField === 'phone' ? 'focused' : ''}`}>
                    <label htmlFor="phone" className="form-label">Телефон</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField('')}
                      className="form-input"
                      required
                    />
                    <div className="input-glow"></div>
                  </div>

                  <div className={`form-group ${focusedField === 'address' ? 'focused' : ''}`}>
                    <label htmlFor="address" className="form-label">Адрес за доставка</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('address')}
                      onBlur={() => setFocusedField('')}
                      className="form-textarea"
                      rows={3}
                      required
                    ></textarea>
                    <div className="input-glow"></div>
                  </div>

                  <div className={`form-group ${focusedField === 'city' ? 'focused' : ''}`}>
                    <label htmlFor="city" className="form-label">Град</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('city')}
                      onBlur={() => setFocusedField('')}
                      className="form-input"
                      required
                    />
                    <div className="input-glow"></div>
                  </div>

                  <div className="quantity-row">
                    <div className={`form-group quantity-group ${focusedField === 'quantity' ? 'focused' : ''}`}>
                      <label htmlFor="quantity" className="form-label">Количество</label>
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={decreaseQuantity}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('quantity')}
                          onBlur={() => setFocusedField('')}
                          className="quantity-input"
                          min="1"
                          max="10"
                        />
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={increaseQuantity}
                        >
                          +
                        </button>
                      </div>
                      <div className="input-glow"></div>
                    </div>

                    <div className="total-display">
                      <span className="total-label">Общо:</span>
                      <span className="total-amount">{totalPrice.toFixed(2)} лв</span>
                    </div>
                  </div>

                  <div className="payment-info">
                    <div className="payment-icon">💳</div>
                    <div className="payment-text">
                      <h4>Начин на плащане</h4>
                      <p>Наложено плащане при доставка</p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className={`submit-btn ${isLoading ? 'submitting' : ''}`}
                    disabled={isLoading}
                  >
                    <span className="btn-content">
                      {isLoading ? 'Изпращане...' : 'Поръчай сега'}
                    </span>
                    <div className="btn-glow"></div>
                    <div className="btn-particles">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="btn-particle"></div>
                      ))}
                    </div>
                  </button>
                </form>
              </div>
            </div>

            <div className="order-benefits">
              <h3 className="benefits-title">Защо да поръчате от нас?</h3>
              
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon">🚚</div>
                  <div className="benefit-content">
                    <h4>Бърза доставка</h4>
                    <p>2-3 работни дни до цяла България</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">🔒</div>
                  <div className="benefit-content">
                    <h4>Сигурно плащане</h4>
                    <p>Плащате при получаване на книгата</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">📞</div>
                  <div className="benefit-content">
                    <h4>Поддръжка 24/7</h4>
                    <p>Винаги сме на разположение за въпроси</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon">✨</div>
                  <div className="benefit-content">
                    <h4>Автентично издание</h4>
                    <p>Оригинална книга с висококачествена печат</p>
                  </div>
                </div>
              </div>

              <div className="trust-section">
                <h4 className="trust-title">Гаранция за качество</h4>
                <div className="trust-badges">
                  <div className="trust-badge">
                    <div className="badge-icon">🛡️</div>
                    <span>Сигурна поръчка</span>
                  </div>
                  <div className="trust-badge">
                    <div className="badge-icon">📦</div>
                    <span>Качествена опаковка</span>
                  </div>
                  <div className="trust-badge">
                    <div className="badge-icon">↩️</div>
                    <span>Връщане на средства</span>
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

export default OrderSection;
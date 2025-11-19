import { useState, useEffect } from 'react';
import './OrderSection.css';
import { useAuthContext } from '../../contexts/userContext';

const OrderSection = () => {
    const { submitBookOrder, isLoading, errorMessage, clearError, bookPrice, fetchBookPrice } = useAuthContext();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        quantity: 1,
        address: '',
        city: '',
        phone: '',
        acceptTerms: false, // НОВИ state
    });
    const [isVisible, setIsVisible] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [priceLoading, setPriceLoading] = useState(true);

    // Конвертиране на цената локално
    const exchangeRate = 1.95583;
    const priceBgn = bookPrice ? Number(bookPrice) : 28.0;
    const priceEur = priceBgn / exchangeRate;
    const totalPriceBgn = priceBgn * formData.quantity;
    const totalPriceEur = priceEur * formData.quantity;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        const element = document.querySelector('.OrderSection-order-section');
        if (element) observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Load book price on component mount
    useEffect(() => {
        const loadPrice = async () => {
            try {
                await fetchBookPrice();
            } catch (error) {
                console.error('Error loading book price:', error);
            } finally {
                setPriceLoading(false);
            }
        };

        loadPrice();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'quantity') {
            const numValue = parseInt(value) || 1;
            setFormData((prev) => ({
                ...prev,
                [name]: Math.max(1, Math.min(10, numValue)),
            }));
        } else if (type === 'checkbox') {
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        if (errorMessage) {
            clearError();
        }
    };

    const decreaseQuantity = () => {
        setFormData((prev) => ({
            ...prev,
            quantity: Math.max(1, prev.quantity - 1),
        }));
    };

    const increaseQuantity = () => {
        setFormData((prev) => ({
            ...prev,
            quantity: Math.min(10, prev.quantity + 1),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ВАЛИДАЦИЯ за условията
        if (!formData.acceptTerms) {
            alert('Моля, съгласете се с общите условия за да продължите.');
            return;
        }

        try {
            const orderData = {
                ...formData,
                totalPrice: totalPriceBgn,
                paymentMethod: 'cash_on_delivery',
                bookTitle: 'Пепел от детството',
                orderDate: new Date().toISOString(),
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
                    phone: '',
                    acceptTerms: false,
                });

                setTimeout(() => {
                    setOrderSuccess(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Order submission error:', error);
        }
    };

    if (orderSuccess) {
        return (
            <section className='OrderSection-order-section'>
                <div className='container'>
                    <div className='OrderSection-success-message'>
                        <div className='OrderSection-success-animation'>
                            <div className='OrderSection-success-icon'>✅</div>
                            <h2 className='OrderSection-success-title'>Поръчката е изпратена!</h2>
                            <p className='OrderSection-success-text'>Благодарим ви! Ще се свържем с вас в рамките на 24 часа за потвърждение.</p>
                            <button className='OrderSection-success-btn' onClick={() => setOrderSuccess(false)}>
                                Нова поръчка
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id='order-section' className='OrderSection-order-section'>
            <div className='OrderSection-order-background'>
                <div className='OrderSection-background-pattern'></div>
                <div className='OrderSection-floating-orbs'>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`OrderSection-floating-orb OrderSection-orb-${i + 1}`}></div>
                    ))}
                </div>
            </div>

            <div className='container'>
                <div className={`OrderSection-order-content ${isVisible ? 'OrderSection-fade-in-up' : ''}`}>
                    <div className='OrderSection-order-header'>
                        <h2 className='OrderSection-order-title OrderSection-dramatic-text'>
                            <span className='OrderSection-title-accent'>Поръчайте</span> Вашето Копие
                        </h2>
                        <p className='OrderSection-order-subtitle'>Получете "Пепел от детството" директно до вашия дом</p>
                        <div className='OrderSection-price-display'>
                            <span className='OrderSection-price-label'>Цена:</span>
                            <span className='OrderSection-price-amount'>
                                {priceLoading ? (
                                    <span className='OrderSection-price-loading'>Зареждане...</span>
                                ) : bookPrice ? (
                                    <span className='OrderSection-dual-price'>
                                        {priceBgn.toFixed(2)} лв. / {priceEur.toFixed(2)} €
                                    </span>
                                ) : (
                                    <span className='OrderSection-price-error'>Грешка при зареждане</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className='OrderSection-error-message'>
                            <div className='OrderSection-error-icon'>⚠️</div>
                            <p>{errorMessage}</p>
                            <button onClick={clearError} className='OrderSection-error-close'>
                                ×
                            </button>
                        </div>
                    )}

                    <div className='OrderSection-order-grid'>
                        <div className='OrderSection-order-form-container'>
                            <div className='OrderSection-form-wrapper'>
                                <div className='OrderSection-form-header'>
                                    <h3 className='OrderSection-form-title'>Данни за поръчка</h3>
                                    <div className='OrderSection-form-decoration'></div>
                                </div>

                                <form onSubmit={handleSubmit} className='OrderSection-order-form'>
                                    <div className='OrderSection-form-row'>
                                        <div className={`OrderSection-form-group ${focusedField === 'firstName' ? 'OrderSection-focused' : ''}`}>
                                            <label htmlFor='firstName' className='OrderSection-form-label'>
                                                Име
                                            </label>
                                            <input
                                                type='text'
                                                id='firstName'
                                                name='firstName'
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('firstName')}
                                                onBlur={() => setFocusedField('')}
                                                className='OrderSection-form-input'
                                                required
                                            />
                                            <div className='OrderSection-input-glow'></div>
                                        </div>

                                        <div className={`OrderSection-form-group ${focusedField === 'lastName' ? 'OrderSection-focused' : ''}`}>
                                            <label htmlFor='lastName' className='OrderSection-form-label'>
                                                Фамилия
                                            </label>
                                            <input
                                                type='text'
                                                id='lastName'
                                                name='lastName'
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                onFocus={() => setFocusedField('lastName')}
                                                onBlur={() => setFocusedField('')}
                                                className='OrderSection-form-input'
                                                required
                                            />
                                            <div className='OrderSection-input-glow'></div>
                                        </div>
                                    </div>

                                    <div className={`OrderSection-form-group ${focusedField === 'email' ? 'OrderSection-focused' : ''}`}>
                                        <label htmlFor='email' className='OrderSection-form-label'>
                                            Имейл адрес
                                        </label>
                                        <input
                                            type='email'
                                            id='email'
                                            name='email'
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField('')}
                                            className='OrderSection-form-input'
                                            required
                                        />
                                        <div className='OrderSection-input-glow'></div>
                                    </div>

                                    <div className={`OrderSection-form-group ${focusedField === 'phone' ? 'OrderSection-focused' : ''}`}>
                                        <label htmlFor='phone' className='OrderSection-form-label'>
                                            Телефон
                                        </label>
                                        <input
                                            type='tel'
                                            id='phone'
                                            name='phone'
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('phone')}
                                            onBlur={() => setFocusedField('')}
                                            className='OrderSection-form-input'
                                            required
                                        />
                                        <div className='OrderSection-input-glow'></div>
                                    </div>

                                    <div className={`OrderSection-form-group ${focusedField === 'address' ? 'OrderSection-focused' : ''}`}>
                                        <label htmlFor='address' className='OrderSection-form-label'>
                                            Адрес за доставка или офис на Еконт/Спиди
                                        </label>
                                        <textarea
                                            id='address'
                                            name='address'
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('address')}
                                            onBlur={() => setFocusedField('')}
                                            className='OrderSection-form-textarea'
                                            rows={3}
                                            required
                                        ></textarea>
                                        <div className='OrderSection-input-glow'></div>
                                    </div>

                                    <div className={`OrderSection-form-group ${focusedField === 'city' ? 'OrderSection-focused' : ''}`}>
                                        <label htmlFor='city' className='OrderSection-form-label'>
                                            Град
                                        </label>
                                        <input
                                            type='text'
                                            id='city'
                                            name='city'
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            onFocus={() => setFocusedField('city')}
                                            onBlur={() => setFocusedField('')}
                                            className='OrderSection-form-input'
                                            required
                                        />
                                        <div className='OrderSection-input-glow'></div>
                                    </div>

                                    <div className='OrderSection-quantity-row'>
                                        <div
                                            className={`OrderSection-form-group OrderSection-quantity-group ${
                                                focusedField === 'quantity' ? 'OrderSection-focused' : ''
                                            }`}
                                        >
                                            <label htmlFor='quantity' className='OrderSection-form-label'>
                                                Количество
                                            </label>
                                            <div className='OrderSection-quantity-controls'>
                                                <button type='button' className='OrderSection-quantity-btn' onClick={decreaseQuantity}>
                                                    −
                                                </button>
                                                <input
                                                    type='number'
                                                    id='quantity'
                                                    name='quantity'
                                                    value={formData.quantity}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setFocusedField('quantity')}
                                                    onBlur={() => setFocusedField('')}
                                                    className='OrderSection-quantity-input'
                                                    min='1'
                                                    max='10'
                                                />
                                                <button type='button' className='OrderSection-quantity-btn' onClick={increaseQuantity}>
                                                    +
                                                </button>
                                            </div>
                                            <div className='OrderSection-input-glow'></div>
                                        </div>

                                        <div className='OrderSection-total-display'>
                                            <span className='OrderSection-total-label'>Общо:</span>
                                            <span className='OrderSection-total-amount'>
                                                {priceLoading ? (
                                                    <span className='OrderSection-total-loading'>...</span>
                                                ) : bookPrice ? (
                                                    <span className='OrderSection-dual-total'>
                                                        {totalPriceBgn.toFixed(2)} лв. / {totalPriceEur.toFixed(2)} €
                                                    </span>
                                                ) : (
                                                    <span className='OrderSection-total-error'>Грешка</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='OrderSection-payment-info'>
                                        <div className='OrderSection-payment-icon'>💳</div>
                                        <div className='OrderSection-payment-text'>
                                            <h4>Начин на плащане</h4>
                                            <p>Наложено плащане при доставка</p>
                                        </div>
                                    </div>

                                    {/* НОВА СЕКЦИЯ - Съгласие с условията */}
                                    <div className='OrderSection-terms-section'>
                                        <div className='OrderSection-terms-checkbox'>
                                            <label className='OrderSection-terms-label'>
                                                <input
                                                    type='checkbox'
                                                    name='acceptTerms'
                                                    checked={formData.acceptTerms}
                                                    onChange={handleInputChange}
                                                    className='OrderSection-terms-input'
                                                    required
                                                />
                                                <span className='OrderSection-terms-checkmark'></span>
                                                <span className='OrderSection-terms-text'>
                                                    Съгласявам се с{' '}
                                                    <a href='/terms' target='_blank' rel='noopener noreferrer' className='OrderSection-terms-link'>
                                                        общите условия за продажба
                                                    </a>{' '}
                                                    и политиката за поверителност
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type='submit'
                                        className={`OrderSection-submit-btn ${isLoading ? 'OrderSection-submitting' : ''} ${
                                            priceLoading || !bookPrice || !formData.acceptTerms ? 'OrderSection-disabled' : ''
                                        }`}
                                        disabled={isLoading || priceLoading || !bookPrice || !formData.acceptTerms}
                                    >
                                        <span className='OrderSection-btn-content'>
                                            {isLoading
                                                ? 'Изпращане...'
                                                : priceLoading
                                                ? 'Зареждане...'
                                                : !bookPrice
                                                ? 'Грешка при зареждане'
                                                : !formData.acceptTerms
                                                ? 'Съгласете се с условията'
                                                : 'Поръчай сега'}
                                        </span>
                                        <div className='OrderSection-btn-glow'></div>
                                        <div className='OrderSection-btn-particles'>
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className='OrderSection-btn-particle'></div>
                                            ))}
                                        </div>
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className='OrderSection-order-benefits'>
                            <h3 className='OrderSection-benefits-title'>Защо да поръчате от нас?</h3>

                            <div className='OrderSection-benefits-list'>
                                <div className='OrderSection-benefit-item'>
                                    <div className='OrderSection-benefit-icon'>🚚</div>
                                    <div className='OrderSection-benefit-content'>
                                        <h4>Бърза доставка</h4>
                                        <p>2-3 работни дни до цяла България</p>
                                    </div>
                                </div>

                                <div className='OrderSection-benefit-item'>
                                    <div className='OrderSection-benefit-icon'>🔒</div>
                                    <div className='OrderSection-benefit-content'>
                                        <h4>Сигурно плащане</h4>
                                        <p>Плащате при получаване на книгата</p>
                                    </div>
                                </div>

                                <div className='OrderSection-benefit-item'>
                                    <div className='OrderSection-benefit-icon'>📞</div>
                                    <div className='OrderSection-benefit-content'>
                                        <h4>Поддръжка 24/7</h4>
                                        <p>Винаги сме на разположение за въпроси</p>
                                    </div>
                                </div>

                                <div className='OrderSection-benefit-item'>
                                    <div className='OrderSection-benefit-icon'>✨</div>
                                    <div className='OrderSection-benefit-content'>
                                        <h4>Автентично издание</h4>
                                        <p>Оригинална книга с висококачествена печат</p>
                                    </div>
                                </div>
                            </div>

                            <div className='OrderSection-trust-section'>
                                <h4 className='OrderSection-trust-title'>Гаранция за качество</h4>
                                <div className='OrderSection-trust-badges'>
                                    <div className='OrderSection-trust-badge'>
                                        <div className='OrderSection-badge-icon'>🛡️</div>
                                        <span>Сигурна поръчка</span>
                                    </div>
                                    <div className='OrderSection-trust-badge'>
                                        <div className='OrderSection-badge-icon'>📦</div>
                                        <span>Качествена опаковка</span>
                                    </div>
                                    <div className='OrderSection-trust-badge'>
                                        <div className='OrderSection-badge-icon'>↩️</div>
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

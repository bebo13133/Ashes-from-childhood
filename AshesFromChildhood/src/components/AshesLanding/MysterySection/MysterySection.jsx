import { useState, useEffect } from 'react';
import './MysterySection.css';
import { useAuthContext } from '../../contexts/userContext';

const MysterySection = () => {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [testimonials, setTestimonials] = useState([]);
    const [testimonialsLoading, setTestimonialsLoading] = useState(true);
    const [imageReviews, setImageReviews] = useState([]);
    const [imageReviewsLoading, setImageReviewsLoading] = useState(true);
    const [carouselImages, setCarouselImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const { fetchPublicReviews, fetchImageReviews } = useAuthContext();

    const bookQuotes = [
        'Домът може да бъде крепост… или клетка....',
        'Детството не забравя – то шепне през целия живот...',
        'Очите на едно дете виждат повече, отколкото възрастните искат да признаят....',
        'Любимите хора понякога са най-голямата болка....',
        'Когато възрастните воюват, децата са първите ранени...',
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

    // Добавете този useEffect за зареждане на отзиви
    useEffect(() => {
        const loadTestimonials = async () => {
            setTestimonialsLoading(true);
            try {
                const response = await fetchPublicReviews({ limit: 2 }); // Само 2 отзива

                if (response && response.reviews && response.reviews.length > 0) {
                    // Филтрираме само позитивните отзиви (4+ звезди) и взимаме първите 2
                    const positiveReviews = response.reviews.filter((review) => review.rating >= 4).slice(0, 2);

                    setTestimonials(positiveReviews);
                } else {
                    // Fallback към mock данни ако няма отзиви
                    setTestimonials([
                        {
                            id: 'mock-1',
                            comment: 'Не можах да спра да чета. Всяка страница ме докосваше все по-дълбоко...',
                            name: 'Мария, 34 г.',
                            rating: 5,
                        },
                        {
                            id: 'mock-2',
                            comment: 'Като родител, тази книга ми отвори очите за нещо, които никога не бях забелязвал.',
                            name: 'Петър, 28 г.',
                            rating: 5,
                        },
                    ]);
                }
            } catch (error) {
                console.error('Error loading testimonials:', error);
                // При грешка използваме mock данни
                setTestimonials([
                    {
                        id: 'mock-1',
                        comment: 'Не можах да спра да чета. Всяка страница ме докосваше все по-дълбоко...',
                        name: 'Мария, 34 г.',
                        rating: 5,
                    },
                    {
                        id: 'mock-2',
                        comment: 'Като родител, тази книга ми отвори очите за нещо, които никога не бях забелязвал.',
                        name: 'Петър, 28 г.',
                        rating: 5,
                    },
                ]);
            } finally {
                setTestimonialsLoading(false);
            }
        };

        loadTestimonials();
    }, [fetchPublicReviews]);

    // Add this useEffect after the testimonials loading useEffect
    useEffect(() => {
        const loadImageReviews = async () => {
            setImageReviewsLoading(true);
            try {
                const reviews = await fetchImageReviews();
                if (reviews && Array.isArray(reviews)) {
                    setImageReviews(reviews);
                }
            } catch (error) {
                console.error('Error loading image reviews:', error);
                setImageReviews([]);
            } finally {
                setImageReviewsLoading(false);
            }
        };

        loadImageReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array to load only once

    // When imageReviews load, initialize carouselImages once
    useEffect(() => {
        if (imageReviews && imageReviews.length > 0) {
            setCarouselImages(imageReviews);
        }
    }, [imageReviews]);

    // Carousel config
    const itemsPerView = 3; // keep in sync with CSS (3 cards visible on desktop)

    // Arrow buttons: loop (end → start, start → end)
    const nextCarousel = () => {
        setCarouselImages((prev) => {
            if (!prev || prev.length === 0) return prev;
            const [first, ...rest] = prev;
            return [...rest, first]; // move first to end
        });
    };

    const prevCarousel = () => {
        setCarouselImages((prev) => {
            if (!prev || prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            return [last, ...prev.slice(0, -1)]; // move last to front
        });
    };

    // Mouse drag handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
    };

    const handleMouseUp = (e) => {
        if (!isDragging) return;

        const diff = startX - e.pageX;
        const threshold = 20; // pixels

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // drag left → show next
                nextCarousel();
            } else {
                // drag right → show prev
                prevCarousel();
            }
        }

        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const nextQuote = () => {
        setCurrentQuoteIndex((prev) => (prev + 1) % bookQuotes.length);
    };

    const scrollToOrder = () => {
        const orderSection = document.getElementById('order-section');
        if (orderSection) {
            orderSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    // Добавете helper функция за съкращаване на текста
    const truncateComment = (text, maxLength = 100) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Добавете функция за генериране на инициали или възраст
    const formatAuthorName = (name) => {
        if (!name || name === 'Неизвестен') {
            return 'Анонимен читател';
        }

        // Ако името вече има формат "Име, възраст г." го връщаме както е
        if (name.includes(',') && name.includes('г.')) {
            return name;
        }

        // Ако е само име, добавяме "читател"
        return `${name}, читател`;
    };

    return (
        <section className='why-book-main'>
            <div className='why-book-container'>
                <div className={`why-book-content ${isVisible ? 'why-book-animate-in' : ''}`}>
                    {/* Header */}
                    <div className='why-book-header'>
                        <h2 className='why-book-main-title'>Защо читателите не могат да забравят тази книга?</h2>
                        <p className='why-book-main-subtitle'>Открийте историята, която ще промени начина ви на мислене за детството</p>
                    </div>

                    {/* Image Reviews Carousel */}
                    {imageReviewsLoading ? (
                        <div className='why-book-image-reviews-loading'>
                            <p>Зареждане на изображения...</p>
                        </div>
                    ) : carouselImages.length > 0 ? (
                        <div className='why-book-image-reviews'>
                            <div className='why-book-image-reviews-header'>
                                <h3 className='why-book-image-reviews-title'>Отзиви от читатели</h3>
                                {carouselImages.length > itemsPerView && (
                                    <div className='why-book-carousel-indicators'>
                                        {Array.from({ length: carouselImages.length }).map((_, idx) => (
                                            <button key={idx} className='why-book-carousel-dot' onClick={nextCarousel} aria-label={`Go to slide ${idx + 1}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className='why-book-image-reviews-carousel-wrapper'>
                                <button
                                    className='why-book-carousel-btn why-book-carousel-btn-prev'
                                    onClick={prevCarousel}
                                    disabled={carouselImages.length <= itemsPerView}
                                    aria-label='Previous images'
                                >
                                    &#8249;
                                </button>
                                <div
                                    className='why-book-image-reviews-carousel-container'
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className='why-book-image-reviews-carousel'>
                                        <div
                                            className='why-book-image-reviews-carousel-track'
                                            style={{ transform: 'translateX(0)', cursor: isDragging ? 'grabbing' : 'grab' }}
                                        >
                                            {carouselImages.map((review, index) => {
                                                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                                                const imagePath = review.imagePath.startsWith('/') ? review.imagePath : `/${review.imagePath}`;
                                                const imageUrl = `${apiUrl}${imagePath}`;

                                                return (
                                                    <div key={`${review.id || index}-${index}`} className='why-book-image-review-item'>
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Review ${index + 1}`}
                                                            className='why-book-image-review-img'
                                                            draggable={false}
                                                            onError={(e) => {
                                                                console.error('Error loading image:', imageUrl);
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className='why-book-carousel-btn why-book-carousel-btn-next'
                                    onClick={nextCarousel}
                                    disabled={carouselImages.length <= itemsPerView}
                                    aria-label='Next images'
                                >
                                    &#8250;
                                </button>
                            </div>
                        </div>
                    ) : null}

                    <div className='why-book-content-grid'>
                        {/* Emotional Connection Side */}
                        <div className='why-book-emotional-side'>
                            {/* Quote Display */}
                            <div className='why-book-quote-showcase'>
                                <div className='why-book-quote-container'>
                                    <div className='why-book-quote-mark'>"</div>
                                    <blockquote className='why-book-featured-quote'>{bookQuotes[currentQuoteIndex]}</blockquote>
                                    <cite className='why-book-quote-source'>- Из "Пепел от детството"</cite>
                                </div>

                                <button className='why-book-next-quote-btn' onClick={nextQuote}>
                                    <span>Следваща мисъл</span>
                                    <div className='why-book-btn-glow'></div>
                                </button>
                            </div>

                            {/* Emotional Impact */}
                            <div className='why-book-impact-section'>
                                <h3 className='why-book-impact-title'>Тази книга ще ви:</h3>
                                <div className='why-book-impact-list'>
                                    <div className='why-book-impact-item'>
                                        <div className='why-book-impact-icon'>💡</div>
                                        <div className='why-book-impact-text'>
                                            <strong>Разкрие нови перспективи</strong> за детския свят
                                        </div>
                                    </div>
                                    <div className='why-book-impact-item'>
                                        <div className='why-book-impact-icon'>❤️</div>
                                        <div className='why-book-impact-text'>
                                            <strong>Докосне емоционално</strong> с истински моменти
                                        </div>
                                    </div>
                                    <div className='why-book-impact-item'>
                                        <div className='why-book-impact-icon'>🔗</div>
                                        <div className='why-book-impact-text'>
                                            <strong>Свържете с личните ви спомени</strong> от детството
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Urgent Message */}
                            <div className='why-book-urgent-section'>
                                <div className='why-book-urgent-label'>
                                    <span>📖 Важно! Бройките са строго ограничени. Не отлагай. Тази история не чака.</span>
                                </div>

                                <button className='why-book-order-btn' onClick={scrollToOrder}>
                                    Вземи я сега
                                </button>
                            </div>
                        </div>

                        {/* Sales-focused Side */}
                        <div className='why-book-sales-side'>
                            {/* Value Proposition */}
                            <div className='why-book-value-prop'>
                                <h3 className='why-book-value-title'>Повече от книга - Това е емоционално преживяване</h3>

                                <div className='why-book-benefits-grid'>
                                    <div className='why-book-benefit-card'>
                                        <div className='why-book-benefit-header'>
                                            <span className='why-book-benefit-icon'>👁️</span>
                                            <h4>Уникална перспектива</h4>
                                        </div>
                                        <p>Света през очите на новородено дете - гледна точка, която никога не сте изживявали</p>
                                    </div>

                                    <div className='why-book-benefit-card'>
                                        <div className='why-book-benefit-header'>
                                            <span className='why-book-benefit-icon'>🎭</span>
                                            <h4>Автентични емоции</h4>
                                        </div>
                                        <p>Истински моменти на радост, болка и надежда, разказани с рядка откровеност</p>
                                    </div>

                                    <div className='why-book-benefit-card'>
                                        <div className='why-book-benefit-header'>
                                            <span className='why-book-benefit-icon'>🌟</span>
                                            <h4>Трайно въздействие</h4>
                                        </div>
                                        <p>История, която ще остане с вас дълго след последната страница</p>
                                    </div>

                                    <div className='why-book-benefit-card'>
                                        <div className='why-book-benefit-header'>
                                            <span className='why-book-benefit-icon'>🔍</span>
                                            <h4>Дълбок смисъл</h4>
                                        </div>
                                        <p>Философски въпроси за семейството, любовта и човешката природа</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Proof - Заменено с динамични данни */}
                            <div className='why-book-social-proof'>
                                <h4 className='why-book-social-title'>Читателите споделят:</h4>
                                <div className='why-book-testimonials'>
                                    {testimonialsLoading ? (
                                        <div className='why-book-testimonials-loading'>
                                            <p>Зареждане на отзиви...</p>
                                        </div>
                                    ) : testimonials.length > 0 ? (
                                        testimonials.map((testimonial) => (
                                            <div key={testimonial.id} className='why-book-testimonial'>
                                                <div className='why-book-testimonial-text'>"{truncateComment(testimonial.comment, 120)}"</div>
                                                <div className='why-book-testimonial-author'>
                                                    - {formatAuthorName(testimonial.name || testimonial.displayName)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='why-book-testimonial'>
                                            <div className='why-book-testimonial-text'>"Невероятна книга! Препоръчвам я на всички."</div>
                                            <div className='why-book-testimonial-author'>- Читател</div>
                                        </div>
                                    )}
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

/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import './ReviewsSection.css';
import { useAuthContext } from '../../contexts/userContext';

const ReviewsSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        isAnonymous: false,
        rating: 5,
        comment: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [imageReviews, setImageReviews] = useState([]);
    const [imageReviewsLoading, setImageReviewsLoading] = useState(true);
    const [carouselImages, setCarouselImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { submitReview, fetchPublicReviews, markReviewAsHelpful, fetchImageReviews, isLoading } = useAuthContext();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        const element = document.querySelector('.reviews-section');
        if (element) observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Detect mobile/tablet screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Зареждане на одобрените отзиви
    useEffect(() => {
        const loadReviews = async () => {
            setReviewsLoading(true);
            try {
                const response = await fetchPublicReviews({ limit: 1000 });

                if (response && response.reviews) {
                    setReviews(response.reviews);
                    setTotalReviews(response.totalReviews || response.reviews.length);

                    // Изчисляване на средната оценка
                    if (response.reviews.length > 0) {
                        const sum = response.reviews.reduce((acc, review) => acc + review.rating, 0);
                        setAverageRating(sum / response.reviews.length);
                    } else {
                        setAverageRating(0);
                    }
                }
            } catch (error) {
                console.error('Error loading reviews:', error);
                setReviews([]);
                setTotalReviews(0);
                setAverageRating(0);
            } finally {
                setReviewsLoading(false);
            }
        };

        loadReviews();
    }, [fetchPublicReviews]);

    // Проверка за anti-spam flag
    useEffect(() => {
        const hasReviewed = localStorage.getItem('hasReviewedBook');
        if (hasReviewed === 'true') {
            setShowForm(false);
        }
    }, []);

    // Load image reviews for carousel
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
    }, []);

    // Initialize carousel images when imageReviews load
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : name === 'rating' ? parseInt(value) : value,
        }));
    };

    const handleStarHover = (rating) => {
        setHoveredRating(rating);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    const handleStarClick = (rating) => {
        setFormData((prev) => ({
            ...prev,
            rating: rating,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const reviewData = {
                name: formData.isAnonymous ? 'Анонимен читател' : formData.name,
                isAnonymous: formData.isAnonymous,
                rating: parseInt(formData.rating),
                comment: formData.comment,
            };

            await submitReview(reviewData);

            // Запазва flag в localStorage
            localStorage.setItem('hasReviewedBook', 'true');

            setShowForm(false);
            setShowThankYou(true);

            // Скрива благодарствена msg след 5 сек
            setTimeout(() => {
                setShowThankYou(false);
            }, 5000);
        } catch (error) {
            console.error('Error submitting review:', error);
            // Можете да добавите error toast notification тук
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>
                ★
            </span>
        ));
    };

    const handleHelpfulClick = async (reviewId) => {
        try {
            const response = await markReviewAsHelpful(reviewId);

            // Обновява локалното състояние с данните от сървъра
            if (response && response.helpful !== undefined) {
                setReviews((prev) => prev.map((review) => (review.id === reviewId ? { ...review, helpful: response.helpful } : review)));
            }
        } catch (error) {
            // Check if it's the "already liked" error
            if (error.message && error.message.includes('already liked')) {
                // Don't show error, just silently fail
                return;
            }
            console.error('Error marking review as helpful:', error);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('bg-BG');
        } catch (error) {
            return dateString;
        }
    };

    return (
        <section className='reviews-section'>
            <div className='container'>
                <div className={`reviews-content ${isVisible ? 'fade-in-up' : ''}`}>
                    {/* Header */}
                    <div className='reviews-main-header'>
                        <h2 className='reviews-main-title'>Защо читателите не могат да забравят тази книга?</h2>
                        <p className='reviews-main-subtitle'>Открийте историята, която ще промени начина ви на мислене за детството</p>
                    </div>

                    {/* Image Reviews Carousel - Top Reviews from other sources */}
                    {imageReviewsLoading ? (
                        <div className='reviews-image-reviews-loading'>
                            <p>Зареждане на изображения...</p>
                        </div>
                    ) : carouselImages.length > 0 ? (
                        <div className='reviews-image-reviews'>
                            <div className='reviews-image-reviews-header'>
                                <h3 className='reviews-image-reviews-title'>Отзиви от други източници</h3>
                            </div>
                            <div className='reviews-image-reviews-carousel-wrapper'>
                                <button
                                    className='reviews-carousel-btn reviews-carousel-btn-prev'
                                    onClick={prevCarousel}
                                    disabled={carouselImages.length <= itemsPerView}
                                    aria-label='Previous images'
                                >
                                    &#8249;
                                </button>
                                <div
                                    className='reviews-image-reviews-carousel-container'
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className='reviews-image-reviews-carousel'>
                                        <div
                                            className='reviews-image-reviews-carousel-track'
                                            style={{ transform: 'translateX(0)', cursor: isDragging ? 'grabbing' : 'grab' }}
                                        >
                                            {carouselImages.map((review, index) => {
                                                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                                                const imagePath = review.imagePath.startsWith('/') ? review.imagePath : `/${review.imagePath}`;
                                                const imageUrl = `${apiUrl}${imagePath}`;

                                                return (
                                                    <div key={`${review.id || index}-${index}`} className='reviews-image-review-item'>
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Review ${index + 1}`}
                                                            className='reviews-image-review-img'
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
                                    className='reviews-carousel-btn reviews-carousel-btn-next'
                                    onClick={nextCarousel}
                                    disabled={carouselImages.length <= itemsPerView}
                                    aria-label='Next images'
                                >
                                    &#8250;
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {/* Call to Action - Encourage Review Writing */}
                    <div className='reviews-cta-message'>
                        <p className='reviews-cta-text'>Споделете и вашето мнение - вашият отзив е важен за нас!</p>
                    </div>

                    <div className='reviews-grid'>
                        {/* Review Form */}
                        <div className='review-form-container'>
                            {showThankYou && (
                                <div className='thank-you-message'>
                                    <div className='thank-you-icon'>🙏</div>
                                    <h3>Благодарим за отзива!</h3>
                                    <p>Вашето мнение е важно за нас и за бъдещите читатели. Отзивът ще бъде публикуван след одобрение.</p>
                                </div>
                            )}

                            {showForm && !showThankYou && (
                                <div className='review-form-wrapper'>
                                    <div className='form-header'>
                                        <p className='form-subtitle'>Помогнете на други читатели с вашия отзив</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className='review-form'>
                                        {/* Name/Anonymous Toggle */}
                                        <div className='name-section'>
                                            <div className='name-input-container'>
                                                <input
                                                    type='text'
                                                    name='name'
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder='Вашето име'
                                                    className='name-input'
                                                    required={!formData.isAnonymous}
                                                    disabled={formData.isAnonymous}
                                                />
                                            </div>

                                            <div className='anonymous-toggle'>
                                                <label className='toggle-label'>
                                                    <span className='toggle-text'>или бъдете анонимни</span>
                                                    <input
                                                        type='checkbox'
                                                        name='isAnonymous'
                                                        checked={formData.isAnonymous}
                                                        onChange={handleInputChange}
                                                        className='toggle-input'
                                                    />
                                                    <span className='toggle-slider'></span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className='rating-section'>
                                            <label className='rating-label'>Оценка</label>
                                            <div className='rating-input'>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <label
                                                        key={star}
                                                        className={`star-label ${star <= (hoveredRating || formData.rating) ? 'selected' : ''}`}
                                                        onMouseEnter={() => handleStarHover(star)}
                                                        onMouseLeave={handleStarLeave}
                                                        onClick={() => handleStarClick(star)}
                                                    >
                                                        <input
                                                            type='radio'
                                                            name='rating'
                                                            value={star}
                                                            checked={formData.rating === star}
                                                            onChange={handleInputChange}
                                                            className='star-input'
                                                        />
                                                        <span className='star-icon'>★</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Comment */}
                                        <div className='comment-section'>
                                            <label className='comment-label'>Вашия отзив</label>
                                            <textarea
                                                name='comment'
                                                value={formData.comment}
                                                onChange={handleInputChange}
                                                placeholder='Споделете какво мислите за книгата...'
                                                className='comment-textarea'
                                                rows={4}
                                                required
                                                maxLength={500}
                                            ></textarea>
                                            <div className='character-count'>{formData.comment.length}/500</div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type='submit'
                                            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                                            disabled={isSubmitting || isLoading}
                                        >
                                            <span className='button-text'>{isSubmitting ? 'Изпращане...' : 'Публикувай отзив'}</span>
                                            <div className='button-glow'></div>
                                        </button>
                                    </form>
                                </div>
                            )}

                            {!showForm && !showThankYou && (
                                <div className='already-reviewed'>
                                    <div className='reviewed-icon'>✓</div>
                                    <h3>Вече сте оставили отзив</h3>
                                    <p>Благодарим за споделеното мнение!</p>
                                </div>
                            )}
                        </div>

                        {/* Reviews List */}
                        <div className='reviews-list'>
                            <h3 className='list-title'>Отзиви от наши читатели</h3>
                            <div className='reviews-container'>
                                {reviewsLoading ? (
                                    <div className='reviews-loading'>
                                        <div className='loading-spinner'></div>
                                        <p>Зареждане на отзивите...</p>
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <>
                                        {(isMobile && !showAllReviews ? reviews.slice(0, 3) : reviews).map((review, index) => (
                                            <div
                                                key={review.id}
                                                className={`review-card ${isVisible ? 'slide-in' : ''}`}
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <div className='review-header'>
                                                    <div className='reviewer-info'>
                                                        <div className='reviewer-avatar'>
                                                            {review.isAnonymous ? (
                                                                <span className='anonymous-icon'>👤</span>
                                                            ) : (
                                                                review.displayName?.charAt(0)?.toUpperCase() || 'N'
                                                            )}
                                                        </div>
                                                        <div className='reviewer-details'>
                                                            <h4 className='reviewer-name'>{review.displayName || 'N'}</h4>
                                                            <div className='review-rating'>{renderStars(review.rating)}</div>
                                                        </div>
                                                    </div>
                                                    <div className='review-date'>{formatDate(review.date || review.createdAt)}</div>
                                                </div>

                                                <div className='review-content'>
                                                    <p className='review-text'>{review.comment}</p>
                                                </div>

                                                <div className='review-footer'>
                                                    <button className='helpful-button' onClick={() => handleHelpfulClick(review.id)}>
                                                        <span className='helpful-icon'>👍</span>
                                                        <span className='helpful-text'>Полезно ({review.helpful || 0})</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {isMobile && reviews.length > 3 && !showAllReviews && (
                                            <button className='show-more-reviews-btn' onClick={() => setShowAllReviews(true)}>
                                                Покажи всички отзиви ({reviews.length})
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className='no-reviews'>
                                        <p>Все още няма отзиви. Бъдете първият, който ще сподели мнение!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;

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
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const {
    submitReview,
    fetchPublicReviews,
    markReviewAsHelpful,
    isLoading
  } = useAuthContext();

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleStarHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
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
        comment: formData.comment
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
      await markReviewAsHelpful(reviewId);

      // Обновява локалното състояние
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, helpful: (review.helpful || 0) + 1 }
          : review
      ));
    } catch (error) {
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
    <section className="reviews-section">
      <div className="container">
        <div className={`reviews-content ${isVisible ? 'fade-in-up' : ''}`}>

          {/* Section Header */}
          <div className="reviews-header">
            <h2 className="reviews-title">
              Какво казват <span className="title-accent">Читателите</span>
            </h2>
            <div className="reviews-summary">
              <div className="rating-overview">
                {reviewsLoading ? (
                  <div className="loading-placeholder">Зареждане...</div>
                ) : (
                  <div className="average-rating">
                    <span className="rating-number">{averageRating.toFixed(1)}</span>
                    <div className="rating-stars">
                      {renderStars(Math.round(averageRating))}
                    </div>
                  </div>
                )}
                <p className="total-reviews">Базирано на {totalReviews} отзива</p>
              </div>
            </div>
          </div>

          <div className="reviews-grid">

            {/* Review Form */}
            <div className="review-form-container">
              {showThankYou && (
                <div className="thank-you-message">
                  <div className="thank-you-icon">🙏</div>
                  <h3>Благодарим за отзива!</h3>
                  <p>Вашето мнение е важно за нас и за бъдещите читатели. Отзивът ще бъде публикуван след одобрение.</p>
                </div>
              )}

              {showForm && !showThankYou && (
                <div className="review-form-wrapper">
                  <div className="form-header">
                    <h3 className="form-title">Споделете вашето мнение</h3>
                    <p className="form-subtitle">Помогнете на други читатели с вашия отзив</p>
                  </div>

                  <form onSubmit={handleSubmit} className="review-form">

                    {/* Name/Anonymous Toggle */}
                    <div className="name-section">
                      <div className="anonymous-toggle">
                        <label className="toggle-label">
                          <input
                            type="checkbox"
                            name="isAnonymous"
                            checked={formData.isAnonymous}
                            onChange={handleInputChange}
                            className="toggle-input"
                          />
                          <span className="toggle-slider"></span>
                          <span className="toggle-text">Анонимен отзив</span>
                        </label>
                      </div>

                      {!formData.isAnonymous && (
                        <div className="name-input-container">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Вашето име"
                            className="name-input"
                            required={!formData.isAnonymous}
                          />
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="rating-section">
                      <label className="rating-label">Оценка</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map(star => (
                          <label
                            key={star}
                            className={`star-label ${star <= (hoveredRating || formData.rating) ? 'selected' : ''
                              }`}
                            onMouseEnter={() => handleStarHover(star)}
                            onMouseLeave={handleStarLeave}
                            onClick={() => handleStarClick(star)}
                          >
                            <input
                              type="radio"
                              name="rating"
                              value={star}
                              checked={formData.rating === star}
                              onChange={handleInputChange}
                              className="star-input"
                            />
                            <span className="star-icon">★</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="comment-section">
                      <label className="comment-label">Вашия отзив</label>
                      <textarea
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        placeholder="Споделете какво мислите за книгата..."
                        className="comment-textarea"
                        rows={4}
                        required
                        maxLength={500}
                      ></textarea>
                      <div className="character-count">
                        {formData.comment.length}/500
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                      disabled={isSubmitting || isLoading}
                    >
                      <span className="button-text">
                        {isSubmitting ? 'Изпращане...' : 'Публикувай отзив'}
                      </span>
                      <div className="button-glow"></div>
                    </button>
                  </form>
                </div>
              )}

              {!showForm && !showThankYou && (
                <div className="already-reviewed">
                  <div className="reviewed-icon">✓</div>
                  <h3>Вече сте оставили отзив</h3>
                  <p>Благодарим за споделеното мнение!</p>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
              <h3 className="list-title">Последни отзиви</h3>
              <div className="reviews-container">
                {reviewsLoading ? (
                  <div className="reviews-loading">
                    <div className="loading-spinner"></div>
                    <p>Зареждане на отзивите...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div
                      key={review.id}
                      className={`review-card ${isVisible ? 'slide-in' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.isAnonymous ? '?' : (review.name?.charAt(0)?.toUpperCase() || 'N')}
                          </div>
                          <div className="reviewer-details">
                            <h4 className="reviewer-name">{review.name}</h4>
                            <div className="review-rating">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <div className="review-date">
                          {formatDate(review.date || review.createdAt)}
                        </div>
                      </div>

                      <div className="review-content">
                        <p className="review-text">{review.comment}</p>
                      </div>

                      <div className="review-footer">
                        <button
                          className="helpful-button"
                          onClick={() => handleHelpfulClick(review.id)}
                        >
                          <span className="helpful-icon">👍</span>
                          <span className="helpful-text">Полезно ({review.helpful || 0})</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">
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
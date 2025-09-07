/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './RatingsReviews.css';
import { useAuthContext } from '../../contexts/userContext';

const RatingsReviews = () => {
  const { 
    fetchRatingsData, 
    updateReviewStatus, 
    ratingsData, 
    isLoading 
  } = useAuthContext();

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);

  // Mock data - replace with real API data
  const [reviews, setReviews] = useState([
    {
      id: 'REV-001',
      name: 'Мария Петрова',
      rating: 5,
      comment: 'Изключителна книга! Много емоционална и добре написана. Препоръчвам я на всички.',
      status: 'pending',
      createdAt: '2024-11-15T14:30:00Z',
      isAnonymous: false,
      helpful: 0
    },
    {
      id: 'REV-002',
      name: 'Анонимен читател',
      rating: 4,
      comment: 'Много добра книга, но някои части бяха малко бавни за мен.',
      status: 'approved',
      createdAt: '2024-11-14T10:15:00Z',
      approvedAt: '2024-11-14T16:20:00Z',
      isAnonymous: true,
      helpful: 12
    },
    {
      id: 'REV-003',
      name: 'Иван Димитров',
      rating: 5,
      comment: 'Невероятно! Една от най-добрите книги, които съм чел.',
      status: 'approved',
      createdAt: '2024-11-13T09:45:00Z',
      approvedAt: '2024-11-13T11:30:00Z',
      isAnonymous: false,
      helpful: 8
    },
    {
      id: 'REV-004',
      name: 'Спам потребител',
      rating: 1,
      comment: 'Ужасна книга, не я купувайте!!! Посетете нашия сайт за по-добри книги...',
      status: 'rejected',
      createdAt: '2024-11-12T15:20:00Z',
      rejectedAt: '2024-11-12T15:25:00Z',
      isAnonymous: false,
      helpful: 0
    },
    {
      id: 'REV-005',
      name: 'Елена Георгиева',
      rating: 4,
      comment: 'Добра книга, но имах по-високи очаквания.',
      status: 'hidden',
      createdAt: '2024-11-11T18:10:00Z',
      hiddenAt: '2024-11-12T09:15:00Z',
      isAnonymous: false,
      helpful: 3
    }
  ]);

  const [stats, setStats] = useState({
    totalReviews: 125,
    averageRating: 4.6,
    pendingReviews: 15,
    approvedReviews: 89,
    rejectedReviews: 12,
    hiddenReviews: 9
  });

  const ratingDistribution = [
    { rating: 5, count: 67, percentage: 53.6 },
    { rating: 4, count: 32, percentage: 25.6 },
    { rating: 3, count: 18, percentage: 14.4 },
    { rating: 2, count: 5, percentage: 4.0 },
    { rating: 1, count: 3, percentage: 2.4 }
  ];

  const monthlyReviews = [
    { month: 'Яну', reviews: 8, avgRating: 4.2 },
    { month: 'Фев', reviews: 12, avgRating: 4.4 },
    { month: 'Мар', reviews: 15, avgRating: 4.3 },
    { month: 'Апр', reviews: 18, avgRating: 4.5 },
    { month: 'Май', reviews: 22, avgRating: 4.6 },
    { month: 'Юни', reviews: 19, avgRating: 4.7 },
    { month: 'Юли', reviews: 16, avgRating: 4.5 },
    { month: 'Авг', reviews: 14, avgRating: 4.8 },
    { month: 'Сеп', reviews: 21, avgRating: 4.6 },
    { month: 'Окт', reviews: 25, avgRating: 4.7 },
    { month: 'Ное', reviews: 18, avgRating: 4.5 }
  ];

  useEffect(() => {
    loadRatingsData();
  }, []);

  const loadRatingsData = async () => {
    try {
      // В реалното приложение:
      // await fetchRatingsData();
    } catch (error) {
      console.error('Error loading ratings data:', error);
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                status: newStatus,
                [`${newStatus}At`]: new Date().toISOString()
              }
            : review
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingReviews: prev.pendingReviews - (newStatus !== 'pending' ? 1 : 0),
        approvedReviews: prev.approvedReviews + (newStatus === 'approved' ? 1 : 0),
        rejectedReviews: prev.rejectedReviews + (newStatus === 'rejected' ? 1 : 0),
        hiddenReviews: prev.hiddenReviews + (newStatus === 'hidden' ? 1 : 0)
      }));
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedReviews.length === 0) return;
    
    if (window.confirm(`Сигурни ли сте, че искате да промените статуса на ${selectedReviews.length} отзива?`)) {
      try {
        for (const reviewId of selectedReviews) {
          await updateReviewStatus(reviewId, newStatus);
        }
        
        setReviews(prev => 
          prev.map(review => 
            selectedReviews.includes(review.id)
              ? { 
                  ...review, 
                  status: newStatus,
                  [`${newStatus}At`]: new Date().toISOString()
                }
              : review
          )
        );
        
        setSelectedReviews([]);
      } catch (error) {
        console.error('Error with bulk status change:', error);
      }
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || review.status === filter;
    const matchesSearch = 
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) 
    //   review.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'hidden': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Чака одобрение';
      case 'approved': return 'Одобрен';
      case 'rejected': return 'Отхвърлен';
      case 'hidden': return 'Скрит';
      default: return status;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`ratings-reviews-star ${i < rating ? 'ratings-reviews-star--filled' : 'ratings-reviews-star--empty'}`}>
        ★
      </span>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('bg-BG');
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="ratings-reviews-loading">
        <div className="ratings-reviews-loading-spinner"></div>
        <p>Зареждане на рейтинги и отзиви...</p>
      </div>
    );
  }

  return (
    <div className="ratings-reviews-container">
      {/* Header */}
      <div className="ratings-reviews-header">
        <div className="ratings-reviews-header-info">
          <h2 className="ratings-reviews-title">Рейтинги и отзиви</h2>
          <p className="ratings-reviews-subtitle">
            Управление на потребителски отзиви и оценки
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="ratings-reviews-stats-grid">
        <div className="ratings-reviews-stat-card">
          <div className="ratings-reviews-stat-icon">⭐</div>
          <div className="ratings-reviews-stat-content">
            <h3>Средна оценка</h3>
            <p className="ratings-reviews-stat-number">{stats.averageRating}/5</p>
            <span className="ratings-reviews-stat-change">Базирано на {stats.totalReviews} отзива</span>
          </div>
        </div>

        <div className="ratings-reviews-stat-card">
          <div className="ratings-reviews-stat-icon">📝</div>
          <div className="ratings-reviews-stat-content">
            <h3>Общо отзиви</h3>
            <p className="ratings-reviews-stat-number">{stats.totalReviews}</p>
            <span className="ratings-reviews-stat-change ratings-reviews-stat-change--positive">+15% този месец</span>
          </div>
        </div>

        <div className="ratings-reviews-stat-card">
          <div className="ratings-reviews-stat-icon">⏳</div>
          <div className="ratings-reviews-stat-content">
            <h3>Чакат одобрение</h3>
            <p className="ratings-reviews-stat-number">{stats.pendingReviews}</p>
            <span className="ratings-reviews-stat-change">Изискват внимание</span>
          </div>
        </div>

        <div className="ratings-reviews-stat-card">
          <div className="ratings-reviews-stat-icon">✅</div>
          <div className="ratings-reviews-stat-content">
            <h3>Одобрени</h3>
            <p className="ratings-reviews-stat-number">{stats.approvedReviews}</p>
            <span className="ratings-reviews-stat-change ratings-reviews-stat-change--positive">{((stats.approvedReviews / stats.totalReviews) * 100).toFixed(1)}% от всички</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="ratings-reviews-charts-grid">
        {/* Rating Distribution */}
        <div className="ratings-reviews-chart-card">
          <div className="ratings-reviews-chart-header">
            <h3>Разпределение на оценките</h3>
          </div>
          <div className="ratings-reviews-chart-content">
            {ratingDistribution.map((item, index) => (
              <div key={index} className="ratings-reviews-rating-row">
                <div className="ratings-reviews-rating-label">
                  {renderStars(item.rating)}
                  <span>{item.rating}</span>
                </div>
                <div className="ratings-reviews-rating-bar">
                  <div 
                    className="ratings-reviews-rating-fill"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="ratings-reviews-rating-count">
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="ratings-reviews-chart-card">
          <div className="ratings-reviews-chart-header">
            <h3>Месечни тенденции</h3>
          </div>
          <div className="ratings-reviews-chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyReviews}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="reviews" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="ratings-reviews-controls">
        <div className="ratings-reviews-search-box">
          <input
            type="text"
            placeholder="Търсене по име, имейл или съдържание..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ratings-reviews-search-input"
          />
          <span className="ratings-reviews-search-icon">🔍</span>
        </div>

        <div className="ratings-reviews-filter-group">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="ratings-reviews-filter-select"
          >
            <option value="all">Всички статуси</option>
            <option value="pending">Чакат одобрение</option>
            <option value="approved">Одобрени</option>
            <option value="rejected">Отхвърлени</option>
            <option value="hidden">Скрити</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="ratings-reviews-filter-select"
          >
            <option value="createdAt-desc">Най-нови първо</option>
            <option value="createdAt-asc">Най-стари първо</option>
            <option value="rating-desc">Най-висока оценка</option>
            <option value="rating-asc">Най-ниска оценка</option>
            <option value="helpful-desc">Най-полезни</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="ratings-reviews-bulk-actions">
          <span className="ratings-reviews-selected-count">
            Избрани: {selectedReviews.length} отзива
          </span>
          <div className="ratings-reviews-bulk-buttons">
            <button 
              className="ratings-reviews-bulk-btn ratings-reviews-bulk-btn--approved"
              onClick={() => handleBulkStatusChange('approved')}
            >
              Одобри
            </button>
            <button 
              className="ratings-reviews-bulk-btn ratings-reviews-bulk-btn--rejected"
              onClick={() => handleBulkStatusChange('rejected')}
            >
              Отхвърли
            </button>
            <button 
              className="ratings-reviews-bulk-btn ratings-reviews-bulk-btn--hidden"
              onClick={() => handleBulkStatusChange('hidden')}
            >
              Скрий
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="ratings-reviews-list-container">
        {paginatedReviews.length === 0 ? (
          <div className="ratings-reviews-empty-state">
            <div className="ratings-reviews-empty-icon">📝</div>
            <h3>Няма намерени отзиви</h3>
            <p>Променете филтрите или критериите за търсене</p>
          </div>
        ) : (
          <div className="ratings-reviews-list">
            <div className="ratings-reviews-list-header">
              <label className="ratings-reviews-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedReviews.length === paginatedReviews.length && paginatedReviews.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedReviews(paginatedReviews.map(review => review.id));
                    } else {
                      setSelectedReviews([]);
                    }
                  }}
                />
                Избери всички
              </label>
            </div>

            {paginatedReviews.map(review => (
              <div key={review.id} className="ratings-reviews-review-card">
                <div className="ratings-reviews-review-header">
                  <label className="ratings-reviews-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReviews(prev => [...prev, review.id]);
                        } else {
                          setSelectedReviews(prev => prev.filter(id => id !== review.id));
                        }
                      }}
                    />
                  </label>

                  <div className="ratings-reviews-reviewer-info">
                    <div className="ratings-reviews-reviewer-avatar">
                      {review.isAnonymous ? '?' : review.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ratings-reviews-reviewer-details">
                      <h4 className="ratings-reviews-reviewer-name">{review.name}</h4>
                      {/* <p className="ratings-reviews-reviewer-email">{review.email}</p> */}
                    </div>
                  </div>

                  <div className="ratings-reviews-review-rating">
                    {renderStars(review.rating)}
                    <span className="ratings-reviews-rating-number">{review.rating}/5</span>
                  </div>

                  <div className="ratings-reviews-review-status">
                    <span 
                      className="ratings-reviews-status-badge"
                      style={{ backgroundColor: getStatusColor(review.status) }}
                    >
                      {getStatusText(review.status)}
                    </span>
                  </div>
                </div>

                <div className="ratings-reviews-review-content">
                  <p className="ratings-reviews-review-text">
                    {truncateText(review.comment, 200)}
                  </p>
                </div>

                <div className="ratings-reviews-review-footer">
                  <div className="ratings-reviews-review-meta">
                    <span className="ratings-reviews-review-date">
                      Публикуван: {formatDate(review.createdAt)}
                    </span>
                    {review.helpful > 0 && (
                      <span className="ratings-reviews-helpful-count">
                        👍 {review.helpful} полезни
                      </span>
                    )}
                  </div>

                  <div className="ratings-reviews-review-actions">
                    <select
                      value={review.status}
                      onChange={(e) => handleStatusChange(review.id, e.target.value)}
                      className="ratings-reviews-status-select"
                    >
                      <option value="pending">Чака одобрение</option>
                      <option value="approved">Одобрен</option>
                      <option value="rejected">Отхвърлен</option>
                      <option value="hidden">Скрит</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ratings-reviews-pagination">
          <button
            className="ratings-reviews-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← Предишна
          </button>
          
          <div className="ratings-reviews-page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`ratings-reviews-page-number ${page === currentPage ? 'ratings-reviews-page-number--active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="ratings-reviews-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Следваща →
          </button>
        </div>
      )}
    </div>
  );
};

export default RatingsReviews;
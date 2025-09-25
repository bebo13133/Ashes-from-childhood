/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './RatingsReviews.css';
import { useAuthContext } from '../../contexts/userContext';

const RatingsReviews = () => {
  const { 
    fetchRatingsData, 
    updateReviewStatus,
    deleteReview,
    isLoading 
  } = useAuthContext();

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');

  // State for real API data
  const [allReviews, setAllReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    hiddenReviews: 0
  });
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [monthlyReviews, setMonthlyReviews] = useState([]);

  useEffect(() => {
    loadAllReviewsData();
  }, []);

  // Основна функция за зареждане на всички отзиви
  const loadAllReviewsData = async () => {
    setLocalLoading(true);
    setError('');
    
    try {
      // Зареждаме всички статуси поотделно и ги обединяваме
      const [pendingData, approvedData, rejectedData, hiddenData] = await Promise.allSettled([
        fetchRatingsData({ status: 'pending', limit: 1000 }),
        fetchRatingsData({ status: 'approved', limit: 1000 }),
        fetchRatingsData({ status: 'rejected', limit: 1000 }),
        fetchRatingsData({ status: 'hidden', limit: 1000 })
      ]);

      // Извличаме данните от успешните заявки
      const allReviewsData = [];
      
      if (pendingData.status === 'fulfilled' && pendingData.value?.reviews) {
        allReviewsData.push(...pendingData.value.reviews);
      }
      if (approvedData.status === 'fulfilled' && approvedData.value?.reviews) {
        allReviewsData.push(...approvedData.value.reviews);
      }
      if (rejectedData.status === 'fulfilled' && rejectedData.value?.reviews) {
        allReviewsData.push(...rejectedData.value.reviews);
      }
      if (hiddenData.status === 'fulfilled' && hiddenData.value?.reviews) {
        allReviewsData.push(...hiddenData.value.reviews);
      }

      // Нормализираме данните и премахваме дублирания
      const normalizedReviews = normalizeReviewsData(allReviewsData);
      const uniqueReviews = removeDuplicateReviews(normalizedReviews);
      
      setAllReviews(uniqueReviews);
      calculateStats(uniqueReviews);
      generateRatingDistribution(uniqueReviews);
      generateMonthlyData(uniqueReviews);

    } catch (error) {
      console.error('Error loading reviews data:', error);
      setError('Грешка при зареждане на данните за отзивите');
      // Задаваме празни данни при грешка
      setAllReviews([]);
      resetStats();
    } finally {
      setLocalLoading(false);
    }
  };

  // Нормализиране на данните от API
  const normalizeReviewsData = (reviewsArray) => {
    return reviewsArray.map(review => ({
      id: review.id,
      name: review.displayName || review.name || 'Неизвестен',
      rating: Number(review.rating) || 0,
      comment: review.comment || '',
      status: review.status || 'pending',
      createdAt: review.createdAt || new Date().toISOString(),
      isAnonymous: review.isAnonymous || false,
      helpful: Number(review.helpful) || 0
    }));
  };

  // Премахване на дублирани отзиви
  const removeDuplicateReviews = (reviews) => {
    const seen = new Set();
    return reviews.filter(review => {
      if (seen.has(review.id)) {
        return false;
      }
      seen.add(review.id);
      return true;
    });
  };

  // Изчисляване на статистики
  const calculateStats = (reviewsData) => {
    const total = reviewsData.length;
    const pending = reviewsData.filter(r => r.status === 'pending').length;
    const approved = reviewsData.filter(r => r.status === 'approved').length;
    const rejected = reviewsData.filter(r => r.status === 'rejected').length;
    const hidden = reviewsData.filter(r => r.status === 'hidden').length;
    
    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = total > 0 ? totalRating / total : 0;

    setStats({
      totalReviews: total,
      averageRating: Number(avgRating.toFixed(1)),
      pendingReviews: pending,
      approvedReviews: approved,
      rejectedReviews: rejected,
      hiddenReviews: hidden
    });
  };

  // Генериране на разпределение на оценките
  const generateRatingDistribution = (reviewsData) => {
    const distribution = [5, 4, 3, 2, 1].map(rating => {
      const count = reviewsData.filter(r => r.rating === rating).length;
      const percentage = reviewsData.length > 0 ? (count / reviewsData.length) * 100 : 0;
      
      return {
        rating,
        count,
        percentage: Number(percentage.toFixed(1))
      };
    });
    
    setRatingDistribution(distribution);
  };

  // Генериране на месечни данни
  const generateMonthlyData = (reviewsData) => {
    const monthNames = ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData = monthNames.map((month, index) => {
      const monthReviews = reviewsData.filter(review => {
        const reviewDate = new Date(review.createdAt);
        return reviewDate.getFullYear() === currentYear && reviewDate.getMonth() === index;
      });
      
      const totalRating = monthReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = monthReviews.length > 0 ? totalRating / monthReviews.length : 0;
      
      return {
        month,
        reviews: monthReviews.length,
        avgRating: Number(avgRating.toFixed(1))
      };
    });
    
    setMonthlyReviews(monthlyData);
  };

  // Нулиране на статистики
  const resetStats = () => {
    setStats({
      totalReviews: 0,
      averageRating: 0,
      pendingReviews: 0,
      approvedReviews: 0,
      rejectedReviews: 0,
      hiddenReviews: 0
    });
    setRatingDistribution([]);
    setMonthlyReviews([]);
  };

  // Промяна на статус на отзив
  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      setLocalLoading(true);
      await updateReviewStatus(reviewId, newStatus);
      
      // Обновяваме локалното състояние
      setAllReviews(prev => {
        const updated = prev.map(review => 
          review.id === reviewId 
            ? { ...review, status: newStatus }
            : review
        );
        
        // Преизчисляваме статистиките
        calculateStats(updated);
        return updated;
      });
      
    } catch (error) {
      console.error('Error updating review status:', error);
      setError('Грешка при обновяване на статуса на отзива');
    } finally {
      setLocalLoading(false);
    }
  };

  // Масова промяна на статус
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedReviews.length === 0) return;
    
    if (window.confirm(`Сигурни ли сте, че искате да промените статуса на ${selectedReviews.length} отзива към "${getStatusText(newStatus)}"?`)) {
      try {
        setLocalLoading(true);
        
        // Обновяваме всички избрани отзиви
        for (const reviewId of selectedReviews) {
          await updateReviewStatus(reviewId, newStatus);
        }
        
        // Обновяваме локалното състояние
        setAllReviews(prev => {
          const updated = prev.map(review => 
            selectedReviews.includes(review.id)
              ? { ...review, status: newStatus }
              : review
          );
          
          calculateStats(updated);
          return updated;
        });
        
        setSelectedReviews([]);
      } catch (error) {
        console.error('Error with bulk status change:', error);
        setError('Грешка при масово обновяване на статуси');
      } finally {
        setLocalLoading(false);
      }
    }
  };

  // Изтриване на отзив
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този отзив завинаги?')) {
      try {
        setLocalLoading(true);
        
        if (deleteReview) {
          await deleteReview(reviewId);
        }
        
        // Премахваме от локалното състояние
        setAllReviews(prev => {
          const updated = prev.filter(review => review.id !== reviewId);
          calculateStats(updated);
          generateRatingDistribution(updated);
          return updated;
        });
        
        // Премахваме от селектираните
        setSelectedReviews(prev => prev.filter(id => id !== reviewId));
        
      } catch (error) {
        console.error('Error deleting review:', error);
        setError('Грешка при изтриване на отзива');
      } finally {
        setLocalLoading(false);
      }
    }
  };

  // Филтриране на отзиви
  const filteredReviews = allReviews.filter(review => {
    const matchesFilter = filter === 'all' || review.status === filter;
    const matchesSearch = 
      review.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Сортиране на отзиви
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

  // Pagination
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  // Helper функции
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
    if (!dateString) return 'Неизвестна дата';
    try {
      return new Date(dateString).toLocaleString('bg-BG');
    } catch (error) {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Loading state
  if (isLoading || localLoading) {
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
          {error && (
            <div className="ratings-reviews-error" style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px',
              borderRadius: '6px',
              margin: '10px 0'
            }}>
              {error}
              <button 
                onClick={() => {
                  setError('');
                  loadAllReviewsData();
                }} 
                style={{
                  marginLeft: '10px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Опитай отново
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={loadAllReviewsData} 
          className="ratings-reviews-refresh-btn"
          disabled={localLoading}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: localLoading ? 'not-allowed' : 'pointer',
            opacity: localLoading ? 0.5 : 1
          }}
        >
          🔄 Обнови
        </button>
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
            <span className="ratings-reviews-stat-change">Всички статуси</span>
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
            <span className="ratings-reviews-stat-change ratings-reviews-stat-change--positive">
              {stats.totalReviews > 0 ? ((stats.approvedReviews / stats.totalReviews) * 100).toFixed(1) : 0}% от всички
            </span>
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
            {ratingDistribution.length > 0 ? (
              ratingDistribution.map((item, index) => (
                <div key={index} className="ratings-reviews-rating-row">
                  <div className="ratings-reviews-rating-label">
                    {renderStars(item.rating)}
                    <span>{item.rating}</span>
                  </div>
                  <div className="ratings-reviews-rating-bar">
                    <div 
                      className="ratings-reviews-rating-fill"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: '#3b82f6',
                        height: '100%',
                        borderRadius: '4px'
                      }}
                    ></div>
                  </div>
                  <div className="ratings-reviews-rating-count">
                    {item.count} ({item.percentage}%)
                  </div>
                </div>
              ))
            ) : (
              <p>Няма данни за разпределение</p>
            )}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="ratings-reviews-chart-card">
          <div className="ratings-reviews-chart-header">
            <h3>Месечни тенденции</h3>
          </div>
          <div className="ratings-reviews-chart-container">
            {monthlyReviews.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyReviews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="reviews" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px' }}>
                <p>Няма данни за месечни тенденции</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="ratings-reviews-controls">
        <div className="ratings-reviews-search-box">
          <input
            type="text"
            placeholder="Търсене по име или съдържание..."
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
            <option value="all">Всички статуси ({allReviews.length})</option>
            <option value="pending">Чакат одобрение ({stats.pendingReviews})</option>
            <option value="approved">Одобрени ({stats.approvedReviews})</option>
            <option value="rejected">Отхвърлени ({stats.rejectedReviews})</option>
            <option value="hidden">Скрити ({stats.hiddenReviews})</option>
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
              disabled={localLoading}
            >
              Одобри
            </button>
            <button 
              className="ratings-reviews-bulk-btn ratings-reviews-bulk-btn--rejected"
              onClick={() => handleBulkStatusChange('rejected')}
              disabled={localLoading}
            >
              Отхвърли
            </button>
            <button 
              className="ratings-reviews-bulk-btn ratings-reviews-bulk-btn--hidden"
              onClick={() => handleBulkStatusChange('hidden')}
              disabled={localLoading}
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
            <p>
              {searchTerm || filter !== 'all' 
                ? 'Променете филтрите или критериите за търсене'
                : 'Все още няма отзиви в системата'
              }
            </p>
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
                Избери всички на страницата
              </label>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Показват се {paginatedReviews.length} от {sortedReviews.length} отзива
              </span>
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
                      {review.isAnonymous ? '?' : (review.name?.charAt(0)?.toUpperCase() || 'N')}
                    </div>
                    <div className="ratings-reviews-reviewer-details">
                      <h4 className="ratings-reviews-reviewer-name">{review.name}</h4>
                      <p className="ratings-reviews-reviewer-id">ID: {review.id}</p>
                    </div>
                  </div>

                  <div className="ratings-reviews-review-rating">
                    {renderStars(review.rating)}
                    <span className="ratings-reviews-rating-number">{review.rating}/5</span>
                  </div>

                  <div className="ratings-reviews-review-status">
                    <span 
                      className="ratings-reviews-status-badge"
                      style={{ backgroundColor: getStatusColor(review.status), color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
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
                      disabled={localLoading}
                    >
                      <option value="pending">Чака одобрение</option>
                      <option value="approved">Одобрен</option>
                      <option value="rejected">Отхвърлен</option>
                      <option value="hidden">Скрит</option>
                    </select>
                    
                    {deleteReview && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="ratings-reviews-delete-btn"
                        disabled={localLoading}
                        title="Изтрий отзив"
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          cursor: localLoading ? 'not-allowed' : 'pointer',
                          marginLeft: '8px'
                        }}
                      >
                        🗑️
                      </button>
                    )}
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={page}
                  className={`ratings-reviews-page-number ${page === currentPage ? 'ratings-reviews-page-number--active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
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
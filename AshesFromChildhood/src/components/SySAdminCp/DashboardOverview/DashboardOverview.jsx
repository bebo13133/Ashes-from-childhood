/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import './DashboardOverview.css';
import { useAuthContext } from '../../contexts/userContext';

const DashboardOverview = () => {
  const {
    fetchDashboardData,
    fetchVisitorsStats,
    fetchPublicReviews,
    generateReport,
    notifications,
    fetchRatingsData
  } = useAuthContext();

  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [error, setError] = useState('');

  // Real data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [visitorsData, setVisitorsData] = useState(null);
  const [reviewsStats, setReviewsStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadAllDashboardData();
  }, [timeframe]);

  const loadAllDashboardData = async () => {
  setIsLoading(true);
  setError('');
  
  try {
    const [dashboardResponse, visitorsResponse, reviewsData, salesReport, overviewReport] = await Promise.all([
      fetchDashboardData(timeframe),
      fetchVisitorsStats(timeframe),
      fetchRatingsData({ status: 'approved', limit: 1000 }), 
      generateReport('sales', timeframe),
      generateReport('overview', timeframe)
    ]);

    setDashboardStats(dashboardResponse);
    setVisitorsData(visitorsResponse);

    setRevenueData({ 
      totalRevenue: overviewReport?.overview?.totalRevenue || dashboardResponse?.totalRevenue || 0,
      revenueChange: 0
    });

    // Reviews статистики - както в RatingsReviews
    if (reviewsData?.reviews && reviewsData.reviews.length > 0) {
      const reviews = reviewsData.reviews;
      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      setReviewsStats({
        totalReviews,
        averageRating: Number(averageRating.toFixed(1))
      });
    } else {
      setReviewsStats({ totalReviews: 0, averageRating: 0 });
    }

    // Месечни данни...
    let chartData = [];
    if (salesReport?.salesData && salesReport.salesData.length > 0) {
      chartData = salesReport.salesData.map(item => ({
        name: item.month,
        orders: item.orders,
        revenue: item.revenue,
        visitors: 0
      }));
    } else {
      const monthNames = ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];
      const currentMonth = monthNames[new Date().getMonth()];
      chartData = [{
        name: currentMonth,
        orders: dashboardResponse?.totalOrders || 0,
        revenue: dashboardResponse?.totalRevenue || 0,
        visitors: visitorsResponse?.totalVisitors || 0
      }];
    }
    setMonthlyData(chartData);

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    setError('Грешка при зареждане на данните: ' + error.message);
    
    setDashboardStats(null);
    setVisitorsData(null);
    setReviewsStats(null);
    setRevenueData(null);
    setMonthlyData([]);
  } finally {
    setIsLoading(false);
  }
};
  const getOrderStatusData = () => {
    if (!dashboardStats) return [];

    const data = [];
    if (dashboardStats.completedOrders > 0) {
      data.push({ name: 'Завършени', value: dashboardStats.completedOrders, color: '#10b981' });
    }
    if (dashboardStats.pendingOrders > 0) {
      data.push({ name: 'В обработка', value: dashboardStats.pendingOrders, color: '#f59e0b' });
    }
    if (dashboardStats.cancelledOrders > 0) {
      data.push({ name: 'Отказани', value: dashboardStats.cancelledOrders, color: '#ef4444' });
    }

    return data;
  };

  const getRecentActivity = () => {
    if (!notifications || notifications.length === 0) return [];

    return notifications.slice(0, 5).map(notification => {
      const now = new Date();
      const notificationTime = new Date(notification.createdAt || notification.timestamp);
      const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

      let timeText;
      if (diffInMinutes < 1) timeText = 'сега';
      else if (diffInMinutes < 60) timeText = `${diffInMinutes} мин`;
      else if (diffInMinutes < 1440) timeText = `${Math.floor(diffInMinutes / 60)} час`;
      else timeText = `${Math.floor(diffInMinutes / 1440)} ден`;

      return {
        type: notification.type,
        message: notification.message,
        time: timeText,
        status: notification.read ? 'completed' : 'pending'
      };
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'review': return '⭐';
      case 'email': return '📧';
      default: return '📊';
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'sent': return '#6366f1';
      case 'approved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTotalRevenue = () => {
    if (revenueData?.totalRevenue) {
      return revenueData.totalRevenue;
    }
    if (dashboardStats?.totalRevenue) {
      return dashboardStats.totalRevenue;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Зареждане на статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Грешка при зареждане</h3>
        <p>{error}</p>
        <button
          className="retry-btn"
          onClick={loadAllDashboardData}
        >
          Опитай отново
        </button>
      </div>
    );
  }

  const recentActivity = getRecentActivity();

  return (
    <div className="dashboard-overview">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h2 className="dashboard-title">Преглед на системата</h2>
          <p className="dashboard-subtitle">
            Последно обновление: {new Date().toLocaleString('bg-BG')}
          </p>
        </div>

        <div className="timeframe-selector">
          <label htmlFor="timeframe">Период:</label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="1d">Днес</option>
            <option value="7d">Последните 7 дни</option>
            <option value="30d">Последните 30 дни</option>
            <option value="1y">Тази година</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card orders-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="stat-title">Общо поръчки</h3>
            <p className="stat-number">
              {dashboardStats?.totalOrders ?? 0}
            </p>
            <span className="stat-change">
              {dashboardStats?.conversionRate
                ? `${dashboardStats.conversionRate.toFixed(1)}% конверсия`
                : 'Няма данни'
              }
            </span>
          </div>
        </div>

        <div className="stat-card revenue-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-title">Общи приходи</h3>
            <p className="stat-number">
              {getTotalRevenue().toLocaleString()} лв
            </p>
            <span className="stat-change">
              {revenueData?.revenueChange
                ? `${revenueData.revenueChange > 0 ? '+' : ''}${revenueData.revenueChange}%`
                : 'Няма данни'
              }
            </span>
          </div>
        </div>

        <div className="stat-card rating-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3 className="stat-title">Среден рейтинг</h3>
            <p className="stat-number">
              {reviewsStats?.averageRating ?? 0}/5
            </p>
            <span className="stat-change neutral">
              {reviewsStats?.totalReviews ?? 0} отзива
            </span>
          </div>
        </div>

        <div className="stat-card visitors-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-title">Посетители днес</h3>
            <p className="stat-number">
              {visitorsData?.todayVisitors ?? dashboardStats?.todayVisitors ?? 0}
            </p>
            <span className="stat-change">
              {visitorsData?.totalVisitors
                ? `${visitorsData.totalVisitors} общо`
                : 'Няма данни'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Monthly Overview */}
        <div className="chart-card monthly-chart">
          <div className="chart-header">
            <h3 className="chart-title">Месечни статистики</h3>
            <div className="chart-legend">
              <span className="legend-item orders">Поръчки</span>
              <span className="legend-item revenue">Приходи</span>
            </div>
          </div>
          <div className="chart-container">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stackId="1"
                    stroke="#667eea"
                    fill="#667eea"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="2"
                    stroke="#764ba2"
                    fill="#764ba2"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <p>Няма данни за показване</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="chart-card status-chart">
          <div className="chart-header">
            <h3 className="chart-title">Статус на поръчките</h3>
          </div>
          <div className="chart-container">
            {getOrderStatusData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getOrderStatusData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getOrderStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <p>Няма поръчки за показване</p>
              </div>
            )}
            <div className="pie-legend">
              {getOrderStatusData().map((item, index) => (
                <div key={index} className="pie-legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="legend-text">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="activity-header">
          <h3 className="activity-title">Последна активност</h3>
          <button
            className="refresh-btn"
            onClick={loadAllDashboardData}
          >
            🔄 Обнови
          </button>
        </div>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon" style={{ color: getActivityColor(activity.status) }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
                <div
                  className="activity-status"
                  style={{ backgroundColor: getActivityColor(activity.status) }}
                ></div>
              </div>
            ))
          ) : (
            <div className="activity-empty">
              <p>Няма скорошна активност</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
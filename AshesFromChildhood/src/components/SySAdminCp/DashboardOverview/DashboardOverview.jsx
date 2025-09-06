/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import './DashboardOverview.css';
import { useAuthContext } from '../../contexts/userContext';

const DashboardOverview = () => {
  const { fetchDashboardData, dashboardData } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  // Mock data за демонстрация - заменете с реални данни
  const [stats, setStats] = useState({
    totalOrders: 247,
    pendingOrders: 34,
    completedOrders: 189,
    cancelledOrders: 24,
    totalRevenue: 6175, // 247 * 25 лв
    averageRating: 4.7,
    totalReviews: 89,
    uniqueVisitors: 3456,
    todayVisitors: 127
  });

  const monthlyData = [
    { name: 'Яну', orders: 45, revenue: 1125, visitors: 890 },
    { name: 'Фев', orders: 52, revenue: 1300, visitors: 1120 },
    { name: 'Мар', orders: 48, revenue: 1200, visitors: 980 },
    { name: 'Апр', orders: 61, revenue: 1525, visitors: 1340 },
    { name: 'Май', orders: 55, revenue: 1375, visitors: 1180 },
    { name: 'Юни', orders: 67, revenue: 1675, visitors: 1520 },
    { name: 'Юли', orders: 71, revenue: 1775, visitors: 1680 },
    { name: 'Авг', orders: 69, revenue: 1725, visitors: 1590 },
    { name: 'Сеп', orders: 58, revenue: 1450, visitors: 1290 },
    { name: 'Окт', orders: 63, revenue: 1575, visitors: 1420 },
    { name: 'Ное', orders: 72, revenue: 1800, visitors: 1750 },
    { name: 'Дек', orders: 78, revenue: 1950, visitors: 1890 }
  ];

  const orderStatusData = [
    { name: 'Завършени', value: stats.completedOrders, color: '#10b981' },
    { name: 'В обработка', value: stats.pendingOrders, color: '#f59e0b' },
    { name: 'Отказани', value: stats.cancelledOrders, color: '#ef4444' }
  ];

  const recentActivity = [
    { type: 'order', message: 'Нова поръчка от Мария Петрова', time: '5 мин', status: 'pending' },
    { type: 'review', message: 'Нов отзив с оценка 5 звезди', time: '12 мин', status: 'pending' },
    { type: 'order', message: 'Поръчка завършена успешно', time: '23 мин', status: 'completed' },
    { type: 'email', message: 'Изпратен имейл за потвърждение', time: '45 мин', status: 'sent' },
    { type: 'review', message: 'Отзив одобрен и публикуван', time: '1 час', status: 'approved' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // В реалното приложение:
      // const data = await fetchDashboardData();
      // setStats(data);
      
      // Симулация на зареждане
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Зареждане на статистики...</p>
      </div>
    );
  }

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
            <p className="stat-number">{stats.totalOrders}</p>
            <span className="stat-change positive">+12% от миналия месец</span>
          </div>
        </div>

        <div className="stat-card revenue-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-title">Общи приходи</h3>
            <p className="stat-number">{stats.totalRevenue.toLocaleString()} лв</p>
            <span className="stat-change positive">+8% от миналия месец</span>
          </div>
        </div>

        <div className="stat-card rating-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3 className="stat-title">Среден рейтинг</h3>
            <p className="stat-number">{stats.averageRating}/5</p>
            <span className="stat-change neutral">{stats.totalReviews} отзива</span>
          </div>
        </div>

        <div className="stat-card visitors-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-title">Посетители днес</h3>
            <p className="stat-number">{stats.todayVisitors}</p>
            <span className="stat-change positive">+15% от вчера</span>
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
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="chart-card status-chart">
          <div className="chart-header">
            <h3 className="chart-title">Статус на поръчките</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {orderStatusData.map((item, index) => (
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
          <button className="view-all-btn">Виж всички</button>
        </div>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
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
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="actions-title">Бързи действия</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">📦</span>
            <span className="action-text">Нова поръчка</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📧</span>
            <span className="action-text">Изпрати имейл</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span className="action-text">Генерирай отчет</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">⚙️</span>
            <span className="action-text">Настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
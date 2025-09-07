/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import './VisitorsStats.css';
import { useAuthContext } from '../../contexts/userContext';

const VisitorsStats = () => {
  const { fetchVisitorsStats, visitorsStats } = useAuthContext();
  const [timeframe, setTimeframe] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('visitors');

  // Mock data - replace with real API data
  const [stats, setStats] = useState({
    totalVisitors: 15847,
    uniqueVisitors: 12456,
    todayVisitors: 234,
    averageSessionTime: '3:42',
    bounceRate: 45.2,
    pageViews: 28934,
    newVisitors: 8234,
    returningVisitors: 4222
  });

  const dailyData = [
    { date: '01.11', visitors: 156, unique: 124, pageViews: 287 },
    { date: '02.11', visitors: 189, unique: 145, pageViews: 342 },
    { date: '03.11', visitors: 201, unique: 167, pageViews: 398 },
    { date: '04.11', visitors: 178, unique: 134, pageViews: 321 },
    { date: '05.11', visitors: 234, unique: 189, pageViews: 445 },
    { date: '06.11', visitors: 267, unique: 201, pageViews: 512 },
    { date: '07.11', visitors: 298, unique: 234, pageViews: 567 },
    { date: '08.11', visitors: 223, unique: 178, pageViews: 423 },
    { date: '09.11', visitors: 245, unique: 195, pageViews: 467 },
    { date: '10.11', visitors: 289, unique: 221, pageViews: 534 },
    { date: '11.11', visitors: 312, unique: 245, pageViews: 587 },
    { date: '12.11', visitors: 278, unique: 211, pageViews: 498 },
    { date: '13.11', visitors: 301, unique: 234, pageViews: 567 },
    { date: '14.11', visitors: 267, unique: 203, pageViews: 489 },
    { date: '15.11', visitors: 234, unique: 187, pageViews: 445 }
  ];

  const hourlyData = [
    { hour: '00:00', visitors: 12 }, { hour: '01:00', visitors: 8 },
    { hour: '02:00', visitors: 6 }, { hour: '03:00', visitors: 4 },
    { hour: '04:00', visitors: 3 }, { hour: '05:00', visitors: 5 },
    { hour: '06:00', visitors: 15 }, { hour: '07:00', visitors: 28 },
    { hour: '08:00', visitors: 45 }, { hour: '09:00', visitors: 67 },
    { hour: '10:00', visitors: 89 }, { hour: '11:00', visitors: 102 },
    { hour: '12:00', visitors: 95 }, { hour: '13:00', visitors: 87 },
    { hour: '14:00', visitors: 92 }, { hour: '15:00', visitors: 108 },
    { hour: '16:00', visitors: 124 }, { hour: '17:00', visitors: 134 },
    { hour: '18:00', visitors: 98 }, { hour: '19:00', visitors: 76 },
    { hour: '20:00', visitors: 54 }, { hour: '21:00', visitors: 43 },
    { hour: '22:00', visitors: 32 }, { hour: '23:00', visitors: 18 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 45.2, color: '#667eea' },
    { name: 'Mobile', value: 42.8, color: '#764ba2' },
    { name: 'Tablet', value: 12.0, color: '#f093fb' }
  ];

  const trafficSources = [
    { source: 'Директен трафик', visitors: 4567, percentage: 38.2 },
    { source: 'Google търсене', visitors: 3421, percentage: 28.6 },
    { source: 'Социални мрежи', visitors: 2134, percentage: 17.8 },
    { source: 'Препратки', visitors: 1234, percentage: 10.3 },
    { source: 'Имейл', visitors: 612, percentage: 5.1 }
  ];

  const topPages = [
    { page: '/', views: 8234, percentage: 28.4 },
    { page: '/book-presentation', views: 5467, percentage: 18.9 },
    { page: '/reviews', views: 3421, percentage: 11.8 },
    { page: '/order', views: 2890, percentage: 10.0 },
    { page: '/about', views: 1876, percentage: 6.5 }
  ];

  const countries = [
    { country: 'България', visitors: 8934, flag: '🇧🇬' },
    { country: 'Германия', visitors: 1234, flag: '🇩🇪' },
    { country: 'САЩ', visitors: 987, flag: '🇺🇸' },
    { country: 'Румъния', visitors: 756, flag: '🇷🇴' },
    { country: 'Гърция', visitors: 543, flag: '🇬🇷' }
  ];

  useEffect(() => {
    loadVisitorsData();
  }, [timeframe]);

  const loadVisitorsData = async () => {
    setIsLoading(true);
    try {
      // В реалното приложение:
      // const data = await fetchVisitorsStats(timeframe);
      // setStats(data);
      
      // Симулация на зареждане
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error loading visitors data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'visitors':
        return dailyData.map(d => ({ ...d, value: d.visitors }));
      case 'unique':
        return dailyData.map(d => ({ ...d, value: d.unique }));
      case 'pageViews':
        return dailyData.map(d => ({ ...d, value: d.pageViews }));
      default:
        return dailyData.map(d => ({ ...d, value: d.visitors }));
    }
  };

  const getGrowthPercentage = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="visitors-stats-loading">
        <div className="visitors-stats-loading-spinner"></div>
        <p>Зареждане на статистики за посетители...</p>
      </div>
    );
  }

  return (
    <div className="visitors-stats-container">
      {/* Header */}
      <div className="visitors-stats-header">
        <div className="visitors-stats-header-info">
          <h2 className="visitors-stats-title">Статистики за посетители</h2>
          <p className="visitors-stats-subtitle">
            Детайлна аналитика за трафика на сайта
          </p>
        </div>
        
        <div className="visitors-stats-timeframe-controls">
          <div className="visitors-stats-timeframe-buttons">
            {['1d', '7d', '30d', '1y'].map(period => (
              <button
                key={period}
                className={`visitors-stats-timeframe-btn ${timeframe === period ? 'visitors-stats-timeframe-btn--active' : ''}`}
                onClick={() => setTimeframe(period)}
              >
                {period === '1d' ? 'Днес' : 
                 period === '7d' ? '7 дни' :
                 period === '30d' ? '30 дни' : 'Година'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="visitors-stats-overview">
        <div className="visitors-stats-card visitors-stats-card--total-visitors">
          <div className="visitors-stats-card-header">
            <h3>Общо посетители</h3>
            <span className="visitors-stats-card-icon">👥</span>
          </div>
          <div className="visitors-stats-card-value">{stats.totalVisitors.toLocaleString()}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--positive">+12.5% от миналия период</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--unique-visitors">
          <div className="visitors-stats-card-header">
            <h3>Уникални посетители</h3>
            <span className="visitors-stats-card-icon">👤</span>
          </div>
          <div className="visitors-stats-card-value">{stats.uniqueVisitors.toLocaleString()}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--positive">+8.3% от миналия период</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--page-views">
          <div className="visitors-stats-card-header">
            <h3>Прегледи на страници</h3>
            <span className="visitors-stats-card-icon">📄</span>
          </div>
          <div className="visitors-stats-card-value">{stats.pageViews.toLocaleString()}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--positive">+15.7% от миналия период</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--session-time">
          <div className="visitors-stats-card-header">
            <h3>Средно време на сесия</h3>
            <span className="visitors-stats-card-icon">⏱️</span>
          </div>
          <div className="visitors-stats-card-value">{stats.averageSessionTime}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--neutral">-2.1% от миналия период</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--bounce-rate">
          <div className="visitors-stats-card-header">
            <h3>Процент на отпадане</h3>
            <span className="visitors-stats-card-icon">📉</span>
          </div>
          <div className="visitors-stats-card-value">{stats.bounceRate}%</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--negative">+3.2% от миналия период</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--live-visitors">
          <div className="visitors-stats-card-header">
            <h3>Активни посетители</h3>
            <span className="visitors-stats-card-icon visitors-stats-card-icon--live">🔴</span>
          </div>
          <div className="visitors-stats-card-value">{stats.todayVisitors}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--neutral">В момента онлайн</div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="visitors-stats-charts-grid">
        {/* Traffic Trend */}
        <div className="visitors-stats-chart-card visitors-stats-main-chart">
          <div className="visitors-stats-chart-header">
            <h3>Тенденция на трафика</h3>
            <div className="visitors-stats-metric-selector">
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="visitors">Посетители</option>
                <option value="unique">Уникални</option>
                <option value="pageViews">Прегледи</option>
              </select>
            </div>
          </div>
          <div className="visitors-stats-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getMetricData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
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
                  dataKey="value"
                  stroke="#667eea" 
                  fill="#667eea"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Traffic */}
        <div className="visitors-stats-chart-card visitors-stats-hourly-chart">
          <div className="visitors-stats-chart-header">
            <h3>Трафик по часове</h3>
          </div>
          <div className="visitors-stats-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="visitors" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="visitors-stats-secondary">
        {/* Device Stats */}
        <div className="visitors-stats-info-card visitors-stats-device-stats">
          <div className="visitors-stats-info-card-header">
            <h3>Устройства</h3>
          </div>
          <div className="visitors-stats-device-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="visitors-stats-device-legend">
            {deviceData.map((device, index) => (
              <div key={index} className="visitors-stats-legend-item">
                <div 
                  className="visitors-stats-legend-color" 
                  style={{ backgroundColor: device.color }}
                ></div>
                <span className="visitors-stats-legend-text">{device.name}: {device.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="visitors-stats-info-card visitors-stats-traffic-sources">
          <div className="visitors-stats-info-card-header">
            <h3>Източници на трафик</h3>
          </div>
          <div className="visitors-stats-sources-list">
            {trafficSources.map((source, index) => (
              <div key={index} className="visitors-stats-source-item">
                <div className="visitors-stats-source-info">
                  <span className="visitors-stats-source-name">{source.source}</span>
                  <span className="visitors-stats-source-percentage">{source.percentage}%</span>
                </div>
                <div className="visitors-stats-source-bar">
                  <div 
                    className="visitors-stats-source-fill"
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
                <span className="visitors-stats-source-visitors">{source.visitors.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="visitors-stats-info-card visitors-stats-top-pages">
          <div className="visitors-stats-info-card-header">
            <h3>Най-посещавани страници</h3>
          </div>
          <div className="visitors-stats-pages-list">
            {topPages.map((page, index) => (
              <div key={index} className="visitors-stats-page-item">
                <div className="visitors-stats-page-rank">{index + 1}</div>
                <div className="visitors-stats-page-info">
                  <span className="visitors-stats-page-url">{page.page}</span>
                  <div className="visitors-stats-page-bar">
                    <div 
                      className="visitors-stats-page-fill"
                      style={{ width: `${page.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="visitors-stats-page-stats">
                  <span className="visitors-stats-page-views">{page.views.toLocaleString()}</span>
                  <span className="visitors-stats-page-percentage">{page.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="visitors-stats-info-card visitors-stats-countries">
          <div className="visitors-stats-info-card-header">
            <h3>Държави</h3>
          </div>
          <div className="visitors-stats-countries-list">
            {countries.map((country, index) => (
              <div key={index} className="visitors-stats-country-item">
                <span className="visitors-stats-country-flag">{country.flag}</span>
                <div className="visitors-stats-country-info">
                  <span className="visitors-stats-country-name">{country.country}</span>
                  <span className="visitors-stats-country-visitors">{country.visitors.toLocaleString()} посетители</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="visitors-stats-export-section">
        <h3>Експорт на данни</h3>
        <div className="visitors-stats-export-buttons">
          <button className="visitors-stats-export-btn visitors-stats-export-btn--pdf">
            📄 PDF отчет
          </button>
          <button className="visitors-stats-export-btn visitors-stats-export-btn--excel">
            📊 Excel файл
          </button>
          <button className="visitors-stats-export-btn visitors-stats-export-btn--csv">
            📋 CSV данни
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorsStats;
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import './VisitorsStats.css';
import { useAuthContext } from '../../contexts/userContext';

const VisitorsStats = () => {
  const { fetchVisitorsStats } = useAuthContext();
  const [timeframe, setTimeframe] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('visitors');
  const [error, setError] = useState('');

  // Real API data state
  const [stats, setStats] = useState({
    totalVisitors: 0,
    uniqueVisitors: 0,
    todayVisitors: 0,
    averageSessionTime: '0:00',
    bounceRate: 0,
    pageViews: 0,
    newVisitors: 0,
    returningVisitors: 0
  });

  // Празни масиви за данни които няма от API
  const [dailyData, setDailyData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    loadVisitorsData();
  }, [timeframe]);

  const loadVisitorsData = async () => {
  setIsLoading(true);
  setError('');
  
  try {
    const response = await fetchVisitorsStats(timeframe);
    
    if (response) {
      // Основни статистики
      setStats({
        totalVisitors: response.totalVisitors || 0,
        uniqueVisitors: response.uniqueVisitors || 0,
        todayVisitors: response.todayVisitors || 0,
        averageSessionTime: response.averageSessionTime || '0:00',
        bounceRate: response.bounceRate || 0,
        pageViews: response.pageViews || 0,
        newVisitors: response.newVisitors || 0,
        returningVisitors: response.returningVisitors || 0
      });

      // РЕАЛНИ данни от API-то
      setDailyData(response.dailyData || []);
      setHourlyData(response.hourlyData || []);
      setDeviceData(response.deviceData || []);
      setTrafficSources(response.trafficSources || []);
      setTopPages(response.topPages || []);
      
      // За countries добавяме флагчета
      const countriesWithFlags = (response.countries || []).map(country => ({
        ...country,
        flag: getCountryFlag(country.country)
      }));
      setCountries(countriesWithFlags);
      
    } else {
      // Празни данни ако API не върне нищо
      setStats({
        totalVisitors: 0,
        uniqueVisitors: 0,
        todayVisitors: 0,
        averageSessionTime: '0:00',
        bounceRate: 0,
        pageViews: 0,
        newVisitors: 0,
        returningVisitors: 0
      });
      setDailyData([]);
      setHourlyData([]);
      setDeviceData([]);
      setTrafficSources([]);
      setTopPages([]);
      setCountries([]);
    }
    
  } catch (error) {
    console.error('Error loading visitors data:', error);
    setError('Грешка при зареждане на данните за посетители');
    
    // Reset при грешка
    setStats({
      totalVisitors: 0,
      uniqueVisitors: 0,
      todayVisitors: 0,
      averageSessionTime: '0:00',
      bounceRate: 0,
      pageViews: 0,
      newVisitors: 0,
      returningVisitors: 0
    });
    setDailyData([]);
    setHourlyData([]);
    setDeviceData([]);
    setTrafficSources([]);
    setTopPages([]);
    setCountries([]);
  } finally {
    setIsLoading(false);
  }
};

// Функция за флагчета на държави
const getCountryFlag = (countryName) => {
  const flagMap = {
    'Bulgaria': '🇧🇬',
    'Germany': '🇩🇪',
    'USA': '🇺🇸',
    'United States': '🇺🇸',
    'Romania': '🇷🇴',
    'Greece': '🇬🇷',
    'Turkey': '🇹🇷',
    'Serbia': '🇷🇸',
    'North Macedonia': '🇲🇰',
    'United Kingdom': '🇬🇧',
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Netherlands': '🇳🇱',
    'Poland': '🇵🇱',
    'Austria': '🇦🇹',
    'Switzerland': '🇨🇭',
    'Belgium': '🇧🇪',
    'Czech Republic': '🇨🇿',
    'Hungary': '🇭🇺',
    'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮',
    'Croatia': '🇭🇷',
    'Bosnia and Herzegovina': '🇧🇦',
    'Montenegro': '🇲🇪',
    'Albania': '🇦🇱'
  };
  
  return flagMap[countryName] || '🏳️';
};

  const getMetricData = () => {
    if (dailyData.length === 0) return [];
    
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
          {error && (
            <div style={{
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
                  loadVisitorsData();
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
          <button 
            onClick={loadVisitorsData}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Обнови
          </button>
        </div>
      </div>

      {/* Overview Stats - САМО реални данни от API */}
      <div className="visitors-stats-overview">
        <div className="visitors-stats-card visitors-stats-card--total-visitors">
          <div className="visitors-stats-card-header">
            <h3>Общо посетители</h3>
            <span className="visitors-stats-card-icon">👥</span>
          </div>
          <div className="visitors-stats-card-value">{stats.totalVisitors.toLocaleString()}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--neutral">За избрания период</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--unique-visitors">
          <div className="visitors-stats-card-header">
            <h3>Уникални посетители</h3>
            <span className="visitors-stats-card-icon">👤</span>
          </div>
          <div className="visitors-stats-card-value">{stats.uniqueVisitors.toLocaleString()}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--neutral">За избрания период</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--page-views">
          <div className="visitors-stats-card-header">
            <h3>Прегледи на страници</h3>
            <span className="visitors-stats-card-icon">📄</span>
          </div>
          <div className="visitors-stats-card-value">{stats.pageViews.toLocaleString()}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--neutral">За избрания период</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--session-time">
          <div className="visitors-stats-card-header">
            <h3>Средно време на сесия</h3>
            <span className="visitors-stats-card-icon">⏱️</span>
          </div>
          <div className="visitors-stats-card-value">{stats.averageSessionTime}</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--neutral">Средна продължителност</div>
        </div>

        <div className="visitors-stats-card visitors-stats-card--bounce-rate">
          <div className="visitors-stats-card-header">
            <h3>Процент на отпадане</h3>
            <span className="visitors-stats-card-icon">📉</span>
          </div>
          <div className="visitors-stats-card-value">{(stats.bounceRate * 100).toFixed(1)}%</div>
          <div className="visitors-stats-card-change visitors-stats-card-change--neutral">От всички посещения</div>
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

      {/* Main Charts - САМО ако има данни */}
      {(dailyData.length > 0 || hourlyData.length > 0) && (
        <div className="visitors-stats-charts-grid">
          {/* Traffic Trend */}
          {dailyData.length > 0 && (
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
          )}

          {/* Hourly Traffic */}
          {hourlyData.length > 0 && (
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
          )}
        </div>
      )}

      {/* Secondary Stats - САМО ако има данни */}
      {(deviceData.length > 0 || trafficSources.length > 0 || topPages.length > 0 || countries.length > 0) && (
        <div className="visitors-stats-secondary">
          {/* Device Stats */}
          {deviceData.length > 0 && (
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
          )}

          {/* Traffic Sources */}
          {trafficSources.length > 0 && (
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
          )}

          {/* Top Pages */}
          {topPages.length > 0 && (
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
          )}

          {/* Geographic Data */}
          {countries.length > 0 && (
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
          )}
        </div>
      )}

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